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
  
<script setup lang="ts">
type RGB = [number, number, number];
type HSL = [number, number, number];
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
  const gradientDirection = ref('to right');
  const gradientColors = ref(['#051937', '#00bf72']);
  const generatedCSS = ref('');
  const generatedSVG = ref('');
  const pickrContainers = ref([]);
  const pickrInstances = ref([]);
  const outputFormat = ref('css');
//RGB 转 hsl
const rgbToHsl = (rgb: RGB): HSL => {
  let [r, g, b] = rgb.map(x => x / 255);
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100]; // 不进行四舍五入
};
//hsl 转 RGB
const hslToRgb = (hsl: HSL): RGB => {
  let [h, s, l] = hsl;
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255]; // 不进行四舍五入
};
/*
* 插值计算
* 计算公式  Ci = C1 + (C2 - C1) * i / (n - 1)
​* i 代表第几个插值点, C1代表起始颜色，C2代表终止颜色,n 为插值点数，包含起始颜色 比如插值点数为5,则在起始颜色中间插入3个插值
*/

const interpolateHSL = (hsl1: HSL, hsl2: HSL, step: number, totalSteps: number): HSL => {
  let [h1, s1, l1] = hsl1;
  let [h2, s2, l2] = hsl2;

  // 改进色相插值
  let hue;
  const hueDiff = h2 - h1;
  if (Math.abs(hueDiff) > 180) {
    if (h2 > h1) {
      h1 += 360;
    } else {
      h2 += 360;
    }
  }
  hue = (h1 + (h2 - h1) * (step / (totalSteps - 1))) % 360;

  // 线性插值饱和度和亮度
  const sat = s1 + (s2 - s1) * (step / (totalSteps - 1));
  const light = l1 + (l2 - l1) * (step / (totalSteps - 1));

  return [hue, sat, light]; // 不进行四舍五入
};
//颜色插值计算
//先将RGB转为hsl，进行线性插值，然后转回RGB
const interpolateColors = (colors: string[], steps: number): string[] => {
  const result: string[] = [];

  for (let i = 0; i < colors.length - 1; i++) {
    const color1 = colors[i];
    const color2 = colors[i + 1];

    const rgb1 = [parseInt(color1.slice(1, 3), 16), parseInt(color1.slice(3, 5), 16), parseInt(color1.slice(5, 7), 16)] as RGB;
    const rgb2 = [parseInt(color2.slice(1, 3), 16), parseInt(color2.slice(3, 5), 16), parseInt(color2.slice(5, 7), 16)] as RGB;

    const hsl1 = rgbToHsl(rgb1);
    const hsl2 = rgbToHsl(rgb2);
    console.log(`Color ${i+1}: RGB ${rgb1}, HSL ${hsl1}`);
    console.log(`Color ${i+2}: RGB ${rgb2}, HSL ${hsl2}`);

    for (let step = 0; step < steps; step++) {
      const interpolatedHSL = interpolateHSL(hsl1, hsl2, step, steps);
      const interpolatedRGB = hslToRgb(interpolatedHSL);
      const interpolatedColor = '#' + interpolatedRGB.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
      console.log(`Step ${step+1}: HSL ${interpolatedHSL}, RGB ${interpolatedRGB}, Color ${interpolatedColor}`);
      result.push(interpolatedColor);
    }
  }

  return result;
};

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
//生成颜色渐变
const generateGradient = () => {
  let type = 'linear-gradient';
  if (gradientDirection.value === 'circle') {
    type = 'radial-gradient';
  }

  const generatedColors = interpolateColors(gradientColors.value,5);
  console.log("Generated colors:", generatedColors);
  const colorString = generatedColors.join(',');

  const gradientCSS = `background-image: ${type}(${gradientDirection.value}, ${colorString});`;
  generatedCSS.value = gradientCSS;

  // 生成 SVG
  // const svgGradient = `
  //   <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  //     <defs>
  //       <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
  //         ${adjustedColors.map((color, index) => 
  //           `<stop offset="${index / (adjustedColors.length - 1) * 100}%" stop-color="${color}" />`
  //         ).join('')}
  //       </linearGradient>
  //     </defs>
  //     <rect width="100%" height="100%" fill="url(#gradient)" />
  //   </svg>
  // `;
  // generatedSVG.value = svgGradient;

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
  