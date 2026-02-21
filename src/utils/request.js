import axios from 'axios'
import {ElMessage, ElMessageBox} from 'element-plus'
import router from '@/router'

// ===================== 核心修复：按访问IP判断是否走代理 =====================
const getBaseURL = () => {
    // 1. 优先读取环境变量（.env文件）
    const envBaseApi = import.meta.env.VITE_APP_BASE_API
    if (envBaseApi) return envBaseApi

    // 2. 关键修复：判断当前访问的IP是否是本地（避免局域网访问走代理）
    const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
    const isDevMode = import.meta.env.DEV

    // 本地访问（开发环境）：走Vite代理
    if (isDevMode && isLocalHost) {
        return '/dev-api'
    }
    // 局域网/远程访问：直接访问后端真实IP
    else {
        return 'http://192.168.5.65:8080' // 你的后端真实IP+端口
    }
}

// 创建axios实例
const service = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    withCredentials: true // 必须开启，配合后端allowCredentials=true
})

// ===================== 请求拦截器（无修改，保留原有逻辑） =====================
const pendingRequests = new Map()
const generateReqKey = (config) => {
    return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`
}

service.interceptors.request.use(
    (config) => {
        const reqKey = generateReqKey(config)
        if (pendingRequests.has(reqKey)) {
            pendingRequests.get(reqKey).cancel('请勿重复提交请求')
        } else {
            const source = axios.CancelToken.source()
            config.cancelToken = source.token
            pendingRequests.set(reqKey, source)
        }

        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        console.log('【请求发送】', {
            env: import.meta.env.MODE,
            isLocal: window.location.hostname === 'localhost',
            baseURL: config.baseURL,
            fullUrl: `${config.baseURL}${config.url}`
        })

        return config
    },
    (error) => {
        ElMessage.error('请求初始化失败：' + (error.message || '未知错误'))
        return Promise.reject(error)
    }
)

// ===================== 响应拦截器（优化错误提示） =====================
service.interceptors.response.use(
    (response) => {
        const reqKey = generateReqKey(response.config)
        pendingRequests.delete(reqKey)

        const res = response.data || {}
        console.log('【响应返回】', res)

        if (res.code === 200 || res.code === 0) {
            return res
        }

        if (res.code !== undefined) {
            const isLogin = response.config.url?.includes('/login')
            const errMsg = isLogin
                ? '账号或密码错误，请检查后重试'
                : (res.msg || res.message || '操作失败')
            ElMessage.error(errMsg)
            return Promise.reject(new Error(errMsg))
        }

        if (response.headers['content-type']?.includes('application/octet-stream')) {
            return response
        }

        ElMessage.warning('接口返回格式异常，请联系后端开发人员')
        return res
    },
    (error) => {
        if (error.config) {
            const reqKey = generateReqKey(error.config)
            pendingRequests.delete(reqKey)
        }

        if (axios.isCancel(error)) {
            console.log('【请求取消】', error.message)
            return Promise.reject(error)
        }

        console.error('【请求错误】', error)
        let errMsg = ''

        // 优化跨域错误提示，精准定位问题
        if (error.message.includes('CORS') || error.message.includes('Network Error')) {
            const backendIP = service.defaults.baseURL.split('//')[1].split(':')[0]
            errMsg = `网络/跨域异常：
        1. 后端是否允许源：${window.location.origin}
        2. 后端服务地址：${service.defaults.baseURL}
        3. 网络连通性：ping ${backendIP}
        4. 后端跨域配置是否包含：http://192.168.5.65:3000`
            ElMessage.error(errMsg)
            return Promise.reject(error)
        }

        const status = error.response?.status
        switch (status) {
            case 401:
                errMsg = '登录已过期/未授权，请重新登录'
                if (!router.currentRoute.path.includes('login')) {
                    ElMessageBox.confirm('登录状态已失效，是否重新登录？', '提示', {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        sessionStorage.removeItem('token')
                        localStorage.removeItem('token')
                        router.push('/login')
                    })
                }
                break
            case 403:
                errMsg = '无权限访问该接口，请联系管理员'
                break
            case 404:
                errMsg = `接口不存在：${error.config.url}`
                break
            case 500:
                errMsg = '服务器内部错误，请稍后重试'
                break
            default:
                errMsg = error.response?.data?.msg || '请求失败，请稍后重试'
        }

        ElMessage.error(errMsg)
        return Promise.reject(error)
    }
)

// ===================== 核心修复：改用普通函数定义 get/post 方法 =====================
// 修复箭头函数导致的 this 丢失问题
service.get = function(url, params = {}, config = {}) {
    return service({
        method: 'get',
        url: url,
        params: params,
        ...config
    })
}

service.post = function(url, data = {}, config = {}) {
    return service({
        method: 'post',
        url: url,
        data: data,
        ...config
    })
}

service.cancelAllPending = () => {
    pendingRequests.forEach((source) => source.cancel('页面跳转，取消所有请求'))
    pendingRequests.clear()
}

export default service