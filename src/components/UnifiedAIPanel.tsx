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
  Sparkles,
  Target,
  Wand2,
  X,
  Zap
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ResumeData } from '@/types/resume'
import { aiService, AIConfigStatus } from '@/services/aiService'
import { aiSuggestionRanker } from '@/services/aiSuggestionRanker'
import { aiQualityChecker, QualityScore } from '@/services/aiQualityChecker'
import { jdMatcherService, JDSuggestion } from '@/services/jdMatcher'
import { AIResumeGenerator } from '@/services/aiResumeGenerator'

interface UnifiedAIPanelProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  preferredSection?: OptimizeSection | null
  configVersion?: number
  onOpenAIConfig: () => void
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
 * 获取 AI 提供商显示名称
 * 将内部 provider 标识转换成更适合界面展示的短名称。
 */
function getProviderLabel(provider: AIConfigStatus['provider'], locale: 'zh' | 'en'): string {
  const providerLabelMap: Record<NonNullable<AIConfigStatus['provider']>, string> = {
    free: locale === 'zh' ? '免费模型' : 'Free Model',
    siliconflow: 'SiliconFlow',
    deepseek: 'DeepSeek',
    custom: locale === 'zh' ? '自定义接口' : 'Custom API'
  }

  if (!provider) {
    return locale === 'zh' ? '未配置' : 'Not Configured'
  }

  return providerLabelMap[provider]
}

/**
 * 压缩模型名称展示
 * 优先显示模型的最后一段，避免头部状态栏过长。
 */
function getCompactModelName(modelName: string | null): string {
  if (!modelName) {
    return ''
  }

  const segments = modelName.split('/')
  return segments[segments.length - 1] || modelName
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
 * 统一的AI助手面板 - 首页风格
 */
export default function UnifiedAIPanel({
  isOpen,
  onClose,
  resumeData,
  preferredSection = null,
  configVersion = 0,
  onOpenAIConfig,
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
  const [appliedJDSuggestionKeys, setAppliedJDSuggestionKeys] = useState<string[]>([])
  const aiStatusMeta = useMemo(() => {
    if (aiConfigStatus.isConfigured) {
      return {
        title: locale === 'zh' ? 'AI 已就绪' : 'AI Ready',
        description: `${getProviderLabel(aiConfigStatus.provider, locale)} · ${getCompactModelName(aiConfigStatus.modelName)}`,
        toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }
    }

    if (aiConfigStatus.isEnabled) {
      return {
        title: locale === 'zh' ? 'AI 待配置' : 'AI Needs Setup',
        description: locale === 'zh'
          ? '智能优化和从零生成依赖 AI 配置，JD 匹配仍可直接使用。'
          : 'Optimize and generate require AI configuration. JD match is still available.',
        toneClass: 'border-amber-200 bg-amber-50 text-amber-700'
      }
    }

    return {
      title: locale === 'zh' ? 'AI 已停用' : 'AI Disabled',
      description: locale === 'zh'
        ? '可通过配置入口重新启用，或先使用职位匹配功能。'
        : 'Re-enable it from configuration, or use JD match first.',
      toneClass: 'border-slate-200 bg-slate-100 text-slate-700'
    }
  }, [aiConfigStatus, locale])

  /**
   * 刷新 AI 配置状态
   * 配置弹窗保存后同步更新面板头部和底部状态提示。
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    setAIConfigStatus(aiService.getConfigStatus())
  }, [configVersion, isOpen])

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
  const openConfigWithHint = (message: string) => {
    setErrorMessage(message)
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
    },
    {
      id: 'generate' as AIMode,
      name: locale === 'zh' ? '从零开始' : 'Start Fresh',
      icon: <Wand2 className="w-4 h-4" />,
      requiresConfig: true
    }
  ], [locale])

  const sections = useMemo(() => [
    {
      id: 'summary' as OptimizeSection,
      name: locale === 'zh' ? '个人简介' : 'Summary',
      icon: <Sparkles className="w-5 h-5" />,
      desc: locale === 'zh' ? '强化定位与吸引力' : 'Sharpen positioning',
      hasContent: Boolean(resumeData.personalInfo.summary?.trim())
    },
    {
      id: 'experience' as OptimizeSection,
      name: locale === 'zh' ? '工作经历' : 'Experience',
      icon: <Zap className="w-5 h-5" />,
      desc: locale === 'zh' ? '突出成果与影响力' : 'Highlight impact',
      hasContent: resumeData.experience.length > 0
    },
    {
      id: 'skills' as OptimizeSection,
      name: locale === 'zh' ? '专业技能' : 'Skills',
      icon: <Target className="w-5 h-5" />,
      desc: locale === 'zh' ? '优化技能结构与优先级' : 'Optimize skill hierarchy',
      hasContent: resumeData.skills.length > 0
    },
    {
      id: 'projects' as OptimizeSection,
      name: locale === 'zh' ? '项目经验' : 'Projects',
      icon: <Bot className="w-5 h-5" />,
      desc: locale === 'zh' ? '增强项目叙事与亮点' : 'Improve project storytelling',
      hasContent: resumeData.projects.length > 0
    }
  ], [locale, resumeData])

  /**
   * 切换模式并清理局部状态
   * 避免不同功能之间状态互相干扰
   */
  const handleSwitchMode = (mode: AIMode) => {
    setActiveMode(mode)
    setErrorMessage('')
    setIsProcessing(false)
    if (mode !== 'optimize') {
      setOptimizeResult(null)
      setSelectedSection(null)
    }
    if (mode !== 'match') {
      setMatchResult(null)
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
        onOpenAIConfig()
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
   * 应用单条 JD 建议
   * 支持按模块渐进式采纳，减少“一键全改”带来的不确定性。
   */
  const handleApplySingleJDSuggestion = (suggestion: JDSuggestion, index: number) => {
    onApplySuggestion(suggestion.suggestedText, suggestion.section)
    setAppliedJDSuggestionKeys((currentKeys) => {
      const nextKey = getJDSuggestionKey(suggestion, index)
      if (currentKeys.includes(nextKey)) {
        return currentKeys
      }
      return [...currentKeys, nextKey]
    })
  }

  /**
   * 应用全部 JD 建议
   * 保留原有批量写回能力，并同步更新局部应用状态。
   */
  const handleApplyAllJDSuggestions = () => {
    if (!matchResult) {
      return
    }

    onApplyJDSuggestions(matchResult.suggestions)
    setAppliedJDSuggestionKeys(
      matchResult.suggestions.map((suggestion, index) => getJDSuggestionKey(suggestion, index))
    )
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
        onOpenAIConfig()
      }
    } finally {
      setIsProcessing(false)
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

      {/* 主面板 - 首页风格 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl max-h-[88vh] rounded-2xl overflow-hidden flex flex-col border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 - 首页风格 */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {locale === 'zh' ? 'AI 助手' : 'AI Assistant'}
                </h2>
                <p className="text-xs text-gray-500">
                  {locale === 'zh' ? '智能优化你的简历' : 'Optimize your resume'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 模式切换 - 首页标签风格 */}
          <div className="flex gap-2 mt-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSwitchMode(mode.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeMode === mode.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mode.icon}
                <span>{mode.name}</span>
                {mode.requiresConfig && !aiConfigStatus.isConfigured && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    activeMode === mode.id
                      ? 'bg-white/15 text-white'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {locale === 'zh' ? '需配置' : 'Setup'}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 ${aiStatusMeta.toneClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{aiStatusMeta.title}</div>
                <div className="mt-1 text-xs opacity-90">{aiStatusMeta.description}</div>
              </div>
              <button
                onClick={onOpenAIConfig}
                className="rounded-lg border border-current/20 bg-white/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white"
              >
                {aiConfigStatus.isConfigured
                  ? (locale === 'zh' ? '重新配置' : 'Reconfigure')
                  : (locale === 'zh' ? '配置入口' : 'Open Config')}
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto bg-slate-50/80">
          {errorMessage && (
            <div className="px-6 pt-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-rose-700">{errorMessage}</p>
                  <button
                    onClick={onOpenAIConfig}
                    className="mt-2 text-xs font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800"
                  >
                    {locale === 'zh' ? '立即前往 AI 配置' : 'Open AI Configuration'}
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
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {locale === 'zh' ? '选择要优化的内容' : 'Select content to optimize'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {locale === 'zh' ? '调用真实 AI 服务，生成高质量候选版本' : 'Use real AI service for practical suggestions'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sections.map((section) => (
                        <motion.button
                          key={section.id}
                          onClick={() => handleOptimizeSection(section.id)}
                          disabled={isProcessing}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group p-5 rounded-xl text-left transition-all border ${
                            selectedSection === section.id
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                          } disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors ${
                              selectedSection === section.id && isProcessing
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              {section.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-0.5">
                                {section.name}
                              </h4>
                              <p className="text-xs text-gray-500 mb-1">
                                {section.desc}
                              </p>
                              {!aiConfigStatus.isConfigured && (
                                <p className="text-[11px] text-slate-500">
                                  {locale === 'zh' ? '点击后会先引导到 AI 配置。' : 'Clicking will guide you to AI setup first.'}
                                </p>
                              )}
                              {!section.hasContent && (
                                <p className="text-[11px] text-amber-600">
                                  {locale === 'zh' ? '该模块内容为空，建议先补充' : 'This section is empty'}
                                </p>
                              )}
                            </div>
                            {selectedSection === section.id && isProcessing && (
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                            )}
                          </div>
                        </motion.button>
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
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {locale === 'zh' ? '优化建议已生成' : 'Suggestions Ready'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {locale === 'zh' ? '请选择一条最适合你的版本并应用' : 'Choose the best version and apply'}
                          </p>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              {locale === 'zh' ? '原始' : 'Original'}
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {optimizeResult.original}
                            </div>
                          </div>

                          <div className="grid gap-3">
                            {optimizeResult.suggestions.map((item, index) => (
                              <button
                                key={`${index}-${item.content.slice(0, 12)}`}
                                onClick={() => {
                                  setOptimizeResult((prev) => prev ? { ...prev, selectedIndex: index } : prev)
                                }}
                                className={`text-left p-4 rounded-xl border transition-all ${
                                  optimizeResult.selectedIndex === index
                                    ? 'border-slate-900 bg-white ring-1 ring-slate-200'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2 gap-2">
                                  <div className="text-xs font-semibold text-slate-600 uppercase">
                                    {locale === 'zh' ? `候选版本 ${index + 1}` : `Variant ${index + 1}`}
                                  </div>
                                  <div className={`px-2 py-1 rounded-md border text-[11px] font-semibold ${getScoreClass(item.finalScore)}`}>
                                    {locale === 'zh' ? `质量 ${item.finalScore}` : `Score ${item.finalScore}`}
                                  </div>
                                </div>
                                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                  {item.content}
                                </div>
                                {item.quality.issues.length > 0 && (
                                  <div className="mt-2 text-[11px] text-slate-500">
                                    {locale === 'zh' ? `可改进：${item.quality.issues[0]}` : `Can improve: ${item.quality.issues[0]}`}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleApplyOptimizeSuggestion}
                            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{locale === 'zh' ? '应用当前版本' : 'Apply Selected'}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (optimizeResult) {
                                handleOptimizeSection(optimizeResult.section)
                              }
                            }}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
                          >
                            {locale === 'zh' ? '重新生成' : 'Regenerate'}
                          </button>
                          <button
                            onClick={() => {
                              setOptimizeResult(null)
                              setSelectedSection(null)
                            }}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                          >
                            {locale === 'zh' ? '返回选择' : 'Back'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4"
                        >
                          <CheckCircle className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {locale === 'zh' ? '已应用到简历' : 'Applied to Resume'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {locale === 'zh' ? '正在关闭 AI 面板...' : 'Closing AI panel...'}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span>{locale === 'zh' ? '完成' : 'Done'}</span>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'zh' ? '粘贴职位描述（JD）' : 'Paste Job Description'}
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={locale === 'zh' ? '粘贴目标职位描述后，获取真实匹配度与优化建议...' : 'Paste your target JD for real matching...'}
                      className="w-full h-44 px-4 py-3 border border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-100 transition-all resize-none text-sm bg-white"
                    />
                  </div>

                  {matchResult && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {locale === 'zh' ? '匹配度分析结果' : 'Match Analysis'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {locale === 'zh'
                                ? `命中关键词 ${matchResult.matchedKeywords.length} 个，缺失 ${matchResult.missingKeywords.length} 个`
                                : `${matchResult.matchedKeywords.length} matched, ${matchResult.missingKeywords.length} missing keywords`}
                            </p>
                          </div>
                          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 text-white">
                            <div className="text-3xl font-bold">{matchResult.score}</div>
                          </div>
                        </div>
                      </div>

                      {matchResult.missingKeywords.length > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="text-sm font-semibold text-gray-900 mb-2">
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
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="text-sm font-semibold text-gray-900 mb-3">
                            {locale === 'zh' ? 'AI 建议（可一键应用）' : 'Suggestions (one-click apply)'}
                          </div>
                          <div className="space-y-2 mb-3">
                            {matchResult.suggestions.map((suggestion, index) => (
                              <div key={`${suggestion.section}-${index}`} className="rounded-lg border border-slate-200 p-3">
                                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                                      {getSectionLabel(suggestion.section, locale)}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {suggestion.reason}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplySingleJDSuggestion(suggestion, index)}
                                    disabled={appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))}
                                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                      appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))
                                        ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {appliedJDSuggestionKeys.includes(getJDSuggestionKey(suggestion, index))
                                      ? (locale === 'zh' ? '已应用' : 'Applied')
                                      : (locale === 'zh' ? '应用到该模块' : 'Apply to Section')}
                                  </button>
                                </div>
                                {suggestion.originalText && (
                                  <div className="mb-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                      {locale === 'zh' ? '当前内容' : 'Current Content'}
                                    </div>
                                    <div className="text-xs leading-6 text-slate-600">
                                      {suggestion.originalText}
                                    </div>
                                  </div>
                                )}
                                <div className="text-sm leading-7 text-slate-800">{suggestion.suggestedText}</div>
                                {suggestion.keywords.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
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
                          <button
                            onClick={handleApplyAllJDSuggestions}
                            className="w-full px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                          >
                            {locale === 'zh' ? '一键应用全部建议' : 'Apply All Suggestions'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleAnalyzeJD}
                    disabled={!jobDescription.trim() || isProcessing}
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'zh' ? '姓名' : 'Name'}
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-100 transition-all text-sm bg-white"
                      placeholder={locale === 'zh' ? '例如：张三' : 'e.g. Alex'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'zh' ? '目标职位' : 'Target Position'}
                    </label>
                    <input
                      type="text"
                      value={userInfo.targetPosition}
                      onChange={(e) => setUserInfo({ ...userInfo, targetPosition: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-100 transition-all text-sm bg-white"
                      placeholder={locale === 'zh' ? '例如：高级前端工程师' : 'e.g. Senior Frontend Engineer'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          onClick={() => setUserInfo({ ...userInfo, experienceLevel: level.value as typeof userInfo.experienceLevel })}
                          className={`px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                            userInfo.experienceLevel === level.value
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-slate-300'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
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
                        onClick={handleGenerateResume}
                        disabled={!userInfo.targetPosition.trim() || isProcessing}
                        className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        <span>{locale === 'zh' ? '开始生成完整简历' : 'Generate Resume'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {locale === 'zh' ? '已应用生成结果，正在返回编辑器。' : 'Generated content applied. Returning to editor.'}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部信息 */}
        <div className="flex-none px-6 py-3 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-500">
              <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span>
                {isProcessing
                  ? (locale === 'zh' ? 'AI 正在处理中...' : 'AI processing...')
                  : aiConfigStatus.isConfigured
                    ? (locale === 'zh' ? 'AI 服务就绪' : 'AI service ready')
                    : aiConfigStatus.isEnabled
                      ? (locale === 'zh' ? 'AI 待配置' : 'AI needs setup')
                      : (locale === 'zh' ? 'AI 已停用' : 'AI disabled')}
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              {locale === 'zh' ? '使用说明' : 'Guide'}
            </button>
            <button
              onClick={onOpenAIConfig}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              {locale === 'zh' ? 'AI 配置' : 'AI Config'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
