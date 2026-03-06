/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

/**
 * 样式配置接口定义
 */
export interface StyleConfig {
  // 字体设置
  fontFamily?: string
  fontSize: {
    name: number
    title: number
    content: number
    small: number
  }
  // 颜色设置
  colors: {
    primary: string
    secondary: string
    text: string
    accent: string
    background: string
  }
  // 间距设置
  spacing: {
    section: number
    item: number
    line: number
  }
  // 头像设置
  avatar: {
    size: number
    shape: 'circle' | 'square' | 'rounded'
    border: boolean
    borderColor: string
    borderWidth: number
    url?: string  // 添加头像URL字段
  }
  // 布局设置
  layout: {
    maxWidth: number
    padding: number
    columns: number
    columnGap: number
    leftColumnWidth: number
    rightColumnWidth: number
    headerLayout: 'horizontal' | 'vertical' | 'centered'
    sectionSpacing: 'compact' | 'normal' | 'spacious'
    alignment: 'left' | 'center' | 'justified'
    // 新增头部联系信息布局选项
    contactLayout: 'inline' | 'grouped' | 'sidebar' | 'cards' | 'grid'
    // 新增内容顺序（单列模式下生效）
    sectionOrder: Array<'personal' | 'experience' | 'education' | 'skills' | 'projects'>
    // 新增双栏模式下的内容顺序
    columnSectionOrder?: {
      left: string[]
      right: string[]
    }
  }
  // 技能显示设置
  skills: {
    displayStyle: 'progress' | 'tags' | 'list' | 'cards' | 'minimal' | 'grid' | 'circular' | 'radar'
    showLevel: boolean
    showCategory: boolean
    visible: boolean
    groupByCategory: boolean
    columns: number
  }
}

/**
 * 默认样式配置
 */
export const defaultStyleConfig: StyleConfig = {
  fontFamily: 'Inter, sans-serif',
  fontSize: {
    name: 28,
    title: 18,
    content: 15,
    small: 13
  },
  colors: {
    primary: '#374151',
    secondary: '#6b7280',
    text: '#111827',
    accent: '#6b7280',
    background: '#ffffff'
  },
  spacing: {
    section: 40,
    item: 24,
    line: 21 // 对应 1.4 行高 (15px * 1.4 = 21)
  },
  avatar: {
    size: 120,
    shape: 'circle',
    border: true,
    borderColor: '#e5e7eb',
    borderWidth: 2
  },
  layout: {
    maxWidth: 800,
    padding: 25,
    columns: 1,
    columnGap: 32,
    leftColumnWidth: 30,
    rightColumnWidth: 70,
    headerLayout: 'centered' as const,
    sectionSpacing: 'normal' as const,
    alignment: 'left' as const,
    contactLayout: 'inline' as const,
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects']
  },
  skills: {
    displayStyle: 'progress' as const,
    showLevel: true,
    showCategory: false,
    visible: true,
    groupByCategory: false,
    columns: 2
  }
}

/**
 * 样式上下文接口
 */
interface StyleContextType {
  styleConfig: StyleConfig
  updateStyleConfig: (updates: DeepPartial<StyleConfig>) => void
  resetStyleConfig: () => void
  activeElement: string | null
  setActiveElement: (element: string | null) => void
}

/**
 * 深度部分类型 - 允许嵌套对象的部分更新
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 样式上下文
 */
const StyleContext = createContext<StyleContextType | undefined>(undefined)

/**
 * 验证并修复 spacing.line 值
 * 确保行高像素值合理（基于 fontSize.content * 1.4 到 2.0 的范围）
 */
function validateSpacingLine(config: StyleConfig): StyleConfig {
  const contentFontSize = config.fontSize?.content || 15
  const minLinePixels = contentFontSize * 1.4  // 最小行高 1.4
  const maxLinePixels = contentFontSize * 2.0  // 最大行高 2.0
  
  // 如果 spacing.line 不在合理范围内，重置为默认值
  if (!config.spacing?.line || config.spacing.line < minLinePixels || config.spacing.line > maxLinePixels * 1.5) {
    return {
      ...config,
      spacing: {
        section: config.spacing?.section || 40,
        item: config.spacing?.item || 24,
        line: Math.round(contentFontSize * 1.4)  // 默认 1.4 行高
      }
    }
  }
  return config
}

/**
 * 样式提供者组件
 */
export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(() => {
    // 初始化时验证默认配置
    return validateSpacingLine(defaultStyleConfig)
  })
  const [activeElement, setActiveElement] = useState<string | null>(null)

  /**
   * 更新样式配置
   * @param updates 要更新的样式配置部分
   */
  const updateStyleConfig = (updates: DeepPartial<StyleConfig>) => {
    setStyleConfig(prev => {
      const newConfig = { ...prev }
      
      // 只合并提供的字段，避免不必要的覆盖
      if (updates.fontFamily !== undefined) {
        newConfig.fontFamily = updates.fontFamily
      }
      if (updates.fontSize) {
        newConfig.fontSize = { ...prev.fontSize, ...updates.fontSize }
      }
      if (updates.colors) {
        newConfig.colors = { ...prev.colors, ...updates.colors }
      }
      if (updates.spacing) {
        newConfig.spacing = { ...prev.spacing, ...updates.spacing }
      }
      // 头像设置：保持独立，不受其他样式影响
      // 只有明确更新 avatar 时才修改
      if (updates.avatar) {
        // 保留原有的 url，除非明确提供新的
        newConfig.avatar = { 
          ...prev.avatar, 
          ...updates.avatar,
          // 如果没有提供新的 url，保留原有的
          url: updates.avatar.url !== undefined ? updates.avatar.url : prev.avatar.url
        }
      }
      if (updates.layout) {
        // 确保 sectionOrder 不包含 undefined
        const updatedLayout = { ...prev.layout, ...updates.layout }
        if (updates.layout.sectionOrder) {
          updatedLayout.sectionOrder = updates.layout.sectionOrder.filter(
            (item): item is 'personal' | 'experience' | 'education' | 'skills' | 'projects' => item !== undefined
          )
        }
        newConfig.layout = updatedLayout as StyleConfig['layout']
      }
      if (updates.skills) {
        newConfig.skills = { ...prev.skills, ...updates.skills }
      }
      
      return newConfig
    })
  }

  /**
   * 重置样式配置为默认值
   * 注意：重置时保留头像URL，避免丢失用户上传的头像
   */
  const resetStyleConfig = () => {
    setStyleConfig(prev => ({
      ...defaultStyleConfig,
      avatar: {
        ...defaultStyleConfig.avatar,
        url: prev.avatar.url // 保留原有头像URL
      }
    }))
  }

  const value: StyleContextType = {
    styleConfig,
    updateStyleConfig,
    resetStyleConfig,
    activeElement,
    setActiveElement
  }

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  )
}

/**
 * 使用样式上下文的Hook
 */
export function useStyle() {
  const context = useContext(StyleContext)
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider')
  }
  return context
}

/**
 * 样式工具函数
 */
export const styleUtils = {
  /**
   * 生成CSS样式对象
   */
  generateStyles: (config: StyleConfig) => ({
    '--font-size-name': `${config.fontSize.name}px`,
    '--font-size-title': `${config.fontSize.title}px`,
    '--font-size-content': `${config.fontSize.content}px`,
    '--font-size-small': `${config.fontSize.small}px`,
    '--color-primary': config.colors.primary,
    '--color-secondary': config.colors.secondary,
    '--color-text': config.colors.text,
    '--color-accent': config.colors.accent,
    '--color-background': config.colors.background,
    '--spacing-section': `${config.spacing.section}px`,
    '--spacing-item': `${config.spacing.item}px`,
    '--spacing-line': `${config.spacing.line}px`,
    '--avatar-size': `${config.avatar.size}px`,
    '--avatar-border-width': `${config.avatar.borderWidth}px`,
    '--avatar-border-color': config.avatar.borderColor,
    '--layout-max-width': `${config.layout.maxWidth}px`,
    '--layout-padding': `${config.layout.padding}px`
  }),

  /**
   * 获取头像样式类名
   */
  getAvatarClasses: (config: StyleConfig) => {
    const baseClasses = 'object-cover'
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg'
    }
    const borderClasses = config.avatar.border ? 'border' : ''
    
    return `${baseClasses} ${shapeClasses[config.avatar.shape]} ${borderClasses}`.trim()
  }
}