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

        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/user/list">
            <el-icon>
              <User/>
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/role/list">
            <el-icon>
              <UserFilled/>
            </el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/permission/list">
            <el-icon>
              <Menu/>
            </el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/dict/list">
            <el-icon>
              <Files/>
            </el-icon>
            <span>字典管理</span>
          </el-menu-item>
          <el-menu-item index="/icon/list">
            <el-icon>
              <Picture/>
            </el-icon>
            <span>图标管理</span>
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
            <el-icon>
              <List/>
            </el-icon>
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
          <el-menu-item index="/smeple/dept-user">
            <el-icon>
              <OfficeBuilding/>
            </el-icon>
            <span>部门人员管理</span>
          </el-menu-item>
          <el-menu-item index="/smeple/list">
            <el-icon>
              <List/>
            </el-icon>
            <span>包抓联列表</span>
          </el-menu-item>
          <el-menu-item index="/smeple/handle">
            <el-icon>
              <Edit/>
            </el-icon>
            <span>问题办理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="policy">
          <template #title>
            <el-icon>
              <Document/>
            </el-icon>
            <span>政策管理</span>
          </template>
          <el-menu-item index="/policy/list">
            <el-icon>
              <List/>
            </el-icon>
            <span>政策列表</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="notice">
          <template #title>
            <el-icon>
              <Bell/>
            </el-icon>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/notice/list">
            <el-icon>
              <List/>
            </el-icon>
            <span>通知列表</span>
          </el-menu-item>
          <el-menu-item index="/notice/form">
            <el-icon>
              <Edit/>
            </el-icon>
            <span>发布通知</span>
          </el-menu-item>
          <el-menu-item index="/notice/my">
            <el-icon>
              <Message/>
            </el-icon>
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
        <div class="header-right"
             style="width: 260px; display: flex; align-items: center; justify-content: flex-end; gap: 20px">
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
              <!-- 头像显示逻辑：有合法URL则显示，否则显示默认头像，背景色与layout一致 -->
              <el-avatar size="32"
                         :src="userStore.userInfo.avatar && userStore.userInfo.avatar.startsWith('http') ? userStore.userInfo.avatar : '/avatar.png'"
                         class="header-avatar"
              />
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
        <!-- 头像上传 - 背景色与layout一致 -->
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="uploadAvatar"
          >
            <el-avatar size="100"
                       :src="profileForm.avatar && profileForm.avatar.startsWith('http') ? profileForm.avatar : '/avatar.png'"
                       class="avatar-img"
            >
              <el-icon class="avatar-uploader-icon">
                <Plus/>
              </el-icon>
            </el-avatar>
          </el-upload>
        </el-form-item>

        <!-- 只读字段 -->
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

        <!-- 可编辑字段 -->
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
  router.afterEach((to, from) => {
    if (from.path.startsWith('/notice/')) {
      getUnreadCount()
    }
  })
})

defineExpose({
  getUnreadCount
})

// 面包屑
const breadcrumbList = computed(() => {
  const p = route.path
  if (p.startsWith('/enterprise')) return [{title: '企业管理', path: '/enterprise/list'}]
  if (p.startsWith('/smeple')) return [{title: '包抓联管理', path: '/smeple/list'}]
  if (p.startsWith('/policy')) return [{title: '政策管理', path: '/policy/list'}]
  if (p.startsWith('/notice')) return [{title: '通知管理', path: '/notice/my'}]
  if (p.startsWith('/user') || p.startsWith('/role') || p.startsWith('/permission') || p.startsWith('/dict') || p.startsWith('/icon')) return [{
    title: '系统管理',
    path: '/user/list'
  }]
  return []
})

// 当前页面标题
const currentPageTitle = computed(() => {
  const p = route.path
  if (p === '/enterprise/list') return '企业列表'
  if (p === '/smeple/list') return '包抓联列表'
  if (p === '/smeple/handle') return '问题办理'
  if (p === '/smeple/dept-user') return '部门人员管理'
  if (p === '/policy/list') return '政策列表'
  if (p === '/notice/list') return '通知列表'
  if (p === '/notice/form') return '发布通知'
  if (p === '/notice/my') return '我的通知'
  if (p.startsWith('/notice/detail')) return '通知详情'
  if (p === '/user/list') return '用户管理'
  if (p === '/role/list') return '角色管理'
  if (p === '/permission/list') return '菜单管理'
  if (p === '/dict/list') return '字典管理'
  if (p.startsWith('/dict/data')) return '字典数据'
  if (p === '/icon/list') return '图标管理'
  return ''
})

const logout = () => {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '温馨提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    await userStore.logout()
    sessionStorage.clear()
    localStorage.clear()
    ElMessage.success('退出登录成功！')
    router.replace('/login')
  }).catch(() => {
    ElMessage.info('已取消退出登录')
  })
}

// --- 修改密码逻辑 ---
const pwdDialogVisible = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({
  password: '',
  confirm: ''
})

const pwdRules = {
  password: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于6位', trigger: 'blur'}
  ],
  confirm: [
    {required: true, message: '请再次输入新密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.value.password) {
          callback(new Error('两次输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const openPwdDialog = () => {
  pwdForm.value.password = ''
  pwdForm.value.confirm = ''
  pwdDialogVisible.value = true
}

const submitPwd = async () => {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
    const id = userStore.userInfo.id
    if (!id) {
      ElMessage.error('用户信息不完整，无法更新')
      return
    }
    await userApi.updateUserPassword(id, pwdForm.value.password)
    ElMessage.success('密码修改成功')
    pwdDialogVisible.value = false
  } catch (e) {
    if (e?.fields) return
    ElMessage.error(e?.msg || e?.message || '密码修改失败')
  }
}

// --- 个人资料逻辑 ---
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
  status: 1,
  statusText: ''
})

// 打开个人资料弹窗，初始化数据
const openProfileDialog = () => {
  const userInfo = userStore.userInfo
  // 初始化表单数据
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

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片格式文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 自定义头像上传逻辑 - 调用api文件中的接口
const uploadAvatar = async (options) => {
  const file = options.file
  const formData = new FormData()
  formData.append('file', file)

  try {
    // 调用抽离后的上传接口
    const imageUrl = await uploadApi.uploadFile(formData)
    profileForm.value.avatar = imageUrl
    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error(`头像上传失败：${error.message}`)
  }
}

// 提交个人资料修改 - 调用新增的专用接口
const submitProfile = async () => {
  try {
    // 先校验表单必填项
    if (profileFormRef.value) {
      await profileFormRef.value.validateField(['realName', 'phone'])
    }

    const userId = profileForm.value.id
    if (!userId) {
      ElMessage.error('用户ID不能为空')
      return
    }

    // 构造仅包含允许修改的字段
    const updateData = {
      realName: profileForm.value.realName,
      phone: profileForm.value.phone,
      avatar: profileForm.value.avatar
    }

    // 调用新增的专用个人资料修改接口
    await userApi.updateUserProfile(userId, updateData)
    ElMessage.success('个人资料修改成功')

    // 同步更新store和localStorage
    userStore.updateUserInfo(updateData)

    profileDialogVisible.value = false
  } catch (e) {
    ElMessage.error(e?.msg || e?.message || '个人资料修改失败')
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

/* 修改密码弹窗样式适配 */
:deep(.el-dialog .el-input__inner[type="password"]) {
  background-color: transparent !important;
}

/* 个人资料弹窗样式 */
:deep(.avatar-uploader) {
  display: flex;
  justify-content: center;
}

/* 头像背景色与layout背景色一致 */
:deep(.avatar-img),
:deep(.header-avatar) {
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
</style>