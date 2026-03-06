/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.2.2
 */

'use client'

import React from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { getAvatarClassName, getAvatarInlineStyle } from '@/utils/avatarUtils'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 极简文本布局 - ATS友好
 * 纯文字排版，无装饰，适合投递大公司
 */
export const MinimalTextLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

  // 字体样式
  const fontFamilyStyle = fontFamily || '"Times New Roman", Georgia, serif'
  
  // 页面内边距
  const pagePadding = styleConfig.layout?.padding || 40

  return (
    <div 
      className="w-full min-h-full bg-white"
      style={{ 
        fontFamily: fontFamilyStyle,
        color: colors.text || '#000000',
        padding: `${pagePadding}px`,
        fontSize: `${fontSize?.content || 14}px`,
        lineHeight: 1.6
      }}
    >
      {/* 个人信息 - 居中优化版 */}
      <div 
        className="flex flex-col items-center text-center cursor-pointer"
        onClick={() => onSectionClick?.('personal')}
        style={{ 
          marginBottom: `${spacing?.section || 28}px`,
          paddingBottom: `${spacing?.section || 28}px`,
          borderBottom: '1px solid #e5e5e5'
        }}
      >
        {/* 头像 */}
        {personalInfo.avatar && (
          <img 
            src={personalInfo.avatar} 
            alt={personalInfo.name}
            className={`${getAvatarClassName(styleConfig, 'w-28 h-28')} mb-4`}
            style={{
              ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 112),
              border: '3px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
        )}
        
        {/* 姓名 */}
        <h1 
          className="font-bold"
          style={{ 
            fontSize: `${fontSize?.name || 28}px`,
            color: colors.primary || '#000000',
            marginBottom: '6px',
            letterSpacing: '0.5px'
          }}
        >
          {personalInfo.name}
        </h1>
        
        {/* 职位 */}
        <div 
          style={{ 
            fontSize: `${fontSize?.title || 16}px`,
            color: colors.secondary || '#666666',
            marginBottom: '8px'
          }}
        >
          {personalInfo.title}
        </div>
        
        {/* 联系方式 */}
        <div 
          style={{ 
            fontSize: `${fontSize?.small || 12}px`,
            color: colors.secondary || '#666666'
          }}
        >
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span> | </span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.location && <span> | {personalInfo.location}</span>}
        </div>
      </div>

      {/* 个人简介 */}
      {personalInfo.summary && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold uppercase"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.templatePreview.personalSummary}
          </h2>
          <p style={{ color: colors.text || '#000000' }}>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* 工作经历 */}
      {experience && experience.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold uppercase"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.experience.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {exp.position}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                  </span>
                </div>
                <div style={{ color: colors.secondary || '#666666', marginTop: '4px' }}>
                  {exp.company}
                  {exp.location && ` | ${exp.location}`}
                </div>
                {exp.description && exp.description.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {exp.description.map((desc, i) => (
                      <div key={i} style={{ marginBottom: '4px', color: colors.text || '#000000' }}>
                        {desc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教育背景 */}
      {education && education.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold uppercase"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.education.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {edu.school}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </span>
                </div>
                <div style={{ color: colors.secondary || '#666666', marginTop: '4px' }}>
                  {edu.degree} | {edu.major}
                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 项目经历 */}
      {projects && projects.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('projects')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold uppercase"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.projects.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {project.name}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                  </span>
                </div>
                <p style={{ color: colors.text || '#000000', marginTop: '4px' }}>
                  {project.description}
                </p>
                {project.highlights && project.highlights.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {project.highlights.map((h, i) => (
                      <div key={i} style={{ marginBottom: '4px', color: colors.text || '#000000' }}>
                        {h}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技能 */}
      {skills && skills.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('skills')}
        >
          <h2 
            className="font-bold uppercase"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.skills.title}
          </h2>
          <div style={{ color: colors.text || '#000000' }}>
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

