<template>
    <div class="color-tool">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>配色工具</span>
          </div>
        </template>
        <div class="color-input-container">
          <div class="color-input-wrapper">
            <input
              :value="selectedColor"
              @input="updateColor($event)"
              @focus="openPickr()"
              :style="{ backgroundColor: selectedColor }"
              class="color-input"
            />
            <div ref="pikrContainer" style="visibility: hidden;position: absolute;"></div>
          </div>
          <el-button type="primary" @click="generatePalettes">自动配色</el-button>
        </div>
        <div v-if="showPalettes" class="palettes-container">
          <div v-for="(palette, name) in palettes" :key="name" class="palette">
            <h3>{{ name }}</h3>
            <div class="color-squares">
              <div v-for="(color, index) in palette" :key="index" class="color-square-wrapper">
                <div
                  class="color-square"
                  :style="{ backgroundColor: color }"
                ></div>
                <span class="color-code">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
</template>

<script setup lang="ts">
import {rgbToLch,interpolateColors,RGB,LCH} from '../../../utils.mjs';
let Pickr;
const pikrContainer = ref<HTMLElement>();
const pickrInstance = ref(null);
const selectedColor = ref('#845EC2')
const showPalettes = ref(false)
const palettes = ref({})

const loadPickr = () => {
  return import('@simonwep/pickr').then(module => {
    Pickr = module.default;
    return import('@simonwep/pickr/dist/themes/classic.min.css');
  });
};

const createColorPicker = (container, color) => {
  if(pickrInstance.value) {
    pickrInstance.value.destroyAndRemove();
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
    selectedColor.value = color.toHEXA().toString()
    instance.hide();
  });
  pickrInstance.value = pickr;
};

const updateColor = (event) => {
  const newColor = event.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
    selectedColor.value = newColor;
  } else {
    selectedColor.value = '#000000';
  }
};

const openPickr = () => {
  createColorPicker(pikrContainer.value, selectedColor.value)
  pickrInstance.value.show();
};
//generic gradient 主题
function genericGradient(): string[] {
  let colors = [];
  colors[0] = selectedColor.value;

  // 特殊情况处理保持不变
  if (selectedColor.value.toUpperCase() === '#F9F871') {
    colors[1] = '#2F4858';
    return interpolateColors(colors, 6);
  } else if (selectedColor.value.toUpperCase() === '#2F4858') {
    colors[1] = '#F9F871';
    return interpolateColors(colors, 6);
  }

  const rgb = [parseInt(selectedColor.value.slice(1, 3), 16), parseInt(selectedColor.value.slice(3, 5), 16), parseInt(selectedColor.value.slice(5, 7), 16)] as RGB;
  const lch = rgbToLch(rgb);
  const [l, c, h] = lch;

  // 新的终止颜色选择逻辑
  colors[1] = selectEndColor(l, c, h);

  console.log(`Selected end color: ${colors[1]}`); // 调试信息
  testcolor.forEach((color,index) => {
    
    const rgb = [parseInt(color[0].slice(1, 3), 16), parseInt(color[0].slice(3, 5), 16), parseInt(color[0].slice(5, 7), 16)] as RGB;
    const lch = rgbToLch(rgb);
    const [l, c, h] = lch;
    //console.log(color[0] + ', ' + color[1] + ': ' + lch);
    const endcolor = selectEndColor(l, c, h);
    if (endcolor.toLowerCase() !== color[1]) {
      console.log('start color: ' + color[0] + ' should match ' + color[1]);
    }
  }) 
  return interpolateColors(colors, 6);
}
const testcolor=[
  ['#845EC2','#f9f871'],
  ['#FF9671','#2f4858'], 
  ['#FFC75F','#2f4858'],
  ['#F9F871','#2f4858'],
  ['#2F4858','#f9f871'],
  ['#00C9A7','#2f4858'],
  ['#C34A36','#2f4858'],
  ['#B0A8B9','#f9f871'],
  ['#4B4453','#f9f871'],
  ['#FF8066','#2f4858'],
  ['#D65DB1','#f9f871'],
  ['#6F8FAF','#f9f871'],
  ['#8B4513','#2f4858'],
  ['#FFD700','#2f4858'],
  ['#98FF98','#2f4858'],
  ['#FFFFFF','#f9f871'],
  ['#FFFAFA','#2f4858'],
  ['#000000','#f9f871'],
  ['#0A0A0A','#f9f871'],
  ['#FF00FF','#f9f871'],
  ['#00FFFF','#f9f871'],
  ['#7FFF00','#2f4858'],
  ['#808080','#f9f871'],
  ['#A9A9A9','#f9f871'],
  ['#D3D3D3','#f9f871'],
  ['#E6E6FA','#f9f871'],
  ['#F0FFF0','#2f4858'],
  ['#FFF0F5','#f9f871'],
  ['#CC3300','#2f4858'],
  ['#FF6600','#2f4858'],
  ['#99CC00','#2f4858'],
  ['#8B4513','#2f4858'],
  ['#D2691E','#2f4858'],
  ['#CD853F','#2f4858'],
  ['#FFD700','#2f4858'],
  ['#C0C0C0','#f9f871'],
  ['#B87333','#2f4858'],
  ['#FF1493','#f9f871'],
  ['#00FF00','#2f4858'],
  ['#FF00FF','#f9f871'],
  ['#4B0082','#f9f871'],
  ['#9932CC','#f9f871'], 
  ['#20B2AA','#f9f871'],
  ['#2F4858','#f9f871'],
  ['#F9F871','#2f4858'],
  ['#2F4868','#f9f871'],
  ['#2E4858','#f9f871'],
  ['#F9F881','#2f4858'],
  ['#F8F871','#2f4858'],
  ['#8A2BE2','#f9f871'],
  ['#9932CC','#f9f871'],
  ['#C71585','#f9f871'],
  ['#FF69B4','#f9f871'],
  ['#FFB6C1','#2f4858'],
  ['#FFC0CB','#2f4858'],
  ['#1E90FF','#f9f871'],
  ['#4169E1','#f9f871'],
  ['#87CEEB','#f9f871'],
  ['#32CD32','#2f4858'],
  ['#90EE90','#2f4858'],
  ['#006400','#2f4858'],
  ['#FFD700','#2f4858'],
  ['#FFFF00','#2f4858'],
  ['#F0E68C','#2f4858'],
  ['#FF4500','#2f4858'],
  ['#FF6347','#2f4858'],
  ['#DC143C','#2f4858'],
  ['#00FFFF','#f9f871'],
  ['#E0FFFF','#f9f871'],
  ['#20B2AA','#f9f871'],
  ['#808080','#f9f871'],
  ['#A9A9A9','#f9f871'],
  ['#D3D3D3','#f9f871'],
  ['#FFFFFF','#f9f871'],
  ['#000000','#f9f871'],
  ['#F0F8FF','#f9f871']
]
function selectEndColor(lightness: number, chroma: number, hue: number): string {
  // 特殊颜色处理
  if (lightness > 97 || lightness < 3) return '#F9F871'; // 接近纯白或纯黑
  if (lightness > 95 && chroma < 10) return '#2F4858'; // 非常浅且低饱和度的颜色

  // 灰色系处理
  if (chroma < 10) {
    return '#F9F871'; // 所有灰色系都匹配 '#F9F871'
  }

  // 紫色系处理（包括深紫色）
  if (hue >= 270 && hue <= 320) {
    return '#F9F871'; // 所有紫色系都匹配 '#F9F871'
  }

  // 粉红色系处理
  if ((hue > 320 && hue <= 335) || hue <= 10) {
    return '#F9F871';
  }

  // 蓝色系处理
  if (hue > 180 && hue < 270) {
    return lightness < 60 ? '#F9F871' : '#2F4858';
  }

  // 绿色系处理
  if (hue >= 90 && hue <= 180) {
    return lightness > 90 ? '#2F4858' : '#F9F871';
  }

  // 黄色系处理
  if (hue > 50 && hue < 90) {
    return '#2F4858';
  }

  // 橙色和红色系处理
  if (hue >= 10 && hue <= 50) {
    return '#2F4858';
  }

  // 青色系处理
  if (hue > 170 && hue <= 190) {
    return '#F9F871';
  }

  // 特殊颜色调整
  if (hue >= 90 && hue <= 180 && lightness > 80) {
    return '#2F4858';
  }

  // 默认规则
  return lightness > 80 ? '#2F4858' : '#F9F871';
}

//end

const generatePalettes = () => {
  const genericGradientColors = genericGradient();
  palettes.value = {
    'Generic Gradient': genericGradientColors,
    'Matching Gradient': ['#FF00FF', '#FFFF00', '#00FFFF', '#FF8000', '#0080FF'],
    'Monochromatic': ['#880000', '#AA0000', '#CC0000', '#EE0000', '#FF0000'],
    'Analogous': ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00'],
    'Complementary': ['#FF0000', '#00FFFF', '#FF8080', '#80FFFF', '#FF4040'],
    'Triadic': ['#FF0000', '#00FF00', '#0000FF', '#FFAAAA', '#AAFFAA'],
    'Tetradic': ['#FF0000', '#FFFF00', '#00FFFF', '#FF00FF', '#FF8080'],
    'Split Complementary': ['#FF0000', '#00FF80', '#0080FF', '#FF8080', '#80FFC0'],
    'Shades': ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
  }
  showPalettes.value = true
}

onMounted(() => {
  loadPickr().catch(error => {
    console.error('Failed to load Pickr:', error);
  });
});

</script>
  
<style scoped>
.color-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.color-input-wrapper {
  position: relative;
}

.color-input {
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.palettes-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.palette h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.color-squares {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.color-square-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 115px;
}

.color-square {
  width: 115px;
  height: 115px;
  border-radius: 8px;
}

.color-code {
  margin-top: 5px;
  font-size: 12px;
}
  </style>
  