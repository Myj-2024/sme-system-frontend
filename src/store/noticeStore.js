import { defineStore } from 'pinia'
import request from '@/utils/request'

// 定义通知相关的全局状态
export const useNoticeStore = defineStore('notice', {
    state: () => ({
        // 全局未读通知数量
        unreadCount: 0
    }),
    actions: {
        /**
         * 获取未读通知数量（从后端接口）
         */
        async fetchUnreadCount() {
            try {
                const res = await request({
                    url: '/admin/noticeUser/unreadCount',
                    method: 'get'
                })
                this.unreadCount = res.data || 0
            } catch (e) {
                console.error('获取未读通知数量失败:', e)
            }
        },
        /**
         * 手动减少未读数量（可选：优化体验，无需等接口返回）
         */
        decreaseUnreadCount() {
            if (this.unreadCount > 0) {
                this.unreadCount--
            }
        }
    }
})