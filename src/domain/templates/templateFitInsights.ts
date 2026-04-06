/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 *
 * @description 根据当前简历内容密度，为模板选择和导出链路提供版式适配建议。
 */

import { ResumeData } from '@/types/resume'

export type TemplateFitDensity = 'light' | 'balanced' | 'dense' | 'timeline'

export interface TemplateFitInsight {
  density: TemplateFitDensity
  recommendedTemplateId: string
  alternateTemplateId?: string
  shouldSuggestSwitch: boolean
  summary: string
  detail: string
  reasons: string[]
}

/**
 * 统计简历内容体量
 * 将经历、项目、技能和摘要长度压缩成模板选型所需的基础指标。
 */
function getResumeContentStats(resumeData: ResumeData) {
  const summaryLength = resumeData.personalInfo.summary.trim().length
  const experienceCount = resumeData.experience.filter((item) => item.company || item.position || item.description.length > 0).length
  const experienceBulletCount = resumeData.experience.reduce((count, item) => count + item.description.filter(Boolean).length, 0)
  const projectCount = resumeData.projects.filter((item) => item.name || item.description || item.highlights.length > 0).length
  const projectHighlightCount = resumeData.projects.reduce((count, item) => count + item.highlights.filter(Boolean).length, 0)
  const technologyCount = resumeData.projects.reduce((count, item) => count + item.technologies.filter(Boolean).length, 0)
  const skillCount = resumeData.skills.filter((item) => item.name.trim()).length
  const educationCount = resumeData.education.filter((item) => item.school || item.degree || item.description).length
  const contactSignalCount = [
    resumeData.personalInfo.website,
    resumeData.personalInfo.contactQRCode,
    resumeData.personalInfo.avatar
  ].filter(Boolean).length

  return {
    summaryLength,
    experienceCount,
    experienceBulletCount,
    projectCount,
    projectHighlightCount,
    technologyCount,
    skillCount,
    educationCount,
    contactSignalCount,
    totalBulletCount: experienceBulletCount + projectHighlightCount
  }
}

/**
 * 生成模板适配原因
 * 用简短标签解释“为什么更适合这套模板”，供模板弹窗和导出提示共用。
 */
function getTemplateFitReasons(
  stats: ReturnType<typeof getResumeContentStats>,
  locale: 'zh' | 'en',
  density: TemplateFitDensity
) {
  const reasons: string[] = []

  if (density === 'timeline') {
    reasons.push(locale === 'zh' ? '经历顺序更重要' : 'Timeline matters more')
  }

  if (stats.totalBulletCount >= 12 || stats.summaryLength >= 160) {
    reasons.push(locale === 'zh' ? '内容体量偏大' : 'Content is dense')
  }

  if (stats.skillCount >= 8 || stats.contactSignalCount >= 2) {
    reasons.push(locale === 'zh' ? '侧栏信息较多' : 'Side info is rich')
  }

  if (stats.experienceCount <= 1 && stats.projectCount <= 1) {
    reasons.push(locale === 'zh' ? '一页式内容较轻' : 'Light one-page content')
  }

  if (reasons.length === 0) {
    reasons.push(locale === 'zh' ? '结构较均衡' : 'Balanced structure')
  }

  return reasons.slice(0, 3)
}

/**
 * 获取模板适配建议
 * 根据当前简历内容体量与结构，推荐更合适的投递模板。
 */
export function getTemplateFitInsight(
  resumeData: ResumeData,
  locale: 'zh' | 'en',
  currentTemplateId?: string
): TemplateFitInsight {
  const stats = getResumeContentStats(resumeData)

  let density: TemplateFitDensity = 'balanced'
  let recommendedTemplateId = 'banner-layout'
  let alternateTemplateId = 'minimal-text'
  let summary = locale === 'zh' ? '当前内容与标准单栏模板匹配度较高。' : 'Current content fits a standard single-column template well.'
  let detail = locale === 'zh'
    ? '模块结构比较均衡，优先保证招聘方阅读效率即可。'
    : 'The section balance is stable, so recruiter readability should stay first.'

  if (
    stats.experienceCount >= 4 ||
    (stats.experienceCount >= 3 && stats.totalBulletCount >= 12)
  ) {
    density = 'timeline'
    recommendedTemplateId = 'timeline-layout-classic'
    alternateTemplateId = 'compact-layout'
    summary = locale === 'zh'
      ? '当前经历顺序较长，更适合时间线版式。'
      : 'The experience history is long enough to benefit from a timeline layout.'
    detail = locale === 'zh'
      ? '时间线资深投递能更清楚地展示日期列和履历推进关系。'
      : 'A senior timeline makes the date column and career progression easier to scan.'
  } else if (
    stats.totalBulletCount >= 12 ||
    stats.skillCount >= 10 ||
    stats.summaryLength >= 180 ||
    stats.technologyCount >= 10
  ) {
    density = 'dense'
    recommendedTemplateId = 'compact-layout'
    alternateTemplateId = stats.skillCount >= 10 ? 'card-layout-executive' : 'banner-layout'
    summary = locale === 'zh'
      ? '当前内容偏长，更适合紧凑单栏版式。'
      : 'The current content is dense and fits a compact single-column layout better.'
    detail = locale === 'zh'
      ? '紧凑单栏能在不破坏 ATS 结构的前提下，压缩更多经历和项目内容。'
      : 'A compact single-column layout keeps ATS-friendly structure while fitting more content.'
  } else if (
    stats.skillCount >= 8 ||
    stats.contactSignalCount >= 2 ||
    (stats.projectCount >= 2 && stats.skillCount >= 6)
  ) {
    density = 'balanced'
    recommendedTemplateId = 'card-layout-executive'
    alternateTemplateId = 'banner-layout'
    summary = locale === 'zh'
      ? '当前技能与辅助信息较多，更适合商务双栏。'
      : 'The current skill and side information volume fits a dual-column layout better.'
    detail = locale === 'zh'
      ? '商务双栏投递更适合突出技能、教育和联系方式，同时保留主内容阅读顺序。'
      : 'A business dual-column layout highlights skills, education, and contact info without losing reading order.'
  } else if (
    stats.experienceCount <= 1 &&
    stats.projectCount <= 1 &&
    stats.skillCount <= 6 &&
    stats.summaryLength <= 120 &&
    stats.educationCount <= 1
  ) {
    density = 'light'
    recommendedTemplateId = 'minimal-text'
    alternateTemplateId = 'banner-layout'
    summary = locale === 'zh'
      ? '当前内容较轻，经典单栏更稳妥。'
      : 'The content is light enough for a classic single-column template.'
    detail = locale === 'zh'
      ? '经典单栏投递更适合校招或一页式简历，整体观感会更稳。'
      : 'A classic single-column template usually feels safer for campus or concise one-page resumes.'
  }

  return {
    density,
    recommendedTemplateId,
    alternateTemplateId,
    shouldSuggestSwitch: Boolean(currentTemplateId && currentTemplateId !== recommendedTemplateId),
    summary,
    detail,
    reasons: getTemplateFitReasons(stats, locale, density)
  }
}
