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
                meta: { title: '企业列表' }
            },
            {
                path: 'smeple/list',
                name: 'SmePleList',
                component: () => import('@/views/smePle/index.vue'),
                meta: { title: '包抓联列表' }
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
            // dept-user 页面归属调整到 smeple 路径下
            {
                path: 'smeple/dept-user',
                name: 'DeptUser',
                component: () => import('@/views/smePle/dpet-user.vue'),
                meta: { title: '部门人员管理', activeMenu: '/smeple/list' }
            },
            {
                path: 'policy/list',
                name: 'PolicyList',
                component: () => import('@/views/policy/index.vue'),
                meta: { title: '政策列表' }
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

            // 系统管理相关（移动到system目录）
            {
                path: 'user/list',
                name: 'UserList',
                component: () => import('@/views/system/user.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'role/list',
                name: 'RoleList',
                component: () => import('@/views/system/role.vue'),
                meta: { title: '角色管理' }
            },
            {
                path: 'dict/list',
                name: 'DictList',
                component: () => import('@/views/system/dict.vue'),
                meta: { title: '字典管理' }
            },
            {
                path: 'dict/data/:dictCode',
                name: 'DictData',
                component: () => import('@/views/system/dict-data.vue'),
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

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = sessionStorage.getItem('token')

    if (to.path === '/login') {
        return next()
    }

    if (!token) {
        return next('/login')
    }

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