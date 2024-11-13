<template>
    <el-card class="time-converter-card">
      <template #header>
        <div class="card-header">
          <span>时间戳转换工具</span>
        </div>
      </template>
      <div class="card-content">
        <div class="timestamp-display">
          <label>当前时间：</label>
          <el-input
            v-model="currentTimestamp"
            readonly
            class="timestamp-input"
          ></el-input>
          <span class="timestamp-unit">{{ timestampUnit }}</span>
          <el-button link @click="copyTimestamp">复制</el-button>
        </div>
        <el-radio-group v-model="timestampType" class="radio-group">
          <el-radio value="unixTimestamp">unix timestamp</el-radio>
          <el-radio value="timestamp">timestamp</el-radio>
        </el-radio-group>
  
        <div class="converter-section">
          <div class="timestamp-to-date">
            <label>时间戳转日期：</label>
            <el-input
              v-model="inputTimestamp"
              placeholder="请输入时间戳"
              class="converter-input"
            ></el-input>
            <el-button @click="convertTimestampToDate">转换</el-button>
            <el-input
              v-model="convertedDate"
              readonly
              class="converter-input"
            ></el-input>
          </div>
  
          <div class="date-to-timestamp">
            <label>日期转时间戳：</label>
            <el-date-picker
              v-model="inputDate"
              type="datetime"
              placeholder="请选择日期时间"
              class="converter-input"
              value-format="x"
              style="max-width: 200px;margin-right: 10px;"
            ></el-date-picker>
            <el-button @click="convertDateToTimestamp">转换</el-button>
            <el-input
              v-model="convertedTimestamp"
              readonly
              class="converter-input"
            ></el-input>
          </div>
        </div>       
      </div>
    <!-- 编程语言代码示例 -->
    <div class="code-section">
      <el-table :data="codeExamples" style="width: 100%" :border="true">
        <el-table-column prop="language" label="编程语言" width="200" align="center"></el-table-column>
        <el-table-column prop="code" label="代码示例">
          <template #default="{ row }">
            <pre class="code">{{ row.code }}</pre>
          </template>
        </el-table-column>
      </el-table>
    </div>     
    </el-card>
</template>
  
<script setup lang="ts">
  import codeExample from '../../../config/codeExample.json';
  const currentTimestamp = ref('');
  const timestampType = ref('unixTimestamp');
  const timestampUnit = ref('秒');
  const intervalId = ref(null);
  
  const inputTimestamp = ref('');
  const convertedDate = ref('');
  
  const inputDate = ref('');
  const convertedTimestamp = ref('');
  
  const updateTimestamp = () => {
    const now = new Date();
    if (timestampType.value === 'timestamp') {
      currentTimestamp.value = now.getTime().toString();
      timestampUnit.value = '毫秒';
    } else {
      currentTimestamp.value = Math.floor(now.getTime() / 1000).toString();
      timestampUnit.value = '秒';
    }
  };
  
  const copyTimestamp = () => {
    navigator.clipboard.writeText(currentTimestamp.value).then(() => {
      ElMessage.success('时间戳已复制到剪贴板');
    }).catch((err) => {
      ElMessage.error('复制失败: ' + err);
    });
  };
  
  const convertTimestampToDate = () => {
    if (inputTimestamp.value) {
      const timestamp = parseInt(inputTimestamp.value);
      if (isNaN(timestamp)) {
        convertedDate.value = '无效的时间戳';
        return;
      }
  
      let date;
      if (inputTimestamp.value.length === 10) { // Assume it's a Unix timestamp
        date = new Date(timestamp * 1000);
      } else if (inputTimestamp.value.length === 13) { // Assume it's a timestamp in milliseconds
        date = new Date(timestamp);
      } else {
        convertedDate.value = '无效的时间戳';
        return;
      }
  
      convertedDate.value = formatDate(date);
    } else {
      convertedDate.value = '';
    }
  };
  
  const convertDateToTimestamp = () => {
    if (inputDate.value) {
      const date = new Date(inputDate.value);
      console.log(date)
      if (!isNaN(date.getTime())) {
        const timestamp = Math.floor(date.getTime() / 1000);
        convertedTimestamp.value = timestamp.toString();
      } else {
        convertedTimestamp.value = '无效的日期';
      }
    } else {
      convertedTimestamp.value = '';
    }
  };
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
// 编程语言代码示例
let codeExamples = [];
  onMounted( async () => {
    updateTimestamp();
    intervalId.value = setInterval(updateTimestamp, 1000);
    codeExample.forEach(element => {
        element.code = element.code.replace(/\\n/g, '\n')  // 将 \\n 转换为 \n
                                    .replace(/\\\\/g, '\\'); // 将 \\\\ 转换为 \\
    });
    codeExamples = codeExample;
  });
  
  watch(timestampType, () => {
    clearInterval(intervalId.value);
    if (timestampType.value === 'timestamp') {
      intervalId.value = setInterval(updateTimestamp, 1);
    } else {
      intervalId.value = setInterval(updateTimestamp, 1000);
    }
    updateTimestamp();
  });
</script>
  
<style scoped>
  .time-converter-card {
    max-width: 800px; /* 减小最大宽度以更好地适应小屏幕 */
    margin: 0px auto; /* 增加上下外边距并居中显示 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影以增加深度感 */
    border-radius: 8px; /* 添加圆角以使卡片看起来更柔和 */
  }

  .card-header {
    text-align: left; /* 中心对齐标题文本 */
    font-size: 24px; /* 增加标题的字体大小 */
    font-weight: bold; /* 确保标题加粗 */
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: left; /* 中心对齐卡片内容 */
    padding: 20px; /* 增加内边距以提供更多空间 */
  }

  .timestamp-display {
    display: flex;
    align-items: center;
    margin-bottom: 20px; /* 增加底部外边距 */
  }

  .timestamp-input {
    width: 100%; /* 使输入框宽度自适应 */
    max-width: 200px; /* 设置最大宽度 */
    margin-right: 10px; /* 保持适当的间距 */
  }

  .timestamp-unit {
    font-size: 16px;
    margin-right: 10px; /* 增加右侧间距 */
  }

  .radio-group {
    margin-bottom: 20px; /* 增加底部外边距 */
  }

  .converter-section {
    width: 100%; /* 使转换部分宽度自适应 */
  }

  .timestamp-to-date,
  .date-to-timestamp {
    display: flex;
    align-items: center;
    margin-bottom: 20px; /* 增加底部外边距 */
  }

  .converter-input {
    width: 100%; /* 使输入框宽度自适应 */
    max-width: 200px; /* 设置最大宽度 */
    margin-right: 10px; /* 保持适当的间距 */
  }

  .el-button {
    margin-right: 10px; /* 保持适当的间距 */
  }

  @media (max-width: 768px) {
    .converter-section {
      flex-direction: column; /* 在小屏幕上堆叠元素 */
    }

    .timestamp-to-date,
    .date-to-timestamp {
      flex-direction: column; /* 在小屏幕上堆叠元素 */
      align-items: flex-start; /* 左对齐元素 */
    }

    .converter-input,
    .el-button {
      width: 100%; /* 使输入框和按钮宽度自适应 */
      margin-bottom: 10px; /* 增加底部外边距 */
    }
  }
  .code-section {
    width: 100%;
  }

  .code-header {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .code {
    white-space: pre-wrap; /* 保持代码的格式 */
    font-family: monospace; /* 使用等宽字体 */
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    margin: 0;
  }
</style>
  