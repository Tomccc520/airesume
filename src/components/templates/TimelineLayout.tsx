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
import { getUnifiedResumeMetrics } from './resumePrintMetrics'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 逆序时间轴布局
 * 对齐招聘平台常见“左日期 + 右内容”的履历呈现方式。
 */
export const TimelineLayout: React.FC<TemplateProps> = ({
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
  const headingColor = colors.primary || '#1f2937'
  const textColor = colors.text || '#1f2937'
  const mutedColor = colors.secondary || '#6b7280'
  const borderColor = '#d8dee7'
  const timelineColor = '#c6ced8'
  const timelineDotColor = '#64748b'
  const isEnglish = locale === 'en'

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
   * 生成联系方式摘要
   * 使用“·”连接信息，保持页眉紧凑。
   */
  const getContactSummary = () => {
    return [personalInfo.phone, personalInfo.email, personalInfo.location, personalInfo.website]
      .filter(Boolean)
      .join(' · ')
  }

  return (
    <div
      className="w-full min-h-full border bg-white"
      style={{
        fontFamily: fontFamilyStyle,
        color: textColor,
        fontSize: `${baseContentSize}px`,
        lineHeight: metrics.bodyLineHeight,
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
                fontSize: `${metrics.nameSize}px`,
                color: headingColor,
                fontWeight: metrics.nameWeight
              }}
            >
              {personalInfo.name}
            </h1>
            <p
              className="mt-1 font-medium"
              style={{
                fontSize: `${metrics.roleSize}px`,
                color: mutedColor,
                fontWeight: metrics.roleWeight
              }}
            >
              {personalInfo.title}
            </p>
            {!!getContactSummary() && (
              <p
                style={{
                  marginTop: `${metrics.bulletGap + 1}px`,
                  color: mutedColor,
                  fontSize: `${metrics.metaSize}px`,
                  fontWeight: metrics.metaWeight
                }}
              >
                {getContactSummary()}
              </p>
            )}
          </div>
          {personalInfo.avatar && (
            <Image
              src={personalInfo.avatar}
              alt={personalInfo.name}
              width={metrics.headerAvatarSize}
              height={metrics.headerAvatarSize}
              unoptimized
              className={getAvatarClassName(styleConfig, 'h-[72px] w-[72px]')}
              style={{
                ...getAvatarInlineStyle(
                  personalInfo.avatarBorderRadius,
                  styleConfig,
                  metrics.headerAvatarSize
                ),
                border: `1px solid ${borderColor}`
              }}
            />
          )}
        </div>
        {personalInfo.summary && (
          <p
            className="whitespace-pre-line"
            style={{
              marginTop: `${metrics.entryGap - 3}px`,
              lineHeight: metrics.summaryLineHeight
            }}
          >
            {personalInfo.summary}
          </p>
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
            {experience.map((exp) => (
              <article
                key={exp.id}
                className="grid gap-4"
                style={{ gridTemplateColumns: `${metrics.dateColumnWidth}px 1fr` }}
              >
                <div
                  className="pt-0.5 text-xs font-medium"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, fontWeight: metrics.metaWeight }}
                >
                  {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                </div>
                <div className="relative border-l pl-4" style={{ borderColor: timelineColor }}>
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: timelineDotColor }}
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
            {education.map((edu) => (
              <article
                key={edu.id}
                className="grid gap-4"
                style={{ gridTemplateColumns: `${metrics.dateColumnWidth}px 1fr` }}
              >
                <div
                  className="pt-0.5 text-xs font-medium"
                  style={{ color: mutedColor, fontSize: `${metrics.metaSize}px`, fontWeight: metrics.metaWeight }}
                >
                  {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                </div>
                <div className="relative border-l pl-4" style={{ borderColor: timelineColor }}>
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: timelineDotColor }}
                  />
                  <h3 className="font-semibold" style={{ color: headingColor, fontWeight: metrics.itemTitleWeight }}>
                    {edu.school}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: mutedColor }}>
                    {edu.degree} · {edu.major}
                    {edu.gpa && <span> · GPA {edu.gpa}</span>}
                  </p>
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
          <p style={{ color: textColor }}>
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 && <span style={{ color: mutedColor }}> / </span>}
              </span>
            ))}
          </p>
        </section>
      )}
    </div>
  )
}
