<template>
  <div class="admin-layout" :class="{ 'is-fullscreen': isFullscreen }">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="aside-container">
        <div class="layout-logo" :class="{ collapsed: isCollapse }">
          <img src="/logo.png" class="logo-img"/>
          <span class="logo-text" v-show="!isCollapse">中小微企业服务系统</span>
        </div>

        <el-menu
            router
            :default-active="activeMenuPath"
            :collapse="isCollapse"
            :collapse-transition="false"
            class="layout-menu"
            :unique-opened="true"
            @select="handleMenuSelect"
        >
          <el-menu-item :index="resolvePath('/dashboard')">
            <el-icon class="menu-icon-wrapper">
              <HomeFilled class="menu-icon-component"/>
            </el-icon>
            <span>首页</span>
          </el-menu-item>

          <template v-for="menu in filteredMenus" :key="menu.id">
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="resolvePath(menu.path)">
              <template #title>
                <el-icon class="menu-icon-wrapper">
                  <img v-if="menu.iconUrl && menu.iconUrl.trim()" :src="menu.iconUrl" class="menu-icon-img"/>
                  <component v-else :is="getIconComponent(menu)" class="menu-icon-component"/>
                </el-icon>
                <span v-show="!isCollapse" @click.stop="handleParentClick(menu)">{{ menu.name }}</span>
              </template>

              <el-menu-item v-for="child in menu.children.filter(c => c.is_hidden !== 1)" :key="child.id"
                            :index="resolvePath(child.path)">
                <el-icon class="menu-icon-wrapper">
                  <img v-if="child.iconUrl && child.iconUrl.trim()" :src="child.iconUrl" class="menu-icon-img"/>
                  <component v-else :is="getIconComponent(child)" class="menu-icon-component"/>
                </el-icon>
                <span>{{ child.name }}</span>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="resolvePath(menu.path)">
              <el-icon class="menu-icon-wrapper">
                <img v-if="menu.iconUrl && menu.iconUrl.trim()" :src="menu.iconUrl" class="menu-icon-img"/>
                <component v-else :is="getIconComponent(menu)" class="menu-icon-component"/>
              </el-icon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>

        <div class="aside-footer" v-show="!isCollapse">
          <div class="user-card">
            <div class="user-card-main">
              <el-avatar
                  :size="40"
                  :src="userStore.userInfo.avatar && userStore.userInfo.avatar.startsWith('http') ? userStore.userInfo.avatar : '/avatar.png'"
                  class="aside-avatar"
              />
              <div class="user-card-info">
                <div class="user-card-name">{{ userName }}</div>
                <div class="user-card-dept">{{ userStore.userInfo.deptName || '未知部门' }}</div>
              </div>
            </div>
            <div class="logout-btn-wrapper" @click="logout">
              <el-icon>
                <SwitchButton/>
              </el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </el-aside>

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>

          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/" class="custom-breadcrumb">
              <el-breadcrumb-item :to="resolvePath('/dashboard')">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="resolvePath(item.path)">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="header-center">
          <div class="scroll-wrapper">
            <div class="scroll-content">
              Hello {{ userName }}，欢迎回来！今天是 {{ currentDate }}，愿你诸事顺利，万事顺心。
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="action-item" @click="goMyNotice">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
              <el-icon class="action-icon">
                <Message/>
              </el-icon>
            </el-badge>
          </div>

          <div class="action-item" @click="toggleFullScreen">
            <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏预览'" placement="bottom">
              <el-icon class="action-icon">
                <FullScreen v-if="!isFullscreen"/>
                <Aim v-else/>
              </el-icon>
            </el-tooltip>
          </div>

          <el-dropdown trigger="click" class="action-item">
            <el-icon class="action-icon">
              <Setting/>
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openProfileDialog">个人资料</el-dropdown-item>
                <el-dropdown-item @click="openPwdDialog">修改密码</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view/>
      </el-main>
    </el-container>

    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="420px">
      <el-form :model="pwdForm" ref="pwdFormRef" :rules="pwdRules" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwdForm.password" type="password" autocomplete="new-password" placeholder="请输入新密码"/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="pwdForm.confirm" type="password" autocomplete="new-password"
                    placeholder="请再次输入新密码"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPwd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="profileDialogVisible" title="个人资料" width="500px" destroy-on-close>
      <el-form :model="profileForm" ref="profileFormRef" label-width="100px">
        <el-form-item label="头像">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" :before-upload="beforeAvatarUpload"
                     :http-request="uploadAvatar">
            <el-avatar
                size="100"
                :src="profileForm.avatar && profileForm.avatar.startsWith('http') ? profileForm.avatar : '/avatar.png'"
                class="avatar-img"
            >
              <el-icon class="avatar-uploader-icon">
                <Plus/>
              </el-icon>
            </el-avatar>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户账号">
          <el-input v-model="profileForm.username" disabled/>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-input v-model="profileForm.deptName" disabled/>
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="profileForm.roleName" disabled/>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-input v-model="profileForm.statusText" disabled/>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="profileForm.realName" placeholder="请输入真实姓名"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProfile">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/userStore'
import request from '@/utils/request'
import {
  HomeFilled, Setting, Expand, Fold, Bell, Plus, FullScreen, Aim, SwitchButton, Message, ChatDotSquare
} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import userApi from '@/api/user'
import {uploadApi} from '@/api/uploadApi'
import {on, off} from '@/utils/eventBus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const toggleSidebar = () => (isCollapse.value = !isCollapse.value)
const userName = computed(() => userStore.userInfo?.realName || '管理员')

// 新增辅助函数：统一处理路径拼接，确保所有路径都走 /admin
const resolvePath = (path) => {
  if (!path) return '/admin/dashboard'
  // 如果已经是完整路径则直接返回
  if (path.startsWith('/admin/')) return path
  // 拼接前缀
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `/admin/${cleanPath}`
}

// 日期显示逻辑
const currentDate = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
  return `${year}年${month}月${day}日 ${week}`;
})

// 全屏逻辑
const isFullscreen = ref(false)
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      ElMessage.error(`无法进入全屏: ${err.message}`)
    })
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

const checkFull = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const filteredMenus = computed(() => {
  const deepFilter = (menus) => {
    return (menus || []).filter(menu => menu.type === 1 && menu.is_hidden !== 1)
        .map(menu => ({
          ...menu,
          children: menu.children ? deepFilter(menu.children) : []
        }))
  }
  return deepFilter(userStore.menus)
})

const activeMenuPath = computed(() => route.meta.activeMenu || route.path)

const handleMenuSelect = (index) => {
  // el-menu router 模式下会自动根据 index 跳转，这里已经通过 resolvePath 修正了 index
}

const handleParentClick = (menu) => {
  if (menu.children && menu.children.length > 0) {
    const visibleChildren = menu.children.filter(c => c.is_hidden !== 1 && c.type === 1)
    if (visibleChildren.length > 0) {
      const targetPath = resolvePath(visibleChildren[0].path)
      router.push(targetPath)
    }
  }
}

const iconMap = {
  home: HomeFilled, system: Setting, default: HomeFilled
}
const getIconComponent = (menu) => iconMap[menu.iconCode || menu.meta?.icon || 'default'] || HomeFilled

const breadcrumbList = computed(() => {
  const result = []
  const findPath = (menus, targetPath, parentChain = []) => {
    // 这里对比时需要兼容带不带 /admin 的情况
    for (const menu of menus) {
      const fullMenuPath = resolvePath(menu.path)
      if (fullMenuPath === targetPath) return [...parentChain, menu]

      if (route.meta.activeMenu && resolvePath(menu.path) === resolvePath(route.meta.activeMenu)) {
        return [...parentChain, menu, {name: route.meta.title, path: route.path}]
      }
      if (menu.children) {
        const found = findPath(menu.children, targetPath, [...parentChain, menu])
        if (found) return found
      }
    }
    return null
  }
  const chain = findPath(userStore.menus, route.path)
  if (chain) {
    chain.forEach((item) => {
      let targetPath = item.path
      if (item.children && item.children.length > 0) {
        const firstChild = item.children.find(c => c.is_hidden !== 1)
        if (firstChild) {
          targetPath = firstChild.path
        }
      }

      result.push({
        title: item.name,
        path: targetPath
      })
    })
  }
  return result
})

const unreadCount = ref(0)
const getUnreadCount = async () => {
  try {
    const res = await request.get('/admin/noticeUser/unreadCount')
    unreadCount.value = res.data || 0
  } catch (e) {
    console.error('获取未读消息失败:', e)
  }
}

on('refreshUnreadNotice', getUnreadCount)

const goMyNotice = async () => {
  const findMyNoticeMenu = (menus) => {
    for (const menu of menus) {
      const p = menu.path || ''
      if (p.includes('notice/my')) return menu
      if (menu.name && menu.name.includes('我的通知')) return menu

      if (menu.children && menu.children.length > 0) {
        const found = findMyNoticeMenu(menu.children)
        if (found) return found
      }
    }
    return null
  }

  const myNoticeMenu = findMyNoticeMenu(userStore.menus)

  if (myNoticeMenu && myNoticeMenu.path) {
    router.push(resolvePath(myNoticeMenu.path))
    getUnreadCount()
  } else {
    router.push('/admin/notice/my').catch(() => {
      ElMessage.error('未找到相关菜单，请检查权限配置')
    })
  }
}

onMounted(() => {
  getUnreadCount()
  window.addEventListener('fullscreenchange', checkFull)
})

onUnmounted(() => {
  off('refreshUnreadNotice', getUnreadCount)
  window.removeEventListener('fullscreenchange', checkFull)
})

const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {type: 'warning'}).then(async () => {
    await userStore.logout()
    sessionStorage.clear()
    localStorage.clear()
    ElMessage.success('已退出')
    router.replace('/home') // 退出后跳转回门户首页
  })
}

const pwdDialogVisible = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({password: '', confirm: ''})
const pwdRules = {
  password: [{required: true, message: '请输入新密码', trigger: 'blur'}, {
    min: 6,
    message: '不少于6位',
    trigger: 'blur'
  }],
  confirm: [{required: true, message: '请确认密码', trigger: 'blur'}, {
    validator: (rule, value, callback) => {
      if (value !== pwdForm.value.password) callback(new Error('两次输入不一致'))
      else callback()
    }, trigger: 'blur'
  }]
}
const openPwdDialog = () => {
  pwdForm.value = {password: '', confirm: ''};
  pwdDialogVisible.value = true
}
const submitPwd = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate()
  await userApi.updateUserPassword(userStore.userInfo.id, pwdForm.value.password)
  ElMessage.success('修改成功')
  pwdDialogVisible.value = false
}

const profileDialogVisible = ref(false)
const profileFormRef = ref(null)
const profileForm = ref({
  id: '',
  username: '',
  realName: '',
  phone: '',
  avatar: '',
  deptName: '',
  roleName: '',
  statusText: ''
})
const openProfileDialog = () => {
  const u = userStore.userInfo
  profileForm.value = {
    id: u.id,
    username: u.username,
    realName: u.realName,
    phone: u.phone,
    avatar: u.avatar,
    deptName: u.deptName,
    roleName: u.roleName,
    statusText: u.status === 1 ? '启用' : '禁用'
  }
  profileDialogVisible.value = true
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type.startsWith('image/') && file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('格式不正确或过大')
  return isImg
}
const uploadAvatar = async (opt) => {
  const fd = new FormData();
  fd.append('file', opt.file)
  profileForm.value.avatar = await uploadApi.uploadFile(fd)
  ElMessage.success('上传成功')
}
const submitProfile = async () => {
  try {
    const res = await userApi.updateUserProfile(profileForm.value.id, {
      realName: profileForm.value.realName,
      phone: profileForm.value.phone,
      avatar: profileForm.value.avatar
    })

    if (res && (res.code === 200 || res.success === true)) {
      userStore.userInfo.realName = profileForm.value.realName
      userStore.userInfo.phone = profileForm.value.phone
      userStore.userInfo.avatar = profileForm.value.avatar
      ElMessage.success('修改成功')
      profileDialogVisible.value = false
    } else {
      ElMessage.error(res?.message || '保存失败')
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('网络请求异常')
  }
}
</script>

<style scoped>
/* 样式部分保持不变，省略以节省空间，请直接沿用你原始文件的 style */
.admin-layout {
  display: flex;
  height: 100vh;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.aside-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-logo {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.logo-img {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  object-fit: contain;
}

.logo-text {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.layout-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
}

.menu-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
}

.menu-icon-component {
  font-size: 18px;
  color: #48a0fa;
}

:deep(.el-menu--collapse .menu-icon-wrapper) {
  justify-content: center;
}

:deep(.el-menu--collapse .el-menu-item), :deep(.el-menu--collapse .el-sub-menu__title) {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none;
}

.aside-footer {
  padding: 10px;
  border-top: 1px solid #f0f2f5;
  background: #fcfcfc;
}

.user-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.user-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-card-info {
  flex: 1;
  overflow: hidden;
}

.user-card-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.user-card-dept {
  padding-top: 3px;
  font-size: 12px;
  color: #909399;
}

.logout-btn-wrapper {
  border-top: 1px solid #f0f2f5;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #f56c6c;
  cursor: pointer;
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
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  margin: 0 30px;
  overflow: hidden;
  position: relative;
}

.scroll-wrapper {
  width: 100%;
  white-space: nowrap;
}

.scroll-content {
  display: inline-block;
  font-size: 14px;
  color: #606266;
  padding-left: 100%;
  animation: scroll-left 20s linear infinite;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.action-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.action-icon {
  font-size: 20px;
}

.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  margin-right: 16px;
}

.layout-content {
  background: #f5f7fa;
  flex: 1;
  overflow: auto;
  padding: 10px;
}

:deep(.el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #ecf5ff !important;
}
</style>