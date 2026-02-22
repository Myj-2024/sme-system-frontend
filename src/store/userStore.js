import { defineStore } from 'pinia'
import request from '@/utils/request'
import { resetRouter } from '@/router'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: sessionStorage.getItem('token') || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
        menus: [],
        routesLoaded: false
    }),

    actions: {
        setToken(token) {
            this.token = token
            sessionStorage.setItem('token', token)
        },

        async fetchUserInfo() {
            const res = await request.get('/admin/user/info')
            if (res.code !== 200) {
                return Promise.reject(res.message)
            }

            this.userInfo = res.data.user || {}
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))

            await this.loadMenus()
        },

        async loadMenus() {
            const res = await request.get('/admin/user/menu')
            if (res.code !== 200) {
                return Promise.reject(res.message)
            }

            this.menus = res.data || []
        },

        setRoutesLoaded(status) {
            this.routesLoaded = status
        },

        logout() {
            this.token = ''
            this.userInfo = {}
            this.menus = []
            this.routesLoaded = false

            sessionStorage.removeItem('token')
            localStorage.removeItem('userInfo')

            resetRouter()
        }
    }
})