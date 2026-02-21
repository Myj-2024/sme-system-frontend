import { defineStore } from 'pinia'
import request from '@/utils/request'
import { resetRouter } from '@/router'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: sessionStorage.getItem('token') || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
        menus: [], // 存储后端返回的树形菜单
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
                    const { user } = res.data
                    this.userInfo = user || {}
                    localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                    // 关键：同步加载菜单（后端接口返回树形结构）
                    await this.loadMenus()
                    return res.data
                }
                return Promise.reject(res.message || '获取用户信息失败')
            } catch (error) {
                console.error('获取用户信息失败:', error)
                return Promise.reject(error)
            }
        },

        async loadMenus() {
            try {
                // 后端接口：/admin/user/menu 返回树形结构的PermissionVO列表
                const res = await request.get('/admin/user/menu')
                if (res.code === 200) {
                    this.menus = res.data || []
                    console.log('【后端返回菜单】', this.menus)
                    return this.menus
                }
                return Promise.reject(res.message || '加载菜单失败')
            } catch (error) {
                console.error('加载菜单失败:', error)
                return Promise.reject(error)
            }
        },

        updateUserInfo(newInfo) {
            this.userInfo = { ...this.userInfo, ...newInfo }
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        },

        logout() {
            this.token = ''
            this.userInfo = {}
            this.menus = []
            this.permissions = []
            sessionStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            resetRouter()
            window.isRoutesLoaded = false
        }
    }
})