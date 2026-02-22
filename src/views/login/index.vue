<template>
  <div class="login-container">
    <header class="nav-header">
      <div class="nav-left">
        <div class="logo-box">
          <img src="/logo.png" alt="logo" v-if="logoExists" @error="handleImgError('logo')"/>
          <span class="nav-brand">广河县中小微企业服务平台</span>
        </div>
      </div>
      <nav class="nav-links">
        <a href="#">首页</a>
        <a href="#">政策通告</a>
        <a href="#">办事指南</a>
        <a href="#">企业风采</a>
        <a href="#">联系我们</a>
      </nav>
      <div class="nav-right">
        <i class="el-icon-global"></i>
        <el-button border size="small" class="register-btn">注册账号</el-button>
      </div>
    </header>

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

<!--          <div class="tab-switch">-->
<!--            <div class="tab-item active">政务人员</div>-->
<!--            <div class="tab-item">企业账号</div>-->
<!--          </div>-->

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

<!--            <div class="captcha-row">-->
<!--              <div class="captcha-input-wrap">-->
<!--                <el-input v-model="form.captcha" placeholder="验证码" size="large"></el-input>-->
<!--              </div>-->
<!--              <div class="captcha-img-placeholder">4K8B</div>-->
<!--            </div>-->
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
<!--              <el-link :underline="false" class="forget-pwd">忘记密码？</el-link>-->
            </div>

            <el-button
                type="primary"
                class="submit-btn"
                @click="handleLogin"
            >立即登录
            </el-button>

<!--            <div class="third-party-login">-->
<!--              <p class="divider"><span>其他方式登录</span></p>-->
<!--              <div class="icon-group">-->
<!--                <div class="social-icon wechat"></div>-->
<!--                <div class="social-icon alipay"></div>-->
<!--                <div class="social-icon mobile"></div>-->
<!--              </div>-->
<!--            </div>-->

            <div class="register-link">
              忘记密码请联系管理员进行重置 QQ：3287456080
<!--              <el-link type="warning">立即注册账号</el-link>-->
            </div>
          </el-form>
        </div>
      </div>
    </main>
  </div>
  <div class="copyright">
    Copyright © 2026 广河县中小微企业服务中心
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useLoginLogic} from './login'

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
.login-container {
  height: 100vh;
  background: radial-gradient(circle at 10% 20%, #f0f4f8 0%, #e2ebf0 100%);
  display: flex;
  flex-direction: column;
  color: #333;
}

/* --- 导航栏 --- */
.nav-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 10px 5%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;

  .logo-box {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      height: 32px;
    }

    .nav-brand {
      font-weight: bold;
      font-size: 18px;
    }
  }

  .nav-links {
    display: flex;
    gap: 40px;

    a {
      text-decoration: none;
      color: #666;
      font-size: 14px;

      &:hover {
        color: #ff6a00;
      }
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .register-btn {
      border-radius: 20px;
    }
  }
}

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
    background: #fff;
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
      background: #fff;
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
    background: #fff;
    border-radius: 25px;
    padding: 30px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);

    .card-header {
      text-align: center;
      margin-bottom: 15px;

      h2 {
        font-size: 24px;
        margin-bottom: 8px;
      }

      p {
        color: #999;
        font-size: 14px;
      }
    }
  }
}

.tab-switch {
  display: flex;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 25px;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    color: #666;

    &.active {
      background: #fff;
      color: #333;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
  }
}

.input-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  background-color: #f0f5ff !important;
  box-shadow: none !important;
  border-radius: 10px !important;
}

.captcha-row {
  display: flex;
  gap: 15px;
  margin: 20px 0;

  .captcha-input-wrap {
    flex: 1;
  }

  .captcha-img-placeholder {
    width: 100px;
    background: #eee;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    letter-spacing: 2px;
    color: #666;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;

  .forget-pwd {
    color: #ff6a00;
    font-size: 13px;
  }
}

.submit-btn {
  width: 100%;
  height: 50px;
  background: #ff6a00 !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 8px 15px rgba(255, 106, 0, 0.2);
}

.third-party-login {
  margin-top: 30px;
  text-align: center;

  .divider {
    font-size: 12px;
    color: #ccc;
    position: relative;

    &::before, &::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1px;
      background: #eee;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }

  .icon-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;

    .social-icon {
      width: 40px;
      height: 40px;
      border: 1px solid #eee;
      border-radius: 10px;
      cursor: pointer;
      background-size: 20px;
      background-repeat: no-repeat;
      background-position: center;

      &:hover {
        background-color: #f9f9f9;
      }
    }
  }
}

.register-link {
  text-align: center;
  margin-top: 25px;
  font-size: 13px;
  color: #999;
}

.copyright {
  position: absolute !important;
  bottom: 15px !important;
  color: #999 !important;
  font-size: 12px !important;
  left:40%;
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
    padding: 4px 15px !important;
    background: #f5f7fa !important;
    border-radius: 6px !important;

    .slider-hint {
      position: absolute !important;
      top: 130% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      font-size: 12px !important;
      color: #909399 !important;
      pointer-events: none !important;

      &.success {
        color: #67c23a !important;
      }
    }
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
  .nav-links {
    display: none;
  }
}
</style>