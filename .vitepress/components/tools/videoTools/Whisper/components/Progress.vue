<template>
    <div class="custom-progress">
      <el-progress
        :percentage="Number(formattedPercentage)"
        :format="format"
        :stroke-width="20"
        class="progress-bar"
      />
    </div>
</template>
<script setup lang="ts">

interface Props {
  text: string
  percentage: number
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0
})

// 格式化百分比显示
const formattedPercentage = computed(() => {
  return props.percentage.toFixed(2)
})

// 自定义格式化进度条文本
const format = () => {
  return `${props.text} (${formattedPercentage.value}%)`
}
</script>

<style scoped>
.custom-progress {
  margin-top: 0.125rem;
  width: 100%;
}

.progress-bar :deep(.el-progress-bar__outer) {
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 0.5rem;
}

.progress-bar :deep(.el-progress-bar__inner) {
  background-color: var(--el-color-primary);
  border-radius: 0.5rem;
}

.progress-bar :deep(.el-progress__text) {
  color: var(--el-color-white);
  position: absolute;
  left: 0.5rem;
  line-height: 20px;
  font-size: 0.875rem;
}

/* 暗黑模式支持 */
:deep(.dark) .progress-bar .el-progress-bar__outer {
  background-color: var(--el-fill-color-dark);
  border-color: var(--el-border-color-darker);
}
</style>