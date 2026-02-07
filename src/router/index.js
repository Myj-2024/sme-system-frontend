import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import Login from '@/views/login/index.vue'
import Dashboard from '@/views/dashboard/index.vue'

// 懒加载导入用户管理页面（工程化最佳实践）
const UserList = () => import('@/views/user/index.vue')

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
      // 新增用户管理路由
      {
        path: 'user/list',
        name: 'UserList',
        component: UserList,
        meta: { title: '用户管理' }
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

// 路由守卫（保持原有逻辑）
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')

  if (to.path === '/login') {
    next()
  } else {
    token ? next() : next('/login')
  }
})

export default router