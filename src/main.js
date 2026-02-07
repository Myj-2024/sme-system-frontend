import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
// 导入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 创建Vue实例
const app = createApp(App)

// 注册Pinia（状态管理）
app.use(createPinia())

// 注册路由
app.use(router)

// 关键修复：只调用一次 app.use(ElementPlus)，并传入语言配置
app.use(ElementPlus, {
    locale: zhCn, // 全局配置中文
    size: 'default' // 可选：全局设置组件尺寸
})

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载到#app
app.mount('#app')