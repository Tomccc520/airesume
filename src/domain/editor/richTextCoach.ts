/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 *
 * @description 富文本写作辅导工具，负责长度判断、质量检查、写作信号分析与快捷动作生成。
 */

export interface ContentSnippet {
  label: string
  content: string
}

export type RichTextCoachLocale = 'zh' | 'en'
export type LengthState = 'short' | 'ideal' | 'long'
export type WritingQuickActionKey = 'addMetric' | 'insertStar' | 'splitBullets' | 'addResultLine'

export interface QualityCheckResult {
  score: number
  suggestions: string[]
}

export interface WritingSignalSnapshot {
  charCount: number
  lineCount: number
  bulletCount: number
  metricCount: number
  sentenceCount: number
}

export interface WritingQuickAction {
  key: WritingQuickActionKey
  label: string
  description: string
}

const BULLET_LINE_PATTERN = /^\s*(?:[-*•]|\d+\.)\s+/
const METRIC_PATTERN = /\d+(?:\.\d+)?\s*(?:%|倍|次|人|个|家|天|周|月|年|小时|分钟|ms|s|k|w|万)/gi

/**
 * 推断推荐长度
 * 根据字段标签和占位提示给出默认长度区间。
 */
export function inferRecommendedLength(label?: string, placeholder?: string): { min: number; max: number } {
  const hint = `${label || ''} ${placeholder || ''}`.toLowerCase()
  if (hint.includes('summary') || hint.includes('简介') || hint.includes('自我')) {
    return { min: 80, max: 240 }
  }
  if (hint.includes('highlight') || hint.includes('亮点')) {
    return { min: 40, max: 180 }
  }
  if (hint.includes('description') || hint.includes('描述') || hint.includes('内容')) {
    return { min: 60, max: 300 }
  }
  return { min: 30, max: 220 }
}

/**
 * 分析长度状态
 * 将当前字数映射为偏短、合适或偏长。
 */
export function resolveLengthState(length: number, range: { min: number; max: number }): LengthState {
  if (length < range.min) return 'short'
  if (length > range.max) return 'long'
  return 'ideal'
}

/**
 * 生成默认快捷片段
 * 在表单未传入自定义片段时，提供可直接改写的内容模板。
 */
export function buildDefaultSnippets(locale: RichTextCoachLocale, label?: string): ContentSnippet[] {
  const hint = (label || '').toLowerCase()

  if (hint.includes('简介') || hint.includes('summary')) {
    if (locale === 'zh') {
      return [
        {
          label: '结果导向模板',
          content:
            '5年产品与增长经验，主导多个核心项目从0到1落地。擅长将业务目标拆解为可执行方案，通过数据分析与跨团队协作持续优化转化效率。'
        },
        {
          label: '技术岗位模板',
          content:
            '专注前端工程化与性能优化，熟悉 React / TypeScript / Next.js 技术栈。具备复杂业务系统设计经验，能够在高迭代节奏下稳定交付。'
        },
        {
          label: '管理协作模板',
          content:
            '具备跨部门项目推进经验，擅长梳理流程、明确目标和资源协调。重视团队协作与持续改进，能够推动复杂任务按期达成。'
        }
      ]
    }

    return [
      {
        label: 'Impact-focused',
        content:
          'Experienced in driving complex initiatives from planning to delivery, with a strong focus on measurable business outcomes and cross-functional execution.'
      },
      {
        label: 'Technical profile',
        content:
          'Skilled in modern web engineering with strong ownership of architecture, performance optimization, and scalable delivery under tight timelines.'
      },
      {
        label: 'Collaboration profile',
        content:
          'Strong communicator and team player who translates goals into actionable plans, aligns stakeholders, and improves execution efficiency continuously.'
      }
    ]
  }

  if (locale === 'zh') {
    return [
      {
        label: 'STAR 成果句式',
        content: '负责 [场景]，通过 [行动]，在 [时间] 内实现 [量化结果]。'
      },
      {
        label: '项目亮点句式',
        content: '主导 [模块] 设计与落地，覆盖 [范围]，将 [核心指标] 提升 [数值]。'
      }
    ]
  }

  return [
    {
      label: 'STAR sentence',
      content: 'Handled [context], implemented [action], and improved [metric] by [number] within [timeframe].'
    },
    {
      label: 'Project impact',
      content: 'Led [module] delivery, covering [scope], and increased [core metric] by [number].'
    }
  ]
}

/**
 * 分析写作信号
 * 用于生成编辑提示和一键优化动作。
 */
export function analyzeWritingSignals(text: string): WritingSignalSnapshot {
  const trimmed = text.trim()
  if (!trimmed) {
    return {
      charCount: 0,
      lineCount: 0,
      bulletCount: 0,
      metricCount: 0,
      sentenceCount: 0
    }
  }

  const lines = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const bulletCount = lines.filter((line) => BULLET_LINE_PATTERN.test(line)).length
  const sentenceCount = extractSentenceSegments(trimmed).length
  const metricCount = (trimmed.match(METRIC_PATTERN) || []).length

  return {
    charCount: trimmed.length,
    lineCount: lines.length,
    bulletCount,
    metricCount,
    sentenceCount
  }
}

/**
 * 内容质量检查
 * 结合字数、量化结果和结构密度给出更直接的编辑建议。
 */
export function evaluateContentQuality(
  text: string,
  lengthState: LengthState,
  locale: RichTextCoachLocale
): QualityCheckResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return {
      score: 0,
      suggestions: [locale === 'zh' ? '内容为空，建议先写 1-2 句核心价值。' : 'Content is empty. Start with 1-2 key value statements.']
    }
  }

  const signals = analyzeWritingSignals(trimmed)
  const hasRepeatedPunctuation = /(。{2,}|！{2,}|？{2,}|\.{3,}|!{3,}|\?{3,})/.test(trimmed)
  let score = 100
  const suggestions: string[] = []

  if (lengthState === 'short') {
    score -= 22
    suggestions.push(locale === 'zh' ? '内容偏短，建议补充职责场景和结果数据。' : 'Text is short. Add context, action, and measurable outcomes.')
  }

  if (lengthState === 'long') {
    score -= 18
    suggestions.push(locale === 'zh' ? '内容偏长，建议拆成 2-4 条要点并保留关键数据。' : 'Text is long. Split into 2-4 concise points and keep key metrics.')
  }

  if (signals.metricCount === 0) {
    score -= 12
    suggestions.push(locale === 'zh' ? '建议加入量化结果（如提升 xx%、节省 xx 小时）。' : 'Add measurable outcomes (e.g. +xx%, reduced xx hours).')
  }

  if (signals.bulletCount === 0 && signals.lineCount <= 1 && signals.charCount >= 36) {
    score -= 8
    suggestions.push(locale === 'zh' ? '当前是一整段描述，建议拆成 2-4 条要点更利于招聘方快速扫描。' : 'This is a single paragraph. Split it into 2-4 bullets for easier scanning.')
  }

  if (hasRepeatedPunctuation) {
    score -= 10
    suggestions.push(locale === 'zh' ? '检测到重复标点，建议精简语气。' : 'Repeated punctuation detected. Consider a cleaner professional tone.')
  }

  if (signals.lineCount >= 5) {
    score -= 8
    suggestions.push(locale === 'zh' ? '行数较多，建议优先保留最能体现竞争力的 3-4 条。' : 'Too many lines. Keep the top 3-4 most competitive points.')
  }

  return {
    score: Math.max(0, score),
    suggestions
  }
}

/**
 * 生成快捷写作动作
 * 根据当前文本结构决定优先推荐的编辑动作。
 */
export function resolveWritingQuickActions(
  text: string,
  locale: RichTextCoachLocale,
  lengthState: LengthState
): WritingQuickAction[] {
  const signals = analyzeWritingSignals(text)
  const actions: WritingQuickAction[] = []

  /**
   * 添加快捷动作
   * 防止同一个动作重复进入推荐列表。
   */
  const pushAction = (
    key: WritingQuickActionKey,
    zhLabel: string,
    enLabel: string,
    zhDescription: string,
    enDescription: string
  ) => {
    if (actions.some((item) => item.key === key)) return
    actions.push({
      key,
      label: locale === 'zh' ? zhLabel : enLabel,
      description: locale === 'zh' ? zhDescription : enDescription
    })
  }

  if (!text.trim()) {
    pushAction(
      'insertStar',
      '插入 STAR 模板',
      'Insert STAR Template',
      '先搭出场景、动作、结果骨架，再替换成真实经历。',
      'Start with context, action, and result placeholders.'
    )
    pushAction(
      'addMetric',
      '补充量化结果',
      'Add Metric Line',
      '先补一条结果句，后面再替换成真实指标。',
      'Add one quantified result sentence, then replace it with your real metric.'
    )
    return actions
  }

  if (signals.bulletCount === 0 && signals.lineCount <= 1 && signals.charCount >= 36) {
    pushAction(
      'splitBullets',
      '拆成要点',
      'Split into Bullets',
      '把整段内容拆成 2-4 条，更适合招聘方快速扫描。',
      'Break the paragraph into 2-4 bullets for easier scanning.'
    )
  }

  if (signals.metricCount === 0) {
    pushAction(
      'addMetric',
      '补充量化结果',
      'Add Metric Line',
      '补一条可量化结果句，让内容更像投递版简历。',
      'Add one measurable impact line to make it hiring-ready.'
    )
  }

  if (lengthState === 'short' || signals.sentenceCount <= 1) {
    pushAction(
      'insertStar',
      '插入 STAR 模板',
      'Insert STAR Template',
      '补齐场景、动作、结果三个信息位，避免只写结论。',
      'Fill in context, action, and result so the content is not too thin.'
    )
  }

  if (actions.length === 0) {
    pushAction(
      'addResultLine',
      '补一条结果句',
      'Add Result Line',
      '继续补一条结果或协作价值，增强竞争力。',
      'Add one more outcome-oriented line to strengthen the entry.'
    )
  }

  return actions.slice(0, 3)
}

/**
 * 应用快捷写作动作
 * 返回处理后的文本，供编辑器直接回写。
 */
export function applyWritingQuickAction(
  text: string,
  actionKey: WritingQuickActionKey,
  locale: RichTextCoachLocale
): string {
  switch (actionKey) {
    case 'addMetric':
      return appendBlock(text, buildMetricTemplate(locale))
    case 'insertStar':
      return appendBlock(text, buildStarTemplate(locale))
    case 'splitBullets':
      return convertToBulletPoints(text)
    case 'addResultLine':
      return appendBlock(text, buildResultLineTemplate(locale))
    default:
      return text
  }
}

/**
 * 提取句子片段
 * 用于统计句子数量和拆分要点。
 */
function extractSentenceSegments(text: string): string[] {
  return text
    .replace(/[。！？!?；;]+/g, (match) => `${match}\n`)
    .split('\n')
    .map((segment) => segment.trim())
    .filter(Boolean)
}

/**
 * 在原文本后追加一个内容块
 * 自动处理换行，避免插入后粘连在原文末尾。
 */
function appendBlock(text: string, block: string): string {
  const trimmed = text.trimEnd()
  if (!trimmed) {
    return block
  }
  return `${trimmed}\n${block}`
}

/**
 * 构建量化结果模板
 * 统一输出适合简历投递场景的结果句。
 */
function buildMetricTemplate(locale: RichTextCoachLocale): string {
  if (locale === 'zh') {
    return '• 结果：通过 [动作/方案]，将 [核心指标] 提升 [xx%]，并在 [时间] 内完成 [目标]。'
  }
  return '• Result: Improved [core metric] by [xx%] through [action/solution] and delivered [goal] within [timeframe].'
}

/**
 * 构建 STAR 模板
 * 为用户快速搭出场景、动作、结果三段结构。
 */
function buildStarTemplate(locale: RichTextCoachLocale): string {
  if (locale === 'zh') {
    return [
      '• 场景：负责 [业务/项目场景]，承接 [目标]。',
      '• 动作：通过 [方案/协作方式] 推动落地。',
      '• 结果：在 [时间] 内将 [指标] 提升 [数值]。'
    ].join('\n')
  }

  return [
    '• Situation: Took ownership of [project or business context] with [goal].',
    '• Action: Delivered through [solution or collaboration approach].',
    '• Result: Improved [metric] by [value] within [timeframe].'
  ].join('\n')
}

/**
 * 构建补充结果句模板
 * 用于已有内容较完整时继续补一条结果导向表述。
 */
function buildResultLineTemplate(locale: RichTextCoachLocale): string {
  if (locale === 'zh') {
    return '• 补充结果：沉淀 [方法/流程]，持续改善 [效率/质量指标]，提升团队整体交付稳定性。'
  }
  return '• Additional impact: Standardized [process/method], improving [efficiency/quality metric] and delivery stability.'
}

/**
 * 将长段内容转换为要点
 * 优先按句号和分号拆分，必要时再按逗号做兜底切分。
 */
function convertToBulletPoints(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) {
    return text
  }

  const lines = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.every((line) => BULLET_LINE_PATTERN.test(line))) {
    return lines.join('\n')
  }

  let segments = extractSentenceSegments(trimmed).map(stripListPrefix)

  if (segments.length <= 1 && trimmed.length >= 36) {
    segments = trimmed
      .split(/[，,、]/)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length >= 8)
      .slice(0, 4)
  }

  if (segments.length === 0) {
    return `• ${stripListPrefix(trimmed)}`
  }

  if (segments.length === 1) {
    return `• ${segments[0]}`
  }

  return segments.slice(0, 4).map((segment) => `• ${segment}`).join('\n')
}

/**
 * 去除列表前缀
 * 让拆分后的要点保持干净，不叠加项目符号。
 */
function stripListPrefix(text: string): string {
  return text.replace(BULLET_LINE_PATTERN, '').trim()
}
