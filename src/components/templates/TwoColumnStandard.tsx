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
 * 标准双栏布局
 * 左侧深色信息区 + 右侧浅色内容区，突出信息扫描效率
 */
export const TwoColumnStandard: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const fontFamilyStyle = fontFamily || '"Manrope", "PingFang SC", "Hiragino Sans GB", sans-serif'
  const pagePadding = styleConfig.layout?.padding || 36
  const sidebarWidth = '33%'
  const mainWidth = '67%'
  const sidebarBg = (colors as Record<string, string>).sidebarBg || '#10233f'
  const sidebarText = '#e2e8f0'
  const sidebarMuted = '#94a3b8'
  const headingColor = colors.primary || '#0f172a'
  const bodyColor = colors.text || '#1e293b'
  const mutedColor = colors.secondary || '#64748b'
  const accentColor = colors.accent || '#0ea5a4'
  const sectionGap = spacing?.section || 24

  /**
   * 格式化日期文本
   * 统一中英文环境的日期展示规则
   */
  const formatDateStr = (date?: string) => formatDate(date, locale)

  /**
   * 格式化时间区间
   * 在“当前在职”场景下返回本地化的进行中标识
   */
  const formatPeriod = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    return `${formatDateStr(startDate)} - ${isCurrent ? t.editor.experience.current : formatDateStr(endDate)}`
  }

  /**
   * 渲染侧栏标题
   * 使用统一的小标题样式提升侧栏信息可读性
   */
  const renderSidebarTitle = (title: string) => (
    <h3
      className="mb-3 border-b border-white/20 pb-2 text-xs font-semibold uppercase tracking-[0.16em]"
      style={{ color: '#cbd5e1' }}
    >
      {title}
    </h3>
  )

  /**
   * 渲染主内容标题
   * 使用左侧强调条建立稳定视觉锚点
   */
  const renderMainTitle = (title: string) => (
    <div className="flex items-center gap-2">
      <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
      <h2
        className="text-[15px] font-bold uppercase tracking-[0.16em]"
        style={{ color: headingColor }}
      >
        {title}
      </h2>
    </div>
  )

  return (
    <div className="flex w-full min-h-full bg-slate-50" style={{ fontFamily: fontFamilyStyle }}>
      <aside
        className="flex flex-col"
        style={{
          width: sidebarWidth,
          backgroundColor: sidebarBg,
          padding: `${pagePadding}px`,
          color: sidebarText,
          gap: `${sectionGap}px`
        }}
      >
        <section className="cursor-pointer text-center" onClick={() => onSectionClick?.('personal')}>
          {personalInfo.avatar && (
            <Image
              src={personalInfo.avatar}
              alt={personalInfo.name}
              width={96}
              height={96}
              unoptimized
              className={`${getAvatarClassName(styleConfig, 'mx-auto mb-4 h-24 w-24')}`}
              style={{
                ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 96),
                border: `3px solid ${accentColor}`,
                boxShadow: '0 12px 24px -18px rgba(15, 23, 42, 0.85)'
              }}
            />
          )}
          <h1 className="text-2xl font-semibold tracking-[0.05em]">{personalInfo.name}</h1>
          <p className="mt-1 text-sm" style={{ color: sidebarMuted }}>
            {personalInfo.title}
          </p>
        </section>

        <section className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
          {renderSidebarTitle(locale === 'en' ? 'Contact' : '联系方式')}
          <div className="space-y-2 text-xs leading-relaxed">
            {personalInfo.phone && (
              <div className="rounded-md bg-white/5 px-2.5 py-2">
                <div className="font-medium" style={{ color: sidebarMuted }}>
                  {locale === 'en' ? 'Phone' : '电话'}
                </div>
                <div>{personalInfo.phone}</div>
              </div>
            )}
            {personalInfo.email && (
              <div className="rounded-md bg-white/5 px-2.5 py-2">
                <div className="font-medium" style={{ color: sidebarMuted }}>
                  {locale === 'en' ? 'Email' : '邮箱'}
                </div>
                <div className="break-all">{personalInfo.email}</div>
              </div>
            )}
            {personalInfo.location && (
              <div className="rounded-md bg-white/5 px-2.5 py-2">
                <div className="font-medium" style={{ color: sidebarMuted }}>
                  {locale === 'en' ? 'Location' : '地址'}
                </div>
                <div>{personalInfo.location}</div>
              </div>
            )}
            {personalInfo.website && (
              <div className="rounded-md bg-white/5 px-2.5 py-2">
                <div className="font-medium" style={{ color: sidebarMuted }}>
                  {locale === 'en' ? 'Website' : '网站'}
                </div>
                <div className="break-all">{personalInfo.website}</div>
              </div>
            )}
          </div>
        </section>

        {skills.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
            {renderSidebarTitle(t.editor.skills.title)}
            <div className="space-y-2.5">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-100">{skill.name}</span>
                    <span style={{ color: sidebarMuted }}>{skill.level}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: accentColor
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('education')}>
            {renderSidebarTitle(t.editor.education.title)}
            <div className="space-y-3 text-xs">
              {education.map((edu) => (
                <article key={edu.id} className="rounded-md bg-white/5 px-2.5 py-2">
                  <div className="font-semibold text-slate-100">{edu.school}</div>
                  <div className="mt-1" style={{ color: sidebarMuted }}>
                    {edu.degree} · {edu.major}
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: sidebarMuted }}>
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </aside>

      <main
        className="flex flex-col bg-white"
        style={{
          width: mainWidth,
          color: bodyColor,
          padding: `${pagePadding}px`,
          gap: `${sectionGap}px`
        }}
      >
        {personalInfo.summary && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
            {renderMainTitle(t.editor.templatePreview.personalSummary)}
            <p className="mt-3 whitespace-pre-line leading-7" style={{ color: bodyColor }}>
              {personalInfo.summary}
            </p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('experience')}>
            {renderMainTitle(t.editor.experience.title)}
            <div className="mt-4 space-y-4">
              {experience.map((exp) => (
                <article key={exp.id} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold" style={{ color: headingColor, fontSize: `${fontSize?.content || 14}px` }}>
                      {exp.position}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs" style={{ color: mutedColor }}>
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
                        <li key={`${exp.id}-desc-${index}`} style={{ color: bodyColor, fontSize: `${fontSize?.small || 12}px` }}>
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

        {projects.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('projects')}>
            {renderMainTitle(t.editor.projects.title)}
            <div className="mt-4 grid gap-3">
              {projects.map((project) => (
                <article key={project.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold" style={{ color: headingColor, fontSize: `${fontSize?.content || 14}px` }}>
                      {project.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs" style={{ color: mutedColor }}>
                      {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: bodyColor }}>
                    {project.description}
                  </p>
                  {project.highlights.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {project.highlights.map((highlight, index) => (
                        <li key={`${project.id}-highlight-${index}`} style={{ color: bodyColor, fontSize: `${fontSize?.small - 1 || 11}px` }}>
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
      </main>
    </div>
  )
}
