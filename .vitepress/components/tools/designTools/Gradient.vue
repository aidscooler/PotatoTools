<template>
    <el-card class="gradient-tool">
      <div class="gradient-tool-container">
        <div class="settings-area">
          <div class="direction-selector">
            <h4>渐变方向</h4>
            <el-radio-group v-model="gradientDirection">
              <el-radio-button 
                v-for="direction in directions" 
                :key="direction.value" 
                :value="direction.value" 
                class="custom-radio-button"
                :style="isDirectionSelected(direction.value)">
                <el-icon>
                  <component :is="direction.icon"></component>
                </el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="preset-list">
            <h3>预设渐变</h3>
            <el-scrollbar>
              <div class="preset-buttons">
                <el-button
                  v-for="preset in presetGradients"
                  :key="preset.name"
                  @click="applyPreset(preset)"
                  size="small"
                  :class="{ 'preset-selected': isPresetSelected(preset) }"
                >
                  {{ preset.name }}
                </el-button>
              </div>
            </el-scrollbar>
          </div>      
          <div class="color-selector">
            <h3>渐变颜色</h3>
            <div class="color-inputs">
              <div v-for="(color, index) in gradientColors" :key="index" class="color-input-wrapper">
                <input
                  :value="color"
                  @input="updateColor($event, index)"
                  @focus="openPickr(index)"
                  :style="{ backgroundColor: color }"
                  class="color-input"
                />
                <div :ref="el => setPickrContainerRef(el, index)" style="visibility: hidden;position: absolute;"></div>
              </div>
            </div>
          </div>
          <el-button @click="generateGradient" type="primary">生成渐变</el-button>
          <div v-if="generatedCSS" class="generated-css">
            <el-tabs v-model="outputFormat">
              <el-tab-pane label="CSS" name="css">
                <div class="code-area">
                  <el-input
                    type="textarea"
                    :rows="6"
                    v-model="generatedCSS"
                    readonly
                    class="custom-textarea"
                  ></el-input>
                  <el-button @click="copyToClipboard(generatedCSS)" size="small" type="primary">复制 CSS</el-button>
                </div>
              </el-tab-pane>
              <el-tab-pane label="SVG" name="svg">
                <div class="code-area">
                  <el-input
                    type="textarea"
                    :rows="6"
                    v-model="generatedSVG"
                    readonly
                    class="custom-textarea"
                  ></el-input>
                  <el-button @click="copyToClipboard(generatedSVG)" size="small" type="primary">复制 SVG</el-button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </el-card>
</template>
<script setup lang="ts">
  import {interpolateColors} from '../../../utils.mjs';
  let Pickr;
  //颜色渐变的方向图标
  const directions = [
    { value: 'to top', icon: IconEpArrowUp },
    { value: 'to right', icon: IconEpArrowRight },
    { value: 'to bottom', icon: IconEpArrowDown },
    { value: 'to left', icon: IconEpArrowLeft },
    { value: 'to right top', icon: IconEpTopRight },
    { value: 'to left top', icon: IconEpTopLeft },
    { value: 'to right bottom', icon: IconEpBottomRight },
    { value: 'to left bottom', icon: IconEpBottomLeft },
    { value: 'circle', icon: IconEpRefresh },
  ];
  //预设颜色渐变
  const presetGradients = [
    { name: '日落', colors: ['#ff512f', '#dd2476'] },
    { name: '海洋', colors: ['#2b5876', '#4e4376'] },
    { name: '森林', colors: ['#134e5e', '#71b280'] },
    { name: '紫罗兰', colors: ['#41295a', '#2f0743'] },
    { name: '柑橘', colors: ['#e96443', '#904e95'] },
    { name: '极光', colors: ['#00c9ff', '#92fe9d'] },
    { name: '樱花', colors: ['#ec008c', '#fc6767'] },
    { name: '薄荷', colors: ['#56ab2f', '#a8e063'] },
    { name: '黄昏', colors: ['#ff5f6d', '#ffc371'] },
    { name: '莓果', colors: ['#c31432', '#240b36'] },
    { name: '青柠', colors: ['#009245', '#fcee21'] },
    { name: '蓝莓', colors: ['#396afc', '#2948ff'] },
    { name: '桃子', colors: ['#ed4264', '#ffedbc'] },
    { name: '薰衣草', colors: ['#c04848', '#480048'] },
  ];
  const gradientDirection = ref('to right');
  const gradientColors = ref(['#051937', '#a8eb12']);
  const generatedCSS = ref('');
  const generatedSVG = ref('');
  const pickrInstances = ref([]);
  const PickrContainers = ref<HTMLElement[]>([]);
  const outputFormat = ref('css');

const setPickrContainerRef = (el, index) => {
  if (el) {
    PickrContainers.value[index] = el;
  }  
}
const loadPickr = () => {
  return import('@simonwep/pickr').then(module => {
    Pickr = module.default;
    return import('@simonwep/pickr/dist/themes/classic.min.css');
  });
};
  
const createColorPicker = (container, color, index) => {
  if (pickrInstances.value[index]) {
    pickrInstances.value[index].destroyAndRemove();
  }
  const newContainer = document.createElement('div');
  container.appendChild(newContainer);

  const pickr = Pickr.create({
    el: newContainer,
    theme: 'classic',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
      ],      
    default: color,
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        clear: false,
        save: true
      }
    }
  });
  pickr.on('save', (color, instance) => {
    gradientColors.value[index] = color.toHEXA().toString();
    instance.hide();
  });
  pickrInstances.value[index] = pickr;
};

const updateColor = (event, index) => {
  const newColor = event.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
    gradientColors.value[index] = newColor;
  } else {
    gradientColors.value[index] = '#000000';
  }
};

const openPickr = (index) => {
  createColorPicker(PickrContainers.value[index], gradientColors.value[index], index)
  pickrInstances.value[index].show();
};
  
onMounted(() => {
  loadPickr().catch(error => {
    console.error('Failed to load Pickr:', error);
  });
});
  
const applyPreset = (preset) => {
  gradientColors.value = [...preset.colors];
};

const isPresetSelected = (preset) => {
  return JSON.stringify(preset.colors) === JSON.stringify(gradientColors.value);
};
const isDirectionSelected = (direction) => {
  if (gradientDirection.value === direction) {
    return "border: 2px solid white";
  }else {
    return "";
  }
}
//与父组件通信
const emit = defineEmits(['update-background']);
//生成颜色渐变
const generateGradient = () => {
  let type = 'linear-gradient';
  if (gradientDirection.value === 'circle') {
    type = 'radial-gradient';
  }
  //生成CSS代码
  const generatedColors = interpolateColors(gradientColors.value,5);
  const colorString = generatedColors.join(',');
  const gradientCSS = `background-image: ${type}(${gradientDirection.value}, ${colorString});`;
  generatedCSS.value = gradientCSS;
  // 生成SVG代码
  let svgGradientType = 'linearGradient';
  let gradientAttributes = `x1="0%" y1="0%" x2="100%" y2="0%"`;

  if (gradientDirection.value === 'circle') {
    svgGradientType = 'radialGradient';
    gradientAttributes = `cx="50%" cy="50%" r="50%" fx="50%" fy="50%"`;
  }
  const stops = generatedColors.map((color, index) => 
    `<stop offset="${(index / (generatedColors.length - 1)) * 100}%" stop-color="${color}" />`
  ).join('');
  const svgGradient = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <${svgGradientType} id="gradient" ${gradientAttributes}>
          ${stops}
        </${svgGradientType}>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradient)" />
    </svg>
  `;
  generatedSVG.value = svgGradient;
  emit('update-background', generatedCSS.value);
};
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功');
  }).catch(err => {
    console.error('复制失败:', err);
    ElMessage.error('复制失败');
  });
};
generateGradient();
</script>
<style scoped>
.gradient-tool {
  max-width: 600px;
  margin: 0px auto;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid transparent;
  border-radius: 15px;
}
.gradient-tool-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.settings-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.direction-selector {
  margin-bottom: 0px;
}
.preset-list {
  width: 100%;
  padding: 0 10px; /* 添加左右内边距 */
}
.preset-buttons {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  justify-content: flex-start; /* 改为左对齐 */
  min-width: max-content; /* 确保内容不会被压缩 */
}
:deep(.el-radio-button__inner){
  background-color: transparent;
  --el-radio-button-checked-bg-color: transparent;
  /* border-left: 1px solid rgba(220, 223, 230, 1); */
  border: 0px;
  box-shadow: 0px 0 0 0 #409eff !important;
}
.settings-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.custom-radio-button {
  background-color: transparent !important;
  margin-left: 10px !important;
}
.custom-radio-button :deep(.el-icon) {
  color: white;
  font-weight: bold;
}
.preset-selected {
  border: 2px solid white !important;
}
  .generated-css {
    margin-top: 10px;
  }
  .color-inputs {
  display: flex;
  justify-content: center;
  gap: 30px;
}
.color-input {
  width: 80px;
  height: 40px;
  border: none;
  border-radius: 8px;
  padding: 5px;
  text-align: center;
  color: white;
  font-weight: bold;
}
  :deep(.el-textarea__inner) {
    background-color: transparent;
    color: white;
  }
  :deep(.el-button--small){
    background-color: transparent;
    color: white;
  }
  :deep(.el-button+.el-button) {
    background-color: transparent;
    margin-left: 0px;
  }
  :deep(.el-scrollbar__view) {
    display: flex;
    justify-content: flex-start;
  }
  :deep(.el-scrollbar__wrap) {
    overflow-x: auto;
  }
  :deep(.el-scrollbar__bar.is-horizontal) {
    opacity: 1; /* 始终显示水平滚动条 */
  }
  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: 0px !important;
  }
  .code-area {
  position: relative;
  height: 150px; /* 设置固定高度 */
}

.code-area .el-button {
  position: absolute;
  right: 10px;
  top: 10px;
}

:deep(.custom-textarea) {
  height: 100%;
}

:deep(.custom-textarea .el-textarea__inner) {
  height: 100% !important;
  resize: none;
  border: none;
  background-color: transparent;
  color: white;
  padding-right: 20px; /* 为自定义滚动条留出空间 */
}

/* 隐藏原生滚动条 */
:deep(.custom-textarea .el-textarea__inner::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

/* 自定义滚动条样式 */
:deep(.custom-textarea .el-textarea__inner) {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:deep(.custom-textarea .el-textarea__inner::-webkit-scrollbar) {
  width: 6px;
}

:deep(.custom-textarea .el-textarea__inner::-webkit-scrollbar-thumb) {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

:deep(.custom-textarea .el-textarea__inner::-webkit-scrollbar-track) {
  background-color: transparent;
}
</style>
  