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
        <router-link to="/home" :class="{ 'is-active': isActive('/home') }">首页</router-link>
        <router-link to="/policy" :class="{ 'is-active': isActive('/policy') }">政策通告</router-link>
        <router-link to="/guide" :class="{ 'is-active': isActive('/guide') }">办事指南</router-link>
        <router-link to="/enterprise" :class="{ 'is-active': isActive('/enterprise') }">企业风采</router-link>
        <router-link to="/contact" :class="{ 'is-active': isActive('/contact') }">联系我们</router-link>
      </nav>
      <div class="nav-right">
        <i class="el-icon-global"></i>
        <el-button border size="small" class="register-btn" @click="handleProblem">问题办理</el-button>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </main>

    <div class="copyright">
      Copyright © 2026 广河县中小微企业服务中心
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRoute} from 'vue-router'
import {ElMessage} from "element-plus";

const route = useRoute()
const logoExists = ref(true)

// 判断当前路由是否包含指定路径，用于高亮逻辑
const isActive = (path) => {
  return route.path.startsWith(path)
}

const handleImgError = (type) => {
  if (type === 'logo') logoExists.value = false
}

const handleProblem = () => {
  // 展示友好的消息提醒，使用 info 类型（蓝色）符合“开发中”的提示场景
  ElMessage.info({
    message: '接口开发中，该功能暂未上线！', // 更友好的提示文案
    type: 'info', // 指定消息类型为信息提示
    duration: 2000, // 提示框显示时长（毫秒），3秒后自动关闭
    showClose: true, // 显示关闭按钮，支持手动关闭
    center: true // 消息居中显示，提升用户体验
  })
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #333;
  position: relative;
  background: linear-gradient(135deg, rgb(255, 220, 194) 0%, rgb(236, 249, 255) 50%, rgba(224, 249, 255, 0.8) 100%),
  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E") center;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    z-index: 1;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 2;
  }
}

.nav-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 5%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .nav-links {
    display: flex;
    gap: 35px;
    height: 60px;

    a {
      text-decoration: none;
      color: #666;
      font-size: 15px;
      display: flex;
      align-items: center;
      position: relative;
      transition: all 0.3s ease;
      height: 100%;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 3px;
        background: #ff6a00;
        transition: all 0.3s ease;
        transform: translateX(-50%);
        border-radius: 3px 3px 0 0;
      }

      /* 核心样式：当拥有 .is-active 类名时显示高亮 */
      &.is-active {
        color: #ff6a00 !important;
        font-weight: bold !important;

        &::after {
          width: 100%;
        }
      }

      &:hover:not(.is-active) {
        color: #ff6a00;

        &::after {
          width: 50%;
        }
      }
    }
  }

  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      height: 32px;
    }

    .nav-brand {
      font-weight: bold;
      font-size: 18px;
      color: #333;
    }
  }

  .nav-right {
    display: flex;
    align-items: center;

    .register-btn {
      border-radius: 20px;
      padding: 8px 20px;
    }
  }
}

.main-content {
  flex: 1;
  position: relative;
  overflow-x: hidden;
}

.copyright {
  padding: 20px 0;
  color: #999;
  font-size: 12px;
  text-align: center;
}

/* 过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>