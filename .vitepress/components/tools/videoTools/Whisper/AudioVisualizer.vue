<template>
  <canvas ref="canvasRef" :width="720" :height="240" v-bind="$attrs"></canvas>
</template>

<script setup lang="ts">

const props = defineProps({
  stream: {
    type: MediaStream,
    required: true
  }
})

const canvasRef = ref(null)

const visualize = (stream) => {
  if (!stream) return
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioContext.createMediaStreamSource(stream)
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  source.connect(analyser)

  const canvas = canvasRef.value
  const canvasCtx = canvas.getContext('2d')
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const drawVisual = () => {
    requestAnimationFrame(drawVisual)
    analyser.getByteTimeDomainData(dataArray)

    canvasCtx.fillStyle = 'rgb(255, 255, 255)'
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)'
    canvasCtx.beginPath()

    const sliceWidth = (canvas.width * 1.0) / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; ++i) {
      const v = dataArray[i] / 128.0
      const y = (v * canvas.height) / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2)
    canvasCtx.stroke()
  }

  drawVisual()
}

// 监听 stream 的变化
watch(
  () => props.stream,
  (newStream) => {
    if (newStream && canvasRef.value) {
      visualize(newStream)
    }
  }
)

// 组件挂载后如果已有 stream 则开始可视化
onMounted(() => {
  if (props.stream) {
    visualize(props.stream)
  }
})
</script>