<script setup>
/**
 * 工具组件入口，中间60%为游戏区域，两边各20%为广告区域
 * 
 */

const props = defineProps({
    id: String,
    toolPath: String
})

const loadingInstance = ref(null)
const currentTool = ref(null)

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
const framecenterwidth = ref("60%");

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
        const module = await import(props.toolPath)
        currentTool.value = markRaw(module.default)      
        hideLoading();
    }catch(error) {
        console.log(error);
        ElMessage.error('加载工具组件失败：' + error.message);
    }finally{
        hideLoading();
    }
})

</script>
<template>
    <div class="iframecontainer">
        <div v-if="!isMobile" class="frameleft">
            <iframe src="/ads/displayVerticalLeft.html">
            </iframe>
        </div>

        <div class="framecenter">
            <component :id=id :is="currentTool" v-if="currentTool" />
        </div>
        
        <div v-if="!isMobile" class="frameright">
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
    width:20%;
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
    width:20%;
    height:inherit !important; 
}
iframe {
    width:100%;
    height:inherit !important;
    border:0;
}
</style>



