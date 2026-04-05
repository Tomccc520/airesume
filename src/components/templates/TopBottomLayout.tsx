/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.29
 */

'use client'
/* eslint-disable @next/next/no-img-element */

import React from 'react'
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
 * 上下栏布局模板
 * 顶部区域：个人信息、联系方式、技能
 * 底部区域：工作经历、教育背景、项目经历
 */
export const TopBottomLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, skills: skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

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

  /**
   * 渲染技能展示
   */
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null
    
    const displayStyle = skillsConfig?.displayStyle || 'tags'
    
    switch (displayStyle) {
      case 'progress':
        return (
          <div className="grid grid-cols-3 gap-3">
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
          <div className="grid grid-cols-3 gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span style={{ color: colors.primary }}>•</span>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="grid grid-cols-4 gap-2">
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

  return (
    <div className="w-full min-h-full bg-white" style={{ fontFamily: fontFamily || 'Inter, sans-serif' }}>
      {/* 顶部区域 - 个人信息和技能 */}
      <div 
        className="border-b-4"
        style={{ 
          borderColor: colors.primary,
          padding: `${pagePadding}px`,
          paddingBottom: `${pagePadding - 10}px`
        }}
      >
        {/* 个人信息 */}
        <div 
          className="flex items-center justify-between mb-6"
          onClick={() => onSectionClick?.('personal')}
        >
          <div className="flex items-center gap-6">
            {personalInfo.avatar && (
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.name}
                className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                style={{ borderColor: `${colors.primary}30` }}
              />
            )}
            
            <div>
              <h1 
                className="font-bold tracking-wide mb-2"
                style={{ fontSize: `${nameFontSize}px`, color: colors.primary }}
              >
                {personalInfo.name}
              </h1>
              <p 
                className="text-gray-700 font-medium mb-3"
                style={{ fontSize: `${titleFontSize}px` }}
              >
                {personalInfo.title}
              </p>
              
              {/* 联系方式 - 横向排列 */}
              <div className="flex flex-wrap gap-4 text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>
                {personalInfo.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} style={{ color: colors.primary }} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} style={{ color: colors.primary }} />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} style={{ color: colors.primary }} />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={14} style={{ color: colors.primary }} />
                    <span>{t.editor.templatePreview.personalWebsite}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        {personalInfo.summary && (
          <div className="mb-6">
            <p 
              className="text-gray-600"
              style={{ fontSize: `${contentFontSize}px`, lineHeight }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* 技能 - 顶部区域 */}
        {skills && skills.length > 0 && (
          <div onClick={() => onSectionClick?.('skills')}>
            <h2 
              className="font-bold mb-4 flex items-center gap-2"
              style={{ 
                color: colors.primary,
                fontSize: `${titleFontSize}px`
              }}
            >
              {t.editor.skills.title}
            </h2>
            {renderSkills()}
          </div>
        )}
      </div>

      {/* 底部区域 - 工作经历、教育背景、项目 */}
      <div 
        style={{ 
          padding: `${pagePadding}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${sectionSpacing}px`
        }}
      >
        {/* 工作经历 */}
        {experience && experience.length > 0 && (
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
        )}

        {/* 项目经历 */}
        {projects && projects.length > 0 && (
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
        )}

        {/* 教育背景 */}
        {education && education.length > 0 && (
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
        )}
      </div>
    </div>
  )
}
