[后端仓库](https://github.com/Myj-2024/sme-system-backend)

## 项目简介

基于 Vue 3 + Vite 构建的中小企业管理系统前端页面，适配 Element Plus 组件库，支持富文本编辑、数据可视化等核心功能。

## 技术栈

- 核心框架：Vue 3.5+ (组合式API)
- 构建工具：Vite 7.3+
- UI 组件：Element Plus 2.8+
- 状态管理：Pinia
- 路由：Vue Router 4.4+
- 网络请求：Axios
- 富文本编辑：Quill / WangEditor / Tinymce
- 数据可视化：ECharts 6.0
- 样式预处理：Sass

## 快速启动

### 环境准备

Node.js ^20.19.0 或 ≥22.12.0（推荐用 nvm 管理版本）

### 运行步骤

1. 克隆项目：

```bash
git clone https://github.com/Myj-2024/sme-system-frontend.git
cd sme-system-frontend
```

2. 安装依赖：

```bash
npm install   # 或 yarn install
```

3. 开发环境运行：

```bash
npm run dev
```

4. 生产打包：

```bash
npm run build
```

5. 预览打包产物：

```bash
npm run preview
```

## 注意事项

- 项目采用 ES Module 模块规范（type: module）；
- 需提前配置后端接口地址，确保前后端联调正常。
