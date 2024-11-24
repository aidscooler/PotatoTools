<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="handleLanguageChange"
    class="language-select"
    size="default"
  >
    <el-option
      v-for="(value, key) in LANGUAGES"
      :key="key"
      :label="titleCase(value)"
      :value="key"
    />
  </el-select>
</template>

<script setup lang="ts">
// 定义语言列表
const LANGUAGES = {
  en: "english",
  zh: "chinese",
  de: "german",
  es: "spanish/castilian",
  ru: "russian",
  ko: "korean",
  fr: "french",
  ja: "japanese",
  pt: "portuguese",
  tr: "turkish",
  pl: "polish",
  ca: "catalan/valencian",
  nl: "dutch/flemish",
  ar: "arabic",
  sv: "swedish",
  it: "italian",
  id: "indonesian",
  hi: "hindi",
  fi: "finnish",
  vi: "vietnamese",
  he: "hebrew",
  uk: "ukrainian",
  el: "greek",
  ms: "malay",
  cs: "czech",
  ro: "romanian/moldavian/moldovan",
  da: "danish",
  hu: "hungarian",
  ta: "tamil",
  no: "norwegian",
  th: "thai",
  ur: "urdu",
  hr: "croatian",
  bg: "bulgarian",
  lt: "lithuanian",
  la: "latin",
  mi: "maori",
  ml: "malayalam",
  cy: "welsh",
  sk: "slovak",
  te: "telugu",
  fa: "persian",
  lv: "latvian",
  bn: "bengali",
  sr: "serbian",
  az: "azerbaijani",
  sl: "slovenian",
  kn: "kannada",
  et: "estonian",
  mk: "macedonian",
  br: "breton",
  eu: "basque",
  is: "icelandic",
  hy: "armenian",
  ne: "nepali",
  mn: "mongolian",
  bs: "bosnian",
  kk: "kazakh",
  sq: "albanian",
  sw: "swahili",
  gl: "galician",
  mr: "marathi",
  pa: "punjabi/panjabi",
  si: "sinhala/sinhalese",
  km: "khmer",
  sn: "shona",
  yo: "yoruba",
  so: "somali",
  af: "afrikaans",
  oc: "occitan",
  ka: "georgian",
  be: "belarusian",
  tg: "tajik",
  sd: "sindhi",
  gu: "gujarati",
  am: "amharic",
  yi: "yiddish",
  lo: "lao",
  uz: "uzbek",
  fo: "faroese",
  ht: "haitian creole/haitian",
  ps: "pashto/pushto",
  tk: "turkmen",
  nn: "nynorsk",
  mt: "maltese",
  sa: "sanskrit",
  lb: "luxembourgish/letzeburgesch",
  my: "myanmar/burmese",
  bo: "tibetan",
  tl: "tagalog",
  mg: "malagasy",
  as: "assamese",
  tt: "tatar",
  haw: "hawaiian",
  ln: "lingala",
  ha: "hausa",
  ba: "bashkir",
  jw: "javanese",
  su: "sundanese",
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 转换标题大小写的工具函数
const titleCase = (str: string) => {
  str = str.toLowerCase()
  return (str.match(/\w+.?/g) || [])
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// 处理选择变化
const handleLanguageChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.language-select {
  width: 140px;
}
</style>