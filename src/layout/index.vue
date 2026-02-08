<template>
  <div class="admin-layout">
    <!-- 左侧侧边栏（响应式宽度） -->
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
          <template #title>
            <span>首页</span>
          </template>
        </el-menu-item>
        <!-- 用户管理二级菜单 -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
          <el-menu-item index="/user/role">角色管理</el-menu-item>
        </el-sub-menu>
        <!-- 部门管理菜单 -->
        <el-sub-menu index="dept">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </template>
          <el-menu-item index="/dept/list">部门人员列表</el-menu-item>
        </el-sub-menu>
        <!-- 字典管理菜单 -->
        <el-sub-menu index="dict">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>字典管理</span>
          </template>
          <el-menu-item index="/dict/list">字典列表</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/system/setting">
          <el-icon><Setting /></el-icon>
          <template #title>
            <span>系统设置</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="layout-main">
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Menu v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <!-- 刷新按钮 -->
          <el-icon class="refresh-btn" @click="handleRefresh">
            <Refresh />
          </el-icon>
          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">
              <el-icon class="breadcrumb-icon"><HomeFilled /></el-icon>
              <span>首页</span>
            </el-breadcrumb-item>
            <!-- 动态生成面包屑 -->
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

      <el-dialog v-model="changePwdVisible" title="修改密码" width="420px">
        <el-form :model="pwdForm" ref="pwdFormRef" label-width="100px" :rules="pwdRules">
          <el-form-item label="新密码" prop="newPwd">
            <el-input v-model="pwdForm.newPwd" type="password" autocomplete="new-password" placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPwd">
            <el-input v-model="pwdForm.confirmPwd" type="password" autocomplete="new-password" placeholder="请再次输入" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="changePwdVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePwdSubmit">确定</el-button>
        </template>
      </el-dialog>

      <!-- 页面内容区 -->
      <el-main class="layout-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
// 导入所有需要的图标（包含字典管理的Files图标）
import {
  HomeFilled, User, Setting, Menu, TrendCharts, Expand, Refresh,
  OfficeBuilding, Files
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 容错处理：防止userStore未初始化导致报错
const userName = ref('管理员')
onMounted(() => {
  try {
    userName.value = userStore.userInfo?.real_name || '管理员'
  } catch (e) {
    console.log('用户信息暂未加载，使用默认名称')
  }
})

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
        if (value !== pwdForm.value.newPwd) {
          callback(new Error('两次输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
const openChangePwd = () => {
  changePwdVisible.value = true
}
onMounted(async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.data && res.data.id) {
      currentUserId.value = res.data.id
    }
  } catch (e) {
    console.log('获取当前用户信息失败')
  }
})
const handlePwdSubmit = async () => {
  if (!pwdFormRef.value) return
  const valid = await pwdFormRef.value.validate()
  if (!valid) return
  try {
    await userApi.updateUser(currentUserId.value, { password: pwdForm.value.newPwd })
    ElMessage.success('密码修改成功')
    changePwdVisible.value = false
    pwdForm.value.newPwd = ''
    pwdForm.value.confirmPwd = ''
  } catch (e) {
    ElMessage.error(e.msg || e.message || '密码修改失败')
  }
}

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 刷新页面功能
const handleRefresh = () => {
  // 触发路由重新渲染
  router.replace({
    path: route.fullPath,
    query: { ...route.query, t: Date.now() }
  })
  ElMessage.success('页面已刷新')
}

// 优化面包屑：支持用户/部门/字典管理多级导航
const breadcrumbList = computed(() => {
  const meta = route.meta
  const breadcrumb = []

  // 用户管理二级菜单处理
  if (route.path.startsWith('/user')) {
    breadcrumb.push({
      path: '/user/list',
      title: '用户管理',
      icon: 'User'
    })
    if (route.path === '/user/list') {
      breadcrumb.push({
        path: '/user/list',
        title: '用户列表',
        icon: 'User'
      })
    } else if (route.path === '/user/role') {
      breadcrumb.push({
        path: '/user/role',
        title: '角色管理',
        icon: 'User'
      })
    }
  }
  // 部门管理面包屑
  else if (route.path.startsWith('/dept')) {
    breadcrumb.push({
      path: '/dept/list',
      title: '部门管理',
      icon: 'OfficeBuilding'
    })
    if (route.path === '/dept/list') {
      breadcrumb.push({
        path: '/dept/list',
        title: '部门人员列表',
        icon: 'OfficeBuilding'
      })
    }
  }
  // 字典管理面包屑
  else if (route.path.startsWith('/dict')) {
    breadcrumb.push({
      path: '/dict/list',
      title: '字典管理',
      icon: 'Files'
    })
    if (route.path === '/dict/list') {
      breadcrumb.push({
        path: '/dict/list',
        title: '字典列表',
        icon: 'Files'
      })
    }
  } else if (route.path === '/system/setting') {
    breadcrumb.push({
      path: '/system/setting',
      title: '系统设置',
      icon: 'Setting'
    })
  } else if (route.path === '/dashboard') {
    breadcrumb.push({
      path: '/dashboard',
      title: '首页',
      icon: 'HomeFilled'
    })
  }

  return breadcrumb
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '温馨提示',
      { type: 'warning' }
  ).then(() => {
    try {
      userStore.logout()
    } catch (e) {
      console.log('退出登录store方法执行失败，直接清理存储')
    }
    sessionStorage.clear()
    localStorage.removeItem('userInfo')
    ElMessage.success('退出登录成功！')
    router.push('/login')
  }).catch(() => {
    ElMessage.info('已取消退出登录')
  })
}

// 全局错误捕获
onErrorCaptured((err) => {
  console.error('布局组件错误:', err)
  return false
})
</script>

<style scoped lang="scss">
// 整体布局
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

// 左侧侧边栏
.layout-aside {
  background: #fff;
  overflow: hidden;
  transition: width 0.2s ease;
  z-index: 10; // 增加层级防止被遮挡
  border-right: #e6e6e6 1px solid;
}

// 侧边栏logo
.layout-logo {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 60px;
  justify-content: flex-start;
  transition: all 0.2s ease;

  &.collapsed {
    justify-content: center;
    padding: 0;
  }

  .logo-img {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #409eff;
  }
}

// 侧边栏菜单
.layout-menu {
  height: calc(100% - 60px);
  border-right: none;

  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: #f5f7fa;
    }
  }

  :deep(.el-menu-item.is-active) {
    background-color: #e8f4ff !important;
    color: #409eff;
  }
}

// 主内容区
.layout-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column; // 修复高度计算问题
}

// 顶部导航栏
.layout-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  height: 60px;
  flex-shrink: 0; // 防止被压缩
}

// 左侧内容（折叠+刷新+面包屑）
.header-left {
  display: flex;
  align-items: center;
  flex: 1; // 占满剩余空间
}

// 折叠按钮
.menu-toggle {
  font-size: 18px;
  margin-right: 12px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s ease;

  &:hover {
    color: #409eff;
  }
}

// 刷新按钮
.refresh-btn {
  font-size: 18px;
  margin-right: 12px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s ease;

  &:hover {
    color: #409eff;
  }
}

// 面包屑整体样式
.breadcrumb {
  font-size: 13px;
  display: flex;
  align-items: center;
  flex: 1; // 自适应宽度
}

// 面包屑图标样式
.breadcrumb-icon {
  font-size: 14px;
  margin-right: 4px;
  color: #606266;
}

// 面包屑分隔符样式
:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #c0c4cc;
}

// 用户信息
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;

  span {
    margin-left: 8px;
    font-size: 14px;
    color: #303133;
  }

  &:hover {
    color: #409eff;
  }
}

// 页面内容区
.layout-content {
  padding: 0;
  overflow-y: auto;
  background: #f5f7fa;
  flex: 1; // 自动填充剩余高度
  height: auto !important; // 修复固定高度导致的滚动问题
}

.avatar {
  border: 1px solid #1a7eff;
}
</style>