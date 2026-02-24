import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

// 自动加载所有 views
const modules = import.meta.glob('/src/views/**/*.vue')

// ================= 静态路由 =================
export const staticRoutes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        name: 'Layout',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '首页' }
            }
        ]
    }
    // 🔥 关键修改：移除静态路由中的404，改为动态添加，避免优先匹配404
]

const router = createRouter({
    history: createWebHistory(),
    routes: staticRoutes
})

// ================= 组件解析 =================
function resolveComponent(componentPath) {
    if (!componentPath) return null
    if (componentPath === 'Layout') return Layout

    const cleanPath = componentPath.replace(/^\//, '')

    const possiblePaths = [
        `/src/views/${cleanPath}.vue`,
        `/src/views/${cleanPath}/index.vue`
    ]

    for (const path of possiblePaths) {
        if (modules[path]) {
            return modules[path]
        }
    }

    console.error('❌ 未找到组件:', componentPath)
    return null
}

// ================= 菜单转路由（只处理列表页） =================
function transformRoute(menu) {
    if (menu.isRoute !== 1) return null
    if (menu.type === 3) return null

    // ⭐ 过滤掉详情类路径（写死处理）
    const hiddenPaths = [
        '/dict/data',
        '/notice/detail',
        '/smePle/handle/detail'
    ]

    if (hiddenPaths.some(p => menu.path.startsWith(p))) {
        return null
    }

    const component = resolveComponent(menu.component)
    if (!component) return null

    const route = {
        path: menu.path.replace(/^\//, ''),
        name: menu.routeName || menu.name,
        component,
        meta: {
            title: menu.meta?.title || menu.name,
            icon: menu.meta?.icon,
            hidden: menu.meta?.hidden === true,
            activeMenu: menu.activeMenu || undefined
        }
    }

    // ⭐ 不递归 children（避免嵌套详情页）
    return route
}

// ================= 添加动态路由 =================
export function addDynamicRoutes(menus) {
    if (!menus || menus.length === 0) return

    // 1️⃣ 添加菜单路由（只加一级）
    menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
            menu.children.forEach(child => {
                const route = transformRoute(child)
                if (route) {
                    router.addRoute('Layout', route)
                    console.log('✅ 添加菜单路由:', route.path)
                }
            })
        }
    })

    // 2️⃣ 写死详情页/特殊页面（核心）
    const detailRoutes = [
        // 字典项
        {
            path: 'dict/data/:dictCode',
            name: 'DictData',
            component: () => import('@/views/system/dict-data.vue'),
            meta: {
                title: '字典项管理',
                activeMenu: '/system/dict',
                hidden: true
            }
        },
        // 通知详情
        {
            path: 'notice/detail/:id',
            name: 'NoticeDetail',
            component: () => import('@/views/notice/detail.vue'),
            meta: {
                title: '通知详情',
                activeMenu: '/notice/index',
                hidden: true
            }
        },
        // 办理进度详情
        {
            path: 'smePle/handle/detail',
            name: 'PackageProcessDetail',
            component: () => import('@/views/smePle/handle/PackageProcessDetail.vue'),
            meta: {
                title: '办理进度详情',
                activeMenu: '/smePle/handle',
                hidden: true
            }
        },
        // 🔥 新增：政策列表页路由（适配你的目录结构）
        {
            path: 'policy/list',
            name: 'PolicyList',
            component: () => import('@/views/policy/index.vue'), // 修正为实际组件路径
            meta: {
                title: '政策列表',
                activeMenu: '/policy/list',
                hidden: false // false=显示在侧边栏，true=隐藏
            }
        }
    ]

    detailRoutes.forEach(route => {
        router.addRoute('Layout', route)
        console.log('🔥 添加写死页面路由:', route.path)
    })

    // 🔥 关键：最后添加404路由，确保动态路由优先匹配
    router.addRoute({
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('@/views/404.vue')
    })
}

// ================= 重置路由 =================
export function resetRouter() {
    const newRouter = createRouter({
        history: createWebHistory(),
        routes: staticRoutes // 重置时只加载静态路由（不含404）
    })
    router.matcher = newRouter.matcher
}

export default router