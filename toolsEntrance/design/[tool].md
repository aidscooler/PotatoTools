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
const showLeftads = ref(true);
const showRightads = ref(true);

id.value = params.value.tool;
toolName.value = params.value.tool.replace(".vue","");
if (toolName.value === "Gradient") {
    showLeftads.value = false;
    showRightads.value = false;
}
//path.value = '../components/tools/devTools/' + params.value.tool;
//console.log(toolPath.value);
</script>

<ToolsEntranceV :id="id" :folder="folder" :toolName="toolName" :showLeftads="showLeftads" :showRightads="showRightads"></ToolsEntranceV>