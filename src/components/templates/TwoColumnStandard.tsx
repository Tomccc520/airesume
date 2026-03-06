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

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 标准双栏布局 - 左侧灰色信息栏
 * 左侧32%灰色背景，右侧68%白色内容区
 */
export const TwoColumnStandard: React.FC<TemplateProps> = ({
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
  const sidebarBg = '#f5f5f5'
  const sidebarWidth = '32%'
  const mainWidth = '68%'

  return (
    <div className="flex w-full min-h-full bg-white" style={{ fontFamily: fontFamilyStyle }}>
      {/* 左侧信息栏 */}
      <div 
        className="flex flex-col gap-6"
        style={{ 
          width: sidebarWidth,
          backgroundColor: sidebarBg,
          padding: `${pagePadding}px`,
          color: colors.text || '#000000'
        }}
      >
        {/* 头像与基本信息 */}
        <div 
          className="flex flex-col items-center text-center gap-4 cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
        >
          {personalInfo.avatar && (
            <img 
              src={personalInfo.avatar} 
              alt={personalInfo.name}
              className="w-28 h-28 rounded-full object-cover"
            />
          )}
          <div>
            <h1 
              className="font-bold"
              style={{ fontSize: `${fontSize?.name || 24}px`, color: colors.primary || '#000000' }}
            >
              {personalInfo.name}
            </h1>
            <p 
              className="font-medium mt-1"
              style={{ fontSize: `${fontSize?.title || 16}px`, color: colors.secondary || '#666666' }}
            >
              {personalInfo.title}
            </p>
          </div>
        </div>

        {/* 联系方式 */}
        <div style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
          <div className="space-y-2">
            {personalInfo.phone && (
              <div>
                <div className="font-bold text-black mb-1">电话</div>
                <div>{personalInfo.phone}</div>
              </div>
            )}
            {personalInfo.email && (
              <div>
                <div className="font-bold text-black mb-1">邮箱</div>
                <div className="break-all">{personalInfo.email}</div>
              </div>
            )}
            {personalInfo.location && (
              <div>
                <div className="font-bold text-black mb-1">地址</div>
                <div>{personalInfo.location}</div>
              </div>
            )}
          </div>
        </div>

        {/* 技能 */}
        {skills && skills.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
            <h3 
              className="font-bold mb-3 pb-2 border-b"
              style={{ 
                fontSize: `${fontSize?.content || 14}px`,
                color: colors.primary || '#000000',
                borderColor: colors.secondary || '#cccccc'
              }}
            >
              {t.editor.skills.title}
            </h3>
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.id} style={{ fontSize: `${fontSize?.small || 12}px` }}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span style={{ color: colors.secondary || '#666666' }}>{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${skill.level}%`,
                        backgroundColor: colors.accent || '#999999'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 教育背景 */}
        {education && education.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('education')}>
            <h3 
              className="font-bold mb-3 pb-2 border-b"
              style={{ 
                fontSize: `${fontSize?.content || 14}px`,
                color: colors.primary || '#000000',
                borderColor: colors.secondary || '#cccccc'
              }}
            >
              {t.editor.education.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {education.map(edu => (
                <div key={edu.id} style={{ fontSize: `${fontSize?.small || 12}px` }}>
                  <div className="font-bold text-black">{edu.school}</div>
                  <div style={{ color: colors.secondary || '#666666' }}>{edu.major}</div>
                  <div style={{ color: colors.secondary || '#666666', fontSize: `${fontSize?.small - 2 || 10}px` }}>
                    {edu.degree} | {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧主内容 */}
      <div 
        className="flex flex-col"
        style={{ 
          width: mainWidth,
          color: colors.text || '#000000',
          padding: `${pagePadding}px`,
          gap: `${spacing?.section || 24}px`
        }}
      >
        {/* 个人简介 */}
        {personalInfo.summary && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
            <h2 
              className="font-bold mb-3 border-l-4 pl-3"
              style={{ 
                color: colors.primary || '#000000',
                borderColor: colors.accent || '#999999',
                fontSize: `${fontSize?.title || 18}px`
              }}
            >
              {t.editor.templatePreview.personalSummary}
            </h2>
            <p style={{ fontSize: `${fontSize?.content || 14}px`, lineHeight: 1.6 }}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* 工作经历 */}
        {experience && experience.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('experience')}>
            <h2 
              className="font-bold mb-4 border-l-4 pl-3"
              style={{ 
                color: colors.primary || '#000000',
                borderColor: colors.accent || '#999999',
                fontSize: `${fontSize?.title || 18}px`
              }}
            >
              {t.editor.experience.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 16}px` }}>
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex flex-col gap-1 mb-2">
                    <h3 
                      className="font-bold"
                      style={{ fontSize: `${fontSize?.content || 14}px` }}
                    >
                      {exp.position}
                    </h3>
                    <div 
                      className="flex justify-between items-center"
                      style={{ fontSize: `${fontSize?.small || 12}px` }}
                    >
                      <span className="font-semibold" style={{ color: colors.accent || '#999999' }}>
                        {exp.company}
                      </span>
                      <span style={{ color: colors.secondary || '#666666' }}>
                        {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1">
                      {exp.description.map((desc, i) => (
                        <li 
                          key={i}
                          style={{ fontSize: `${fontSize?.small || 12}px`, lineHeight: 1.5 }}
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
        )}

        {/* 项目经历 */}
        {projects && projects.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('projects')}>
            <h2 
              className="font-bold mb-4 border-l-4 pl-3"
              style={{ 
                color: colors.primary || '#000000',
                borderColor: colors.accent || '#999999',
                fontSize: `${fontSize?.title || 18}px`
              }}
            >
              {t.editor.projects.title}
            </h2>
            <div className="grid gap-4">
              {projects.map(project => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-bold"
                      style={{ fontSize: `${fontSize?.content || 14}px` }}
                    >
                      {project.name}
                    </h3>
                    <span 
                      style={{ 
                        fontSize: `${fontSize?.small - 2 || 10}px`,
                        color: colors.secondary || '#666666'
                      }}
                    >
                      {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                    </span>
                  </div>
                  <p style={{ fontSize: `${fontSize?.small || 12}px`, marginBottom: '8px' }}>
                    {project.description}
                  </p>
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1">
                      {project.highlights.map((h, i) => (
                        <li 
                          key={i}
                          style={{ fontSize: `${fontSize?.small - 1 || 11}px`, lineHeight: 1.5 }}
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
      </div>
    </div>
  )
}

