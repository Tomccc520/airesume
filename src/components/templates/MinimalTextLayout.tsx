/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

'use client'

import React from 'react'
import Image from 'next/image'
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
 * 极简文本布局
 * 强化信息层级与留白节奏，兼顾 ATS 友好和视觉质感
 */
export const MinimalTextLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const fontFamilyStyle = fontFamily || '"Merriweather", "Times New Roman", Georgia, serif'
  const pagePadding = styleConfig.layout?.padding || 44
  const headingColor = colors.primary || '#0f172a'
  const textColor = colors.text || '#0f172a'
  const mutedColor = colors.secondary || '#475569'
  const accentColor = colors.accent || '#b7791f'
  const sectionGap = spacing?.section || 28

  /**
   * 格式化日期文本
   * 统一中英文环境的时间展示
   */
  const formatDateStr = (date?: string) => formatDate(date, locale)

  /**
   * 格式化时间区间
   * 处理“当前在职”与普通结束时间两种场景
   */
  const formatPeriod = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    return `${formatDateStr(startDate)} - ${isCurrent ? t.editor.experience.current : formatDateStr(endDate)}`
  }

  /**
   * 章节标题渲染
   * 保持标题样式一致，减少视觉噪音
   */
  const renderSectionTitle = (title: string) => (
    <div className="flex items-center gap-3">
      <div className="h-5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
      <h2
        className="font-bold uppercase tracking-[0.16em]"
        style={{
          fontSize: `${fontSize?.title || 15}px`,
          color: headingColor
        }}
      >
        {title}
      </h2>
    </div>
  )

  return (
    <div
      className="w-full min-h-full bg-white"
      style={{
        fontFamily: fontFamilyStyle,
        color: textColor,
        padding: `${pagePadding}px`,
        fontSize: `${fontSize?.content || 14}px`,
        lineHeight: 1.7
      }}
    >
      <section
        className="cursor-pointer rounded-2xl border border-slate-200/80 bg-slate-50/40 px-6 py-7 text-center"
        onClick={() => onSectionClick?.('personal')}
        style={{ marginBottom: `${sectionGap}px` }}
      >
        {personalInfo.avatar && (
          <Image
            src={personalInfo.avatar}
            alt={personalInfo.name}
            width={96}
            height={96}
            unoptimized
            className={`${getAvatarClassName(styleConfig, 'mx-auto mb-4 w-24 h-24')}`}
            style={{
              ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 96),
              border: `3px solid ${accentColor}`,
              boxShadow: '0 8px 20px -14px rgba(15, 23, 42, 0.6)'
            }}
          />
        )}
        <h1
          className="font-bold tracking-[0.08em]"
          style={{
            fontSize: `${fontSize?.name || 30}px`,
            color: headingColor,
            marginBottom: '6px'
          }}
        >
          {personalInfo.name}
        </h1>
        <p
          className="font-medium"
          style={{
            color: mutedColor,
            fontSize: `${fontSize?.title || 16}px`
          }}
        >
          {personalInfo.title}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs" style={{ color: mutedColor }}>
          {personalInfo.phone && <span className="rounded-full border border-slate-300 px-2.5 py-1">{personalInfo.phone}</span>}
          {personalInfo.email && <span className="rounded-full border border-slate-300 px-2.5 py-1">{personalInfo.email}</span>}
          {personalInfo.location && <span className="rounded-full border border-slate-300 px-2.5 py-1">{personalInfo.location}</span>}
          {personalInfo.website && <span className="rounded-full border border-slate-300 px-2.5 py-1">{personalInfo.website}</span>}
        </div>
      </section>

      {personalInfo.summary && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(t.editor.templatePreview.personalSummary)}
          <p className="mt-3 whitespace-pre-line leading-7" style={{ color: textColor }}>
            {personalInfo.summary}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(t.editor.experience.title)}
          <div className="mt-4 space-y-4">
            {experience.map((exp) => (
              <article key={exp.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold" style={{ color: headingColor }}>
                    {exp.position}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs" style={{ color: mutedColor }}>
                    {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium" style={{ color: accentColor }}>
                  {exp.company}
                  {exp.location && <span style={{ color: mutedColor }}> · {exp.location}</span>}
                </div>
                {exp.description.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {exp.description.map((desc, index) => (
                      <li key={`${exp.id}-desc-${index}`} style={{ color: textColor }}>
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(t.editor.education.title)}
          <div className="mt-4 space-y-3">
            {education.map((edu) => (
              <article key={edu.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold" style={{ color: headingColor }}>
                    {edu.school}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs" style={{ color: mutedColor }}>
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </span>
                </div>
                <div className="mt-1 text-sm" style={{ color: mutedColor }}>
                  {edu.degree} · {edu.major}
                  {edu.gpa && <span> · GPA {edu.gpa}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('projects')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(t.editor.projects.title)}
          <div className="mt-4 space-y-4">
            {projects.map((project) => (
              <article key={project.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold" style={{ color: headingColor }}>
                    {project.name}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs" style={{ color: mutedColor }}>
                    {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                  </span>
                </div>
                <p className="mt-2" style={{ color: textColor }}>
                  {project.description}
                </p>
                {project.highlights.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {project.highlights.map((highlight, index) => (
                      <li key={`${project.id}-highlight-${index}`} style={{ color: textColor }}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
          {renderSectionTitle(t.editor.skills.title)}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border px-3 py-1.5 text-sm"
                style={{
                  borderColor: `${accentColor}66`,
                  color: headingColor,
                  backgroundColor: '#ffffff'
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
