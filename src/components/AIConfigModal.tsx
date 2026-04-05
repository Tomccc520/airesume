/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  X,
  Settings,
  Key,
  Globe,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Locale, Translations } from '@/types/i18n'
import { useToastContext } from '@/components/Toast'
import { aiService, AIConfigGuidance } from '@/services/aiService'
import {
  AIConfigPrecheckActionId,
  AIConfigPrecheckItem,
  buildAIConfigPrecheck,
  getAIConfigPrecheckStatusClass,
  getAIConfigPrecheckStatusLabel,
  normalizeCustomEndpointInput
} from '@/domain/ai/configPrecheck'

/**
 * AI配置模态框组件
 * 用于配置AI模型API密钥和设置
 */
interface AIConfigModalProps {
  /** 是否显示模态框 */
  isOpen: boolean
  /** 关闭模态框回调 */
  onClose: () => void
  /** 配置保存回调 */
  onSave: (config: AIConfig) => void
}

/**
 * AI配置接口
 */
export interface AIConfig {
  /** API提供商 */
  provider: 'free' | 'siliconflow' | 'deepseek' | 'custom'
  /** API密钥 */
  apiKey: string
  /** 自定义API端点 */
  customEndpoint?: string
  /** 模型名称 */
  modelName: string
  /** 是否启用 */
  enabled: boolean
}

interface AIValidationDiagnosticsState {
  provider?: string
  providerLabel?: string
  targetHost?: string
  category?: string
  code?: string
  detail?: string
  suggestion?: string
}

interface AIConfigQuickFixAction {
  id: AIConfigPrecheckActionId
  title: string
  description: string
}

/**
 * 获取 AI 配置引导字段标签
 * 将聚焦字段转换成更适合在弹窗提示卡里展示的短文案。
 */
const getGuidanceFieldLabel = (field: AIConfigGuidance['field'], locale: Locale): string => {
  const labelMap: Record<AIConfigGuidance['field'], { zh: string; en: string }> = {
    provider: { zh: '服务商与启用状态', en: 'Provider & enabled state' },
    apiKey: { zh: 'API 密钥', en: 'API key' },
    customEndpoint: { zh: '自定义端点', en: 'Custom endpoint' },
    modelName: { zh: '模型选择', en: 'Model selection' }
  }

  return labelMap[field][locale]
}

/**
 * 默认AI配置
 */
const defaultConfig: AIConfig = {
  enabled: true,
  provider: 'free',
  apiKey: '', // 免费模型不需要前端存储API密钥
  customEndpoint: 'https://api.siliconflow.cn/v1',
  modelName: 'Qwen/Qwen2.5-7B-Instruct'
}

/**
 * 预设的AI提供商配置
 */
const getAiProviders = (t: Translations, locale: Locale) => [
  {
    id: 'free' as const,
    name: t.editor.aiConfig.free,
    description: locale === 'zh' ? '无需配置，开箱即用的免费AI模型' : 'No configuration needed, free AI model ready to use',
    endpoint: 'https://api.siliconflow.cn/v1',
    models: [
      'Qwen/Qwen2.5-7B-Instruct',
      'deepseek-ai/DeepSeek-V3.1',
      'Qwen/Qwen2.5-14B-Instruct',
      'THUDM/glm-4-9b-chat'
    ],
    docUrl: 'https://cloud.siliconflow.cn/i/AZywGNhl',
    free: true
  },
  {
    id: 'siliconflow' as const,
    name: 'SiliconFlow',
    description: locale === 'zh' ? '免费AI服务，支持多种模型' : 'Free AI service with multiple models',
    endpoint: 'https://api.siliconflow.cn/v1',
    models: [
      // Qwen系列 (免费)
      'Qwen/Qwen3-Next-80B-A3B-Instruct',
      'Qwen/Qwen3-Next-80B-A3B-Thinking',
      'Qwen/Qwen3-Coder-30B-A3B-Instruct',
      'Qwen/Qwen3-Coder-480B-A35B-Instruct',
      'Qwen/Qwen3-30B-A3B-Thinking-2507',
      'Qwen/Qwen3-30B-A3B-Instruct-2507',
      'Qwen/Qwen3-235B-A22B-Thinking-2507',
      'Qwen/Qwen3-235B-A22B-Instruct-2507',
      'Qwen/Qwen3-30B-A3B',
      'Qwen/Qwen3-32B',
      'Qwen/Qwen3-14B',
      'Qwen/Qwen3-8B',
      'Qwen/Qwen3-235B-A22B',
      'Qwen/QwQ-32B',
      'Qwen/Qwen2.5-72B-Instruct-128K',
      'Qwen/Qwen2.5-72B-Instruct',
      'Qwen/Qwen2.5-32B-Instruct',
      'Qwen/Qwen2.5-14B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2.5-Coder-32B-Instruct',
      'Qwen/Qwen2.5-Coder-7B-Instruct',
      'Qwen/Qwen2-7B-Instruct',
      'Tongyi-Zhiwen/QwenLong-L1-32B',
      // DeepSeek系列 (免费)
      'deepseek-ai/DeepSeek-V3.1',
      'deepseek-ai/DeepSeek-R1',
      'deepseek-ai/DeepSeek-V3',
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      'deepseek-ai/DeepSeek-V2.5',
      // GLM系列 (免费)
      'zai-org/GLM-4.5-Air',
      'zai-org/GLM-4.5',
      'THUDM/GLM-Z1-32B-0414',
      'THUDM/GLM-4-32B-0414',
      'THUDM/GLM-Z1-Rumination-32B-0414',
      'THUDM/GLM-4-9B-0414',
      'THUDM/glm-4-9b-chat',
      // 其他模型 (免费)
      'inclusionAI/Ring-flash-2.0',
      'inclusionAI/Ling-flash-2.0',
      'inclusionAI/Ling-mini-2.0',
      'ByteDance-Seed/Seed-OSS-36B-Instruct',
      'stepfun-ai/step3',
      'baidu/ERNIE-4.5-300B-A47B',
      'ascend-tribe/pangu-pro-moe',
      'tencent/Hunyuan-A13B-Instruct',
      'MiniMaxAI/MiniMax-M1-80k',
      'internlm/internlm2_5-7b-chat',
      // Pro版本模型 (付费)
      'Pro/deepseek-ai/DeepSeek-V3.1',
      'Pro/deepseek-ai/DeepSeek-R1',
      'Pro/deepseek-ai/DeepSeek-V3',
      'Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      'Pro/Qwen/Qwen2.5-7B-Instruct',
      'Pro/Qwen/Qwen2-7B-Instruct',
      'Pro/THUDM/glm-4-9b-chat'
    ],
    docUrl: 'https://cloud.siliconflow.cn/i/AZywGNhl',
    free: true
  },
  {
    id: 'deepseek' as const,
    name: 'DeepSeek',
    description: locale === 'zh' ? 'DeepSeek官方API服务，高质量AI模型' : 'DeepSeek official API service, high-quality AI models',
    endpoint: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    docUrl: 'https://api-docs.deepseek.com/zh-cn/',
    free: false
  },
  {
    id: 'custom' as const,
    name: t.editor.aiConfig.custom,
    description: locale === 'zh' ? '使用自定义API端点' : 'Use custom API endpoint',
    endpoint: '',
    models: [],
    docUrl: '',
    free: false
  }
]

/**
 * 判断模型是否为免费模型
 */
const isModelFree = (modelName: string): boolean => {
  // Pro/ 前缀的模型是付费模型
  return !modelName.startsWith('Pro/')
}

/**
 * 压缩模型名称展示
 * 优先显示模型路径的最后一段，避免状态摘要区域过长。
 */
const getCompactModelName = (modelName: string): string => {
  if (!modelName) {
    return ''
  }

  const segments = modelName.split('/')
  return segments[segments.length - 1] || modelName
}

/**
 * 获取提供商类型标签
 * 用统一短标签描述当前服务商的接入方式和成本属性。
 */
const getProviderBadgeLabel = (
  provider: ReturnType<typeof getAiProviders>[number],
  locale: Locale
): string => {
  if (provider.id === 'free') {
    return locale === 'zh' ? '免配置' : 'Ready to Use'
  }

  if (provider.id === 'custom') {
    return locale === 'zh' ? '自定义端点' : 'Custom Endpoint'
  }

  if (provider.free) {
    return locale === 'zh' ? '多模型' : 'Multi-Model'
  }

  return locale === 'zh' ? '官方 API' : 'Official API'
}

/**
 * 获取当前配置状态摘要
 * 用于弹窗顶部卡片和状态徽标，保持与 AI 面板同一套判断逻辑。
 */
const getConfigStatusMeta = (
  config: AIConfig,
  providerName: string,
  locale: Locale
) => {
  const hasApiKey = config.provider === 'free' || Boolean(config.apiKey.trim())
  const isConfigured = config.enabled && hasApiKey
  const modelLabel = config.modelName ? getCompactModelName(config.modelName) : (locale === 'zh' ? '未选择模型' : 'No model selected')

  if (!config.enabled) {
    return {
      title: locale === 'zh' ? 'AI 已停用' : 'AI Disabled',
      description: locale === 'zh'
        ? '当前不会调用 AI 服务，可随时重新启用。'
        : 'AI requests are currently disabled. You can re-enable them anytime.',
      toneClass: 'border-slate-200 bg-slate-100 text-slate-700',
      providerSummary: locale === 'zh' ? '未启用' : 'Disabled',
      modelSummary: modelLabel
    }
  }

  if (isConfigured) {
    return {
      title: locale === 'zh' ? 'AI 已就绪' : 'AI Ready',
      description: locale === 'zh'
        ? `当前使用 ${providerName}，可以直接返回编辑器继续生成和优化。`
        : `${providerName} is ready. You can continue generating and optimizing from the editor.`,
      toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      providerSummary: providerName,
      modelSummary: modelLabel
    }
  }

  return {
    title: locale === 'zh' ? 'AI 待补全' : 'AI Needs Setup',
    description: locale === 'zh'
      ? '已选择服务商，但还需要补充关键连接信息后才能调用。'
      : 'A provider is selected, but required connection details are still missing.',
    toneClass: 'border-amber-200 bg-amber-50 text-amber-700',
    providerSummary: providerName,
    modelSummary: modelLabel
  }
}

/**
 * 获取验证错误分类标题
 * 将代理层返回的错误类别映射成更易理解的展示标题。
 */
const getValidationCategoryLabel = (category?: string, locale?: Locale): string => {
  const isZh = locale === 'zh'

  switch (category) {
    case 'timeout':
      return isZh ? '连接超时' : 'Timeout'
    case 'ssl':
      return isZh ? '证书验证失败' : 'SSL Error'
    case 'dns':
      return isZh ? '域名解析失败' : 'DNS Error'
    case 'refused':
      return isZh ? '连接被拒绝' : 'Connection Refused'
    case 'reset':
      return isZh ? '连接被重置' : 'Connection Reset'
    case 'network':
      return isZh ? '网络错误' : 'Network Error'
    default:
      return isZh ? '未知错误' : 'Unknown Error'
  }
}

/**
 * 获取快速修复动作字段
 * 将当前引导状态或验证失败场景映射到最值得优先处理的配置字段。
 */
const resolveQuickFixField = (
  config: AIConfig,
  configGuidance: AIConfigGuidance | null,
  validationResult: {
    isValid: boolean
    diagnostics?: AIValidationDiagnosticsState
  } | null
): AIConfigGuidance['field'] | null => {
  if (configGuidance) {
    return configGuidance.field
  }

  if (!validationResult || validationResult.isValid) {
    return null
  }

  if (!config.enabled) {
    return 'provider'
  }

  if (config.provider !== 'free' && !config.apiKey.trim()) {
    return 'apiKey'
  }

  if (config.provider === 'custom') {
    return 'customEndpoint'
  }

  if (!config.modelName.trim()) {
    return 'modelName'
  }

  return 'provider'
}

export default function AIConfigModal({ isOpen, onClose, onSave }: AIConfigModalProps) {
  const { t, locale } = useLanguage()
  const { error: showError } = useToastContext()
  const [config, setConfig] = useState<AIConfig>(defaultConfig)
  const [isValidating, setIsValidating] = useState(false)
  const [configGuidance, setConfigGuidance] = useState<AIConfigGuidance | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    diagnostics?: AIValidationDiagnosticsState
  } | null>(null)
  const providerSectionRef = useRef<HTMLDivElement | null>(null)
  const apiKeyInputRef = useRef<HTMLInputElement | null>(null)
  const customEndpointInputRef = useRef<HTMLInputElement | null>(null)
  const modelSelectRef = useRef<HTMLSelectElement | null>(null)

  /**
   * 聚焦 AI 配置引导字段
   * 当配置弹窗由面板错误引导打开时，自动滚动并定位到最需要处理的输入区。
   */
  const focusGuidanceField = (field: AIConfigGuidance['field']) => {
    const focusOptions: FocusOptions = { preventScroll: true }

    switch (field) {
      case 'provider':
        providerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        providerSectionRef.current?.focus()
        return
      case 'apiKey':
        apiKeyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        apiKeyInputRef.current?.focus(focusOptions)
        return
      case 'customEndpoint':
        customEndpointInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        customEndpointInputRef.current?.focus(focusOptions)
        return
      case 'modelName':
        modelSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        modelSelectRef.current?.focus(focusOptions)
        return
      default:
        return
    }
  }

  /**
   * 打开弹窗时同步配置与引导状态
   * 既恢复本地 AI 配置，也消费 AI 面板写入的最近一次诊断引导。
   */
  useEffect(() => {
    if (isOpen) {
      setValidationResult(null)
      setConfigGuidance(aiService.readConfigGuidance())
      aiService.clearConfigGuidance()
      const savedConfig = localStorage.getItem('ai-config')
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig)
          setConfig({ ...defaultConfig, ...parsed })
        } catch (error) {
          console.error('Failed to parse AI config:', error)
        }
      }
      return
    }

    setConfigGuidance(null)
  }, [isOpen])

  /**
   * 根据引导状态自动聚焦
   * 等待弹窗内容和对应字段渲染完成后，再执行滚动与 focus。
   */
  useEffect(() => {
    if (!isOpen || !configGuidance) {
      return
    }

    const timer = window.setTimeout(() => {
      focusGuidanceField(configGuidance.field)
    }, 120)

    return () => {
      window.clearTimeout(timer)
    }
  }, [config.provider, configGuidance, isOpen])

  /**
   * 验证API配置
   */
  const validateConfig = async () => {
    // 免费模型允许不填前端密钥（由服务端环境变量接管）
    if (config.provider !== 'free' && !config.apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: t.editor.aiConfig.pleaseEnterApiKey,
        diagnostics: undefined
      })
      return
    }

    if (config.provider === 'free') {
      setValidationResult({
        isValid: true,
        message: locale === 'zh'
          ? '免费模型由服务端托管，当前无需额外验证。'
          : 'The free model is hosted by the service and needs no extra validation.',
        diagnostics: undefined
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const { aiService } = await import('@/services/aiService')
      const result = await aiService.validateConfig(config)

      setValidationResult({
        isValid: result.isValid,
        message: result.isValid
          ? t.editor.aiConfig.validationSuccess
          : `${t.editor.aiConfig.validationFailed}: ${result.message}`,
        diagnostics: result.diagnostics
      })
      if (result.isValid) {
        setConfigGuidance(null)
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: error instanceof Error
          ? `${t.editor.aiConfig.validationFailed}: ${error.message}`
          : t.editor.aiConfig.validationFailed,
        diagnostics: undefined
      })
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * 保存配置
   */
  const handleSave = async () => {
    if (!config.apiKey.trim() && config.provider !== 'free') {
      setValidationResult({
        isValid: false,
        message: t.editor.aiConfig.pleaseEnterApiKey,
        diagnostics: undefined
      })
      return
    }

    try {
      // 免费模型跳过验证，直接保存
      if (config.provider === 'free') {
        // 保存到本地存储
        localStorage.setItem('ai-config', JSON.stringify(config))
        
        // 更新AI服务配置
        const { aiService } = await import('@/services/aiService')
        aiService.updateConfig(config)
        
        // 调用回调
        onSave(config)
        
        onClose()
        return
      }

      // 验证API配置
      setIsValidating(true)
      const { aiService } = await import('@/services/aiService')
      const result = await aiService.validateConfig(config)
      
      if (!result.isValid) {
        setValidationResult({
          isValid: false,
          message: `${t.editor.aiConfig.validationFailed}: ${result.message}`,
          diagnostics: result.diagnostics
        })
        return
      }

      // 保存到本地存储
      localStorage.setItem('ai-config', JSON.stringify(config))
      
      // 更新AI服务配置
      aiService.updateConfig(config)
      
      // 调用回调
      onSave(config)

      setConfigGuidance(null)
      onClose()
    } catch (error) {
      console.error('保存配置失败:', error)
      let errorMessage = t.editor.aiConfig.saveFailed
      
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          errorMessage = t.editor.aiConfig.networkError
        } else if (error.message.includes('UNABLE_TO_GET_ISSUER_CERT_LOCALLY')) {
          errorMessage = t.editor.aiConfig.sslError
        } else if (error.message.includes('timeout')) {
          errorMessage = t.editor.aiConfig.timeoutError
        } else {
          errorMessage = `${t.editor.aiConfig.validationFailed}: ${error.message}`
        }
      }
      
      setValidationResult({
        isValid: false,
        message: errorMessage,
        diagnostics: undefined
      })
      showError(errorMessage)
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * 重置配置
   */
  const handleReset = () => {
    setConfig(defaultConfig)
    setValidationResult(null)
  }

  /**
   * 更新配置
   */
  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setValidationResult(null)
  }

  /**
   * 选择提供商
   */
  const selectProvider = (providerId: AIConfig['provider']) => {
    const aiProviders = getAiProviders(t, locale)
    const provider = aiProviders.find(p => p.id === providerId)
    if (provider) {
      const newConfig: Partial<AIConfig> = {
        provider: providerId,
        modelName: provider.models[0] || '',
        customEndpoint: providerId === 'custom' ? config.customEndpoint : undefined
      }
      
      // 免费模型不需要设置API密钥，后端会处理
      if (providerId === 'free') {
        newConfig.apiKey = ''
      }
      
      updateConfig(newConfig)
    }
  }

  const aiProviders = getAiProviders(t, locale)
  const selectedProvider = aiProviders.find(p => p.id === config.provider)
  const selectedProviderName = selectedProvider?.name || (locale === 'zh' ? '未选择服务商' : 'No provider selected')
  const statusMeta = getConfigStatusMeta(config, selectedProviderName, locale)
  const isFreeProvider = config.provider === 'free'
  const shouldDisableValidation = isValidating || (!isFreeProvider && !config.apiKey.trim())
  const quickFixField = resolveQuickFixField(config, configGuidance, validationResult)
  const normalizedApiKey = config.apiKey.trim()
  const normalizedCustomEndpoint = normalizeCustomEndpointInput(config.customEndpoint)

  /**
   * 生成快速修复动作列表
   * 根据当前诊断场景提供最短路径的可执行修复按钮，避免用户只看到错误却不知道下一步怎么改。
   */
  const quickFixActions: AIConfigQuickFixAction[] = (() => {
    if (!quickFixField) {
      return []
    }

    if (!config.enabled) {
      const actions: AIConfigQuickFixAction[] = [
        {
          id: 'enableAI',
          title: locale === 'zh' ? '重新启用 AI' : 'Enable AI again',
          description: locale === 'zh'
            ? '恢复当前配置的启用状态，再继续检查服务商和模型。'
            : 'Re-enable the current configuration before checking provider and model.'
        }
      ]

      if (config.provider !== 'free') {
        actions.push({
          id: 'switchToFree',
          title: locale === 'zh' ? '切换到免费模型' : 'Switch to free model',
          description: locale === 'zh'
            ? '无需填写密钥，适合先恢复可用状态。'
            : 'No API key needed. Best for getting back to a working state quickly.'
        })
      }

      return actions
    }

    switch (quickFixField) {
      case 'apiKey':
        return [
          {
            id: 'clearApiKey',
            title: locale === 'zh' ? '清空并重新填写密钥' : 'Clear and re-enter key',
            description: locale === 'zh'
              ? '适合旧密钥失效、复制错误或准备更换新密钥时使用。'
              : 'Useful when the old key is invalid, copied incorrectly, or needs replacement.'
          },
          {
            id: 'switchToFree',
            title: locale === 'zh' ? '改用免费模型' : 'Use free model instead',
            description: locale === 'zh'
              ? '先保证可用，再回头补官方 API 配置。'
              : 'Recover availability first, then revisit the official API setup later.'
          }
        ]
      case 'customEndpoint':
        return [
          {
            id: 'restoreCustomEndpoint',
            title: locale === 'zh' ? '恢复推荐端点' : 'Restore recommended endpoint',
            description: locale === 'zh'
              ? '回填为系统默认的 SiliconFlow 兼容端点，适合当前地址不可达时快速回退。'
              : 'Reset to the default SiliconFlow-compatible endpoint when the current one is unreachable.'
          },
          {
            id: 'switchToFree',
            title: locale === 'zh' ? '切换到免费模型' : 'Switch to free model',
            description: locale === 'zh'
              ? '无需继续排查自定义端点，直接恢复可用。'
              : 'Skip custom endpoint debugging and restore availability immediately.'
          }
        ]
      case 'modelName':
        return [
          {
            id: 'restoreModel',
            title: locale === 'zh' ? '恢复推荐模型' : 'Restore recommended model',
            description: locale === 'zh'
              ? '回到当前服务商的默认推荐模型，适合模型名缺失或版本写错时使用。'
              : 'Revert to the current provider’s recommended model when the model is missing or incorrect.'
          },
          ...(config.provider !== 'free'
            ? [{
                id: 'switchToFree' as const,
                title: locale === 'zh' ? '切换到免费模型' : 'Switch to free model',
                description: locale === 'zh'
                  ? '用免密钥模式先完成验证和生成。'
                  : 'Use the no-key mode to continue validation and generation first.'
              }]
            : [])
        ]
      case 'provider':
      default:
        return [
          {
            id: 'switchToFree',
            title: locale === 'zh' ? '使用免费模型' : 'Use free model',
            description: locale === 'zh'
              ? '适合先恢复可用状态，再按需要切回其他服务商。'
              : 'Good for restoring availability first, then switching back later if needed.'
          }
        ]
    }
  })()

  /**
   * 应用快速修复动作
   * 将常见错误场景收敛成一键可执行的修复步骤，并同步刷新引导提示。
   */
  const applyQuickFixAction = (actionId: AIConfigPrecheckActionId) => {
    const freeProvider = aiProviders.find((provider) => provider.id === 'free')
    const recommendedModel = selectedProvider?.models[0] || freeProvider?.models[0] || defaultConfig.modelName

    switch (actionId) {
      case 'enableAI':
        updateConfig({ enabled: true })
        setConfigGuidance({
          field: 'provider',
          title: locale === 'zh' ? 'AI 已重新启用' : 'AI enabled again',
          description: locale === 'zh'
            ? '下一步确认服务商和模型是否符合当前使用场景，然后重新验证。'
            : 'Confirm the provider and model for your current workflow, then validate again.',
          provider: config.provider,
          createdAt: new Date().toISOString()
        })
        return
      case 'switchToFree':
        setConfig({
          enabled: true,
          provider: 'free',
          apiKey: '',
          customEndpoint: defaultConfig.customEndpoint,
          modelName: freeProvider?.models[0] || defaultConfig.modelName
        })
        setValidationResult(null)
        setConfigGuidance({
          field: 'modelName',
          title: locale === 'zh' ? '已切换到免费模型' : 'Switched to free model',
          description: locale === 'zh'
            ? '当前无需填写 API 密钥。确认模型后可直接保存，或先返回编辑器继续使用。'
            : 'No API key is needed now. Confirm the model and save, or return to the editor directly.',
          provider: 'free',
          createdAt: new Date().toISOString()
        })
        return
      case 'clearApiKey':
        updateConfig({ apiKey: '' })
        setConfigGuidance({
          field: 'apiKey',
          title: locale === 'zh' ? '请重新填写 API 密钥' : 'Please re-enter the API key',
          description: locale === 'zh'
            ? '已清空当前密钥，建议粘贴新的可用密钥后再次验证。'
            : 'The current key has been cleared. Paste a new valid key and validate again.',
          provider: config.provider,
          createdAt: new Date().toISOString()
        })
        return
      case 'trimApiKey':
        updateConfig({ apiKey: normalizedApiKey })
        setConfigGuidance({
          field: 'apiKey',
          title: locale === 'zh' ? '已清理密钥空格' : 'API key whitespace removed',
          description: locale === 'zh'
            ? '已去除首尾空格和换行，可以直接重新验证当前密钥。'
            : 'Leading and trailing whitespace was removed. You can validate the current key again now.',
          provider: config.provider,
          createdAt: new Date().toISOString()
        })
        return
      case 'restoreCustomEndpoint':
        updateConfig({
          enabled: true,
          provider: 'custom',
          customEndpoint: defaultConfig.customEndpoint,
          modelName: config.modelName || defaultConfig.modelName
        })
        setConfigGuidance({
          field: 'customEndpoint',
          title: locale === 'zh' ? '已恢复推荐端点' : 'Recommended endpoint restored',
          description: locale === 'zh'
            ? '已经回填为默认兼容端点。若你使用自建服务，可直接改成真实地址后重新验证。'
            : 'The default compatible endpoint has been restored. Replace it with your real service URL if needed, then validate again.',
          provider: 'custom',
          targetHost: defaultConfig.customEndpoint,
          createdAt: new Date().toISOString()
        })
        return
      case 'normalizeCustomEndpoint':
        updateConfig({
          customEndpoint: normalizedCustomEndpoint || defaultConfig.customEndpoint
        })
        setConfigGuidance({
          field: 'customEndpoint',
          title: locale === 'zh' ? '已规范化端点地址' : 'Endpoint normalized',
          description: locale === 'zh'
            ? '已移除多余后缀和尾部斜杠，确认地址后可以直接重新验证。'
            : 'Extra suffixes and trailing slashes were removed. Validate again after confirming the endpoint.',
          provider: config.provider,
          targetHost: normalizedCustomEndpoint || defaultConfig.customEndpoint,
          createdAt: new Date().toISOString()
        })
        return
      case 'restoreModel':
        updateConfig({ modelName: recommendedModel })
        setConfigGuidance({
          field: 'modelName',
          title: locale === 'zh' ? '已恢复推荐模型' : 'Recommended model restored',
          description: locale === 'zh'
            ? '已切回当前服务商的默认推荐模型，可以直接重新验证。'
            : 'The provider’s recommended model is restored. You can validate again now.',
          provider: config.provider,
          createdAt: new Date().toISOString()
        })
        return
      default:
        return
    }
  }

  /**
   * 生成 AI 配置本地预检查结果
   * 在真正发起网络验证前，先提示最可能导致失败的本地配置问题。
   */
  const precheckItems: AIConfigPrecheckItem[] = buildAIConfigPrecheck(config, {
    locale,
    providerName: selectedProviderName,
    providerModels: selectedProvider?.models
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-3 sm:p-4">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="app-shell-brand-mark h-11 w-11 shrink-0">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">{t.editor.aiConfig.title}</h2>
                <div className={`app-shell-status-chip ${statusMeta.toneClass}`}>
                  {statusMeta.title}
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t.editor.aiConfig.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSave()
          }}
        >
          <input
            type="text"
            name="provider-account"
            autoComplete="username"
            value={selectedProviderName}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
          <div className="no-scrollbar max-h-[calc(94vh-152px)] overflow-y-auto p-4 sm:p-6">
            <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '当前状态' : 'Current Status'}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">{statusMeta.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{statusMeta.description}</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '服务商' : 'Provider'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{statusMeta.providerSummary}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '模型' : 'Model'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{statusMeta.modelSummary}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-700" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '安全与存储' : 'Security & Storage'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {locale === 'zh' ? '密钥仅保存在当前浏览器' : 'Keys stay in this browser only'}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {locale === 'zh'
                        ? '免费模型由服务端托管；自定义与官方 API 会把密钥保存到本地浏览器存储，不会展示在简历内容中。'
                        : 'Free models are service-hosted. Custom and official API keys are stored locally in the browser and never exposed in resume output.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {locale === 'zh' ? '基础开关' : 'Basic Control'}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{t.editor.aiConfig.enableAI}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.editor.aiConfig.enableAIDesc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig({ enabled: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            </div>

            {!config.enabled && configGuidance && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-amber-900">{configGuidance.title}</p>
                      <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        {getGuidanceFieldLabel(configGuidance.field, locale)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-800">{configGuidance.description}</p>
                    {quickFixActions.length > 0 && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {quickFixActions.map((action) => (
                          <button
                            key={`disabled-${action.id}`}
                            type="button"
                            onClick={() => applyQuickFixAction(action.id)}
                            className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-100/60"
                          >
                            <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

              {config.enabled && (
                <>
                {configGuidance && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-amber-900">{configGuidance.title}</p>
                          <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            {getGuidanceFieldLabel(configGuidance.field, locale)}
                          </span>
                          {configGuidance.category && (
                            <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              {getValidationCategoryLabel(configGuidance.category, locale)}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-amber-800">{configGuidance.description}</p>
                        {configGuidance.targetHost && (
                          <p className="mt-2 break-all text-xs leading-5 text-amber-700">
                            {locale === 'zh' ? '目标地址：' : 'Target: '}
                            {configGuidance.targetHost}
                          </p>
                        )}
                        {quickFixActions.length > 0 && (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {quickFixActions.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                onClick={() => applyQuickFixAction(action.id)}
                                className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-100/60"
                              >
                                <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div
                  ref={providerSectionRef}
                  tabIndex={-1}
                  className={`rounded-xl border bg-white p-4 outline-none transition-colors sm:p-5 ${
                    configGuidance?.field === 'provider'
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '服务商选择' : 'Provider Selection'}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">{t.editor.aiConfig.selectProvider}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {locale === 'zh'
                        ? '先确定调用来源，再补充密钥和模型。'
                        : 'Pick the provider first, then complete key and model settings.'}
                    </p>
                  </div>
                  <div className="grid gap-3 xl:grid-cols-2">
                    {aiProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className={`relative rounded-xl border p-4 transition-colors ${
                          config.provider === provider.id
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onClick={() => selectProvider(provider.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-semibold text-slate-900">{provider.name}</h4>
                              <span className={`app-shell-status-chip ${
                                provider.free
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 bg-slate-100 text-slate-700'
                              }`}>
                                {getProviderBadgeLabel(provider, locale)}
                              </span>
                              {provider.free && provider.id !== 'free' && (
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                  {locale === 'zh' ? `${provider.models.length} 个模型` : `${provider.models.length} models`}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{provider.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                                {provider.id === 'custom'
                                  ? (locale === 'zh' ? '自定义端点' : 'Custom URL')
                                  : provider.endpoint}
                              </span>
                              {provider.models.length > 0 && (
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                                  <Cpu className="mr-1 inline h-3 w-3" />
                                  {locale === 'zh' ? `${provider.models.length} 个模型` : `${provider.models.length} models`}
                                </span>
                              )}
                            </div>
                            {provider.docUrl && (
                              <a
                                href={provider.docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>{t.editor.aiConfig.viewDocs}</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            config.provider === provider.id
                              ? 'border-slate-900 bg-slate-900'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {config.provider === provider.id && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className={`rounded-xl border bg-white p-4 transition-colors sm:p-5 ${
                      configGuidance?.field === 'apiKey' || configGuidance?.field === 'customEndpoint'
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        {locale === 'zh' ? '连接信息' : 'Connection'}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {locale === 'zh' ? '密钥与端点' : 'Key & Endpoint'}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {locale === 'zh'
                          ? '这里只配置调用信息，不影响你的简历内容本身。'
                          : 'These settings only affect AI calls, not your resume content.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          <Key className="mr-2 inline h-4 w-4 text-slate-500" />
                          {t.editor.aiConfig.apiKey}
                        </label>
                        <input
                          ref={apiKeyInputRef}
                          type="password"
                          autoComplete="new-password"
                          value={config.apiKey}
                          onChange={(e) => updateConfig({ apiKey: e.target.value })}
                          placeholder={isFreeProvider ? t.editor.aiConfig.apiKeyAutoConfigured : t.editor.aiConfig.apiKeyPlaceholder}
                          disabled={isFreeProvider}
                          className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
                            isFreeProvider
                              ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:outline-none'
                          }`}
                        />
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {isFreeProvider
                            ? t.editor.aiConfig.freeModelConfigured
                            : t.editor.aiConfig.apiKeyLocalStorage}
                        </p>
                      </div>

                      {config.provider === 'custom' && (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-900">
                            <Globe className="mr-2 inline h-4 w-4 text-slate-500" />
                            {t.editor.aiConfig.apiEndpoint}
                          </label>
                          <input
                            ref={customEndpointInputRef}
                            type="url"
                            value={config.customEndpoint || ''}
                            onChange={(e) => updateConfig({ customEndpoint: e.target.value })}
                            placeholder="https://api.example.com/v1"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedProvider && selectedProvider.models.length > 0 && (
                    <div
                      className={`rounded-xl border bg-white p-4 transition-colors sm:p-5 ${
                        configGuidance?.field === 'modelName'
                          ? 'border-amber-300 ring-2 ring-amber-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          {locale === 'zh' ? '模型选择' : 'Model Selection'}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{t.editor.aiConfig.modelSelect}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {locale === 'zh'
                            ? '优先选择你当前岗位最常用、最稳定的模型版本。'
                            : 'Choose the most stable model that fits your current resume workflow.'}
                        </p>
                      </div>
                      <div className="relative">
                        <select
                          ref={modelSelectRef}
                          value={config.modelName}
                          onChange={(e) => updateConfig({ modelName: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                        >
                          {selectedProvider.models.map((model) => (
                            <option key={model} value={model}>
                              {model} {isModelFree(model) ? `(${t.editor.aiConfig.freeModel})` : `(${t.editor.aiConfig.paidModel})`}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-900" />
                        {t.editor.aiConfig.freeModelNote}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        {locale === 'zh' ? '本地预检查' : 'Local Precheck'}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {locale === 'zh' ? '验证前先检查这 4 项' : 'Check these 4 items before validation'}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {locale === 'zh'
                          ? '这里只检查本地输入质量，不会发起网络请求。'
                          : 'These checks only inspect local inputs and do not trigger network requests.'}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {precheckItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getAIConfigPrecheckStatusClass(item.status)}`}>
                                  {getAIConfigPrecheckStatusLabel(item.status, locale)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                            </div>
                            {item.actionId && (
                              <button
                                type="button"
                                onClick={() => applyQuickFixAction(item.actionId!)}
                                className="app-shell-action-button h-8 shrink-0 rounded-xl px-3 text-xs"
                              >
                                {locale === 'zh' ? '快速修复' : 'Quick Fix'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {validationResult && (
                    <div
                      className={`space-y-3 rounded-xl border px-4 py-3 ${
                        validationResult.isValid
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {validationResult.isValid ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <p className="text-sm leading-6">{validationResult.message}</p>
                      </div>
                      {!validationResult.isValid && validationResult.diagnostics && (
                        <div className="grid gap-2 rounded-xl border border-rose-200/70 bg-white/80 p-3 text-slate-700">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                服务商
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900">
                                {validationResult.diagnostics.providerLabel || validationResult.diagnostics.provider || '未识别'}
                              </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                错误类型
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900">
                                {getValidationCategoryLabel(validationResult.diagnostics.category, locale)}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              目标地址
                            </p>
                            <p className="mt-1 break-all text-sm font-medium text-slate-900">
                              {validationResult.diagnostics.targetHost || '未识别'}
                            </p>
                          </div>
                          {validationResult.diagnostics.detail && (
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                底层详情
                              </p>
                              <p className="mt-1 break-all text-sm leading-6 text-slate-600">
                                {validationResult.diagnostics.detail}
                              </p>
                            </div>
                          )}
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              建议处理
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {validationResult.diagnostics.suggestion || '请检查网络、代理、API 端点和服务商状态后重试。'}
                            </p>
                          </div>
                          {quickFixActions.length > 0 && (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {quickFixActions.map((action) => (
                                <button
                                  key={`validation-${action.id}`}
                                  type="button"
                                  onClick={() => applyQuickFixAction(action.id)}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={validateConfig}
                    disabled={shouldDisableValidation}
                    className="app-shell-action-button h-11 w-full justify-center rounded-xl text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                        <span>{t.editor.aiConfig.validating}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>{t.editor.aiConfig.validateConfig}</span>
                      </>
                    )}
                  </button>
                </div>
                </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleReset}
              className="app-shell-action-button h-10 rounded-xl px-4 text-sm"
            >
              {t.editor.aiConfig.resetConfig}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="app-shell-action-button h-10 rounded-xl px-5 text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                {t.editor.aiConfig.saveConfig}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
