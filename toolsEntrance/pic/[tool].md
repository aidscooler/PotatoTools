---
layout: page
footer: false
---
<!-- - package name: {{ $params.name }} -->
<!-- - version: {{ $params.language }} -->
<script setup>
import { useData } from 'vitepress'
import { ref } from 'vue'

// params 是一个 Vue ref
const { params } = useData()
//console.log(params.value);
//console.log(params.value.name);

const id = ref("");
const path = ref("");

id.value = params.value.tool;
path.value = '../components/tools/picTools/' + params.value.tool;
//console.log(toolPath.value);
</script>

<ToolsEntranceV :id="id" :toolPath="path"></ToolsEntranceV>