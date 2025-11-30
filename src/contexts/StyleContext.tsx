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
const defaultStyleConfig: StyleConfig = {
  fontFamily: 'Inter, sans-serif',
  fontSize: {
    name: 24,
    title: 16,
    content: 14,
    small: 12
  },
  colors: {
    primary: '#374151',
    secondary: '#6b7280',
    text: '#111827',
    accent: '#6b7280',
    background: '#ffffff'
  },
  spacing: {
    section: 18,
    item: 10,
    line: 24
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
    padding: 32,
    columns: 1,
    columnGap: 24,
    leftColumnWidth: 35,
    rightColumnWidth: 65,
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
  updateStyleConfig: (updates: Partial<StyleConfig>) => void
  resetStyleConfig: () => void
  activeElement: string | null
  setActiveElement: (element: string | null) => void
}

/**
 * 样式上下文
 */
const StyleContext = createContext<StyleContextType | undefined>(undefined)

/**
 * 样式提供者组件
 */
export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyleConfig)
  const [activeElement, setActiveElement] = useState<string | null>(null)

  /**
   * 更新样式配置
   * @param updates 要更新的样式配置部分
   */
  const updateStyleConfig = (updates: Partial<StyleConfig>) => {
    setStyleConfig(prev => ({
      ...prev,
      ...updates,
      // 深度合并嵌套对象
      fontSize: { ...prev.fontSize, ...updates.fontSize },
      colors: { ...prev.colors, ...updates.colors },
      spacing: { ...prev.spacing, ...updates.spacing },
      avatar: { ...prev.avatar, ...updates.avatar },
      layout: { ...prev.layout, ...updates.layout },
      skills: { ...prev.skills, ...updates.skills }
    }))
  }

  /**
   * 重置样式配置为默认值
   */
  const resetStyleConfig = () => {
    setStyleConfig(defaultStyleConfig)
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