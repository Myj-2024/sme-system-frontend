<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '230px'" class="layout-aside">
      <div class="layout-logo" :class="{ collapsed: isCollapse }">
        <img src="/logo.png" class="logo-img"/>
        <span class="logo-text" v-show="!isCollapse">中小微企业服务系统</span>
      </div>

      <el-menu
          router
          :default-active="$route.path"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="layout-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon>
            <HomeFilled/>
          </el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-sub-menu index="enterprise">
          <template #title>
            <el-icon>
              <OfficeBuilding/>
            </el-icon>
            <span>企业管理</span>
          </template>
          <el-menu-item index="/enterprise/list">企业列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user">
          <template #title>
            <el-icon>
              <User/>
            </el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="role">
          <template #title>
            <el-icon>
              <UserFilled/>
            </el-icon>
            <span>角色管理</span>
          </template>
          <el-menu-item index="/role/list">角色列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="dept">
          <template #title>
            <el-icon>
              <OfficeBuilding/>
            </el-icon>
            <span>部门管理</span>
          </template>
          <el-menu-item index="/dept/list">部门列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="dict">
          <template #title>
            <el-icon>
              <Files/>
            </el-icon>
            <span>字典管理</span>
          </template>
          <el-menu-item index="/dict/list">字典列表</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/system/setting">
          <el-icon>
            <Setting/>
          </el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体 -->
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>

          <!-- 美化后的面包屑 -->
          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/" class="custom-breadcrumb">
              <el-breadcrumb-item to="/dashboard">
                <el-icon><HomeFilled /></el-icon>
                <span>首页</span>
              </el-breadcrumb-item>
              <el-breadcrumb-item
                  v-for="(item, i) in breadcrumbList"
                  :key="i"
                  :to="item.path"
              >
                <span>{{ item.title }}</span>
              </el-breadcrumb-item>
              <el-breadcrumb-item>
                <span>{{ currentPageTitle }}</span>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="32" src="/avatar.png"/>
              <span>{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/userStore'
import {
  HomeFilled, User, UserFilled, Setting,
  Menu, Expand, OfficeBuilding, Files, Fold
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const toggleSidebar = () => (isCollapse.value = !isCollapse.value)

const userName = computed(() => userStore.userInfo?.realName || '管理员')

// 面包屑层级数据
const breadcrumbList = computed(() => {
  const p = route.path
  if (p.startsWith('/enterprise')) return [{title: '企业管理', path: '/enterprise/list'}]
  if (p.startsWith('/user')) return [{title: '用户管理', path: '/user/list'}]
  if (p.startsWith('/role')) return [{title: '系统管理', path: '/role/list'}]
  if (p.startsWith('/dept')) return [{title: '系统管理', path: '/dept/list'}]
  if (p.startsWith('/dict')) return [{title: '系统管理', path: '/dict/list'}]
  return []
})

// 当前页面标题（用于最后一级面包屑）
const currentPageTitle = computed(() => {
  const p = route.path
  if (p === '/enterprise/list') return '企业列表'
  if (p === '/user/list') return '用户列表'
  if (p === '/role/list') return '角色管理'
  if (p === '/dept/list') return '部门管理'
  if (p === '/dict/list') return '字典列表'
  if (p === '/system/setting') return '系统设置'
  return ''
})

const logout = () => {
  userStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #eee;
}

.layout-logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.logo-img {
  width: 36px;
  margin-right: 8px;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* 核心修改：让按钮和面包屑在同一行 */
.header-left {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 折叠按钮样式 */
.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  margin-right: 16px;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

/* 面包屑容器样式 */
.breadcrumb-wrapper {
  flex: 1; /* 让面包屑占满剩余空间 */
}

/* 面包屑美化样式 */
.custom-breadcrumb {
  font-size: 14px;
  color: #606266;
}

.custom-breadcrumb :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

.custom-breadcrumb :deep(.el-breadcrumb__item:last-child) {
  color: #409eff;
  font-weight: 500;
}

.custom-breadcrumb :deep(.el-breadcrumb__item) .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.layout-content {
  padding: 20px;
  background: #f5f7fa;
  flex: 1;
  overflow: auto;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>