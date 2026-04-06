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
import { getMarketResumeMetrics } from './marketResumeMetrics'
import { createContactQRCodeImageUrl, resolveContactQRCodePayload } from '@/utils/contactQRCode'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  templateId?: string
  onSectionClick?: (section: string) => void
}

/**
 * 双栏专业布局
 * 对齐招聘平台常见双栏模板：左侧经历项目，右侧技能教育。
 */
export const CardLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  templateId,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()
  const isExecutiveCard = templateId === 'card-layout-executive'
  const hasCustomFontFamily = Boolean(fontFamily && fontFamily !== 'Inter, sans-serif')
  const hasCustomPrimaryColor = colors.primary !== '#374151'
  const hasCustomSecondaryColor = colors.secondary !== '#6b7280'
  const hasCustomTextColor = colors.text !== '#111827'
  const hasCustomContentSize = Boolean(fontSize?.content && fontSize.content !== 15)
  const hasCustomSectionSpacing = Boolean(spacing?.section && spacing.section !== 40)
  const hasCustomLayoutPadding = Boolean(styleConfig.layout?.padding && styleConfig.layout.padding !== 25)

  const fontFamilyStyle = hasCustomFontFamily
    ? fontFamily
    : '"Calibri", "Arial", "PingFang SC", "Hiragino Sans GB", sans-serif'
  const pagePadding = hasCustomLayoutPadding
    ? Math.max(styleConfig.layout?.padding || (isExecutiveCard ? 34 : 32), isExecutiveCard ? 32 : 30)
    : (isExecutiveCard ? 34 : 32)
  const baseContentSize = hasCustomContentSize ? fontSize.content : 14
  const metrics = getMarketResumeMetrics({
    baseContentSize,
    sectionSpacing: hasCustomSectionSpacing ? spacing?.section : undefined
  })
  const sectionGap = isExecutiveCard ? Math.max(metrics.sectionGap - 1, 17) : metrics.sectionGap
  const dateColumnWidth = isExecutiveCard ? Math.max(metrics.dateColumnWidth + 10, 130) : metrics.dateColumnWidth
  const bodyLineHeight = isExecutiveCard ? 1.52 : metrics.bodyLineHeight
  const headingColor = hasCustomPrimaryColor ? colors.primary : '#0f172a'
  const textColor = hasCustomTextColor ? colors.text : '#111827'
  const mutedColor = hasCustomSecondaryColor ? colors.secondary : '#64748b'
  const borderColor = '#d3dbe6'
  const rowDividerColor = '#e4ebf3'
  const isEnglish = locale === 'en'
  const contactQRCodePayload = resolveContactQRCodePayload(personalInfo)
  const showContactQRCode = Boolean(personalInfo.contactQRCode?.trim())
  const contactQRCodeUrl = showContactQRCode && contactQRCodePayload
    ? createContactQRCodeImageUrl(contactQRCodePayload, 176)
    : null
  const headerAvatarSize = isExecutiveCard ? 66 : 62
  const headerQRCodeSize = isExecutiveCard ? 50 : 46
  const headerNameSize = Math.max(metrics.nameSize - 2, 26)
  const headerRoleSize = Math.max(metrics.roleSize - 1, baseContentSize + 1)
  const headerMetaSize = Math.max(metrics.metaSize, 11)

  /**
   * 格式化日期文本
   * 统一中英文环境下的日期输出。
   */
  const formatDateStr = (date?: string) => formatDate(date, locale)

  /**
   * 格式化时间区间
   * 统一处理“当前在职”与普通结束日期。
   */
  const formatPeriod = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    return `${formatDateStr(startDate)} - ${isCurrent ? t.editor.experience.current : formatDateStr(endDate)}`
  }

  /**
   * 渲染章节标题
   * 使用招聘模板常见的小标题 + 底线样式。
   */
  const renderSectionTitle = (title: string, helperText?: string) => (
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
   * 获取联系方式分组行
   * 双栏模板中按两行展示联系方式，提升首屏信息扫描效率。
   */
  const getContactRows = () => {
    const websiteLabel = personalInfo.website
      ? personalInfo.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
      : ''
    const contactItems = [personalInfo.phone, personalInfo.email, personalInfo.location, websiteLabel]
      .filter(Boolean)

    const rows: string[] = []
    for (let index = 0; index < contactItems.length; index += 2) {
      rows.push(contactItems.slice(index, index + 2).join(' · '))
    }

    return rows
  }

  /**
   * 获取项目补充信息行
   * 将技术栈与链接摘要压缩为一行，方便在双栏模板中快速浏览。
   */
  const getProjectMetaLine = (project: ResumeData['projects'][number]) => {
    const projectLinkLabel = project.url
      ? project.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
      : ''

    return [
      project.technologies.length > 0 ? project.technologies.join(' / ') : '',
      projectLinkLabel
    ]
      .filter(Boolean)
      .join(' · ')
  }

  /**
   * 获取教育主信息
   * 将学历和专业收敛为更适合侧栏阅读的一行。
   */
  const getEducationPrimaryLine = (educationItem: ResumeData['education'][number]) => {
    return [educationItem.degree, educationItem.major].filter(Boolean).join(' · ')
  }

  /**
   * 获取教育补充信息
   * 将 GPA 与补充说明放到辅助行，避免侧栏内容过于拥挤。
   */
  const getEducationSupportingLine = (educationItem: ResumeData['education'][number]) => {
    return [
      educationItem.gpa ? `GPA ${educationItem.gpa}` : '',
      educationItem.description || ''
    ]
      .filter(Boolean)
      .join(' · ')
  }

  /**
   * 按分类聚合技能
   * 将技能展示为分类文本，符合主流模板导出样式。
   */
  const groupSkillsByCategory = () => {
    const fallbackCategory = locale === 'en' ? 'General' : '综合'
    return skills.reduce<Record<string, typeof skills>>((groups, skill) => {
      const category = skill.category || fallbackCategory
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(skill)
      return groups
    }, {})
  }

  const skillGroups = groupSkillsByCategory()
  const contactRows = getContactRows()
  const skillGroupEntries = Object.entries(skillGroups)
  const layoutColumns = isExecutiveCard ? 'grid-cols-[1.58fr,1fr]' : 'grid-cols-[1.66fr,1fr]'

  return (
    <div
      className="w-full min-h-full border bg-white"
      style={{
        fontFamily: fontFamilyStyle,
        color: textColor,
        fontSize: `${baseContentSize}px`,
        lineHeight: bodyLineHeight,
        padding: `${pagePadding}px`,
        borderColor
      }}
    >
      <section
        className="cursor-pointer border-b pb-5"
        onClick={() => onSectionClick?.('personal')}
        style={{
          marginBottom: `${sectionGap}px`,
          borderColor
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-1 items-start gap-4">
            {personalInfo.avatar && (
              <Image
                src={personalInfo.avatar}
                alt={personalInfo.name}
                width={headerAvatarSize}
                height={headerAvatarSize}
                unoptimized
                className={getAvatarClassName(styleConfig, 'h-auto w-auto shrink-0')}
                style={{
                  ...getAvatarInlineStyle(
                    personalInfo.avatarBorderRadius,
                    styleConfig,
                    headerAvatarSize,
                    {
                      width: `${headerAvatarSize}px`,
                      height: `${headerAvatarSize}px`
                    }
                  ),
                  border: `1px solid ${borderColor}`
                }}
              />
            )}
            <div className="flex-1">
              <h1
                className="font-semibold"
                style={{
                  fontSize: `${headerNameSize}px`,
                  color: headingColor,
                  fontWeight: metrics.nameWeight
                }}
              >
                {personalInfo.name}
              </h1>
              <p
                className="mt-1 font-medium"
                style={{
                  fontSize: `${headerRoleSize}px`,
                  color: mutedColor,
                  fontWeight: metrics.roleWeight
                }}
              >
                {personalInfo.title}
              </p>
              {contactRows.length > 0 && (
                <div
                  style={{
                    marginTop: `${metrics.bulletGap + 2}px`,
                    display: 'grid',
                    rowGap: '4px'
                  }}
                >
                  {contactRows.map((row) => (
                    <p
                      key={row}
                      style={{
                        color: mutedColor,
                        fontSize: `${headerMetaSize}px`,
                        fontWeight: metrics.metaWeight,
                        lineHeight: 1.45
                      }}
                    >
                      {row}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          {contactQRCodeUrl && (
            <div className="rounded-md border bg-white p-1.5 text-center" style={{ borderColor: rowDividerColor }}>
              <Image
                src={contactQRCodeUrl}
                alt={isEnglish ? 'Contact QR Code' : '联系方式二维码'}
                width={headerQRCodeSize}
                height={headerQRCodeSize}
                unoptimized
                className="h-auto w-auto"
                style={{
                  width: `${headerQRCodeSize}px`,
                  height: `${headerQRCodeSize}px`
                }}
              />
              <p className="mt-1 text-[9px]" style={{ color: mutedColor, lineHeight: 1.3 }}>
                {isEnglish ? 'Scan to contact' : '扫码联系'}
              </p>
            </div>
          )}
        </div>
        {personalInfo.summary && (
          <div
            className="whitespace-pre-line"
            style={{
              marginTop: `${metrics.entryGap}px`,
              lineHeight: metrics.summaryLineHeight
            }}
          >
            {personalInfo.summary}
          </div>
        )}
      </section>

      <div className={`grid ${layoutColumns}`} style={{ columnGap: `${Math.max(sectionGap - 1, metrics.entryGap + 10)}px` }}>
        <div>
          {experience.length > 0 && (
            <section
              className="cursor-pointer"
              onClick={() => onSectionClick?.('experience')}
              style={{ marginBottom: `${sectionGap}px` }}
            >
              {renderSectionTitle(t.editor.experience.title)}
              <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
                {experience.map((exp, index) => (
                  <article
                    key={exp.id}
                    className="pb-3 last:pb-0"
                    style={{
                      borderBottom: index < experience.length - 1 ? `1px solid ${rowDividerColor}` : 'none'
                    }}
                  >
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
                          minWidth: `${dateColumnWidth}px`,
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
                          rowGap: `${metrics.bulletGap}px`,
                          lineHeight: bodyLineHeight
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
            <section
              className="cursor-pointer"
              onClick={() => onSectionClick?.('projects')}
              style={{ marginBottom: `${sectionGap}px` }}
            >
              {renderSectionTitle(t.editor.projects.title)}
              <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
                {projects.map((project, index) => (
                  <article
                    key={project.id}
                    className="pb-3 last:pb-0"
                    style={{
                      borderBottom: index < projects.length - 1 ? `1px solid ${rowDividerColor}` : 'none'
                    }}
                  >
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
                          minWidth: `${dateColumnWidth}px`,
                          textAlign: 'right'
                        }}
                      >
                        {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                      </span>
                    </div>
                    {getProjectMetaLine(project) && (
                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: mutedColor,
                          fontSize: `${metrics.metaSize}px`,
                          fontWeight: metrics.metaWeight,
                          lineHeight: 1.45
                        }}
                      >
                        {getProjectMetaLine(project)}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm">{project.description}</p>
                    {project.highlights.length > 0 && (
                      <ul
                        className="pl-4"
                        style={{
                          marginTop: `${metrics.bulletGap}px`,
                          display: 'grid',
                          rowGap: `${metrics.bulletGap}px`,
                          lineHeight: bodyLineHeight
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
        </div>

        <aside className="border-l pl-5" style={{ borderColor: rowDividerColor }}>
          {skills.length > 0 && (
            <section
              className="cursor-pointer"
              onClick={() => onSectionClick?.('skills')}
              style={{ marginBottom: `${sectionGap}px` }}
            >
              {renderSectionTitle(t.editor.skills.title)}
              <div style={{ display: 'grid', rowGap: `${metrics.bulletGap + 3}px` }}>
                {skillGroupEntries.map(([category, items]) => (
                  <article
                    key={category}
                    className="grid items-start gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                    style={{
                      gridTemplateColumns: '72px 1fr',
                      borderColor: rowDividerColor
                    }}
                  >
                    <h3
                      className="text-xs font-semibold uppercase tracking-[0.08em]"
                      style={{ color: mutedColor, lineHeight: 1.55 }}
                    >
                      {category}
                    </h3>
                    <p className="text-sm" style={{ color: textColor, lineHeight: bodyLineHeight }}>
                      {items.map((skill, index) => (
                        <span key={skill.id}>
                          {skill.name}
                          {index < items.length - 1 && <span style={{ color: mutedColor }}> / </span>}
                        </span>
                      ))}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="cursor-pointer" onClick={() => onSectionClick?.('education')}>
              {renderSectionTitle(t.editor.education.title)}
              <div style={{ display: 'grid', rowGap: `${metrics.entryGap - 2}px` }}>
                {education.map((edu, index) => (
                  <article
                    key={edu.id}
                    style={{
                      borderBottom: index < education.length - 1 ? `1px solid ${rowDividerColor}` : 'none',
                      paddingBottom: index < education.length - 1 ? `${metrics.bulletGap + 2}px` : 0
                    }}
                  >
                    <h3
                      className="font-semibold"
                      style={{
                        color: headingColor,
                        fontSize: `${metrics.itemTitleSize}px`,
                        fontWeight: metrics.itemTitleWeight
                      }}
                    >
                      {edu.school}
                    </h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: headingColor }}>
                      {getEducationPrimaryLine(edu)}
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: mutedColor,
                        fontSize: `${metrics.metaSize}px`,
                        fontWeight: metrics.metaWeight,
                        lineHeight: 1.45
                      }}
                    >
                      {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                    </p>
                    {getEducationSupportingLine(edu) && (
                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: mutedColor,
                          fontSize: `${metrics.metaSize}px`,
                          fontWeight: metrics.metaWeight,
                          lineHeight: 1.45
                        }}
                      >
                        {getEducationSupportingLine(edu)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
