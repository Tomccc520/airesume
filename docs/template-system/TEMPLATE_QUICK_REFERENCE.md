/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 模板系统快速参考
 */

# 模板系统快速参考

## 🎯 核心数据

### 模板总览
- **总模板数**: 26个
- **上下栏布局**: 15个
- **左右栏布局**: 11个
- **免费模板**: 26个
- **高级模板**: 0个

### 分类分布

| 分类 | 模板数 | 子分类 |
|------|--------|--------|
| 设计师 | 5 | UI设计(2)、平面设计(2)、交互设计(1) |
| 程序员 | 3 | 前端(2)、后端(1)、全栈(1) |
| 人力资源 | 2 | HR经理(1)、招聘专员(1) |
| 市场营销 | 2 | 市场经理(1)、内容运营(1) |
| 财务金融 | 2 | 会计(1)、分析师(1) |
| 通用模板 | 12 | 现代(4)、经典(2)、极简(3)、其他(3) |

## 📋 模板列表

### 上下栏布局模板 (15个)

| ID | 名称 | 分类 | 预览图 |
|----|------|------|--------|
| modern-minimalist | 现代极简 | 通用-极简 | minimal-gray.svg |
| header-banner | 顶部横幅 | 通用-现代 | gradient-header.svg |
| centered-symmetric | 居中对称 | 通用-经典 | classic-blue.svg |
| top-bottom-business | 商务专业 | 通用-现代 | professional-navy.svg |
| timeline-layout | 时间线布局 | 通用-现代 | modern-green.svg |
| ui-designer-minimal | UI设计师-极简 | 设计师-UI | minimal-gray.svg |
| graphic-designer-elegant | 平面设计师-优雅 | 设计师-平面 | elegant-rose.svg |
| ux-designer-modern | 交互设计师-现代 | 设计师-交互 | gradient-header.svg |
| frontend-developer | 前端开发工程师 | 程序员-前端 | tech-future.svg |
| backend-developer | 后端开发工程师 | 程序员-后端 | career-backend-developer.svg |
| hr-professional | HR专业版 | 人力资源-HR经理 | professional-navy.svg |
| hr-recruiter | 招聘专员 | 人力资源-招聘 | modern-green.svg |
| marketing-manager | 市场经理 | 市场营销-经理 | gradient-header.svg |
| content-marketing | 内容运营 | 市场营销-内容 | academic-clean.svg |
| finance-professional | 财务专业版 | 财务金融-会计 | classic-blue.svg |
| finance-analyst | 金融分析师 | 财务金融-分析师 | professional-navy.svg |
| general-classic | 通用-经典 | 通用-经典 | classic-blue.svg |
| general-minimal | 通用-极简 | 通用-极简 | minimal-gray.svg |

### 左右栏布局模板 (11个)

| ID | 名称 | 分类 | 预览图 |
|----|------|------|--------|
| creative-designer | 创意设计师 | 设计师-创意 | creative-purple.svg |
| professional-executive | 高管专业 | 通用-高管 | elegant-sidebar.svg |
| ui-designer-modern | UI设计师-现代 | 设计师-UI | creative-purple.svg |
| graphic-designer-creative | 平面设计师-创意 | 设计师-平面 | magazine-style.svg |
| frontend-developer-sidebar | 前端开发-侧边栏 | 程序员-前端 | elegant-sidebar.svg |
| fullstack-developer | 全栈开发工程师 | 程序员-全栈 | tech-orange.svg |
| general-modern | 通用-现代 | 通用-现代 | elegant-sidebar.svg |

## 🔥 热门模板 (8个)

1. general-modern - 通用-现代
2. top-bottom-business - 商务专业
3. creative-designer - 创意设计师
4. professional-executive - 高管专业
5. frontend-developer - 前端开发工程师
6. ui-designer-modern - UI设计师-现代
7. hr-professional - HR专业版
8. marketing-manager - 市场经理

## 🎨 常用颜色方案

### 蓝色系
```typescript
colors: {
  primary: '#2563eb',
  secondary: '#3b82f6',
  accent: '#60a5fa',
  text: '#1f2937',
  background: '#ffffff'
}
```

### 紫色系
```typescript
colors: {
  primary: '#7c3aed',
  secondary: '#a78bfa',
  accent: '#8b5cf6',
  text: '#1f2937',
  background: '#faf5ff'
}
```

### 绿色系
```typescript
colors: {
  primary: '#059669',
  secondary: '#34d399',
  accent: '#10b981',
  text: '#1f2937',
  background: '#ffffff'
}
```

### 灰色系（极简）
```typescript
colors: {
  primary: '#374151',
  secondary: '#9ca3af',
  accent: '#6b7280',
  text: '#111827',
  background: '#ffffff'
}
```

### 深色系（专业）
```typescript
colors: {
  primary: '#1e3a8a',
  secondary: '#64748b',
  accent: '#2563eb',
  text: '#0f172a',
  background: '#ffffff'
}
```

## 📐 布局配置模板

### 上下栏标准布局
```typescript
layout: {
  margins: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
  columns: { count: 1, gap: '2rem' },
  spacing: { section: '2rem', item: '1rem', line: '0.5rem' }
}
```

### 左右栏标准布局
```typescript
layout: {
  margins: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
  columns: { 
    count: 2, 
    gap: '2rem',
    leftWidth: '35%',
    rightWidth: '65%'
  },
  spacing: { section: '2rem', item: '1rem', line: '0.5rem' }
}
```

### 侧边栏布局
```typescript
layout: {
  margins: { top: '0', right: '0', bottom: '0', left: '0' },
  columns: { 
    count: 2, 
    gap: '0',
    leftWidth: '32%',
    rightWidth: '68%'
  },
  spacing: { section: '1.5rem', item: '1rem', line: '0.5rem' }
}
```

### 极简布局
```typescript
layout: {
  margins: { top: '3rem', right: '3rem', bottom: '3rem', left: '3rem' },
  columns: { count: 1, gap: '2rem' },
  spacing: { section: '3rem', item: '1.5rem', line: '0.8rem' }
}
```

## 🔤 字体配置

### 现代无衬线
```typescript
fonts: {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  size: { heading: '1.5rem', body: '0.875rem', small: '0.75rem' }
}
```

### 经典衬线
```typescript
fonts: {
  heading: 'Georgia, Times New Roman, serif',
  body: 'Georgia, Times New Roman, serif',
  size: { heading: '1.6rem', body: '0.9rem', small: '0.8rem' }
}
```

### 系统默认
```typescript
fonts: {
  heading: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  body: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  size: { heading: '1.5rem', body: '0.875rem', small: '0.75rem' }
}
```

## 🎯 组件样式配置

### 个人信息 - 水平布局
```typescript
personalInfo: {
  layout: 'horizontal',
  showAvatar: true,
  avatarPosition: 'left',
  defaultAvatar: '/avatars/img1.png'
}
```

### 个人信息 - 垂直布局
```typescript
personalInfo: {
  layout: 'vertical',
  showAvatar: true,
  avatarPosition: 'center',
  defaultAvatar: '/avatars/img1.png'
}
```

### 章节标题样式
```typescript
// 下划线样式
sectionTitle: { style: 'underline', alignment: 'left' }

// 背景色样式
sectionTitle: { style: 'background', alignment: 'left' }

// 边框样式
sectionTitle: { style: 'border', alignment: 'left' }

// 纯文本样式
sectionTitle: { style: 'plain', alignment: 'left' }
```

### 列表项样式
```typescript
// 圆点
listItem: { bulletStyle: 'dot', indentation: '1rem' }

// 箭头
listItem: { bulletStyle: 'arrow', indentation: '1rem' }

// 圆圈
listItem: { bulletStyle: 'circle', indentation: '1rem' }

// 无样式
listItem: { bulletStyle: 'none', indentation: '0' }
```

### 日期格式
```typescript
// 年-月格式
dateFormat: { format: 'YYYY-MM', position: 'right' }

// 中文格式
dateFormat: { format: 'YYYY年MM月', position: 'right' }

// 仅年份
dateFormat: { format: 'YYYY', position: 'left' }
```

## 🚀 快速命令

### 获取模板
```typescript
import { getTemplateById, getTemplatesByCategory } from '@/data/templates'

// 通过ID获取
const template = getTemplateById('general-modern')

// 通过分类获取
const templates = getTemplatesByCategory('designer')
```

### 验证模板
```typescript
import { validateTemplate } from '@/utils/templateValidator'

const result = validateTemplate(template)
console.log(result.isValid)
console.log(result.errors)
console.log(result.warnings)
```

### 收藏操作
```typescript
import { 
  toggleFavoriteTemplate,
  isFavoriteTemplate,
  getFavoriteTemplates 
} from '@/utils/templateFavorites'

// 切换收藏
toggleFavoriteTemplate('template-id')

// 检查是否收藏
const isFav = isFavoriteTemplate('template-id')

// 获取所有收藏
const favorites = getFavoriteTemplates()
```

## 📊 预览图资源

### 可用的SVG预览图 (17个)
```
/templates/academic-clean.svg
/templates/career-backend-developer.svg
/templates/career-frontend-developer.svg
/templates/career-operations.svg
/templates/career-product-manager.svg
/templates/career-ui-designer.svg
/templates/classic-blue.svg
/templates/creative-purple.svg
/templates/elegant-rose.svg
/templates/elegant-sidebar.svg
/templates/gradient-header.svg
/templates/magazine-style.svg
/templates/minimal-gray.svg
/templates/modern-green.svg
/templates/professional-navy.svg
/templates/tech-future.svg
/templates/tech-orange.svg
```

## 🔧 常用代码片段

### 添加新模板（最小配置）
```typescript
{
  id: 'my-template',
  name: '我的模板',
  nameEn: 'My Template',
  description: '模板描述',
  descriptionEn: 'Template description',
  preview: '/templates/my-template.svg',
  category: 'general',
  isPremium: false,
  layoutType: 'top-bottom',
  colors: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    text: '#1f2937',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    size: { heading: '1.5rem', body: '0.875rem', small: '0.75rem' }
  },
  layout: {
    margins: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
    columns: { count: 1, gap: '2rem' },
    spacing: { section: '2rem', item: '1rem', line: '0.5rem' }
  },
  components: {
    personalInfo: { layout: 'horizontal', showAvatar: true, avatarPosition: 'left' },
    sectionTitle: { style: 'underline', alignment: 'left' },
    listItem: { bulletStyle: 'dot', indentation: '1rem' },
    dateFormat: { format: 'YYYY-MM', position: 'right' }
  }
}
```

### 筛选模板
```typescript
// 按布局类型
const topBottomTemplates = templates.filter(t => t.layoutType === 'top-bottom')
const leftRightTemplates = templates.filter(t => t.layoutType === 'left-right')

// 按分类
const designerTemplates = templates.filter(t => t.category === 'designer')

// 按关键词搜索
const searchResults = templates.filter(t => 
  t.name.includes(keyword) || t.description.includes(keyword)
)

// 组合筛选
const results = templates.filter(t => 
  t.category === 'designer' && 
  t.layoutType === 'left-right' &&
  !t.isPremium
)
```

## 📞 支持

- 网站: https://www.tomda.top
- 团队: UIED技术团队 (https://fsuied.com)
- 文档: 查看 TEMPLATE_SYSTEM_GUIDE.md

---

**版本**: v1.0  
**更新**: 2026年1月30日

