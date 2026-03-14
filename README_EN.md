# AI Resume - Intelligent Resume Builder

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING_EN.md)

<div align="center">
  <h3>🚀 Modern, Beautiful AI-Powered Resume Builder</h3>
  <p>Real-time Preview · AI Writing Assistant · Multiple Templates · High-Quality Export</p>
  
  [Live Demo](https://your-demo-url.com) · [Features](#-features) · [Quick Start](#-quick-start) · [Contributing](./CONTRIBUTING_EN.md)
  
  <p>
    <a href="./README.md">简体中文</a> | 
    <strong>English</strong>
  </p>
</div>

---

## 📸 Screenshots

<div align="center">
  <img src="./docs/screenshots/hero.png" alt="Homepage" width="800"/>
  <p><i>Beautiful Homepage Design</i></p>
</div>

<div align="center">
  <img src="./docs/screenshots/editor.png" alt="Editor" width="800"/>
  <p><i>Powerful Editor Features</i></p>
</div>

<div align="center">
  <img src="./docs/screenshots/templates.png" alt="Templates" width="800"/>
  <p><i>Diverse Resume Templates</i></p>
</div>

## ✨ Features

- **👀 WYSIWYG**: Real-time preview with A4 paper simulation
- **🤖 AI Assistant**: Integrated AI writing features for automatic content generation and optimization (supports SiliconFlow/DeepSeek)
- **🎨 Multiple Templates**: Built-in professional resume templates (Modern, Classic, Minimal, Creative) with one-click switching
- **🛠 Powerful Editor**:
  - Drag-and-drop module reordering
  - Real-time font, size, spacing, and color adjustments
  - Keyboard shortcuts (Ctrl/Cmd + S to save)
- **📥 High-Quality Export**: Export as PDF (A4-optimized), PNG, or JPG
- **🔒 Privacy First**: All data stored locally in browser (LocalStorage), never uploaded to servers
- **🌍 Internationalization**: One-click switch between Chinese and English interfaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open your browser and visit [http://localhost:3002](http://localhost:3002)

## 📦 Build & Deploy

```bash
npm run build
npm start
```

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context + Hooks
- **Libraries**: 
  - `html2canvas` / `jspdf`: Export functionality
  - `lucide-react`: Icon library
  - `dnd-kit`: Drag-and-drop sorting

## 📝 Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── editor/       # Editor-related components
│   ├── ai/           # AI components
│   ├── templates/    # Resume templates
│   └── ui/           # UI components
├── contexts/         # Global state contexts
├── data/             # Static data and template definitions
├── hooks/            # Custom hooks
├── i18n/             # Internationalization
├── services/         # Business logic (AI, export, etc.)
├── styles/           # Global styles
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🤝 Contributing

We welcome all forms of contributions! Please check our [Contributing Guide](./CONTRIBUTING_EN.md) for details.

### Contributors

Thanks to all the developers who have contributed to this project!

<a href="https://github.com/Tomccc520/airesume/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tomccc520/airesume" />
</a>

## 📚 Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Component Documentation](./docs/COMPONENTS.md)
- [Style Guide](./docs/STYLE_GUIDE.md)
- [Storybook Component Library](http://localhost:6006) (Development)

## 🗺️ Roadmap

- [x] Basic editor functionality
- [x] AI writing assistant
- [x] Multiple template support
- [x] PDF/Image export
- [x] Internationalization
- [x] Storybook component documentation
- [ ] Resume version management
- [ ] Job description matching analysis
- [ ] More AI model support (Ollama, Claude, etc.)
- [ ] Resume sharing functionality
- [ ] Mobile responsive design

## 🌟 Why Choose AI Resume?

### For Job Seekers
- **Save Time**: AI-powered content generation saves hours of writing
- **Professional Templates**: Designed by professionals, ATS-friendly
- **Privacy Protected**: All data stays in your browser
- **Free & Open Source**: No hidden costs, fully transparent

### For Developers
- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Well Documented**: Comprehensive documentation and code comments
- **Easy to Extend**: Modular architecture, easy to add new features
- **Active Community**: Regular updates and responsive maintainers

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Tomccc520/airesume&type=Date)](https://star-history.com/#Tomccc520/airesume&Date)

## 📞 Contact

- Website: [https://fsuied.com](https://fsuied.com)
- Author: [Tomda](https://www.tomda.top)
- GitHub Repository: [Tomccc520/airesume](https://github.com/Tomccc520/airesume)
- Gitee Repository: [tomdac/airesume](https://gitee.com/tomdac/airesume)
- Issues: [GitHub Issues](https://github.com/Tomccc520/airesume/issues)
- Discussions: [GitHub Discussions](https://github.com/Tomccc520/airesume/discussions)

## 📄 License

[MIT](./LICENSE) License © 2025 [UIED Tech Team](https://fsuied.com)

---

<div align="center">
  <p>If this project helps you, please give us a ⭐️ Star!</p>
  <p>Made with ❤️ by <a href="https://fsuied.com">UIED Tech Team</a></p>
</div>
