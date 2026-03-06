---
inclusion: always
---

# AI 简历编辑器项目指南

## 项目概述

这是一个基于 Next.js 14 的在线简历编辑器，支持 AI 辅助生成、多模板切换、实时预览和多格式导出。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI 库**: React 18 + Tailwind CSS + Framer Motion
- **状态管理**: React Context + useState/useCallback
- **国际化**: 自定义 i18n (`src/i18n/locales.ts`)
- **图标**: Lucide React (禁止使用 emoji)
- **导出**: html2canvas + jsPDF

## 代码规范

### 文件头部注释规范
所有新创建的文件必须包含标准的版权注释头部：

```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 组件功能描述
 */
```

### 组件规范
1. 使用函数式组件 + TypeScript
2. 客户端组件必须添加 `'use client'` 指令
3. Props 接口命名: `ComponentNameProps`
4. 使用 `useCallback` 优化回调函数
5. 使用 `useMemo` 优化计算密集型操作

### 样式规范
1. 优先使用 Tailwind CSS 类名
2. 复杂样式使用内联样式对象
3. 响应式断点: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
4. 动画使用 Framer Motion

### 国际化规范
1. 所有用户可见文本必须使用 `t.xxx` 翻译键
2. 新增文本需同时添加中英文翻译
3. 翻译文件: `src/i18n/locales.ts`
4. 使用 `useLanguage()` hook 获取翻译

## 目录结构

```
src/
├── app/                    # 页面路由
│   ├── api/               # API 路由
│   │   ├── ai/           # AI 相关 API
│   │   └── performance/  # 性能监控 API
│   ├── editor/           # 编辑器页面
│   └── page.tsx          # 首页
├── components/            # 可复用组件
│   ├── ai/               # AI 功能组件
│   │   ├── AIConfigGuide.tsx
│   │   ├── JDMatcherModal.tsx
│   │   ├── MatchScoreDisplay.tsx
│   │   └── ProgressIndicator.tsx
│   ├── data/             # 数据管理组件
│   │   ├── ImportExportDialog.tsx
│   │   └── StorageMonitor.tsx
│   ├── editor/           # 编辑器相关组件
│   │   ├── BatchEditToolbar.tsx
│   │   ├── ColorSchemeManager.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── StylePresetSelector.tsx
│   │   ├── StyleSettingsPanel.tsx
│   │   ├── ThreeColumnLayout.tsx
│   │   └── ...Form.tsx   # 各种表单组件
│   ├── export/           # 导出相关组件
│   │   ├── ExportProgressIndicator.tsx
│   │   └── PageBreakPreview.tsx
│   ├── feedback/         # 反馈组件
│   │   ├── ConfirmDialog.tsx
│   │   ├── LoadingOverlay.tsx
│   │   └── SaveStatusIndicator.tsx
│   ├── preview/          # 预览相关组件
│   │   ├── PreviewPanel.tsx
│   │   ├── PreviewToolbar.tsx
│   │   └── PreviewSkeleton.tsx
│   └── templates/        # 模板渲染组件
│       ├── ModernSidebar.tsx
│       ├── GradientHeader.tsx
│       ├── ClassicElegant.tsx
│       └── MinimalClean.tsx
├── contexts/             # React Context
│   ├── LanguageContext.tsx
│   ├── ResumeContext.tsx
│   └── StyleContext.tsx
├── hooks/                # 自定义 Hooks
│   ├── useAutoSave.ts
│   ├── useBatchSelection.ts
│   ├── useColorSchemes.ts
│   ├── useContextMenu.ts
│   ├── useExportProgress.ts
│   ├── useGlobalShortcuts.ts
│   ├── useOptimizedState.ts
│   ├── usePreviewPagination.ts
│   ├── useRealtimePreview.ts
│   └── useStorageMonitor.ts
├── services/             # 业务逻辑服务
│   ├── aiResumeGenerator.ts  # AI 简历生成
│   ├── aiService.ts          # 通用 AI 调用
│   ├── dataExportService.ts  # 数据导入导出
│   ├── exportStyleCapture.ts # 导出样式捕获
│   ├── jdMatcher.ts          # JD 匹配分析
│   └── pageBreakService.ts   # 分页服务
├── data/                 # 静态数据
│   └── templates.ts      # 模板配置
├── types/                # TypeScript 类型定义
│   ├── i18n.ts
│   ├── resume.ts
│   └── template.ts
├── utils/                # 工具函数
│   ├── animationUtils.ts
│   ├── dateFormatter.ts
│   ├── performanceMonitor.ts
│   ├── resumeScorer.ts
│   └── validation.ts
├── i18n/                 # 国际化配置
│   └── locales.ts
└── styles/               # 全局样式
    ├── design-system.css
    └── print.css
```

## 核心功能模块

### 编辑器布局
- `ThreeColumnLayout`: 三栏布局组件，支持拖拽调整宽度
- `StyleSettingsPanel`: 样式设置面板（右侧抽屉，默认展开）
- `SectionNavigation`: 模块导航

### 样式系统
- `StyleContext`: 全局样式状态管理
- `StylePresetSelector`: 样式预设选择器
- `ColorSchemeManager`: 配色方案管理

### 预览系统
- `PreviewPanel`: 预览面板，支持缩放和分页
- `ResumePreview`: 简历预览渲染
- 模板组件: `ModernSidebar`, `GradientHeader`, `ClassicElegant`, `MinimalClean`

### 导出功能
- 支持格式: PDF, PNG, JPG
- `exportStyleCapture`: 确保导出样式一致
- `ExportProgressIndicator`: 导出进度显示

### AI 集成
- AI 配置存储在 `localStorage('ai-config')`
- `jdMatcher`: JD 匹配分析服务
- `aiResumeGenerator`: AI 简历生成

## 常用 Hooks

| Hook | 用途 |
|------|------|
| `useLanguage()` | 获取翻译函数 t 和当前语言 |
| `useStyle()` | 获取和更新样式配置 |
| `useAutoSave()` | 自动保存功能 |
| `useRealtimePreview()` | 实时预览更新 |
| `useBatchSelection()` | 批量选择功能 |
| `useContextMenu()` | 右键菜单功能 |
| `useExportProgress()` | 导出进度追踪 |

## 常见问题

### 导出样式不一致
- 使用 `exportStyleCapture.cloneAndPrepareForExport()` 克隆元素
- 等待字体加载: `await document.fonts.ready`
- 设置 `scale: 2` 保证清晰度

### 国际化文本未显示
- 检查翻译键是否存在于 `locales.ts`
- 确保使用 `useLanguage()` hook

### 模板切换丢失数据
- 模板切换只应改变样式，不应修改 `resumeData`

### 预览文字重叠
- 检查 `lineHeight` 计算: `spacing.line / fontSize.content`
- 确保模板组件正确使用 `styleConfig` 中的间距值
