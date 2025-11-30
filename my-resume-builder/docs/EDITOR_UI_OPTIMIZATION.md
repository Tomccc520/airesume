/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

# 编辑器 UI 优化方案（基于现有功能与设计）

## 概述
- 目标：在不改变信息架构与核心功能的前提下，全面提升编辑器的视觉一致性、易用性与导出体验。
- 范围：页面布局、组件样式、预览区（A4适配/缩放/网格/分页）、导出体验（PDF/PNG/JPG/DOCX）、交互手势与可访问性。

## 现状问题（代码参考）
- 条件渲染与响应式类叠加导致样式抖动（已修复）：`src/app/editor/page.tsx:785, 810`
- 卡片视觉较弱，圆角与阴影层次不足（已优化）：`src/styles/design-system.css:359-371`
- 预览头部信息密度偏高，缺少吸顶与背景层次（已优化）：`src/app/editor/page.tsx:816-836`
- 打印/导出样式存在留白与背景色干扰（已有基础样式）：`src/styles/print.css:5-78, 83-154`

## 设计目标
- 一致性：统一面板头部、标题与容器卡片样式，减少视觉噪音。
- 亲和力：更舒适的圆角与阴影层次，提升卡片的“可点可读”感受。
- 专注度：预览区信息清晰，A4适配严谨，导出样式可控。
- 稳定性：移动端与桌面端显示稳定、手势识别稳健、滚动体验自然。

## 视觉规范（设计系统）
- 容器卡片 `.card`：采用 `rounded-xl + shadow-md + border-gray-200` 提升层次（`src/styles/design-system.css:359`）。
- 面板头部 `.panel-header`：半透明白背景 + 背景模糊 + 边框分隔（`src/styles/design-system.css:363-367`）。
- 标题 `.section-title`：统一字号层级与字重（`src/styles/design-system.css:369-371`）。
- 主体间距：桌面端主区域上下间距提升（`src/app/editor/page.tsx:736`）。

## 布局优化
- 移除渲染期 `window.innerWidth` 条件，完全使用响应式类控制显示，避免首次渲染错乱（`src/app/editor/page.tsx:785, 810`）。
- 左右栏在桌面并排、移动端单视图显示，顶部按钮与手势同步切换。

## 编辑器表单与工具栏
- 输入与按钮统一尺寸与间距，遵循设计系统（`design-system.css` 按钮与输入类）。
- 工具栏分组：保存/导出/预览/AI 操作分组展现，避免信息拥挤。

## 预览区优化
- A4 适配：严格宽高、页边距、分页控制样式（`src/styles/print.css:5-78`）。
- 缩放与辅助：移动端使用选择器，桌面端使用 `PreviewControls` 控件；网格与分页标识独立开关（`src/app/editor/page.tsx:839-847`）。
- 分页标记：为每个简历分区容器添加 `.resume-section`，避免断页（`src/styles/print.css:46-51`）。

## 导出体验优化
- PDF/PNG/JPG：已有分页分片与延迟下载，提示清晰（`src/app/editor/page.tsx:302-540`）。
- DOCX：使用 `html-docx-js` 浏览器端生成，避免 Node 模块构建失败（`src/app/editor/page.tsx:302-540`）。
- 导出模式：`export-mode` 清理背景、阴影与交互元素（`src/styles/print.css:83-154`）。

## 手势与交互
- 手势 Hook 增强：角度容差、轴锁定、取消与指针事件统一（`src/hooks/useSwipeGesture.ts:71`）。
- 移动端左右滑切换编辑/预览，仅在 `<1024px` 生效（`src/app/editor/page.tsx:706-725`）。

## 性能与可访问性
- 动态导入编辑器组件（首屏加速）：`src/app/editor/page.tsx:35-39`。
- 控件可访问性：按钮与标题使用语义化标签与焦点样式（`design-system.css` focus 类）。
- 滚动与阴影优化：在导出模式清除阴影与背景，减少渲染负担。

## 实施计划
- 阶段一（已完成）
  - 修复条件渲染导致的样式错乱；统一面板头部与卡片样式。
  - 完成 DOCX 导出浏览器端实现；优化导出模式样式。
- 阶段二（进行中/可执行）
  - 编辑区表单控件统一化（按钮、输入、分组标题、分隔线）。
  - 预览区分页标记补充到各分区容器（`.resume-section` 应用）。
  - 性能 HUD（渲染/更新耗时）轻量显示于预览栏头部右侧。
- 阶段三（规划）
  - 模板主题与配色预设；收藏与最近使用。
  - 更丰富的 AI 场景（基于职位 JD 自动对齐）。

## 验收标准
- 移动端与桌面端显示稳定，无闪烁与错乱；预览头部吸顶有效。
- 导出 PDF/PNG/JPG/DOCX 一致可用，A4 居中、分页合理、无背景干扰。
- 手势左右切换可靠，滚动体验自然；无明显斜向误判。
- 编辑器控件视觉统一，间距舒适；重要操作分组清晰。

## 参考标杆（AI 简历项目）
- Reactive Resume（开源、现代化风格、模板丰富）
- OpenResume（开源、简洁风格、结构明确）
- JSON Resume生态（主题多、结构化导出，利于模板扩展）

## 任务清单（落地建议）
- 在编辑器各分区容器添加 `.resume-section` 类，保障分页。
- 工具栏分组与尺寸统一，表单控件使用 `design-system.css` 规范类。
- 预览栏右侧新增性能 HUD（更新时间/渲染耗时简要）。
- 模板选择器增加“收藏/最近使用”入口与样式。

## 代码引用索引
- `src/app/editor/page.tsx:736, 785, 810, 816-836, 839-847, 853-865, 302-540`
- `src/styles/design-system.css:359-371`
- `src/styles/print.css:5-78, 83-154`
- `src/hooks/useSwipeGesture.ts:71`