<template>
    <div class="flex flex-col h-screen mx-auto justify-end text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">
      <div class="h-full overflow-auto scrollbar-thin flex justify-center items-center flex-col relative">
        <div class="flex flex-col items-center mb-1 max-w-[400px] text-center">
          <img src="logo.png" width="50%" height="auto" class="block" />
          <h1 class="text-4xl font-bold mb-1">Whisper WebGPU</h1>
          <h2 class="text-xl font-semibold">
            Real-time in-browser speech recognition
          </h2>
        </div>
  
        <div class="flex flex-col items-center px-4">
          <div class="w-[500px] p-2">
            <AudioVisualizer class="w-full rounded-lg" :stream="stream" />
            <div v-if="status === 'ready'" class="relative">
              <p class="w-full h-[80px] overflow-y-auto overflow-wrap-anywhere border rounded-lg p-2">
                {{ text }}
              </p>
              <span v-if="tps" class="absolute bottom-0 right-0 px-1">
                {{ tps.toFixed(2) }} tok/s
              </span>
            </div>
          </div>
          <LanguageSelector
            v-if="status === 'ready'"
            :language="language"
            @update-language="handleLanguageChange"
          />
          <button
            v-if="status === 'ready'"
            class="border rounded-lg px-2 absolute right-2"
            @click="reset"
          >
            Reset
          </button>
          <div v-if="status === 'loading'" class="w-full max-w-[500px] text-left mx-auto p-4">
            <p class="text-center">{{ loadingMessage }}</p>
            <Progress
              v-for="(item, index) in progressItems"
              :key="index"
              :text="item.file"
              :percentage="item.progress"
              :total="item.total"
            />
          </div>
          <button
            v-if="status === null"
            class="border px-4 py-2 rounded-lg bg-blue-400 text-white hover:bg-blue-500 disabled:bg-blue-100 disabled:cursor-not-allowed select-none"
            @click="loadModel"
            :disabled="status !== null"
          >
            Load model
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import AudioVisualizer from './Whisper-components/AudioVisualizer.vue';
  import Progress from './Whisper-components/Progress.vue';
  import LanguageSelector from './Whisper-components/LanguageSelector.vue';
  
  const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
  
  const WHISPER_SAMPLING_RATE = 16000;
  const MAX_AUDIO_LENGTH = 30; // seconds
  const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;
  
  const worker = ref(null);
  const recorderRef = ref(null);
  const status = ref(null);
  const loadingMessage = ref("");
  const progressItems = ref([]);
  const text = ref("");
  const tps = ref(null);
  const language = ref("en");
  const recording = ref(false);
  const isProcessing = ref(false);
  const chunks = ref([]);
  const stream = ref(null);
  const audioContextRef = ref(null);
  
  onMounted(() => {
    worker.value = new Worker(new URL('../../../library/whisperWorker.ts', import.meta.url), {
      type: 'module',
    });
  
    worker.value.addEventListener('message', onMessageReceived);
  
    navigator.mediaDevices.getUserMedia({ audio: true }).then(setupMediaRecorder).catch(console.error);
  });
  
  const setupMediaRecorder = (stream) => {
    stream.value = stream;
  
    recorderRef.value = new MediaRecorder(stream);
    audioContextRef.value = new AudioContext({
      sampleRate: WHISPER_SAMPLING_RATE,
    });
  
    recorderRef.value.onstart = () => {
      recording.value = true;
      chunks.value = [];
    };
  
    recorderRef.value.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.value.push(e.data);
      } else {
        setTimeout(() => {
          recorderRef.value.requestData();
        }, 25);
      }
    };
  
    recorderRef.value.onstop = () => {
      recording.value = false;
    };
  };
  
const onMessageReceived = (e) => {
  switch (e.data.status) {
    case 'loading':
      status.value = 'loading';
      loadingMessage.value = e.data.data;
      break;
    case 'initiate':
      progressItems.value.push(e.data);
      break;
    case 'progress':
      progressItems.value = progressItems.value.map((item) => {
        if (item.file === e.data.file) {
          return { ...item, ...e.data };
        }
        return item;
      });
      break;
    case 'done':
      progressItems.value = progressItems.value.filter((item) => item.file !== e.data.file);
      break;
    case 'ready':
      status.value = 'ready';
      recorderRef.value.start();
      break;
    case 'start':
      isProcessing.value = true;
      recorderRef.value.requestData();
      break;
    case 'update':
      tps.value = e.data.tps;
      break;
    case 'complete':
      isProcessing.value = false;
      text.value = e.data.output;
      break;
  }
};
  
  const loadModel = () => {
    worker.value.postMessage({ type: 'load' });
    status.value = 'loading';
  };
  
  const handleLanguageChange = (newLanguage) => {
    recorderRef.value.stop();
    language.value = newLanguage;
    recorderRef.value.start();
  };
  
  const reset = () => {
    recorderRef.value.stop();
    recorderRef.value.start();
  };
  
  // Watchers and computed properties
  // Similar to the useEffect hooks in the React example
  const isModelLoaded = computed(() => status.value === 'ready');
  watch(chunks, (newChunks) => {
  if (recording.value && !isProcessing.value && isModelLoaded.value && newChunks.length > 0) {
    const blob = new Blob(newChunks, { type: recorderRef.value.mimeType });
    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result;
      const decoded = await audioContextRef.value.decodeAudioData(arrayBuffer);
      let audio = decoded.getChannelData(0);
      if (audio.length > MAX_SAMPLES) {
        audio = audio.slice(-MAX_SAMPLES);
      }
      worker.value.postMessage({
        type: 'generate',
        data: { audio, language: language.value },
      });
    };
    fileReader.readAsArrayBuffer(blob);
  }
});

watch(status, (newStatus) => {
  if (newStatus === 'ready' && recorderRef.value) {
    recorderRef.value.start();
  }
});
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  