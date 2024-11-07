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

function genericGradient(): string[] {
    const L_THRESHOLD = 60
    const C_THRESHOLD = 60
    const H_RANGES = [[200, 260]] // 示例范围，需要根据实际情况调整
    const C_SPECIAL_THRESHOLD = 80
    const L_SPECIAL_THRESHOLD = 30    
    let colors = [];
    colors[0] = selectedColor.value;
    colors[1] = '#F9F871'

    const rgb = [parseInt(selectedColor.value.slice(1, 3), 16), parseInt(selectedColor.value.slice(3, 5), 16), parseInt(selectedColor.value.slice(5, 7), 16)] as RGB;
    const lch = rgbToLch(rgb);
    const [L, C, H] = lch
    console.log(`L: ${L}, C: ${C}, H: ${H}`); // 调试信息
    if (L > L_THRESHOLD || C > C_THRESHOLD) {
        let inRange = false;
        for (const [start, end] of H_RANGES) {
            if (H >= start && H <= end) {
                colors[1] = '#2F4858'
                inRange = true;
                break;
            }
        }
        if (!inRange) {
            colors[1] = '#F9F871'
        }        
    } else {
        if (C > C_SPECIAL_THRESHOLD && L < L_SPECIAL_THRESHOLD) {
            colors[1] = '#F9F871'
        } else {
            colors[1] = '#2F4858'
        }
    }    
    colors[1] = '#F9F871'
    console.log(`Selected end color: ${colors[1]}`); // 调试信息
    const generatedColors = interpolateColors(colors,6);
    return generatedColors;
}

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
  