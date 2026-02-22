import router, { addDynamicRoutes } from '@/router'
import { useUserStore } from '@/store/userStore'
import { ElMessage } from 'element-plus'

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = sessionStorage.getItem('token')

    // 访问登录页
    if (to.path === '/login') {
        return next()
    }

    // 未登录
    if (!token) {
        ElMessage.warning('请先登录')
        return next('/login')
    }

    // ✅ 关键修改：刷新后 menus 会变成空数组
    // 只要 menus 为空，就重新加载动态路由
    if (userStore.menus.length === 0) {
        try {
            await userStore.fetchUserInfo()
            addDynamicRoutes(userStore.menus)
            return next({ ...to, replace: true })
        } catch (e) {
            userStore.logout()
            ElMessage.error('登录状态失效')
            return next('/login')
        }
    }

    next()
})

router.afterEach((to) => {
    document.title = to.meta.title || '中小微企业服务系统'
})