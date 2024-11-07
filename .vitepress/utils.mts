import fs from 'fs'

//读取json配置文件的全部内容
export function readJSON(filepath) {
    try {
      const data = fs.readFileSync(filepath,{ encoding : 'utf-8'});
      //console.log(data);
      const obj = JSON.parse(data);
      //console.log(obj);
      return obj;
    }catch(err) {
      console.error('Error reading or parsing file:', err);
      return undefined;
    }
}

//生成sidebar内容，目前未做递归遍历子文件夹
export function  genSidebar(path) {
    let sidebarData = readJSON(path);
    for(var key in sidebarData) {
        for (var i = 0; i < sidebarData[key].length; i++) {
            sidebarData[key][i].items = fs.readdirSync('.' + key)
                .map((itemName) => {
                        const file = fs.readFileSync('.' + key + itemName, { encoding: 'utf-8'} );
                        const title = file.split('\n')[0];//文章第一行要写标题，这里才能读取出来
                        //console.log(title.split('#')[1]); //去掉 #
                        return { text: title.split('#')[1], link: key + itemName.split('.')[0] }
                })
        } 
    }
    //console.log(JSON.stringify(sidebarData));
    return sidebarData;
}

//获取文件夹下的子目录，文件名
export function filepaths(path) {
  return fs
    .readdirSync(path)
    .map((tool) => {
      //console.log(game);
      return { params: { tool: tool } }
    });
}

//官网说明的动态路由生成方法 
// export function filepaths(path) {
//     return fs
//       .readdirSync(path)
//       .map((game) => {
//         //console.log(game);
//         return { params: { game: game } }
//     });
// }
//色彩渐变相关方法
export type RGB = [number, number, number];
export type LCH = [number, number, number];
  // RGB 到 LCH 的转换函数
export function rgbToLch(rgb: RGB) {
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
export function lchToRgb(lch: LCH){
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
export function interpolateLCH(lch1: LCH, lch2: LCH, t: number){
  let [l1, c1, h1] = lch1;
  let [l2, c2, h2] = lch2;
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
export function rgbToHex(rgb: RGB){
  return '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
};

//颜色插值计算
export function interpolateColors(colors: string[], steps: number){
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


