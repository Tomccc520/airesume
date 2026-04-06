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
 * 横幅布局
 * 对齐主流招聘平台“单栏 ATS”版式：标准模块顺序、低装饰、高可读。
 */
export const BannerLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  templateId,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()
  const isCompactBanner = templateId === 'banner-layout-compact'
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
    ? Math.max(styleConfig.layout?.padding || (isCompactBanner ? 32 : 34), isCompactBanner ? 28 : 32)
    : (isCompactBanner ? 32 : 34)
  const baseContentSize = hasCustomContentSize ? fontSize.content : 14
  const metrics = getMarketResumeMetrics({
    baseContentSize,
    sectionSpacing: hasCustomSectionSpacing ? spacing?.section : undefined
  })
  const sectionGap = isCompactBanner ? Math.max(metrics.sectionGap - 1, 17) : metrics.sectionGap
  const entryGap = isCompactBanner ? Math.max(metrics.entryGap - 1, 9) : metrics.entryGap
  const timelineDateWidth = isCompactBanner ? Math.max(metrics.dateColumnWidth - 8, 112) : metrics.dateColumnWidth
  const bodyLineHeight = isCompactBanner ? 1.52 : metrics.bodyLineHeight
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
  const headerAvatarSize = isCompactBanner ? 68 : 74
  const headerQRCodeSize = isCompactBanner ? 52 : 58
  const headerNameSize = isCompactBanner ? metrics.nameSize - 1 : metrics.nameSize
  const headerRoleSize = Math.max(metrics.roleSize - 1, baseContentSize + 1)
  const headerMetaSize = Math.max(metrics.metaSize, 11)

  /**
   * 格式化日期文本
   * 统一多语言环境下的日期输出。
   */
  const formatDateStr = (date?: string) => formatDate(date, locale)

  /**
   * 格式化时间区间
   * 处理当前在职与普通结束时间两种场景。
   */
  const formatPeriod = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    return `${formatDateStr(startDate)} - ${isCurrent ? t.editor.experience.current : formatDateStr(endDate)}`
  }

  /**
   * 渲染章节标题
   * 使用招聘模板常见的小标题样式，强调信息层级而非视觉装饰。
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
   * 按“电话/邮箱、城市/主页”的顺序两两分组，减少首屏横向拥挤感。
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
   * 将技术栈与链接摘要压缩到同一行，保持投递简历常见的信息密度。
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
   * 将学历与专业合并为同一行，符合招聘平台 PDF 的常见排版方式。
   */
  const getEducationPrimaryLine = (educationItem: ResumeData['education'][number]) => {
    return [educationItem.degree, educationItem.major].filter(Boolean).join(' · ')
  }

  /**
   * 获取教育补充信息
   * 将 GPA 与附加说明放到辅助行，减少主信息区域的拥挤感。
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
   * 将技能从“标签堆叠”改为“分类文本行”，更接近招聘平台导出风格。
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
        <div className="flex items-start justify-between gap-5">
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
            <div className="flex flex-col items-end gap-2">
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
            className="whitespace-pre-line"
            style={{
              marginTop: `${entryGap}px`,
              color: textColor,
              lineHeight: metrics.summaryLineHeight
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
          {renderSectionTitle(t.editor.experience.title)}
          <div style={{ display: 'grid', rowGap: `${entryGap}px` }}>
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
                      fontSize: `${metrics.itemTitleSize}px`,
                      color: headingColor,
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
                      minWidth: `${timelineDateWidth}px`,
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
                      <li key={`${exp.id}-desc-${index}`} className="list-disc" style={{ color: textColor }}>
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
          <div style={{ display: 'grid', rowGap: `${entryGap}px` }}>
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
                      fontSize: `${metrics.itemTitleSize}px`,
                      color: headingColor,
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
                      minWidth: `${timelineDateWidth}px`,
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
                    {project.highlights.map((highlight, index) => (
                      <li key={`${project.id}-highlight-${index}`} className="list-disc" style={{ color: textColor }}>
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

      {education.length > 0 && (
        <section
          className="cursor-pointer"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${sectionGap}px` }}
        >
          {renderSectionTitle(t.editor.education.title)}
          <div style={{ display: 'grid', rowGap: `${entryGap - 2}px` }}>
            {education.map((edu, index) => (
              <article
                key={edu.id}
                className="pb-2.5 last:pb-0"
                style={{
                  borderBottom: index < education.length - 1 ? `1px solid ${rowDividerColor}` : 'none'
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
                    {edu.school}
                  </h3>
                  <span
                    className="font-medium"
                    style={{
                      color: mutedColor,
                      fontSize: `${metrics.metaSize}px`,
                      fontWeight: metrics.metaWeight,
                      minWidth: `${timelineDateWidth}px`,
                      textAlign: 'right'
                    }}
                  >
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </span>
                </div>
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
              </article>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="cursor-pointer" onClick={() => onSectionClick?.('skills')}>
          {renderSectionTitle(t.editor.skills.title)}
          <div
            style={{
              display: 'grid',
              rowGap: `${metrics.bulletGap + 3}px`
            }}
          >
            {skillGroupEntries.map(([category, items]) => (
              <article
                key={category}
                className="grid items-start gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                style={{
                  gridTemplateColumns: `${isCompactBanner ? 70 : 82}px 1fr`,
                  borderColor: rowDividerColor
                }}
              >
                <h3
                  className="font-semibold uppercase tracking-[0.06em]"
                  style={{
                    color: mutedColor,
                    fontSize: `${metrics.metaSize}px`,
                    lineHeight: 1.55
                  }}
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
