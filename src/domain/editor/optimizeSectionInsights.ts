/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 *
 * @description AI 优化模块内容洞察，负责为 AI 面板提供“先诊断再优化”的模块级提示。
 */

import { ResumeData } from '@/types/resume'
import {
  analyzeWritingSignals,
  inferRecommendedLength,
  resolveLengthState,
  RichTextCoachLocale
} from '@/domain/editor/richTextCoach'

export type OptimizeInsightSection = 'summary' | 'experience' | 'skills' | 'education' | 'projects'
type InsightTone = 'positive' | 'neutral' | 'warning'

export interface OptimizeSectionSignalBadge {
  key: string
  label: string
  value: string
  tone: InsightTone
}

export interface OptimizeSectionChecklistItem {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface OptimizeSectionInsight {
  signalBadges: OptimizeSectionSignalBadge[]
  checklist: OptimizeSectionChecklistItem[]
  shouldEditFirst: boolean
  editorActionLabel: string | null
  primaryGapLabel: string | null
  coachingHint: string
}

/**
 * 生成优化模块洞察
 * 基于当前简历内容密度和结构，为 AI 卡片提供更具体的编辑建议。
 */
export function getOptimizeSectionInsight(
  section: OptimizeInsightSection,
  resumeData: ResumeData,
  locale: RichTextCoachLocale
): OptimizeSectionInsight {
  switch (section) {
    case 'summary':
      return getSummaryInsight(resumeData, locale)
    case 'experience':
      return getExperienceInsight(resumeData, locale)
    case 'skills':
      return getSkillsInsight(resumeData, locale)
    case 'education':
      return getEducationInsight(resumeData, locale)
    case 'projects':
      return getProjectsInsight(resumeData, locale)
    default:
      return {
        signalBadges: [],
        checklist: [],
        shouldEditFirst: false,
        editorActionLabel: null,
        primaryGapLabel: null,
        coachingHint: locale === 'zh' ? '可直接开始优化。' : 'Ready for optimization.'
      }
  }
}

/**
 * 生成简介模块洞察
 * 重点看长度、句子层次和量化结果。
 */
function getSummaryInsight(resumeData: ResumeData, locale: RichTextCoachLocale): OptimizeSectionInsight {
  const text = resumeData.personalInfo.summary?.trim() || ''
  const signals = analyzeWritingSignals(text)
  const lengthRange = inferRecommendedLength(locale === 'zh' ? '个人简介' : 'summary')
  const lengthState = resolveLengthState(text.length, lengthRange)

  if (!text) {
    return {
      signalBadges: [
        createSignalBadge('length', locale === 'zh' ? '字数' : 'Length', '0', 'warning'),
        createSignalBadge('metrics', locale === 'zh' ? '量化结果' : 'Metrics', '0', 'warning'),
        createSignalBadge('sentences', locale === 'zh' ? '句子' : 'Sentences', '0', 'warning')
      ],
      checklist: [
        createChecklistItem('positioning', locale === 'zh' ? '写出岗位定位' : 'Role positioning', false, locale === 'zh' ? '至少补 1 句清晰定位。' : 'Add one clear positioning sentence.'),
        createChecklistItem('metrics', locale === 'zh' ? '补充量化结果' : 'Add metrics', false, locale === 'zh' ? '建议至少 1 条结果数据。' : 'Add at least one measurable outcome.'),
        createChecklistItem('structure', locale === 'zh' ? '形成 2 句以上层次' : 'Use 2+ sentences', false, locale === 'zh' ? '当前还没有可读的层次。' : 'The summary still lacks readable structure.')
      ],
      shouldEditFirst: true,
      editorActionLabel: locale === 'zh' ? '去写简介骨架' : 'Draft the summary first',
      primaryGapLabel: locale === 'zh' ? '定位与价值表达' : 'positioning and value',
      coachingHint: locale === 'zh'
        ? '先写一句岗位定位，再补一句核心结果或项目价值。'
        : 'Start with a clear role positioning sentence, then add one impact line.'
    }
  }

  const primaryGapLabel =
    signals.metricCount === 0
      ? locale === 'zh' ? '量化结果' : 'metrics'
      : lengthState === 'short'
        ? locale === 'zh' ? '场景与价值表达' : 'context and value'
        : signals.sentenceCount <= 1
          ? locale === 'zh' ? '句子层次' : 'sentence structure'
          : null

  return {
    signalBadges: [
      createSignalBadge('length', locale === 'zh' ? '字数' : 'Length', String(text.length), getLengthTone(lengthState)),
      createSignalBadge('metrics', locale === 'zh' ? '量化结果' : 'Metrics', String(signals.metricCount), signals.metricCount > 0 ? 'positive' : 'warning'),
      createSignalBadge('sentences', locale === 'zh' ? '句子' : 'Sentences', String(signals.sentenceCount), signals.sentenceCount >= 2 ? 'positive' : 'neutral')
    ],
    checklist: [
      createChecklistItem(
        'length',
        locale === 'zh' ? '字数落在投递区间' : 'Length within range',
        lengthState === 'ideal',
        locale === 'zh'
          ? `建议 ${lengthRange.min}-${lengthRange.max} 字，当前 ${text.length} 字。`
          : `Recommended ${lengthRange.min}-${lengthRange.max} chars, current ${text.length}.`
      ),
      createChecklistItem(
        'metrics',
        locale === 'zh' ? '包含量化结果' : 'Has measurable result',
        signals.metricCount > 0,
        locale === 'zh'
          ? `当前识别到 ${signals.metricCount} 条量化表达。`
          : `${signals.metricCount} measurable result(s) detected.`
      ),
      createChecklistItem(
        'structure',
        locale === 'zh' ? '句子层次清晰' : 'Clear sentence structure',
        signals.sentenceCount >= 2,
        locale === 'zh'
          ? `当前 ${signals.sentenceCount} 句。`
          : `${signals.sentenceCount} sentence(s) now.`
      )
    ],
    shouldEditFirst: Boolean(primaryGapLabel),
    editorActionLabel: primaryGapLabel
      ? (locale === 'zh' ? `去补${primaryGapLabel}` : `Fix ${primaryGapLabel}`)
      : null,
    primaryGapLabel,
    coachingHint: primaryGapLabel
      ? (locale === 'zh'
          ? '先把定位、结果和关键词写扎实，再让 AI 帮你压缩和润色。'
          : 'Strengthen positioning, outcome, and keywords first, then let AI refine it.')
      : (locale === 'zh'
          ? '结构已基本可用，适合直接生成多个表达版本。'
          : 'The summary is structurally ready for variant generation.')
  }
}

/**
 * 生成工作经历模块洞察
 * 重点看条目数量、量化结果和要点结构。
 */
function getExperienceInsight(resumeData: ResumeData, locale: RichTextCoachLocale): OptimizeSectionInsight {
  const experienceItems = resumeData.experience
  const descriptionLines = experienceItems.flatMap((item) => item.description.filter(Boolean))
  const text = descriptionLines.join('\n')
  const signals = analyzeWritingSignals(text)
  const filledCount = experienceItems.filter((item) => item.description.some((line) => line.trim())).length

  const primaryGapLabel =
    filledCount === 0
      ? locale === 'zh' ? '原始工作要点' : 'experience bullets'
      : signals.metricCount === 0
        ? locale === 'zh' ? '量化结果' : 'metrics'
        : signals.bulletCount < Math.min(filledCount, 3)
          ? locale === 'zh' ? '要点结构' : 'bullet structure'
          : null

  return {
    signalBadges: [
      createSignalBadge('items', locale === 'zh' ? '经历条目' : 'Entries', String(experienceItems.length), experienceItems.length > 0 ? 'positive' : 'warning'),
      createSignalBadge('metrics', locale === 'zh' ? '量化结果' : 'Metrics', String(signals.metricCount), signals.metricCount > 0 ? 'positive' : 'warning'),
      createSignalBadge('bullets', locale === 'zh' ? '要点' : 'Bullets', String(signals.bulletCount), signals.bulletCount >= Math.min(filledCount, 3) && filledCount > 0 ? 'positive' : 'neutral')
    ],
    checklist: [
      createChecklistItem(
        'entries',
        locale === 'zh' ? '至少有 1 段可用经历' : 'At least 1 usable entry',
        filledCount > 0,
        locale === 'zh'
          ? `当前 ${filledCount}/${experienceItems.length} 段经历有描述。`
          : `${filledCount}/${experienceItems.length} entries have descriptions.`
      ),
      createChecklistItem(
        'metrics',
        locale === 'zh' ? '包含结果数据' : 'Has result metrics',
        signals.metricCount > 0,
        locale === 'zh'
          ? `当前识别到 ${signals.metricCount} 条结果数据。`
          : `${signals.metricCount} metric phrase(s) detected.`
      ),
      createChecklistItem(
        'bullets',
        locale === 'zh' ? '要点结构可扫描' : 'Bullet structure is scannable',
        signals.bulletCount >= Math.min(filledCount, 3) && filledCount > 0,
        locale === 'zh'
          ? `当前 ${signals.bulletCount} 条要点。`
          : `${signals.bulletCount} bullet(s) available.`
      )
    ],
    shouldEditFirst: Boolean(primaryGapLabel),
    editorActionLabel: primaryGapLabel
      ? (locale === 'zh' ? `去补${primaryGapLabel}` : `Fix ${primaryGapLabel}`)
      : null,
    primaryGapLabel,
    coachingHint: primaryGapLabel
      ? (locale === 'zh'
          ? '先确保每段经历至少有动作和结果，再交给 AI 做压缩和改写。'
          : 'Make sure each experience has action and outcome first, then let AI refine it.')
      : (locale === 'zh'
          ? '原始经历结构已经够用，适合直接生成候选版本。'
          : 'Experience structure is ready for variant generation.')
  }
}

/**
 * 生成技能模块洞察
 * 重点看技能数量、分类完整度和核心技能优先级。
 */
function getSkillsInsight(resumeData: ResumeData, locale: RichTextCoachLocale): OptimizeSectionInsight {
  const skills = resumeData.skills
  const categoryCount = new Set(skills.map((item) => item.category?.trim()).filter(Boolean)).size
  const strongSkillCount = skills.filter((item) => item.level >= 75).length

  const primaryGapLabel =
    skills.length === 0
      ? locale === 'zh' ? '核心技能' : 'core skills'
      : categoryCount <= 1 && skills.length >= 4
        ? locale === 'zh' ? '技能分类' : 'skill grouping'
        : strongSkillCount < Math.min(skills.length, 3)
          ? locale === 'zh' ? '核心技能优先级' : 'core skill priority'
          : null

  return {
    signalBadges: [
      createSignalBadge('items', locale === 'zh' ? '技能项' : 'Items', String(skills.length), skills.length > 0 ? 'positive' : 'warning'),
      createSignalBadge('categories', locale === 'zh' ? '分类' : 'Categories', String(categoryCount), categoryCount >= 2 ? 'positive' : 'neutral'),
      createSignalBadge('core', locale === 'zh' ? '核心项' : 'Core', String(strongSkillCount), strongSkillCount >= 3 ? 'positive' : 'neutral')
    ],
    checklist: [
      createChecklistItem(
        'count',
        locale === 'zh' ? '核心技能数量够用' : 'Enough core skills',
        skills.length >= 3,
        locale === 'zh'
          ? `当前共 ${skills.length} 项技能。`
          : `${skills.length} skill item(s) now.`
      ),
      createChecklistItem(
        'categories',
        locale === 'zh' ? '分类结构清晰' : 'Grouping is clear',
        categoryCount >= 2 || skills.length < 4,
        locale === 'zh'
          ? `当前 ${categoryCount} 个分类。`
          : `${categoryCount} categor${categoryCount === 1 ? 'y' : 'ies'} now.`
      ),
      createChecklistItem(
        'priority',
        locale === 'zh' ? '核心项优先级明确' : 'Core priorities are visible',
        strongSkillCount >= Math.min(skills.length, 3) && skills.length > 0,
        locale === 'zh'
          ? `当前 ${strongSkillCount} 项高熟练度技能。`
          : `${strongSkillCount} high-level skill(s) detected.`
      )
    ],
    shouldEditFirst: Boolean(primaryGapLabel),
    editorActionLabel: primaryGapLabel
      ? (locale === 'zh' ? `去整理${primaryGapLabel}` : `Fix ${primaryGapLabel}`)
      : null,
    primaryGapLabel,
    coachingHint: primaryGapLabel
      ? (locale === 'zh'
          ? '先把核心技能和分类结构整理清楚，AI 重写后会更像投递版技能区。'
          : 'Clarify the skill hierarchy and grouping first for a stronger rewrite.')
      : (locale === 'zh'
          ? '技能结构已经较清晰，适合直接做岗位导向重排。'
          : 'Skills are structured enough for role-oriented rewriting.')
  }
}

/**
 * 生成教育模块洞察
 * 当前主要用于兼容未来教育优化入口。
 */
function getEducationInsight(resumeData: ResumeData, locale: RichTextCoachLocale): OptimizeSectionInsight {
  const items = resumeData.education
  const filledCount = items.filter((item) => (item.description || '').trim()).length

  return {
    signalBadges: [
      createSignalBadge('items', locale === 'zh' ? '经历条目' : 'Entries', String(items.length), items.length > 0 ? 'positive' : 'warning'),
      createSignalBadge('highlights', locale === 'zh' ? '亮点说明' : 'Highlights', String(filledCount), filledCount > 0 ? 'positive' : 'neutral')
    ],
    checklist: [
      createChecklistItem(
        'entries',
        locale === 'zh' ? '至少有 1 段教育经历' : 'At least 1 entry',
        items.length > 0,
        locale === 'zh'
          ? `当前 ${items.length} 段教育经历。`
          : `${items.length} education entry(ies).`
      ),
      createChecklistItem(
        'detail',
        locale === 'zh' ? '补充课程/成绩亮点' : 'Add coursework or grades',
        filledCount > 0,
        locale === 'zh'
          ? `当前 ${filledCount} 段含说明。`
          : `${filledCount} item(s) include extra detail.`
      )
    ],
    shouldEditFirst: items.length === 0,
    editorActionLabel: items.length === 0 ? (locale === 'zh' ? '去补教育经历' : 'Add education first') : null,
    primaryGapLabel: items.length === 0 ? (locale === 'zh' ? '教育经历' : 'education') : null,
    coachingHint: locale === 'zh'
      ? '教育经历更适合补成绩、课程、奖项后再做优化。'
      : 'Education works best after adding grades, coursework, or awards.'
  }
}

/**
 * 生成项目模块洞察
 * 重点看项目条数、亮点要点和结果表达。
 */
function getProjectsInsight(resumeData: ResumeData, locale: RichTextCoachLocale): OptimizeSectionInsight {
  const projectItems = resumeData.projects
  const text = projectItems
    .flatMap((item) => [item.description, ...item.highlights])
    .filter(Boolean)
    .join('\n')
  const signals = analyzeWritingSignals(text)
  const filledCount = projectItems.filter((item) => item.description.trim() || item.highlights.some((line) => line.trim())).length

  const primaryGapLabel =
    filledCount === 0
      ? locale === 'zh' ? '项目亮点' : 'project highlights'
      : signals.metricCount === 0
        ? locale === 'zh' ? '量化结果' : 'metrics'
        : signals.bulletCount < Math.min(filledCount, 3)
          ? locale === 'zh' ? '亮点要点' : 'highlight bullets'
          : null

  return {
    signalBadges: [
      createSignalBadge('items', locale === 'zh' ? '项目条目' : 'Entries', String(projectItems.length), projectItems.length > 0 ? 'positive' : 'warning'),
      createSignalBadge('metrics', locale === 'zh' ? '量化结果' : 'Metrics', String(signals.metricCount), signals.metricCount > 0 ? 'positive' : 'warning'),
      createSignalBadge('highlights', locale === 'zh' ? '亮点要点' : 'Highlight Bullets', String(signals.bulletCount), signals.bulletCount >= Math.min(filledCount, 3) && filledCount > 0 ? 'positive' : 'neutral')
    ],
    checklist: [
      createChecklistItem(
        'entries',
        locale === 'zh' ? '至少有 1 个可用项目' : 'At least 1 usable project',
        filledCount > 0,
        locale === 'zh'
          ? `当前 ${filledCount}/${projectItems.length} 个项目有内容。`
          : `${filledCount}/${projectItems.length} project(s) have source content.`
      ),
      createChecklistItem(
        'metrics',
        locale === 'zh' ? '包含成果数据' : 'Has measurable outcome',
        signals.metricCount > 0,
        locale === 'zh'
          ? `当前识别到 ${signals.metricCount} 条结果数据。`
          : `${signals.metricCount} measurable result(s) detected.`
      ),
      createChecklistItem(
        'highlights',
        locale === 'zh' ? '亮点结构可扫描' : 'Highlights are scannable',
        signals.bulletCount >= Math.min(filledCount, 3) && filledCount > 0,
        locale === 'zh'
          ? `当前 ${signals.bulletCount} 条亮点要点。`
          : `${signals.bulletCount} highlight bullet(s) detected.`
      )
    ],
    shouldEditFirst: Boolean(primaryGapLabel),
    editorActionLabel: primaryGapLabel
      ? (locale === 'zh' ? `去补${primaryGapLabel}` : `Fix ${primaryGapLabel}`)
      : null,
    primaryGapLabel,
    coachingHint: primaryGapLabel
      ? (locale === 'zh'
          ? '先把背景、动作、结果写实，再让 AI 帮你提炼项目叙事。'
          : 'Ground the project in context, action, and result before rewriting it.')
      : (locale === 'zh'
          ? '项目基础内容已具备，适合直接生成多版项目表达。'
          : 'Projects already have enough source material for multi-variant rewriting.')
  }
}

/**
 * 创建信号徽标
 * 统一模块卡片里的信号展示结构。
 */
function createSignalBadge(
  key: string,
  label: string,
  value: string,
  tone: InsightTone
): OptimizeSectionSignalBadge {
  return { key, label, value, tone }
}

/**
 * 创建诊断清单项
 * 统一预览区、编辑区和 AI 面板的完成项结构。
 */
function createChecklistItem(
  key: string,
  label: string,
  completed: boolean,
  detail: string
): OptimizeSectionChecklistItem {
  return { key, label, completed, detail }
}

/**
 * 映射长度状态到信号色阶
 * 让简介字数状态与其它信号标签保持一致。
 */
function getLengthTone(lengthState: ReturnType<typeof resolveLengthState>): InsightTone {
  if (lengthState === 'ideal') {
    return 'positive'
  }
  if (lengthState === 'short') {
    return 'warning'
  }
  return 'neutral'
}
