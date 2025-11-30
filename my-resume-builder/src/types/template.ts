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
  /** 模板描述 */
  description: string
  /** 模板预览图 */
  preview: string
  /** 模板类别 */
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'career' | 'english'
  /** 是否为高级模板 */
  isPremium: boolean
  /** 模板颜色主题 */
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
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
  }
  /** 模板组件样式 */
  components: {
    /** 个人信息样式 */
    personalInfo: {
      layout: 'horizontal' | 'vertical'
      showAvatar: boolean
      avatarPosition: 'left' | 'center' | 'right'
      defaultAvatar?: string
    }
    /** 标题样式 */
    sectionTitle: {
      style: 'underline' | 'background' | 'border' | 'plain'
      alignment: 'left' | 'center' | 'right'
    }
    /** 列表项样式 */
    listItem: {
      bulletStyle: 'dot' | 'dash' | 'arrow' | 'none' | 'circle'
      indentation: string
    }
    /** 日期样式 */
    dateFormat: {
      format: 'YYYY-MM' | 'MM/YYYY' | 'YYYY年MM月' | 'YYYY'
      position: 'right' | 'left' | 'below'
    }
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
  description: string
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