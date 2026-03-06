'use client'

import React, { useMemo } from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { MapPin, Mail, Phone, Globe, Briefcase } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 渐变头部模板
 * 顶部渐变色块 + 白色内容区，现代感十足
 * 支持 headerLayout、contactLayout、sectionOrder、columns 等样式设置
 */
export const GradientHeader: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, skills: skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

  // 渐变色
  const gradientFrom = colors.primary || '#6366f1'
  const gradientTo = colors.secondary || '#8b5cf6'
  
  // 字体大小
  const nameFontSize = fontSize?.name || 28
  const titleFontSize = fontSize?.title || 18
  const contentFontSize = fontSize?.content || 14
  const smallFontSize = fontSize?.small || 12
  
  // 间距
  const sectionSpacing = spacing?.section || 24
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
      personalInfo.phone && { icon: Phone, value: personalInfo.phone, key: 'phone' },
      personalInfo.email && { icon: Mail, value: personalInfo.email, key: 'email' },
      personalInfo.location && { icon: MapPin, value: personalInfo.location, key: 'location' },
      personalInfo.website && { icon: Globe, value: t.editor.templatePreview.personalWebsite, key: 'website' }
    ].filter(Boolean) as { icon: any; value: string; key: string }[]

    switch (contactLayout) {
      case 'grouped':
        return (
          <div className="flex flex-col gap-1.5" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5 text-white/80">
                <item.icon size={14} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="flex flex-wrap gap-2" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-white/90">
                <item.icon size={12} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'grid':
        return (
          <div className="grid grid-cols-2 gap-2" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5 text-white/80">
                <item.icon size={14} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'sidebar':
        return (
          <div className="flex flex-col gap-1.5 border-l-2 border-white/30 pl-3" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5 text-white/80">
                <item.icon size={14} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      case 'inline':
      default:
        return (
          <div className="flex flex-wrap gap-4 text-white/80" style={{ fontSize: `${smallFontSize}px` }}>
            {contactItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5">
                <item.icon size={14} />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
    }
  }, [personalInfo, contactLayout, smallFontSize, t])

  /**
   * 渲染头部 - 根据 headerLayout 选择不同样式
   */
  const renderHeader = useMemo(() => {
    const headerStyle = {
      background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      padding: `${pagePadding}px`
    }

    switch (headerLayout) {
      case 'centered':
        return (
          <div 
            className="relative text-white text-center"
            style={headerStyle}
            onClick={() => onSectionClick?.('personal')}
          >
            {/* 装饰图案 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative">
              {personalInfo.avatar && (
                <img 
                  src={personalInfo.avatar} 
                  alt={personalInfo.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl mx-auto mb-4"
                />
              )}
              <h1 
                className="font-bold tracking-wide mb-2"
                style={{ fontSize: `${nameFontSize}px` }}
              >
                {personalInfo.name}
              </h1>
              <p 
                className="text-white/90 font-medium mb-4"
                style={{ fontSize: `${titleFontSize}px` }}
              >
                {personalInfo.title}
              </p>
              <div className="flex justify-center">
                {renderContactInfo}
              </div>
            </div>
          </div>
        )
      case 'vertical':
        return (
          <div 
            className="relative text-white"
            style={headerStyle}
            onClick={() => onSectionClick?.('personal')}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            
            <div className="relative">
              {personalInfo.avatar && (
                <img 
                  src={personalInfo.avatar} 
                  alt={personalInfo.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl mb-4"
                />
              )}
              <h1 
                className="font-bold tracking-wide mb-2"
                style={{ fontSize: `${nameFontSize}px` }}
              >
                {personalInfo.name}
              </h1>
              <p 
                className="text-white/90 font-medium mb-4"
                style={{ fontSize: `${titleFontSize}px` }}
              >
                {personalInfo.title}
              </p>
              {renderContactInfo}
            </div>
          </div>
        )
      case 'horizontal':
      default:
        return (
          <div 
            className="relative text-white"
            style={headerStyle}
            onClick={() => onSectionClick?.('personal')}
          >
            {/* 装饰图案 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative flex items-center gap-6">
              {personalInfo.avatar && (
                <img 
                  src={personalInfo.avatar} 
                  alt={personalInfo.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl"
                />
              )}
              
              <div className="flex-1">
                <h1 
                  className="font-bold tracking-wide mb-2"
                  style={{ fontSize: `${nameFontSize}px` }}
                >
                  {personalInfo.name}
                </h1>
                <p 
                  className="text-white/90 font-medium mb-4"
                  style={{ fontSize: `${titleFontSize}px` }}
                >
                  {personalInfo.title}
                </p>
                {renderContactInfo}
              </div>
            </div>
          </div>
        )
    }
  }, [personalInfo, headerLayout, nameFontSize, titleFontSize, pagePadding, gradientFrom, gradientTo, renderContactInfo, onSectionClick])

  /**
   * 渲染技能展示
   */
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null
    
    const displayStyle = skillsConfig?.displayStyle || 'tags'
    
    switch (displayStyle) {
      case 'progress':
        return (
          <div className="grid grid-cols-2 gap-3">
            {skills.map(skill => (
              <div key={skill.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{skill.name}</span>
                  {skillsConfig?.showLevel && (
                    <span className="text-gray-400">{skill.level}%</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${skill.level}%`,
                      backgroundColor: colors.primary
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 'list':
        return (
          <div className="flex flex-col gap-1.5">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span style={{ color: colors.primary }}>•</span>
                <span>{skill.name}</span>
                {skillsConfig?.showLevel && (
                  <span className="text-gray-400 ml-auto">{skill.level}%</span>
                )}
              </div>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="grid grid-cols-3 gap-2">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className="p-2 rounded-lg text-center border"
                style={{ borderColor: `${colors.primary}30` }}
              >
                <div className="text-sm font-medium text-gray-700">{skill.name}</div>
                {skillsConfig?.showLevel && (
                  <div className="text-xs text-gray-400 mt-0.5">{skill.level}%</div>
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
                className="text-center p-2 rounded"
                style={{ backgroundColor: `${colors.primary}08` }}
              >
                <div className="text-sm text-gray-700">{skill.name}</div>
              </div>
            ))}
          </div>
        )
      case 'radar':
        return (
          <div className="grid grid-cols-3 gap-4">
            {skills.map(skill => (
              <div key={skill.id} className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{ 
                    borderColor: colors.primary,
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
      case 'tags':
      default:
        return (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span 
                key={skill.id}
                className="px-3 py-1.5 rounded-full font-medium"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  color: colors.primary,
                  fontSize: `${contentFontSize}px`
                }}
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
      <section onClick={() => onSectionClick?.('personal')}>
        <p 
          className="text-gray-600"
          style={{ fontSize: `${contentFontSize}px`, lineHeight }}
        >
          {personalInfo.summary}
        </p>
      </section>
    )
  }

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null
    return (
      <section onClick={() => onSectionClick?.('experience')}>
        <h2 
          className="font-bold mb-5 pb-2 flex items-center gap-2"
          style={{ 
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`,
            fontSize: `${titleFontSize}px`
          }}
        >
          <Briefcase size={18} />
          {t.editor.experience.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing + 8}px` }}>
          {experience.map(exp => (
            <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${colors.primary}30` }}>
              <div 
                className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 
                    className="font-bold text-gray-800"
                    style={{ fontSize: `${contentFontSize}px` }}
                  >
                    {exp.position}
                  </h3>
                  <p 
                    className="font-medium" 
                    style={{ color: colors.primary, fontSize: `${smallFontSize}px` }}
                  >
                    {exp.company}
                  </p>
                </div>
                <span 
                  className="text-gray-400 bg-gray-50 px-2 py-1 rounded flex-shrink-0"
                  style={{ fontSize: `${smallFontSize - 2}px` }}
                >
                  {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                </span>
              </div>
              <ul className="space-y-1.5 mt-3">
                {exp.description.map((desc, i) => (
                  <li 
                    key={i} 
                    className="text-gray-600 flex items-start gap-2"
                    style={{ fontSize: `${smallFontSize}px`, lineHeight }}
                  >
                    <span style={{ color: colors.accent }}>→</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderEducation = () => {
    if (!education || education.length === 0) return null
    return (
      <section onClick={() => onSectionClick?.('education')}>
        <h2 
          className="font-bold mb-5 pb-2"
          style={{ 
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`,
            fontSize: `${titleFontSize}px`
          }}
        >
          {t.editor.education.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 
                  className="font-bold text-gray-800"
                  style={{ fontSize: `${contentFontSize}px` }}
                >
                  {edu.school}
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ fontSize: `${smallFontSize}px` }}
                >
                  {edu.degree} · {edu.major}
                </p>
                {edu.gpa && (
                  <p 
                    className="text-gray-400 mt-1"
                    style={{ fontSize: `${smallFontSize - 2}px` }}
                  >
                    GPA: {edu.gpa}
                  </p>
                )}
              </div>
              <span 
                className="text-gray-400 flex-shrink-0"
                style={{ fontSize: `${smallFontSize - 2}px` }}
              >
                {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
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
      <section onClick={() => onSectionClick?.('skills')}>
        <h2 
          className="font-bold mb-5 pb-2"
          style={{ 
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`,
            fontSize: `${titleFontSize}px`
          }}
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
      <section onClick={() => onSectionClick?.('projects')}>
        <h2 
          className="font-bold mb-5 pb-2"
          style={{ 
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`,
            fontSize: `${titleFontSize}px`
          }}
        >
          {t.editor.projects.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing + 4}px` }}>
          {projects.map(project => (
            <div key={project.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 
                    className="font-bold text-gray-800"
                    style={{ fontSize: `${contentFontSize}px` }}
                  >
                    {project.name}
                  </h3>
                  {project.url && (
                    <a 
                      href={project.url} 
                      className="hover:underline" 
                      style={{ color: colors.primary, fontSize: `${smallFontSize - 2}px` }}
                    >
                      {project.url}
                    </a>
                  )}
                </div>
                <span 
                  className="text-gray-400 flex-shrink-0"
                  style={{ fontSize: `${smallFontSize - 2}px` }}
                >
                  {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                </span>
              </div>
              <p 
                className="text-gray-600 mb-3"
                style={{ fontSize: `${smallFontSize}px`, lineHeight }}
              >
                {project.description}
              </p>
              {project.technologies && (
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${colors.accent}15`,
                        color: colors.accent,
                        fontSize: `${smallFontSize - 2}px`
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
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
      <div className="w-full min-h-full bg-white" style={{ fontFamily: fontFamily || 'Inter, sans-serif' }}>
        {renderHeader}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: `${sectionSpacing}px`,
            padding: `${pagePadding}px`
          }}
        >
          {sectionOrder.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSection(sectionId)}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  // 双列布局
  return (
    <div className="w-full min-h-full bg-white" style={{ fontFamily: fontFamily || 'Inter, sans-serif' }}>
      {renderHeader}
      <div 
        className="flex"
        style={{ 
          gap: `${columnGap}px`,
          padding: `${pagePadding}px`
        }}
      >
        {/* 左列 */}
        <div 
          style={{ 
            width: `${leftColumnWidth}%`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${sectionSpacing}px`
          }}
        >
          {columnSectionOrder.left.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSection(sectionId)}
            </React.Fragment>
          ))}
        </div>
        {/* 右列 */}
        <div 
          style={{ 
            width: `${100 - leftColumnWidth}%`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${sectionSpacing}px`
          }}
        >
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
