<template>
  <el-progress
    :percentage="percentage || 0"
    :format="formatProgress"
    :stroke-width="20"
    class="progress-bar"
  />
</template>

<script setup lang="ts">

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  percentage: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: NaN
  }
})

// 格式化字节大小的工具函数
const formatBytes = (size) => {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  )
}

// 格式化进度条显示文本
const formatProgress = (percentage) => {
  const formattedPercentage = percentage.toFixed(2)
  const totalText = isNaN(props.total) ? '' : ` of ${formatBytes(props.total)}`
  return `${props.text} (${formattedPercentage}%${totalText})`
}
</script>

<style scoped>
.progress-bar {
  margin-bottom: 2px;
}

:deep(.el-progress-bar__outer) {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

:deep(.el-progress-bar__inner) {
  background-color: var(--el-color-primary);
  border-radius: 8px;
}

:deep(.el-progress__text) {
  display: none;
}
</style>