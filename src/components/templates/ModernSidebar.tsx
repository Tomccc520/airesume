'use client'
/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { MapPin, Mail, Phone, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { createContactQRCodeImageUrl, resolveContactQRCodePayload } from '@/utils/contactQRCode'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 现代侧边栏模板
 * 深色侧边栏 + 白色内容区，专业现代感
 */
export const ModernSidebar: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, layout, fontSize, spacing, skills: skillsConfig, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)
  const contactQRCodePayload = resolveContactQRCodePayload(personalInfo)
  const contactQRCodeUrl = contactQRCodePayload ? createContactQRCodeImageUrl(contactQRCodePayload, 168) : null

  // 字体
  const fontFamilyStyle = fontFamily || 'Inter, sans-serif'

  // 侧边栏宽度
  const sidebarWidth = `${layout.leftColumnWidth || 32}%`
  const mainWidth = `${100 - (layout.leftColumnWidth || 32)}%`
  
  // 侧边栏颜色
  const sidebarBg = colors.primary || '#1e293b'
  
  // 字体大小
  const nameFontSize = fontSize?.name || 24
  const titleFontSize = fontSize?.title || 18
  const contentFontSize = fontSize?.content || 14
  const smallFontSize = fontSize?.small || 12
  
  // 间距
  const sectionSpacing = spacing?.section || 24
  const itemSpacing = spacing?.item || 16
  const lineHeight = spacing?.line ? Math.max(1.4, spacing.line / contentFontSize) : 1.4
  
  // 页面内边距
  const pagePadding = styleConfig.layout?.padding || 40

  /**
   * 渲染技能展示 - 根据 skillsConfig.displayStyle 选择不同样式
   */
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null
    
    const displayStyle = skillsConfig?.displayStyle || 'progress'
    
    switch (displayStyle) {
      case 'tags':
        return (
          <div className="flex flex-wrap gap-1.5">
            {skills.map(skill => (
              <span 
                key={skill.id}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: colors.accent || '#60a5fa'
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        )
      case 'list':
        return (
          <div className="flex flex-col gap-1.5">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2 text-xs text-white/80">
                <span style={{ color: colors.accent || '#60a5fa' }}>•</span>
                <span>{skill.name}</span>
                {skillsConfig?.showLevel && (
                  <span className="text-white/50 ml-auto">{skill.level}%</span>
                )}
              </div>
            ))}
          </div>
        )
      case 'cards':
        return (
          <div className="grid grid-cols-2 gap-2">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className="p-2 rounded text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="text-xs font-medium text-white/90">{skill.name}</div>
                {skillsConfig?.showLevel && (
                  <div className="text-[10px] text-white/50 mt-0.5">{skill.level}%</div>
                )}
              </div>
            ))}
          </div>
        )
      case 'grid':
        return (
          <div className="grid grid-cols-2 gap-1.5">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className="text-center p-1.5 rounded text-xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-white/80">{skill.name}</span>
              </div>
            ))}
          </div>
        )
      case 'radar':
        return (
          <div className="grid grid-cols-2 gap-3">
            {skills.map(skill => (
              <div key={skill.id} className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: colors.accent || '#3b82f6',
                    opacity: (skill.level || 50) / 100 + 0.3
                  }}
                >
                  <span className="text-[10px] font-medium" style={{ color: colors.accent || '#60a5fa' }}>
                    {skill.level}%
                  </span>
                </div>
                <span className="text-[10px] text-white/70 mt-1 text-center">{skill.name}</span>
              </div>
            ))}
          </div>
        )
      case 'progress':
      default:
        return (
          <div className="flex flex-col gap-3">
            {skills.map(skill => (
              <div key={skill.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-white/90">{skill.name}</span>
                  {skillsConfig?.showLevel && (
                    <span className="text-white/50">{skill.level}%</span>
                  )}
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${skill.level}%`,
                      backgroundColor: colors.accent || '#3b82f6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="flex w-full min-h-full bg-white" style={{ fontFamily: fontFamilyStyle }}>
      {/* 左侧边栏 */}
      <div 
        className="flex flex-col text-white gap-6"
        style={{ 
          width: sidebarWidth,
          backgroundColor: sidebarBg,
          minHeight: '100%',
          padding: `${pagePadding}px`
        }}
      >
        {/* 头像与基本信息 */}
        <div 
          className="flex flex-col items-center text-center gap-4 cursor-pointer" 
          onClick={() => onSectionClick?.('personal')}
        >
          {personalInfo.avatar && (
            <div className="relative">
              <div 
                className="absolute -inset-1 rounded-full opacity-30"
                style={{ border: `2px solid ${colors.accent || '#3b82f6'}` }}
              />
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl relative z-10"
              />
            </div>
          )}
          <div>
            <h1 
              className="font-bold tracking-wide"
              style={{ fontSize: `${nameFontSize}px` }}
            >
              {personalInfo.name}
            </h1>
            <p 
              className="font-medium mt-1"
              style={{ 
                color: colors.accent || '#60a5fa',
                fontSize: `${titleFontSize}px`
              }}
            >
              {personalInfo.title}
            </p>
          </div>
        </div>

        {/* 联系方式 */}
        <div 
          className="flex flex-col text-white/80"
          style={{ gap: `${itemSpacing / 2}px`, fontSize: `${smallFontSize}px` }}
        >
          {personalInfo.phone && (
            <div className="flex items-center gap-2.5">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Phone size={12} style={{ color: colors.accent || '#60a5fa' }} />
              </div>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-2.5">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Mail size={12} style={{ color: colors.accent || '#60a5fa' }} />
              </div>
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2.5">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <MapPin size={12} style={{ color: colors.accent || '#60a5fa' }} />
              </div>
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2.5">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Globe size={12} style={{ color: colors.accent || '#60a5fa' }} />
              </div>
              <span>{t.editor.templatePreview.personalWebsite}</span>
            </div>
          )}
          {contactQRCodeUrl && (
            <div className="pt-1">
              <div className="inline-flex flex-col items-center rounded-md border border-white/20 p-1.5">
                <img
                  src={contactQRCodeUrl}
                  alt={locale === 'en' ? 'Contact QR Code' : '联系方式二维码'}
                  className="h-[72px] w-[72px] rounded bg-white p-1"
                />
                <span className="mt-1 text-[10px] text-white/60">
                  {locale === 'en' ? 'Contact QR' : '联系二维码'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 技能 */}
        {skills && skills.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
            <h3 
              className="font-bold text-white mb-3 flex items-center gap-2 border-b border-white/20 pb-2"
              style={{ fontSize: `${contentFontSize}px` }}
            >
              <span 
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: colors.accent || '#3b82f6' }}
              />
              {t.editor.skills.title}
            </h3>
            {renderSkills()}
          </div>
        )}

        {/* 教育背景 */}
        {education && education.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('education')}>
            <h3 
              className="font-bold text-white mb-3 flex items-center gap-2 border-b border-white/20 pb-2"
              style={{ fontSize: `${contentFontSize}px` }}
            >
              <span 
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: colors.accent || '#3b82f6' }}
              />
              {t.editor.education.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {education.map(edu => (
                <div key={edu.id} style={{ fontSize: `${smallFontSize}px` }}>
                  <div className="font-bold text-white">{edu.school}</div>
                  <div style={{ color: colors.accent || '#60a5fa' }}>{edu.major}</div>
                  <div className="text-white/50 mt-0.5" style={{ fontSize: `${smallFontSize - 2}px` }}>
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
          color: colors.text || '#1f2937',
          padding: `${pagePadding}px`,
          gap: `${sectionSpacing}px`
        }}
      >
        {/* 个人简介 */}
        {personalInfo.summary && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
            <h2 
              className="font-bold mb-3 border-l-4 pl-3 uppercase tracking-wider"
              style={{ 
                color: sidebarBg,
                borderColor: colors.accent || '#3b82f6',
                fontSize: `${titleFontSize}px`
              }}
            >
              {t.editor.templatePreview.personalSummary}
            </h2>
            <p 
              className="text-gray-600"
              style={{ fontSize: `${contentFontSize}px`, lineHeight }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* 工作经历 */}
        {experience && experience.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('experience')}>
            <h2 
              className="font-bold mb-4 border-l-4 pl-3 uppercase tracking-wider"
              style={{ 
                color: sidebarBg,
                borderColor: colors.accent || '#3b82f6',
                fontSize: `${titleFontSize}px`
              }}
            >
              {t.editor.experience.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing + 4}px` }}>
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-4 border-l border-gray-200">
                  <div 
                    className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-blue-50"
                    style={{ backgroundColor: colors.accent || '#3b82f6' }}
                  />
                  <div className="flex flex-col gap-0.5 mb-2">
                    <h3 
                      className="font-bold" 
                      style={{ color: sidebarBg, fontSize: `${contentFontSize}px` }}
                    >
                      {exp.position}
                    </h3>
                    <div 
                      className="flex justify-between items-center"
                      style={{ fontSize: `${smallFontSize}px` }}
                    >
                      <span className="font-semibold" style={{ color: colors.accent || '#3b82f6' }}>{exp.company}</span>
                      <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded" style={{ fontSize: `${smallFontSize - 2}px` }}>
                        {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.description.map((desc, i) => (
                      <li 
                        key={i} 
                        className="text-gray-600 pl-1 marker:text-gray-300"
                        style={{ fontSize: `${smallFontSize}px`, lineHeight }}
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 项目经历 */}
        {projects && projects.length > 0 && (
          <div className="cursor-pointer" onClick={() => onSectionClick?.('projects')}>
            <h2 
              className="font-bold mb-4 border-l-4 pl-3 uppercase tracking-wider"
              style={{ 
                color: sidebarBg,
                borderColor: colors.accent || '#3b82f6',
                fontSize: `${titleFontSize}px`
              }}
            >
              {t.editor.projects.title}
            </h2>
            <div className="grid gap-4">
              {projects.map(project => (
                <div key={project.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 
                        className="font-bold" 
                        style={{ color: sidebarBg, fontSize: `${contentFontSize}px` }}
                      >
                        {project.name}
                      </h3>
                      {project.url && (
                        <a 
                          href={project.url} 
                          className="hover:underline block mt-0.5"
                          style={{ color: colors.accent || '#3b82f6', fontSize: `${smallFontSize - 2}px` }}
                        >
                          {project.url}
                        </a>
                      )}
                    </div>
                    <span 
                      className="text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 whitespace-nowrap"
                      style={{ fontSize: `${smallFontSize - 2}px` }}
                    >
                      {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                    </span>
                  </div>
                  <p 
                    className="text-gray-600 mb-2"
                    style={{ fontSize: `${smallFontSize}px`, lineHeight }}
                  >
                    {project.description}
                  </p>
                  {project.highlights && project.highlights.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {project.highlights.map((h, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2 text-gray-500"
                          style={{ fontSize: `${smallFontSize - 2}px`, lineHeight }}
                        >
                          <span style={{ color: colors.accent || '#3b82f6' }}>▹</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200/50">
                      {project.technologies.map((tech, i) => (
                        <span 
                          key={i} 
                          className="font-medium px-1.5 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${colors.accent || '#3b82f6'}15`,
                            color: colors.accent || '#3b82f6',
                            fontSize: `${smallFontSize - 3}px`
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
        )}
      </div>
    </div>
  )
}
