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
const folder = ref("picTools");
const showLeftads = ref(true);
const showRightads = ref(true);

id.value = params.value.tool;
toolName.value = params.value.tool.replace(".vue","");
if (toolName.value === "ImageWatermark" ||
    toolName.value === "ImageCropper" ||
    toolName.value === "ImageBackgroundRemover"
) {
    showLeftads.value = false;
    showRightads.value = true;
}
//path.value = '../components/tools/picTools/' + params.value.tool;
//console.log(toolPath.value);
</script>

<ToolsEntranceV :id="id" :folder="folder" :toolName="toolName" :showLeftads="showLeftads" :showRightads="showRightads"></ToolsEntranceV>