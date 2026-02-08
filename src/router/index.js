import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
const Login = () => import('@/views/login/index.vue')
import Dashboard from '@/views/dashboard/index.vue'

// 懒加载导入页面
const UserList = () => import('@/views/user/index.vue')
const DeptList = () => import('@/views/dept/index.vue')

// 新增字典列表页面导入
const DictList = () => import('@/views/dict/index.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  // 主布局嵌套路由
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '首页' }
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: UserList,
        meta: { title: '用户管理' }
      },
      // 部门管理路由
      {
        path: 'dept/list',
        name: 'DeptList',
        component: DeptList,
        meta: { title: '部门管理' }
      },
      // 新增字典管理路由
      {
        path: 'dict/list',
        name: 'DictList',
        component: DictList,
        meta: { title: '字典管理' }
      }
    ]
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')

  if (to.path === '/login') {
    next()
  } else {
    token ? next() : next('/login')
  }
})

export default router