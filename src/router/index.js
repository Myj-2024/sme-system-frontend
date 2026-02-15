import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from '@/store/userStore'
import Layout from '@/layout/index.vue'

const routes = [
    {path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: {title: '登录'}},
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: {title: '首页'}
            },
            // 原有企业管理路由
            {
                path: 'enterprise/list',
                name: 'EnterpriseList',
                component: () => import('@/views/enterprise/index.vue'),
                meta: {title: '企业管理'}
            },
            // 原有包抓联列表路由
            {
                path: 'smeple/list',
                name: 'SmePleList',
                component: () => import('@/views/smePle/index.vue'),
                meta: {title: '包抓联管理'}
            },
            // 问题办理列表路由
            {
                path: 'smeple/handle',
                name: 'SmePleHandle',
                component: () => import('@/views/smePle/handle/index.vue'),
                meta: {title: '问题办理', activeMenu: '/smeple/list'}
            },
            // 办理进度详情路由
            {
                path: 'smeple/handle/detail',
                name: 'SmePleHandleDetail',
                component: () => import('@/views/smePle/handle/PackageProcessDetail.vue'),
                meta: {
                    title: '问题办理进度详情',
                    activeMenu: '/smeple/list'
                }
            },
            // 新增：政策发布列表路由
            {
                path: 'policy/list',
                name: 'PolicyList',
                component: () => import('@/views/policy/index.vue'),
                meta: {title: '政策发布管理'}
            },
            // 原有其他路由
            {
                path: 'user/list',
                name: 'UserList',
                component: () => import('@/views/user/index.vue'),
                meta: {title: '用户管理'}
            },
            {
                path: 'role/list',
                name: 'RoleList',
                component: () => import('@/views/role/index.vue'),
                meta: {title: '角色管理'}
            },
            {
                path: 'dept/list',
                name: 'DeptList',
                component: () => import('@/views/dept/index.vue'),
                meta: {title: '部门管理'}
            },
            {
                path: 'dict/list',
                name: 'DictList',
                component: () => import('@/views/dict/index.vue'),
                meta: {title: '字典管理'}
            },
            {
                path: 'dict/data/:dictCode',
                name: 'DictData',
                component: () => import('@/views/dict/data.vue'),
                meta: {title: '字典数据', activeMenu: '/dict/list'}
            }
        ]
    },
    // 404 路由
    {path: '/:pathMatch(.*)*', redirect: '/dashboard'}
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = userStore.token

    if (to.path === '/login') {
        next()
    } else {
        if (!token) {
            next('/login')
        } else {
            if (!userStore.userInfo.id) {
                try {
                    await userStore.fetchUserInfo()
                    next({...to, replace: true})
                } catch (e) {
                    userStore.logout()
                    next('/login')
                }
            } else {
                next()
            }
        }
    }
})

export default router