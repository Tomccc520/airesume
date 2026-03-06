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
 * 时间轴布局 - 职业发展清晰
 * 垂直时间线展示工作经历
 */
export const TimelineLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

  const fontFamilyStyle = fontFamily || 'Inter, -apple-system, sans-serif'
  const pagePadding = styleConfig.layout?.padding || 40
  const timelineBg = '#e9ecef'
  const timelineDotColor = '#495057'

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
      {/* 个人信息 - 优化版 */}
      <div 
        className="flex items-center gap-5 cursor-pointer"
        onClick={() => onSectionClick?.('personal')}
        style={{ 
          marginBottom: `${spacing?.section || 36}px`,
          paddingBottom: `${spacing?.section || 36}px`,
          borderBottom: `2px solid ${timelineBg}`
        }}
      >
        {personalInfo.avatar && (
          <img 
            src={personalInfo.avatar} 
            alt={personalInfo.name}
            className={getAvatarClassName(styleConfig, 'w-24 h-24')}
            style={{
              ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 96),
              border: `3px solid ${timelineBg}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        )}
        <div className="flex-1">
          <h1 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.name || 32}px`,
              color: colors.primary || '#000000',
              marginBottom: '6px',
              letterSpacing: '-0.5px'
            }}
          >
            {personalInfo.name}
          </h1>
          <div 
            className="font-medium"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
              color: colors.secondary || '#666666',
              marginBottom: '10px'
            }}
          >
            {personalInfo.title}
          </div>
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
      </div>

      {/* 个人简介 */}
      {personalInfo.summary && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
          style={{ marginBottom: `${spacing?.section || 32}px` }}
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.templatePreview.personalSummary}
          </h2>
          <p style={{ color: colors.text || '#000000', lineHeight: 1.6 }}>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* 工作经历 - 时间轴 */}
      {experience && experience.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${spacing?.section || 32}px` }}
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 16}px`
            }}
          >
            {t.editor.experience.title}
          </h2>
          <div className="relative pl-8">
            {/* 时间线 */}
            <div 
              className="absolute left-3 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: timelineBg }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 24}px` }}>
              {experience.map((exp, index) => (
                <div key={exp.id} className="relative">
                  {/* 时间点 */}
                  <div 
                    className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 bg-white"
                    style={{ borderColor: colors.accent || '#999999' }}
                  />
                  
                  {/* 时间 */}
                  <div 
                    className="font-medium mb-2"
                    style={{ 
                      fontSize: `${fontSize?.small || 12}px`,
                      color: colors.secondary || '#666666'
                    }}
                  >
                    {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                  </div>
                  
                  {/* 内容 */}
                  <div>
                    <h3 
                      className="font-bold"
                      style={{ 
                        fontSize: `${fontSize?.content || 15}px`,
                        color: colors.text || '#000000',
                        marginBottom: '4px'
                      }}
                    >
                      {exp.position}
                    </h3>
                    <div 
                      className="font-medium mb-2"
                      style={{ color: colors.accent || '#999999' }}
                    >
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.description.map((desc, i) => (
                          <li 
                            key={i}
                            style={{ 
                              color: colors.text || '#000000',
                              fontSize: `${fontSize?.small || 13}px`
                            }}
                          >
                            {desc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 项目经历 */}
      {projects && projects.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('projects')}
          style={{ marginBottom: `${spacing?.section || 32}px` }}
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 16}px`
            }}
          >
            {t.editor.projects.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 16}px` }}>
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline mb-2">
                  <h3 
                    className="font-bold"
                    style={{ 
                      fontSize: `${fontSize?.content || 15}px`,
                      color: colors.text || '#000000'
                    }}
                  >
                    {project.name}
                  </h3>
                  <span 
                    style={{ 
                      fontSize: `${fontSize?.small || 12}px`,
                      color: colors.secondary || '#666666'
                    }}
                  >
                    {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                  </span>
                </div>
                <p 
                  style={{ 
                    color: colors.text || '#000000',
                    marginBottom: '8px'
                  }}
                >
                  {project.description}
                </p>
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {project.highlights.map((h, i) => (
                      <li 
                        key={i}
                        style={{ 
                          color: colors.text || '#000000',
                          fontSize: `${fontSize?.small || 13}px`
                        }}
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
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
          style={{ marginBottom: `${spacing?.section || 32}px` }}
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
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

      {/* 技能 */}
      {skills && skills.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('skills')}
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: `${fontSize?.title || 18}px`,
              color: colors.primary || '#000000',
              marginBottom: `${spacing?.item || 12}px`
            }}
          >
            {t.editor.skills.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span 
                key={skill.id}
                className="px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${colors.accent || '#999999'}20`,
                  color: colors.text || '#000000',
                  fontSize: `${fontSize?.small || 13}px`
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

