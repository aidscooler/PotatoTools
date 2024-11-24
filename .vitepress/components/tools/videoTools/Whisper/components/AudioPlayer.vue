<template>
    <el-card shadow="hover" class="audio-player-card">
      <audio
        ref="audioPlayer"
        controls
        class="audio-player"
      >
        <source
          ref="audioSource"
          :type="mimeType"
        >
      </audio>
    </el-card>
</template>

<script setup lang="ts">

interface Props {
  audioUrl: string
  mimeType: string
}

const props = defineProps<Props>()

const audioPlayer = ref<HTMLAudioElement | null>(null)
const audioSource = ref<HTMLSourceElement | null>(null)

// 使用 watch 替代 watchEffect
watch(
  () => props.audioUrl,
  (newUrl) => {
    if (audioPlayer.value && audioSource.value) {
      audioSource.value.src = newUrl
      audioPlayer.value.load()
    }
  },
  { immediate: true } // 添加 immediate: true 确保组件初始化时也执行
)
</script>

<style scoped>
.audio-player-card {
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}

.audio-player {
  width: 100%;
  height: 3.5rem;
  border-radius: 0.5rem;
  outline: none;
}

/* 自定义音频播放器样式 */
.audio-player::-webkit-media-controls-panel {
  background-color: var(--el-bg-color);
}

.audio-player::-webkit-media-controls-current-time-display,
.audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--el-text-color-primary);
}

/* 暗黑模式支持 */
:deep(.dark) .audio-player-card {
  background: var(--el-bg-color-overlay);
}

:deep(.dark) .audio-player::-webkit-media-controls-panel {
  background-color: var(--el-bg-color-overlay);
}
</style>