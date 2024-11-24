<template>
    <el-button
      :disabled="isTranscribing"
      type="primary"
      @click="handleClick"
      :loading="isModelLoading || isTranscribing"
    >
      <template v-if="isModelLoading">
        <span>Loading model...</span>
      </template>
      <template v-else-if="isTranscribing">
        <span>Transcribing...</span>
      </template>
      <template v-else>
        <span>Transcribe Audio</span>
      </template>
    </el-button>
</template>
  
<script setup lang="ts">
  interface Props {
    isModelLoading: boolean;
    isTranscribing: boolean;
    onClick?: (event: MouseEvent) => void;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isModelLoading: false,
    isTranscribing: false,
    onClick: undefined,
  });
  
  const handleClick = (event: MouseEvent) => {
    if (props.onClick && !props.isTranscribing && !props.isModelLoading) {
      props.onClick(event);
    }
  };
</script>