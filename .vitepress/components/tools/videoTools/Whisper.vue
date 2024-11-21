<template>
  <el-card class="whisper-transcription-card">
    <template #header>
      <div class="card-header">
        <h2>语音转文字</h2>
        <div class="model-selection">
          <el-select 
            v-model="selectedModel" 
            placeholder="选择模型"
            @change="loadModel"
          >
            <el-option 
              v-for="(value, key) in WHISPER_MODELS" 
              :key="key" 
              :label="key" 
              :value="key"
            />
          </el-select>
          <el-select 
            v-model="selectedLanguage" 
            placeholder="选择语言"
          >
            <el-option 
              v-for="(lang, code) in SUPPORTED_LANGUAGES" 
              :key="code" 
              :label="lang" 
              :value="code"
            />
          </el-select>
        </div>
      </div>
    </template>

    <div class="audio-input-methods">
      <el-tabs v-model="activeInputMethod">
        <el-tab-pane label="录音" name="recording">
          <div class="recording-controls">
            <el-button 
              type="primary" 
              @click="startRecording" 
              :disabled="transcriptionStatus !== 'ready'"
            >
              开始录音
            </el-button>
            <el-button 
              type="danger" 
              @click="stopRecording"
              :disabled="transcriptionStatus !== 'ready'"
            >
              停止录音
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="文件上传" name="fileUpload">
          <el-upload
            drag
            :auto-upload="false"
            :on-change="handleFileUpload"
            accept=".mp3,.wav,.webm,.ogg"
          >
            <el-icon><upload-filled /></el-icon>
            <div>拖拽文件或点击上传</div>
          </el-upload>
        </el-tab-pane>

        <el-tab-pane label="URL输入" name="urlInput">
          <el-input 
            v-model="audioUrl" 
            placeholder="输入音频文件URL"
            @keyup.enter="processAudioFromUrl"
          >
            <template #append>
              <el-button @click="processAudioFromUrl">转录</el-button>
            </template>
          </el-input>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="transcription-result" v-if="transcribedText">
      <h3>转录结果：</h3>
      <p>{{ transcribedText }}</p>
    </div>

    <div v-if="modelLoadingProgress.isLoading" class="loading-progress">
      {{ modelLoadingProgress.message }}
    </div>
  </el-card>
</template>
  
<script setup lang="ts">

const WHISPER_MODELS = {
  'tiny': 'onnx-community/whisper-tiny',
  'base': 'onnx-community/whisper-base', 
  'small': 'onnx-community/whisper-small',
  'medium': 'onnx-community/whisper-medium',
  'large': 'onnx-community/whisper-large'
}

const SUPPORTED_LANGUAGES = {
  'en': '英语',
  'zh': '中文',
  'es': '西班牙语',
  'fr': '法语',
  'de': '德语',
  'ja': '日语',
  'ru': '俄语',
  'ar': '阿拉伯语'
}

const worker = ref(null)
const selectedModel = ref('base')
const transcriptionStatus = ref('idle')
const transcribedText = ref('')
const audioChunks = ref([])
const mediaRecorder = ref(null)
const audioStream = ref(null)
const activeInputMethod = ref('recording')
const audioUrl = ref('')

const modelLoadingProgress = reactive({
  isLoading: false,
  progress: 0,
  message: ''
})

onMounted(() => {
  worker.value = new Worker(new URL('../../../library/whisperWorker.ts', import.meta.url), {
    type: 'module'
  })
  worker.value.addEventListener('message', handleWorkerMessage)
  initMediaRecorder()
})

onUnmounted(() => {
  worker.value?.removeEventListener('message', handleWorkerMessage)
  mediaRecorder.value?.stop()
})

function initMediaRecorder() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioStream.value = stream
      mediaRecorder.value = new MediaRecorder(stream)
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }
    })
    .catch(error => {
      ElMessage.error('无法获取音频设备：' + error)
    })
}

function handleWorkerMessage(event) {
  const { status, data, error } = event.data
  
  switch(status) {
    case 'loading':
      modelLoadingProgress.isLoading = true
      modelLoadingProgress.message = data
      break
    case 'ready':
      modelLoadingProgress.isLoading = false
      transcriptionStatus.value = 'ready'
      break
    case 'start':
      transcriptionStatus.value = 'processing'
      break
    case 'complete':
      transcriptionStatus.value = 'completed'
      transcribedText.value = data
      break
    case 'models_list':
      console.log('Available models:', data.models)
      break      
    case 'error':
      ElMessage.error(`模型处理错误: ${error}`)
      transcriptionStatus.value = 'ready'
      modelLoadingProgress.isLoading = false
      break      
  }
}

function loadModel() {
  worker.value.postMessage({
    type: 'load', 
    modelId: WHISPER_MODELS[selectedModel.value]
  })
}

function startRecording() {
  audioChunks.value = []
  mediaRecorder.value.start()
}

function stopRecording() {
  mediaRecorder.value.stop()
  
  setTimeout(() => {
    const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
    processAudioBlob(audioBlob)
  }, 500)
}

function handleFileUpload(file) {
  processAudioBlob(file.raw)
}

async function processAudioFromUrl() {
  try {
    const response = await fetch(audioUrl.value)
    const audioBlob = await response.blob()
    processAudioBlob(audioBlob)
  } catch (error) {
    ElMessage.error('无法获取音频文件：' + error.message)
  }
}

function processAudioBlob(audioBlob) {
  const fileReader = new FileReader()
    
  fileReader.onloadend = async () => {
    const audioBuffer = fileReader.result
    worker.value.postMessage({
      type: 'generate',
      data: { 
        audio: audioBuffer,
        language: selectedLanguage.value,
        modelId: WHISPER_MODELS[selectedModel.value]
      }
    })
  }
    
  fileReader.readAsArrayBuffer(audioBlob)
}
</script>