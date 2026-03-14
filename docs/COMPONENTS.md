# 组件文档索引

本目录包含所有组件的详细文档。

## 📚 文档结构

- [UI 组件](#ui-组件)
- [编辑器组件](#编辑器组件)
- [AI 组件](#ai-组件)
- [模板组件](#模板组件)

---

## UI 组件

### Button 按钮

通用按钮组件，支持多种样式和尺寸。

**位置**: `src/components/ui/button.tsx`

**Props**:
- `variant`: 样式变体 (default | destructive | outline | secondary | ghost | link)
- `size`: 尺寸 (sm | default | lg | icon)
- `disabled`: 是否禁用
- `asChild`: 是否作为子组件渲染

**示例**:
```tsx
<Button variant="default" size="lg">
  点击我
</Button>
```

**Storybook**: 查看 [Button Stories](../src/components/ui/button.stories.tsx)

---

## 编辑器组件

### ResumeEditor 简历编辑器

主编辑器组件，提供简历编辑功能。

**位置**: `src/components/ResumeEditor.tsx`

**功能**:
- 实时编辑
- 自动保存
- 拖拽排序
- 样式自定义

### EditorToolbar 编辑器工具栏

编辑器顶部工具栏，提供常用操作。

**位置**: `src/components/EditorToolbar.tsx`

---

## AI 组件

### AIAssistant AI 助手

AI 辅助写作组件。

**位置**: `src/components/AIAssistant.tsx`

**功能**:
- 内容生成
- 内容优化
- 关键词建议

---

## 模板组件

### TemplateSelector 模板选择器

简历模板选择组件。

**位置**: `src/components/TemplateSelector.tsx`

**功能**:
- 模板预览
- 模板切换
- 模板筛选

---

## 📖 如何使用文档

1. **查看组件**: 在 Storybook 中查看组件的实时示例
2. **阅读源码**: 查看组件源码了解实现细节
3. **运行测试**: 查看测试文件了解组件行为
4. **参考示例**: 查看 Stories 文件了解使用方法

---

## 🔗 相关链接

- [开发者指南](./DEVELOPER_GUIDE.md)
- [贡献指南](../CONTRIBUTING.md)
- [Storybook](http://localhost:6006)

---

**UIED技术团队**

