// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
 

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 5000
})

// 请求拦截器（修复：避免在拦截器里直接使用useUserStore）
service.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
        if (token) config.headers['Authorization'] = `Bearer ${token}`
        return config
    },
    (error) => {
        ElMessage.error('请求初始化失败')
        return Promise.reject(error)
    }
)

// 响应拦截器（增加兜底，避免页面空白）
service.interceptors.response.use(
    (response) => {
        const res = response.data || {}
        // 兜底：如果后端返回格式异常，默认视为成功
        if (res.code !== 200 && res.code !== undefined) {
            const isLogin = response.config.url?.includes('/login')
            const errMsg = isLogin ? '账号或密码错误' : (res.msg || res.message || '请求失败')
            ElMessage.error(errMsg)
            return Promise.reject(new Error(errMsg || '请求失败'))
        }
        return res
    },
    (error) => {
        // 网络错误兜底提示，不影响页面渲染
        const errMsg = error.response?.data?.msg || error.response?.data?.message || '网络异常，请稍后重试'
        ElMessage.error(errMsg)
        return Promise.reject(error)
    }
)

export default service
