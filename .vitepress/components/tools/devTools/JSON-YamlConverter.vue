<template>
    <el-card class="converter-card">
      <template #header>
        <div class="card-header">
          <span>JSON与YAML相互转换工具</span>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="JSON to YAML" name="json-to-yaml">
          <div class="converter-container">
            <el-input
              type="textarea"
              v-model="jsonInput"
              placeholder="Enter JSON here"
              class="input-area"
              :rows="20"
            ></el-input>
            <div class="output-container">
                <div class="output-area" v-html="yamlOutputHtml"></div>
                <el-button
                class="copy-button"
                @click="copyToClipboard(yamlOutput)"
                ><i-ep-document-copy/>复制</el-button>
            </div>       
          </div>
        </el-tab-pane>
        <el-tab-pane label="YAML to JSON" name="yaml-to-json">
          <div class="converter-container">
            <el-input
              type="textarea"
              v-model="yamlInput"
              placeholder="Enter YAML here"
              class="input-area"
              :rows="20"
            ></el-input>
            <div class="output-container">
                <div class="output-area" v-html="jsonOutputHtml"></div>
                <el-button
                class="copy-button"
                @click="copyToClipboard(jsonOutput)"
                ><i-ep-document-copy/>复制</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
</template>
  
<script setup lang="ts">
  import JSON5 from 'json5';
  import hljs from 'highlight.js/lib/core';
  import jsonHljs from 'highlight.js/lib/languages/json';
  import yamlHljs from 'highlight.js/lib/languages/yaml';
  import 'highlight.js/styles/atom-one-light.css'; /* 你可以选择其他样式，如 'github.css' */
  import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
  
  const activeTab = ref('json-to-yaml');
  const jsonInput = ref('');
  const yamlInput = ref('');
  const yamlOutputHtml = ref('');
  const jsonOutputHtml = ref('');

  hljs.registerLanguage('json', jsonHljs);
  hljs.registerLanguage('yaml', yamlHljs);
  
  const yamlOutput = computed(() => {
    const jsonstring = jsonInput.value.trim();
    if (!jsonstring) {
      return '';
    } else {
      try {
        const obj = JSON5.parse(jsonInput.value);
        return stringifyYaml(obj);
      } catch (e) {
        return 'Error: ' + e.message;
      }
    }
  });
  
  const jsonOutput = computed(() => {
    const yamlstring = yamlInput.value.trim();
    if (!yamlstring) {
      return '';
    } else {
      try {
        const obj = parseYaml(yamlInput.value, { merge: true });
        return JSON.stringify(obj, null, 3);
      } catch (e) {
        return 'Error: ' + e.message;
      }
    }
  });
  
  watch(yamlOutput, (newValue) => {
    yamlOutputHtml.value = hljs.highlight(newValue, { language: 'yaml' }).value;
  },{ immediate: true });  

  watch(jsonOutput, (newValue) => {
    jsonOutputHtml.value = hljs.highlight(newValue, { language: 'json' }).value;
  },{ immediate: true });    

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        //console.log('Text copied to clipboard');
        ElMessage.success('复制成功');
    }).catch((error) => {
        console.error('Failed to copy text: ', error);
        ElMessage.error('复制失败！' + error.message);
    });
  };  
</script>
  
<style scoped>
  .converter-card {
    max-width: 1000px;
    margin: 0px auto;
    padding: 20px;
  }
  .converter-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
  .input-area,
  .output-container {
    width: 48%;
    margin: 10px 0;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .output-area {
    white-space: pre-wrap;
    text-align: left;
    border: 1px solid #ccc;
    padding: 10px;
    overflow: auto;
    background-color: #f5f5f5;
    height: calc(20 * 1.5em + 10px); /* 根据行高和行数计算高度 */ 
  }
  .copy-button {
    position: absolute;
    top: 10px;
    right: 5px;
    top: 15px;
    z-index: 10;
  }
  
  /* 自定义滚动条样式 */
  .output-area::-webkit-scrollbar {
    width: 8px;
  }
  .output-area::-webkit-scrollbar-thumb {
    background-color: #999;
    border-radius: 4px;
  }
  .output-area::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  .output-area::-webkit-scrollbar-thumb:hover {
    background-color: #666;
  }
  </style>
  