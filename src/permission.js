import router, { addDynamicRoutes, resetRouter } from '@/router'
import { useUserStore } from '@/store/userStore'
import { ElMessage } from 'element-plus'

let isRoutesLoaded = false

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = sessionStorage.getItem('token')

    if (to.path === '/login') {
        isRoutesLoaded = false
        resetRouter()
        return next()
    }

    if (!token) {
        ElMessage.warning('请先登录')
        return next('/login')
    }

    if (!userStore.userInfo.id || !userStore.menus || userStore.menus.length === 0) {
        try {
            await userStore.fetchUserInfo()
            // 🔥 修复：确保菜单加载完成后再添加路由
            if (userStore.menus.length > 0) {
                addDynamicRoutes(userStore.menus)
                isRoutesLoaded = true
            }
            // 修复：如果目标路径是404，跳首页；否则重新跳转目标路径
            if (to.matched.length === 0) {
                next('/dashboard')
            } else {
                next({ ...to, replace: true })
            }
        } catch (e) {
            userStore.logout()
            resetRouter()
            isRoutesLoaded = false
            ElMessage.error(`登录状态失效：${e.message || '未知错误'}`)
            return next('/login')
        }
    } else if (!isRoutesLoaded) {
        try {
            addDynamicRoutes(userStore.menus)
            isRoutesLoaded = true
            next({ ...to, replace: true })
        } catch (e) {
            console.error('加载菜单详细错误：', e);
            ElMessage.error(`加载菜单失败：${e.message || '路由格式错误'}`)
            next('/dashboard')
        }
    } else {
        next()
    }
})

router.afterEach((to) => {
    document.title = to.meta.title || '中小微企业服务系统'
})