/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'
import { getAvatarClassName, getAvatarInlineStyle } from '@/utils/avatarUtils'
import { getUnifiedResumeMetrics } from './resumePrintMetrics'
import { createContactQRCodeImageUrl, resolveContactQRCodePayload } from '@/utils/contactQRCode'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 标准双栏模板
 * 左侧信息栏 + 右侧经历主链，兼顾视觉层级和招聘筛选效率。
 */
export const TwoColumnStandard: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const fontFamilyStyle = fontFamily || '"Calibri", "Arial", "PingFang SC", "Hiragino Sans GB", sans-serif'
  const pagePadding = styleConfig.layout?.padding || 34
  const baseContentSize = fontSize?.content || 14
  const metrics = getUnifiedResumeMetrics({ baseContentSize, sectionSpacing: spacing?.section })
  const sectionGap = metrics.sectionGap
  const sidebarBg = (colors as Record<string, string>).sidebarBg || '#1f2937'
  const sidebarText = '#e5e7eb'
  const sidebarMuted = '#94a3b8'
  const headingColor = colors.primary || '#1f2937'
  const textColor = colors.text || '#1f2937'
  const mutedColor = colors.secondary || '#6b7280'
  const borderColor = '#d8dee7'
  const isEnglish = locale === 'en'
  const contactQRCodePayload = resolveContactQRCodePayload(personalInfo)
  const contactQRCodeUrl = contactQRCodePayload ? createContactQRCodeImageUrl(contactQRCodePayload, 176) : null

  /**
   * 格式化日期
   * 统一处理中英文日期展示。
   */
  const formatDateStr = (date?: string) => formatDate(date, locale)

  /**
   * 格式化时间区间
   * 在当前在职场景下展示本地化“至今”文案。
   */
  const formatPeriod = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    return `${formatDateStr(startDate)} - ${isCurrent ? t.editor.experience.current : formatDateStr(endDate)}`
  }

  /**
   * 渲染侧栏标题
   * 侧栏统一使用大写小标题，保持信息分区清晰。
   */
  const renderSidebarTitle = (title: string) => (
    <h3
      className={`border-b pb-2 text-[11px] font-semibold ${isEnglish ? 'uppercase tracking-[0.12em]' : ''}`}
      style={{ color: sidebarText, borderColor: 'rgba(255,255,255,0.2)' }}
    >
      {title}
    </h3>
  )

  /**
   * 渲染主区标题
   * 主区采用标准底线标题，减少视觉装饰。
   */
  const renderMainTitle = (title: string, helperText?: string) => (
    <div
      className="flex items-end justify-between border-b"
      style={{
        borderColor,
        paddingBottom: `${metrics.sectionTitlePaddingBottom}px`,
        marginBottom: `${metrics.sectionTitleMarginBottom}px`
      }}
    >
      <h2
        className={`text-sm font-semibold ${isEnglish ? 'uppercase tracking-[0.1em]' : ''}`}
        style={{
          color: headingColor,
          fontSize: `${metrics.sectionTitleSize}px`,
          fontWeight: metrics.sectionTitleWeight
        }}
      >
        {title}
      </h2>
      {helperText && (
        <span className="text-xs" style={{ color: mutedColor, fontWeight: metrics.metaWeight }}>
          {helperText}
        </span>
      )}
    </div>
  )

  /**
   * 聚合联系信息
   * 将联系方式按顺序输出，避免重复 JSX 分支。
   */
  const getContactItems = () => {
    const websiteLabel = personalInfo.website
      ? personalInfo.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
      : ''
    const items = [
      { label: locale === 'en' ? 'Phone' : '电话', value: personalInfo.phone },
      { label: locale === 'en' ? 'Email' : '邮箱', value: personalInfo.email },
      { label: locale === 'en' ? 'Location' : '地址', value: personalInfo.location },
      { label: locale === 'en' ? 'Website' : '网站', value: websiteLabel }
    ]
    return items.filter((item) => Boolean(item.value))
  }

  const contactItems = getContactItems()

  return (
    <div className="flex w-full min-h-full border bg-white" style={{ borderColor, fontFamily: fontFamilyStyle }}>
      <aside
        className="flex flex-col"
        style={{
          width: '33%',
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
              width={88}
              height={88}
              unoptimized
              className={getAvatarClassName(styleConfig, 'mx-auto h-[88px] w-[88px]')}
              style={{
                ...getAvatarInlineStyle(personalInfo.avatarBorderRadius, styleConfig, 88),
                border: '1px solid rgba(255,255,255,0.35)'
              }}
            />
          )}
          <h1
            className="mt-3 font-semibold tracking-[0.02em]"
            style={{ fontSize: `${metrics.nameSize - 8}px`, fontWeight: metrics.nameWeight }}
          >
            {personalInfo.name}
          </h1>
          <p
            className="mt-1"
            style={{ color: sidebarMuted, fontSize: `${metrics.roleSize - 3}px`, fontWeight: metrics.roleWeight }}
          >
            {personalInfo.title}
          </p>
        </section>

        <section className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
          {renderSidebarTitle(locale === 'en' ? 'Contact' : '联系方式')}
          <div className="mt-3 space-y-2 text-xs">
            {contactItems.map((item) => (
              <div key={item.label} className="rounded border px-2.5 py-2" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: sidebarMuted }}>
                  {item.label}
                </div>
                <div className="mt-1 break-all">{item.value}</div>
              </div>
            ))}
            {contactQRCodeUrl && (
              <div className="rounded border p-2 text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <Image
                  src={contactQRCodeUrl}
                  alt={isEnglish ? 'Contact QR Code' : '联系方式二维码'}
                  width={76}
                  height={76}
                  unoptimized
                  className="mx-auto h-[76px] w-[76px] rounded bg-white p-1"
                />
                <p className="mt-1 text-[10px]" style={{ color: sidebarMuted }}>
                  {isEnglish ? 'Contact QR' : '联系二维码'}
                </p>
              </div>
            )}
          </div>
        </section>

        {skills.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
            {renderSidebarTitle(t.editor.skills.title)}
            <div className="mt-3 space-y-2.5">
              {skills.map((skill) => (
                <article key={skill.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{skill.name}</span>
                    <span style={{ color: sidebarMuted }}>{skill.level}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('education')}>
            {renderSidebarTitle(t.editor.education.title)}
            <div className="mt-3 space-y-3 text-xs">
              {education.map((edu) => (
                <article key={edu.id} className="rounded border px-2.5 py-2" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                  <h4 className="font-semibold">{edu.school}</h4>
                  <p className="mt-1" style={{ color: sidebarMuted }}>
                    {edu.degree} · {edu.major}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: sidebarMuted }}>
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                    {edu.gpa && <span> · GPA {edu.gpa}</span>}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </aside>

      <main
        className="flex flex-col"
        style={{
          width: '67%',
          color: textColor,
          fontSize: `${baseContentSize}px`,
          lineHeight: metrics.bodyLineHeight,
          padding: `${pagePadding}px`,
          gap: `${sectionGap}px`
        }}
      >
        {personalInfo.summary && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('personal')}>
            {renderMainTitle(t.editor.templatePreview.personalSummary)}
            <p className="whitespace-pre-line" style={{ lineHeight: metrics.summaryLineHeight }}>
              {personalInfo.summary}
            </p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="cursor-pointer" onClick={() => onSectionClick?.('experience')}>
            {renderMainTitle(
              t.editor.experience.title,
              locale === 'en' ? `${experience.length} records` : `${experience.length} 条记录`
            )}
            <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
              {experience.map((exp) => (
                <article key={exp.id} className="pb-3 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3
                      className="font-semibold"
                      style={{
                        color: headingColor,
                        fontSize: `${metrics.itemTitleSize}px`,
                        fontWeight: metrics.itemTitleWeight
                      }}
                    >
                      {exp.position}
                    </h3>
                    <span
                      className="font-medium"
                      style={{
                        color: mutedColor,
                        fontSize: `${metrics.metaSize}px`,
                        fontWeight: metrics.metaWeight,
                        minWidth: `${metrics.dateColumnWidth}px`,
                        textAlign: 'right'
                      }}
                    >
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium" style={{ color: headingColor }}>
                    {exp.company}
                    {exp.location && <span style={{ color: mutedColor }}> · {exp.location}</span>}
                  </p>
                  {exp.description.length > 0 && (
                    <ul
                      className="pl-4"
                      style={{
                        marginTop: `${metrics.bulletGap}px`,
                        display: 'grid',
                        rowGap: `${metrics.bulletGap}px`
                      }}
                    >
                      {exp.description.map((desc, index) => (
                        <li key={`${exp.id}-desc-${index}`} className="list-disc">
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
            {renderMainTitle(
              t.editor.projects.title,
              locale === 'en' ? `${projects.length} projects` : `${projects.length} 个项目`
            )}
            <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
              {projects.map((project) => (
                <article key={project.id} className="pb-3 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3
                      className="font-semibold"
                      style={{
                        color: headingColor,
                        fontSize: `${metrics.itemTitleSize}px`,
                        fontWeight: metrics.itemTitleWeight
                      }}
                    >
                      {project.name}
                    </h3>
                    <span
                      className="font-medium"
                      style={{
                        color: mutedColor,
                        fontSize: `${metrics.metaSize}px`,
                        fontWeight: metrics.metaWeight,
                        minWidth: `${metrics.dateColumnWidth}px`,
                        textAlign: 'right'
                      }}
                    >
                      {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                    </span>
                  </div>
                  <p className="mt-1.5">{project.description}</p>
                  {project.highlights.length > 0 && (
                    <ul
                      className="pl-4"
                      style={{
                        marginTop: `${metrics.bulletGap}px`,
                        display: 'grid',
                        rowGap: `${metrics.bulletGap}px`
                      }}
                    >
                      {project.highlights.map((highlight, index) => (
                        <li key={`${project.id}-highlight-${index}`} className="list-disc">
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
