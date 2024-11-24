<template>
    <el-dialog
      v-model="show"
      :title="title"
      width="30%"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div class="dialog-content text-sm text-gray-500">
        {{ content }}
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
          <el-button
            v-if="submitText"
            type="primary"
            :disabled="!submitEnabled"
            @click="handleSubmit"
          >
            {{ submitText }}
          </el-button>
        </div>
      </template>
    </el-dialog>
</template>
<script setup lang="ts">

interface Props {
  show: boolean
  title: string 
  content: string
  submitText?: string
  submitEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitEnabled: true
})

const emit = defineEmits(['update:show', 'close', 'submit'])

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dialog-content {
  margin-bottom: 1rem;
}
</style>