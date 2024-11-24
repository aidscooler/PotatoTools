<template>
  <div v-if="IS_WEBGPU_AVAILABLE" class="app-container">
    <el-card class="main-card" :body-style="{ padding: '20px' }">
      <div class="header">
        <h1>Whisper WebGPU</h1>
        <h2>Real-time in-browser speech recognition</h2>
      </div>

      <div class="content">
        <template v-if="status === null">
          <p class="description">
            You are about to load
            <el-link
              href="https://huggingface.co/onnx-community/whisper-base"
              type="primary"
              target="_blank"
            >
              whisper-base
            </el-link>
            , a 73 million parameter speech recognition model that is optimized
            for inference on the web. Once downloaded, the model (~200 MB) will be
            cached and reused when you revisit the page.
            
            <el-divider />
            
            Everything runs directly in your browser using
            <el-link
              href="https://huggingface.co/docs/transformers.js"
              type="primary"
              target="_blank"
            >
              🤗 Transformers.js
            </el-link>
            and ONNX Runtime Web, meaning no data is sent to a server. You can even
            disconnect from the internet after the model has loaded!
          </p>

          <el-button
            type="primary"
            :disabled="status !== null"
            @click="loadModel"
            size="large"
          >
            Load model
          </el-button>
        </template>

        <el-card v-if="status" class="visualizer-card" shadow="never">
          <AudioVisualizer :stream="stream" />
          <div v-if="status === 'ready'" class="text-output">
            <div class="output-box">
              {{ text }}
            </div>
            <span v-if="tps" class="tps-info">
              {{ tps.toFixed(2) }} tok/s
            </span>
          </div>
        </el-card>

        <div v-if="status === 'ready'" class="controls">
          <LanguageSelector
            :language="language"
            @update:language="handleLanguageChange"
          />
          <el-button @click="resetRecording" size="default">
            Reset
          </el-button>
        </div>

        <div v-if="status === 'loading'" class="loading-container">
          <el-card shadow="never" class="loading-card">
            <template #header>
              <div class="loading-header">
                {{ loadingMessage }}
              </div>
            </template>
            <Progress
              v-for="(item, index) in progressItems"
              :key="index"
              :text="item.file"
              :percentage="item.progress"
              :total="item.total"
            />
          </el-card>
        </div>
      </div>
    </el-card>
  </div>

  <div v-else class="webgpu-error">
    <el-card class="error-card">
      <el-result
        icon="error"
        title="WebGPU is not supported"
        sub-title="This browser does not support WebGPU features"
      />
    </el-card>
  </div>
</template>
  
<script setup lang="ts">
import AudioVisualizer from './Whisper-components/AudioVisualizer.vue'
import Progress from './Whisper-components/Progress.vue'
import LanguageSelector from './Whisper-components/LanguageSelector.vue'

const WHISPER_SAMPLING_RATE = 16000
const MAX_AUDIO_LENGTH = 30 // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH
const IS_WEBGPU_AVAILABLE = !!navigator.gpu

// 状态变量
const worker = ref(null)
const recorderRef = ref(null)
const audioContextRef = ref(null)

const status = ref(null)
const loadingMessage = ref('')
const progressItems = ref([])

const text = ref('')
const tps = ref(null)
const language = ref('en')

const recording = ref(false)
const isProcessing = ref(false)
const chunks = ref([])
const stream = ref(null)

// 工作线程处理函数
const handleWorkerMessage = (e) => {
  switch (e.data.status) {
    case 'loading':
      status.value = 'loading'
      loadingMessage.value = e.data.data
      break

    case 'initiate':
      progressItems.value = [...progressItems.value, e.data]
      break

    case 'progress':
      progressItems.value = progressItems.value.map((item) => {
        if (item.file === e.data.file) {
          return { ...item, ...e.data }
        }
        return item
      })
      break

    case 'done':
      progressItems.value = progressItems.value.filter(
        (item) => item.file !== e.data.file
      )
      break

    case 'ready':
      status.value = 'ready'
      recorderRef.value?.start()
      break

    case 'start':
      isProcessing.value = true
      recorderRef.value?.requestData()
      break

    case 'update':
      tps.value = e.data.tps
      break

    case 'complete':
      isProcessing.value = false
      text.value = e.data.output
      break
  }
}

// 初始化录音设备
const initializeRecorder = async () => {
  if (recorderRef.value) return

  try {
    if (navigator.mediaDevices.getUserMedia) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.value = mediaStream

      recorderRef.value = new MediaRecorder(mediaStream)
      audioContextRef.value = new AudioContext({
        sampleRate: WHISPER_SAMPLING_RATE,
      })

      recorderRef.value.onstart = () => {
        recording.value = true
        chunks.value = []
      }

      recorderRef.value.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.value = [...chunks.value, e.data]
        } else {
          setTimeout(() => {
            recorderRef.value?.requestData()
          }, 25)
        }
      }

      recorderRef.value.onstop = () => {
        recording.value = false
      }
    }
  } catch (err) {
    console.error('The following error occurred: ', err)
  }
}

// 处理音频数据
const processAudioData = async () => {
  if (!recorderRef.value || !recording.value || isProcessing.value || status.value !== 'ready') return

  if (chunks.value.length > 0) {
    const blob = new Blob(chunks.value, { type: recorderRef.value.mimeType })
    const fileReader = new FileReader()

    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result
      const decoded = await audioContextRef.value.decodeAudioData(arrayBuffer)
      let audio = decoded.getChannelData(0)
      if (audio.length > MAX_SAMPLES) {
        audio = audio.slice(-MAX_SAMPLES)
      }

      worker.value.postMessage({
        type: 'generate',
        data: { audio, language: language.value },
      })
    }
    fileReader.readAsArrayBuffer(blob)
  } else {
    recorderRef.value?.requestData()
  }
}

// 加载模型
const loadModel = () => {
  worker.value.postMessage({ type: 'load' })
  status.value = 'loading'
}

// 重置录音
const resetRecording = () => {
  recorderRef.value?.stop()
  recorderRef.value?.start()
}

// 更改语言
const handleLanguageChange = (newLang) => {
  recorderRef.value?.stop()
  language.value = newLang
  recorderRef.value?.start()
}

// 监听chunks变化以处理音频数据
watch([chunks], () => {
  processAudioData()
})

onMounted(() => {
  // 初始化 Web Worker
  if (!worker.value) {
    worker.value = new Worker(new URL('../../../library/whisperWorker.ts', import.meta.url), {
      type: 'module',
    })
    worker.value.addEventListener('message', handleWorkerMessage)
  }
  
  //initializeRecorder()
})

onUnmounted(() => {
  worker.value?.removeEventListener('message', handleWorkerMessage)
  recorderRef.value?.stop()
  stream.value?.getTracks().forEach(track => track.stop())
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: var(--el-bg-color-page);
}

.main-card {
  max-width: 800px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  width: 50%;
  max-width: 200px;
  height: auto;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 16px 0;
}

h2 {
  font-size: 20px;
  color: var(--el-text-color-regular);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.description {
  max-width: 480px;
  text-align: center;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin: 20px 0;
}

.visualizer-card {
  width: 100%;
  max-width: 500px;
}

.text-output {
  position: relative;
  margin-top: 16px;
}

.output-box {
  min-height: 80px;
  max-height: 160px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.tps-info {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color);
  border-radius: var(--el-border-radius-small);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin-top: 16px;
}

.loading-container {
  width: 100%;
  max-width: 500px;
}

.loading-card {
  background-color: var(--el-bg-color-page);
}

.loading-header {
  text-align: center;
  color: var(--el-text-color-primary);
}

.webgpu-error {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color);
}

.error-card {
  width: 100%;
  max-width: 600px;
  margin: 20px;
}
</style>