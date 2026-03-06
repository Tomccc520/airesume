/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 * 
 * @description Modern Minimalist 模板 - 现代极简风格
 * 特点：超简洁设计、大量留白、细线条、优雅排版
 */

'use client'

import React, { useMemo } from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * Modern Minimalist 模板
 * 现代极简风格，强调内容层次和视觉呼吸感
 */
export const ModernMinimalist: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, skills: skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)
  
  // 样式配置
  const fontFamilyStyle = fontFamily || 'Inter, sans-serif'
  const nameFontSize = fontSize?.name || 32
  const titleFontSize = fontSize?.title || 16
  const contentFontSize = fontSize?.content || 14
  const smallFontSize = fontSize?.small || 12
  const sectionSpacing = spacing?.section || 40
  const itemSpacing = spacing?.item || 20
  const lineHeight = spacing?.line ? Math.max(1.5, spacing.line / contentFontSize) : 1.6
  const pagePadding = layout?.padding || 48

  // 渲染个人信息头部
  const renderHeader = () => (
    <div className="mb-12 pb-8 border-b" style={{ borderColor: `${colors.primary}20` }}>
      {/* 姓名 */}
      <h1 
        className="font-light tracking-tight mb-2"
        style={{ 
          fontSize: `${nameFontSize}px`,
          color: colors.text,
          fontFamily: fontFamilyStyle,
          letterSpacing: '-0.02em'
        }}
      >
        {personalInfo.name}
      </h1>
      
      {/* 职位 */}
      {personalInfo.title && (
        <div 
          className="font-normal mb-6"
          style={{ 
            fontSize: `${titleFontSize}px`,
            color: colors.primary,
            fontFamily: fontFamilyStyle
          }}
        >
          {personalInfo.title}
        </div>
      )}
      
      {/* 联系方式 - 极简横向排列 */}
      <div 
        className="flex flex-wrap gap-x-6 gap-y-2"
        style={{ 
          fontSize: `${smallFontSize}px`,
          color: colors.secondary
        }}
      >
        {personalInfo.email && (
          <div className="flex items-center gap-1.5">
            <Mail size={14} strokeWidth={1.5} />
            <span>{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={14} strokeWidth={1.5} />
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.5} />
            <span>{personalInfo.location}</span>
          </div>
        )}
        {personalInfo.website && (
          <div className="flex items-center gap-1.5">
            <Globe size={14} strokeWidth={1.5} />
            <span>{personalInfo.website}</span>
          </div>
        )}
      </div>
    </div>
  )

  // 渲染章节标题
  const renderSectionTitle = (title: string) => (
    <h2 
      className="font-medium tracking-wide mb-6 pb-2 border-b"
      style={{ 
        fontSize: `${titleFontSize}px`,
        color: colors.text,
        fontFamily: fontFamilyStyle,
        borderColor: `${colors.primary}15`,
        letterSpacing: '0.05em'
      }}
    >
      {title.toUpperCase()}
    </h2>
  )

  // 渲染工作经历
  const renderExperience = () => {
    if (!experience || experience.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.experience)}
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="relative pl-4 border-l-2" style={{ borderColor: `${colors.primary}20` }}>
              {/* 时间线圆点 */}
              <div 
                className="absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-[5px]"
                style={{ backgroundColor: colors.primary }}
              />
              
              {/* 公司和职位 */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div 
                    className="font-medium"
                    style={{ 
                      fontSize: `${contentFontSize}px`,
                      color: colors.text,
                      fontFamily: fontFamilyStyle
                    }}
                  >
                    {exp.position}
                  </div>
                  <div 
                    className="font-normal"
                    style={{ 
                      fontSize: `${smallFontSize}px`,
                      color: colors.secondary
                    }}
                  >
                    {exp.company}
                  </div>
                </div>
                <div 
                  className="flex items-center gap-1 text-right whitespace-nowrap"
                  style={{ 
                    fontSize: `${smallFontSize}px`,
                    color: colors.secondary
                  }}
                >
                  <Calendar size={12} strokeWidth={1.5} />
                  {formatDateStr(exp.startDate)} - {exp.current ? (locale === 'zh' ? '至今' : 'Present') : formatDateStr(exp.endDate)}
                </div>
              </div>
              
              {/* 描述 */}
              {exp.description && exp.description.length > 0 && (
                <ul className="space-y-1.5">
                  {exp.description.map((desc, i) => (
                    <li 
                      key={i}
                      className="text-gray-600 leading-relaxed"
                      style={{ 
                        fontSize: `${contentFontSize}px`,
                        lineHeight: lineHeight
                      }}
                    >
                      {desc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染教育经历
  const renderEducation = () => {
    if (!education || education.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.education)}
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <div 
                  className="font-medium"
                  style={{ 
                    fontSize: `${contentFontSize}px`,
                    color: colors.text
                  }}
                >
                  {edu.degree} - {edu.major}
                </div>
                <div 
                  style={{ 
                    fontSize: `${smallFontSize}px`,
                    color: colors.secondary
                  }}
                >
                  {edu.school}
                </div>
              </div>
              <div 
                className="text-right whitespace-nowrap"
                style={{ 
                  fontSize: `${smallFontSize}px`,
                  color: colors.secondary
                }}
              >
                {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染技能
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.skills)}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded-full border"
              style={{
                fontSize: `${smallFontSize}px`,
                color: colors.text,
                borderColor: `${colors.primary}30`,
                backgroundColor: `${colors.primary}05`
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // 渲染项目经历
  const renderProjects = () => {
    if (!projects || projects.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.projects)}
        <div className="space-y-5">
          {projects.map((project, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div 
                  className="font-medium"
                  style={{ 
                    fontSize: `${contentFontSize}px`,
                    color: colors.text
                  }}
                >
                  {project.name}
                </div>
                {project.date && (
                  <div 
                    style={{ 
                      fontSize: `${smallFontSize}px`,
                      color: colors.secondary
                    }}
                  >
                    {formatDateStr(project.date)}
                  </div>
                )}
              </div>
              {project.description && (
                <p 
                  className="text-gray-600"
                  style={{ 
                    fontSize: `${contentFontSize}px`,
                    lineHeight: lineHeight
                  }}
                >
                  {project.description}
                </p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        fontSize: `${smallFontSize - 1}px`,
                        color: colors.primary,
                        backgroundColor: `${colors.primary}10`
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
      </div>
    )
  }

  return (
    <div 
      className="bg-white"
      style={{ 
        padding: `${pagePadding}px`,
        fontFamily: fontFamilyStyle,
        color: colors.text
      }}
    >
      {renderHeader()}
      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
      {renderProjects()}
    </div>
  )
}

export default ModernMinimalist

