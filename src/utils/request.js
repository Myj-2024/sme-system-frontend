import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
    // 匹配环境变量名，同时设置兜底值
    baseURL: import.meta.env.VITE_APP_BASE_API || 'http://localhost:8080',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：携带Token + 调试日志
service.interceptors.request.use(
    (config) => {
        // 调试：打印请求地址和baseURL，方便定位问题
        console.log('【请求发送】', {
            url: config.url,
            baseURL: config.baseURL,
            fullUrl: config.baseURL + config.url
        })
        // 从本地存储获取Token
        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        ElMessage.error('请求初始化失败：' + error.message)
        return Promise.reject(error)
    }
)

// 响应拦截器：统一处理返回结果 + 分类错误提示
service.interceptors.response.use(
    (response) => {
        const res = response.data || {}
        // 调试：打印后端返回的完整数据
        console.log('【响应返回】', res)

        // 1. 匹配后端Result类的成功格式（code=200）
        if (res.code === 200) {
            return res
        }

        // 2. 后端返回错误码（如500/400等）
        if (res.code !== undefined) {
            const isLogin = response.config.url?.includes('/login')
            const errMsg = isLogin ? '账号或密码错误' : (res.msg || res.message || '请求失败')
            ElMessage.error(errMsg)
            return Promise.reject(new Error(errMsg || '请求失败'))
        }

        // 3. 兜底：后端返回格式异常（无code字段）
        ElMessage.warning('响应格式异常，请检查后端接口返回值')
        return res
    },
    (error) => {
        // 分类处理不同类型的错误，精准提示
        console.error('【请求错误】', error)
        let errMsg = ''

        // 404：接口不存在
        if (error.message.includes('404')) {
            errMsg = `接口不存在：${error.config.url}`
        }
        // CORS：跨域问题
        else if (error.message.includes('CORS')) {
            errMsg = '跨域请求失败，请检查后端跨域配置'
        }
        // 401：Token失效/未授权
        else if (error.response?.status === 401) {
            errMsg = '登录已过期，请重新登录'
            // 自动清除Token并跳登录页
            sessionStorage.removeItem('token')
            localStorage.removeItem('token')
            router.push('/login')
        }
        // 500：后端服务器错误
        else if (error.response?.status === 500) {
            errMsg = '服务器内部错误，请联系管理员'
        }
        // 其他错误（网络异常、超时等）
        else {
            errMsg = error.response?.data?.msg || error.response?.data?.message || '网络异常，请稍后重试'
        }

        ElMessage.error(errMsg)
        return Promise.reject(error)
    }
)

export default service