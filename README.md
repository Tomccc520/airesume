# AI Resume - 智能简历生成器

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

<div align="center">
  <h3>🚀 现代化、高颜值的 AI 简历制作工具</h3>
  <p>支持实时预览 · AI 辅助写作 · 多模板切换 · 高清导出</p>
  
  [在线体验](https://your-demo-url.com) · [功能演示](#-功能演示) · [快速开始](#-快速开始) · [贡献指南](./CONTRIBUTING.md)
  
  <p>
    <strong>简体中文</strong> | 
    <a href="./README_EN.md">English</a>
  </p>
</div>

---

## 📸 功能演示

<div align="center">
  <img src="./docs/screenshots/hero.png" alt="首页" width="800"/>
  <p><i>精美的首页设计</i></p>
</div>

<div align="center">
  <img src="./docs/screenshots/editor.png" alt="编辑器" width="800"/>
  <p><i>强大的编辑器功能</i></p>
</div>

<div align="center">
  <img src="./docs/screenshots/templates.png" alt="模板" width="800"/>
  <p><i>多样化的简历模板</i></p>
</div>

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

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

### 贡献者

感谢所有为这个项目做出贡献的开发者！

<a href="https://github.com/Tomccc520/airesume/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tomccc520/airesume" />
</a>

## 📚 文档

- [开发者指南](./docs/DEVELOPER_GUIDE.md)
- [组件文档](./docs/COMPONENTS.md)
- [代码风格指南](./docs/STYLE_GUIDE.md)
- [Storybook 组件库](http://localhost:6006) (开发环境)

## 🗺️ 路线图

- [x] 基础编辑器功能
- [x] AI 辅助写作
- [x] 多模板支持
- [x] PDF/图片导出
- [x] 国际化支持
- [x] Storybook 组件文档
- [ ] 简历版本管理
- [ ] 职位匹配度分析
- [ ] 更多 AI 模型支持 (Ollama, Claude 等)
- [ ] 简历分享功能
- [ ] 移动端适配

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Tomccc520/airesume&type=Date)](https://star-history.com/#Tomccc520/airesume&Date)

## 📞 联系我们

- 网站: [https://fsuied.com](https://fsuied.com)
- 作者: [Tomda](https://www.tomda.top)
- GitHub 仓库: [Tomccc520/airesume](https://github.com/Tomccc520/airesume)
- Gitee 仓库: [tomdac/airesume](https://gitee.com/tomdac/airesume)
- Issues: [GitHub Issues](https://github.com/Tomccc520/airesume/issues)
- Discussions: [GitHub Discussions](https://github.com/Tomccc520/airesume/discussions)

## 📄 开源协议

[MIT](./LICENSE) License © 2025 [UIED技术团队](https://fsuied.com)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️ Star！</p>
  <p>Made with ❤️ by <a href="https://fsuied.com">UIED技术团队</a></p>
</div>
