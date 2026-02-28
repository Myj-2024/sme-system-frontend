import {createRouter, createWebHistory} from 'vue-router'
import Layout from '@/layout/index.vue'

const modules = import.meta.glob('/src/views/**/*.vue')
const PortalLayout = () => import('@/layout/PortalLayout.vue')

export const staticRoutes = [
    {
        path: '/',
        component: PortalLayout,
        redirect: '/home',
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('@/views/portal/Home.vue'),
                meta: {title: '首页'}
            },
            {
                path: 'policy',
                name: 'PortalPolicy',
                component: () => import('@/views/portal/Policy.vue'),
                meta: {title: '政策通告'}
            },
            {
                path: 'guide',
                name: 'PortalGuide',
                component: () => import('@/views/portal/Guide.vue'),
                meta: {title: '办事指南'}
            },
            {
                path: 'enterprise',
                name: 'PortalEnterprise',
                component: () => import('@/views/portal/Enterprise.vue'),
                meta: {title: '企业风采'}
            },
            {
                path: 'contact',
                name: 'PortalContact',
                component: () => import('@/views/portal/Contact.vue'),
                meta: {title: '联系我们'}
            }
        ]
    },
    {
        path: '/admin',
        name: 'Layout',
        component: Layout,
        redirect: '/admin/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: {title: '控制台'}
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: staticRoutes
})

function resolveComponent(componentPath) {
    if (!componentPath) return null
    if (componentPath === 'Layout') return Layout
    const cleanPath = componentPath.replace(/^\//, '')
    const possiblePaths = [`/src/views/${cleanPath}.vue`, `/src/views/${cleanPath}/index.vue`]
    for (const path of possiblePaths) {
        if (modules[path]) return modules[path]
    }
    return null
}


function transformRoute(menu) {
    if (menu.isRoute !== 1 || menu.type === 3) return null
    const component = resolveComponent(menu.component)
    if (!component) return null

    let path = menu.path
    if (path.startsWith('/')) {
        path = path.substring(1)
    }

    return {
        path: path,
        name: menu.routeName || menu.name,
        component,
        meta: {
            title: menu.meta?.title || menu.name,
            icon: menu.meta?.icon,
            hidden: menu.meta?.hidden === true,
            activeMenu: menu.activeMenu || undefined
        }
    }
}


export function addDynamicRoutes(menus) {
    if (!menus || menus.length === 0) return
    menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
            menu.children.forEach(child => {
                const route = transformRoute(child)
                if (route) router.addRoute('Layout', route)
            })
        }
    })

    const detailRoutes = [
        {
            path: '/dict/data/:dictCode',
            name: 'DictData',
            component: () => import('@/views/system/dict-data.vue'),
            meta: {title: '字典项管理', activeMenu: '/system/dict', hidden: true}
        },
        {
            path: '/notice/detail/:id',
            name: 'NoticeDetail',
            component: () => import('@/views/notice/detail.vue'),
            meta: {title: '通知详情', activeMenu: '/notice/index', hidden: true}
        },
        {
            path: '/smePle/handle/detail',
            name: 'PackageProcessDetail',
            component: () => import('@/views/smePle/handle/PackageProcessDetail.vue'),
            meta: {title: '办理进度详情', activeMenu: '/smePle/handle', hidden: true}
        }
    ]
    detailRoutes.forEach(route => router.addRoute('Layout', route))

    // 404 必须最后添加
    router.addRoute({
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('@/views/404.vue')
    })
}

export function resetRouter() {
    const newRouter = createRouter({history: createWebHistory(), routes: staticRoutes})
    router.resolve = newRouter.resolve
}

export default router