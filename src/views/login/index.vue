<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-info">
        <div class="logo-wrapper">
          <img
              src="/logo.png"
              alt="logo"
              class="logo-img"
              v-if="logoExists"
              @error="handleImgError('logo')"
          />
          <span class="brand-title">广河县中小微企业服务系统</span>
        </div>
        <div class="illustration">
          <img
              src="/login-illustration.png"
              alt="系统插画"
              class="illustration-img"
              v-if="illustrationExists"
              @error="handleImgError('illustration')"
          />
        </div>
        <div class="brand-text">
          <p class="main-title">数智助企，聚力兴商 — 中小微企业发展新引擎</p>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="top-actions">
        <el-switch
            v-model="isDark"
            inline-prompt
            active-text="🌙"
            inactive-text="☀️"
            class="theme-switch"
        />
        <span class="lang-switch">文/A</span>
      </div>

      <div class="login-box">
        <h3 class="login-title">登录</h3>
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
                size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
            />
          </el-form-item>

          <div class="captcha-section">
            <div class="captcha-label">安全验证</div>
            <div class="captcha-slider-wrapper">
              <el-slider
                  v-model="sliderValue"
                  :min="0"
                  :max="100"
                  :disabled="sliderSuccess"
                  :show-tooltip="false"
                  @change="handleSliderChange"
              />
              <span class="slider-hint" v-if="!sliderSuccess">请按住滑块拖动</span>
              <span class="slider-hint success" v-else>验证通过</span>
            </div>
          </div>

          <div class="form-options">
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>

          <el-button
              type="primary"
              size="large"
              class="submit-btn"
              @click="handleLogin"
              :disabled="!sliderSuccess"
          >
            登录
          </el-button>
        </el-form>
      </div>

      <div class="copyright">
        Copyright © 2024 广河县中小微企业服务系统
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import {useLoginLogic} from './login'

const logoExists = ref(true)
const illustrationExists = ref(true)
const isDark = ref(false)

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

const handleImgError = (type) => {
  if (type === 'logo') logoExists.value = false
  if (type === 'illustration') illustrationExists.value = false
}

onMounted(() => {
  const container = document.querySelector('.login-container')
  if (container) {
    container.style.display = 'flex'
  }
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
  background-color: #ffffff !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

// --- 左侧背景区 ---
.login-left {
  position: relative !important;
  width: 50% !important;
  height: 100% !important;
  background: linear-gradient(135deg, #e0eaff 0%, #3a7bd5 100%) !important;
  overflow: hidden;

  &::after {
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    right: -120px !important;
    width: 240px !important;
    height: 100% !important;
    background: inherit !important;
    border-radius: 50% !important;
    z-index: 1 !important;
    box-shadow: -20px 0 60px rgba(58, 123, 213, 0.2);
  }

  .brand-info {
    margin-top: 30px;
    position: relative !important;
    z-index: 10 !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    padding: 40px 80px !important;
    color: white !important;
    text-align: center; // 核心：左侧整体居中
  }

  .logo-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: center; // logo和标题居中
    gap: 25px !important;

    .logo-img {
      width: 80px;
      height: 80px;
    }

    .brand-title {
      font-size: 25px;
      font-weight: bold;
      letter-spacing: 1px;
    }
  }

  .illustration {
    flex: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    .illustration-img {
      max-width: 45% !important;
      border-radius: 12px;
      // 新增：上下小幅循环动效
      animation: floatUpDown 2s ease-in-out infinite;
    }
  }

  .brand-text {
    margin-bottom: 110px !important;

    .main-title {
      font-size: 18px;
      color: #ececec;
    }

  }
}

// --- 右侧登录区域 ---
.login-right {
  position: relative !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  background: #ffffff !important;
  z-index: 5 !important;

  .top-actions {
    position: absolute !important;
    top: 24px !important;
    right: 24px !important;
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;

    .lang-switch {
      font-size: 14px;
      cursor: pointer;
      color: #666;
    }
  }

  .login-box {
    width: 100% !important;
    max-width: 360px !important;
    padding: 20px !important;
  }

  .login-title {
    font-size: 28px !important;
    font-weight: bold !important;
    color: #333 !important;
    margin-bottom: 32px !important;
  }
}

// --- 表单样式核心修复 ---
.login-form {
  // 强制去掉输入框背景色，包括自动填充引起的浅蓝色
  :deep(.el-input__wrapper) {
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
    border-radius: 8px !important;
    height: 48px !important;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 0 0 1px #3a7bd5 inset !important;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #3a7bd5 inset !important;
    }
  }

  :deep(.el-input__inner) {
    background-color: transparent !important;
    // 关键：解决 Chrome 自动填充背景色问题
    &:-webkit-autofill {
      transition: background-color 5000s ease-in-out 0s !important;
      -webkit-text-fill-color: #606266 !important;
    }
  }

  .captcha-section {
    margin: 24px 0 !important;

    .captcha-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }

    .captcha-slider-wrapper {
      position: relative !important;
      padding: 4px 12px !important;
      background: #f5f7fa !important;
      border-radius: 8px !important;

      .slider-hint {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        font-size: 12px !important;
        color: #909399 !important;
        pointer-events: none !important;

        &.success {
          color: #67c23a;
          font-weight: bold;
        }
      }
    }
  }

  .form-options {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 24px !important;
  }

  .submit-btn {
    width: 100% !important;
    height: 48px !important;
    font-size: 16px !important;
    background: #3a7bd5 !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
    }
  }
}

// 新增：上下浮动动画关键帧
@keyframes floatUpDown {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px); // 向上浮动10px（幅度可调整）
  }
  100% {
    transform: translateY(0px);
  }
}

.copyright {
  position: absolute !important;
  bottom: 24px !important;
  color: #999 !important;
  font-size: 12px !important;
}

@media (max-width: 1024px) {
  .login-left {
    display: none !important;
  }
  .login-right {
    width: 100% !important;
  }
}
</style>