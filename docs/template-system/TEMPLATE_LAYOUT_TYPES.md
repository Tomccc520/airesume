# 简历模板布局类型说明

## 📋 概述

本文档说明简历模板系统中的两种标准布局类型：**上下栏布局**和**左右栏布局**。

更新日期：2026-01-29

---

## 🎨 布局类型

### 1. 上下栏布局 (Top-Bottom Layout)

**特点：**
- 单栏设计 (`columns.count = 1`)
- 内容从上到下垂直排列
- 适合内容较多、需要完整展示的场景
- 阅读流畅，适合打印

**适用场景：**
- 工作经历丰富
- 项目经验详细
- 学术背景复杂
- 需要详细描述的岗位

**模板数量：** 19个

**代表模板：**
- 现代极简 (modern-minimalist)
- 顶部横幅 (header-banner)
- 商务专业 (top-bottom-business)
- 时间线布局 (timeline-layout)
- 前端开发工程师 (frontend-developer)
- 后端开发工程师 (backend-developer)
- UI设计师-极简 (ui-designer-minimal)
- 平面设计师-优雅 (graphic-designer-elegant)
- 交互设计师-现代 (ux-designer-modern)
- HR专业版 (hr-professional)
- 招聘专员 (hr-recruiter)
- 市场经理 (marketing-manager)
- 内容运营 (content-marketing)
- 财务专业版 (finance-professional)
- 金融分析师 (finance-analyst)
- 通用-经典 (general-classic)
- 通用-极简 (general-minimal)

---

### 2. 左右栏布局 (Left-Right Layout)

**特点：**
- 双栏设计 (`columns.count = 2`)
- 左侧通常放置个人信息、技能、联系方式
- 右侧放置工作经历、项目经验、教育背景
- 信息密度高，版面利用率高

**适用场景：**
- 技能型岗位（设计师、程序员）
- 需要突出技能栈
- 内容较多但需要控制在一页
- 追求视觉冲击力

**模板数量：** 7个

**代表模板：**
- 创意设计师 (creative-designer)
- 高管专业 (professional-executive)
- UI设计师-现代 (ui-designer-modern)
- 平面设计师-创意 (graphic-designer-creative)
- 前端开发-侧边栏 (frontend-developer-sidebar)
- 全栈开发工程师 (fullstack-developer)
- 通用-现代 (general-modern)

---

## 🔧 技术实现

### 类型定义

```typescript
export interface TemplateStyle {
  // ... 其他字段
  /** 布局类型 - 上下栏或左右栏 */
  layoutType?: 'top-bottom' | 'left-right'
  
  layout: {
    columns: {
      count: 1 | 2  // 1=上下栏, 2=左右栏
      gap: string
      leftWidth?: string   // 仅左右栏布局使用
      rightWidth?: string  // 仅左右栏布局使用
    }
  }
}
```

### 布局判断逻辑

```typescript
// 获取模板的布局类型
const getTemplateLayoutType = (template: TemplateStyle): string => {
  // 优先使用模板定义的 layoutType
  if (template.layoutType) {
    return template.layoutType
  }
  // 兼容旧模板：根据 columns.count 判断
  return template.layout.columns.count === 2 ? 'left-right' : 'top-bottom'
}
```

---

## 📊 模板统计

| 布局类型 | 模板数量 | 占比 |
|---------|---------|------|
| 上下栏布局 | 19 | 73% |
| 左右栏布局 | 7 | 27% |
| **总计** | **26** | **100%** |

---

## 🎯 使用建议

### 选择上下栏布局的情况：

1. **内容丰富型简历**
   - 工作经历 > 3段
   - 项目经验详细
   - 需要完整描述职责和成果

2. **传统行业**
   - 金融、财务、人力资源
   - 政府机构、事业单位
   - 教育、医疗行业

3. **学术背景**
   - 研究经历丰富
   - 发表论文较多
   - 学术成果需要详细展示

### 选择左右栏布局的情况：

1. **技能导向型简历**
   - 设计师（UI/UX/平面）
   - 程序员（前端/后端/全栈）
   - 技术岗位

2. **创意行业**
   - 需要视觉冲击力
   - 追求设计感
   - 展示个性和创意

3. **内容控制**
   - 需要控制在一页内
   - 信息密度要求高
   - 突出关键技能

---

## 🔄 筛选功能

在模板选择器中，用户可以通过以下方式筛选布局类型：

1. **布局类型下拉菜单**
   - 所有布局
   - 上下栏布局
   - 左右栏布局

2. **模板卡片标签**
   - 每个模板卡片显示布局类型标签
   - 方便快速识别

3. **搜索功能**
   - 支持按布局类型搜索
   - 支持按模板名称、描述搜索

---

## 📝 更新记录

### 2026-01-29
- ✅ 统一所有模板为两种布局类型
- ✅ 移除名称中的布局标注（如"单栏"、"左右栏"）
- ✅ 添加 `layoutType` 字段到类型定义
- ✅ 更新所有26个模板的布局类型标记
- ✅ 优化筛选器，只显示两种布局选项
- ✅ 更新模板卡片的布局标签显示逻辑

### 布局类型分布
- 上下栏布局：19个模板 (73%)
- 左右栏布局：7个模板 (27%)

---

## 🎨 设计原则

1. **简洁明了**
   - 只保留两种主流布局类型
   - 避免过多选项造成选择困难

2. **语义清晰**
   - 使用直观的命名（上下栏、左右栏）
   - 避免技术术语（单栏、双栏、侧边栏）

3. **兼容性好**
   - 支持旧模板的自动识别
   - 新模板使用明确的 layoutType 字段

4. **用户友好**
   - 提供可视化的布局标签
   - 支持快速筛选和搜索

---

## 🚀 未来优化方向

1. **布局预览**
   - 添加布局示意图
   - 帮助用户更直观地理解布局差异

2. **智能推荐**
   - 根据用户的简历内容推荐合适的布局
   - 基于行业和岗位推荐

3. **自定义布局**
   - 允许用户调整左右栏宽度比例
   - 支持更灵活的布局配置

4. **响应式优化**
   - 移动端自动切换为上下栏布局
   - 提供更好的移动端体验

---

## 📚 相关文档

- [模板系统优化总结](./TEMPLATE_SELECTOR_OPTIMIZATION.md)
- [模板功能说明 V3](./TEMPLATE_FEATURES_V3.md)
- [模板布局总结](./TEMPLATE_LAYOUTS_SUMMARY.md)

---

**维护者：** UIED技术团队  
**最后更新：** 2026-01-29



