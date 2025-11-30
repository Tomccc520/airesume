# UIED Resume (在线简历编辑器)

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8)](https://tailwindcss.com/)

一个现代化、高颜值的在线简历制作工具，支持实时预览、AI 辅助写作、多模板切换和高清 PDF/图片导出。

## ✨ 核心功能

- **👀 所见即所得**：实时预览简历效果，支持 A4 纸张模拟。
- **🤖 AI 智能助手**：集成 AI 写作功能，自动生成/优化简历内容（支持 SiliconFlow/DeepSeek）。
- **🎨 多样化模板**：内置多种专业简历模板（现代、经典、极简、创意），一键切换。
- **🛠 强大的编辑器**：
  - 拖拽调整模块顺序
  - 实时调整字体、字号、行间距、颜色
  - 快捷键支持 (Ctrl/Cmd + S 保存)
- **📥 高清导出**：支持导出为 PDF (A4适配)、PNG、JPG 格式。
- **🔒 隐私安全**：所有数据存储在本地浏览器 (LocalStorage)，不上传服务器。
- **🌍 国际化支持**：支持中英文界面一键切换。

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn / pnpm

### 安装依赖

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

## 📦 构建部署

```bash
npm run build
npm start
```

## 🛠 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **状态管理**: React Context + Hooks
- **工具库**: 
  - `html2canvas` / `jspdf`: 导出功能
  - `lucide-react`: 图标库
  - `dnd-kit`: 拖拽排序

## 📝 目录结构

```
src/
├── app/              # Next.js 应用路由
├── components/       # React 组件
│   ├── editor/       # 编辑器相关组件
│   └── ...
├── contexts/         # 全局状态 Context
├── data/             # 静态数据和模板定义
├── hooks/            # 自定义 Hooks
├── i18n/             # 国际化配置
├── services/         # 业务逻辑服务 (AI, 导出等)
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

[MIT](./LICENSE) License © 2025 [UIED技术团队](https://fsuied.com)
