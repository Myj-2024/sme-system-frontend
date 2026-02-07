import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名，方便代码中使用@引用
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // 开发环境跨域代理配置
    port: 3000, // 前端运行端口
    open: true, // 启动时自动打开浏览器
    proxy: {
      // 匹配以/dev-api开头的请求
      '/dev-api': {
        target: 'http://localhost:8080', // 后端接口地址
        changeOrigin: true, // 开启跨域
        rewrite: (path) => path.replace(/^\/dev-api/, '') // 去除/dev-api前缀
      }
    }
  },
  build: {
    // 生产环境打包配置
    outDir: 'dist', // 打包输出目录
    assetsDir: 'assets', // 静态资源目录
    minify: 'terser' // 代码压缩
  }
})