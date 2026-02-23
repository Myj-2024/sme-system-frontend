// src/utils/eventBus.js
import { ref } from 'vue'

// 创建事件总线
const eventBus = ref(new Map())

// 监听事件
export const on = (name, callback) => {
    const handlers = eventBus.value.get(name) || []
    handlers.push(callback)
    eventBus.value.set(name, handlers)
}

// 触发事件
export const emit = (name, ...args) => {
    const handlers = eventBus.value.get(name) || []
    handlers.forEach(callback => callback(...args))
}

// 移除事件
export const off = (name, callback) => {
    const handlers = eventBus.value.get(name) || []
    if (callback) {
        const newHandlers = handlers.filter(handler => handler !== callback)
        eventBus.value.set(name, newHandlers)
    } else {
        eventBus.value.delete(name)
    }
}