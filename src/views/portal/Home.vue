<template>
  <main class="login-content">
    <div class="content-left">
      <div class="brand-slogan">
        <h1><span class="highlight">“一站式”综合服务平台</span></h1>
        <p class="sub-desc">助力企业数字化转型，提供政策对接、问题办理等全方位服务。</p>
      </div>
      <div class="hero-image-wrapper">
        <div class="stat-badge top-left">服务企业 <span>500+</span></div>
        <div class="stat-badge mid-right">办结率 <span>99.8%</span></div>
        <div class="stat-badge bottom-mid">融资总额 <span>￥5.8亿</span></div>
        <img
            src="/login-illustration.png"
            alt="illustration"
            class="main-hero-img"
            v-if="illustrationExists"
            @error="handleImgError('illustration')"
        />
      </div>
    </div>

    <div class="content-right">
      <div class="login-card">
        <div class="card-header">
          <h2>👏欢迎回来</h2>
          <p>请登录您的账号以继续</p>
        </div>

        <el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form">
          <el-form-item prop="username">
            <label class="input-label">用户名</label>
            <el-input v-model="form.username" placeholder="请输入账号" size="large">
              <template #prefix><i class="el-icon-user"></i></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <label class="input-label">密码</label>
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large">
              <template #prefix><i class="el-icon-lock"></i></template>
            </el-input>
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
          </div>

          <el-button type="primary" class="submit-btn" @click="handleLogin">立即登录</el-button>

          <div class="register-link">
            忘记密码请联系管理员进行重置 QQ：3287456080
          </div>
        </el-form>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useLoginLogic} from '../../api/login.js'

const logoExists = ref(true)
const illustrationExists = ref(true)

const {
  form,
  sliderSuccess,
  onSliderSuccess,
  rules,
  loginFormRef,
  handleLogin,
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
</script>

<style scoped lang="scss">
/* --- 主体内容 --- */
.login-content {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
  padding: 20px 20px;
  width: 100%;
}

/* --- 左侧展示 --- */
.content-left {
  flex: 1;
  padding-right: 50px;

  h1 {
    font-size: 35px;
    line-height: 1.3;
    margin-bottom: 15px;

    .highlight {
      color: #ff6a00;
    }
  }

  .sub-desc {
    color: #666;
    line-height: 1.8;
    max-width: 480px;
    margin-bottom: 20px;
  }

  .hero-image-wrapper {
    position: relative;
    width: 420px;
    height: 420px;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);

    .main-hero-img {
      width: 70%;
      animation: float 3s ease-in-out infinite;
    }

    .stat-badge {
      position: absolute;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      padding: 10px 15px;
      border-radius: 12px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
      font-size: 12px;

      span {
        display: block;
        font-weight: bold;
        color: #ff6a00;
        font-size: 16px;
      }

      &.top-left {
        top: 40px;
        left: -20px;
      }

      &.mid-right {
        top: 50%;
        right: -30px;
      }

      &.bottom-mid {
        bottom: 20px;
        right: 20px;
      }
    }
  }
}

/* --- 右侧登录卡片 --- */
.content-right {
  width: 420px;

  .login-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 20px 30px; /* 减小上下边距，原为 30px */
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);

    .card-header {
      text-align: center;
      margin-bottom: 10px; /* 减小间距，原为 15px */

      h2 {
        font-size: 22px; /* 稍微缩小标题 */
        margin-bottom: 4px; /* 减小间距 */
      }

      p {
        color: #999;
        font-size: 13px; /* 稍微缩小副标题 */
      }
    }
  }
}

.input-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px; /* 减小间距，原为 8px */
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 15px !important; /* 减小表单项底部间距 */
  }

  :deep(.el-input__wrapper) {
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
    border-radius: 8px !important;
    height: 42px !important; /* 减小输入框高度，原为 48px */
    transition: all 0.3s ease;

    &.is-focus {
      box-shadow: 0 0 0 1px #ff6a00 inset !important;
    }
  }

  :deep(.el-input__inner) {
    background-color: transparent !important;

    &:-webkit-autofill {
      transition: background-color 5000s ease-in-out 0s !important;
      -webkit-text-fill-color: #606266 !important;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px; /* 减小间距，原为 25px */
}

.submit-btn {
  width: 100%;
  height: 44px; /* 减小按钮高度，原为 50px */
  background: #ff6a00 !important;
  border: none !important;
  border-radius: 10px !important;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 6px 12px rgba(255, 106, 0, 0.15);
}

.register-link {
  text-align: center;
  margin-top: 15px; /* 减小间距，原为 25px */
  font-size: 12px;
  color: #999;
}

.captcha-section {
  margin: 15px 0 !important; /* 减小滑块区域间距，原为 24px */

  .captcha-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 4px;
  }

  .captcha-slider-wrapper {
    position: relative !important;
    padding: 2px 15px !important; /* 减小内边距 */
    background: rgba(245, 247, 250, 0.8) !important;
    backdrop-filter: blur(5px) !important;
    border-radius: 6px !important;

    .slider-hint {
      position: absolute !important;
      top: 120% !important; /* 稍微上移提示语 */
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      font-size: 11px !important;
      color: #909399 !important;
      pointer-events: none !important;

      &.success {
        color: #67c23a !important;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@media (max-width: 992px) {
  .content-left {
    display: none;
  }
  .content-right {
    margin: 0 auto;
  }
}
</style>