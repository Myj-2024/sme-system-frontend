<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside">
      <div class="layout-logo" :class="{ collapsed: isCollapse }">
        <img src="/logo.png" class="logo-img"/>
        <span class="logo-text" v-show="!isCollapse">中小微企业服务系统</span>
      </div>

      <!-- 动态菜单渲染（适配后端树形结构） -->
      <el-menu
          router
          :default-active="activeMenuPath"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="layout-menu"
      >
        <!-- 首页（静态） -->
        <el-menu-item index="/dashboard">
          <el-icon>
            <HomeFilled/>
          </el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 动态菜单（修复：子菜单直接使用后端返回的path） -->
        <template v-for="menu in menuList" :key="menu.id">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon>
                <component :is="getIconComponent(menu)" v-if="menu.iconCode || menu.meta?.icon"/>
                <img v-else-if="menu.iconUrl" :src="menu.iconUrl" class="menu-icon-img"/>
              </el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <!-- 修复：子菜单index直接用child.path（后端返回的绝对路径） -->
            <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.path"
            >
              <el-icon>
                <component :is="getIconComponent(child)" v-if="child.iconCode || child.meta?.icon"/>
                <img v-else-if="child.iconUrl" :src="child.iconUrl" class="menu-icon-img"/>
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子女菜单 -->
          <el-menu-item v-else :key="menu.id" :index="menu.path">
            <el-icon>
              <component :is="getIconComponent(menu)" v-if="menu.iconCode || menu.meta?.icon"/>
              <img v-else-if="menu.iconUrl" :src="menu.iconUrl" class="menu-icon-img"/>
            </el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
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
              <!-- 🔥 移除重复的currentPageTitle，面包屑完全由menuList生成 -->
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
        <router-view/> <!-- 仅一层router-view，避免嵌套 -->
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

// 用户名（适配后端返回的userInfo）
const userName = computed(() => userStore.userInfo?.realName || '管理员')
// 菜单列表（直接使用后端返回的树形菜单）
const menuList = computed(() => userStore.menus || [])

// 🔥 关键：适配详情页的菜单高亮（优先使用activeMenu）
const activeMenuPath = computed(() => {
  return route.meta.activeMenu || route.path
})

// 图标映射（完全对齐后端iconCode字段）
const iconMap = {
  'home': HomeFilled,
  'enterprise': OfficeBuilding,
  'list': List,
  'edit': Edit,
  'message': Message,
  'system': Setting,
  'user': User,
  'role': UserFilled,
  'permission': Menu,
  'dict': Files,
  'icon': Picture,
  'policy': Document,
  'notice': Bell,
  'publish-notice': Edit,
  'notice-list': Bell,
  'my': User,
  'problem': Edit,
  'Menu': Menu // 后端兜底的默认图标
}

// 获取图标组件（适配后端返回的iconCode/meta.icon）
const getIconComponent = (menu) => {
  const iconCode = menu.iconCode || menu.meta?.icon || 'Menu'
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
  // 通知页面跳转后刷新未读数量
  router.afterEach((to, from) => {
    if (from.path.startsWith('/notice/')) getUnreadCount()
  })
})

// 🔥 核心重构：递归遍历菜单树生成面包屑（彻底解决重复问题）
const breadcrumbList = computed(() => {
  const currentPath = route.path
  const breadcrumb = []

  // 1. 递归查找当前路径对应的菜单链（包含所有父级）
  const findMenuChain = (menus, targetPath, parentChain = []) => {
    for (const menu of menus) {
      // 精确匹配菜单路径
      if (menu.path === targetPath) {
        return [...parentChain, menu]
      }
      // 处理详情页（通过activeMenu匹配父菜单）
      if (route.meta.activeMenu && menu.path === route.meta.activeMenu) {
        const detailItem = {
          name: route.meta.title || '详情页',
          path: currentPath
        }
        return [...parentChain, menu, detailItem]
      }
      // 递归查找子菜单
      if (menu.children && menu.children.length > 0) {
        const result = findMenuChain(menu.children, targetPath, [...parentChain, menu])
        if (result) return result
      }
    }
    return null
  }

  // 2. 生成面包屑（优先从菜单树获取）
  const menuChain = findMenuChain(menuList.value, currentPath)
  if (menuChain) {
    menuChain.forEach(item => {
      // 跳过首页（已单独渲染）
      if (item.path !== '/dashboard') {
        breadcrumb.push({
          title: item.name || item.title,
          path: item.path
        })
      }
    })
  }
  // 3. 兜底逻辑（处理无菜单匹配的详情页）
  else {
    const pathMap = {
      '/dict/data': ['系统管理', '字典管理', '字典项管理'],
      '/notice/detail': ['通知管理', '通知列表', '通知详情'],
      '/smeple/handle/detail': ['包抓联管理', '问题办理', '进度详情'],
      '/notice/form': ['通知管理', '发布通知'],
      '/notice/form/': ['通知管理', '发布通知', '编辑通知'],
    }

    // 匹配详情页路径
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

.menu-icon-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
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

/* 🔥 修复详情页菜单高亮样式 */
:deep(.el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #ecf5ff !important;
}
:deep(.el-sub-menu__title.is-active) {
  color: #409eff !important;
}
</style>