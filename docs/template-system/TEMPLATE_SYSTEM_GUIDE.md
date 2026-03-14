/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 模板系统使用指南
 */

# 模板系统使用指南

## 📚 目录

1. [系统概述](#系统概述)
2. [核心功能](#核心功能)
3. [模板数据结构](#模板数据结构)
4. [使用示例](#使用示例)
5. [开发指南](#开发指南)
6. [常见问题](#常见问题)

## 系统概述

简历模板系统提供了26个精心设计的专业简历模板，涵盖多个职业领域和设计风格。

### 核心特性

- ✅ **26个专业模板** - 覆盖6大职业分类
- ✅ **2种标准布局** - 上下栏和左右栏
- ✅ **智能筛选** - 按分类、布局、关键词筛选
- ✅ **收藏功能** - 本地持久化存储
- ✅ **实时预览** - 所见即所得
- ✅ **国际化支持** - 中英文双语
- ✅ **响应式设计** - 适配各种屏幕

## 核心功能

### 1. 模板选择器 (TemplateSelector)

模板选择器是用户选择和预览模板的主要界面。

#### 基本用法

```tsx
import TemplateSelector from '@/components/TemplateSelector'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState('general-modern')

  return (
    <TemplateSelector
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSelectTemplate={(template) => {
        setCurrentTemplate(template.id)
        // 应用模板样式
      }}
      currentTemplate={currentTemplate}
    />
  )
}
```

#### 功能特性

**分类浏览**
- 热门模板 - 精选推荐
- 我的收藏 - 用户收藏的模板
- 设计师 - UI设计、平面设计、交互设计
- 程序员 - 前端、后端、全栈
- 人力资源 - HR经理、招聘专员
- 市场营销 - 市场经理、内容运营
- 财务金融 - 会计、分析师
- 通用模板 - 现代、经典、极简风格
- 浏览全部 - 所有可用模板

**搜索功能**
```tsx
// 支持中英文搜索
// 搜索范围：模板名称、描述
```

**筛选功能**
```tsx
// 按布局类型筛选
- 所有布局
- 上下栏布局
- 左右栏布局
```

**视图模式**
```tsx
// 网格视图 - 默认，卡片式展示
// 列表视图 - 列表式展示（桌面端）
```

### 2. 模板卡片 (TemplateCard)

每个模板以卡片形式展示，提供丰富的交互功能。

#### 卡片元素

```tsx
<TemplateCard
  template={template}
  isSelected={currentTemplate === template.id}
  onClick={() => handleSelectTemplate(template)}
  onPreview={() => handlePreviewTemplate(template)}
/>
```

**视觉元素**
- 模板预览图
- 模板名称和描述
- 布局类型标签
- 颜色方案展示
- 高级模板徽章（PRO）
- 选中状态指示器
- 收藏按钮

**交互功能**
- 点击选择模板
- 悬停显示操作按钮
- 收藏/取消收藏
- 预览模板

### 3. 模板预览 (TemplatePreview)

实时渲染模板的预览效果。

#### 基本用法

```tsx
import TemplatePreview from '@/components/TemplatePreview'

<TemplatePreview 
  template={template}
  fullSize={false}  // false=缩略图，true=全尺寸
/>
```

#### 支持的布局类型

1. **侧边栏布局 (sidebar)**
   - 左侧深色侧边栏
   - 右侧内容区
   - 适合：高管、专业人士

2. **渐变头部布局 (gradient)**
   - 顶部彩色横幅
   - 下方内容区
   - 适合：创意、现代风格

3. **经典布局 (classic)**
   - 居中对称设计
   - 传统优雅风格
   - 适合：学术、正式场合

4. **极简布局 (minimal)**
   - 大量留白
   - 细线条设计
   - 适合：设计师、艺术家

5. **创意布局 (creative)**
   - 左右分栏
   - 大胆配色
   - 适合：设计师、创意工作者

6. **默认布局 (default)**
   - 标准单栏布局
   - 通用设计
   - 适合：大多数职业

### 4. 收藏功能

使用 localStorage 实现模板收藏的持久化存储。

#### API 使用

```typescript
import {
  getFavoriteTemplates,
  addFavoriteTemplate,
  removeFavoriteTemplate,
  isFavoriteTemplate,
  toggleFavoriteTemplate
} from '@/utils/templateFavorites'

// 获取所有收藏的模板ID
const favorites = getFavoriteTemplates()
// 返回: ['template-id-1', 'template-id-2']

// 添加收藏
addFavoriteTemplate('template-id')
// 返回: true (成功) / false (已存在)

// 移除收藏
removeFavoriteTemplate('template-id')
// 返回: true (成功) / false (失败)

// 检查是否已收藏
const isFavorite = isFavoriteTemplate('template-id')
// 返回: true / false

// 切换收藏状态
const newState = toggleFavoriteTemplate('template-id')
// 返回: true (已收藏) / false (已取消)
```

### 5. 模板验证

确保模板数据的完整性和正确性。

#### 验证工具使用

```typescript
import {
  validateTemplate,
  validateTemplates,
  printValidationReport,
  autoFixTemplate
} from '@/utils/templateValidator'

// 验证单个模板
const result = validateTemplate(template)
console.log(result.isValid)    // true/false
console.log(result.errors)     // 错误列表
console.log(result.warnings)   // 警告列表

// 批量验证
const results = validateTemplates(resumeTemplates)

// 打印报告
printValidationReport(results)

// 自动修复
const fixedTemplate = autoFixTemplate(template)
```

## 模板数据结构

### TemplateStyle 接口

```typescript
interface TemplateStyle {
  // 基本信息
  id: string                    // 唯一标识符
  name: string                  // 中文名称
  nameEn?: string              // 英文名称
  description: string          // 中文描述
  descriptionEn?: string       // 英文描述
  preview: string              // 预览图路径
  
  // 分类信息
  category: 'designer' | 'developer' | 'hr' | 'marketing' | 'finance' | 'general'
  subCategory?: string         // 子分类
  isPremium: boolean          // 是否高级模板
  layoutType?: 'top-bottom' | 'left-right'  // 布局类型
  
  // 样式配置
  colors: {
    primary: string           // 主色
    secondary: string         // 次色
    accent: string           // 强调色
    text: string             // 文字色
    background: string       // 背景色
  }
  
  fonts: {
    heading: string          // 标题字体
    body: string            // 正文字体
    size: {
      heading: string       // 标题大小
      body: string         // 正文大小
      small: string        // 小字大小
    }
  }
  
  layout: {
    margins: {
      top: string
      right: string
      bottom: string
      left: string
    }
    columns: {
      count: 1 | 2
      gap: string
      leftWidth?: string
      rightWidth?: string
    }
    spacing: {
      section: string
      item: string
      line: string
    }
  }
  
  components: {
    personalInfo: {
      layout: 'horizontal' | 'vertical'
      showAvatar: boolean
      avatarPosition: 'left' | 'center' | 'right'
      defaultAvatar?: string
    }
    sectionTitle: {
      style: 'underline' | 'background' | 'border' | 'plain'
      alignment: 'left' | 'center' | 'right'
    }
    listItem: {
      bulletStyle: 'dot' | 'dash' | 'arrow' | 'none' | 'circle'
      indentation: string
    }
    dateFormat: {
      format: 'YYYY-MM' | 'MM/YYYY' | 'YYYY年MM月' | 'YYYY'
      position: 'right' | 'left' | 'below'
    }
  }
  
  hidden?: boolean           // 是否隐藏
}
```

## 使用示例

### 示例1：获取特定分类的模板

```typescript
import { getTemplatesByCategory } from '@/data/templates'

// 获取设计师类模板
const designerTemplates = getTemplatesByCategory('designer')

// 获取程序员类模板
const developerTemplates = getTemplatesByCategory('developer')
```

### 示例2：获取热门模板

```typescript
import { resumeTemplates, popularTemplateIds } from '@/data/templates'

const popularTemplates = resumeTemplates.filter(
  template => popularTemplateIds.includes(template.id)
)
```

### 示例3：按布局类型筛选

```typescript
import { getAvailableTemplates } from '@/data/templates'

const allTemplates = getAvailableTemplates()

// 获取上下栏布局模板
const topBottomTemplates = allTemplates.filter(
  t => t.layoutType === 'top-bottom'
)

// 获取左右栏布局模板
const leftRightTemplates = allTemplates.filter(
  t => t.layoutType === 'left-right'
)
```

### 示例4：搜索模板

```typescript
const searchTemplates = (query: string, templates: TemplateStyle[]) => {
  const lowerQuery = query.toLowerCase()
  return templates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.nameEn?.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.descriptionEn?.toLowerCase().includes(lowerQuery)
  )
}

const results = searchTemplates('设计师', allTemplates)
```

### 示例5：应用模板样式

```typescript
const applyTemplateStyles = (template: TemplateStyle) => {
  // 应用颜色
  document.documentElement.style.setProperty('--primary-color', template.colors.primary)
  document.documentElement.style.setProperty('--secondary-color', template.colors.secondary)
  
  // 应用字体
  document.documentElement.style.setProperty('--heading-font', template.fonts.heading)
  document.documentElement.style.setProperty('--body-font', template.fonts.body)
  
  // 应用布局
  // ... 更多样式应用逻辑
}
```

## 开发指南

### 添加新模板

#### 步骤1：定义模板数据

在 `src/data/templates.ts` 中添加新模板：

```typescript
{
  id: 'my-new-template',
  name: '我的新模板',
  nameEn: 'My New Template',
  description: '这是一个新模板的描述',
  descriptionEn: 'This is a description of the new template',
  preview: '/templates/my-new-template.svg',
  category: 'general',
  subCategory: 'modern',
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
    size: {
      heading: '1.5rem',
      body: '0.875rem',
      small: '0.75rem'
    }
  },
  layout: {
    margins: {
      top: '2rem',
      right: '2rem',
      bottom: '2rem',
      left: '2rem'
    },
    columns: {
      count: 1,
      gap: '2rem'
    },
    spacing: {
      section: '2rem',
      item: '1rem',
      line: '0.5rem'
    }
  },
  components: {
    personalInfo: {
      layout: 'horizontal',
      showAvatar: true,
      avatarPosition: 'left',
      defaultAvatar: '/avatars/img1.png'
    },
    sectionTitle: {
      style: 'underline',
      alignment: 'left'
    },
    listItem: {
      bulletStyle: 'dot',
      indentation: '1rem'
    },
    dateFormat: {
      format: 'YYYY-MM',
      position: 'right'
    }
  }
}
```

#### 步骤2：创建预览图

在 `public/templates/` 目录下创建 SVG 预览图：
- 文件名：`my-new-template.svg`
- 尺寸比例：3:4（宽:高）
- 建议尺寸：300x400px 或 600x800px

#### 步骤3：验证模板

```typescript
import { validateTemplate } from '@/utils/templateValidator'

const result = validateTemplate(myNewTemplate)
if (!result.isValid) {
  console.error('模板验证失败:', result.errors)
}
```

#### 步骤4：测试模板

- 在模板选择器中查看
- 测试预览效果
- 测试应用效果
- 测试收藏功能

### 修改现有模板

```typescript
// 1. 找到要修改的模板
const template = resumeTemplates.find(t => t.id === 'template-id')

// 2. 修改属性
template.colors.primary = '#new-color'

// 3. 验证修改
const result = validateTemplate(template)

// 4. 测试效果
```

### 自定义模板预览

如果需要为特定模板自定义预览效果，在 `TemplatePreview.tsx` 中添加：

```typescript
// 在 layoutType 的 useMemo 中添加判断逻辑
if (id === 'my-new-template') {
  return 'custom-layout-type'
}

// 添加自定义渲染函数
const renderCustomLayout = () => (
  <div className="custom-layout">
    {/* 自定义预览内容 */}
  </div>
)

// 在 renderLayout 中添加 case
case 'custom-layout-type': return renderCustomLayout()
```

## 常见问题

### Q1: 如何更改模板的默认颜色？

```typescript
// 在模板定义中修改 colors 对象
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  accent: '#your-color',
  text: '#your-color',
  background: '#your-color'
}
```

### Q2: 如何隐藏某个模板？

```typescript
// 在模板定义中添加 hidden 属性
{
  id: 'template-id',
  // ... 其他属性
  hidden: true  // 不会在选择器中显示
}
```

### Q3: 如何设置热门模板？

```typescript
// 在 templates.ts 中修改 popularTemplateIds 数组
export const popularTemplateIds = [
  'template-id-1',
  'template-id-2',
  'your-template-id'  // 添加你的模板ID
]
```

### Q4: 预览图不显示怎么办？

检查以下几点：
1. 文件路径是否正确（`/templates/xxx.svg`）
2. 文件是否存在于 `public/templates/` 目录
3. 文件名是否与 preview 属性匹配
4. SVG 文件是否有效

### Q5: 如何调整模板预览的缩放比例？

```typescript
// 在 TemplatePreview 组件中
const scale = fullSize ? 1 : 0.28  // 修改这个值

// 或者通过 props 传递
<TemplatePreview template={template} scale={0.3} />
```

### Q6: 如何添加新的布局类型？

目前只支持 `'top-bottom'` 和 `'left-right'` 两种标准布局。如需添加新类型：

1. 修改类型定义：
```typescript
// src/types/template.ts
layoutType?: 'top-bottom' | 'left-right' | 'your-new-type'
```

2. 更新验证器：
```typescript
// src/utils/templateValidator.ts
if (!['top-bottom', 'left-right', 'your-new-type'].includes(template.layoutType))
```

3. 更新筛选器：
```typescript
// src/components/TemplateSelector.tsx
<option value="your-new-type">新布局类型</option>
```

### Q7: 收藏数据存储在哪里？

收藏数据存储在浏览器的 localStorage 中：
- Key: `resume_favorite_templates`
- Value: JSON 字符串数组，包含收藏的模板ID

清除收藏：
```typescript
localStorage.removeItem('resume_favorite_templates')
```

### Q8: 如何导出/导入模板配置？

```typescript
// 导出所有模板配置
const exportTemplates = () => {
  const data = JSON.stringify(resumeTemplates, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'templates.json'
  a.click()
}

// 导入模板配置
const importTemplates = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const templates = JSON.parse(e.target?.result as string)
    // 验证并使用导入的模板
  }
  reader.readAsText(file)
}
```

## 📞 技术支持

如有问题或建议，请联系：
- 网站：https://www.tomda.top
- 团队：UIED技术团队 (https://fsuied.com)

---

**文档版本**: v1.0  
**最后更新**: 2026年1月30日

