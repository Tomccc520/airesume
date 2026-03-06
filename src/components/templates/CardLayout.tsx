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
 * 创意卡片布局 - 视觉突出
 * 卡片式设计，模块化布局
 */
export const CardLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

  const fontFamilyStyle = fontFamily || 'Inter, -apple-system, sans-serif'
  const pagePadding = styleConfig.layout?.padding || 32
  const lineHeight = styleConfig.spacing?.line || 1.6
  
  // 优化配色方案 - 更柔和的渐变背景
  const cardBg = `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`
  const cardBorder = `${colors.primary}15`
  const cardShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'

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
      {/* 个人信息卡片 - 优化设计 */}
      <div 
        className="cursor-pointer p-6 rounded-2xl mb-6 transition-all hover:shadow-lg"
        onClick={() => onSectionClick?.('personal')}
        style={{ 
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          marginBottom: `${spacing?.section || 24}px`,
          boxShadow: cardShadow
        }}
      >
        <div className="flex items-center gap-5">
          {personalInfo.avatar && (
            <img 
              src={personalInfo.avatar} 
              alt={personalInfo.name}
              className={getAvatarClassName(styleConfig, 'w-20 h-20')}
              style={{
                ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 80),
                border: `3px solid ${colors.primary}20`,
                boxShadow: `0 4px 12px ${colors.primary}15`
              }}
            />
          )}
          <div className="flex-1">
            <h1 
              className="font-bold mb-2"
              style={{ 
                fontSize: `${fontSize?.name || 28}px`,
                color: colors.primary || '#000000',
                letterSpacing: '-0.02em'
              }}
            >
              {personalInfo.name}
            </h1>
            <div 
              className="font-semibold mb-3 px-3 py-1 rounded-lg inline-block"
              style={{ 
                fontSize: `${fontSize?.title || 16}px`,
                color: colors.primary || '#666666',
                background: `${colors.primary}10`
              }}
            >
              {personalInfo.title}
            </div>
            <div 
              className="flex flex-wrap gap-4 text-sm"
              style={{ color: colors.secondary || '#666666', lineHeight }}
            >
              {personalInfo.email && <span>📧 {personalInfo.email}</span>}
              {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
              {personalInfo.location && <span>📍 {personalInfo.location}</span>}
            </div>
          </div>
        </div>
        {personalInfo.summary && (
          <p className="mt-4 leading-relaxed" style={{ color: colors.text || '#000000', lineHeight }}>
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* 工作经历卡片 - 优化设计 */}
      {experience && experience.length > 0 && (
        <div 
          className="cursor-pointer mb-6"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold mb-4 flex items-center gap-2"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000'
            }}
          >
            <span className="w-1 h-6 rounded-full" style={{ background: colors.primary }}></span>
            {t.editor.experience.title}
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div 
                key={exp.id}
                className="p-5 rounded-2xl transition-all hover:shadow-lg"
                style={{ 
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 
                      className="font-bold mb-1"
                      style={{ 
                        fontSize: `${fontSize?.title || 16}px`,
                        color: colors.primary || '#000000'
                      }}
                    >
                      {exp.position}
                    </h3>
                    <div 
                      className="font-semibold text-sm"
                      style={{ color: colors.secondary || '#666666' }}
                    >
                      {exp.company}
                    </div>
                  </div>
                  <div 
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ 
                      color: colors.primary,
                      background: `${colors.primary}10`
                    }}
                  >
                    {formatDateStr(exp.startDate)} - {exp.current ? t.editor.templatePreview.present : formatDateStr(exp.endDate)}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="mt-3 space-y-2" style={{ lineHeight }}>
                    {exp.description.map((desc, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: colors.primary }}></span>
                        <span className="flex-1">{desc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教育经历卡片 - 优化设计 */}
      {education && education.length > 0 && (
        <div 
          className="cursor-pointer mb-6"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <h2 
            className="font-bold mb-4 flex items-center gap-2"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000'
            }}
          >
            <span className="w-1 h-6 rounded-full" style={{ background: colors.primary }}></span>
            {t.editor.education.title}
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div 
                key={edu.id}
                className="p-5 rounded-2xl transition-all hover:shadow-lg"
                style={{ 
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 
                      className="font-bold mb-1"
                      style={{ 
                        fontSize: `${fontSize?.title || 16}px`,
                        color: colors.primary || '#000000'
                      }}
                    >
                      {edu.school}
                    </h3>
                    <div className="text-sm" style={{ color: colors.secondary || '#666666' }}>
                      {edu.degree} · {edu.major}
                    </div>
                  </div>
                  <div 
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ 
                      color: colors.primary,
                      background: `${colors.primary}10`
                    }}
                  >
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技能卡片 - 优化设计 */}
      {skills && skills.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('skills')}
        >
          <h2 
            className="font-bold mb-4 flex items-center gap-2"
            style={{ 
              fontSize: `${fontSize?.section || 18}px`,
              color: colors.primary || '#000000'
            }}
          >
            <span className="w-1 h-6 rounded-full" style={{ background: colors.primary }}></span>
            {t.editor.skills.title}
          </h2>
          <div 
            className="p-5 rounded-2xl transition-all hover:shadow-lg"
            style={{ 
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow
            }}
          >
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill.id}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                  style={{ 
                    background: `${colors.primary}10`,
                    border: `1px solid ${colors.primary}20`,
                    color: colors.primary || '#000000'
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

