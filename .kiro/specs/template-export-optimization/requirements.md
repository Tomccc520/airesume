# 需求文档

## 简介

本文档定义了简历编辑器模板选择器组件优化和导出样式问题修复的需求。优化主要集中在三个方面：重构过大的 TemplateSelector.tsx 文件（1074行）、提高代码可维护性、以及解决导出样式不一致问题（特别是 flex 布局和侧边栏模板）。

## 术语表

- **Template_Selector（模板选择器）**: 负责显示和选择简历模板的组件，位于 `src/components/TemplateSelector.tsx`
- **Career_Template_Data（职业模板数据）**: 特定职业类型的预填充简历数据（UI设计师、前端开发等）
- **Export_Service（导出服务）**: 负责在简历导出时捕获和应用样式的服务，位于 `src/services/exportStyleCapture.ts`
- **Sidebar_Template（侧边栏模板）**: 使用双栏 flex 布局和彩色侧边栏的简历模板（如 ModernSidebar）
- **Style_Capture（样式捕获）**: 从预览元素捕获计算后的 CSS 样式以确保导出一致性的过程

## 需求

### 需求 1：提取职业模板数据

**用户故事：** 作为开发者，我希望将职业模板数据从 TemplateSelector 组件中分离出来，以便代码库更易维护且组件文件大小减小。

**问题分析：** 当前 `TemplateSelector.tsx` 文件有 1074 行代码，其中 `getCareerTemplateData` 函数约占 600 行，包含了 UI设计师、前端开发、后端开发、运营专员、产品经理等 5 个职业模板的完整简历数据。这些数据应该抽离到独立的数据文件中。

#### 验收标准

1. 系统应创建新的数据文件 `src/data/careerTemplates.ts` 包含所有职业模板数据
2. 当 Template_Selector 需要职业模板数据时，系统应从专用数据文件导入
3. Career_Template_Data 文件应导出函数 `getCareerTemplateData(templateId: string)` 返回相应的 ResumeData
4. Career_Template_Data 文件应包含所有职业模板结构的 TypeScript 类型定义
5. 当添加新的职业模板时，系统应只需修改职业模板数据文件

### 需求 2：重构 TemplateSelector 组件

**用户故事：** 作为开发者，我希望 TemplateSelector 组件更小更专注，以便更容易理解和维护。

**问题分析：** 除了职业模板数据外，TemplateSelector 组件还包含了分类导航、模板网格、预览弹窗等多个功能模块。组件职责过多，需要拆分以提高可维护性。

#### 验收标准

1. Template_Selector 组件应减少到 500 行代码以下
2. 系统应在适当的地方将可复用的 UI 组件提取到单独的文件中
3. Template_Selector 应从外部数据文件导入 Career_Template_Data
4. 当 Template_Selector 渲染时，系统应保持相同的视觉外观和功能
5. 系统应保留所有现有的模板选择、预览和分类筛选功能

### 需求 3：修复侧边栏模板导出样式

**用户故事：** 作为用户，我希望导出的简历看起来与预览完全一致，以便我可以信任导出质量。

**问题分析：** ModernSidebar 模板使用 flex 布局，侧边栏宽度使用百分比（如 `width: 32%`）。html2canvas 在捕获时可能无法正确处理 flex 布局，导致侧边栏被挤压或背景色丢失。需要在导出前将百分比宽度转换为固定像素值。

#### 验收标准

1. 当导出 Sidebar_Template 时，Export_Service 应保持正确的侧边栏宽度比例
2. 当导出 flex 布局模板时，Export_Service 应将百分比宽度转换为固定像素值
3. Export_Service 应确保侧边栏背景色被完整捕获而不被压缩
4. 当导出过程开始时，系统应将内联样式应用到所有 flex 容器元素
5. 如果模板使用 CSS 变量进行布局，则 Export_Service 应在导出前将所有变量解析为计算值

### 需求 4：提高导出样式一致性

**用户故事：** 作为用户，我希望预览和导出之间的样式保持一致，以便我的简历在所有格式中看起来都很专业。

**问题分析：** 当前 ExportButton 组件直接使用 html2canvas 捕获预览元素，但没有充分利用 exportStyleCapture 服务进行样式预处理。Tailwind CSS 类名在导出时可能不被正确解析，需要转换为内联样式。

#### 验收标准

1. 当准备导出时，Export_Service 应克隆预览元素并将所有计算样式应用为内联样式
2. Export_Service 应将所有 Tailwind CSS 类转换为导出元素的内联样式
3. 当导出时，系统应等待所有字体加载完成后再捕获画布
4. Export_Service 应正确处理 flex-basis、flex-grow 和 flex-shrink 属性
5. 当检测到样式差异时，系统应记录包含不一致详情的警告

### 需求 5：优化模板预览组件

**用户故事：** 作为开发者，我希望 TemplatePreview 组件高效且易维护，以便模板预览快速渲染。

**问题分析：** TemplatePreview.tsx 存在未使用的导入（MapPin），且预览布局与实际模板组件的样式可能存在差异。需要清理代码并确保预览与实际渲染一致。

#### 验收标准

1. Template_Preview 组件应移除未使用的导入（如 MapPin 图标）
2. Template_Preview 应对昂贵的计算使用记忆化
3. 当渲染预览布局时，系统应使用与实际模板组件匹配的一致内联样式
4. Template_Preview 应支持所有现有的布局类型（sidebar、gradient、classic、minimal、creative、default）

### 需求 6：为 Flex 布局添加导出预处理

**用户故事：** 作为用户，我希望 flex 布局模板能正确导出，以便双栏设计保持其比例。

**问题分析：** ModernSidebar 模板的侧边栏宽度为 `32%`，主内容区为 `68%`。在 A4 页面宽度 794px 下，侧边栏应为约 254px，主内容区约 540px。需要在导出前进行这种转换以确保 html2canvas 正确捕获。

#### 验收标准

1. 当在导出元素中检测到 flex 容器时，Export_Service 应计算并应用固定宽度到 flex 子元素
2. Export_Service 应保留 flex 容器上的 min-height 和 height 属性
3. 当 flex 子元素使用百分比宽度时，Export_Service 应根据容器大小将其转换为像素宽度
4. 系统应递归处理嵌套的 flex 容器
5. 如果侧边栏宽度指定为百分比，则 Export_Service 应根据 A4 页面宽度（794px）计算像素等效值
