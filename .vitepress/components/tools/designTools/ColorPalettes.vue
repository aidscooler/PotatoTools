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
import chroma from 'chroma-js';
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
  const lch = chroma(selectedColor.value).lch();
  const complementHue = (lch[2] + 180) % 360;
  const complementColor = chroma.lch(lch[0], lch[1], complementHue).hex();
  console.log('complementColor: ' + complementColor);
  let colors = [];
  colors[0] = selectedColor.value;
  colors[1] = selectEndColor(selectedColor.value);

  //console.log(`Selected end color: ${colors[1]}`); // 调试信息
  testcolor.forEach((color,index) => {
    const endcolor = selectEndColor(color[0]);
    if (endcolor.toLowerCase() !== color[1]) {
      console.log('start color: ' + color[0] + ' should match ' + color[1]);
    }
  }) 
  //Matching gradient test
  testComplementColors(testData);
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
function selectEndColor(color: string): string {
  //预设两种终止颜色，'#2F4858' '#F9F871' 。选择色差较大的进行渐变
  //黑白灰，选择 '#F9F871'
  //console.log(color);
  const lch = chroma(color).lch();
  // const deltaE1 = chroma.deltaE(color,'#2F4858');
  // const deltaE2 = chroma.deltaE(color,'#F9F871');
  // const contrast1 = chroma.contrast(color,'#2F4858');
  // const contrast2 = chroma.contrast(color,'#F9F871');  
  const distance1 = chroma.distance(color,'#2F4858','lch');
  const distance2 = chroma.distance(color,'#F9F871','lch');   
  // console.log('deltaE1: ' + deltaE1 + ' | deltaE2: ' + deltaE2)
  // console.log('contrast1: ' + contrast1 + ' | contrast2: ' + contrast2)
  //console.log('distance1: ' + distance1 + ' | distance2: ' + distance2)
  //const chromaThreshold = 10; //定义灰色系颜色阙值
  // console.log(color + ' : ' + lch)
  if (Number.isNaN(lch[2])) {//黑白灰是没有色相(h)的
    //console.log(color + ' : ' + lch)
    return '#F9F871'
  } else {
    if (distance1 > distance2) {
      return '#2F4858'
    }else{
      return '#F9F871'
    }
  }
}
//end
//shades 主题
function shades() : string[] {
  let colors;
  const lch = chroma(selectedColor.value).lch();
  if (lch[0] > 50) {
    colors = chroma.scale([selectedColor.value, 'black']).mode('lch').colors(6);
  }else {
    colors = chroma.scale([selectedColor.value, 'white']).mode('lch').colors(6);
  }
  colors.pop();
  return colors;
}

const generatePalettes = () => {
  const genericGradientColors = genericGradient();
  const shadesColors = shades();
  palettes.value = {
    '通用渐变': genericGradientColors,
    '深浅变化' : shadesColors,
    // 'Matching Gradient': ['#FF00FF', '#FFFF00', '#00FFFF', '#FF8000', '#0080FF'],
    // 'Monochromatic': ['#880000', '#AA0000', '#CC0000', '#EE0000', '#FF0000'],
    // 'Analogous': ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00'],
    // 'Complementary': ['#FF0000', '#00FFFF', '#FF8080', '#80FFFF', '#FF4040'],
    // 'Triadic': ['#FF0000', '#00FF00', '#0000FF', '#FFAAAA', '#AAFFAA'],
    // 'Tetradic': ['#FF0000', '#FFFF00', '#00FFFF', '#FF00FF', '#FF8080'],
    // 'Split Complementary': ['#FF0000', '#00FF80', '#0080FF', '#FF8080', '#80FFC0'],
    // 'Shades': ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
  }
  showPalettes.value = true
}
//互补色测试
function getComplementColor(color) {
    // 获取颜色的LCH值
    let lch = chroma(color).lch();
    
    // 计算互补色的色相
    let complementHue = (lch[2] + 180) % 360;
    
    // 调整亮度和色度
    let complementL = lch[0] * 0.7; // 降低亮度
    let complementC = lch[1] * 0.8; // 降低色度
    
    // 生成互补色并转换为十六进制格式
    return chroma.lch(complementL, complementC, complementHue).hex();
}

function testComplementColors(testData) {
    let allTestsPassed = true;
    
    testData.forEach(([startColor, expectedComplement]) => {
        let computedComplement = getComplementColor(startColor);
        
        // if (computedComplement !== expectedComplement) {
        //     console.log(`测试失败：起始颜色 ${startColor}，预期互补色 ${expectedComplement} : ${chroma(expectedComplement).lch()}，实际互补色 ${computedComplement} : ${chroma(computedComplement).lch()}`);
        //     allTestsPassed = false;
        // }
        const lch = chroma(startColor).lch();
        const elch = chroma(expectedComplement).lch();

        // 计算对比色的色调角
        // 这里我们选择相隔 120°
        const contrastHue = (lch[2] + 120) % 360;
        // 生成对比色
        //const contrastColor = chroma.lch(lch[0], lch[1], contrastHue);
        let hdiff = lch[2] - elch[2]
        if (hdiff < 0) {
          hdiff += 360;
        }
        console.log(`起始颜色 ${startColor} , 终止颜色 ${expectedComplement}, distance: ${chroma.contrast(startColor,expectedComplement)} l差异: ${lch[0] - elch[0]} , c差异: ${lch[1] - elch[1]} , h差异: ${hdiff}`);
    });
    
    if (allTestsPassed) {
        console.log('所有测试通过！');
    }
}

const testData = [
    ['#845ec2', '#008f7a'],
    ['#ff9671', '#1b6299'],
    ['#ffc75f', '#006f61'],
    ['#f9f871', '#007160'],
    ['#2f4858', '#da9bb7'],
    ['#00c9a7', '#68558d'],
    ['#c34a36', '#008ea8'],
    ['#b0a8b9', '#23695d'],
    ['#4b4453', '#72b8aa'],
    ['#ff8066', '#006e8a'],
    ['#d65db1', '#007660'],
    ['#6f8faf', '#934b71'],
    ['#8b4513', '#00b297'],
    ['#ffd700', '#00765d'],
    ['#98ff98', '#0063af'],
    ['#ffffff', '#43655a'],
    ['#fffafa', '#386664'],
    ['#000000', '#a3cfcd'],
    ['#0a0a0a', '#a9cec2'],
    ['#ff00ff', '#007b83'],
    ['#00ffff', '#924660'],
    ['#7fff00', '#007ada'],
    ['#808080', '#53756a'],
    ['#a9a9a9', '#43655a'],
    ['#d3d3d3', '#43655a'],
    ['#e6e6fa', '#7e506c'],
    ['#f0fff0', '#4c5e85'],
    ['#fff0f5', '#2b6863'],
    ['#cc3300', '#008bf6'],
    ['#ff6600', '#00765d'],
    ['#99cc00', '#007683'],
    ['#8b4513', '#00b297'],
    ['#d2691e', '#007c68'],
    ['#cd853f', '#006d5f'],
    ['#ffd700', '#00765d'],
    ['#c0c0c0', '#43655a'],
    ['#b87333', '#007a6c'],
    ['#ff1493', '#00817d'],
    ['#00ff00', '#0076ff'],
    ['#ff00ff', '#007b83'],
    ['#4b0082', '#00e1ca'],
    ['#9932cc', '#00a493'],
    ['#20b2aa', '#a33271'],
    ['#2f4858', '#da9bb7'],
    ['#f9f871', '#007160'],
    ['#2f4868', '#e293bd'],
    ['#2e4858', '#db9bb7'],
    ['#f9f881', '#006f60'],
    ['#f8f871', '#007160'],
    ['#8a2be2', '#00ab90'],
    ['#9932cc', '#00a493'],
    ['#c71585', '#009c8a'],
    ['#ff69b4', '#007166'],
    ['#ffb6c1', '#006f61'],
    ['#ffc0cb', '#006e5d'],
    ['#1e90ff', '#9d3b77'],
    ['#4169e1', '#c3549c'],
    ['#87ceeb', '#974068'],
    ['#32cd32', '#006ddb'],
    ['#90ee90', '#0062a7'],
    ['#006400', '#00a5e8'],
    ['#ffd700', '#00765d'],
    ['#ffff00', '#007861'],
    ['#f0e68c', '#007460'],
    ['#ff4500', '#006fee'],
    ['#ff6347', '#00729e'],
    ['#dc143c', '#0093d5'],
    ['#00ffff', '#924660'],
    ['#e0ffff', '#854e60'],
    ['#20b2aa', '#a33271'],
    ['#808080', '#53756a'],
    ['#a9a9a9', '#43655a'],
    ['#d3d3d3', '#43655a'],
    ['#ffffff', '#43655a'],
    ['#000000', '#a3cfcd'],
    ['#f0f8ff', '#7a5365']
];

onMounted(() => {
  loadPickr().catch(error => {
    console.error('Failed to load Pickr:', error);
  });
});

// const ll = chroma.scale(['#845ec2','#008f7a']).mode('lch').gamma(1).colors(6);//interpolateColors(['#845ec2','#008f7a'], 6);
// console.log(ll);
</script>
  
<style scoped>
.color-tool {
  max-width: 1200px;
  margin: 0 auto;
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
  