# 简历模板布局类型总结

## 📋 标准布局类型（市面常用）

### 1. **单栏布局 (Single Column)**
- **特点**: 内容从上到下单列排列，最传统的简历格式
- **适用场景**: 通用，适合各行业
- **模板示例**:
  - `modern-minimalist` - 现代极简
  - `centered-symmetric` - 居中对称

### 2. **上下栏布局 (Top-Bottom Layout)** ✨ 新增
- **特点**: 
  - 顶部区域：个人信息、联系方式、技能（带边框分隔）
  - 底部区域：工作经历、教育背景、项目经历
- **适用场景**: 强调技能展示，适合技术岗位和专业人士
- **模板示例**:
  - `top-bottom-business` - 商务专业（上下栏）
- **组件**: `TopBottomLayout.tsx`

### 3. **左右栏布局 (Two Columns)**
- **特点**: 左右分栏，通常左侧30-40%，右侧60-70%
- **适用场景**: 内容较多，需要合理分配空间
- **模板示例**:
  - `creative-designer` - 创意设计师（左右栏）
- **组件**: `CreativeDesigner.tsx`

### 4. **侧边栏布局 (Sidebar)**
- **特点**: 左侧彩色侧边栏（通常25-35%），右侧白色主内容区
- **适用场景**: 现代专业，视觉冲击力强
- **模板示例**:
  - `professional-executive` - 高管专业（侧边栏）
  - `modern-sidebar` - 现代侧边栏
- **组件**: `ModernSidebar.tsx`

### 5. **顶部横幅布局 (Header Banner)**
- **特点**: 顶部彩色横幅区域，下方单栏内容
- **适用场景**: 现代时尚，适合创意行业
- **模板示例**:
  - `header-banner` - 顶部横幅
  - `gradient-header` - 渐变头部
- **组件**: `GradientHeader.tsx`

---

## 🔧 技术实现

### 模板组件映射 (ResumePreview.tsx)

```typescript
// 1. 上下栏布局
if (isTopBottom) {
  return <TopBottomLayout />
}

// 2. 侧边栏布局
if (isSidebar || templateId.includes('sidebar')) {
  return <ModernSidebar />
}

// 3. 顶部横幅布局
if (hasGradientHeader || templateId.includes('header')) {
  return <GradientHeader />
}

// 4. 左右栏布局
if (isDoubleColumn) {
  return <CreativeDesigner />
}

// 5. 单栏布局
return <ModernMinimalist />
```

### 布局识别规则

- **上下栏**: `templateId.includes('top-bottom')`
- **侧边栏**: `leftWidth <= 32` 且 `columns.count === 2`
- **左右栏**: `leftWidth > 32` 且 `columns.count === 2`
- **顶部横幅**: `templateId.includes('header') || templateId.includes('banner')`
- **单栏**: `columns.count === 1`

---

## 📊 模板配置示例

### 上下栏布局配置
```typescript
{
  id: 'top-bottom-business',
  name: '商务专业（上下栏）',
  layout: {
    columns: { count: 1, gap: '2rem' },
    spacing: { section: '2rem', item: '1rem', line: '0.5rem' }
  }
}
```

### 侧边栏布局配置
```typescript
{
  id: 'professional-executive',
  name: '高管专业（侧边栏）',
  layout: {
    columns: { count: 2, gap: '0', leftWidth: '30%', rightWidth: '70%' }
  }
}
```

### 左右栏布局配置
```typescript
{
  id: 'creative-designer',
  name: '创意设计师（左右栏）',
  layout: {
    columns: { count: 2, gap: '2rem', leftWidth: '35%', rightWidth: '65%' }
  }
}
```

---

## ✅ 优化内容

### 性能优化
1. ✅ 移除了模板选择器的卡顿动画
2. ✅ 移除了 `backdrop-blur` 模糊效果
3. ✅ 简化了按钮动画和过渡效果
4. ✅ 移除了模板卡片的逐个延迟加载

### 布局完善
1. ✅ 新增上下栏布局类型
2. ✅ 创建 `TopBottomLayout.tsx` 组件
3. ✅ 在 `ResumePreview.tsx` 中添加布局识别
4. ✅ 添加 `top-bottom-business` 模板到热门列表

---

## 📝 使用说明

### 如何添加新的上下栏模板

1. 在 `templates.ts` 中添加模板配置，ID 包含 `top-bottom`
2. 模板会自动使用 `TopBottomLayout` 组件渲染
3. 可以通过 `styleConfig` 自定义颜色、字体、间距等

### 样式设置支持

所有布局类型都支持以下样式设置：
- ✅ 字体大小调整
- ✅ 颜色主题
- ✅ 间距调整
- ✅ 技能展示样式（tags/progress/list/cards）
- ✅ 联系方式布局
- ✅ 头像显示

---

## 🎯 总结

现在简历系统支持 **5 种标准布局类型**：
1. 单栏布局 ✅
2. 上下栏布局 ✅ (新增)
3. 左右栏布局 ✅
4. 侧边栏布局 ✅
5. 顶部横幅布局 ✅

所有布局都遵循市面上常见的简历格式，用户可以根据职业和个人喜好选择合适的模板。

---

**更新日期**: 2026.1.29  
**作者**: UIED技术团队

