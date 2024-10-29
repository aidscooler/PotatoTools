<template>
    <el-card class="animation-generator">
      <template #header>
        <div class="card-header">
          <span>CSS3 动画生成器</span>
        </div>
      </template>
      <div class="content-wrapper">
        <!-- 左侧：动画效果选项列表 -->
        <div class="animation-list">
          <el-collapse v-model="activeGroups">
            <el-collapse-item v-for="group in animationGroups" :key="group.label" :title="group.label" :name="group.label">
              <el-radio-group v-model="form.animation" class="animation-radio-group">
                <el-radio v-for="anim in group.options" :key="anim" :value="anim">{{ anim }}</el-radio>
              </el-radio-group>
            </el-collapse-item>
          </el-collapse>
        </div>
  
        <!-- 中间：动画参数设置和效果展示 -->
        <div class="form-and-preview">
          <el-form :model="form" label-width="120px" class="form-content">
            <el-form-item label="持续时间 (秒)">
              <el-slider v-model="form.duration" :min="0.1" :max="10" :step="0.1" />
            </el-form-item>
            <el-form-item label="延迟时间 (秒)">
              <el-slider v-model="form.delay" :min="0" :max="5" :step="0.1" />
            </el-form-item>
            <el-form-item label="重复次数">
              <el-input-number v-model="form.repeat" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="代码生成方式">
            <el-radio-group v-model="codeGenerationType">
                <el-radio label="native">原生 CSS</el-radio>
                <el-radio label="animateCSS">Animate.css 类</el-radio>
            </el-radio-group>
            </el-form-item>            
            <el-form-item>
              <el-button type="primary" @click="applyAnimation">应用动画</el-button>
              <el-button type="primary" @click="copyToClipboard">复制代码</el-button>
            </el-form-item>
          </el-form>
  
          <el-card class="preview-card">
            <div ref="animatedElement" class="animated-element">
              预览元素
            </div>
          </el-card>
  
          <el-card class="code-card">
            <pre><code>{{ highlightedCode }}</code></pre>
          </el-card>
        </div>
  
        <!-- 右侧：Animate.css 介绍 -->
        <div class="info-section">
          <el-card class="info-card">
            <h3>关于 Animate.css</h3>
            <p>Animate.css 是一个跨浏览器的 CSS 动画库，提供了丰富的即用型 CSS 动画效果。</p>
            <h4>快速使用：</h4>
            <ol>
            <li>安装：<br/><code>npm install animate.css</code></li>
            <li>导入：<br/><code>import 'animate.css';</code></li>
            </ol>
            <el-button type="primary" size="small" @click="openAnimateCssWebsite">
                访问官网
            </el-button>
          </el-card>
        </div>
      </div>
    </el-card>
</template>
  
<script setup>
    import 'animate.css'
    import hljs from 'highlight.js/lib/core';
    import css from 'highlight.js/lib/languages/css';
    import xml from 'highlight.js/lib/languages/xml';
    import 'highlight.js/styles/github.css'; // 或者选择其他主题  

    hljs.registerLanguage('css', css);
    hljs.registerLanguage('xml', xml);    
  const animationGroups = [
    {
        label: '注意力',
        options: ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat']
    },
    {
        label: '返回',
        options: ['backOutDown', 'backOutLeft', 'backOutRight', 'backOutUp']
    },
    {
        label: '弹跳',
        options: ['bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp']
    },
    {
        label: '淡入淡出',
        options: ['fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInUp', 'fadeInUpBig', 'fadeInTopLeft', 'fadeInTopRight', 'fadeInBottomLeft', 'fadeInBottomRight', 'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig', 'fadeOutTopLeft', 'fadeOutTopRight', 'fadeOutBottomRight', 'fadeOutBottomLeft']
    },
    {
        label: '翻转',
        options: ['flip', 'flipInX', 'flipInY', 'flipOutX', 'flipOutY']
    },
    {
        label: '光速',
        options: ['lightSpeedInRight', 'lightSpeedInLeft', 'lightSpeedOutRight', 'lightSpeedOutLeft']
    },
    {
        label: '旋转',
        options: ['rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight', 'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight']
    },
    {
        label: '特殊',
        options: ['hinge', 'jackInTheBox', 'rollIn', 'rollOut']
    },
    {
        label: '缩放',
        options: ['zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp']
    },
    {
        label: '滑动',
        options: ['slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp']
    }
  ]
  
  const form = reactive({
    animation: 'bounce',
    duration: 1,
    delay: 0,
    repeat: 1
  })
  
  const animatedElement = ref(null)
  const activeGroups = ref(['注意力']) // 默认展开第一个分组
  const codeGenerationType = ref('native');
  
  const applyAnimation = () => {
    const element = animatedElement.value
    element.className = 'animated-element'
    void element.offsetWidth // 触发重绘
    element.className = `animated-element animate__animated animate__${form.animation}`
    element.style.animationDuration = `${form.duration}s`
    element.style.animationDelay = `${form.delay}s`
    element.style.animationIterationCount = form.repeat

    // 动画结束后恢复初始状态
    element.addEventListener('animationend', () => {
        element.className = 'animated-element'
        element.style.animationDuration = ''
        element.style.animationDelay = ''
        element.style.animationIterationCount = ''
    }, { once: true })
  }
  
const generatedCSS = computed(() => {
    return `/* 必需的基础类 */
        .animate__animated {
        animation-duration: ${form.duration}s;
        animation-delay: ${form.delay}s;
        animation-iteration-count: ${form.repeat};
        animation-fill-mode: both;
        }

        /* 应用动画 */
        .animate__${form.animation} {
        animation-name: ${form.animation};
        }

        /* 使用示例 */
        <div class="animate__animated animate__${form.animation}">
        您的元素内容
        </div>`;
});

const highlightedCode = computed(() => {
  const cssCode = hljs.highlight(generatedCSS.value, { language: 'css' }).value;
  const htmlCode = hljs.highlight('<div class="animate__animated animate__${form.animation}">\n  您的元素内容\n</div>', { language: 'xml' }).value;
  return `${cssCode}\n\n/* 使用示例 */\n${htmlCode}`;
});

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCSS.value).then(() => {
      ElMessage.success('CSS已复制到剪贴板')
    }, () => {
      ElMessage.error('复制失败，请手动复制')
    })
  }
  const openAnimateCssWebsite = () => {
    window.open('https://animate.style/', '_blank');
  };
</script>
  
<style scoped>
.animation-generator {
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.animation-list {
  width: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.form-and-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.info-section {
  width: 250px;
}

.info-card {
    height: 100%;
    background-color: #f8f9fa;
    border-left: 4px solid #409EFF;
    text-align: left;
    padding: 15px;
}

.info-card h3 {
    margin-top: 0;
    color: #409EFF;
    font-size: 1.2em;
}
.info-card h4 {
  color: #303133;
  font-size: 1em;
  margin-top: 15px;
  margin-bottom: 10px;
}
.form-content {
  width: 100%;
}

.animation-radio-group {
  display: flex;
  flex-direction: column;
}

.preview-card {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.animated-element {
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
.code-card {
  max-height: 300px;
  overflow-y: auto;
}
.code-card pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.info-card p {
  color: #606266;
  font-size: 0.9em;
  line-height: 1.5;
}

.info-card ol {
  margin-top: 10px;
  margin-bottom: 15px;
}

.info-card li {
  color: #606266;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.info-card code {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.info-card .el-button {
  margin-top: 10px;
}
</style>
  