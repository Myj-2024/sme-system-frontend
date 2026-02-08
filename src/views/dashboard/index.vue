<template>
  <div class="dashboard-wrapper">
    <div class="content-box">
      <div class="avatar-container">
        <el-avatar size="120" icon="UserFilled" class="user-avatar" />
      </div>
      <h1 class="welcome-title">欢迎回来，{{ userName }}</h1>
      <p class="system-desc">广河县中小微企业服务系统 · 高效管理平台</p>
      <p class="login-time">本次登录时间：{{ loginTime }}</p>
      <el-button
          type="primary"
          class="change-password-btn"
          @click="openPwdDialog"
          style="margin-right: 12px;"
      >
        修改密码
      </el-button>
      <el-button
          type="primary"
          class="logout-btn"
          @click="handleLogout"
      >
        退出登录
      </el-button>
    </div>
    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="420px">
      <el-form :model="pwdForm" ref="pwdFormRef" :rules="pwdRules" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwdForm.password" type="password" autocomplete="new-password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="pwdForm.confirm" type="password" autocomplete="new-password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/userStore'
import userApi from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const userName = ref(userStore.userInfo.real_name || '管理员')
const loginTime = ref('')

const formatCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const handleLogout = () => {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '温馨提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'logout-confirm-btn',
        cancelButtonClass: 'logout-cancel-btn'
      }
  ).then(() => {
    userStore.logout()
    sessionStorage.clear()
    localStorage.removeItem('userInfo')
    ElMessage.success('退出登录成功！')
    router.push('/login')
  }).catch(() => {
    ElMessage.info('已取消退出登录')
  })
}

onMounted(() => {
  loginTime.value = formatCurrentTime()
})

const pwdDialogVisible = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({
  password: '',
  confirm: ''
})
const pwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
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
    await userApi.updateUser(id, { password: pwdForm.value.password })
    ElMessage.success('密码修改成功')
    pwdDialogVisible.value = false
  } catch (e) {
    if (e?.fields) return
    ElMessage.error(e?.msg || e?.message || '密码修改失败')
  }
}
</script>

<style scoped lang="scss">
// 全局容器：去掉浅蓝色渐变背景，和布局保持一致
.dashboard-wrapper {
  width: 100%;
  min-height: 100%;
  background: transparent !important; // 改为透明，继承布局的背景
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

// 内容卡片（和登录页卡片风格统一）
.content-box {
  background: #fff;
  padding: 60px 50px;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  min-width: 420px;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

// 用户头像（渐变背景和登录页统一）
.avatar-container {
  margin-bottom: 24px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a) !important;
  font-size: 55px;
  border: 1px solid #f5f7fa;
}

// 欢迎标题
.welcome-title {
  color: #303133;
  margin-bottom: 12px;
  font-size: 32px;
  font-weight: 600;
}

// 系统描述
.system-desc {
  color: #606266;
  margin-bottom: 8px;
  font-size: 16px;
}

// 登录时间
.login-time {
  color: #909399;
  margin-bottom: 36px;
  font-size: 14px;
}

// 退出按钮（和登录页按钮风格统一）
.logout-btn {
  width: 180px;
  height: 48px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 18px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;

  &:hover {
    background: linear-gradient(90deg, #66b1ff 0%, #85ce61) !important;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
}

:deep(.el-dialog .el-input__inner[type="password"]) {
  background-color: transparent !important;
}
:deep(.el-dialog input:-webkit-autofill),
:deep(.el-dialog input:-webkit-autofill:hover),
:deep(.el-dialog input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

// 弹窗按钮样式优化
:deep(.logout-confirm-btn) {
  background: #409eff !important;
  border-color: #409eff !important;
}

:deep(.logout-cancel-btn) {
  background: #f5f7fa !important;
  color: #606266 !important;
  border-color: #e6e6e6 !important;
}
</style>
