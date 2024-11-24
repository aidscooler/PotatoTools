<template>
    <div class="audio-manager">
      <!-- Main Controls -->
      <el-card class="control-panel">
        <div class="control-buttons">
          <!-- URL Input -->
          <el-button type="primary" @click="showUrlModal = true">
            <el-icon><i-ep-link/></el-icon>
            <span>From URL</span>
          </el-button>
          
          <el-divider direction="vertical" />
          
          <!-- File Input -->
          <el-button type="primary" @click="$refs.fileInput.click()">
            <el-icon><i-ep-folder /></el-icon>
            <span>From File</span>
          </el-button>
          <input
            ref="fileInput"
            type="file"
            accept="audio/*"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <!-- Recording Input (if supported) -->
          <template v-if="navigator.mediaDevices">
            <el-divider direction="vertical" />
            <el-button type="primary" @click="showRecordModal = true">
              <el-icon><i-ep-microphone /></el-icon>
              <span>Record</span>
            </el-button>
          </template>
        </div>
        
        <!-- Progress Bar -->
        <el-progress 
          :percentage="isAudioLoading ? progress * 100 : audioData ? 100 : 0"
          :show-text="false"
        />
      </el-card>
  
      <!-- Audio Player & Controls -->
      <template v-if="audioData">
        <AudioPlayer
          :audio-url="audioData.url"
          :mime-type="audioData.mimeType"
        />
  
        <div class="transcribe-controls">
          <TranscribeButton
            @click="transcriber.start(audioData.buffer)"
            :is-model-loading="transcriber.isModelLoading"
            :is-transcribing="transcriber.isBusy"
          />
  
          <el-button
            class="settings-button"
            type="info"
            plain
            @click="showSettingsModal = true"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
  
        <!-- Progress Items -->
        <div v-if="transcriber.progressItems.length" class="progress-items">
          <p>Loading model files... (only run once)</p>
          <Progress
            v-for="data in transcriber.progressItems"
            :key="data.file"
            :text="data.file"
            :percentage="data.progress"
          />
        </div>
      </template>
  
      <!-- Modals -->
      <Modal
        v-model="showUrlModal"
        title="From URL"
        @submit="url => {
          audioDownloadUrl = url
          transcriber.onInputChange()
        }"
      >
        <template #default>
          <p>Enter the URL of the audio file you want to load.</p>
          <UrlInput v-model="url" />
        </template>
      </Modal>
  
      <Modal
        v-model="showRecordModal"
        title="From Recording"
        :submit-enabled="!!audioBlob"
        @submit="() => {
          if (audioBlob) {
            setAudioFromRecording(audioBlob)
            transcriber.onInputChange()
          }
        }"
      >
        <template #default>
          <p>Record audio using your microphone</p>
          <AudioRecorder @recording-complete="blob => audioBlob = blob" />
        </template>
      </Modal>
  
      <Modal
        v-model="showSettingsModal"
        title="Settings"
      >
        <template #default>
          <el-form>
            <!-- Model Selection -->
            <el-form-item label="Select the model to use">
              <el-select
                v-model="transcriber.model"
                class="w-full"
              >
                <el-option
                  v-for="(size, model) in models"
                  :key="model"
                  :label="`${model}${transcriber.multilingual || model.startsWith('distil-whisper/') ? '' : '.en'} (${size[transcriber.quantized ? 0 : 1]}MB)`"
                  :value="model"
                  v-if="transcriber.quantized || size.length === 2"
                />
              </el-select>
            </el-form-item>
  
            <!-- Checkboxes -->
            <el-form-item>
              <div class="checkbox-group">
                <el-checkbox
                  v-model="transcriber.multilingual"
                  label="Multilingual"
                />
                <el-checkbox
                  v-model="transcriber.quantized"
                  label="Quantized"
                />
              </div>
            </el-form-item>
  
            <!-- Multilingual Options -->
            <template v-if="transcriber.multilingual">
              <el-form-item label="Select the source language">
                <el-select
                  v-model="transcriber.language"
                  class="w-full"
                >
                  <el-option
                    v-for="(lang, code) in LANGUAGES"
                    :key="code"
                    :label="titleCase(lang)"
                    :value="code"
                  />
                </el-select>
              </el-form-item>
  
              <el-form-item label="Select the task to perform">
                <el-select
                  v-model="transcriber.subtask"
                  class="w-full"
                >
                  <el-option
                    label="Transcribe"
                    value="transcribe"
                  />
                  <el-option
                    label="Translate (to English)"
                    value="translate"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </template>
      </Modal>
    </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import axios from 'axios'
import Modal from './Modal/Modal.vue'
import UrlInput from './Modal/UrlInput.vue'
import AudioPlayer from './AudioPlayer.vue'
import TranscribeButton from './TranscribeButton.vue'
import Constants from '../utils/Constants'
import { Transcriber } from '../hooks/useTranscriber'
import Progress from './Progress.vue'
import AudioRecorder from './AudioRecorder.vue'

// Props
interface Props {
  transcriber: Transcriber
}
const props = defineProps<Props>()

// Constants
const LANGUAGES = {
    en: "english",
    zh: "chinese",
    de: "german",
    es: "spanish/castilian",
    ru: "russian",
    ko: "korean",
    fr: "french",
    ja: "japanese",
    pt: "portuguese",
    tr: "turkish",
    pl: "polish",
    ca: "catalan/valencian",
    nl: "dutch/flemish",
    ar: "arabic",
    sv: "swedish",
    it: "italian",
    id: "indonesian",
    hi: "hindi",
    fi: "finnish",
    vi: "vietnamese",
    he: "hebrew",
    uk: "ukrainian",
    el: "greek",
    ms: "malay",
    cs: "czech",
    ro: "romanian/moldavian/moldovan",
    da: "danish",
    hu: "hungarian",
    ta: "tamil",
    no: "norwegian",
    th: "thai",
    ur: "urdu",
    hr: "croatian",
    bg: "bulgarian",
    lt: "lithuanian",
    la: "latin",
    mi: "maori",
    ml: "malayalam",
    cy: "welsh",
    sk: "slovak",
    te: "telugu",
    fa: "persian",
    lv: "latvian",
    bn: "bengali",
    sr: "serbian",
    az: "azerbaijani",
    sl: "slovenian",
    kn: "kannada",
    et: "estonian",
    mk: "macedonian",
    br: "breton",
    eu: "basque",
    is: "icelandic",
    hy: "armenian",
    ne: "nepali",
    mn: "mongolian",
    bs: "bosnian",
    kk: "kazakh",
    sq: "albanian",
    sw: "swahili",
    gl: "galician",
    mr: "marathi",
    pa: "punjabi/panjabi",
    si: "sinhala/sinhalese",
    km: "khmer",
    sn: "shona",
    yo: "yoruba",
    so: "somali",
    af: "afrikaans",
    oc: "occitan",
    ka: "georgian",
    be: "belarusian",
    tg: "tajik",
    sd: "sindhi",
    gu: "gujarati",
    am: "amharic",
    yi: "yiddish",
    lo: "lao",
    uz: "uzbek",
    fo: "faroese",
    ht: "haitian creole/haitian",
    ps: "pashto/pushto",
    tk: "turkmen",
    nn: "nynorsk",
    mt: "maltese",
    sa: "sanskrit",
    lb: "luxembourgish/letzeburgesch",
    my: "myanmar/burmese",
    bo: "tibetan",
    tl: "tagalog",
    mg: "malagasy",
    as: "assamese",
    tt: "tatar",
    haw: "hawaiian",
    ln: "lingala",
    ha: "hausa",
    ba: "bashkir",
    jw: "javanese",
    su: "sundanese",
} as const

enum AudioSource {
  URL = "URL",
  FILE = "FILE",
  RECORDING = "RECORDING",
}

// State
const progress = ref<number | undefined>(undefined)
const audioData = ref<{
  buffer: AudioBuffer
  url: string
  source: AudioSource
  mimeType: string
} | undefined>(undefined)
const audioDownloadUrl = ref<string | undefined>(undefined)
const showSettingsModal = ref(false)
const showUrlModal = ref(false)
const showRecordModal = ref(false)
const audioBlob = ref<Blob>()

// Computed
const isAudioLoading = computed(() => progress.value !== undefined)

// Methods
const titleCase = (str: string) => {
  str = str.toLowerCase()
  return (str.match(/\w+.?/g) || [])
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

const resetAudio = () => {
  audioData.value = undefined
  audioDownloadUrl.value = undefined
}

const setAudioFromDownload = async (data: ArrayBuffer, mimeType: string) => {
  const audioCTX = new AudioContext({
    sampleRate: Constants.SAMPLING_RATE,
  })
  const blobUrl = URL.createObjectURL(
    new Blob([data], { type: "audio/*" })
  )
  const decoded = await audioCTX.decodeAudioData(data)
  audioData.value = {
    buffer: decoded,
    url: blobUrl,
    source: AudioSource.URL,
    mimeType: mimeType,
  }
}

const setAudioFromRecording = async (data: Blob) => {
  resetAudio()
  progress.value = 0
  const blobUrl = URL.createObjectURL(data)
  const fileReader = new FileReader()
  
  fileReader.onprogress = (event) => {
    progress.value = event.loaded / event.total || 0
  }
  
  fileReader.onloadend = async () => {
    const audioCTX = new AudioContext({
      sampleRate: Constants.SAMPLING_RATE,
    })
    const arrayBuffer = fileReader.result as ArrayBuffer
    const decoded = await audioCTX.decodeAudioData(arrayBuffer)
    progress.value = undefined
    audioData.value = {
      buffer: decoded,
      url: blobUrl,
      source: AudioSource.RECORDING,
      mimeType: data.type,
    }
  }
  
  fileReader.readAsArrayBuffer(data)
}

const handleFileSelect = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  
  const file = files[0]
  const urlObj = URL.createObjectURL(file)
  const mimeType = file.type
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    if (!arrayBuffer) return
    
    const audioCTX = new AudioContext({
      sampleRate: Constants.SAMPLING_RATE,
    })
    const decoded = await audioCTX.decodeAudioData(arrayBuffer)
    props.transcriber.onInputChange()
    audioData.value = {
      buffer: decoded,
      url: urlObj,
      source: AudioSource.FILE,
      mimeType: mimeType,
    }
  }
  reader.readAsArrayBuffer(file)
}

// Watch effect for URL changes
watch(audioDownloadUrl, async (newUrl) => {
  if (!newUrl) return
  
  const controller = new AbortController()
  try {
    audioData.value = undefined
    progress.value = 0
    
    const { data, headers } = await axios.get(newUrl, {
      signal: controller.signal,
      responseType: 'arraybuffer',
      onDownloadProgress(progressEvent) {
        progress.value = progressEvent.progress || 0
      },
    })
    
    let mimeType = headers['content-type']
    if (!mimeType || mimeType === 'audio/wave') {
      mimeType = 'audio/wav'
    }
    await setAudioFromDownload(data, mimeType)
  } catch (error) {
    console.error('Request failed or aborted', error)
    ElMessage.error('Failed to load audio from URL')
  } finally {
    progress.value = undefined
  }
  
  return () => controller.abort()
})
</script>

<style scoped>
.audio-manager {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.control-panel {
  margin-bottom: 20px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.hidden {
  display: none;
}

.transcribe-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 20px 0;
}

.settings-button {
  position: absolute;
  right: 16px;
}

.progress-items {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 4px;
  margin-top: 20px;
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>