/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useState, useEffect } from 'react'
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

export default function AIConfigModal({ isOpen, onClose, onSave }: AIConfigModalProps) {
  const { t, locale } = useLanguage()
  const { error: showError } = useToastContext()
  const [config, setConfig] = useState<AIConfig>(defaultConfig)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  // 从localStorage加载配置
  useEffect(() => {
    if (isOpen) {
      setValidationResult(null)
      const savedConfig = localStorage.getItem('ai-config')
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig)
          setConfig({ ...defaultConfig, ...parsed })
        } catch (error) {
          console.error('Failed to parse AI config:', error)
        }
      }
    }
  }, [isOpen])

  /**
   * 验证API配置
   */
  const validateConfig = async () => {
    // 免费模型允许不填前端密钥（由服务端环境变量接管）
    if (config.provider !== 'free' && !config.apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: t.editor.aiConfig.pleaseEnterApiKey
      })
      return
    }

    if (config.provider === 'free') {
      setValidationResult({
        isValid: true,
        message: locale === 'zh'
          ? '免费模型由服务端托管，当前无需额外验证。'
          : 'The free model is hosted by the service and needs no extra validation.'
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const aiProviders = getAiProviders(t, locale)
      const provider = aiProviders.find(p => p.id === config.provider)
      const endpoint = config.provider === 'custom' ? config.customEndpoint : provider?.endpoint
      
      if (!endpoint) {
        throw new Error(locale === 'zh' ? 'API端点未配置' : 'API endpoint not configured')
      }

      // 这里可以添加实际的API验证逻辑
      // 暂时模拟验证过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setValidationResult({
        isValid: true,
        message: t.editor.aiConfig.validationSuccess
      })
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: error instanceof Error ? error.message : t.editor.aiConfig.validationFailed
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
        message: t.editor.aiConfig.pleaseEnterApiKey
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
          message: `${t.editor.aiConfig.validationFailed}: ${result.message}`
        })
        return
      }

      // 保存到本地存储
      localStorage.setItem('ai-config', JSON.stringify(config))
      
      // 更新AI服务配置
      aiService.updateConfig(config)
      
      // 调用回调
      onSave(config)
      
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
        message: errorMessage
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

              {config.enabled && (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
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
                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
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

                  {validationResult && (
                    <div
                      className={`rounded-xl border px-4 py-3 ${
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
