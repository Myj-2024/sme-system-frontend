import router, {addDynamicRoutes} from '@/router'
import {useUserStore} from '@/store/userStore'
import {ElMessage} from 'element-plus'

// 完整的白名单路径
const whiteList = ['/home', '/policy', '/guide', '/enterprise', '/contact', '/login']

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = sessionStorage.getItem('token')

    // 1. 已登录状态访问根路径，自动去后台
    if (token && (to.path === '/' || to.path === '/login')) {
        return next('/admin/dashboard')
    }

    // 2. 白名单放行
    if (whiteList.includes(to.path)) {
        return next()
    }

    // 3. 未登录访问管理端，去门户首页
    if (!token) {
        if (to.path.startsWith('/admin')) {
            ElMessage.warning('请先登录')
            return next('/home')
        }
        return next()
    }

    // 4. 已登录，加载动态路由
    if (userStore.menus.length === 0) {
        try {
            await userStore.fetchUserInfo()
            addDynamicRoutes(userStore.menus)
            // 确保路由加载完成后再进行跳转
            return next({...to, replace: true})
        } catch (e) {
            userStore.logout()
            ElMessage.error('登录状态失效')
            return next('/home')
        }
    }

    next()
})

router.afterEach((to) => {
    document.title = to.meta.title || '广河县中小微企业服务平台'
})