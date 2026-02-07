<template>
  <div id="app-wrapper">
    <router-view />
  </div>
</template>

<script setup>
// 根组件仅作为路由容器
</script>

<style>
/* 强制全局背景色和高度 */
html, body, #app, #app-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: #f5f7fa !important;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 确保路由视图也继承高度 */
.router-view {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>