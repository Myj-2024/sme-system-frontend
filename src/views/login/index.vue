<template>
  <div class="login-container">
    <!-- 左侧背景 -->
    <div class="login-left">
      <div class="logo">
        <img
            src="/logo.png"
            alt="广河县中小微企业服务系统"
            class="logo-img"
            v-if="logoExists"
        />
        <h2>广河县中小微企业服务系统</h2>
        <p>工程化、高性能、跨组件库的前端模板</p>
      </div>
      <div class="illustration">
        <img
            src="/login-illustration.png"
            alt="系统插画"
            class="illustration-img"
            v-if="illustrationExists"
        />
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="login-card">
        <h3 class="title">欢迎回来 👋</h3>
        <p class="subtitle">请输入您的账户信息以开始管理您的项目</p>

        <el-form
            ref="loginFormRef"
            :model="form"
            :rules="rules"
            class="login-form"
        >
          <el-form-item prop="username">
            <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
            />
          </el-form-item>

          <!-- 滑块验证 -->
          <div class="captcha">
            <div class="captcha-text">请按住滑块拖动</div>
            <div class="captcha-slider">
              <el-slider
                  v-model="sliderValue"
                  :min="0"
                  :max="100"
                  :disabled="sliderSuccess"
                  :show-tooltip="false"
                  @change="handleSliderChange"
              />
            </div>
          </div>

          <el-form-item>
            <el-checkbox v-model="form.remember">记住账号</el-checkbox>
          </el-form-item>

          <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="handleLogin"
              :disabled="!sliderSuccess"
          >
            登录
          </el-button>
          <div class="help-text">
            如忘记密码，请联系管理员重置，联系方式为 3287456080@qq.com
          </div>
        </el-form>
      </div>

      <div class="copyright">
        Copyright © 2024 广河县中小微企业服务系统
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLoginLogic } from './login'

// 增加图片存在性兜底
const logoExists = ref(true)
const illustrationExists = ref(true)

const {
  form,
  sliderSuccess,
  rules,
  loginFormRef,
  handleLogin,
  onSliderSuccess,
  loginFailedTick
} = useLoginLogic()

const sliderValue = ref(0)
const handleSliderChange = (value) => {
  onSliderSuccess(value)
  if (value === 100) {
    sliderValue.value = 100
  }
}

watch(loginFailedTick, () => {
  sliderValue.value = 0
  sliderSuccess.value = false
})
// 图片加载失败兜底
const handleImgError = (type) => {
  if (type === 'logo') logoExists.value = false
  if (type === 'illustration') illustrationExists.value = false
}

onMounted(() => {
  // 修复：移除不兼容的可选链语法，改用常规判断
  const container = document.querySelector('.login-container')
  if (container) {
    container.style.display = 'flex'
  }
})
</script>

<style scoped lang="scss">

.login-container {
  display: flex !important;
  height: 100vh !important;
  min-height: 100vh !important;
  width: 100vw !important;
  background: linear-gradient(135deg, #eef2f7 0%, #e8f4ff 100%) !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}

.login-container::before {
  content: "" !important;
  position: absolute !important;
  left: calc(50% - 140px) !important;
  top: 0 !important;
  width: 280px !important;
  height: 100% !important;
  background: linear-gradient(
    to right,
    rgba(238, 242, 247, 0) 0%,
    rgba(238, 242, 247, 0.35) 25%,
    rgba(255, 255, 255, 0.85) 50%,
    rgba(238, 242, 247, 0.35) 75%,
    rgba(232, 244, 255, 0) 100%
  ) !important;
  filter: blur(16px) !important;
  z-index: 2 !important;
  pointer-events: none !important;
}

.login-left {
  width: 50% !important;
  background: linear-gradient(135deg, #ffffff 0%, #afd8f5 100%) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 40px !important;
  text-align: center !important;
  position: relative !important;
}

.login-left::after {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(135deg, rgba(224, 247, 250, 0.2), rgba(178, 235, 242, 0.3)) !important;
  z-index: 1 !important;
  pointer-events: none !important;
}

.login-left::before {
  content: "" !important;
  position: absolute !important;
  right: -110px !important;
  top: 0 !important;
  width: 220px !important;
  height: 100% !important;
  background: linear-gradient(to right, rgba(175, 216, 245, 0) 0%, rgba(232, 244, 255, 0.9) 100%) !important;
  filter: blur(20px) !important;
  z-index: 1 !important;
  pointer-events: none !important;
}

.logo {
  margin-bottom: 30px !important;
  position: relative !important;
  z-index: 2 !important;
}

.logo-img {
  width: 80px !important;
  height: auto !important;
  margin-bottom: 16px !important;
}

.logo h2 {
  font-size: 28px !important;
  color: #0288d1 !important;
  margin-bottom: 8px !important;
  font-weight: 600 !important;
}

.logo p {
  font-size: 14px !important;
  color: #01579b !important;
}

.illustration {
  max-height: 60vh !important;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  position: relative !important;
  z-index: 2 !important;
}

.illustration-img {
  max-width: 90% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  -webkit-mask-image: linear-gradient(to right, transparent 3%, black 10%, black 90%, transparent 97%),
  linear-gradient(to bottom, transparent 5%, black 15%, black 85%, transparent 95%) !important;
  -webkit-mask-composite: source-in !important;
  mask-composite: intersect !important;
  mask-image: linear-gradient(to right, transparent 3%, black 10%, black 90%, transparent 97%),
  linear-gradient(to bottom, transparent 5%, black 15%, black 85%, transparent 95%) !important;
  filter: saturate(1.1) brightness(1.08) contrast(0.95) !important;
  box-shadow: 0 8px 24px rgba(0, 136, 204, 0.12) !important;
  border-radius: 20px !important;
  transition: all 0.5s ease !important;
}

.login-right {
  width: 50% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  padding: 40px !important;
  position: relative !important;
}

.login-card {
  width: 460px !important;
  padding: 50px 40px !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: saturate(1.5) blur(6px) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

.login-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1) !important;
}

.title {
  font-size: 26px !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
  color: #303133 !important;
  text-align: center !important;
}

.subtitle {
  font-size: 14px !important;
  color: #909399 !important;
  margin-bottom: 40px !important;
  text-align: center !important;
}

.login-form {
  width: 100% !important;
  --el-input-bg-color: transparent !important;
}

.captcha {
  margin: 20px 0 !important;
  padding: 16px !important;
  background: #f8f9fa !important;
  border-radius: 8px !important;
}

/* 核心修改：输入框背景色与卡片完全统一 */
.login-form :deep(.el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 10px !important;
}

.login-form :deep(.el-input__wrapper.is-focus),
.login-form :deep(.el-input__wrapper:hover) {
  background: transparent !important;
  border-color: #409eff !important;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.12) !important;
}

.login-form :deep(.el-input__inner) {
  background-color: transparent !important;
}

.login-form :deep(.el-input__prefix),
.login-form :deep(.el-input__suffix) {
  background-color: transparent !important;
}

.login-form :deep(input:-webkit-autofill),
.login-form :deep(input:-webkit-autofill:hover),
.login-form :deep(input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

.captcha-text {
  font-size: 14px !important;
  color: #606266 !important;
  margin-bottom: 12px !important;
  text-align: center !important;
}

:deep(.captcha-slider .el-slider) {
  --el-slider-height: 12px !important;
}

:deep(.captcha-slider .el-slider__runway) {
  height: 12px !important;
  border-radius: 999px !important;
  background: linear-gradient(90deg, #e6edf7 0%, #f0f5fb 100%) !important;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.06) !important;
}

:deep(.captcha-slider .el-slider__bar) {
  height: 12px !important;
  border-radius: 999px !important;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%) !important;
}

:deep(.captcha-slider .el-slider__button-wrapper) {
  top: -8px !important;
}

:deep(.captcha-slider .el-slider__button) {
  width: 28px !important;
  height: 28px !important;
  border: none !important;
  border-radius: 50% !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.35) !important;
}

.login-btn {
  width: 100% !important;
  margin-top: 20px !important;
  height: 44px !important;
  font-size: 16px !important;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%) !important;
  border: none !important;
  border-radius: 8px !important;
}

.help-text {
  margin-top: 12px !important;
  font-size: 13px !important;
  color: #606266 !important;
  text-align: center !important;
}

.copyright {
  position: absolute !important;
  bottom: 20px !important;
  left: 0 !important;
  width: 100% !important;
  text-align: center !important;
  transform: none !important;
  font-size: 12px !important;
  color: #909399 !important;
}
</style>
