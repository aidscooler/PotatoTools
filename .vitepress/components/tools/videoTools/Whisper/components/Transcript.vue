<template>
    <el-card class="my-2 transcript-container" shadow="never">
      <div ref="transcriptRef" class="transcript-content">
        <el-timeline>
          <el-timeline-item
            v-for="(chunk, i) in transcribedData?.chunks"
            :key="`${i}-${chunk.text}`"
            :timestamp="formatAudioTimestamp(chunk.timestamp[0])"
            placement="top"
          >
            <el-card class="mb-4">
              {{ chunk.text }}
            </el-card>
          </el-timeline-item>
        </el-timeline>
  
        <div v-if="transcribedData && !transcribedData.isBusy" class="text-right mt-4">
          <el-button
            type="success"
            @click="exportTXT"
            class="mr-2"
          >
            Export TXT
          </el-button>
          <el-button
            type="success"
            @click="exportJSON"
          >
            Export JSON
          </el-button>
        </div>
      </div>
    </el-card>
</template>
  
  <script setup lang="ts">
  import { formatAudioTimestamp } from '../utils/AudioUtils'
  import type { TranscriberData } from '../hooks/useTranscriber'
  
  interface Props {
    transcribedData?: TranscriberData
  }
  
  const props = defineProps<Props>()
  const transcriptRef = ref<HTMLElement | null>(null)
  
  // 文件保存辅助函数
  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
  
  // 导出功能
  const exportTXT = () => {
    const chunks = props.transcribedData?.chunks ?? []
    const text = chunks
      .map(chunk => chunk.text)
      .join('')
      .trim()
    const blob = new Blob([text], { type: 'text/plain' })
    saveBlob(blob, 'transcript.txt')
  }
  
  const exportJSON = () => {
    let jsonData = JSON.stringify(props.transcribedData?.chunks ?? [], null, 2)
    // 优化 JSON 格式
    const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm
    jsonData = jsonData.replace(regex, '$1[$2 $3]')
    const blob = new Blob([jsonData], { type: 'application/json' })
    saveBlob(blob, 'transcript.json')
  }
  
  // 自动滚动功能
  watch(
    () => props.transcribedData?.chunks,
    () => {
      setTimeout(() => {
        if (transcriptRef.value) {
          const element = transcriptRef.value
          const diff = Math.abs(
            element.offsetHeight +
            element.scrollTop -
            element.scrollHeight
          )
          if (diff <= 64) {
            element.scrollTop = element.scrollHeight
          }
        }
      }, 0)
    },
    { deep: true }
  )
  </script>
  
  <style scoped>
  .transcript-container {
    width: 100%;
  }
  
  .transcript-content {
    max-height: 20rem;
    overflow-y: auto;
    padding: 1rem;
  }
  
  :deep(.el-timeline-item__node) {
    background-color: var(--el-color-success);
  }
  
  :deep(.el-timeline-item__timestamp) {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  
  .el-card {
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }
  
  .el-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  </style>