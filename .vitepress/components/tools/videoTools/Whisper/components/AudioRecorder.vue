<template>
    <div class="audio-recorder">
      <el-button
        :type="recording ? 'danger' : 'success'"
        @click="handleToggleRecording"
        class="record-button"
      >
        {{ recording 
          ? `停止录音 (${formatAudioTimestamp(duration)})` 
          : '开始录音' 
        }}
      </el-button>
  
      <audio
        v-if="recordedBlob"
        ref="audioRef"
        controls
        class="audio-player"
      >
        <source
          :src="URL.createObjectURL(recordedBlob)"
          :type="recordedBlob.type"
        />
      </audio>
    </div>
</template>

<script setup lang="ts">
import { formatAudioTimestamp } from '../utils/AudioUtils'
import { webmFixDuration } from '../utils/BlobFix'

interface Props {
  onRecordingComplete: (blob: Blob) => void
}

const props = defineProps<Props>()

const recording = ref(false)
const duration = ref(0)
const recordedBlob = ref<Blob | null>(null)

const streamRef = ref<MediaStream | null>(null)
const mediaRecorderRef = ref<MediaRecorder | null>(null)
const chunksRef = ref<Blob[]>([])
const audioRef = ref<HTMLAudioElement | null>(null)
let timerInterval: number | null = null

// 获取支持的音频格式
const getMimeType = () => {
  const types = [
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/aac',
  ]
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return undefined
}

// 开始录音
const startRecording = async () => {
  recordedBlob.value = null
  let startTime = Date.now()

  try {
    if (!streamRef.value) {
      streamRef.value = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
    }

    const mimeType = getMimeType()
    const mediaRecorder = new MediaRecorder(streamRef.value, {
      mimeType,
    })

    mediaRecorderRef.value = mediaRecorder
    chunksRef.value = []

    mediaRecorder.addEventListener('dataavailable', async (event) => {
      if (event.data.size > 0) {
        chunksRef.value.push(event.data)
      }
      if (mediaRecorder.state === 'inactive') {
        const duration = Date.now() - startTime

        let blob = new Blob(chunksRef.value, { type: mimeType })

        if (mimeType === 'audio/webm') {
          blob = await webmFixDuration(blob, duration, blob.type)
        }

        recordedBlob.value = blob
        props.onRecordingComplete(blob)
        chunksRef.value = []
      }
    })

    mediaRecorder.start()
    recording.value = true

    // 开始计时
    timerInterval = window.setInterval(() => {
      duration.value++
    }, 1000)

  } catch (error) {
    console.error('Error accessing microphone:', error)
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorderRef.value && mediaRecorderRef.value.state === 'recording') {
    mediaRecorderRef.value.stop()
    duration.value = 0
    recording.value = false
    
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}

// 切换录音状态
const handleToggleRecording = () => {
  if (recording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (streamRef.value) {
    streamRef.value.getTracks().forEach(track => track.stop())
  }
})

// 监听录音状态
watch(recording, (newValue) => {
  if (!newValue) {
    // 停止录音时清理计时器
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
})
</script>

<style scoped>
.audio-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.record-button {
  margin: 0.5rem;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.audio-player {
  width: 100%;
  margin-top: 1rem;
}

/* Element Plus 暗黑模式适配 */
:deep(.dark) .record-button {
  border-color: transparent;
}
</style>