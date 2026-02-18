<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside">
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

        <!-- 系统管理移到首页下方 -->
        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/user/list">
            <el-icon><User/></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/role/list">
            <el-icon><UserFilled/></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/dict/list">
            <el-icon><Files/></el-icon>
            <span>字典管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="enterprise">
          <template #title>
            <el-icon>
              <OfficeBuilding/>
            </el-icon>
            <span>企业管理</span>
          </template>
          <el-menu-item index="/enterprise/list">
            <el-icon><List/></el-icon>
            <span>企业列表</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="smeple">
          <template #title>
            <el-icon>
              <UserFilled/>
            </el-icon>
            <span>包抓联管理</span>
          </template>
          <!-- 部门人员管理移到包抓联列表上方 -->
          <el-menu-item index="/dept/list">
            <el-icon><OfficeBuilding/></el-icon>
            <span>部门人员管理</span>
          </el-menu-item>
          <el-menu-item index="/smeple/list">
            <el-icon><List/></el-icon>
            <span>包抓联列表</span>
          </el-menu-item>
          <el-menu-item index="/smeple/handle">
            <el-icon><Edit/></el-icon>
            <span>问题办理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 政策发布管理修改为政策管理 -->
        <el-sub-menu index="policy">
          <template #title>
            <el-icon>
              <Document/>
            </el-icon>
            <span>政策管理</span>
          </template>
          <el-menu-item index="/policy/list">
            <el-icon><List/></el-icon>
            <span>政策列表</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 通知管理 -->
        <el-sub-menu index="notice">
          <template #title>
            <el-icon>
              <Bell/>
            </el-icon>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/notice/list">
            <el-icon><List/></el-icon>
            <span>通知列表</span>
          </el-menu-item>
          <el-menu-item index="/notice/form">
            <el-icon><Edit/></el-icon>
            <span>发布通知</span>
          </el-menu-item>
          <el-menu-item index="/notice/my">
            <el-icon><Message/></el-icon>
            <span>我的通知</span>
          </el-menu-item>
        </el-sub-menu>

      </el-menu>
    </el-aside>

    <!-- 主体 -->
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>

          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/" class="custom-breadcrumb">
              <el-breadcrumb-item to="/dashboard">
                <el-icon>
                  <HomeFilled/>
                </el-icon>
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

        <!-- 通知红点 -->
        <div class="header-right" style="width: 260px; display: flex; align-items: center; justify-content: flex-end; gap: 20px">

          <el-badge
              :value="unreadCount"
              :hidden="unreadCount === 0"
              class="notice-badge"
          >
            <el-icon class="notice-icon" @click="goMyNotice">
              <Bell/>
            </el-icon>
          </el-badge>

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
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/userStore'
import request from '@/utils/request'
import {
  HomeFilled, User, UserFilled, Setting,
  Expand, OfficeBuilding, Files, Fold, Document, Bell,
  List, Edit, Message // 新增二级菜单图标
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const toggleSidebar = () => (isCollapse.value = !isCollapse.value)

const userName = computed(() => userStore.userInfo?.realName || '管理员')

/* 未读数量 */
const unreadCount = ref(0)

const getUnreadCount = async () => {
  try {
    const res = await request({
      url: '/admin/noticeUser/unreadCount',
      method: 'get'
    })
    unreadCount.value = res.data || 0
  } catch (e) {
    console.error('获取未读通知失败', e)
  }
}

const goMyNotice = () => {
  router.push('/notice/my')
}

onMounted(() => {
  getUnreadCount()
})

// 面包屑 - 同步修改政策管理的面包屑显示
const breadcrumbList = computed(() => {
  const p = route.path
  if (p.startsWith('/enterprise')) return [{title: '企业管理', path: '/enterprise/list'}]
  if (p.startsWith('/smeple')) return [{title: '包抓联管理', path: '/smeple/list'}]
  if (p.startsWith('/policy')) return [{title: '政策管理', path: '/policy/list'}] // 修改为政策管理
  if (p.startsWith('/notice')) return [{title: '通知管理', path: '/notice/my'}]
  if (p.startsWith('/user') || p.startsWith('/role') || p.startsWith('/dict')) return [{title: '系统管理', path: '/user/list'}]
  return []
})

// 当前页面标题
const currentPageTitle = computed(() => {
  const p = route.path
  if (p === '/enterprise/list') return '企业列表'
  if (p === '/smeple/list') return '包抓联列表'
  if (p === '/smeple/handle') return '问题办理'
  if (p === '/dept/list') return '部门人员管理'
  if (p === '/policy/list') return '政策列表'
  if (p === '/notice/list') return '通知列表'
  if (p === '/notice/form') return '发布通知'
  if (p === '/notice/my') return '我的通知'
  if (p.startsWith('/notice/detail')) return '通知详情'
  if (p === '/user/list') return '用户管理'
  if (p === '/role/list') return '角色管理'
  if (p === '/dict/list') return '字典管理'
  if (p.startsWith('/dict/data')) return '字典数据'
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
}

.header-left {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  margin-right: 16px;
  flex-shrink: 0;
}

.breadcrumb-wrapper {
  flex: 1;
}

.layout-content {
  background: #f5f7fa;
  flex: 1;
  overflow: auto;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.notice-icon {
  font-size: 20px;
  cursor: pointer;
}

.notice-badge {
  cursor: pointer;
}
</style>