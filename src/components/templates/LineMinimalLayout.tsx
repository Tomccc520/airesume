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
 * 极简线条布局 - 线条美学
 * 细线条装饰，极简美学
 */
export const LineMinimalLayout: React.FC<TemplateProps> = ({
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
  const lineColor = '#e5e5e5'

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
      {/* 个人信息 */}
      <div 
        className="cursor-pointer flex items-center gap-5"
        onClick={() => onSectionClick?.('personal')}
        style={{ 
          marginBottom: `${spacing?.section || 32}px`,
          paddingBottom: `${spacing?.section || 32}px`,
          borderBottom: `1px solid ${lineColor}`
        }}
      >
        {personalInfo.avatar && (
          <img 
            src={personalInfo.avatar} 
            alt={personalInfo.name}
            className={getAvatarClassName(styleConfig, 'w-24 h-24')}
            style={{
              ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 96),
              border: `2px solid ${lineColor}`
            }}
          />
        )}
        <div className="flex-1">
          <h1 
            className="font-bold mb-2"
            style={{ 
              fontSize: `${fontSize?.name || 28}px`,
              color: colors.primary || '#000000',
              letterSpacing: '0.5px'
            }}
          >
            {personalInfo.name}
          </h1>
          <div 
            className="font-medium mb-3"
            style={{ 
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.secondary || '#666666'
            }}
          >
            {personalInfo.title}
          </div>
          <div 
            className="flex flex-wrap gap-4 text-sm"
            style={{ color: colors.secondary || '#666666' }}
          >
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>
      </div>

      {/* 个人简介 */}
      {personalInfo.summary && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
          style={{ 
            marginBottom: `${spacing?.section || 28}px`,
            paddingLeft: '20px',
            borderLeft: `3px solid ${colors.accent || '#333333'}`
          }}
        >
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
          style={{ marginBottom: `${spacing?.section || 28}px` }}
        >
          <h2 
            className="font-bold mb-4 pb-2 flex items-center gap-3"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000',
              borderBottom: `1px solid ${lineColor}`
            }}
          >
            <span 
              className="w-1 h-6"
              style={{ backgroundColor: colors.accent || '#333333' }}
            />
            {t.editor.experience.title}
          </h2>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      className="font-semibold"
                      style={{ 
                        fontSize: `${fontSize?.title || 16}px`,
                        color: colors.primary || '#000000'
                      }}
                    >
                      {exp.position}
                    </h3>
                    <div style={{ color: colors.secondary || '#666666' }}>
                      {exp.company}
                    </div>
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: colors.secondary || '#666666' }}
                  >
                    {formatDateStr(exp.startDate)} - {exp.current ? t.editor.templatePreview.present : formatDateStr(exp.endDate)}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {exp.description.map((desc, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span style={{ color: colors.accent }}>—</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教育经历 */}
      {education && education.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${spacing?.section || 28}px` }}
        >
          <h2 
            className="font-bold mb-4 pb-2 flex items-center gap-3"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000',
              borderBottom: `1px solid ${lineColor}`
            }}
          >
            <span 
              className="w-1 h-6"
              style={{ backgroundColor: colors.accent || '#333333' }}
            />
            {t.editor.education.title}
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 
                    className="font-semibold"
                    style={{ 
                      fontSize: `${fontSize?.title || 16}px`,
                      color: colors.primary || '#000000'
                    }}
                  >
                    {edu.school}
                  </h3>
                  <div style={{ color: colors.secondary || '#666666' }}>
                    {edu.degree} · {edu.major}
                  </div>
                </div>
                <div 
                  className="text-sm"
                  style={{ color: colors.secondary || '#666666' }}
                >
                  {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
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
            className="font-bold mb-4 pb-2 flex items-center gap-3"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000',
              borderBottom: `1px solid ${lineColor}`
            }}
          >
            <span 
              className="w-1 h-6"
              style={{ backgroundColor: colors.accent || '#333333' }}
            />
            {t.editor.skills.title}
          </h2>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span 
                    className="text-sm"
                    style={{ color: colors.secondary || '#666666' }}
                  >
                    {skill.level}%
                  </span>
                </div>
                <div 
                  className="h-1 rounded-full"
                  style={{ backgroundColor: lineColor }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${skill.level}%`,
                      backgroundColor: colors.accent || '#333333'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

