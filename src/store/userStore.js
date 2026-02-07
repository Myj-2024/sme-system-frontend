// src/store/userStore.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: sessionStorage.getItem('token') || '', // 从会话读取初始值
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || {} // 从本地存储读取
    }),
    actions: {
        // 登录时存储用户信息（同步到会话/本地存储）
        setUserInfo(data) {
            this.token = data.token || ''
            this.userInfo = data.userInfo || data || {}
            // 同步到浏览器存储
            sessionStorage.setItem('token', this.token)
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        },
        // 退出时清空状态
        logout() {
            this.token = ''
            this.userInfo = {}
            // 清空store时同步清除存储（双重保障）
            sessionStorage.removeItem('token')
            localStorage.removeItem('userInfo')
        }
    }
})