/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 * 
 * @description Creative Designer 模板 - 创意设计师风格
 * 特点：大胆配色、创意布局、视觉冲击力强、适合设计师和创意岗位
 */

'use client'

import React from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Code, Award } from 'lucide-react'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * Creative Designer 模板
 * 创意设计师风格，适合设计、创意、艺术类岗位
 */
export const CreativeDesigner: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick: _onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, layout, skills: _skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)
  
  // 样式配置
  const fontFamilyStyle = fontFamily || 'Inter, sans-serif'
  const nameFontSize = fontSize?.name || 36
  const titleFontSize = fontSize?.title || 18
  const contentFontSize = fontSize?.content || 14
  const sectionSpacing = spacing?.section || 32
  const lineHeight = spacing?.line ? Math.max(1.5, spacing.line / contentFontSize) : 1.6
  const pagePadding = layout?.padding || 40

  // 渲染创意头部
  const renderHeader = () => (
    <div className="relative mb-10">
      {/* 背景装饰 */}
      <div 
        className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: colors.primary }}
      />
      <div 
        className="absolute top-10 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: colors.accent }}
      />
      
      <div className="relative z-10">
        {/* 姓名 - 大胆设计 */}
        <h1 
          className="font-bold tracking-tight mb-3"
          style={{ 
            fontSize: `${nameFontSize}px`,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: fontFamilyStyle
          }}
        >
          {personalInfo.name}
        </h1>
        
        {/* 职位 - 带装饰线 */}
        {personalInfo.title && (
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="font-semibold"
              style={{ 
                fontSize: `${titleFontSize}px`,
                color: colors.text,
                fontFamily: fontFamilyStyle
              }}
            >
              {personalInfo.title}
            </div>
          </div>
        )}
        
        {/* 联系方式 - 卡片式 */}
        <div className="grid grid-cols-2 gap-3">
          {personalInfo.email && (
            <div 
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderLeft: `3px solid ${colors.primary}`
              }}
            >
              <Mail size={16} style={{ color: colors.primary }} />
              <span 
                className="text-sm truncate"
                style={{ color: colors.text }}
              >
                {personalInfo.email}
              </span>
            </div>
          )}
          {personalInfo.phone && (
            <div 
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderLeft: `3px solid ${colors.primary}`
              }}
            >
              <Phone size={16} style={{ color: colors.primary }} />
              <span 
                className="text-sm"
                style={{ color: colors.text }}
              >
                {personalInfo.phone}
              </span>
            </div>
          )}
          {personalInfo.location && (
            <div 
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderLeft: `3px solid ${colors.primary}`
              }}
            >
              <MapPin size={16} style={{ color: colors.primary }} />
              <span 
                className="text-sm"
                style={{ color: colors.text }}
              >
                {personalInfo.location}
              </span>
            </div>
          )}
          {personalInfo.website && (
            <div 
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderLeft: `3px solid ${colors.primary}`
              }}
            >
              <Globe size={16} style={{ color: colors.primary }} />
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
    </div>
  )

  // 渲染创意章节标题
  const renderSectionTitle = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-3 mb-6">
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-xl"
        style={{ 
          backgroundColor: colors.primary,
          color: 'white'
        }}
      >
        {icon}
      </div>
      <h2 
        className="font-bold"
        style={{ 
          fontSize: `${titleFontSize + 2}px`,
          color: colors.text,
          fontFamily: fontFamilyStyle
        }}
      >
        {title}
      </h2>
      <div 
        className="flex-1 h-0.5 rounded-full"
        style={{ backgroundColor: `${colors.primary}20` }}
      />
    </div>
  )

  // 渲染工作经历
  const renderExperience = () => {
    if (!experience || experience.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.experience, <Briefcase size={20} />)}
        <div className="space-y-5">
          {experience.map((exp, index) => (
            <div 
              key={index}
              className="relative p-5 rounded-2xl"
              style={{ 
                backgroundColor: `${colors.primary}05`,
                borderLeft: `4px solid ${colors.primary}`
              }}
            >
              {/* 序号装饰 */}
              <div 
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: colors.primary }}
              >
                {index + 1}
              </div>
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div 
                    className="font-bold mb-1"
                    style={{ 
                      fontSize: `${contentFontSize + 2}px`,
                      color: colors.text
                    }}
                  >
                    {exp.position}
                  </div>
                  <div 
                    className="font-medium"
                    style={{ 
                      fontSize: `${contentFontSize}px`,
                      color: colors.primary
                    }}
                  >
                    {exp.company}
                  </div>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                >
                  {formatDateStr(exp.startDate)} - {exp.current ? (locale === 'zh' ? '至今' : 'Present') : formatDateStr(exp.endDate)}
                </div>
              </div>
              
              {exp.description && exp.description.length > 0 && (
                <ul className="space-y-2">
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
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <span>{desc}</span>
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
        {renderSectionTitle(t.preview.education, <GraduationCap size={20} />)}
        <div className="grid grid-cols-1 gap-4">
          {education.map((edu, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl"
              style={{ 
                backgroundColor: `${colors.accent}10`,
                border: `2px solid ${colors.accent}30`
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div 
                    className="font-bold"
                    style={{ 
                      fontSize: `${contentFontSize + 1}px`,
                      color: colors.text
                    }}
                  >
                    {edu.degree} - {edu.major}
                  </div>
                  <div 
                    className="font-medium mt-1"
                    style={{ 
                      fontSize: `${contentFontSize}px`,
                      color: colors.secondary
                    }}
                  >
                    {edu.school}
                  </div>
                </div>
                <div 
                  className="text-sm font-medium"
                  style={{ color: colors.secondary }}
                >
                  {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染技能 - 创意标签云
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null

    return (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {renderSectionTitle(t.preview.skills, <Award size={20} />)}
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full font-medium shadow-sm"
              style={{
                fontSize: `${contentFontSize}px`,
                background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`,
                color: colors.text,
                border: `2px solid ${colors.primary}40`
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
        {renderSectionTitle(t.preview.projects, <Code size={20} />)}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="p-5 rounded-xl"
              style={{ 
                backgroundColor: 'white',
                border: `2px solid ${colors.primary}20`,
                boxShadow: `0 4px 12px ${colors.primary}10`
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div 
                  className="font-bold"
                  style={{ 
                    fontSize: `${contentFontSize + 2}px`,
                    color: colors.primary
                  }}
                >
                  {project.name}
                </div>
                {project.date && (
                  <div 
                    className="text-sm"
                    style={{ color: colors.secondary }}
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
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: colors.primary,
                        color: 'white'
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
      className="bg-white relative overflow-hidden"
      style={{ 
        padding: `${pagePadding}px`,
        fontFamily: fontFamilyStyle,
        color: colors.text
      }}
    >
      {/* 背景装饰元素 */}
      <div 
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ backgroundColor: colors.accent }}
      />
      
      <div className="relative z-10">
        {renderHeader()}
        {renderExperience()}
        {renderEducation()}
        {renderSkills()}
        {renderProjects()}
      </div>
    </div>
  )
}

export default CreativeDesigner
