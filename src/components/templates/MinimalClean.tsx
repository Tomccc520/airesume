'use client'

import React, { useMemo } from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 极简清洁模板
 * 极简主义设计，突出内容本身，无多余装饰
 * 支持 headerLayout、contactLayout、sectionOrder、columns 等样式设置
 */
export const MinimalClean: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, skills: skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)
  
  // 字体
  const fontFamilyStyle = fontFamily || 'Inter, sans-serif'
  
  // 字体大小
  const nameFontSize = fontSize?.name || 28
  const titleFontSize = fontSize?.title || 18
  const contentFontSize = fontSize?.content || 14
  const smallFontSize = fontSize?.small || 12
  
  // 间距
  const sectionSpacing = spacing?.section || 32
  const itemSpacing = spacing?.item || 16
  const lineHeight = spacing?.line ? Math.max(1.4, spacing.line / contentFontSize) : 1.4
  
  // 页面内边距
  const pagePadding = layout?.padding || 40
  
  // 布局设置
  const headerLayout = layout?.headerLayout || 'horizontal'
  const contactLayout = layout?.contactLayout || 'inline'
  const columns = layout?.columns || 1
  const sectionOrder = layout?.sectionOrder || ['personal', 'experience', 'education', 'skills', 'projects']
  const columnSectionOrder = layout?.columnSectionOrder || {
    left: ['personal', 'skills', 'education'],
    right: ['experience', 'projects']
  }
  const leftColumnWidth = layout?.leftColumnWidth || 35
  const columnGap = layout?.columnGap || 24

  /**
   * 渲染联系信息 - 根据 contactLayout 选择不同样式
   */
  const renderContactInfo = useMemo(() => {
    const contactItems = [
      personalInfo.email && { icon: Mail, value: personalInfo.email, key: 'email' },
      personalInfo.phone && { icon: Phone, value: personalInfo.phone, key: 'phone' },
      personalInfo.location && { icon: MapPin, value: personalInfo.location, key: 'location' },
      personalInfo.website && { icon: Globe, value: personalInfo.website, key: 'website' }
    ].filter(Boolean) as { icon: any; value: string; key: string }[]

    switch (contactLayout) {
      case 'grouped':
        return (
          <div className="flex flex-col gap-1" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-2 text-gray-400">
                <item.icon size={12} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="grid grid-cols-2 gap-2" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-500">
                <item.icon size={12} />
                <span className="truncate">{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'grid':
        return (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-2 text-gray-400">
                <item.icon size={12} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'sidebar':
        return (
          <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-3" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-2 text-gray-400">
                <item.icon size={12} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'inline':
      default:
        return (
          <div className="flex flex-wrap gap-6 text-gray-400" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <span key={item.key}>{item.value}</span>
            ))}
          </div>
        )
    }
  }, [personalInfo, contactLayout, smallFontSize])

  /**
   * 渲染头部 - 根据 headerLayout 选择不同样式
   */
  const renderHeader = useMemo(() => {
    const headerContent = (
      <>
        <h1 
          className="font-light tracking-widest text-gray-900"
          style={{ fontSize: `${nameFontSize}px` }}
        >
          {personalInfo.name}
        </h1>
        <p 
          className="text-gray-500 font-light"
          style={{ fontSize: `${titleFontSize}px`, marginTop: '4px' }}
        >
          {personalInfo.title}
        </p>
      </>
    )

    switch (headerLayout) {
      case 'centered':
        return (
          <header 
            className="text-center"
            style={{ marginBottom: `${sectionSpacing}px` }}
            onClick={() => onSectionClick?.('personal')}
          >
            {personalInfo.avatar && (
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
            )}
            {headerContent}
            <div className="mt-4 flex justify-center">
              {renderContactInfo}
            </div>
          </header>
        )
      case 'vertical':
        return (
          <header 
            style={{ marginBottom: `${sectionSpacing}px` }}
            onClick={() => onSectionClick?.('personal')}
          >
            {personalInfo.avatar && (
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.name}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
            )}
            {headerContent}
            <div className="mt-4">
              {renderContactInfo}
            </div>
          </header>
        )
      case 'horizontal':
      default:
        return (
          <header 
            className="flex items-start gap-6"
            style={{ marginBottom: `${sectionSpacing}px` }}
            onClick={() => onSectionClick?.('personal')}
          >
            {personalInfo.avatar && (
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.name}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              {headerContent}
              <div className="mt-4">
                {renderContactInfo}
              </div>
            </div>
          </header>
        )
    }
  }, [personalInfo, headerLayout, nameFontSize, titleFontSize, sectionSpacing, renderContactInfo, onSectionClick])

  /**
   * 渲染技能展示 - 根据 skillsConfig.displayStyle 选择不同样式
   */
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null
    
    const displayStyle = skillsConfig?.displayStyle || 'list'
    
    switch (displayStyle) {
      case 'progress':
        return (
          <div className="grid grid-cols-2 gap-4">
            {skills.map(skill => (
              <div key={skill.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-light text-gray-600">{skill.name}</span>
                  {skillsConfig?.showLevel && (
                    <span className="text-gray-400">{skill.level}%</span>
                  )}
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${skill.level}%`,
                      backgroundColor: colors.primary || '#374151'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 'tags':
        return (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span 
                key={skill.id}
                className="px-3 py-1 rounded-full text-sm font-light"
                style={{ 
                  backgroundColor: `${colors.primary || '#374151'}10`,
                  color: colors.primary || '#374151'
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="grid grid-cols-3 gap-3">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className="p-3 rounded-lg text-center border border-gray-100"
              >
                <div className="text-sm font-light text-gray-600">{skill.name}</div>
                {skillsConfig?.showLevel && (
                  <div className="text-xs text-gray-400 mt-1">{skill.level}%</div>
                )}
              </div>
            ))}
          </div>
        )
      case 'grid':
        return (
          <div className="grid grid-cols-4 gap-2">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className="text-center p-2 bg-gray-50 rounded"
              >
                <div className="text-sm font-light text-gray-600">{skill.name}</div>
              </div>
            ))}
          </div>
        )
      case 'radar':
        // 简化版雷达图 - 用圆形进度表示
        return (
          <div className="grid grid-cols-3 gap-4">
            {skills.map(skill => (
              <div key={skill.id} className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{ 
                    borderColor: colors.primary || '#374151',
                    opacity: (skill.level || 50) / 100
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>
                    {skill.level}%
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1 text-center">{skill.name}</span>
              </div>
            ))}
          </div>
        )
      case 'list':
      default:
        return (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {skills.map(skill => (
              <span 
                key={skill.id} 
                className="text-gray-600 font-light"
                style={{ fontSize: `${contentFontSize}px` }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        )
    }
  }


  // 各个模块的渲染函数
  const renderPersonalSummary = () => {
    if (!personalInfo.summary) return null
    return (
      <section 
        style={{ marginBottom: `${sectionSpacing}px` }} 
        onClick={() => onSectionClick?.('personal')}
      >
        <p 
          className="text-gray-600 leading-loose font-light"
          style={{ fontSize: `${contentFontSize}px` }}
        >
          {personalInfo.summary}
        </p>
      </section>
    )
  }

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null
    return (
      <section 
        style={{ marginBottom: `${sectionSpacing}px` }} 
        onClick={() => onSectionClick?.('experience')}
      >
        <h2 
          className="font-medium tracking-[0.3em] text-gray-400 uppercase mb-6"
          style={{ fontSize: `${smallFontSize - 2}px` }}
        >
          {t.editor.experience.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing + 8}px` }}>
          {experience.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <h3 
                    className="font-medium text-gray-900"
                    style={{ fontSize: `${contentFontSize + 2}px` }}
                  >
                    {exp.position}
                  </h3>
                  <p 
                    className="text-gray-500"
                    style={{ fontSize: `${smallFontSize}px` }}
                  >
                    {exp.company}
                  </p>
                </div>
                <span 
                  className="text-gray-400 flex-shrink-0"
                  style={{ fontSize: `${smallFontSize - 2}px` }}
                >
                  {formatDateStr(exp.startDate)} — {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                </span>
              </div>
              <div className="space-y-2">
                {exp.description.map((desc, i) => (
                  <p 
                    key={i} 
                    className="text-gray-600 font-light"
                    style={{ fontSize: `${smallFontSize}px`, lineHeight }}
                  >
                    {desc}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderEducation = () => {
    if (!education || education.length === 0) return null
    return (
      <section 
        style={{ marginBottom: `${sectionSpacing}px` }} 
        onClick={() => onSectionClick?.('education')}
      >
        <h2 
          className="font-medium tracking-[0.3em] text-gray-400 uppercase mb-6"
          style={{ fontSize: `${smallFontSize - 2}px` }}
        >
          {t.editor.education.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-baseline">
              <div>
                <h3 
                  className="font-medium text-gray-900"
                  style={{ fontSize: `${contentFontSize + 2}px` }}
                >
                  {edu.school}
                </h3>
                <p 
                  className="text-gray-500"
                  style={{ fontSize: `${smallFontSize}px` }}
                >
                  {edu.degree} · {edu.major}
                </p>
              </div>
              <span 
                className="text-gray-400 flex-shrink-0"
                style={{ fontSize: `${smallFontSize - 2}px` }}
              >
                {formatDateStr(edu.startDate)} — {formatDateStr(edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderSkillsSection = () => {
    if (!skills || skills.length === 0) return null
    return (
      <section 
        style={{ marginBottom: `${sectionSpacing}px` }} 
        onClick={() => onSectionClick?.('skills')}
      >
        <h2 
          className="font-medium tracking-[0.3em] text-gray-400 uppercase mb-6"
          style={{ fontSize: `${smallFontSize - 2}px` }}
        >
          {t.editor.skills.title}
        </h2>
        {renderSkills()}
      </section>
    )
  }

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null
    return (
      <section 
        style={{ marginBottom: `${sectionSpacing}px` }}
        onClick={() => onSectionClick?.('projects')}
      >
        <h2 
          className="font-medium tracking-[0.3em] text-gray-400 uppercase mb-6"
          style={{ fontSize: `${smallFontSize - 2}px` }}
        >
          {t.editor.projects.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing + 8}px` }}>
          {projects.map(project => (
            <div key={project.id}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 
                  className="font-medium text-gray-900"
                  style={{ fontSize: `${contentFontSize + 2}px` }}
                >
                  {project.name}
                </h3>
                <span 
                  className="text-gray-400 flex-shrink-0"
                  style={{ fontSize: `${smallFontSize - 2}px` }}
                >
                  {formatDateStr(project.startDate)} — {formatDateStr(project.endDate)}
                </span>
              </div>
              <p 
                className="text-gray-600 font-light mb-2"
                style={{ fontSize: `${smallFontSize}px`, lineHeight }}
              >
                {project.description}
              </p>
              {project.technologies && (
                <p 
                  className="text-gray-400"
                  style={{ fontSize: `${smallFontSize - 2}px` }}
                >
                  {project.technologies.join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  // 根据 sectionOrder 渲染模块
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return renderPersonalSummary()
      case 'experience':
        return renderExperience()
      case 'education':
        return renderEducation()
      case 'skills':
        return renderSkillsSection()
      case 'projects':
        return renderProjects()
      default:
        return null
    }
  }

  // 单列布局
  if (columns === 1) {
    return (
      <div 
        className="w-full min-h-full bg-white"
        style={{ padding: `${pagePadding}px`, fontFamily: fontFamilyStyle }}
      >
        {renderHeader}
        {sectionOrder.map(sectionId => (
          <React.Fragment key={sectionId}>
            {renderSection(sectionId)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  // 双列布局
  return (
    <div 
      className="w-full min-h-full bg-white"
      style={{ padding: `${pagePadding}px`, fontFamily: fontFamilyStyle }}
    >
      {renderHeader}
      <div 
        className="flex"
        style={{ gap: `${columnGap}px` }}
      >
        {/* 左列 */}
        <div style={{ width: `${leftColumnWidth}%` }}>
          {columnSectionOrder.left.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSection(sectionId)}
            </React.Fragment>
          ))}
        </div>
        {/* 右列 */}
        <div style={{ width: `${100 - leftColumnWidth}%` }}>
          {columnSectionOrder.right.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSection(sectionId)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
