/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

/**
 * 简历模板类型定义
 */

export interface TemplateStyle {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板名称（英文） */
  nameEn?: string
  /** 模板描述 */
  description: string
  /** 模板描述（英文） */
  descriptionEn?: string
  /** 模板预览图 */
  preview: string
  /** 模板类别 - 按职业岗位分类 */
  category: 'designer' | 'developer' | 'hr' | 'marketing' | 'finance' | 'general'
  /** 子分类 - 具体岗位 */
  subCategory?: string
  /** 是否为高级模板 */
  isPremium: boolean
  /** 布局类型 - 上下栏或左右栏 */
  layoutType?: 'top-bottom' | 'left-right'
  /** 模板标签 - 用于快速识别模板特点 */
  tags?: string[]
  /** 模板颜色主题 */
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
    [key: string]: string  // 允许额外的颜色配置
  }
  /** 模板字体配置 */
  fonts: {
    heading: string
    body: string
    size: {
      heading: string
      body: string
      small: string
    }
  }
  /** 模板布局配置 */
  layout: {
    /** 页面边距 */
    margins: {
      top: string
      right: string
      bottom: string
      left: string
    }
    /** 分栏配置 */
    columns: {
      count: 1 | 2
      gap: string
      leftWidth?: string
      rightWidth?: string
    }
    /** 间距配置 */
    spacing: {
      section: string
      item: string
      line: string
    }
    /** 内边距 */
    padding?: number
  }
  /** 模板组件样式 */
  components: {
    /** 个人信息样式 */
    personalInfo: {
      layout: 'horizontal' | 'vertical' | 'center' | 'table' | 'banner'
      showAvatar: boolean
      avatarPosition: 'left' | 'center' | 'right'
      avatarShape?: 'circle' | 'square'  // 头像形状：圆形或正方形
      avatarBorderRadius?: number  // 头像圆角大小（像素），0-50，0为直角，50为圆形
      defaultAvatar?: string
    }
    /** 标题样式 */
    sectionTitle: {
      style: 'underline' | 'background' | 'border' | 'plain' | 'icon'
      alignment: 'left' | 'center' | 'right'
    }
    /** 列表项样式 */
    listItem: {
      bulletStyle: 'dot' | 'dash' | 'arrow' | 'none' | 'circle' | 'square' | 'timeline'
      indentation: string
    }
    /** 日期样式 */
    dateFormat: {
      format: 'YYYY-MM' | 'MM/YYYY' | 'YYYY年MM月' | 'YYYY' | 'YYYY.MM' | 'MMM YYYY'
      position: 'right' | 'left' | 'below' | 'inline'
    }
    /** 表格样式 */
    tableStyle?: boolean
    /** 卡片样式 */
    cardStyle?: boolean
    /** 技能展示样式 */
    skillDisplay?: 'progress' | 'tags' | 'list' | 'cards' | 'grid' | 'radar' | 'circle'
  }
  /** 控制是否在选择器中显示 */
  hidden?: boolean
}

/**
 * 模板分类
 */
export interface TemplateCategory {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  icon: string
  templates: TemplateStyle[]
}

/**
 * 模板选择器配置
 */
export interface TemplateSelector {
  /** 当前选中的模板 */
  selectedTemplate: string
  /** 可用模板列表 */
  availableTemplates: TemplateStyle[]
  /** 模板分类 */
  categories: TemplateCategory[]
  /** 是否显示预览 */
  showPreview: boolean
  /** 预览模式 */
  previewMode: 'thumbnail' | 'fullsize'
}