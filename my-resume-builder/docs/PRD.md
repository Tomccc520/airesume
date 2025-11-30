/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

# 产品需求文档（PRD）——我的简历编辑器

## 文档概述
- 文档类型：产品需求文档（PRD）
- 项目名称：我的简历编辑器（My Resume Builder）
- 产品版本：v1.0.0（持续迭代）
- 目标平台：Web（PC、移动端）
- 技术栈：Next.js 14、React 18、TypeScript、Tailwind CSS
- 入口页面：`/editor`（编辑器页面，参考 `src/app/editor/page.tsx:45`）

## 产品目标
- 在浏览器中快速创建、编辑并导出高质量简历，支持实时预览与多模板切换。
- 提供便捷的导入/导出与自动保存，降低内容丢失风险。
- 提供基础 AI 助手能力，辅助生成简历段落与结构。

## 核心价值
- 快速：实时预览与快捷键缩短反馈路径。
- 稳定：自动保存、备份恢复、多格式导出降低风险。
- 易用：移动端手势切换、模板选择器、工具栏操作集中。

## 用户画像与使用场景
- 毕业生与求职者：快速生成并导出简历用于投递。
- 职场人士：维护不同岗位/企业版本，频繁调整内容与样式。
- 招聘顾问/培训机构：为客户批量构建与优化简历。

## 范围与优先级
- P0：编辑器与预览、模板选择、自动保存与备份、PDF/PNG/JPG 导出。
- P1：AI 助手、快捷键与手势、预览缩放与辅助线/分页标识。
- P2：DOCX 导出、高级打印/分页控制、多语言模板素材库。

## 功能需求
### 编辑器
- `ResumeEditor` 动态导入：`src/app/editor/page.tsx:36`。
- 数据更新：`onUpdateResumeData` 双向绑定 `src/app/editor/page.tsx:788-808`。
- 分区状态：`activeSection` 切换 `src/app/editor/page.tsx:804-807`。

### 预览
- 预览容器与缩放：`ResumePreview` 渲染 `src/app/editor/page.tsx:856-862`。
- 预览控制面板：`PreviewControls` `src/app/editor/page.tsx:839-847`。
- A4 适配与滚动：`src/app/editor/page.tsx:853-865`；样式 `src/styles/print.css:5-78`。

### 模板
- 模板选择器：`TemplateSelector` 弹窗 `src/app/editor/page.tsx:1052-1071`。
- 应用模板：`handleTemplateSelect` 更新状态 `src/app/editor/page.tsx:565-577`。

### 导入导出
- 导出 `pdf/png/jpg/docx`：`handleExport` 实现 `src/app/editor/page.tsx:302-540`。
- JSON 导出与导入：`handleExportJSON/handleImportJSON` `src/app/editor/page.tsx:196-210, 215-249`。
- 导出预览对话框：`ExportPreviewDialog` `src/app/editor/page.tsx:1075-1086`。

### 自动保存与备份
- 自动保存：`useAutoSave` `src/app/editor/page.tsx:169-185`。
- 本地存储备份恢复：`useEffect` `src/app/editor/page.tsx:254-274`。

### 快捷操作与交互
- 键盘快捷键：`useKeyboardShortcuts/createEditorShortcuts` `src/app/editor/page.tsx:698-705, 1007-1039`。
- 移动端手势：`useHorizontalSwipe` 切换编辑/预览 `src/app/editor/page.tsx:706-725`。
- 手势 Hook 能力：`useSwipeGesture` 增强版 `src/hooks/useSwipeGesture.ts:71`。

### AI 助手
- 弹窗：`AIAssistant` `src/app/editor/page.tsx:875-1004`。
- 一键生成：`handleAIGenerateResume` `src/app/editor/page.tsx:583-676`。
- 配置校验：`localStorage('ai-config')` `src/app/editor/page.tsx:585-606`。

### 布局与样式
- 根布局与全局样式：`src/app/layout.tsx:31-41`、`src/app/globals.css:1-12`。
- 设计系统（按钮、卡片、输入框）：`src/styles/design-system.css:148-516`。

## 交互与 UX 规范
- 布局：PC 并排；移动端单视图显示，顶部切换按钮+手势。
- 预览缩放：移动端下拉，桌面用控制面板。
- 手势：左滑预览、右滑编辑，仅在 `<1024px` 生效；角度容差与轴锁定减少误判。
- 保存与反馈：自动保存提示；错误 toast/alert；备份恢复提示。

## 信息架构与数据结构
- 核心模型 `ResumeData` 初始化示例：`src/app/editor/page.tsx:79-143`。
  - `personalInfo`、`experience[]`、`education[]`、`skills[]`、`projects[]`。
- 本地存储键：`resumeData`、`resumeData_backup`、`resumeData_timestamp`、`ai-config`。

## 非功能性需求
- 性能：编辑器动态导入；预览缩放平滑；导出过程提示。
- 可靠性：自动保存 + 备份恢复；导入大小限制与校验。
- 兼容性：统一触摸与指针事件；响应式布局控制可见性。
- 安全性：不存储敏感信息；不输出私密日志。

## 接口与集成
- AI 生成：`AIResumeGenerator.generateCompleteResume(userInfo)`；配置 `apiKey/provider/modelName` 来源 `localStorage('ai-config')`。
- 导出：`html2canvas` + `jspdf` 实现 PDF 分页；`html-to-docx` 生成 DOCX。

## 埋点与指标（建议）
- 使用：编辑时长、模板切换、导出次数与格式分布、AI 使用次数与成功率。
- 性能：预览更新耗时、渲染耗时、自动保存耗时。
- 质量：导出失败率、导入失败率、备份恢复触发率。

## 验收标准
- 编辑与预览：PC/移动端显示稳定；实时预览与缩放正常；网格与分页标识切换正常。
- 保存与导入导出：自动保存按周期执行；JSON 导入校验与异常反馈；PDF/PNG/JPG/DOCX 导出成功且版式正确。
- AI 助手：未配置提示；配置完整后生成并合并入编辑器。
- 手势交互：移动端左右滑稳定且不影响滚动。

## 发布计划
- 开发：`npm run dev` `http://localhost:3001/`。
- 构建：`npm run build`；生产启动：`npm run start`；需 `NODE_ENV=production`。
- 检查：静态资源与 CSP、路由与错误页。

## 风险与对策
- 导出大画面内存压力 → 分页导出/降低缩放/进度反馈。
- AI 配置差异 → 完整校验与引导、明确错误提示。
- 手势与滚动冲突 → 锁轴后再阻止默认、默认不阻止滚动。

## 后续迭代建议
- 完成打印分页控制与更精细的 A4 适配。
- 模板市场与主题风格配置。
- AI 场景扩展（职位 JD 自动对齐）。
- 多语言支持与国际化模板。