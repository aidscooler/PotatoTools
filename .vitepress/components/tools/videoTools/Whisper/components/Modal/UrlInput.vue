<template>
    <div class="url-input-wrapper">
      <el-input
        :model-value="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        type="url"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClass"
      />
    </div>
</template>

<script setup lang="ts">

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'www.example.com',
  required: true,
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

const inputClass = computed(() => {
  return `url-input ${props.class || ''}`
})
</script>

<style scoped>
.url-input-wrapper {
  margin: 0.5rem 0;
}

.url-input {
  --el-input-border-color: var(--el-border-color);
  --el-input-hover-border-color: var(--el-color-primary);
  --el-input-focus-border-color: var(--el-color-primary);
}

.url-input :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  padding: 0.625rem;
  background-color: var(--el-fill-color-blank);
}

/* 暗黑模式支持 */
:deep(.dark) .url-input .el-input__wrapper {
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}
</style>