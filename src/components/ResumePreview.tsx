/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ResumeData } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { StyleConfig, useStyle } from '@/contexts/StyleContext'
import { ModernSidebar } from './templates/ModernSidebar'
import { GradientHeader } from './templates/GradientHeader'
import { ClassicElegant } from './templates/ClassicElegant'
import { MinimalClean } from './templates/MinimalClean'
import { ModernMinimalist } from './templates/ModernMinimalist'
import { CreativeDesigner } from './templates/CreativeDesigner'
import { TopBottomLayout } from './templates/TopBottomLayout'
import { MinimalTextLayout } from './templates/MinimalTextLayout'
import { TableLayout } from './templates/TableLayout'
import { TimelineLayout } from './templates/TimelineLayout'
import { TwoColumnStandard } from './templates/TwoColumnStandard'
import { CardLayout } from './templates/CardLayout'
import { GridLayout } from './templates/GridLayout'
import { BannerLayout } from './templates/BannerLayout'
import { LineMinimalLayout } from './templates/LineMinimalLayout'

interface ResumePreviewProps {
  resumeData: ResumeData
  className?: string
  currentTemplate?: TemplateStyle
  isExporting?: boolean
  onSectionClick?: (section: string) => void
}

// A4纸张尺寸（像素）
const A4_WIDTH = 612
const A4_HEIGHT = 792

/**
 * 简历预览组件
 * 渲染 A4 适配的预览内容，支持分页标记与导出模式
 */
const ResumePreview = ({
  resumeData,
  className = '',
  currentTemplate,
  isExporting = false,
  onSectionClick
}: ResumePreviewProps) => {
  const outerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // 客户端挂载检测，防止 SSR 闪烁
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { styleConfig } = useStyle()
  
  /**
   * 获取合并后的样式配置
   * 优先级: styleConfig (用户设置) > currentTemplate (模板默认) > defaultConfig (系统默认)
   */
  const mergedStyleConfig = React.useMemo((): StyleConfig => {
    // 系统默认配置
    const defaultConfig: StyleConfig = {
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
        line: 21
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
        headerLayout: 'centered',
        sectionSpacing: 'normal',
        alignment: 'left',
        contactLayout: 'inline',
        sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects']
      },
      skills: {
        displayStyle: 'progress',
        showLevel: true,
        showCategory: false,
        visible: true,
        groupByCategory: false,
        columns: 2
      }
    }

    // 从模板提取颜色配置
    const templateColors = currentTemplate?.colors ? {
      primary: currentTemplate.colors.primary || defaultConfig.colors.primary,
      secondary: currentTemplate.colors.secondary || defaultConfig.colors.secondary,
      text: currentTemplate.colors.text || defaultConfig.colors.text,
      accent: currentTemplate.colors.accent || defaultConfig.colors.accent,
      background: currentTemplate.colors.background || defaultConfig.colors.background
    } : defaultConfig.colors

    // 合并配置：styleConfig 覆盖模板配置，模板配置覆盖默认配置
    return {
      fontFamily: styleConfig.fontFamily || defaultConfig.fontFamily,
      fontSize: {
        ...defaultConfig.fontSize,
        ...styleConfig.fontSize
      },
      colors: {
        ...templateColors,
        ...styleConfig.colors
      },
      spacing: {
        ...defaultConfig.spacing,
        ...styleConfig.spacing,
        // 验证 line 值，确保行高在合理范围内
        line: (() => {
          const line = styleConfig.spacing?.line || defaultConfig.spacing.line
          const contentFontSize = styleConfig.fontSize?.content || defaultConfig.fontSize.content
          const minLine = contentFontSize * 1.4
          const maxLine = contentFontSize * 2.0
          // 如果 line 值不在合理范围内，使用默认值
          if (line < minLine || line > maxLine * 1.5) {
            return Math.round(contentFontSize * 1.4)
          }
          return line
        })()
      },
      avatar: {
        ...defaultConfig.avatar,
        ...styleConfig.avatar
      },
      layout: {
        ...defaultConfig.layout,
        ...styleConfig.layout
      },
      skills: {
        ...defaultConfig.skills,
        ...styleConfig.skills
      }
    }
  }, [currentTemplate, styleConfig])

  // 计算内容实际高度并支持多页显示
  const contentHeight = React.useMemo(() => {
    const baseHeight = A4_HEIGHT
    
    // 估算内容高度（基于内容量）
    let estimatedHeight = 200 // 个人信息基础高度
    
    if (resumeData.experience?.length) {
      estimatedHeight += resumeData.experience.length * 120 // 每个工作经历约120px
    }
    if (resumeData.education?.length) {
      estimatedHeight += resumeData.education.length * 80 // 每个教育经历约80px
    }
    if (resumeData.skills?.length) {
      estimatedHeight += 100 // 技能部分约100px
    }
    if (resumeData.projects?.length) {
      estimatedHeight += resumeData.projects.length * 100 // 每个项目约100px
    }
    
    return Math.max(baseHeight, estimatedHeight)
  }, [resumeData])

  const pageCount = Math.ceil(contentHeight / A4_HEIGHT)

  // 容器样式 - 不添加 padding，让模板组件自己控制内边距
  const getContainerStyle = (): React.CSSProperties => {
    // 计算行高：spacing.line 存储的是像素值，需要转换为相对值
    // 如果 spacing.line 是 22px，fontSize.content 是 14px，则 lineHeight = 22/14 ≈ 1.57
    const lineHeightValue = Math.max(1.4, mergedStyleConfig.spacing.line / mergedStyleConfig.fontSize.content)
    
    return {
      fontFamily: mergedStyleConfig.fontFamily || 'Inter, sans-serif',
      fontSize: `${mergedStyleConfig.fontSize.content}px`,
      lineHeight: lineHeightValue,
      color: mergedStyleConfig.colors.text,
      backgroundColor: mergedStyleConfig.colors.background,
      padding: 0, // 模板组件自己控制内边距
      width: `${A4_WIDTH}px`,
      minHeight: `${A4_HEIGHT}px`,
      margin: '0 auto',
      position: 'relative' as const,
      boxSizing: 'border-box' as const,
      boxShadow: isExporting ? 'none' : '0 10px 28px -16px rgba(15, 23, 42, 0.28)',
      transformOrigin: 'top center',
      overflow: 'hidden' // 防止内容溢出
    }
  }

  // 渲染分页线（仅在预览模式下显示）
  /**
   * 渲染分页辅助线（非导出模式）
   */
  const renderPageBreakLines = () => {
    if (isExporting) return null

    const lines = []
    // 使用未缩放的高度，因为缩放由外层 div 处理
    const pageHeight = A4_HEIGHT

    for (let i = 1; i < pageCount; i++) {
      lines.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * pageHeight}px`,
            left: 0,
            right: 0,
            height: '1px',
            borderTop: '2px dashed #e5e7eb',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        />
      )
    }

    return lines
  }

  const renderedContent = React.useMemo(() => {
    // 根据模板 ID 选择对应的模板渲染组件
    const templateId = currentTemplate?.id || 'minimal-text'
    
    // 新增黑白实用模板的精确匹配
    switch (templateId) {
      case 'minimal-text':
        return (
          <MinimalTextLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'table-layout':
        return (
          <TableLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'timeline-layout':
      case 'timeline-layout-classic':
        return (
          <TimelineLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            templateId={templateId}
            onSectionClick={onSectionClick}
          />
        )
      case 'two-column-standard':
        return (
          <TwoColumnStandard 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'divider-layout':
        // 分隔线布局使用 TopBottomLayout
        return (
          <TopBottomLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'compact-layout':
        // 紧凑型布局使用 MinimalClean
        return (
          <MinimalClean 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'card-layout':
      case 'card-layout-executive':
        return (
          <CardLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            templateId={templateId}
            onSectionClick={onSectionClick}
          />
        )
      case 'grid-layout':
        return (
          <GridLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'symmetric-layout':
        // 对称布局使用双栏标准布局
        return (
          <TwoColumnStandard 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'sidebar-timeline':
        // 侧边时间轴使用侧边栏布局
        return (
          <ModernSidebar 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'banner-layout':
      case 'banner-layout-compact':
        return (
          <BannerLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            templateId={templateId}
            onSectionClick={onSectionClick}
          />
        )
      case 'line-minimal':
        return (
          <LineMinimalLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
    }
    
    // 判断布局类型（旧模板兼容）
    const isDoubleColumn = currentTemplate?.layout.columns.count === 2
    const leftWidth = parseInt(currentTemplate?.layout.columns.leftWidth || '35')
    const isSidebar = isDoubleColumn && leftWidth <= 32
    const hasGradientHeader = templateId.includes('header') || templateId.includes('banner')
    const isMinimal = templateId.includes('minimal') || templateId.includes('clean')
    const isCentered = templateId.includes('centered') || templateId.includes('symmetric') || templateId.includes('classic')
    const isTopBottom = templateId.includes('top-bottom') || templateId.includes('topbottom')
    
    // 使用专用模板组件渲染
    // 1. 上下栏布局
    if (isTopBottom) {
      return (
        <TopBottomLayout 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 2. 侧边栏布局
    if (isSidebar || templateId.includes('sidebar') || templateId === 'professional-executive' || templateId === 'frontend-developer-sidebar') {
      return (
        <ModernSidebar 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 3. 顶部横幅布局
    if (hasGradientHeader || templateId === 'ux-designer-modern' || templateId === 'header-banner') {
      return (
        <GradientHeader 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 4. 居中对称布局
    if (isCentered || templateId === 'general-classic' || templateId === 'centered-symmetric') {
      return (
        <ClassicElegant 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 5. 极简布局
    if (isMinimal || templateId === 'ui-designer-minimal' || templateId === 'general-minimal') {
      return (
        <MinimalClean 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 6. 创意设计师布局（左右栏）
    if (templateId === 'creative-designer' || isDoubleColumn) {
      return (
        <CreativeDesigner 
          resumeData={resumeData} 
          styleConfig={mergedStyleConfig} 
          onSectionClick={onSectionClick}
        />
      )
    }
    
    // 7. 特定模板匹配
    switch (templateId) {
      case 'modern-minimalist':
        return (
          <ModernMinimalist 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'modern-sidebar':
        return (
          <ModernSidebar 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'gradient-header':
        return (
          <GradientHeader 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'classic-elegant':
      case 'business-professional':
        return (
          <ClassicElegant 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'minimal-clean':
      case 'nordic-minimal':
        return (
          <MinimalClean 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      case 'magazine-style':
      case 'tech-developer':
        return (
          <CreativeDesigner 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
      default:
        // 默认使用极简文本布局
        return (
          <MinimalTextLayout 
            resumeData={resumeData} 
            styleConfig={mergedStyleConfig} 
            onSectionClick={onSectionClick}
          />
        )
    }
  }, [mergedStyleConfig, resumeData, onSectionClick, currentTemplate])

  // 客户端挂载前显示占位符，防止 SSR 闪烁
  if (!isMounted) {
    return (
      <div 
        className={`resume-preview ${className}`}
        style={{
          width: `${A4_WIDTH}px`,
          minHeight: `${A4_HEIGHT}px`,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.08)'
        }}
      />
    )
  }

  return (
    <motion.div 
      ref={outerRef} 
      id="resume-preview" 
      className={`resume-preview ${className}`} 
      style={getContainerStyle()}
      initial={false}
      animate={{ 
        opacity: 1
      }}
      transition={{ duration: 0 }}
    >
      {renderedContent}
      {renderPageBreakLines()}
    </motion.div>
  )
}

export default React.memo(ResumePreview)
