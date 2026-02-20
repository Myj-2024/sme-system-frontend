import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    // 修复：仅本地访问时启用代理（避免局域网访问走代理）
    proxy: process.env.npm_lifecycle_event === 'dev' && process.platform === 'win32'
        ? {
          '/dev-api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/dev-api/, '')
          }
        }
        : {} // 非本地访问时关闭代理
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser'
  }
})