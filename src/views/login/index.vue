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
            @error="handleImgError('logo')"
        />
        <h2>广河县中小微企业服务系统</h2>
        <p>数智助企，聚力兴商 — 中小微企业发展新引擎</p>
      </div>
      <div class="illustration">
        <img
            src="/login-illustration.jpg"
            alt="系统插画"
            class="illustration-img"
            v-if="illustrationExists"
            @error="handleImgError('illustration')"
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
// 整个页面统一渐变背景，弱化分界感
.login-container {
  display: flex !important;
  height: 100vh !important;
  min-height: 100vh !important;
  width: 100vw !important;
  /* 优化的全局渐变背景，更柔和自然 */
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 50%, #f5fafe 100%) !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}

/* 完全移除容器的渐变遮罩，避免叠加效果 */
.login-container::before {
  display: none !important;
}

// 左侧区域：完全透明，彻底融入全局背景
.login-left {
  width: 50% !important;
  /* 完全透明，继承全局背景 */
  background: transparent !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 40px !important;
  text-align: center !important;
  position: relative !important;
  overflow: hidden !important;
  /* 移除所有阴影和边框，彻底消除分界线 */
  box-shadow: none !important;
  border: none !important;
}

/* 移除所有左侧的伪元素渐变/羽化效果 */
.login-left::after,
.login-left::before {
  display: none !important;
}

.logo {
  margin-top: 25px !important;
  margin-bottom: 15px !important;
  position: relative !important;
  z-index: 2 !important;
}

.logo-img {
  width: 80px !important;
  height: auto !important;
  margin-bottom: 5px !important;
  background: transparent !important;
  mix-blend-mode: normal !important;
  filter: none !important;
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
  /* 给图片容器添加内边距，让羽化效果更明显 */
  padding: 15px !important;
}

.illustration-img {
  width: auto !important;
  height: auto !important;
  max-width: 98% !important;
  max-height: 98% !important;
  object-fit: contain !important;
  /* 核心：添加大面积羽化效果，让图片边界自然过渡 */
  filter: saturate(1.1) brightness(1.08) contrast(0.95)
  drop-shadow(0 8px 30px rgba(0, 136, 204, 0.15)); /* 轻微模糊增强羽化感 */
  /* 超大范围的内阴影模拟羽化效果 */
  box-shadow: inset 0 0 30px 10px rgba(255, 255, 255, 0.8) !important;
  border-radius: 5% !important;
  transition: all 0.5s ease !important;
  /* 关键：添加mask遮罩实现真正的羽化边界 */
  -webkit-mask-image: linear-gradient(to right, transparent 8%, black 20%, black 80%, transparent 92%),
  linear-gradient(to bottom, transparent 8%, black 20%, black 80%, transparent 92%) !important;
  //-webkit-mask-composite: source-in !important;
  mask-composite: intersect !important;
  //mask-image: linear-gradient(to right, transparent 8%, black 20%, black 80%, transparent 92%),
  //linear-gradient(to bottom, transparent 8%, black 20%, black 80%, transparent 92%) !important;
}

// 右侧区域：完全透明背景，融入全局渐变
.login-right {
  width: 50% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  /* 完全透明，继承全局背景 */
  background: transparent !important;
  padding: 40px !important;
  position: relative !important;
}

.login-card {
  width: 460px !important;
  padding: 50px 40px !important;
  /* 登录卡片半透明，增强融合感 */
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: saturate(1.5) blur(10px) !important;
  border-radius: 12px !important;
  /* 柔和阴影，替代生硬边界 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s ease !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
}

.login-card:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08) !important;
}

.title {
  font-size: 26px !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
  color: #303333 !important;
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
  background: rgba(248, 249, 250, 0.9) !important;
  border-radius: 8px !important;
  border: 1px solid #e9ecef !important;
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

/* ========================================
   滑块样式美化：现代化、融合主题
   ======================================== */
:deep(.captcha-slider .el-slider) {
  --el-slider-height: 12px !important;
  --el-slider-border-radius: 6px !important;
}

:deep(.captcha-slider .el-slider__runway) {
  height: var(--el-slider-height) !important;
  border-radius: var(--el-slider-border-radius) !important;
  background: linear-gradient(90deg, #e6edf7 0%, #f0f5fb 100%) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: none !important;
}

:deep(.captcha-slider .el-slider__bar) {
  height: var(--el-slider-height) !important;
  border-radius: var(--el-slider-border-radius) !important;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%) !important;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
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
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35) !important;
  transition: all 0.3s ease !important;
}

:deep(.captcha-slider .el-slider__button:hover) {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.45) !important;
}

:deep(.captcha-slider .el-slider__button:active) {
  transform: scale(1.05) !important;
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

/* ========================================
   核心修改：1100px以下只隐藏插画，保留logo和文字
   ======================================== */
@media (max-width: 1100px) {
  /* 只隐藏插画，保留logo和文字 */
  .illustration {
    display: none !important;
  }

  /* 调整左侧区域高度，让logo居中 */
  .login-left {
    width: 40% !important;
    padding: 20px !important;
  }

  /* 扩大右侧登录区域宽度 */
  .login-right {
    width: 60% !important;
  }

  /* 缩小登录卡片 */
  .login-card {
    width: 380px !important;
    padding: 40px 30px !important;
  }
}

/* 992px以下改为上下布局，logo在上，登录在下 */
@media (max-width: 992px) {
  .login-container {
    flex-direction: column !important;
    overflow-y: auto !important;
    height: auto !important;
    min-height: 100vh !important;
  }

  .login-left {
    width: 100% !important;
    padding: 30px 20px !important;
    min-height: auto !important;
  }

  .login-right {
    width: 100% !important;
    padding: 20px !important;
  }

  .login-card {
    width: 100% !important;
    max-width: 400px !important;
    padding: 30px 25px !important;
  }
}

/* 768px以下隐藏左侧所有内容，只显示登录卡片 */
@media (max-width: 768px) {
  .login-left {
    display: none !important;
  }

  .login-right {
    height: 100vh !important;
    justify-content: center !important;
  }
}

/* 手机端（≤576px）微调 */
@media (max-width: 576px) {
  .login-right {
    padding: 15px !important;
  }

  .login-card {
    padding: 25px 20px !important;
  }

  .title {
    font-size: 20px !important;
  }

  .subtitle {
    font-size: 13px !important;
    margin-bottom: 25px !important;
  }

  .login-btn {
    height: 40px !important;
    font-size: 15px !important;
  }
}
</style>