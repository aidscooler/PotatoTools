import {
    AutoTokenizer,
    AutoProcessor,
    WhisperForConditionalGeneration,
    TextStreamer,
    full,
  } from "@huggingface/transformers";
  
  const MAX_NEW_TOKENS = 64;
  
  /**
   * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
   */
  class AutomaticSpeechRecognitionPipeline {
    static availableModels = [
      'onnx-community/whisper-tiny',
      'onnx-community/whisper-base', 
      'onnx-community/whisper-small',
      'onnx-community/whisper-medium',
      'onnx-community/whisper-large'
    ];    
    
    static tokenizer = null;
    static processor = null;
    static model = null;
    static currentModelId = null;
  
    static async getInstance(modelId = "onnx-community/whisper-base",progress_callback = null) {
      // Reset if a different model is selected
      if (this.currentModelId !== modelId) {
        this.tokenizer = null;
        this.processor = null;
        this.model = null;
        this.currentModelId = modelId;
      }      
      // Validate model selection
      if (!this.availableModels.includes(modelId)) {
        throw new Error(`Unsupported model: ${modelId}. Choose from: ${this.availableModels.join(', ')}`);
      }
      this.tokenizer ??= AutoTokenizer.from_pretrained(modelId, {
        progress_callback,
      });
      this.processor ??= AutoProcessor.from_pretrained(modelId, {
        progress_callback,
      });
  
      this.model ??= WhisperForConditionalGeneration.from_pretrained(
        modelId,
        {
          dtype: {
            encoder_model: "fp32", // 'fp16' works too
            decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
          },
          device: "webgpu",
          progress_callback,
        },
      );
  
      return Promise.all([this.tokenizer, this.processor, this.model]);
    }
    /**
     * Get list of available models
     */
    static getAvailableModels() {
      return this.availableModels;
    }    
  }
  
  let processing = false;

  async function generate({ audio, language, modelId = "onnx-community/whisper-base" }) {
    if (processing) return;
    processing = true;
  
    // Tell the main thread we are starting
    self.postMessage({ status: "start" });
  
    try{
      // Retrieve the text-generation pipeline.
      const [tokenizer, processor, model] =
        await AutomaticSpeechRecognitionPipeline.getInstance();
      let startTime;
      let numTokens = 0;
      let tps;        
      const token_callback_function = () => {
        startTime ??= performance.now();
    
        if (numTokens++ > 0) {
          tps = (numTokens / (performance.now() - startTime)) * 1000;
        }
      };
      const callback_function = (output) => {
        self.postMessage({
          status: "update",
          output,
          tps,
          numTokens,
        });
      };    
      
      const streamer = new TextStreamer(tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function,
        token_callback_function,
      });      

      const inputs = await processor(audio);

      const outputs = await model.generate({
        ...inputs,
        max_new_tokens: MAX_NEW_TOKENS,
        language,
        streamer,
      });      

      const decoded = tokenizer.batch_decode(outputs, {
        skip_special_tokens: true,
      });

      // Send the output back to the main thread
      self.postMessage({
        status: "complete",
        output: decoded,
      });      
    } catch(error) {
      self.postMessage({
        status: "error",
        error: error.message,
      });      
    } finally {
      processing = false;
    }
  }
  
  async function load(modelId = "onnx-community/whisper-base") {
    self.postMessage({
      status: "loading",
      data: `Loading model:${modelId}`,
    });

    try{
      // Load the pipeline and save it for future use.
      const [tokenizer, processor, model] =
        await AutomaticSpeechRecognitionPipeline.getInstance((x) => {
          // We also add a progress callback to the pipeline so that we can
          // track model loading.
          self.postMessage(x);
        });
    
      self.postMessage({
        status: "loading",
        data: "Compiling shaders and warming up model...",
      });
      // Run model with dummy input to compile shaders
      await model.generate({
        input_features: full([1, 80, 3000], 0.0),
        max_new_tokens: 1,
      });      
      self.postMessage({ status: "ready" });
    } catch (error) {
      self.postMessage({
        status: "error",
        error: error.message,
      });
    }
  }
  
  // Listen for messages from the main thread
  self.addEventListener("message", async (e) => {
    const { type, data } = e.data;
  
    switch (type) {
      case "load":
        load(data?.modelId);
        break;
  
      case "generate":
        generate(data);
        break;
        
      case "available_models":
        self.postMessage({
          status: "models_list",
          models: AutomaticSpeechRecognitionPipeline.getAvailableModels()
        });
        break;        
    }
  });