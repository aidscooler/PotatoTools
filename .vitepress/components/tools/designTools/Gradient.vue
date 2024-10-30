<template>
    <el-card class="gradient-tool">
      <div class="gradient-tool-container">
        <div class="preset-list">
          <h3>预设渐变</h3>
          <div class="preset-buttons">
            <el-button v-for="preset in presetGradients" :key="preset.name" @click="applyPreset(preset)" size="small">
              {{ preset.name }}
            </el-button>
          </div>
        </div>
        <div class="settings-area">
          <div class="direction-selector">
            <h4>渐变方向</h4>
            <el-radio-group v-model="gradientDirection">
              <el-radio-button v-for="direction in directions" :key="direction.value" :value="direction.value">
                <el-icon>
                  <component :is="direction.icon"></component>
                </el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="color-space-selector">
            <h4>颜色空间</h4>
            <el-radio-group v-model="colorSpace">
              <el-radio-button value="RGB">RGB</el-radio-button>
              <el-radio-button value="HSL">HSL</el-radio-button>
            </el-radio-group>
          </div>
          <div class="color-controls">
            <el-button @click="addColor" :disabled="gradientColors.length >= 5" size="small" type="primary" icon="el-icon-plus">
              添加颜色
            </el-button>
            <el-button @click="removeColor" :disabled="gradientColors.length <= 2" size="small" type="danger" icon="el-icon-delete">
              删除颜色
            </el-button>
          </div>        
          <div class="color-selector">
            <h3>渐变颜色</h3>
            <div class="color-pickers">
              <div v-for="(color, index) in gradientColors" :key="index" class="color-picker-wrapper">
                <div :ref="el => pickrContainers[index] = el" class="pickr-container"></div>
              </div>
            </div>
          </div>
          <div class="adjustment-options">
            <h3>调整选项</h3>
            <el-slider v-model="brightness" :min="0" :max="200" :step="1" label="亮度"></el-slider>
            <el-slider v-model="saturation" :min="0" :max="200" :step="1" label="饱和度"></el-slider>
          </div>
          <el-button @click="generateGradient" type="primary">生成渐变</el-button>
          <div v-if="generatedCSS" class="generated-css">
            <el-tabs v-model="outputFormat">
              <el-tab-pane label="CSS" name="css">
                <el-input type="textarea" :rows="3" v-model="generatedCSS" readonly></el-input>
              </el-tab-pane>
              <el-tab-pane label="SVG" name="svg">
                <el-input type="textarea" :rows="3" v-model="generatedSVG" readonly></el-input>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </el-card>
</template>
  
<script setup>
import chroma from 'chroma-js';
  let Pickr;
  
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
  
  const gradientDirection = ref('to right');
  const gradientColors = ref(['#051937', '#00bf72']);
  const generatedCSS = ref('');
  const generatedSVG = ref('');
  const pickrContainers = ref([]);
  const pickrInstances = ref([]);
const colorSpace = ref('RGB');
const brightness = ref(100);
const saturation = ref(100);
const outputFormat = ref('css');  
//颜色插值计算
const interpolateColors = (colors, steps) => {
  if (colors.length === 2) {
    // 对于两种颜色，使用简单的 lab 插值
    return chroma.scale(colors)
      .mode('hsl')
      .correctLightness()
      .colors(steps);
  } else {
    // 对于多于两种颜色，使用分段插值
    const result = [];
    const segmentSteps = Math.floor(steps / (colors.length - 1));
    
    for (let i = 0; i < colors.length - 1; i++) {
      const colorScale = chroma.scale([colors[i], colors[i + 1]])
        .mode('lab')
        .correctLightness();
      
      const segmentColors = colorScale.colors(segmentSteps);
      result.push(...(i === 0 ? segmentColors : segmentColors.slice(1)));
    }

    // 如果结果颜色数量不足，添加最后一个颜色
    while (result.length < steps) {
      result.push(colors[colors.length - 1]);
    }

    // 如果结果颜色数量过多，裁剪到指定步数
    return result.slice(0, steps);
  }
};
//HSL实现彩虹效果   
const generateRainbowEffect = (colors) => {
  const hueValues = colors.map(color => chroma(color).get('hsl.h'));
  const sortedHues = [...hueValues].sort((a, b) => a - b);
  const rainbowColors = [];
  
  for (let i = 0; i < sortedHues.length - 1; i++) {
    const start = sortedHues[i];
    const end = sortedHues[i + 1];
    const range = end - start > 180 ? end - start - 360 : end - start;
    const steps = Math.abs(Math.round(range / 30)) + 1;
    
    for (let j = 0; j < steps; j++) {
      const hue = (start + (range * j / steps) + 360) % 360;
      rainbowColors.push(chroma.hsl(hue, 1, 0.5));
    }
  }
  
  return interpolateColors(rainbowColors, 5);
};
const presetGradients = [
  { name: '日落', colors: ['#ff7e5f', '#feb47b'] },
  { name: '海洋', colors: ['#2193b0', '#6dd5ed'] },
  { name: '森林', colors: ['#11998e', '#38ef7d'] },
  { name: '紫罗兰', colors: ['#8e2de2', '#4a00e0'] },
  { name: '柑橘', colors: ['#fdc830', '#f37335'] },
  { name: '极光', colors: ['#00c6ff', '#0072ff'] },
  { name: '樱花', colors: ['#ffc3a0', '#ffafbd'] },
  { name: '薄荷', colors: ['#00b09b', '#96c93d'] },
  { name: '黄昏', colors: ['#ff9966', '#ff5e62'] },
  { name: '莓果', colors: ['#b91d73', '#f953c6'] },
  { name: '青柠', colors: ['#7ed56f', '#28b485'] },
  { name: '蓝莓', colors: ['#4e54c8', '#8f94fb'] },
  { name: '桃子', colors: ['#ffb347', '#ffcc33'] },
  { name: '薰衣草', colors: ['#7742b2', '#f180ff'] },
];
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
  
    pickr.on('save', (color) => {
      gradientColors.value[index] = color.toHEXA().toString();
    });
  
    pickrInstances.value[index] = pickr;
  };
  
  const initColorPickers = () => {
    pickrContainers.value.forEach((container, index) => {
      if (container) {
        createColorPicker(container, gradientColors.value[index], index);
      }
    });
  };
  
  onMounted(() => {
    loadPickr().then(() => {
      initColorPickers();
    }).catch(error => {
      console.error('Failed to load Pickr:', error);
    });
  });
  
watch(gradientColors, () => {
    nextTick(() => {
        initColorPickers();
    });
}, { deep: true });
  
  const addColor = () => {
    if (gradientColors.value.length < 5) {
      gradientColors.value.push('#051937');
    }
  };
  
  const removeColor = () => {
    if (gradientColors.value.length > 2) {
        const lastIndex = gradientColors.value.length - 1;
        gradientColors.value.pop();
        if (pickrInstances.value[lastIndex]) {
        pickrInstances.value[lastIndex].destroyAndRemove();
        }
        pickrInstances.value.pop();
        pickrContainers.value.pop();
    }
  };
  
  const applyPreset = (preset) => {
    gradientColors.value = [...preset.colors];
  };
  const adjustColors = (colors) => {
    return colors.map(color => {
        let adjusted = chroma(color);
        if (brightness.value !== 100) {
            adjusted = adjusted.brighten((brightness.value - 100) / 100);
        }
        if (saturation.value !== 100) {
            adjusted = adjusted.saturate((saturation.value - 100) / 100);
        }
        return adjusted.hex();
    });
  };  
//生成颜色渐变
const generateGradient = () => {
  let type = 'linear-gradient';
  if (gradientDirection.value === 'circle') {
    type = 'radial-gradient';
  }

  let adjustedColors = adjustColors(gradientColors.value);
  
  if (colorSpace.value === 'RGB') {
    adjustedColors = interpolateColors(adjustedColors, 5);
  } else if (colorSpace.value === 'HSL') {
    adjustedColors = generateRainbowEffect(adjustedColors);
  }

  let colorString = adjustedColors.map(color => {
    return colorSpace.value === 'HSL' ? chroma(color).css('hsl') : color;
  }).join(', ');

  const gradientCSS = `background-image: ${type}(${gradientDirection.value}, ${colorString});`;
  generatedCSS.value = gradientCSS;

  // 生成 SVG
  const svgGradient = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          ${adjustedColors.map((color, index) => 
            `<stop offset="${index / (adjustedColors.length - 1) * 100}%" stop-color="${color}" />`
          ).join('')}
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradient)" />
    </svg>
  `;
  generatedSVG.value = svgGradient;

  document.body.style.backgroundImage = `${type}(${gradientDirection.value}, ${colorString})`;
};
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
  gap: 10px;
}
.preset-list {
  width: 100px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}
.settings-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
  .color-pickers {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .pickr-container {
    width: 40px;
    height: 40px;
  }

  .generated-css {
    margin-top: 10px;
  }
  .pickr-container {
    width: 40px;
    height: 40px;
  }
  .adjustment-options {
    margin-top: 0px;
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
    color: white;  
    margin-left: 0px;
  }
</style>
  