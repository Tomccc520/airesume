# 版权信息审计报告

生成时间: 2026-01-17

## 概述

项目中共有 **42 个文件** 缺少标准版权注释头部。

## 缺少版权信息的文件分类

### 1. 类型定义文件 (2个)
- `src/types/html-to-docx.d.ts` - HTML to DOCX 类型定义
- `src/types/i18n.ts` - 国际化类型定义

### 2. 上下文文件 (1个)
- `src/contexts/LanguageContext.tsx` - 语言上下文

### 3. 应用页面 (4个)
- `src/app/error.tsx` - 错误页面
- `src/app/page.tsx` - 首页
- `src/app/global-error.tsx` - 全局错误页面
- `src/app/api/performance/route.ts` - 性能 API 路由

### 4. 配置文件 (1个)
- `src/config/performance.config.ts` - 性能配置

### 5. 工具函数 (3个)
- `src/utils/performanceMonitor.ts` - 性能监控工具
- `src/utils/dateFormatter.ts` - 日期格式化工具
- `src/utils/__tests__/performanceMonitor.test.ts` - 性能监控测试

### 6. 组件文件 (15个)

#### 通用组件 (2个)
- `src/components/ScrollFadeIn.tsx` - 滚动淡入动画组件
- `src/components/AnimatedBackground.tsx` - 动画背景组件

#### 模板组件 (5个)
- `src/components/templates/MinimalClean.tsx` - 极简清洁模板
- `src/components/templates/GradientHeader.tsx` - 渐变头部模板
- `src/components/templates/ClassicElegant.tsx` - 经典优雅模板
- `src/components/templates/ModernSidebar.tsx` - 现代侧边栏模板
- `src/components/templates/TemplateCard.tsx` - 模板卡片组件
- `src/components/templates/index.ts` - 模板导出文件

#### 预览组件 (1个)
- `src/components/preview/index.ts` - 预览组件导出文件

#### 编辑器组件 (6个)
- `src/components/editor/EditorHeader.tsx` - 编辑器头部
- `src/components/editor/SectionNavigation.tsx` - 分区导航
- `src/components/editor/ThreeColumnLayout.tsx` - 三栏布局
- `src/components/editor/EditableCard.tsx` - 可编辑卡片
- `src/components/editor/AddCardButton.tsx` - 添加卡片按钮
- `src/components/editor/SectionHeader.tsx` - 分区头部
- `src/components/editor/EditorSidebar.tsx` - 编辑器侧边栏

### 7. Hooks (6个)
- `src/hooks/useAIAssistant.ts` - AI 助手 Hook
- `src/hooks/useGlobalShortcuts.ts` - 全局快捷键 Hook
- `src/hooks/useImageOptimization.ts` - 图片优化 Hook
- `src/hooks/usePerformanceMonitor.ts` - 性能监控 Hook
- `src/hooks/__tests__/useResponsive.test.ts` - 响应式 Hook 测试
- `src/hooks/__tests__/useOptimizedState.property.test.ts` - 优化状态 Hook 属性测试

### 8. 国际化 (2个)
- `src/i18n/locales.ts` - 语言包
- `src/i18n/__tests__/i18nCompleteness.property.test.ts` - 国际化完整性测试

### 9. 数据文件 (2个)
- `src/data/navigation.ts` - 导航数据
- `src/data/__tests__/templates.property.test.ts` - 模板属性测试

### 10. 服务文件 (3个)
- `src/services/imageOptimization.ts` - 图片优化服务
- `src/services/__tests__/imageOptimization.test.ts` - 图片优化测试
- `src/services/__tests__/jdMatcher.property.test.ts` - JD 匹配属性测试

### 11. 测试文件 (3个)
- `src/components/__tests__/noEmoji.property.test.ts` - 无 Emoji 属性测试
- `src/components/preview/__tests__/previewPanel.property.test.ts` - 预览面板属性测试

## 标准版权注释格式

所有文件应添加以下格式的版权注释：

```typescript
/**
 * @file 文件路径/文件名
 * @description 文件功能描述
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */
```

## 建议操作

1. **优先级高** - 核心组件和页面（15个组件 + 4个页面）
2. **优先级中** - Hooks 和服务（6个 Hooks + 3个服务）
3. **优先级低** - 测试文件和类型定义（6个测试 + 2个类型）

## 注意事项

- 测试文件可以使用简化版本的版权注释
- 类型定义文件（.d.ts）可以选择性添加
- index.ts 导出文件可以使用简化注释
