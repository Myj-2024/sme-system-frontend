<template>
  <div id="app-wrapper">
    <!-- 路由视图 -->
    <router-view />

    <!-- 编辑器使用示例（正确绑定） -->
    <div style="margin: 20px; padding: 20px; background: white;">
      <h3>政策内容编辑</h3>
      <Editor v-model="form.content" />

      <!-- 预览区域 -->
      <div style="margin-top: 20px; padding: 10px; border: 1px dashed #ccc;">
        <h4>预览：</h4>
        <div v-html="form.content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import Editor from "/src/components/Editor.vue"

// 表单数据（正确定义）
const form = ref({
  content: '<p>请输入政策内容...</p>'
})
</script>

<style>
/* 全局样式重置 */
html, body, #app, #app-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: #f5f7fa !important;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 路由视图样式 */
.router-view {
  width: 100%;
  min-height: calc(100vh - 200px); /* 留出编辑器空间 */
  padding: 20px;
}
</style>