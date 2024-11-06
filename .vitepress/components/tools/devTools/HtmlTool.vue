<template>
  <el-card class="html-tool">
    <template #header>
      <div class="card-header">
        <span>HTML工具</span>
      </div>
    </template>
    
    <el-form :model="formData" label-width="120px">
      <div class="options-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="缩进大小">
              <el-input-number v-model="indentSize" :min="0" :max="8"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="换行长度">
              <el-input-number v-model="wrapLineLength" :min="0" :max="200"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大保留换行数">
              <el-input-number v-model="maxPreserveNewlines" :min="0" :max="10"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div style="text-align: left;">
        <el-button-group style="margin-bottom:20px">
          <el-button type="primary" @click="beautifyHtml">
            <i-ep-magic-stick /> 美化HTML
          </el-button>
          <el-button type="success" @click="compressHtml">
            <i-ep-delete /> 压缩HTML
          </el-button>
          <el-button type="warning" @click="copyHtml">
            <i-ep-document-copy /> 复制HTML
          </el-button>
          <el-button type="danger" @click="downloadHtml">
            <i-ep-download /> 下载HTML
          </el-button>
        </el-button-group>      
      </div>

      
      <div class="code-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="inputHtml"
              type="textarea"
              :rows="20"
              placeholder="请输入HTML代码"
            ></el-input>
          </el-col>
          <el-col :span="12">
            <el-input
              v-model="outputHtml"
              type="textarea"
              :rows="20"
              readonly
              placeholder="处理结果将显示在这里"
            ></el-input>
          </el-col>
        </el-row>            
      </div>
    </el-form>
  </el-card>
</template>
  
<script setup>
  import { html as beautify } from 'js-beautify'
  
  const inputHtml = ref('')
  const outputHtml = ref('')
  const indentSize = ref(2)
  const wrapLineLength = ref(80)
  const maxPreserveNewlines = ref(2)
  const formData = {
    indentSize,
    wrapLineLength,
    maxPreserveNewlines
  }
  
  const beautifyHtml = () => {
    if (!inputHtml.value) {
      ElMessage.warning('请先输入HTML代码')
      return
    }
    outputHtml.value = beautify(inputHtml.value, {
      indent_size: indentSize.value,
      wrap_line_length: wrapLineLength.value,
      max_preserve_newlines: maxPreserveNewlines.value,
    })
  }
  
  const compressHtml = () => {
    if (!inputHtml.value) {
      ElMessage.warning('请先输入HTML代码')
      return
    }
    outputHtml.value = inputHtml.value
      .replace(/<!--(?!<!)[^\[>].*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim()
  }
  
  const copyHtml = () => {
    if (!outputHtml.value) {
      ElMessage.warning('没有可复制的HTML内容')
      return
    }
    navigator.clipboard.writeText(outputHtml.value).then(() => {
      ElMessage.success('HTML已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
  }
  
  const downloadHtml = () => {
    if (!outputHtml.value) {
      ElMessage.warning('没有可下载的HTML内容')
      return
    }
    const blob = new Blob([outputHtml.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.html'
    a.click()
    URL.revokeObjectURL(url)
  }
</script>
  
<style scoped>
.html-tool {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.options-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.button-group {
  margin-bottom: 20px;
}
.code-section {
  background-color: #f5f7fa;
  padding: 0px;
  border-radius: 4px;
}
.el-input-number {
  width: 100%;
}
.el-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
}
</style>
  