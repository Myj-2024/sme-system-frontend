<template>
  <div class="admin-layout">
    <!-- 左侧侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '230px'" class="layout-aside">
      <div class="layout-logo" :class="{ 'collapsed': isCollapse }">
        <img src="/logo.png" alt="系统logo" class="logo-img" />
        <span class="logo-text" v-show="!isCollapse">中小微企业服务系统</span>
      </div>
      <el-menu
          :default-active="$route.path"
          class="layout-menu"
          background-color="#fff"
          text-color="#303133"
          active-text-color="#409eff"
          router
          :collapse="isCollapse"
          :collapse-transition="false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title><span>首页</span></template>
        </el-menu-item>

        <!-- 用户管理 -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
        </el-sub-menu>

        <!-- 部门管理 -->
        <el-sub-menu index="dept">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </template>
          <el-menu-item index="/dept/list">部门列表</el-menu-item>
        </el-sub-menu>

        <!-- 字典管理 -->
        <el-sub-menu index="dict">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>字典管理</span>
          </template>
          <el-menu-item index="/dict/list">字典列表</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/system/setting">
          <el-icon><Setting /></el-icon>
          <template #title><span>系统设置</span></template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容 -->
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Menu v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-icon class="refresh-btn" @click="handleRefresh">
            <Refresh />
          </el-icon>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">
              <el-icon class="breadcrumb-icon"><HomeFilled /></el-icon>
              <span>首页</span>
            </el-breadcrumb-item>
            <template v-for="(item, index) in breadcrumbList" :key="index">
              <el-breadcrumb-item v-if="item.path === $route.path">
                <el-icon class="breadcrumb-icon">
                  <component :is="item.icon || 'TrendCharts'" />
                </el-icon>
                <span>{{ item.title }}</span>
              </el-breadcrumb-item>
              <el-breadcrumb-item v-else :to="{ path: item.path }">
                <el-icon class="breadcrumb-icon">
                  <component :is="item.icon || 'TrendCharts'" />
                </el-icon>
                <span>{{ item.title }}</span>
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="35" src="/avatar.png" class="avatar" />
              <span>{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openChangePwd">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view :key="$route.fullPath" />
      </el-main>
    </el-container>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" v-model="changePwdVisible" width="400px">
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
        <el-form-item label="新密码" prop="newPwd">
          <el-input type="password" v-model="pwdForm.newPwd" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input type="password" v-model="pwdForm.confirmPwd" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePwdVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePwdSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
import {
  HomeFilled,
  User,
  Setting,
  Menu,
  TrendCharts,
  Expand,
  Refresh,
  OfficeBuilding,
  Files
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userName = ref('管理员')
onMounted(() => {
  userName.value = userStore.userInfo?.real_name || '管理员'
})

// 修改密码逻辑
const changePwdVisible = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({ newPwd: '', confirmPwd: '' })
const currentUserId = ref('')

const pwdRules = {
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        value !== pwdForm.value.newPwd
            ? callback(new Error('两次输入不一致'))
            : callback()
      },
      trigger: 'blur'
    }
  ]
}

const openChangePwd = () => { changePwdVisible.value = true }

onMounted(async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.data?.id) currentUserId.value = res.data.id
  } catch (e) {}
})

const handlePwdSubmit = async () => {
  if (!pwdFormRef.value) return
  const valid = await pwdFormRef.value.validate()
  if (!valid) return
  try {
    await userApi.updateUser(currentUserId.value, { password: pwdForm.value.newPwd })
    ElMessage.success('密码修改成功')
    changePwdVisible.value = false
    pwdForm.value = { newPwd: '', confirmPwd: '' }
  } catch (e) {
    ElMessage.error(e.message || '密码修改失败')
  }
}

// 左侧折叠
const isCollapse = ref(false)
const toggleSidebar = () => { isCollapse.value = !isCollapse.value }

// 页面刷新
const handleRefresh = () => {
  router.replace({ path: route.fullPath, query: { ...route.query, t: Date.now() } })
  ElMessage.success('页面已刷新')
}

// 面包屑
const breadcrumbList = computed(() => {
  const breadcrumb = []
  if (route.path.startsWith('/user')) {
    breadcrumb.push({ path: '/user/list', title: '用户管理', icon: 'User' })
    breadcrumb.push({ path: '/user/list', title: '用户列表', icon: 'User' })
  } else if (route.path.startsWith('/dept')) {
    breadcrumb.push({ path: '/dept/list', title: '部门管理', icon: 'OfficeBuilding' })
    breadcrumb.push({ path: '/dept/list', title: '部门列表', icon: 'OfficeBuilding' })
  } else if (route.path.startsWith('/dict')) {
    breadcrumb.push({ path: '/dict/list', title: '字典管理', icon: 'Files' })
    if (route.path.includes('/dict/data')) breadcrumb.push({ path: route.path, title: '字典数据', icon: 'Files' })
    else breadcrumb.push({ path: '/dict/list', title: '字典列表', icon: 'Files' })
  } else if (route.path === '/system/setting') {
    breadcrumb.push({ path: '/system/setting', title: '系统设置', icon: 'Setting' })
  }
  return breadcrumb
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
      .then(() => {
        userStore.logout?.()
        sessionStorage.clear()
        localStorage.clear()
        router.push('/login')
      })
      .catch(() => {})
}

onErrorCaptured(() => false)
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}
.layout-aside {
  background: #fff;
  overflow: hidden;
  transition: width 0.2s ease;
  z-index: 10;
  border-right: #e6e6e6 1px solid;
}
.layout-logo {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 60px;
  justify-content: flex-start;
  transition: all 0.2s ease;
}
.layout-logo.collapsed {
  justify-content: center;
  padding: 0;
}
.layout-logo .logo-img {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}
.layout-logo .logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}
.layout-menu {
  height: calc(100% - 60px);
  border-right: none;
}
.layout-menu :deep(.el-sub-menu__title):hover {
  background-color: #f5f7fa;
}
.layout-menu :deep(.el-menu-item.is-active) {
  background-color: #e8f4ff !important;
  color: #409eff;
}
.layout-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.layout-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  height: 60px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.menu-toggle {
  font-size: 18px;
  margin-right: 12px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s ease;
}
.menu-toggle:hover {
  color: #409eff;
}
.refresh-btn {
  font-size: 18px;
  margin-right: 12px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s ease;
}
.refresh-btn:hover {
  color: #409eff;
}
.breadcrumb {
  font-size: 13px;
  display: flex;
  align-items: center;
  flex: 1;
}
.breadcrumb-icon {
  font-size: 14px;
  margin-right: 4px;
  color: #606266;
}
:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #c0c4cc;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
}
.user-info span {
  margin-left: 8px;
  font-size: 14px;
  color: #303133;
}
.user-info:hover {
  color: #409eff;
}
.layout-content {
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
  flex: 1;
  height: auto !important;
}
.avatar {
  border: 1px solid #1a7eff;
}
</style>
