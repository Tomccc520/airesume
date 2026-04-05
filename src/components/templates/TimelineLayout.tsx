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
 * 逆序时间轴布局
 * 对齐招聘平台常见“左日期 + 右内容”的履历呈现方式。
 */
export const TimelineLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  templateId,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()
  const isClassicTimeline = templateId === 'timeline-layout-classic'
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
    ? Math.max(styleConfig.layout?.padding || (isClassicTimeline ? 36 : 34), isClassicTimeline ? 32 : 30)
    : (isClassicTimeline ? 36 : 34)
  const baseContentSize = hasCustomContentSize ? fontSize.content : 14
  const metrics = getMarketResumeMetrics({
    baseContentSize,
    sectionSpacing: hasCustomSectionSpacing ? spacing?.section : undefined
  })
  const sectionGap = isClassicTimeline ? Math.max(metrics.sectionGap - 1, 17) : metrics.sectionGap
  const timelineDateWidth = isClassicTimeline ? Math.max(metrics.dateColumnWidth + 12, 134) : Math.max(metrics.dateColumnWidth + 6, 124)
  const bodyLineHeight = isClassicTimeline ? 1.52 : metrics.bodyLineHeight
  const headingColor = hasCustomPrimaryColor ? colors.primary : '#0f172a'
  const textColor = hasCustomTextColor ? colors.text : '#111827'
  const mutedColor = hasCustomSecondaryColor ? colors.secondary : '#64748b'
  const borderColor = '#d3dbe6'
  const rowDividerColor = '#e4ebf3'
  const timelineColor = isClassicTimeline ? '#bcc9da' : '#cbd5e1'
  const timelineDotColor = isClassicTimeline ? '#334155' : '#475569'
  const isEnglish = locale === 'en'
  const contactQRCodePayload = resolveContactQRCodePayload(personalInfo)
  const showContactQRCode = Boolean(personalInfo.contactQRCode?.trim())
  const contactQRCodeUrl = showContactQRCode && contactQRCodePayload
    ? createContactQRCodeImageUrl(contactQRCodePayload, 176)
    : null
  const headerAvatarSize = isClassicTimeline ? 70 : 64
  const headerQRCodeSize = isClassicTimeline ? 54 : 48
  const headerNameSize = isClassicTimeline ? metrics.nameSize : metrics.nameSize - 1
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
   * 时间线模板将联系方式拆成两行，避免与日期列竞争横向空间。
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
   * 将技术栈与链接摘要合并，减少时间线正文中的跳读成本。
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
   * 将学历和专业整合为主行，强化时间线右侧正文的层级。
   */
  const getEducationPrimaryLine = (educationItem: ResumeData['education'][number]) => {
    return [educationItem.degree, educationItem.major].filter(Boolean).join(' · ')
  }

  /**
   * 获取教育补充信息
   * 将 GPA 与补充描述收敛到辅助行，减少时间线条目的拥挤感。
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
   * 将技能改为“分类 + 文本行”，减少时间轴模板底部的视觉噪音。
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

  const contactRows = getContactRows()
  const skillGroupEntries = Object.entries(groupSkillsByCategory())

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1
              className="font-semibold tracking-[0.02em]"
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
          {(personalInfo.avatar || contactQRCodeUrl) && (
            <div className="flex items-start gap-2">
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
          )}
        </div>
        {personalInfo.summary && (
          <div
            className="whitespace-pre-line border-t pt-2"
            style={{
              marginTop: `${metrics.entryGap - 2}px`,
              lineHeight: metrics.summaryLineHeight,
              borderColor: rowDividerColor
            }}
          >
            {personalInfo.summary}
          </div>
        )}
      </section>

      {experience.length > 0 && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(
            t.editor.experience.title,
            locale === 'en' ? `${experience.length} records` : `${experience.length} 条记录`
          )}
          <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
            {experience.map((exp, index) => (
              <article
                key={exp.id}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `${timelineDateWidth}px 1fr`,
                  borderBottom: index < experience.length - 1 ? `1px solid ${rowDividerColor}` : 'none',
                  paddingBottom: index < experience.length - 1 ? `${metrics.entryGap - 1}px` : 0
                }}
              >
                <div
                  className="pt-0.5 text-xs font-medium"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, fontWeight: metrics.metaWeight }}
                >
                  {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                </div>
                <div className="relative border-l pl-4" style={{ borderColor: timelineColor }}>
                  <span
                    className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: isClassicTimeline ? '#ffffff' : timelineDotColor,
                      border: `1.5px solid ${timelineDotColor}`
                    }}
                  />
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
          {renderSectionTitle(
            t.editor.projects.title,
            locale === 'en' ? `${projects.length} projects` : `${projects.length} 个项目`
          )}
          <div style={{ display: 'grid', rowGap: `${metrics.entryGap}px` }}>
            {projects.map((project, index) => (
              <article
                key={project.id}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `${timelineDateWidth}px 1fr`,
                  borderBottom: index < projects.length - 1 ? `1px solid ${rowDividerColor}` : 'none',
                  paddingBottom: index < projects.length - 1 ? `${metrics.entryGap - 1}px` : 0
                }}
              >
                <div
                  className="pt-0.5 text-xs font-medium"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, fontWeight: metrics.metaWeight }}
                >
                  {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                </div>
                <div className="relative border-l pl-4" style={{ borderColor: timelineColor }}>
                  <span
                    className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: isClassicTimeline ? '#ffffff' : timelineDotColor,
                      border: `1.5px solid ${timelineDotColor}`
                    }}
                  />
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
                  <p className="mt-1.5">{project.description}</p>
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
                      {project.highlights.map((highlight, highlightIndex) => (
                        <li key={`${project.id}-highlight-${highlightIndex}`} className="list-disc">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
          {renderSectionTitle(
            t.editor.education.title,
            locale === 'en' ? `${education.length} records` : `${education.length} 条记录`
          )}
          <div style={{ display: 'grid', rowGap: `${metrics.entryGap - 2}px` }}>
            {education.map((edu, index) => (
              <article
                key={edu.id}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `${timelineDateWidth}px 1fr`,
                  borderBottom: index < education.length - 1 ? `1px solid ${rowDividerColor}` : 'none',
                  paddingBottom: index < education.length - 1 ? `${metrics.entryGap - 2}px` : 0
                }}
              >
                <div
                  className="pt-0.5 text-xs font-medium"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, fontWeight: metrics.metaWeight }}
                >
                  {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                </div>
                <div className="relative border-l pl-4" style={{ borderColor: timelineColor }}>
                  <span
                    className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: isClassicTimeline ? '#ffffff' : timelineDotColor,
                      border: `1.5px solid ${timelineDotColor}`
                    }}
                  />
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
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
          {renderSectionTitle(
            t.editor.skills.title,
            locale === 'en' ? `${skills.length} skills` : `${skills.length} 项技能`
          )}
          <div style={{ display: 'grid', rowGap: `${metrics.bulletGap + 3}px` }}>
            {skillGroupEntries.map(([category, items]) => (
              <article
                key={category}
                className="grid items-start gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                style={{
                  gridTemplateColumns: `${isClassicTimeline ? 82 : 76}px 1fr`,
                  borderColor: rowDividerColor
                }}
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-[0.08em]"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, lineHeight: 1.55 }}
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
    </div>
  )
}
