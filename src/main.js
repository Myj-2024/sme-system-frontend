import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 新增：引入路由守卫
import './permission'

// 创建Vue实例
const app = createApp(App)

// 1. 注册Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 2. 注册路由
app.use(router)

// 3. 注册Element Plus（含全局配置）
app.use(ElementPlus, {
    locale: zhCn, // 全局中文语言
    size: 'default' // 全局组件尺寸（可选：large / default / small）
})

// 4. 全局注册所有Element Plus图标（关键：确保图标组件可全局使用）
// 优化：添加异常捕获，避免图标注册失败导致项目崩溃
try {
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        // 确保组件名是合法的Vue组件名（PascalCase）
        app.component(key, component)
    }
    console.log('✅ Element Plus 图标注册成功')
} catch (error) {
    console.error('❌ Element Plus 图标注册失败：', error)
}

// 5. 全局配置（可选：添加全局属性/方法，方便业务使用）
app.config.globalProperties.$ELEMENT = {
    size: 'default',
    zIndex: 3000 // 全局z-index配置，避免弹窗层级问题
}

// 6. 挂载应用到DOM
app.mount('#app')

// 开发环境提示
if (import.meta.env.DEV) {
    console.log('🚀 中小微企业服务系统启动成功')
}