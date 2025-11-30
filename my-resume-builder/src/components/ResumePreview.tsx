/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResumeData } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { StyleConfig, useStyle } from '@/contexts/StyleContext'
import PersonalHeader from './PersonalHeader'
import SkillsDisplay from './SkillsDisplay'

interface ResumePreviewProps {
  resumeData: ResumeData
  className?: string
  currentTemplate?: TemplateStyle
  isExporting?: boolean
  scale?: number
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
  scale = 1,
  onSectionClick
}: ResumePreviewProps) => {
  const outerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(1)

  useEffect(() => {
    const calc = () => {
      const parentWidth = outerRef.current?.parentElement?.clientWidth || A4_WIDTH
      const s = Math.max(0.5, Math.min(1, (parentWidth - 24) / A4_WIDTH))
      setFitScale(s)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  
  const { styleConfig } = useStyle()
  
  /**
   * 获取合并后的样式配置
   */
  const mergedStyleConfig = React.useMemo((): StyleConfig => {
    const defaultConfig: StyleConfig = {
      fontSize: {
        name: 28,
        title: 18,
        content: 14,
        small: 12
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1f2937',
        accent: '#3b82f6',
        background: '#ffffff'
      },
      spacing: {
        section: 24,
        item: 16,
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
        padding: 40,
        columns: 1,
        columnGap: 32,
        leftColumnWidth: 35,
        rightColumnWidth: 65,
        headerLayout: 'horizontal',
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

    if (!currentTemplate) {
      return {
        ...defaultConfig,
        fontSize: { ...defaultConfig.fontSize, ...styleConfig.fontSize },
        colors: { ...defaultConfig.colors, ...styleConfig.colors },
        spacing: { ...defaultConfig.spacing, ...styleConfig.spacing },
        avatar: { ...defaultConfig.avatar },
        layout: { ...defaultConfig.layout, ...styleConfig.layout },
        skills: { ...defaultConfig.skills, ...styleConfig.skills }
      }
    }

    // 辅助函数：将CSS尺寸字符串转换为像素值
    const parseSize = (sizeStr: string, defaultValue: number): number => {
      if (!sizeStr) return defaultValue
      
      if (sizeStr.includes('rem')) {
        const remValue = parseFloat(sizeStr.replace('rem', ''))
        return Math.round(remValue * 16)
      }
      
      if (sizeStr.includes('px')) {
        return parseInt(sizeStr.replace('px', ''))
      }
      
      const numValue = parseFloat(sizeStr)
      return isNaN(numValue) ? defaultValue : Math.round(numValue)
    }

    const merged: StyleConfig = {
      ...defaultConfig,
      fontSize: {
        name: parseSize(currentTemplate.fonts?.size?.heading || '', defaultConfig.fontSize.name),
        title: parseSize(currentTemplate.fonts?.size?.body || '', defaultConfig.fontSize.title),
        content: parseSize(currentTemplate.fonts?.size?.body || '', defaultConfig.fontSize.content),
        small: parseSize(currentTemplate.fonts?.size?.small || '', defaultConfig.fontSize.small)
      },
      colors: {
        ...defaultConfig.colors,
        primary: currentTemplate.colors?.primary || defaultConfig.colors.primary,
        secondary: currentTemplate.colors?.secondary || defaultConfig.colors.secondary,
        text: currentTemplate.colors?.text || defaultConfig.colors.text,
        accent: currentTemplate.colors?.accent || defaultConfig.colors.accent,
        background: currentTemplate.colors?.background || defaultConfig.colors.background
      },
      spacing: { ...defaultConfig.spacing },
      avatar: { ...defaultConfig.avatar },
      layout: { ...defaultConfig.layout },
      skills: { ...defaultConfig.skills }
    }
    return {
      ...merged,
      fontSize: { ...merged.fontSize, ...styleConfig.fontSize },
      colors: { ...merged.colors, ...styleConfig.colors },
      spacing: { ...merged.spacing, ...styleConfig.spacing },
      layout: { ...merged.layout, ...styleConfig.layout },
      skills: { ...merged.skills, ...styleConfig.skills }
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
  const isTwoColumns = styleConfig.layout.columns === 2
  
  // 始终尊重用户的列数设置，不受容器宽度限制
  const shouldTwoColumns = isTwoColumns

  /**
   * 分区标题样式
   */
  const getSectionTitleStyle = (): React.CSSProperties => {
    const style = currentTemplate?.components?.sectionTitle?.style || 'underline'
    const alignment = currentTemplate?.components?.sectionTitle?.alignment || 'left'
    const forcePlain = styleConfig.layout.columns === 1 && styleConfig.layout.headerLayout === 'centered'
    const base: React.CSSProperties = {
      fontSize: `${Math.max(14, mergedStyleConfig.fontSize.title - 2)}px`,
      fontWeight: '700',
      color: mergedStyleConfig.colors.primary,
      marginBottom: `${Math.max(12, mergedStyleConfig.spacing.item - 4)}px`,
      textAlign: alignment
    }
    if (forcePlain) return base
    if (style === 'underline') {
      return { ...base, borderBottom: `2px solid ${mergedStyleConfig.colors.primary}`, paddingBottom: '6px' }
    }
    if (style === 'background') {
      return { ...base, backgroundColor: `${mergedStyleConfig.colors.primary}12`, borderRadius: '6px', padding: '6px 10px' }
    }
    if (style === 'border') {
      return { ...base, border: `1px solid ${mergedStyleConfig.colors.primary}`, borderRadius: '6px', padding: '6px 10px' }
    }
    return base
  }

  /**
   * 项目符号样式字符
   */
  const getBulletChar = (): string | null => {
    const bullet = currentTemplate?.components?.listItem?.bulletStyle || 'dot'
    if (bullet === 'dot') return '•'
    if (bullet === 'dash') return '—'
    if (bullet === 'arrow') return '→'
    return null
  }

  /**
   * 日期格式化
   */
  const formatDate = (date?: string): string => {
    if (!date) return ''
    const fmt = currentTemplate?.components?.dateFormat?.format || 'YYYY-MM'
    if (fmt === 'MM/YYYY') {
      const [y,m] = date.split('-')
      return `${m}/${y}`
    }
    if (fmt === 'YYYY年MM月') {
      const [y,m] = date.split('-')
      return `${y}年${m}月`
    }
    return date
  }

  // 容器样式
  const getContainerStyle = () => ({
    fontFamily: styleConfig.fontFamily || 'Inter, sans-serif',
    fontSize: `${mergedStyleConfig.fontSize.content}px`,
    lineHeight: mergedStyleConfig.spacing.line / 16,
    color: mergedStyleConfig.colors.text,
    backgroundColor: mergedStyleConfig.colors.background,
    padding: `${mergedStyleConfig.layout.padding}px`,
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    margin: '0 auto',
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
    boxShadow: isExporting ? 'none' : '0 0 10px rgba(0, 0, 0, 0.1)',
    transform: isExporting ? 'none' : `scale(${scale * fitScale})`,
    transformOrigin: 'top center'
  })

  // 内容包装器样式 - 支持双栏
  const wrapperStyle: React.CSSProperties = shouldTwoColumns ? {
    padding: `${Math.max(20, mergedStyleConfig.layout.padding)}px`,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: (() => {
      const total = Math.max(1, styleConfig.layout.leftColumnWidth + styleConfig.layout.rightColumnWidth)
      const leftPctRaw = (styleConfig.layout.leftColumnWidth / total) * 100
      const leftPct = Math.max(30, Math.min(70, Math.round(leftPctRaw)))
      const rightPct = 100 - leftPct
      return `${leftPct}% ${rightPct}%`
    })(),
    columnGap: `${styleConfig.layout.columnGap}px`,
    alignItems: 'start'
  } : {
    padding: `${Math.max(20, mergedStyleConfig.layout.padding)}px`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: `${Math.max(16, mergedStyleConfig.spacing.section)}px`
  }

  // 渲染个人信息部分
  /**
   * 渲染个人信息部分
   */
  const renderPersonalInfo = () => (
    <motion.section 
      layout
      className="resume-section relative group cursor-pointer" 
      style={{ 
        marginBottom: `${Math.max(16, mergedStyleConfig.spacing.section)}px`
      }}
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={(e) => {
        e.stopPropagation()
        onSectionClick?.('personal')
      }}
    >
      {!isExporting && (
        <div className="absolute -inset-2 border-2 border-transparent group-hover:border-blue-400/50 group-hover:bg-blue-50/30 rounded-lg transition-all duration-200 pointer-events-none z-10" />
      )}
      <PersonalHeader
        personalInfo={resumeData.personalInfo}
        currentTemplate={currentTemplate}
        onElementClick={() => onSectionClick?.('personal')}
      />
    </motion.section>
  )

  // 渲染工作经历部分
  const renderExperience = () => {
    if (!resumeData.experience?.length) return null

    return (
      <motion.section 
        className="resume-section relative group cursor-pointer" 
        style={{ marginBottom: `${Math.max(24, mergedStyleConfig.spacing.section)}px` }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick?.('experience')
        }}
      >
        {!isExporting && (
          <div className="absolute -inset-2 border-2 border-transparent group-hover:border-blue-400/50 group-hover:bg-blue-50/30 rounded-lg transition-all duration-200 pointer-events-none z-10" />
        )}
        <h2 style={getSectionTitleStyle()}>
          工作经历
        </h2>
        <div style={{ position: 'relative', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: `${Math.max(16, mergedStyleConfig.spacing.item)}px` }}>
          {/* 时间线竖线 */}
          <div style={{ position: 'absolute', left: '8px', top: '4px', bottom: '0', width: '1px', background: `${mergedStyleConfig.colors.accent}66` }} />
          {resumeData.experience.map((exp) => (
            <div key={exp.id} style={{ position: 'relative', paddingBottom: '8px' }}>
              {/* 时间线圆点 */}
              <div style={{ position: 'absolute', left: '4px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: mergedStyleConfig.colors.primary, border: `2px solid ${mergedStyleConfig.colors.background}` }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: `${mergedStyleConfig.fontSize.content + 3}px`,
                    fontWeight: '600',
                    color: mergedStyleConfig.colors.text,
                    margin: 0,
                    marginBottom: '2px',
                    fontFamily: currentTemplate?.fonts?.heading || undefined
                  }}>
                    {exp.position}
                  </h3>
                  <p style={{
                    fontSize: `${mergedStyleConfig.fontSize.content + 1}px`,
                    color: mergedStyleConfig.colors.secondary,
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    {exp.company}
                  </p>
                </div>
                <span style={{
                  fontSize: `${mergedStyleConfig.fontSize.small}px`,
                  color: mergedStyleConfig.colors.secondary,
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate(exp.startDate)} - {exp.current ? '至今' : formatDate(exp.endDate)}
                </span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: getBulletChar() ? '12px' : '0',
                listStyleType: 'none',
                position: 'relative'
              }}>
                {exp.description.map((desc, index) => (
                  <li key={index} style={{
                    fontSize: `${mergedStyleConfig.fontSize.content}px`,
                    color: mergedStyleConfig.colors.text,
                    marginBottom: '8px',
                    lineHeight: 1.6,
                    position: 'relative',
                    paddingLeft: getBulletChar() ? '16px' : '0'
                  }}>
                    {/* 自定义项目符号 */}
                    {getBulletChar() && (
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        top: '0.2em',
                        color: mergedStyleConfig.colors.accent,
                        fontSize: `${mergedStyleConfig.fontSize.small}px`
                      }}>
                        {getBulletChar()}
                      </span>
                    )}
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>
    )
  }

  // 渲染教育经历部分
  const renderEducation = () => {
    if (!resumeData.education?.length) return null

    return (
      <motion.section 
        className="resume-section relative group cursor-pointer" 
        style={{ marginBottom: `${mergedStyleConfig.spacing.section}px` }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick?.('education')
        }}
      >
        {!isExporting && (
          <div className="absolute -inset-2 border-2 border-transparent group-hover:border-blue-400/50 group-hover:bg-blue-50/30 rounded-lg transition-all duration-200 pointer-events-none z-10" />
        )}
        <h2 style={getSectionTitleStyle()}>
          教育经历
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${mergedStyleConfig.spacing.item}px` }}>
          {resumeData.education.map((edu) => (
            <div key={edu.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{
                    fontSize: `${mergedStyleConfig.fontSize.content + 2}px`,
                    fontWeight: '600',
                    color: mergedStyleConfig.colors.text,
                    margin: 0
                  }}>
                    {edu.school}
                  </h3>
                  <p style={{
                    fontSize: `${mergedStyleConfig.fontSize.content}px`,
                    color: mergedStyleConfig.colors.secondary,
                    margin: '4px 0 0 0'
                  }}>
                    {edu.degree} · {edu.major}
                  </p>
                </div>
                <span style={{
                  fontSize: `${mergedStyleConfig.fontSize.small}px`,
                  color: mergedStyleConfig.colors.secondary,
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              {edu.gpa && (
                <p style={{
                  fontSize: `${mergedStyleConfig.fontSize.small}px`,
                  color: mergedStyleConfig.colors.text,
                  margin: '4px 0 0 0'
                }}>
                  GPA: {edu.gpa}
                </p>
              )}
              {edu.description && (
                <p style={{
                  fontSize: `${mergedStyleConfig.fontSize.content}px`,
                  color: mergedStyleConfig.colors.text,
                  margin: '8px 0 0 0',
                  lineHeight: 1.6
                }}>
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.section>
    )
  }

  // 渲染技能部分
  const renderSkills = () => {
    if (!resumeData.skills?.length) return null

    return (
      <motion.section 
        className="resume-section relative group cursor-pointer" 
        style={{ marginBottom: `${mergedStyleConfig.spacing.section}px` }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick?.('skills')
        }}
      >
        {!isExporting && (
          <div className="absolute -inset-2 border-2 border-transparent group-hover:border-blue-400/50 group-hover:bg-blue-50/30 rounded-lg transition-all duration-200 pointer-events-none z-10" />
        )}
        <h2 style={getSectionTitleStyle()}>
          专业技能
        </h2>
        <SkillsDisplay skills={resumeData.skills} />
      </motion.section>
    )
  }

  // 渲染项目经历部分
  const renderProjects = () => {
    if (!resumeData.projects?.length) return null

    return (
      <motion.section 
        className="resume-section relative group cursor-pointer" 
        style={{ marginBottom: `${mergedStyleConfig.spacing.section}px` }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick?.('projects')
        }}
      >
        {!isExporting && (
          <div className="absolute -inset-2 border-2 border-transparent group-hover:border-blue-400/50 group-hover:bg-blue-50/30 rounded-lg transition-all duration-200 pointer-events-none z-10" />
        )}
        <h2 style={getSectionTitleStyle()}>
          项目经历
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${mergedStyleConfig.spacing.item}px` }}>
          {resumeData.projects.map((project) => (
            <div key={project.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{
                    fontSize: `${mergedStyleConfig.fontSize.content + 2}px`,
                    fontWeight: '600',
                    color: mergedStyleConfig.colors.text,
                    margin: 0
                  }}>
                    {project.name}
                  </h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: `${mergedStyleConfig.fontSize.small}px`,
                      color: mergedStyleConfig.colors.primary,
                      textDecoration: 'none',
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {project.url}
                    </a>
                  )}
                </div>
                <span style={{
                  fontSize: `${mergedStyleConfig.fontSize.small}px`,
                  color: mergedStyleConfig.colors.secondary,
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
              <p style={{
                fontSize: `${mergedStyleConfig.fontSize.content}px`,
                color: mergedStyleConfig.colors.text,
                margin: '8px 0',
                lineHeight: 1.6
              }}>
                {project.description}
              </p>
              {project.technologies?.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontSize: `${mergedStyleConfig.fontSize.small}px`,
                    color: mergedStyleConfig.colors.secondary,
                    fontWeight: '500'
                  }}>
                    技术栈：
                  </span>
                  <span style={{
                    fontSize: `${mergedStyleConfig.fontSize.small}px`,
                    color: mergedStyleConfig.colors.text,
                    marginLeft: '8px'
                  }}>
                    {project.technologies.join(' • ')}
                  </span>
                </div>
              )}
              {project.highlights?.length > 0 && (
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'none', // 移除默认圆点
                  position: 'relative'
                }}>
                  {project.highlights.map((highlight, index) => (
                    <li key={index} style={{
                      fontSize: `${mergedStyleConfig.fontSize.content}px`,
                      color: mergedStyleConfig.colors.text,
                      marginBottom: '8px',
                      lineHeight: 1.6,
                      position: 'relative',
                      paddingLeft: getBulletChar() ? '16px' : '0'
                    }}>
                      {getBulletChar() && (
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          top: '0.2em',
                          color: mergedStyleConfig.colors.accent,
                          fontSize: `${mergedStyleConfig.fontSize.small}px`
                        }}>
                          {getBulletChar()}
                        </span>
                      )}
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </motion.section>
    )
  }

  // 渲染分页线（仅在预览模式下显示）
  /**
   * 渲染分页辅助线（非导出模式）
   */
  const renderPageBreakLines = () => {
    if (isExporting) return null

    const lines = []
    const scaledPageHeight = A4_HEIGHT * (scale || 0.6)

    for (let i = 1; i < pageCount; i++) {
      lines.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * scaledPageHeight}px`,
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

  const renderSectionByKey = (key: string) => {
    switch (key) {
      case 'personal':
        return renderPersonalInfo()
      case 'experience':
        return renderExperience()
      case 'education':
        return renderEducation()
      case 'skills':
        return renderSkills()
      case 'projects':
        return renderProjects()
      default:
        return null
    }
  }

  return (
    <motion.div 
      ref={outerRef} 
      id="resume-preview" 
      className={`resume-preview ${className}`} 
      style={getContainerStyle() as any}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {shouldTwoColumns ? (
        <div style={wrapperStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(16, mergedStyleConfig.spacing.section)}px` }}>
            {(mergedStyleConfig.layout.columnSectionOrder?.left || ['personal', 'skills', 'education']).map((key) => (
              <React.Fragment key={key}>{renderSectionByKey(key)}</React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(16, mergedStyleConfig.spacing.section)}px` }}>
            {(mergedStyleConfig.layout.columnSectionOrder?.right || ['experience', 'projects']).map((key) => (
              <React.Fragment key={key}>{renderSectionByKey(key)}</React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div style={wrapperStyle}>
          {(mergedStyleConfig.layout.sectionOrder || ['personal','experience','education','skills','projects']).map((key) => (
            <React.Fragment key={key}>{renderSectionByKey(key)}</React.Fragment>
          ))}
        </div>
      )}
      {renderPageBreakLines()}
    </motion.div>
  )
}

export default React.memo(ResumePreview)