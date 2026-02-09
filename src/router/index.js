import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const Login = () => import('@/views/login/index.vue')
const Dashboard = () => import('@/views/dashboard/index.vue')
const UserList = () => import('@/views/user/index.vue')
const DeptList = () => import('@/views/dept/index.vue')
const DictList = () => import('@/views/dict/index.vue')
const DictData = () => import('@/views/dict/data.vue')

const routes = [
    { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { title: '首页' } },
            { path: 'user/list', name: 'UserList', component: UserList, meta: { title: '用户管理' } },
            { path: 'dept/list', name: 'DeptList', component: DeptList, meta: { title: '部门管理' } },
            { path: 'dict/list', name: 'DictList', component: DictList, meta: { title: '字典管理' } },
            {
                path: 'dict/data/:dictCode',
                name: 'DictData',
                component: DictData,
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

router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem('token')
    if (to.path === '/login') next()
    else token ? next() : next('/login')
})

export default router
