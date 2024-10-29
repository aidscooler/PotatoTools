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
const toolName = ref("");
const folder = ref("designTools");

id.value = params.value.tool;
toolName.value = params.value.tool.replace(".vue","");
//path.value = '../components/tools/devTools/' + params.value.tool;
//console.log(toolPath.value);
</script>

<ToolsEntranceV :id="id" :folder="folder" :toolName="toolName"></ToolsEntranceV>