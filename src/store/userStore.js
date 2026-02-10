import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: sessionStorage.getItem('token') || '',
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
                // 注意：这里必须确保后端有 /admin/user/info 这个接口
                // 且该接口返回的格式包含 { user, menus, permissions }
                const res = await request({
                    url: '/admin/user/info',
                    method: 'get'
                })

                if (res.code === 200) {
                    const { user, menus, permissions } = res.data
                    this.userInfo = user || {}
                    this.menus = menus || []
                    this.permissions = permissions || []
                    localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                    return res.data
                }
                return Promise.reject(res.message)
            } catch (error) {
                console.error('获取用户信息失败:', error)
                return Promise.reject(error)
            }
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