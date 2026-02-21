import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: sessionStorage.getItem('token') || '',
        // 初始化时从localStorage读取，保证刷新后数据不丢失
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
        menus: [],
        permissions: []
    }),

    actions: {
        setToken(token) {
            this.token = token
            sessionStorage.setItem('token', token)
        },

        async fetchUserInfo() {
            try {
                const res = await request({
                    url: '/admin/user/info',
                    method: 'get'
                })

                if (res.code === 200) {
                    const { user, menus, permissions } = res.data
                    this.userInfo = user || {}
                    this.menus = menus || []
                    this.permissions = permissions || []
                    // 登录/刷新时写入缓存
                    localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                    return res.data
                }
                return Promise.reject(res.message)
            } catch (error) {
                console.error('获取用户信息失败:', error)
                return Promise.reject(error)
            }
        },

        // 新增：更新用户信息并同步缓存（核心修复）
        updateUserInfo(newInfo) {
            // 合并新信息到现有userInfo，保留未修改的字段
            this.userInfo = { ...this.userInfo, ...newInfo }
            // 同步更新localStorage，确保缓存和内存数据一致
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        },

        logout() {
            this.token = ''
            this.userInfo = {}
            this.menus = []
            this.permissions = []
            sessionStorage.removeItem('token')
            localStorage.removeItem('userInfo')
        }
    }
})