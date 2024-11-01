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
                class="custom-radio-button">
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
                  @focus="openPickr($event, index)"
                  :style="{ backgroundColor: color }"
                  class="color-input"
                />
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
  type LCH = [number, number, number];
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
  //const pickrContainers = ref([]);
  const pickrInstances = ref([]);
  const outputFormat = ref('css');

  // RGB 到 LCH 的转换函数
  const rgbToLch = (rgb: RGB): LCH => {
    let [r, g, b] = rgb.map(x => x / 255);
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    // RGB to XYZ
    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    // XYZ to LAB
    x /= 0.95047; y /= 1.00000; z /= 1.08883;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    let l = (116 * y) - 16;
    let a = 500 * (x - y);
    let bb = 200 * (y - z);
    // LAB to LCH
    let c = Math.sqrt(a * a + bb * bb);
    let h = Math.atan2(bb, a) * 180 / Math.PI;
    if (h < 0) h += 360;

    return [l, c, h];
  };

  // LCH 到 RGB 的转换函数
  const lchToRgb = (lch: LCH): RGB => {
    let [l, c, h] = lch;
    h = h * Math.PI / 180;
    let a = c * Math.cos(h);
    let b = c * Math.sin(h);
    // LAB to XYZ
    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;
    y = Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16/116) / 7.787;
    x = Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16/116) / 7.787;
    z = Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16/116) / 7.787;
    x *= 0.95047; y *= 1.00000; z *= 1.08883;
    // XYZ to RGB
    let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
    let bb = x *  0.0557 + y * -0.2040 + z *  1.0570;
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    bb = bb > 0.0031308 ? 1.055 * Math.pow(bb, 1/2.4) - 0.055 : 12.92 * bb;

    return [
      Math.max(0, Math.min(1, r)) * 255,
      Math.max(0, Math.min(1, g)) * 255,
      Math.max(0, Math.min(1, bb)) * 255
    ];
  };
// 插值函数 公式 Ci = (C2 - C1) * i/(n - 1) Ci表示第几个插值，C2为结束颜色 C1为起始颜色 n 表示几个插值点(包括起始和结束颜色)
const interpolateLCH = (lch1: LCH, lch2: LCH, t: number): LCH => {
  let [l1, c1, h1] = lch1;
  let [l2, c2, h2] = lch2;
  //const t = step;// / (totalSteps - 1);
  // 亮度插值：
  const l = l1 + (l2 - l1) * t;//Math.pow(t, 0.85);移除缓动
  // 色度插值：
  const c = c1 + (c2 - c1) * t;//Math.pow(t, 1.15);
  // 色相插值：处理循环性
  let h;
  if (Math.abs(h2 - h1) > 180) {
    if (h2 > h1) {
      h1 += 360;
    } else {
      h2 += 360;
    }
  }
  h = (h1 + (h2 - h1) * t) % 360;

  return [l, c, h];
};
const rgbToHex = (rgb: RGB): string => {
  return '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
};
//颜色插值计算
const interpolateColors = (colors: string[], steps: number): string[] => {
  const result: string[] = [];
  for (let i = 0; i < colors.length - 1; i++) {
    const color1 = colors[i];
    const color2 = colors[i + 1];

    const rgb1 = [parseInt(color1.slice(1, 3), 16), parseInt(color1.slice(3, 5), 16), parseInt(color1.slice(5, 7), 16)] as RGB;
    const rgb2 = [parseInt(color2.slice(1, 3), 16), parseInt(color2.slice(3, 5), 16), parseInt(color2.slice(5, 7), 16)] as RGB;

    const lch1 = rgbToLch(rgb1);
    const lch2 = rgbToLch(rgb2);

    for (let step = 0; step < steps; step++) {
      const t = step / (steps - 1);
      const interpolatedLCH = interpolateLCH(lch1, lch2, t);
      const interpolatedRGB = lchToRgb(interpolatedLCH);
      const interpolatedColor = rgbToHex(interpolatedRGB);
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

const updateColor = (event, index) => {
  const newColor = event.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
    gradientColors.value[index] = newColor;
  } else {
    gradientColors.value[index] = '#000000';
  }
};

const openPickr = (event, index) => {
  const container = event.target;
  createColorPicker(container, gradientColors.value[index], index);
  pickrInstances.value[index].show();
};
  
// const initColorPickers = () => {
//   pickrContainers.value.forEach((container, index) => {
//     if (container) {
//       createColorPicker(container, gradientColors.value[index], index);
//     }
//   });
// };
  
onMounted(() => {
  loadPickr().catch(error => {
    console.error('Failed to load Pickr:', error);
  });
});
  
// watch(gradientColors, () => {
//     nextTick(() => {
//         initColorPickers();
//     });
// }, { deep: true });
const applyPreset = (preset) => {
  gradientColors.value = [...preset.colors];
};

const isPresetSelected = (preset) => {
  return JSON.stringify(preset.colors) === JSON.stringify(gradientColors.value);
};
//生成颜色渐变
const generateGradient = () => {
  let type = 'linear-gradient';
  if (gradientDirection.value === 'circle') {
    type = 'radial-gradient';
  }
  const generatedColors = interpolateColors(gradientColors.value,5);
  //console.log("Generated colors:", generatedColors);
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
  border-left: 1px solid rgba(220, 223, 230, 1);
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
  gap: 10px;
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
</style>
  