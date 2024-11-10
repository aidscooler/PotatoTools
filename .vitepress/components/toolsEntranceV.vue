<script setup>
/**
 * 工具组件入口，中间60%为游戏区域，两边各10%为广告区域
 * 
 */

const props = defineProps({
    id: String,
    folder: String,
    toolName: String,
    showLeftads: Boolean,
    showRightads: Boolean
})

const loadingInstance = ref(null)
const currentTool = ref(null)
const toolName = ref('')

toolName.value = props.toolName;

const showLoading = () => {
    loadingInstance.value = ElLoading.service({
        target: '.framecenter',
        fullscreen: false,
        lock: true,
        text: 'Loading...',
        background: 'rgba(0, 0, 0, 0.7)'
    })
}

const hideLoading = () => {
    if (loadingInstance.value) {
        loadingInstance.value.close()
    }
}
//判断是否是手机端，手机端不显示两边的广告位
const isMobile = ref(false);
const userAgent = ref(null);
const framecenterwidth = ref("70%");
if(!props.showLeftads && !props.showRightads) {
    framecenterwidth.value = "100%"
}else if((!props.showLeftads && props.showRightads) || 
         (props.showLeftads && !props.showRightads)) {
    framecenterwidth.value = "85%"
}
let module;
onMounted(async () => {
    userAgent.value = navigator.userAgent;
    isMobile.value  = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(userAgent.value);
    //console.log("userAgent: " + userAgent);
    //console.log("isMobile.value: " + isMobile.value);
    if (isMobile.value) {
        framecenterwidth.value = "100%";
    }
    showLoading();
    try {
        module = await import(`../components/tools/${props.folder}/${props.toolName}.vue`); 
        //const module = await import(props.toolPath)
        currentTool.value = markRaw(module.default)     
        hideLoading();
    }catch(error) {
        console.log(error);
        ElMessage.error('加载工具组件失败：' + error.message);
    }finally{
        hideLoading();
    }
})
const shouldRenderTool = computed(() => !!currentTool.value);
const isGradientTool = computed(() => toolName.value === 'Gradient');
const iframecontainer = ref(null);

const updateBackground = (cssCode) => {
  if (iframecontainer.value) {/*.backgroundImage*/
    iframecontainer.value.style = cssCode;
  }
};

const showLeftads = ref(props.showLeftads);
const showRightads = ref(props.showRightads);
</script>
<template>
    <div class="iframecontainer" ref="iframecontainer">
        <div v-if="!isMobile && showLeftads" class="frameleft">
            <iframe src="/ads/displayVerticalLeft.html">
            </iframe>
        </div>

        <div class="framecenter" style="background-color: transparent;"><!--目前 Gradient子组件需要与 父组件通信，渲染父组件背景颜色-->
            <div v-if="shouldRenderTool">
                <component :is="currentTool" @update-background="updateBackground" v-if="isGradientTool" />
                <component :is="currentTool" v-else />
            </div>
        </div>
        
        <div v-if="!isMobile && showRightads" class="frameright">
            <iframe src="/ads/displayVertical.html">
            </iframe>
        </div>
    </div>
</template>
<style scoped>
.iframecontainer{
    width: 100%;
    height: calc(100vh - 64px);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.frameleft {
    float:left;
    width:15%;
    height:inherit !important; 
}
.framecenter {
    float:left;
    width:v-bind(framecenterwidth);
    height:inherit !important;
    padding-top: 20px;
}
.frameright {
    float:left;
    width:15%;
    height:inherit !important; 
}
iframe {
    width:100%;
    height:inherit !important;
    border:0;
}
</style>



