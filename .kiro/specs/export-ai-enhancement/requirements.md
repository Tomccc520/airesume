# 需求文档

## 简介

本文档定义了 AI 简历编辑器项目中导出功能优化和 AI 功能增强的需求。当前导出的 PDF/图片与页面预览显示存在不一致问题，需要修复样式捕获和渲染问题。同时需要完善 AI 相关功能，提升用户体验。

## 术语表

- **Export_Service**: 导出服务，负责将简历内容导出为 PDF、PNG、JPG 等格式的服务模块
- **Style_Capture**: 样式捕获器，负责捕获预览元素的计算样式并确保导出时样式一致性的组件
- **AI_Service**: AI 服务，负责调用 AI API 生成简历内容建议的服务模块
- **JD_Matcher**: 职位描述匹配器，分析职位描述并与简历内容进行匹配的服务
- **Preview_Panel**: 预览面板，实时显示简历渲染效果的组件
- **Page_Break_Service**: 分页服务，负责检测内容块和计算最佳分页位置的服务

## 需求

### 需求 1：导出样式一致性

**用户故事：** 作为用户，我希望导出的 PDF/图片与预览显示完全一致，以便获得所见即所得的导出体验。

#### 验收标准

1. WHEN 用户点击导出按钮 THEN Export_Service SHALL 捕获预览面板的所有计算样式并应用到导出内容
2. WHEN 导出内容包含 CSS 变量 THEN Style_Capture SHALL 将所有 CSS 变量解析为实际值后再进行渲染
3. WHEN 导出内容使用自定义字体 THEN Export_Service SHALL 等待字体加载完成后再进行渲染，超时时使用备用字体
4. WHEN 导出内容包含响应式布局类 THEN Style_Capture SHALL 将响应式样式转换为固定样式
5. WHEN 导出前进行样式预检 THEN Style_Capture SHALL 检测并报告字体不可用、CSS 变量未解析、颜色值无效等问题
6. IF 导出样式与预览样式存在差异 THEN Export_Service SHALL 在导出前提示用户并显示差异详情

### 需求 2：多页导出优化

**用户故事：** 作为用户，我希望多页简历导出时分页合理，不会在不恰当的位置断开内容。

#### 验收标准

1. WHEN 简历内容超过一页 THEN Page_Break_Service SHALL 自动检测最佳分页位置
2. WHEN 检测分页位置时 THEN Page_Break_Service SHALL 避免在段落中间、列表项中间、标题与内容之间分页
3. WHEN 内容块无法避免被分割时 THEN Export_Service SHALL 在下一页顶部重复显示该模块的标题
4. WHEN 导出多页内容时 THEN Export_Service SHALL 显示当前处理的页码和总页数
5. WHEN 用户查看分页预览时 THEN Preview_Panel SHALL 显示分页线位置和每页内容高度

### 需求 3：导出进度与反馈

**用户故事：** 作为用户，我希望在导出过程中看到清晰的进度反馈，了解当前处理状态。

#### 验收标准

1. WHEN 导出开始时 THEN Export_Service SHALL 显示进度指示器，包含当前步骤描述
2. WHEN 导出过程中 THEN Export_Service SHALL 实时更新进度百分比和预估剩余时间
3. WHEN 导出失败时 THEN Export_Service SHALL 显示错误信息并提供重试选项
4. WHEN 导出成功时 THEN Export_Service SHALL 显示完成提示并自动触发文件下载
5. WHERE 用户需要取消导出 THEN Export_Service SHALL 提供取消按钮并正确清理资源

### 需求 4：AI 配置管理

**用户故事：** 作为用户，我希望能够方便地配置和管理 AI 服务，以便使用 AI 辅助功能。

#### 验收标准

1. WHEN 用户首次使用 AI 功能 THEN AI_Service SHALL 检测配置状态并显示配置引导
2. WHEN 用户选择免费模型 THEN AI_Service SHALL 无需 API 密钥即可使用
3. WHEN 用户配置自定义 API THEN AI_Service SHALL 验证 API 连接并显示验证结果
4. WHEN AI 配置发生变化 THEN AI_Service SHALL 自动保存配置到本地存储
5. IF AI 服务不可用 THEN AI_Service SHALL 显示友好的错误提示并建议解决方案

### 需求 5：AI 内容生成增强

**用户故事：** 作为用户，我希望 AI 能够生成高质量的简历内容建议，帮助我优化简历。

#### 验收标准

1. WHEN 用户请求 AI 生成内容 THEN AI_Service SHALL 支持流式输出，实时显示生成内容
2. WHEN AI 生成个人简介时 THEN AI_Service SHALL 生成至少 5 个不同风格的版本供用户选择
3. WHEN AI 生成工作经历描述时 THEN AI_Service SHALL 突出具体成就和量化结果
4. WHEN AI 生成内容时 THEN AI_Service SHALL 显示生成进度指示器
5. IF AI 生成失败 THEN AI_Service SHALL 提供明确的错误信息和重试选项

### 需求 6：JD 匹配分析增强

**用户故事：** 作为用户，我希望能够分析简历与职位描述的匹配度，获得针对性的优化建议。

#### 验收标准

1. WHEN 用户粘贴职位描述 THEN JD_Matcher SHALL 自动检测行业类型并使用对应的关键词库
2. WHEN 分析匹配度时 THEN JD_Matcher SHALL 将关键词分类为必需、优先、加分项三个级别
3. WHEN 显示匹配结果时 THEN JD_Matcher SHALL 显示匹配分数、匹配的关键词和缺失的关键词
4. WHEN 生成优化建议时 THEN JD_Matcher SHALL 针对不同简历模块提供具体的优化建议
5. WHEN 用户编辑建议内容时 THEN JD_Matcher SHALL 支持内联编辑并保存修改后的建议
6. WHERE 用户需要应用建议 THEN JD_Matcher SHALL 提供一键应用单个建议或全部建议的功能
