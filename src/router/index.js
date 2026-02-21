import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import Layout from '@/layout/index.vue'

// 1. 静态路由
const staticRoutes = [
    { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
    {
        path: '/',
        name: 'Layout', // 给Layout路由命名，用于添加子路由
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '首页', icon: 'home' }
            }
        ]
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/404.vue') }
]

// 2. 组件映射表（恢复notice/form组件）
const componentMap = {
    'Layout': Layout,
    '@/views/dashboard/index.vue': () => import('@/views/dashboard/index.vue'),
    '@/views/enterprise/index.vue': () => import('@/views/enterprise/index.vue'),
    '@/views/smePle/index.vue': () => import('@/views/smePle/index.vue'),
    '@/views/smePle/dept-user.vue': () => import('@/views/smePle/dept-user.vue'),
    '@/views/smePle/handle/index.vue': () => import('@/views/smePle/handle/index.vue'),
    '@/views/policy/index.vue': () => import('@/views/policy/index.vue'),
    '@/views/notice/index.vue': () => import('@/views/notice/index.vue'),
    '@/views/notice/form.vue': () => import('@/views/notice/form.vue'), // 新增/编辑的表单页
    '@/views/notice/my.vue': () => import('@/views/notice/my.vue'),
    '@/views/system/user.vue': () => import('@/views/system/user.vue'),
    '@/views/system/role.vue': () => import('@/views/system/role.vue'),
    '@/views/system/icon.vue': () => import('@/views/system/icon.vue'),
    '@/views/system/permission.vue': () => import('@/views/system/permission.vue'),
    '@/views/system/dict.vue': () => import('@/views/system/dict.vue'),
    // 核心详情页组件
    '@/views/system/dict-data.vue': () => import('@/views/system/dict-data.vue'),
    '@/views/notice/detail.vue': () => import('@/views/notice/detail.vue'),
    '@/views/smePle/handle/PackageProcessDetail.vue': () => import('@/views/smePle/handle/PackageProcessDetail.vue')
}

// 生成唯一路由名称的工具函数
const generateUniqueRouteName = (path) => {
    if (!path) return `Route_${Date.now()}`
    const cleanPath = path.replace(/^\//, '').replace(/\//g, '_').replace(/:/g, '_')
    return cleanPath || `Route_${Date.now()}`
}

// 核心修复：路由转换逻辑
const convertMenuToRoute = (menu) => {
    const component = componentMap[menu.component] || Layout

    const route = {
        path: menu.path,
        name: generateUniqueRouteName(menu.path),
        component: component,
        meta: {
            title: menu.meta?.title || menu.name,
            icon: menu.meta?.icon || menu.iconCode,
            activeMenu: menu.meta?.activeMenu
        }
    };

    if (menu.children && menu.children.length > 0) {
        route.children = menu.children.map(child => convertMenuToRoute(child));
        route.redirect = menu.children[0].path;
    }

    return route;
}

// 4. 创建路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: staticRoutes
})

// 5. 重置路由
export const resetRouter = () => {
    const newRouter = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: staticRoutes
    })
    router.matcher = newRouter.matcher
}

// 6. 动态添加路由（最终正确版）
export const addDynamicRoutes = (menus) => {
    if (!menus || menus.length === 0) return

    resetRouter()

    // 第一步：添加后端返回的菜单路由
    menus.forEach(menu => {
        try {
            const route = convertMenuToRoute(menu);
            router.addRoute(route);
            console.log('【添加菜单路由成功】', route.name, route.path)
        } catch (e) {
            console.error('添加菜单路由失败', menu.path, e);
        }
    })

    // 第二步：手动添加真实存在的详情页/表单页路由
    const detailRoutes = [
        // 1. 字典项
        {
            path: '/dict/data/:dictCode',
            name: 'DictData',
            component: () => import('@/views/system/dict-data.vue'),
            meta: { title: '字典项管理', activeMenu: '/system/dict' }
        },
        // 2. 通知详情
        {
            path: '/notice/detail/:id',
            name: 'NoticeDetail',
            component: () => import('@/views/notice/detail.vue'),
            meta: { title: '通知详情', activeMenu: '/notice/index' }
        },
        // 3. 办理进度详情
        {
            path: '/smeple/handle/detail',
            name: 'PackageProcessDetail',
            component: () => import('@/views/smePle/handle/PackageProcessDetail.vue'),
            meta: { title: '办理进度详情', activeMenu: '/smePle/handle' }
        },
        // 4. 通知新增/编辑表单页（核心：复用/notice/form）
        {
            path: '/notice/form', // 新增：/notice/form
            name: 'NoticeForm',
            component: () => import('@/views/notice/form.vue'),
            meta: { title: '发布通知', activeMenu: '/notice/index' }
        },
        {
            path: '/notice/form/:id', // 编辑：/notice/form/8
            name: 'NoticeEdit',
            component: () => import('@/views/notice/form.vue'), // 复用同一个表单组件
            meta: { title: '编辑通知', activeMenu: '/notice/index' }
        },
        // 5. 重定向无效的 /notice/edit/:id 到正确的编辑路径
        {
            path: '/notice/edit/:id',
            redirect: to => {
                return { path: `/notice/form/${to.params.id}` }; // 跳转到正确的编辑页
            }
        }
    ]

    // 批量添加到Layout子路由
    detailRoutes.forEach(route => {
        try {
            router.addRoute('Layout', route);
            console.log('【添加详情路由成功】', route.name || 'Redirect', route.path)
        } catch (e) {
            console.error('添加详情路由失败', route.path, e);
        }
    })
}

export default router