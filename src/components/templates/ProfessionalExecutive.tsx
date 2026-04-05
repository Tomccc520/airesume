/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 * 
 * @description Professional Executive 模板 - 高管专业风格
 * 特点：严谨专业、商务气质、层次分明、适合高管和资深职位
 */

'use client'
/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { Mail, Phone, MapPin, Globe, Building2, Award, Target } from 'lucide-react'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * Professional Executive 模板
 * 高管专业风格，适合管理层、高级职位申请
 */
export const ProfessionalExecutive: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)
  
  // 样式配置
  const fontFamilyStyle = fontFamily || 'Inter, sans-serif'
  const nameFontSize = fontSize?.name || 30
  const titleFontSize = fontSize?.title || 17
  const contentFontSize = fontSize?.content || 14
  const smallFontSize = fontSize?.small || 12
  const sectionSpacing = spacing?.section || 36
  const lineHeight = spacing?.line ? Math.max(1.5, spacing.line / contentFontSize) : 1.6
  const pagePadding = layout?.padding || 44

  // 渲染专业头部
  const renderHeader = () => (
    <div className="mb-10 pb-6 border-b-2" style={{ borderColor: colors.primary }}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* 姓名 */}
          <h1 
            className="font-bold tracking-tight mb-2"
            style={{ 
              fontSize: `${nameFontSize}px`,
              color: colors.text,
              fontFamily: fontFamilyStyle,
              letterSpacing: '-0.01em'
            }}
          >
            {personalInfo.name}
          </h1>
          
          {/* 职位 */}
          {personalInfo.title && (
            <div 
              className="font-semibold mb-4"
              style={{ 
                fontSize: `${titleFontSize}px`,
                color: colors.primary,
                fontFamily: fontFamilyStyle
              }}
            >
              {personalInfo.title}
            </div>
          )}
        </div>
        
        {/* 头像区域（如果有） */}
        {personalInfo.avatar && (
          <div 
            className="w-24 h-24 rounded-lg overflow-hidden border-2 ml-6"
            style={{ borderColor: colors.primary }}
          >
            <img 
              src={personalInfo.avatar} 
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* 联系方式 - 专业网格布局 */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
        {personalInfo.email && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Mail size={14} style={{ color: colors.primary }} />
            </div>
            <span 
              className="text-sm truncate"
              style={{ color: colors.text }}
            >
              {personalInfo.email}
            </span>
          </div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Phone size={14} style={{ color: colors.primary }} />
            </div>
            <span 
              className="text-sm"
              style={{ color: colors.text }}
            >
              {personalInfo.phone}
            </span>
          </div>
        )}
        {personalInfo.location && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <MapPin size={14} style={{ color: colors.primary }} />
            </div>
            <span 
              className="text-sm"
              style={{ color: colors.text }}
            >
              {personalInfo.location}
            </span>
          </div>
        )}
        {personalInfo.website && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Globe size={14} style={{ color: colors.primary }} />
            </div>
            <span 
              className="text-sm truncate"
              style={{ color: colors.text }}
            >
              {personalInfo.website}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  // 渲染专业章节标题
  const renderSectionTitle = (title: string) => (
    <div className="mb-5">
      <h2 
        className="font-bold tracking-wide inline-block pb-2 border-b-2"
        style={{ 
          fontSize: `${titleFontSize}px`,
          color: colors.text,
          fontFamily: fontFamilyStyle,
          borderColor: colors.primary,
          letterSpacing: '0.02em'
        }}
      >
        {title.toUpperCase()}
      </h2>
    </div>
  )

  // 渲染工作经历
  const renderExperience = () => {
    if (!experience || experience.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.experience)}
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="relative">
              {/* 左侧时间线 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div 
                    className="w-3 h-3 rounded-full border-2"
                    style={{ 
                      borderColor: colors.primary,
                      backgroundColor: 'white'
                    }}
                  />
                  {index < experience.length - 1 && (
                    <div 
                      className="w-0.5 flex-1 mt-1"
                      style={{ backgroundColor: `${colors.primary}30` }}
                    />
                  )}
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div 
                        className="font-bold mb-1"
                        style={{ 
                          fontSize: `${contentFontSize + 1}px`,
                          color: colors.text
                        }}
                      >
                        {exp.position}
                      </div>
                      <div 
                        className="font-semibold flex items-center gap-2"
                        style={{ 
                          fontSize: `${contentFontSize}px`,
                          color: colors.primary
                        }}
                      >
                        <Building2 size={14} />
                        {exp.company}
                      </div>
                    </div>
                    <div 
                      className="text-right whitespace-nowrap ml-4 px-3 py-1 rounded"
                      style={{ 
                        fontSize: `${smallFontSize}px`,
                        color: colors.secondary,
                        backgroundColor: `${colors.primary}10`
                      }}
                    >
                      {formatDateStr(exp.startDate)} - {exp.current ? (locale === 'zh' ? '至今' : 'Present') : formatDateStr(exp.endDate)}
                    </div>
                  </div>
                  
                  {exp.location && (
                    <div 
                      className="text-sm mb-2"
                      style={{ color: colors.secondary }}
                    >
                      {exp.location}
                    </div>
                  )}
                  
                  {exp.description && exp.description.length > 0 && (
                    <ul className="space-y-1.5 mt-3">
                      {exp.description.map((desc, i) => (
                        <li 
                          key={i}
                          className="flex items-start gap-2"
                          style={{ 
                            fontSize: `${contentFontSize}px`,
                            lineHeight: lineHeight,
                            color: colors.text
                          }}
                        >
                          <span 
                            className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
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
            <div 
              key={index}
              className="flex justify-between items-start p-4 rounded-lg"
              style={{ backgroundColor: `${colors.primary}08` }}
            >
              <div>
                <div 
                  className="font-bold mb-1"
                  style={{ 
                    fontSize: `${contentFontSize + 1}px`,
                    color: colors.text
                  }}
                >
                  {edu.degree}
                </div>
                <div 
                  className="font-semibold mb-1"
                  style={{ 
                    fontSize: `${contentFontSize}px`,
                    color: colors.primary
                  }}
                >
                  {edu.major}
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

  // 渲染技能 - 专业分类
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.skills)}
        <div className="grid grid-cols-3 gap-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: `${colors.primary}10`,
                borderLeft: `3px solid ${colors.primary}`
              }}
            >
              <Award size={14} style={{ color: colors.primary }} />
              <span
                className="font-medium"
                style={{
                  fontSize: `${smallFontSize}px`,
                  color: colors.text
                }}
              >
                {skill.name}
              </span>
            </div>
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
            <div 
              key={index}
              className="p-4 rounded-lg border-l-4"
              style={{ 
                backgroundColor: `${colors.primary}05`,
                borderColor: colors.primary
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Target size={16} style={{ color: colors.primary }} />
                  <div 
                    className="font-bold"
                    style={{ 
                      fontSize: `${contentFontSize + 1}px`,
                      color: colors.text
                    }}
                  >
                    {project.name}
                  </div>
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
                  className="mb-3"
                  style={{ 
                    fontSize: `${contentFontSize}px`,
                    lineHeight: lineHeight,
                    color: colors.text
                  }}
                >
                  {project.description}
                </p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary
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

export default ProfessionalExecutive
