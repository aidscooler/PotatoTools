// useWorker.ts
import { ref, onUnmounted } from 'vue'

export interface MessageEventHandler {
    (event: MessageEvent): void;
}

export function useWorker(messageEventHandler: MessageEventHandler) {
    const worker = ref<Worker>(createWorker(messageEventHandler))
    
    // 清理函数
    onUnmounted(() => {
        worker.value.terminate()
    })

    // 返回一个包含 worker 引用和 postMessage 方法的对象
    return {
        worker: worker.value,
        postMessage: (message: any, transfer?: Transferable[]) => {
            worker.value.postMessage(message, transfer || [])
        }
    }
}

function createWorker(messageEventHandler: MessageEventHandler): Worker {
    const worker = new Worker(new URL("../worker.js", import.meta.url), {
        type: "module",
    })
    
    // 监听来自 Web Worker 的消息
    worker.addEventListener("message", messageEventHandler)
    
    return worker
}