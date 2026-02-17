import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import Layout from '@/layout/index.vue'

const routes = [
    { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'enterprise/list',
                name: 'EnterpriseList',
                component: () => import('@/views/enterprise/index.vue'),
                meta: { title: '企业管理' }
            },
            {
                path: 'smeple/list',
                name: 'SmePleList',
                component: () => import('@/views/smePle/index.vue'),
                meta: { title: '包抓联管理' }
            },
            {
                path: 'smeple/handle',
                name: 'SmePleHandle',
                component: () => import('@/views/smePle/handle/index.vue'),
                meta: { title: '问题办理', activeMenu: '/smeple/list' }
            },
            {
                path: 'smeple/handle/detail',
                name: 'SmePleHandleDetail',
                component: () => import('@/views/smePle/handle/PackageProcessDetail.vue'),
                meta: {
                    title: '问题办理进度详情',
                    activeMenu: '/smeple/list'
                }
            },
            {
                path: 'policy/list',
                name: 'PolicyList',
                component: () => import('@/views/policy/index.vue'),
                meta: { title: '政策发布管理' }
            },

            // 通知模块
            {
                path: 'notice/list',
                name: 'NoticeList',
                component: () => import('@/views/notice/index.vue'),
                meta: { title: '通知列表' }
            },
            {
                path: 'notice/form',
                name: 'NoticeForm',
                component: () => import('@/views/notice/form.vue'),
                meta: { title: '发布通知' }
            },
            {
                path: 'notice/form/:id',
                name: 'NoticeFormEdit',
                component: () => import('@/views/notice/form.vue'),
                meta: {
                    title: '编辑通知',
                    activeMenu: '/notice/list'
                }
            },
            {
                path: 'notice/my',
                name: 'MyNotice',
                component: () => import('@/views/notice/my.vue'),
                meta: { title: '我的通知' }
            },
            {
                path: 'notice/detail/:id',
                name: 'NoticeDetail',
                component: () => import('@/views/notice/detail.vue'),
                meta: {
                    title: '通知详情',
                    activeMenu: '/notice/my'
                }
            },

            {
                path: 'user/list',
                name: 'UserList',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'role/list',
                name: 'RoleList',
                component: () => import('@/views/role/index.vue'),
                meta: { title: '角色管理' }
            },
            {
                path: 'dept/list',
                name: 'DeptList',
                component: () => import('@/views/dept/index.vue'),
                meta: { title: '部门管理' }
            },
            {
                path: 'dict/list',
                name: 'DictList',
                component: () => import('@/views/dict/index.vue'),
                meta: { title: '字典管理' }
            },
            {
                path: 'dict/data/:dictCode',
                name: 'DictData',
                component: () => import('@/views/dict/data.vue'),
                meta: { title: '字典数据', activeMenu: '/dict/list' }
            }
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

/**
 * 修复点：
 * 1. 不再用 userInfo.id 判断
 * 2. 不再 next({...to, replace:true}) 防止递归
 * 3. 严格 token 判断
 */
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = sessionStorage.getItem('token')

    if (to.path === '/login') {
        return next()
    }

    if (!token) {
        return next('/login')
    }

    // 如果 store 里还没用户信息
    if (!userStore.userInfo || !userStore.userInfo.id) {
        try {
            await userStore.fetchUserInfo()
        } catch (e) {
            userStore.logout()
            return next('/login')
        }
    }

    next()
})


export default router
