<template>
  <div class="login-container">
    <header class="nav-header">
      <div class="nav-left">
        <div class="logo-box">
          <img src="/logo.png" alt="logo" v-if="logoExists" @error="handleImgError('logo')"/>
          <span class="nav-brand">中小微企业服务系统</span>
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
        <el-button border size="small" class="register-btn" @click="handleProblem">问题办理</el-button>

        <a href="https://ycdoc.de5.net/sme-docs/" target="_blank" class="theme-doc-link">
          <i class="el-icon-document-copy"></i>
          <span>项目文档</span>
        </a>
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
      Copyright © 2026 中小微企业服务中心
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRoute} from 'vue-router'
import {ElMessage} from "element-plus";

const route = useRoute()
const logoExists = ref(true)

const isActive = (path) => {
  return route.path.startsWith(path)
}

const handleImgError = (type) => {
  if (type === 'logo') logoExists.value = false
}

const handleProblem = () => {
  ElMessage({
    message: '该模块正在加紧开发中，敬请期待！',
    type: 'warning', // 改为 warning 更符合橙色主题
    duration: 2500,
    showClose: true
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
    gap: 16px;

    .register-btn {
      border-radius: 20px;
      padding: 8px 18px;
      background: white;
      border: 1px solid #ff6a00;
      color: #ff6a00;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        background: #ff6a00;
        color: white;
        box-shadow: 0 4px 10px rgba(255, 106, 0, 0.2);
      }
    }

    /* 美化后的项目文档链接样式 */
    .theme-doc-link {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #ff6a00;
      background: rgba(255, 106, 0, 0.08);
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 106, 0, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 500;

      i {
        font-size: 16px;
      }

      &:hover {
        background: rgba(255, 106, 0, 0.12);
        border-color: #ff6a00;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 106, 0, 0.12);
      }

      &:active {
        transform: translateY(0);
      }
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