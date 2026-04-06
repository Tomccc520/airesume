/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-07
 * 
 * 统一的AI助手面板 - 采用首页简洁现代风格
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ResumeData } from '@/types/resume'
import {
  aiService,
  AIConfigGuidance,
  AIConfigStatus,
  AI_CONFIG_STATUS_EVENT
} from '@/services/aiService'
import {
  AIConfigPrecheckActionId,
  AIConfigPrecheckItem,
  buildAIConfigPrecheck,
  DEFAULT_HOSTED_AI_ENDPOINT,
  getAIConfigPrecheckStatusClass,
  getAIConfigPrecheckStatusLabel,
  getRecommendedAIModelForProvider,
  getPrimaryAIConfigPrecheckItem,
  normalizeCustomEndpointInput
} from '@/domain/ai/configPrecheck'
import {
  getAIValidationCategoryLabel,
  getAIModelSummary,
  getAIProviderSummary,
  getAIWorkbenchFooterLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchTitle,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { aiSuggestionRanker } from '@/services/aiSuggestionRanker'
import { aiQualityChecker, QualityScore } from '@/services/aiQualityChecker'
import { jdMatcherService, JDSuggestion } from '@/services/jdMatcher'
import { AIResumeGenerator } from '@/services/aiResumeGenerator'
import { getOptimizeSectionInsight } from '@/domain/editor/optimizeSectionInsights'

interface UnifiedAIPanelProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  preferredSection?: OptimizeSection | null
  configVersion?: number
  onOpenAIConfig: () => void
  onFocusSection?: (section: OptimizeSection) => void
  onApplySuggestion: (content: string, section: string) => void
  onApplyJDSuggestions: (suggestions: JDSuggestion[]) => void
  onGenerateComplete: (data: Partial<ResumeData>) => void
}

type AIMode = 'optimize' | 'match' | 'generate'
type OptimizeSection = 'summary' | 'experience' | 'skills' | 'education' | 'projects'

interface OptimizeSuggestion {
  content: string
  finalScore: number
  quality: QualityScore
}

interface OptimizeResult {
  section: OptimizeSection
  original: string
  suggestions: OptimizeSuggestion[]
  selectedIndex: number
  applied: boolean
}

interface JDBatchHistoryEntry {
  id: string
  label: string
  appliedKeys: string[]
  revertSuggestions: JDSuggestion[]
}

/**
 * 读取指定模块当前内容
 * 便于将真实简历文本送入 AI 优化
 */
function getSectionContent(resumeData: ResumeData, section: OptimizeSection): string {
  switch (section) {
    case 'summary':
      return resumeData.personalInfo.summary || ''
    case 'experience':
      return resumeData.experience
        .map((item) => `${item.position} @ ${item.company}\n${item.description.join('\n')}`)
        .join('\n\n')
    case 'skills':
      return resumeData.skills.map((item) => `${item.name} (${item.level}%)`).join('\n')
    case 'education':
      return resumeData.education
        .map((item) => `${item.school} ${item.degree} ${item.major}`)
        .join('\n')
    case 'projects':
      return resumeData.projects
        .map((item) => `${item.name}\n${item.description}\n${item.highlights.join('\n')}`)
        .join('\n\n')
    default:
      return ''
  }
}

/**
 * 构建按模块优化的提示词
 * 让返回结果更适配简历编辑器结构
 */
function buildOptimizePrompt(section: OptimizeSection, locale: 'zh' | 'en'): string {
  const isZh = locale === 'zh'
  const promptMap: Record<OptimizeSection, string> = {
    summary: isZh
      ? '请针对个人简介生成4条风格不同、可直接粘贴的优化版本。每条80-140字，强调成果量化与岗位匹配。'
      : 'Generate 4 concise summary variants (80-140 words), emphasizing measurable impact and role fit.',
    experience: isZh
      ? '请优化工作经历描述，输出4个版本。每版3-4条要点，必须包含动作词和可量化结果。'
      : 'Optimize experience with 4 variants. Each should include 3-4 action-oriented bullets with measurable outcomes.',
    skills: isZh
      ? '请重写技能模块，输出4个版本。每版按类别组织，优先展示核心技能并保持简洁。'
      : 'Rewrite skills section in 4 variants. Group by categories and prioritize core skills with concise wording.',
    education: isZh
      ? '请优化教育经历，输出4个版本。强调与岗位相关课程、成绩或奖项。'
      : 'Optimize education section with 4 variants, emphasizing role-relevant coursework, grades, or achievements.',
    projects: isZh
      ? '请优化项目经验，输出4个版本。使用“背景-行动-结果”结构，并突出技术难点和成果。'
      : 'Optimize projects in 4 variants using context-action-result structure, highlighting technical complexity and outcomes.'
  }

  return promptMap[section]
}

/**
 * 根据质量分数返回可视化色阶
 * 让用户快速识别建议质量
 */
function getScoreClass(score: number): string {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200'
  if (score >= 55) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-rose-700 bg-rose-50 border-rose-200'
}

/**
 * 获取内容信号标签样式
 * 统一 AI 优化模块卡片中的信号徽标色阶。
 */
function getInsightBadgeClass(tone: 'positive' | 'neutral' | 'warning'): string {
  if (tone === 'positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-slate-200 bg-white text-slate-600'
}

/**
 * 获取 AI 状态摘要
 * 统一 AI 面板头部、底部和配置引导区的状态文案与摘要信息。
 */
function getAIStatusMeta(aiConfigStatus: AIConfigStatus, locale: 'zh' | 'en') {
  const statusKey = getAIWorkbenchStatusKey(aiConfigStatus)
  const { toneClass } = getAIWorkbenchToneMeta(statusKey)
  const providerSummary = getAIProviderSummary(aiConfigStatus, locale)
  const modelSummary = aiConfigStatus.needsApiKey && !aiConfigStatus.hasApiKey
    ? (locale === 'zh' ? '待补充密钥' : 'API key required')
    : getAIModelSummary(aiConfigStatus.modelName, locale)

  if (statusKey === 'ready') {
      return {
      title: getAIWorkbenchTitle(statusKey, locale),
      description: locale === 'zh'
        ? `${providerSummary} 已连接，可直接继续智能优化、职位匹配与从零生成。`
        : `${providerSummary} is connected. You can continue with optimize, match, and generate.`,
      toneClass,
      providerSummary,
      modelSummary,
      actionLabel: locale === 'zh' ? '重新配置' : 'Reconfigure',
      footerLabel: getAIWorkbenchFooterLabel(statusKey, locale)
    }
  }

  if (statusKey === 'needsValidation') {
    return {
      title: getAIWorkbenchTitle(statusKey, locale),
      description: locale === 'zh'
        ? '配置项已补齐，但还需要完成一次验证后再继续智能优化和从零生成。'
        : 'The setup is complete, but one validation run is still required before optimize and generate.',
      toneClass,
      providerSummary,
      modelSummary,
      actionLabel: locale === 'zh' ? '去验证配置' : 'Validate Config',
      footerLabel: getAIWorkbenchFooterLabel(statusKey, locale)
    }
  }

  if (statusKey === 'needsConfig') {
    return {
      title: getAIWorkbenchTitle(statusKey, locale),
      description: locale === 'zh'
        ? 'JD 匹配仍可直接使用；智能优化和从零生成需要先补齐配置。'
        : 'JD match is available. Optimize and generate still need configuration.',
      toneClass,
      providerSummary,
      modelSummary,
      actionLabel: locale === 'zh' ? '打开配置' : 'Open Config',
      footerLabel: getAIWorkbenchFooterLabel(statusKey, locale)
    }
  }

  return {
    title: getAIWorkbenchTitle(statusKey, locale),
    description: locale === 'zh'
      ? '可通过配置入口重新启用；当前仍可先使用职位匹配功能。'
      : 'You can re-enable it from configuration. JD match is still available.',
    toneClass,
    providerSummary: locale === 'zh' ? '未启用' : 'Disabled',
    modelSummary,
    actionLabel: locale === 'zh' ? '前往配置' : 'Open Config',
    footerLabel: getAIWorkbenchFooterLabel(statusKey, locale)
  }
}

/**
 * 格式化最近验证时间
 * 让 AI 面板直接展示最近一次失败发生在什么时候，避免误判为当前瞬时状态。
 */
function formatValidationTime(value?: string): string {
  if (!value) {
    return '时间未记录'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '时间未记录'
  }

  return date.toLocaleString('zh-CN')
}

/**
 * 生成 AI 配置引导标题
 * 将聚焦字段转换成配置弹窗里更明确的下一步动作描述。
 */
function getAIConfigGuidanceTitle(field: AIConfigGuidance['field'], locale: 'zh' | 'en'): string {
  const titleMap: Record<AIConfigGuidance['field'], { zh: string; en: string }> = {
    provider: { zh: '先确认服务商与启用状态', en: 'Check provider and enabled status' },
    apiKey: { zh: '先补齐 API 密钥', en: 'Complete the API key first' },
    customEndpoint: { zh: '先检查自定义端点', en: 'Review the custom endpoint first' },
    modelName: { zh: '先确认模型选择', en: 'Review the model selection first' }
  }

  return titleMap[field][locale]
}

/**
 * 解析当前应聚焦的 AI 配置字段
 * 根据最近一次验证诊断和当前状态，决定打开配置弹窗后优先落到哪里。
 */
function resolveAIConfigGuidanceField(
  aiConfigStatus: AIConfigStatus,
  latestValidationIssue: AIConfigStatus['lastValidation'] | null
): AIConfigGuidance['field'] {
  if (!aiConfigStatus.isEnabled || !aiConfigStatus.provider) {
    return 'provider'
  }

  if (aiConfigStatus.needsApiKey && !aiConfigStatus.hasApiKey) {
    return 'apiKey'
  }

  if (latestValidationIssue?.provider === 'custom') {
    return 'customEndpoint'
  }

  if (!aiConfigStatus.modelName) {
    return 'modelName'
  }

  return 'provider'
}

/**
 * 构建 AI 配置引导信息
 * 让 AI 面板在不同错误场景下打开配置弹窗时，带着明确的聚焦字段和说明文案进入。
 */
function buildAIConfigGuidance(
  aiConfigStatus: AIConfigStatus,
  latestValidationIssue: AIConfigStatus['lastValidation'] | null,
  locale: 'zh' | 'en',
  fallbackMessage?: string
): AIConfigGuidance {
  const field = resolveAIConfigGuidanceField(aiConfigStatus, latestValidationIssue)
  const description = latestValidationIssue?.diagnostics?.suggestion
    || fallbackMessage
    || (locale === 'zh'
      ? '请先补齐当前 AI 配置，再继续执行智能优化或从零生成。'
      : 'Complete the AI setup first before running optimize or generate.')

  return {
    field,
    title: getAIConfigGuidanceTitle(field, locale),
    description,
    provider: latestValidationIssue?.provider || aiConfigStatus.provider || undefined,
    targetHost: latestValidationIssue?.diagnostics?.targetHost,
    category: latestValidationIssue?.diagnostics?.category,
    createdAt: new Date().toISOString()
  }
}

/**
 * 将预检查项映射到配置字段
 * 让 AI 面板里的“当前卡在哪一项”可以直接打开配置弹窗并聚焦到对应字段。
 */
function mapPrecheckItemToGuidanceField(item: AIConfigPrecheckItem): AIConfigGuidance['field'] {
  switch (item.id) {
    case 'apiKey':
      return 'apiKey'
    case 'endpoint':
      return 'customEndpoint'
    case 'model':
      return 'modelName'
    case 'enabled':
    default:
      return 'provider'
  }
}

/**
 * 判断预检查动作是否支持在 AI 面板内直接执行
 * 仅开放不需要额外输入的轻量修复，避免把面板做成完整配置表单。
 */
function canApplyInlinePrecheckAction(actionId?: AIConfigPrecheckActionId): boolean {
  return actionId === 'enableAI'
    || actionId === 'switchToFree'
    || actionId === 'trimApiKey'
    || actionId === 'restoreCustomEndpoint'
    || actionId === 'normalizeCustomEndpoint'
    || actionId === 'restoreModel'
}

/**
 * 获取预检查动作按钮文案
 * 让 AI 面板里的轻量修复按钮保持简洁、可扫读。
 */
function getInlinePrecheckActionLabel(
  actionId: AIConfigPrecheckActionId,
  locale: 'zh' | 'en'
): string {
  const labelMap: Record<AIConfigPrecheckActionId, { zh: string; en: string }> = {
    enableAI: { zh: '重新启用', en: 'Enable' },
    switchToFree: { zh: '切换免费模型', en: 'Use Free Model' },
    clearApiKey: { zh: '去配置', en: 'Open Config' },
    trimApiKey: { zh: '清理空格', en: 'Trim Key' },
    restoreCustomEndpoint: { zh: '恢复端点', en: 'Restore Endpoint' },
    normalizeCustomEndpoint: { zh: '规范地址', en: 'Normalize Endpoint' },
    restoreModel: { zh: '恢复模型', en: 'Restore Model' }
  }

  return labelMap[actionId][locale]
}

/**
 * 判断错误是否需要引导到配置
 * 将配置、密钥、鉴权、端点类异常统一收敛到配置入口。
 */
function shouldGuideToConfig(message: string): boolean {
  const normalizedMessage = message.toLowerCase()
  return ['配置', 'api', 'key', '密钥', '401', '403', '端点', 'endpoint'].some((keyword) =>
    normalizedMessage.includes(keyword)
  )
}

/**
 * 获取模块名称标签
 * 将内部 section 标识转换成更适合界面展示的中文或英文名称。
 */
function getSectionLabel(section: OptimizeSection | JDSuggestion['section'], locale: 'zh' | 'en'): string {
  const labelMap: Record<OptimizeSection, { zh: string; en: string }> = {
    summary: { zh: '个人简介', en: 'Summary' },
    experience: { zh: '工作经历', en: 'Experience' },
    skills: { zh: '专业技能', en: 'Skills' },
    education: { zh: '教育经历', en: 'Education' },
    projects: { zh: '项目经验', en: 'Projects' }
  }

  return labelMap[section][locale]
}

/**
 * 生成 JD 建议唯一键
 * 用于在局部应用后标记已处理项，避免同一建议重复点击。
 */
function getJDSuggestionKey(suggestion: JDSuggestion, index: number): string {
  return `${suggestion.section}-${index}-${suggestion.suggestedText.slice(0, 32)}`
}

/**
 * 获取优化模块内容摘要
 * 为卡片提供更接近工作台语义的当前内容概况，帮助用户判断先优化哪一块。
 */
function getOptimizeSectionContentSummary(
  section: OptimizeSection,
  resumeData: ResumeData,
  locale: 'zh' | 'en'
): string {
  const isZh = locale === 'zh'

  switch (section) {
    case 'summary': {
      const summaryLength = resumeData.personalInfo.summary?.trim().length ?? 0
      if (summaryLength === 0) {
        return isZh ? '当前未填写个人简介' : 'Summary is currently empty'
      }
      return isZh ? `当前约 ${summaryLength} 字` : `About ${summaryLength} characters`
    }
    case 'experience': {
      const count = resumeData.experience.length
      return isZh ? `当前 ${count} 段工作经历` : `${count} experience item(s)`
    }
    case 'skills': {
      const count = resumeData.skills.length
      return isZh ? `当前 ${count} 项专业技能` : `${count} skill item(s)`
    }
    case 'education': {
      const count = resumeData.education.length
      return isZh ? `当前 ${count} 段教育经历` : `${count} education item(s)`
    }
    case 'projects': {
      const count = resumeData.projects.length
      return isZh ? `当前 ${count} 段项目经验` : `${count} project item(s)`
    }
    default:
      return ''
  }
}

/**
 * 获取优化模块重点提示
 * 将每个模块最值得 AI 发力的方向提炼成短句，降低选择成本。
 */
function getOptimizeSectionFocusHint(section: OptimizeSection, locale: 'zh' | 'en'): string {
  const hintMap: Record<OptimizeSection, { zh: string; en: string }> = {
    summary: {
      zh: '优先强化首句定位、关键词和个人价值表达。',
      en: 'Focus on opening positioning, keywords, and value proposition.'
    },
    experience: {
      zh: '优先量化成果、动作词和业务影响力表达。',
      en: 'Focus on quantified impact, action verbs, and business outcomes.'
    },
    skills: {
      zh: '优先重排技能优先级，并按岗位重新组织结构。',
      en: 'Focus on reprioritizing skills and regrouping them for the target role.'
    },
    education: {
      zh: '优先提炼课程、成绩与岗位相关的教育亮点。',
      en: 'Focus on coursework, grades, and role-relevant education highlights.'
    },
    projects: {
      zh: '优先强化项目背景、关键动作和结果表达。',
      en: 'Focus on project context, key actions, and result-oriented storytelling.'
    }
  }

  return hintMap[section][locale]
}

/**
 * 规范化对比文本
 * 去除多余空白并统一大小写，便于做候选结果的轻量差异分析。
 */
function normalizeComparisonText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * 拆分文本为可对比语义片段
 * 优先按换行和中文/英文标点切分，兼容简历条目和段落文本。
 */
function splitComparisonSegments(text: string): string[] {
  return text
    .split(/[\n。；;！!？?\u2022•]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 4)
}

/**
 * 生成候选结果差异摘要
 * 用于在优化候选卡中提示新增表达和保留信息，降低人工对比成本。
 */
function getSuggestionDiffSummary(original: string, suggestion: string) {
  const originalSegments = splitComparisonSegments(original)
  const suggestionSegments = splitComparisonSegments(suggestion)
  const originalNormalizedSet = new Set(originalSegments.map(normalizeComparisonText))

  const addedSegments = suggestionSegments.filter((segment) => !originalNormalizedSet.has(normalizeComparisonText(segment)))
  const preservedSegments = suggestionSegments.filter((segment) => originalNormalizedSet.has(normalizeComparisonText(segment)))

  return {
    addedSegments: addedSegments.slice(0, 3),
    preservedCount: preservedSegments.length
  }
}

/**
 * 构建 JD 建议回退载荷
 * 将已应用建议还原为原始内容，支持最近一次单条或批量撤销。
 */
function buildJDSuggestionRevertPayload(suggestions: JDSuggestion[]): JDSuggestion[] {
  return suggestions
    .filter((suggestion) => suggestion.originalText && suggestion.originalText.trim())
    .map((suggestion) => ({
      ...suggestion,
      suggestedText: suggestion.originalText!.trim()
    }))
}

/**
 * 统一的AI助手面板 - 首页风格
 */
export default function UnifiedAIPanel({
  isOpen,
  onClose,
  resumeData,
  preferredSection = null,
  configVersion = 0,
  onOpenAIConfig,
  onFocusSection,
  onApplySuggestion,
  onApplyJDSuggestions,
  onGenerateComplete
}: UnifiedAIPanelProps) {
  const { locale } = useLanguage()
  const [activeMode, setActiveMode] = useState<AIMode>('optimize')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSection, setSelectedSection] = useState<OptimizeSection | null>(null)
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  
  // 职位匹配相关状态
  const [jobDescription, setJobDescription] = useState('')
  const [matchResult, setMatchResult] = useState<ReturnType<typeof jdMatcherService.analyzeResume> | null>(null)
  
  // 从零开始相关状态
  const [userInfo, setUserInfo] = useState({
    name: '',
    targetPosition: '',
    experienceLevel: 'mid' as 'junior' | 'mid' | 'senior'
  })
  const [generateApplied, setGenerateApplied] = useState(false)
  const [aiConfigStatus, setAIConfigStatus] = useState<AIConfigStatus>(() => aiService.getConfigStatus())
  const [aiConfigSnapshot, setAIConfigSnapshot] = useState(() => aiService.getConfigSnapshot())
  const [isRevalidatingConfig, setIsRevalidatingConfig] = useState(false)
  const [hasFreshConfigValidationSuccess, setHasFreshConfigValidationSuccess] = useState(false)
  const [historicalValidationIssue, setHistoricalValidationIssue] = useState<AIConfigStatus['lastValidation'] | null>(null)
  const [precheckActionNotice, setPrecheckActionNotice] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)
  const [appliedJDSuggestionKeys, setAppliedJDSuggestionKeys] = useState<string[]>([])
  const [jdApplyHistory, setJdApplyHistory] = useState<JDBatchHistoryEntry[]>([])
  const [showConfigDiagnostics, setShowConfigDiagnostics] = useState(false)
  const aiStatusMeta = useMemo(() => getAIStatusMeta(aiConfigStatus, locale), [aiConfigStatus, locale])
  const latestValidationIssue = useMemo(() => {
    if (aiConfigStatus.lastValidation?.isValid) {
      return null
    }

    return aiConfigStatus.lastValidation || null
  }, [aiConfigStatus.lastValidation])
  const hasValidatedCurrentConfig = Boolean(aiConfigStatus.isConfigured && aiConfigStatus.lastValidation?.isValid)
  const shouldShowBlockingError = Boolean(errorMessage) && !hasValidatedCurrentConfig
  const shouldShowHistoricalValidationInfo = Boolean(historicalValidationIssue && hasValidatedCurrentConfig)
  const aiConfigPrecheckItems = useMemo(() => {
    if (!aiConfigSnapshot) {
      return []
    }

    return buildAIConfigPrecheck(aiConfigSnapshot, {
      locale,
      providerName: aiStatusMeta.providerSummary
    })
  }, [aiConfigSnapshot, aiStatusMeta.providerSummary, locale])
  const primaryPrecheckItem = useMemo(
    () => getPrimaryAIConfigPrecheckItem(aiConfigPrecheckItems),
    [aiConfigPrecheckItems]
  )
  const showFreshModeReadyGuide = hasFreshConfigValidationSuccess && aiConfigStatus.isConfigured
  const hasConfigDiagnostics = Boolean(
    primaryPrecheckItem
    || latestValidationIssue
    || shouldShowHistoricalValidationInfo
    || precheckActionNotice
    || showFreshModeReadyGuide
  )

  /**
   * 刷新 AI 配置状态
   * 配置弹窗保存后同步更新面板头部和底部状态提示。
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const nextStatus = aiService.getConfigStatus()
    setAIConfigStatus(nextStatus)
    setAIConfigSnapshot(aiService.getConfigSnapshot())
    setIsRevalidatingConfig(false)
    setHasFreshConfigValidationSuccess(Boolean(nextStatus.lastValidation?.isValid))
    if (!nextStatus.lastValidation?.isValid) {
      setHistoricalValidationIssue(null)
    }
    if (nextStatus.lastValidation?.isValid) {
      setErrorMessage('')
    }
    setPrecheckActionNotice(null)
  }, [configVersion, isOpen])

  /**
   * 同步配置诊断折叠区的默认展开状态
   * 当前存在阻塞项时自动展开，配置恢复可用后默认收起，减少首屏噪音。
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (primaryPrecheckItem || latestValidationIssue || shouldShowBlockingError) {
      setShowConfigDiagnostics(true)
      return
    }

    setShowConfigDiagnostics(false)
  }, [isOpen, latestValidationIssue, primaryPrecheckItem, shouldShowBlockingError])

  /**
   * 监听 AI 配置状态更新事件
   * 当配置弹窗验证失败或保存成功时，面板在不关闭的情况下也能同步刷新诊断信息。
   */
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return
    }

    const handleStatusUpdate = () => {
      const nextStatus = aiService.getConfigStatus()
      setAIConfigStatus(nextStatus)
      setAIConfigSnapshot(aiService.getConfigSnapshot())

      if (nextStatus.lastValidation?.isValid) {
        if (latestValidationIssue) {
          setHistoricalValidationIssue(latestValidationIssue)
        }
        setHasFreshConfigValidationSuccess(true)
        setErrorMessage('')
        return
      }

      if (!nextStatus.isConfigured || !nextStatus.lastValidation?.isValid) {
        setHasFreshConfigValidationSuccess(false)
      }
    }

    window.addEventListener(AI_CONFIG_STATUS_EVENT, handleStatusUpdate)
    return () => {
      window.removeEventListener(AI_CONFIG_STATUS_EVENT, handleStatusUpdate)
    }
  }, [isOpen, latestValidationIssue])

  /**
   * 根据外部入口预选优化模块
   * 让编辑器内“按模块打开 AI”时直接对齐当前编辑上下文。
   */
  useEffect(() => {
    if (!isOpen || !preferredSection) {
      return
    }
    setActiveMode('optimize')
    setOptimizeResult(null)
    setSelectedSection(preferredSection)
    setErrorMessage('')
  }, [isOpen, preferredSection])

  /**
   * 统一触发 AI 配置入口
   * 在配置缺失或鉴权失败时给出闭环引导
   */
  const openConfigWithHint = (message?: string, guidanceField?: AIConfigGuidance['field']) => {
    if (message) {
      setErrorMessage(message)
    }

    const baseGuidance = buildAIConfigGuidance(aiConfigStatus, latestValidationIssue, locale, message)
    aiService.setConfigGuidance(
      guidanceField
        ? {
            ...baseGuidance,
            field: guidanceField,
            title: getAIConfigGuidanceTitle(guidanceField, locale),
            description: message || baseGuidance.description
          }
        : baseGuidance
    )
    onOpenAIConfig()
  }

  const modes = useMemo(() => [
    {
      id: 'optimize' as AIMode,
      name: locale === 'zh' ? '智能优化' : 'Smart Optimize',
      icon: <Sparkles className="w-4 h-4" />,
      requiresConfig: true
    },
    {
      id: 'match' as AIMode,
      name: locale === 'zh' ? '职位匹配' : 'Job Match',
      icon: <Target className="w-4 h-4" />,
      requiresConfig: false
    }
  ], [locale])

  const sections = useMemo(() => [
    {
      id: 'summary' as OptimizeSection,
      name: locale === 'zh' ? '个人简介' : 'Summary',
      icon: <Sparkles className="w-5 h-5" />,
      desc: locale === 'zh' ? '强化定位与吸引力' : 'Sharpen positioning',
      hasContent: Boolean(resumeData.personalInfo.summary?.trim()),
      contentSummary: getOptimizeSectionContentSummary('summary', resumeData, locale),
      focusHint: getOptimizeSectionFocusHint('summary', locale),
      insight: getOptimizeSectionInsight('summary', resumeData, locale)
    },
    {
      id: 'experience' as OptimizeSection,
      name: locale === 'zh' ? '工作经历' : 'Experience',
      icon: <Zap className="w-5 h-5" />,
      desc: locale === 'zh' ? '突出成果与影响力' : 'Highlight impact',
      hasContent: resumeData.experience.length > 0,
      contentSummary: getOptimizeSectionContentSummary('experience', resumeData, locale),
      focusHint: getOptimizeSectionFocusHint('experience', locale),
      insight: getOptimizeSectionInsight('experience', resumeData, locale)
    },
    {
      id: 'skills' as OptimizeSection,
      name: locale === 'zh' ? '专业技能' : 'Skills',
      icon: <Target className="w-5 h-5" />,
      desc: locale === 'zh' ? '优化技能结构与优先级' : 'Optimize skill hierarchy',
      hasContent: resumeData.skills.length > 0,
      contentSummary: getOptimizeSectionContentSummary('skills', resumeData, locale),
      focusHint: getOptimizeSectionFocusHint('skills', locale),
      insight: getOptimizeSectionInsight('skills', resumeData, locale)
    },
    {
      id: 'projects' as OptimizeSection,
      name: locale === 'zh' ? '项目经验' : 'Projects',
      icon: <Bot className="w-5 h-5" />,
      desc: locale === 'zh' ? '增强项目叙事与亮点' : 'Improve project storytelling',
      hasContent: resumeData.projects.length > 0,
      contentSummary: getOptimizeSectionContentSummary('projects', resumeData, locale),
      focusHint: getOptimizeSectionFocusHint('projects', locale),
      insight: getOptimizeSectionInsight('projects', resumeData, locale)
    }
  ], [locale, resumeData])

  /**
   * 汇总 JD 建议分组
   * 便于提供“按模块应用”入口，并在结果区按模块展示建议数量。
   */
  const jdSuggestionGroups = useMemo(() => {
    if (!matchResult) {
      return []
    }

    const groupMap = new Map<JDSuggestion['section'], JDSuggestion[]>()

    matchResult.suggestions.forEach((suggestion) => {
      const currentGroup = groupMap.get(suggestion.section) || []
      currentGroup.push(suggestion)
      groupMap.set(suggestion.section, currentGroup)
    })

    return Array.from(groupMap.entries()).map(([section, suggestions]) => ({
      section,
      suggestions,
      unappliedSuggestions: suggestions.filter((suggestion) => {
        const globalIndex = matchResult.suggestions.findIndex((item) => item === suggestion && item.section === section)
        return !appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, globalIndex))
      })
    }))
  }, [appliedJDSuggestionKeys, matchResult])

  /**
   * 汇总从零生成表单完整度
   * 用于在提交前提示用户还差哪些关键字段，提高首次生成质量。
   */
  const generateReadiness = useMemo(() => {
    const completedFields = [userInfo.name, userInfo.targetPosition].filter((value) => value.trim()).length + 1
    const missingLabels = [
      !userInfo.name.trim() ? (locale === 'zh' ? '姓名' : 'Name') : null,
      !userInfo.targetPosition.trim() ? (locale === 'zh' ? '目标职位' : 'Target role') : null
    ].filter(Boolean) as string[]

    return {
      completedFields,
      totalFields: 3,
      missingLabels
    }
  }, [locale, userInfo.name, userInfo.targetPosition])

  /**
   * 生成岗位预设
   * 为从零生成提供常见目标岗位快捷填充，减少手动录入成本。
   */
  const generateRolePresets = useMemo(() => (
    locale === 'zh'
      ? ['高级前端工程师', '产品经理', 'UI/UX 设计师', '运营经理']
      : ['Senior Frontend Engineer', 'Product Manager', 'UI/UX Designer', 'Operations Manager']
  ), [locale])

  /**
   * 切换模式并清理局部状态
   * 避免不同功能之间状态互相干扰
   */
  const handleSwitchMode = (mode: AIMode) => {
    setActiveMode(mode)
    setErrorMessage('')
    setIsRevalidatingConfig(false)
    setPrecheckActionNotice(null)
    setIsProcessing(false)
    if (mode !== 'optimize') {
      setOptimizeResult(null)
      setSelectedSection(null)
    }
    if (mode !== 'match') {
      setMatchResult(null)
      setAppliedJDSuggestionKeys([])
      setJdApplyHistory([])
    }
    if (mode !== 'generate') {
      setGenerateApplied(false)
    }
  }

  /**
   * 执行模块优化
   * 调用真实 AI 能力并根据质量排序返回结果
   */
  const handleOptimizeSection = async (section: OptimizeSection) => {
    const currentContent = getSectionContent(resumeData, section).trim()
    if (!currentContent) {
      setErrorMessage(locale === 'zh' ? '请先填写该模块内容，再进行优化。' : 'Please fill this section before optimizing.')
      return
    }

    if (!aiService.isConfigured()) {
      openConfigWithHint(locale === 'zh' ? '请先配置 AI 服务，才能使用智能优化。' : 'Please configure AI service before optimization.')
      return
    }

    setErrorMessage('')
    setIsProcessing(true)
    setSelectedSection(section)
    setOptimizeResult(null)

    try {
      const rawSuggestions = await aiService.generateSuggestions(
        section,
        buildOptimizePrompt(section, locale),
        currentContent
      )

      const rankedItems = aiSuggestionRanker.rankSuggestions(rawSuggestions, section, {
        currentContent
      })
      const topItems = aiSuggestionRanker.getTopSuggestions(rankedItems, 4)

      const suggestions: OptimizeSuggestion[] = topItems.map((item) => {
        const quality = item.qualityScore || aiQualityChecker.evaluateContent(item.content, section)
        return {
          content: item.content,
          finalScore: Math.round(item.finalScore ?? quality.overall),
          quality
        }
      })

      if (suggestions.length === 0) {
        throw new Error(locale === 'zh' ? '未生成有效建议，请重试。' : 'No valid suggestions generated, please retry.')
      }

      setOptimizeResult({
        section,
        original: currentContent,
        suggestions,
        selectedIndex: 0,
        applied: false
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : (locale === 'zh' ? '优化失败，请稍后重试。' : 'Optimization failed, please retry later.')
      setErrorMessage(message)
      if (shouldGuideToConfig(message)) {
        openConfigWithHint(message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * 应用当前选中的优化建议
   * 同步写回编辑器后自动关闭弹层
   */
  const handleApplyOptimizeSuggestion = () => {
    if (!optimizeResult) return
    const selected = optimizeResult.suggestions[optimizeResult.selectedIndex]
    if (!selected) return

    onApplySuggestion(selected.content, optimizeResult.section)
    setOptimizeResult((prev) => (prev ? { ...prev, applied: true } : prev))

    setTimeout(() => {
      onClose()
    }, 1200)
  }

  /**
   * 执行 JD 匹配分析
   * 输出真实匹配分数和结构化建议
   */
  const handleAnalyzeJD = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage(locale === 'zh' ? '请先粘贴职位描述（JD）。' : 'Please paste a job description first.')
      return
    }

    setErrorMessage('')
    setIsProcessing(true)
    setMatchResult(null)
    setAppliedJDSuggestionKeys([])
    setJdApplyHistory([])

    try {
      const keywords = jdMatcherService.extractKeywords(jobDescription)
      const result = jdMatcherService.analyzeResume(resumeData, keywords, jobDescription)
      setMatchResult(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : (locale === 'zh' ? 'JD 分析失败，请重试。' : 'JD analysis failed.')
      setErrorMessage(message)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * 记录 JD 应用历史
   * 仅记录可回退的原始内容，供“撤销最近一次应用”使用。
   */
  const appendJDBatchHistory = (label: string, appliedKeys: string[], suggestions: JDSuggestion[]) => {
    const revertSuggestions = buildJDSuggestionRevertPayload(suggestions)
    if (revertSuggestions.length === 0) {
      return
    }

    setJdApplyHistory((currentHistory) => [
      ...currentHistory,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        appliedKeys,
        revertSuggestions
      }
    ])
  }

  /**
   * 应用一组 JD 建议
   * 统一处理单条、按模块和全部应用，保证状态标记和撤销历史一致。
   */
  const applyJDSuggestionBatch = (suggestions: JDSuggestion[], label: string, appliedKeys: string[]) => {
    if (suggestions.length === 0) {
      return
    }

    if (suggestions.length === 1) {
      onApplySuggestion(suggestions[0].suggestedText, suggestions[0].section)
    } else {
      onApplyJDSuggestions(suggestions)
    }

    setAppliedJDSuggestionKeys((currentKeys) => Array.from(new Set([...currentKeys, ...appliedKeys])))
    appendJDBatchHistory(label, appliedKeys, suggestions)
  }

  /**
   * 应用单条 JD 建议
   * 支持按模块渐进式采纳，减少“一键全改”带来的不确定性。
   */
  const handleApplySingleJDSuggestion = (suggestion: JDSuggestion, index: number) => {
    const suggestionKey = getJDSuggestionKey(suggestion, index)
    applyJDSuggestionBatch(
      [suggestion],
      `${getSectionLabel(suggestion.section, locale)} · ${locale === 'zh' ? '单条建议' : 'Single suggestion'}`,
      [suggestionKey]
    )
  }

  /**
   * 应用指定模块的 JD 建议
   * 让用户可以先集中处理某一个模块，而不必一次性写回全部内容。
   */
  const handleApplyJDSectionSuggestions = (section: JDSuggestion['section']) => {
    if (!matchResult) {
      return
    }

    const sectionSuggestions = matchResult.suggestions
      .map((suggestion, index) => ({ suggestion, index }))
      .filter(({ suggestion, index }) => {
        if (suggestion.section !== section) {
          return false
        }
        return !appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))
      })

    applyJDSuggestionBatch(
      sectionSuggestions.map(({ suggestion }) => suggestion),
      `${getSectionLabel(section, locale)} · ${locale === 'zh' ? '批量应用' : 'Batch apply'}`,
      sectionSuggestions.map(({ suggestion, index }) => getJDSuggestionKey(suggestion, index))
    )
  }

  /**
   * 应用全部 JD 建议
   * 保留原有批量写回能力，并同步更新局部应用状态。
   */
  const handleApplyAllJDSuggestions = () => {
    if (!matchResult) {
      return
    }

    const unappliedSuggestions = matchResult.suggestions
      .map((suggestion, index) => ({ suggestion, index }))
      .filter(({ suggestion, index }) => !appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index)))

    applyJDSuggestionBatch(
      unappliedSuggestions.map(({ suggestion }) => suggestion),
      locale === 'zh' ? '全部 JD 建议' : 'All JD suggestions',
      unappliedSuggestions.map(({ suggestion, index }) => getJDSuggestionKey(suggestion, index))
    )
  }

  /**
   * 撤销最近一次 JD 应用
   * 使用记录的原始内容回写对应模块，形成可逆的闭环体验。
   */
  const handleUndoLastJDBatch = () => {
    const lastBatch = jdApplyHistory[jdApplyHistory.length - 1]
    if (!lastBatch || lastBatch.revertSuggestions.length === 0) {
      return
    }

    onApplyJDSuggestions(lastBatch.revertSuggestions)
    setAppliedJDSuggestionKeys((currentKeys) =>
      currentKeys.filter((key) => !lastBatch.appliedKeys.includes(key))
    )
    setJdApplyHistory((currentHistory) => currentHistory.slice(0, -1))
  }

  /**
   * 从用户最小信息生成整份简历
   * 生成后直接应用到编辑器
   */
  const handleGenerateResume = async () => {
    if (!userInfo.targetPosition.trim()) {
      setErrorMessage(locale === 'zh' ? '请先填写目标职位。' : 'Please provide a target role first.')
      return
    }

    if (!aiService.isConfigured()) {
      openConfigWithHint(locale === 'zh' ? '请先配置 AI 服务，才能生成完整简历。' : 'Please configure AI service before generating.')
      return
    }

    setErrorMessage('')
    setIsProcessing(true)
    setGenerateApplied(false)

    try {
      const experienceMap: Record<typeof userInfo.experienceLevel, string> = {
        junior: locale === 'zh' ? '1-3年' : '1-3 years',
        mid: locale === 'zh' ? '3-5年' : '3-5 years',
        senior: locale === 'zh' ? '5年以上' : '5+ years'
      }

      const generated = await AIResumeGenerator.generateCompleteResume({
        name: userInfo.name || (locale === 'zh' ? '候选人' : 'Candidate'),
        targetPosition: userInfo.targetPosition,
        industry: 'IT',
        experience: experienceMap[userInfo.experienceLevel]
      })

      onGenerateComplete(generated)
      setGenerateApplied(true)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : (locale === 'zh' ? '生成失败，请稍后重试。' : 'Generation failed, please retry.')
      setErrorMessage(message)
      if (shouldGuideToConfig(message)) {
        openConfigWithHint(message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * 在 AI 面板内应用轻量预检查修复动作
   * 优先处理无需额外输入的动作，让用户不打开配置弹窗也能完成常见修复。
   */
  const handleApplyInlinePrecheckAction = async (actionId: AIConfigPrecheckActionId) => {
    const currentConfig = aiService.getConfigSnapshot()

    if (!currentConfig) {
      openConfigWithHint()
      return
    }

    let nextConfig = { ...currentConfig }

    switch (actionId) {
      case 'enableAI':
        nextConfig.enabled = true
        break
      case 'switchToFree':
        nextConfig = {
          ...currentConfig,
          enabled: true,
          provider: 'free',
          apiKey: '',
          customEndpoint: DEFAULT_HOSTED_AI_ENDPOINT,
          modelName: getRecommendedAIModelForProvider('free')
        }
        break
      case 'trimApiKey':
        nextConfig.apiKey = currentConfig.apiKey.trim()
        break
      case 'restoreCustomEndpoint':
        nextConfig = {
          ...currentConfig,
          enabled: true,
          provider: 'custom',
          customEndpoint: DEFAULT_HOSTED_AI_ENDPOINT,
          modelName: currentConfig.modelName || getRecommendedAIModelForProvider('custom')
        }
        break
      case 'normalizeCustomEndpoint':
        nextConfig.customEndpoint = normalizeCustomEndpointInput(currentConfig.customEndpoint) || DEFAULT_HOSTED_AI_ENDPOINT
        break
      case 'restoreModel':
        nextConfig.modelName = getRecommendedAIModelForProvider(currentConfig.provider)
        break
      default:
        openConfigWithHint(undefined, primaryPrecheckItem ? mapPrecheckItemToGuidanceField(primaryPrecheckItem) : undefined)
        return
    }

    const result = aiService.updateConfig(nextConfig)
    setHasFreshConfigValidationSuccess(false)

    if (!result.success) {
      const message = result.error || (locale === 'zh' ? '快速修复失败，请打开配置继续处理。' : 'Quick fix failed. Open configuration to continue.')
      setPrecheckActionNotice({
        tone: 'error',
        message
      })
      setErrorMessage(message)
      return
    }

    const nextStatus = aiService.getConfigStatus()
    const nextSnapshot = aiService.getConfigSnapshot()
    setAIConfigStatus(nextStatus)
    setAIConfigSnapshot(nextSnapshot)
    setErrorMessage('')

    if (!nextStatus.isConfigured || !nextSnapshot) {
      setPrecheckActionNotice({
        tone: 'success',
        message: locale === 'zh'
          ? '已应用快速修复，但当前配置还未完整可用，请继续补齐缺失项。'
          : 'Quick fix applied, but the configuration still needs a few required fields.'
      })
      return
    }

    setIsRevalidatingConfig(true)
    setPrecheckActionNotice({
      tone: 'success',
      message: locale === 'zh'
        ? '已应用快速修复，正在自动重新验证当前配置...'
        : 'Quick fix applied. Revalidating the current configuration automatically...'
    })

    const previousIssue = latestValidationIssue

    try {
      const validationResult = await aiService.validateConfig(nextSnapshot)
      const validatedStatus = aiService.getConfigStatus()
      setAIConfigStatus(validatedStatus)
      setAIConfigSnapshot(aiService.getConfigSnapshot())

      if (validationResult.isValid) {
        setErrorMessage('')
        setHasFreshConfigValidationSuccess(true)
        if (previousIssue) {
          setHistoricalValidationIssue(previousIssue)
        }
        setPrecheckActionNotice({
          tone: 'success',
          message: locale === 'zh'
            ? '已应用快速修复，并自动验证通过。现在可以直接使用智能优化和从零生成。'
            : 'Quick fix applied and validation passed. You can continue with optimize and start-fresh now.'
        })
        return
      }

      setHasFreshConfigValidationSuccess(false)
      setPrecheckActionNotice({
        tone: 'error',
        message: locale === 'zh'
          ? `已应用快速修复，但自动验证仍失败：${validationResult.message}`
          : `Quick fix applied, but automatic validation still failed: ${validationResult.message}`
      })
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (locale === 'zh' ? '自动重新验证失败，请稍后手动重试。' : 'Automatic validation failed. Please retry manually.')

      setHasFreshConfigValidationSuccess(false)
      setPrecheckActionNotice({
        tone: 'error',
        message: locale === 'zh'
          ? `已应用快速修复，但自动验证未完成：${message}`
          : `Quick fix applied, but automatic validation did not complete: ${message}`
      })
    } finally {
      setIsRevalidatingConfig(false)
    }
  }

  /**
   * 在 AI 面板内重新验证当前配置
   * 让用户在完成轻量修复后，不离开面板也能立即确认当前配置是否恢复可用。
   */
  const handleRevalidateCurrentConfig = async () => {
    const currentConfig = aiService.getConfigSnapshot()

    if (!currentConfig) {
      openConfigWithHint()
      return
    }

    setIsRevalidatingConfig(true)
    setPrecheckActionNotice(null)
    const previousIssue = latestValidationIssue

    try {
      const result = await aiService.validateConfig(currentConfig)
      setAIConfigStatus(aiService.getConfigStatus())
      setAIConfigSnapshot(aiService.getConfigSnapshot())

      if (result.isValid) {
        setErrorMessage('')
        setHasFreshConfigValidationSuccess(true)
        if (previousIssue) {
          setHistoricalValidationIssue(previousIssue)
        }
        setPrecheckActionNotice({
          tone: 'success',
          message: locale === 'zh'
            ? '当前配置验证通过，可以继续使用智能优化和从零生成。'
            : 'The current configuration passed validation and is ready to use.'
        })
        return
      }

      setHasFreshConfigValidationSuccess(false)
      setPrecheckActionNotice({
        tone: 'error',
        message: locale === 'zh'
          ? `重新验证失败：${result.message}`
          : `Validation failed: ${result.message}`
      })
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (locale === 'zh' ? '重新验证失败，请稍后重试。' : 'Validation failed, please retry later.')

      setPrecheckActionNotice({
        tone: 'error',
        message
      })
      setHasFreshConfigValidationSuccess(false)
    } finally {
      setIsRevalidatingConfig(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 主面板 - 统一产品风格 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="app-shell-brand-mark h-11 w-11 shrink-0">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {locale === 'zh' ? 'AI 助手' : 'AI Assistant'}
                  </h2>
                  <div className={`app-shell-status-chip ${aiStatusMeta.toneClass}`}>
                    {aiStatusMeta.title}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {locale === 'zh' ? '智能优化你的简历内容与岗位匹配度。' : 'Improve resume content and role alignment with AI.'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === 'zh' ? '首层只保留优化和 JD 匹配，低频工具收进次级入口。' : 'Keep optimize and JD match on the first layer, while lower-frequency tools stay secondary.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSwitchMode(mode.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeMode === mode.id
                    ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                    : hasFreshConfigValidationSuccess && aiConfigStatus.isConfigured && mode.requiresConfig
                      ? 'app-shell-toolbar-button border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'app-shell-toolbar-button border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mode.icon}
                <span>{mode.name}</span>
                {mode.requiresConfig && !aiConfigStatus.isConfigured && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    activeMode === mode.id
                      ? 'bg-white/15 text-white'
                      : 'border border-amber-200 bg-amber-50 text-amber-700'
                  }`}>
                    {locale === 'zh' ? '需配置' : 'Setup'}
                  </span>
                )}
                {mode.requiresConfig && aiConfigStatus.isConfigured && hasFreshConfigValidationSuccess && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    activeMode === mode.id
                      ? 'bg-white/15 text-white'
                      : 'border border-emerald-200 bg-white/80 text-emerald-700'
                  }`}>
                    {locale === 'zh' ? '已可用' : 'Ready'}
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleSwitchMode('generate')}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                activeMode === 'generate'
                  ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                  : 'app-shell-toolbar-button border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>{locale === 'zh' ? '更多 AI 工具' : 'More AI Tools'}</span>
            </button>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-4 ${aiStatusMeta.toneClass}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">
                  {locale === 'zh' ? '配置状态' : 'Configuration'}
                </p>
                <div className="mt-2 text-base font-semibold">{aiStatusMeta.title}</div>
                <div className="mt-1 text-sm leading-6 opacity-90">
                  {locale === 'zh'
                    ? 'JD 匹配可直接使用；智能优化和更多 AI 工具依赖当前配置。'
                    : 'JD match works directly. Smart optimize and extra AI tools depend on the current configuration.'}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-current/10 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {locale === 'zh' ? '服务商：' : 'Provider: '}{aiStatusMeta.providerSummary}
                  </span>
                  <span className="rounded-full border border-current/10 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {locale === 'zh' ? '模型：' : 'Model: '}{aiStatusMeta.modelSummary}
                  </span>
                  {primaryPrecheckItem ? (
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getAIConfigPrecheckStatusClass(primaryPrecheckItem.status)}`}>
                      {locale === 'zh' ? `卡点：${primaryPrecheckItem.title}` : `Blocker: ${primaryPrecheckItem.title}`}
                    </span>
                  ) : null}
                  {showFreshModeReadyGuide ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      {locale === 'zh' ? '已恢复可用' : 'Ready again'}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {primaryPrecheckItem?.actionId && canApplyInlinePrecheckAction(primaryPrecheckItem.actionId) && (
                  <button
                    type="button"
                    onClick={() => void handleApplyInlinePrecheckAction(primaryPrecheckItem.actionId!)}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    {getInlinePrecheckActionLabel(primaryPrecheckItem.actionId, locale)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleRevalidateCurrentConfig()}
                  disabled={isRevalidatingConfig}
                  className="app-shell-action-button h-9 rounded-xl px-3 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRevalidatingConfig ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{locale === 'zh' ? '验证中' : 'Validating'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{locale === 'zh' ? '重新验证' : 'Revalidate'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openConfigWithHint()}
                  className="app-shell-action-button h-9 rounded-xl border-current/10 bg-white/80 px-3 text-xs text-current hover:bg-white"
                >
                  {aiStatusMeta.actionLabel}
                </button>
              </div>
            </div>

            {hasConfigDiagnostics && (
              <div className="mt-4 border-t border-current/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigDiagnostics((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-xl border border-current/10 bg-white/80 px-3 py-2 text-xs font-medium text-current transition-colors hover:bg-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {showConfigDiagnostics
                      ? (locale === 'zh' ? '收起配置与诊断' : 'Hide config diagnostics')
                      : (locale === 'zh' ? '查看配置与诊断' : 'Show config diagnostics')}
                  </span>
                </button>

                {showConfigDiagnostics && (
                  <div className="mt-3 space-y-3 text-slate-700">
                    {precheckActionNotice && (
                      <div className={`rounded-lg border px-3 py-2 text-sm ${
                        precheckActionNotice.tone === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}>
                        {precheckActionNotice.message}
                      </div>
                    )}

                    {showFreshModeReadyGuide && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {locale === 'zh'
                          ? 'AI 配置已经恢复可用。你可以直接进入“智能优化”或“更多 AI 工具”。'
                          : 'AI is ready again. You can go straight to Smart Optimize or More AI Tools.'}
                      </div>
                    )}

                    {aiConfigPrecheckItems.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {aiConfigPrecheckItems.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-current/10 bg-white/80 px-3 py-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-slate-800">{item.title}</p>
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getAIConfigPrecheckStatusClass(item.status)}`}>
                                {getAIConfigPrecheckStatusLabel(item.status, locale)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                            {item.actionId && canApplyInlinePrecheckAction(item.actionId) && (
                              <button
                                type="button"
                                onClick={() => void handleApplyInlinePrecheckAction(item.actionId!)}
                                className="mt-2 app-shell-action-button h-7 rounded-xl px-3 text-[11px]"
                              >
                                {getInlinePrecheckActionLabel(item.actionId, locale)}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {latestValidationIssue && (
                      <div className="rounded-lg border border-current/10 bg-white/85 px-3 py-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">{latestValidationIssue.message}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {getAIValidationCategoryLabel(latestValidationIssue.diagnostics?.category, locale)} · {latestValidationIssue.diagnostics?.targetHost || '/api/ai'} · {formatValidationTime(latestValidationIssue.validatedAt)}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {latestValidationIssue.diagnostics?.suggestion || (locale === 'zh'
                                ? '请检查网络、代理、API 端点和服务商状态后重试。'
                                : 'Check your network, proxy, endpoint, and provider status before retrying.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {shouldShowHistoricalValidationInfo && historicalValidationIssue && (
                      <div className="rounded-lg border border-current/10 bg-white/75 px-3 py-3">
                        <div className="flex items-start gap-2">
                          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {locale === 'zh' ? '上一轮失败诊断仅保留为参考。' : 'Previous failure is kept only as a reference.'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {historicalValidationIssue.message}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {getAIValidationCategoryLabel(historicalValidationIssue.diagnostics?.category, locale)} · {formatValidationTime(historicalValidationIssue.validatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50/80">
          {shouldShowBlockingError && (
            <div className="px-6 pt-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-sm font-semibold text-rose-700">
                        {locale === 'zh' ? '需要先完成 AI 配置' : 'AI setup is required first'}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-rose-700">{errorMessage}</p>
                      {latestValidationIssue && (
                        <p className="mt-2 text-xs leading-5 text-rose-600">
                          {locale === 'zh'
                            ? `最近验证：${getAIValidationCategoryLabel(latestValidationIssue.diagnostics?.category, locale)} / ${latestValidationIssue.diagnostics?.targetHost || '/api/ai'}`
                            : `Latest validation: ${getAIValidationCategoryLabel(latestValidationIssue.diagnostics?.category, locale)} / ${latestValidationIssue.diagnostics?.targetHost || '/api/ai'}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openConfigWithHint(errorMessage)}
                    className="app-shell-action-button h-9 rounded-xl border-rose-200 bg-white px-3 text-xs text-rose-700 hover:bg-white hover:text-rose-800"
                  >
                    {locale === 'zh' ? '前往 AI 配置' : 'Open AI Config'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {/* 智能优化模式 */}
            {activeMode === 'optimize' && (
              <motion.div
                key="optimize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                {!optimizeResult ? (
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      {locale === 'zh'
                        ? '直接选择一个模块开始生成候选版本。建议优先处理工作经历或项目经验。'
                        : 'Select a section and generate variants. Experience and projects usually deliver the biggest gain first.'}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleOptimizeSection(section.id)}
                          disabled={isProcessing}
                          className={`group rounded-xl border bg-white p-4 text-left transition-colors ${
                            selectedSection === section.id
                              ? 'border-slate-900 ring-1 ring-slate-200'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className={`rounded-xl border p-2.5 transition-colors ${
                              selectedSection === section.id && isProcessing
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-slate-300 group-hover:bg-white'
                            }`}>
                              {section.icon}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                section.hasContent
                                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border border-amber-200 bg-amber-50 text-amber-700'
                              }`}>
                                {section.hasContent
                                  ? (locale === 'zh' ? '可直接优化' : 'Ready')
                                  : (locale === 'zh' ? '建议先补内容' : 'Needs content')}
                              </span>
                              {!aiConfigStatus.isConfigured && (
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                  {locale === 'zh' ? '需先配置 AI' : 'Setup Required'}
                                </span>
                              )}
                            </div>
                            {selectedSection === section.id && isProcessing && (
                              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-700" />
                            )}
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-base font-semibold text-slate-900">
                                  {section.name}
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                  {section.desc}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {section.insight.signalBadges.slice(0, 2).map((badge) => (
                                <span
                                  key={`${section.id}-${badge.key}`}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getInsightBadgeClass(badge.tone)}`}
                                >
                                  <span>{badge.label}</span>
                                  <span>{badge.value}</span>
                                </span>
                              ))}
                              {section.insight.primaryGapLabel && (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                  {locale === 'zh'
                                    ? `优先补 ${section.insight.primaryGapLabel}`
                                    : `Fix ${section.insight.primaryGapLabel}`}
                                </span>
                              )}
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {section.insight.shouldEditFirst ? section.insight.coachingHint : section.focusHint}
                            </p>

                            {onFocusSection && section.insight.editorActionLabel && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onFocusSection(section.id)
                                }}
                                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                {section.insight.editorActionLabel}
                              </button>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto"
                  >
                    {!optimizeResult.applied ? (
                      <>
                        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                  {locale === 'zh' ? '候选结果' : 'Generated Variants'}
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                  {locale === 'zh' ? '优化建议已生成' : 'Suggestions Ready'}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {locale === 'zh'
                                    ? '先对比原始内容和候选版本，再把最适合的一版应用到当前模块。'
                                    : 'Compare the original and generated variants, then apply the best one to this section.'}
                                </p>
                              </div>
                              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                  {locale === 'zh' ? '当前模块' : 'Section'}
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                  {getSectionLabel(optimizeResult.section, locale)}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                  {locale === 'zh' ? '候选数量' : 'Variants'}
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                  {locale === 'zh'
                                    ? `${optimizeResult.suggestions.length} 条可选版本`
                                    : `${optimizeResult.suggestions.length} generated options`}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              {locale === 'zh' ? '使用建议' : 'Selection Guide'}
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-900">
                              {locale === 'zh'
                                ? '优先选最贴近真实经历、但表达更清晰的一版。'
                                : 'Choose the option that stays truthful but communicates more clearly.'}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {locale === 'zh'
                                ? '若结果方向不对，可重新生成；已选版本会在下方高亮。'
                                : 'If the direction is off, regenerate. The selected variant stays highlighted below.'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 space-y-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                                {locale === 'zh' ? '原始内容' : 'Original Content'}
                              </div>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                {locale === 'zh' ? '作为对照基线' : 'Baseline'}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {optimizeResult.original}
                            </div>
                          </div>

                          <div className="grid gap-3">
                            {optimizeResult.suggestions.map((item, index) => {
                              const diffSummary = getSuggestionDiffSummary(optimizeResult.original, item.content)

                              return (
                                <button
                                  key={`${index}-${item.content.slice(0, 12)}`}
                                  type="button"
                                  onClick={() => {
                                    setOptimizeResult((prev) => prev ? { ...prev, selectedIndex: index } : prev)
                                  }}
                                  className={`rounded-xl border bg-white p-4 text-left transition-colors ${
                                    optimizeResult.selectedIndex === index
                                      ? 'border-slate-900 ring-1 ring-slate-200'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                                          {locale === 'zh' ? `候选版本 ${index + 1}` : `Variant ${index + 1}`}
                                        </span>
                                        {optimizeResult.selectedIndex === index && (
                                          <span className="rounded-full border border-slate-900 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                                            {locale === 'zh' ? '当前已选' : 'Selected'}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-500">
                                        {locale === 'zh'
                                          ? '点击可切换为当前准备应用的版本'
                                          : 'Click to set this as the version to apply.'}
                                      </p>
                                    </div>
                                    <div className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${getScoreClass(item.finalScore)}`}>
                                      {locale === 'zh' ? `质量 ${item.finalScore}` : `Score ${item.finalScore}`}
                                    </div>
                                  </div>
                                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                                    {item.content}
                                  </div>
                                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                        {locale === 'zh' ? '新增表达' : 'New Phrases'}
                                      </span>
                                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                        {locale === 'zh'
                                          ? `保留信息 ${diffSummary.preservedCount} 处`
                                          : `${diffSummary.preservedCount} preserved`}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {diffSummary.addedSegments.length > 0 ? (
                                        diffSummary.addedSegments.map((segment) => (
                                          <span
                                            key={`${index}-${segment}`}
                                            className="rounded-md border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] leading-5 text-sky-700"
                                          >
                                            {segment}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[11px] text-slate-500">
                                          {locale === 'zh'
                                            ? '当前候选主要是在原内容基础上做顺序和表达优化。'
                                            : 'This variant mainly refines the original phrasing and structure.'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {item.quality.issues.length > 0 && (
                                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-6 text-amber-700">
                                      {locale === 'zh' ? `可继续打磨：${item.quality.issues[0]}` : `Further improve: ${item.quality.issues[0]}`}
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleApplyOptimizeSuggestion}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>{locale === 'zh' ? '应用当前版本' : 'Apply Selected'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (optimizeResult) {
                                handleOptimizeSection(optimizeResult.section)
                              }
                            }}
                            disabled={isProcessing}
                            className="app-shell-action-button h-11 rounded-xl px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {locale === 'zh' ? '重新生成' : 'Regenerate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOptimizeResult(null)
                              setSelectedSection(null)
                            }}
                            className="app-shell-action-button h-11 rounded-xl px-5 text-sm"
                          >
                            {locale === 'zh' ? '返回选择' : 'Back'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-xl py-8"
                      >
                        <div className="rounded-xl border border-emerald-200 bg-white p-6 text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600"
                          >
                            <CheckCircle className="h-8 w-8" />
                          </motion.div>
                          <h3 className="text-2xl font-semibold text-slate-900">
                            {locale === 'zh' ? '已应用到简历' : 'Applied to Resume'}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {locale === 'zh' ? '当前建议已写入编辑器，面板会自动收起。' : 'The selected suggestion has been applied and the panel will close automatically.'}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                            <span>{locale === 'zh' ? '完成' : 'Done'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* 职位匹配模式 */}
            {activeMode === 'match' && (
              <motion.div
                key="match"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    {locale === 'zh'
                      ? '粘贴完整 JD 后即可查看匹配度、缺失关键词和可直接应用的模块建议。'
                      : 'Paste a complete JD to review fit, missing keywords, and section suggestions you can apply directly.'}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      {locale === 'zh' ? '粘贴职位描述（JD）' : 'Paste Job Description'}
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={locale === 'zh' ? '粘贴目标职位描述后，获取真实匹配度与优化建议...' : 'Paste your target JD for real matching...'}
                      className="h-44 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {locale === 'zh'
                        ? '支持粘贴整段 JD 文本，系统会自动提取关键词、缺失项和优化建议。'
                        : 'Paste the full JD text and the system will extract keywords, gaps, and suggestions automatically.'}
                    </p>
                  </div>

                  {matchResult && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              {locale === 'zh' ? '匹配分析' : 'Match Analysis'}
                            </p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-900">
                              {locale === 'zh' ? '匹配度分析结果' : 'Match Analysis'}
                            </h4>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {locale === 'zh'
                                ? `命中关键词 ${matchResult.matchedKeywords.length} 个，缺失 ${matchResult.missingKeywords.length} 个`
                                : `${matchResult.matchedKeywords.length} matched, ${matchResult.missingKeywords.length} missing keywords`}
                            </p>
                          </div>
                          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 text-white">
                            <div className="text-center">
                              <div className="text-3xl font-bold">{matchResult.score}</div>
                              <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-slate-300">
                                {locale === 'zh' ? '匹配度' : 'Score'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              {locale === 'zh' ? '命中关键词' : 'Matched'}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {matchResult.matchedKeywords.length}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              {locale === 'zh' ? '缺失关键词' : 'Missing'}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {matchResult.missingKeywords.length}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              {locale === 'zh' ? '建议条数' : 'Suggestions'}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {matchResult.suggestions.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      {matchResult.missingKeywords.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="mb-2 text-sm font-semibold text-slate-900">
                            {locale === 'zh' ? '缺失关键词' : 'Missing Keywords'}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.missingKeywords.slice(0, 16).map((keyword) => (
                              <span
                                key={keyword}
                                className="px-2 py-1 rounded-lg text-xs border border-amber-200 bg-amber-50 text-amber-700"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchResult.suggestions.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {locale === 'zh' ? 'AI 建议（可一键应用）' : 'Suggestions (one-click apply)'}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {locale === 'zh'
                                  ? '可按模块单独应用，也可以一次性全部写回。'
                                  : 'Apply each suggestion by section or write all suggestions back at once.'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleApplyAllJDSuggestions}
                              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                            >
                              {locale === 'zh' ? '一键应用全部建议' : 'Apply All Suggestions'}
                            </button>
                          </div>
                          {jdSuggestionGroups.length > 0 && (
                            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                    {locale === 'zh' ? '按模块批量处理' : 'Apply by Section'}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {locale === 'zh'
                                      ? '先处理最关键的模块，再决定是否全部写回。'
                                      : 'Apply the most important section first, then decide whether to apply everything.'}
                                  </p>
                                </div>
                                {jdApplyHistory.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={handleUndoLastJDBatch}
                                    className="app-shell-action-button h-9 rounded-xl px-3 text-xs"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>{locale === 'zh' ? '撤销上一步' : 'Undo Last Apply'}</span>
                                  </button>
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {jdSuggestionGroups.map((group) => (
                                  <button
                                    key={group.section}
                                    type="button"
                                    onClick={() => handleApplyJDSectionSuggestions(group.section)}
                                    disabled={group.unappliedSuggestions.length === 0}
                                    className="app-shell-action-button h-9 rounded-xl px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span>{getSectionLabel(group.section, locale)}</span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
                                      {locale === 'zh'
                                        ? `待应用 ${group.unappliedSuggestions.length}`
                                        : `${group.unappliedSuggestions.length} left`}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              {jdApplyHistory.length > 0 && (
                                <p className="mt-3 text-xs leading-5 text-slate-500">
                                  {locale === 'zh'
                                    ? `最近一次应用：${jdApplyHistory[jdApplyHistory.length - 1].label}`
                                    : `Last applied: ${jdApplyHistory[jdApplyHistory.length - 1].label}`}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="space-y-2.5">
                            {matchResult.suggestions.map((suggestion, index) => (
                              <div key={`${suggestion.section}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                                      {getSectionLabel(suggestion.section, locale)}
                                    </div>
                                    <div className="text-xs leading-5 text-slate-500">
                                      {suggestion.reason}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplySingleJDSuggestion(suggestion, index)}
                                    disabled={appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))}
                                    className={`inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium transition-colors ${
                                      appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))
                                        ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'app-shell-action-button text-xs'
                                    }`}
                                  >
                                    {appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))
                                      ? (locale === 'zh' ? '已应用' : 'Applied')
                                      : (locale === 'zh' ? '应用到该模块' : 'Apply to Section')}
                                  </button>
                                </div>
                                {suggestion.originalText && (
                                  <div className="mb-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                    <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                      {locale === 'zh' ? '当前内容' : 'Current Content'}
                                    </div>
                                    <div className="text-xs leading-6 text-slate-600">
                                      {suggestion.originalText}
                                    </div>
                                  </div>
                                )}
                                <div className="text-sm leading-7 text-slate-800">{suggestion.suggestedText}</div>
                                {suggestion.keywords.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {suggestion.keywords.slice(0, 6).map((keyword) => (
                                      <span
                                        key={`${suggestion.section}-${keyword}`}
                                        className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-[11px] text-sky-700"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyzeJD}
                    disabled={!jobDescription.trim() || isProcessing}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                    <span>{locale === 'zh' ? '开始分析匹配度' : 'Analyze Match'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 从零开始模式 */}
            {activeMode === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    {locale === 'zh'
                      ? '填写目标职位和经验段位后即可生成第一版草稿，后续再回编辑器继续补真实项目和成果。'
                      : 'Fill in the target role and experience level to generate the first draft, then return to the editor for real projects and outcomes.'}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          {locale === 'zh' ? '姓名' : 'Name'}
                        </label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                          placeholder={locale === 'zh' ? '例如：张三' : 'e.g. Alex'}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          {locale === 'zh' ? '目标职位' : 'Target Position'}
                        </label>
                        <input
                          type="text"
                          value={userInfo.targetPosition}
                          onChange={(e) => setUserInfo({ ...userInfo, targetPosition: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                          placeholder={locale === 'zh' ? '例如：高级前端工程师' : 'e.g. Senior Frontend Engineer'}
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          {generateRolePresets.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setUserInfo((currentInfo) => ({ ...currentInfo, targetPosition: role }))}
                              className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          {locale === 'zh' ? '工作经验' : 'Experience'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'junior', label: locale === 'zh' ? '1-3年' : '1-3 yrs' },
                            { value: 'mid', label: locale === 'zh' ? '3-5年' : '3-5 yrs' },
                            { value: 'senior', label: locale === 'zh' ? '5年+' : '5+ yrs' }
                          ].map((level) => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => setUserInfo({ ...userInfo, experienceLevel: level.value as typeof userInfo.experienceLevel })}
                              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                userInfo.experienceLevel === level.value
                                  ? 'bg-slate-900 text-white'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          {locale === 'zh' ? '填写完整度' : 'Input Readiness'}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {locale === 'zh'
                            ? `已完成 ${generateReadiness.completedFields}/${generateReadiness.totalFields} 项`
                            : `${generateReadiness.completedFields}/${generateReadiness.totalFields} required inputs ready`}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {locale === 'zh' ? '经验段位已计入' : 'Experience included'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {generateReadiness.missingLabels.length > 0
                        ? (locale === 'zh'
                          ? `建议补全：${generateReadiness.missingLabels.join('、')}，生成内容会更准确。`
                          : `Recommended to complete: ${generateReadiness.missingLabels.join(', ')} for a stronger draft.`)
                        : (locale === 'zh'
                          ? '基础信息已经够用，可以直接生成第一版完整简历。'
                          : 'Your core inputs are ready. You can generate the first full draft now.')}
                    </p>
                  </div>

                  {!generateApplied ? (
                    <>
                      {!aiConfigStatus.isConfigured && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          {locale === 'zh'
                            ? '从零生成需要先配置 AI。配置完成后会保留你已填写的目标职位和经验段位。'
                          : 'Start-fresh generation needs AI configuration first. Your current inputs will be kept.'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateResume}
                        disabled={!userInfo.targetPosition.trim() || isProcessing}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span>
                          {!aiConfigStatus.isConfigured
                            ? (locale === 'zh' ? '先配置 AI 后生成' : 'Configure AI First')
                            : (locale === 'zh' ? '开始生成完整简历' : 'Generate Resume')}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>{locale === 'zh' ? '已应用生成结果，正在返回编辑器。' : 'Generated content applied. Returning to editor.'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部信息 */}
        <div className="flex-none border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-500">
              <div className={`h-1.5 w-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span>
                {isProcessing
                  ? (locale === 'zh' ? 'AI 正在处理中...' : 'AI processing...')
                  : aiStatusMeta.footerLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openConfigWithHint()}
                className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
              >
                {locale === 'zh' ? 'AI 配置' : 'AI Config'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
