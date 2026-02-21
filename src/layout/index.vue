<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside">
      <div class="layout-logo" :class="{ collapsed: isCollapse }">
        <img src="/logo.png" class="logo-img"/>
        <span class="logo-text" v-show="!isCollapse">中小微企业服务系统</span>
      </div>

      <!-- 动态菜单渲染（优先级：iconUrl图片 > iconCode组件 > 默认组件） -->
      <el-menu
          router
          :default-active="activeMenuPath"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="layout-menu"
      >
        <!-- 首页（静态）- 混合模式：固定图片图标 -->
        <el-menu-item index="/dashboard">
          <el-icon>
            <img v-if="false" src="" class="menu-icon-img"/> <!-- 占位保持结构统一 -->
            <HomeFilled class="menu-icon-component"/>
          </el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 动态菜单 - 核心优化：多优先级图标渲染 -->
        <template v-for="menu in menuList" :key="menu.id">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon class="menu-icon-wrapper">
                <!-- 优先级1：后端返回iconUrl则显示图片 -->
                <img v-if="menu.iconUrl && menu.iconUrl.trim()" :src="menu.iconUrl" class="menu-icon-img"/>
                <!-- 优先级2：无iconUrl则显示Element组件（通过iconCode匹配） -->
                <component v-else :is="getIconComponent(menu)" class="menu-icon-component"/>
              </el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.path"
            >
              <el-icon class="menu-icon-wrapper">
                <img v-if="child.iconUrl && child.iconUrl.trim()" :src="child.iconUrl" class="menu-icon-img"/>
                <component v-else :is="getIconComponent(child)" class="menu-icon-component"/>
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子女菜单 -->
          <el-menu-item v-else :key="menu.id" :index="menu.path">
            <el-icon class="menu-icon-wrapper">
              <img v-if="menu.iconUrl && menu.iconUrl.trim()" :src="menu.iconUrl" class="menu-icon-img"/>
              <component v-else :is="getIconComponent(menu)" class="menu-icon-component"/>
            </el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主体内容（无修改） -->
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/" class="custom-breadcrumb">
              <el-breadcrumb-item to="/dashboard"><span>首页</span></el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, i) in breadcrumbList" :key="i" :to="item.path">
                <span>{{ item.title }}</span>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="header-right"
             style="width: 260px; display: flex; align-items: center; justify-content: flex-end; gap: 20px">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notice-badge">
            <el-icon class="notice-icon" @click="goMyNotice">
              <Bell/>
            </el-icon>
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="32"
                         :src="userStore.userInfo.avatar && userStore.userInfo.avatar.startsWith('http') ? userStore.userInfo.avatar : '/avatar.png'"
                         class="header-avatar"/>
              <span>{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openPwdDialog">修改密码</el-dropdown-item>
                <el-dropdown-item @click="openProfileDialog">个人资料</el-dropdown-item>
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

    <!-- 修改密码弹窗 -->
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

    <!-- 个人资料弹窗 -->
    <el-dialog v-model="profileDialogVisible" title="个人资料" width="500px" destroy-on-close>
      <el-form :model="profileForm" ref="profileFormRef" label-width="100px">
        <el-form-item label="头像">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" :before-upload="beforeAvatarUpload"
                     :http-request="uploadAvatar">
            <el-avatar size="100"
                       :src="profileForm.avatar && profileForm.avatar.startsWith('http') ? profileForm.avatar : '/avatar.png'"
                       class="avatar-img">
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
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/userStore'
import request from '@/utils/request'
// 导入常用的Element Plus图标（作为兜底）
import {
  HomeFilled, User, UserFilled, Setting, Menu,
  Expand, OfficeBuilding, Files, Fold, Document, Bell,
  List, Edit, Message, Picture, Plus
} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import userApi from '@/api/user'
import {uploadApi} from '@/api/uploadApi'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => (isCollapse.value = !isCollapse.value)

// 用户名
const userName = computed(() => userStore.userInfo?.realName || '管理员')
// 菜单列表
const menuList = computed(() => userStore.menus || [])

// 菜单高亮
const activeMenuPath = computed(() => {
  return route.meta.activeMenu || route.path
})

// 🔥 核心：完善的图标映射表（覆盖后端所有可能的iconCode）
const iconMap = {
  // 基础图标
  'home': HomeFilled,
  'menu': Menu,
  'system': Setting,
  'user': User,
  'role': UserFilled,
  'permission': Menu,
  'dict': Files,
  'enterprise': OfficeBuilding,
  'list': List,
  'edit': Edit,
  'message': Message,
  'icon': Picture,
  'policy': Document,
  'notice': Bell,
  'publish-notice': Edit,
  'notice-list': Bell,
  'my': User,
  'problem': Edit,
  // 补充后端返回的特殊iconCode
  'service': Setting,       // 包抓联管理
  'user-circle': User,      // 部门人员管理
  // 默认兜底
  'default': Menu
}

// 🔥 核心：获取图标组件（完善的容错逻辑）
const getIconComponent = (menu) => {
  // 1. 获取iconCode（优先menu.iconCode，其次meta.icon）
  const iconCode = menu.iconCode || menu.meta?.icon || 'default'
  // 2. 匹配图标组件，无匹配则返回默认Menu图标
  return iconMap[iconCode] || Menu
}

// 未读通知数量
const unreadCount = ref(0)
const getUnreadCount = async () => {
  try {
    const res = await request.get('/admin/noticeUser/unreadCount')
    unreadCount.value = res.data || 0
  } catch (e) {
    console.error('获取未读通知失败', e)
  }
}

// 跳转到我的通知
const goMyNotice = () => router.push('/notice/my')

// 初始化
onMounted(() => {
  getUnreadCount()
  router.afterEach((to, from) => {
    if (from.path.startsWith('/notice/')) getUnreadCount()
  })
})

// 面包屑逻辑
const breadcrumbList = computed(() => {
  const currentPath = route.path
  const breadcrumb = []

  const findMenuChain = (menus, targetPath, parentChain = []) => {
    for (const menu of menus) {
      if (menu.path === targetPath) {
        return [...parentChain, menu]
      }
      if (route.meta.activeMenu && menu.path === route.meta.activeMenu) {
        const detailItem = {
          name: route.meta.title || '详情页',
          path: currentPath
        }
        return [...parentChain, menu, detailItem]
      }
      if (menu.children && menu.children.length > 0) {
        const result = findMenuChain(menu.children, targetPath, [...parentChain, menu])
        if (result) return result
      }
    }
    return null
  }

  const menuChain = findMenuChain(menuList.value, currentPath)
  if (menuChain) {
    menuChain.forEach(item => {
      if (item.path !== '/dashboard') {
        breadcrumb.push({
          title: item.name || item.title,
          path: item.path
        })
      }
    })
  } else {
    const pathMap = {
      '/dict/data': ['系统管理', '字典管理', '字典项管理'],
      '/notice/detail': ['通知管理', '通知列表', '通知详情'],
      '/smeple/handle/detail': ['包抓联管理', '问题办理', '进度详情'],
      '/notice/form': ['通知管理', '发布通知'],
      '/notice/form/': ['通知管理', '发布通知', '编辑通知'],
    }

    for (const [key, titles] of Object.entries(pathMap)) {
      if (currentPath.startsWith(key)) {
        const paths = ['/system', '/system/dict', currentPath]
        if (key.includes('notice')) paths.splice(0, 2, '/notice', '/notice/index')
        if (key.includes('smeple')) paths.splice(0, 2, '/smePle', '/smePle/handle')

        titles.forEach((title, index) => {
          breadcrumb.push({
            title,
            path: paths[index] || currentPath
          })
        })
        break
      }
    }
  }

  return breadcrumb
})

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logout()
    sessionStorage.clear()
    localStorage.clear()
    ElMessage.success('退出登录成功！')
    router.replace('/login')
  }).catch(() => {
    ElMessage.info('已取消退出登录')
  })
}

// 修改密码逻辑
const pwdDialogVisible = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({password: '', confirm: ''})
const pwdRules = {
  password: [{required: true, message: '请输入新密码', trigger: 'blur'}, {
    min: 6,
    message: '密码长度不能少于6位',
    trigger: 'blur'
  }],
  confirm: [{required: true, message: '请再次输入新密码', trigger: 'blur'}, {
    validator: (rule, value, callback) => {
      if (value !== pwdForm.value.password) callback(new Error('两次输入不一致'))
      else callback()
    }, trigger: 'blur'
  }]
}

const openPwdDialog = () => {
  pwdForm.value = {password: '', confirm: ''}
  pwdDialogVisible.value = true
}

const submitPwd = async () => {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
    const id = userStore.userInfo.id
    if (!id) throw new Error('用户信息不完整')
    await userApi.updateUserPassword(id, pwdForm.value.password)
    ElMessage.success('密码修改成功')
    pwdDialogVisible.value = false
  } catch (e) {
    if (!e.fields) ElMessage.error(e.msg || e.message || '密码修改失败')
  }
}

// 个人资料逻辑
const profileDialogVisible = ref(false)
const profileFormRef = ref(null)
const profileForm = ref({
  id: '', username: '', realName: '', phone: '', avatar: '',
  deptName: '', roleName: '', status: 1, statusText: ''
})

const openProfileDialog = () => {
  const userInfo = userStore.userInfo
  profileForm.value = {
    id: userInfo.id || '',
    username: userInfo.username || '',
    realName: userInfo.realName || '',
    phone: userInfo.phone || '',
    avatar: userInfo.avatar || '',
    deptName: userInfo.deptName || '',
    roleName: userInfo.roleName || '',
    status: userInfo.status || 1,
    statusText: userInfo.status === 1 ? '启用' : '禁用'
  }
  profileDialogVisible.value = true
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片格式文件！')
  if (!isLt2M) ElMessage.error('头像图片大小不能超过 2MB！')
  return isImage && isLt2M
}

const uploadAvatar = async (options) => {
  const file = options.file
  const formData = new FormData()
  formData.append('file', file)
  try {
    const imageUrl = await uploadApi.uploadFile(formData)
    profileForm.value.avatar = imageUrl
    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error(`头像上传失败：${error.message}`)
  }
}

const submitProfile = async () => {
  try {
    if (profileFormRef.value) await profileFormRef.value.validateField(['realName', 'phone'])
    const userId = profileForm.value.id
    if (!userId) throw new Error('用户ID不能为空')

    const updateData = {
      realName: profileForm.value.realName,
      phone: profileForm.value.phone,
      avatar: profileForm.value.avatar
    }
    await userApi.updateUserProfile(userId, updateData)
    ElMessage.success('个人资料修改成功')
    userStore.updateUserInfo(updateData)
    profileDialogVisible.value = false
  } catch (e) {
    ElMessage.error(e.msg || e.message || '个人资料修改失败')
  }
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
  padding: 20px;
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

/* 🔥 核心：统一图标容器样式，确保图片和组件图标视觉一致 */
.menu-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
}

/* 图片图标样式 */
.menu-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
}

/* Element组件图标样式 */
.menu-icon-component {
  font-size: 18px;
  color: #48a0fa;
}

/* 折叠状态下图标居中 */
:deep(.el-menu--collapse .menu-icon-wrapper) {
  justify-content: center;
}

:deep(.el-dialog .el-input__inner[type="password"]) {
  background-color: transparent !important;
}

:deep(.avatar-uploader) {
  display: flex;
  justify-content: center;
}

:deep(.avatar-img), :deep(.header-avatar) {
  cursor: pointer;
  background-color: #f5f7fa !important;
  border: 2px solid #856010;
}

:deep(.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

/* 菜单高亮样式 */
:deep(.el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #ecf5ff !important;
}

:deep(.el-sub-menu__title.is-active) {
  color: #409eff !important;
}

/* 高亮状态下的图标颜色同步 */
:deep(.el-menu-item.is-active .menu-icon-component),
:deep(.el-sub-menu__title.is-active .menu-icon-component) {
  color: #409eff !important;
}
</style>