/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useState, useEffect } from 'react'
import { X, Settings, Key, Globe, AlertCircle, CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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
const getAiProviders = (t: any, locale: string) => [
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

export default function AIConfigModal({ isOpen, onClose, onSave }: AIConfigModalProps) {
  const { t, locale } = useLanguage()
  const [config, setConfig] = useState<AIConfig>(defaultConfig)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  // 从localStorage加载配置
  useEffect(() => {
    if (isOpen) {
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
      alert(t.editor.aiConfig.pleaseEnterApiKey)
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
        
        alert(t.editor.aiConfig.saveSuccess)
        onClose()
        return
      }

      // 验证API配置
      setIsValidating(true)
      const { aiService } = await import('@/services/aiService')
      const result = await aiService.validateConfig(config)
      
      if (!result.isValid) {
        alert(`${t.editor.aiConfig.validationFailed}: ${result.message}`)
        return
      }

      // 保存到本地存储
      localStorage.setItem('ai-config', JSON.stringify(config))
      
      // 更新AI服务配置
      aiService.updateConfig(config)
      
      // 调用回调
      onSave(config)
      
      alert(t.editor.aiConfig.saveSuccess)
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
      
      alert(errorMessage)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border border-gray-200 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.editor.aiConfig.title}</h2>
              <p className="text-sm text-gray-500">{t.editor.aiConfig.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-8">
            {/* 启用开关 */}
            <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 text-base">{t.editor.aiConfig.enableAI}</h3>
                </div>
                <p className="text-sm text-gray-500 ml-6">{t.editor.aiConfig.enableAIDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => updateConfig({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
              </label>
            </div>

            {config.enabled && (
              <div className="space-y-6">
                {/* 提供商选择 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4 px-1">
                    {t.editor.aiConfig.selectProvider}
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {aiProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                          config.provider === provider.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => selectProvider(provider.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-base">{provider.name}</h4>
                              {provider.free && (
                                <span className="px-2.5 py-0.5 bg-green-100/80 text-green-700 text-xs font-medium rounded-full border border-green-200/50">
                                  {t.editor.aiConfig.freeModel}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3 leading-relaxed">{provider.description}</p>
                            {provider.docUrl && (
                              <a
                                href={provider.docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="group-hover:underline decoration-blue-300 underline-offset-2">{t.editor.aiConfig.viewDocs}</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 ml-4 flex items-center justify-center transition-all ${
                            config.provider === provider.id
                              ? 'border-blue-500 bg-blue-500 shadow-sm'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {config.provider === provider.id && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API密钥输入 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 px-1">
                    <Key className="inline h-4 w-4 mr-2 text-gray-500" />
                    {t.editor.aiConfig.apiKey}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => updateConfig({ apiKey: e.target.value })}
                      placeholder={config.provider === 'free' ? t.editor.aiConfig.apiKeyAutoConfigured : t.editor.aiConfig.apiKeyPlaceholder}
                      disabled={config.provider === 'free'}
                      className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 ${
                        config.provider === 'free' 
                          ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                          : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed px-1">
                    {config.provider === 'free' 
                      ? t.editor.aiConfig.freeModelConfigured
                      : t.editor.aiConfig.apiKeyLocalStorage
                    }
                  </p>
                </div>

                {/* 自定义端点 */}
                {config.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 px-1">
                      <Globe className="inline h-4 w-4 mr-2 text-gray-500" />
                      {t.editor.aiConfig.apiEndpoint}
                    </label>
                    <input
                      type="url"
                      value={config.customEndpoint || ''}
                      onChange={(e) => updateConfig({ customEndpoint: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                    />
                  </div>
                )}

                {/* 模型选择 */}
                {selectedProvider && selectedProvider.models.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 px-1">
                      {t.editor.aiConfig.modelSelect}
                    </label>
                    <div className="relative">
                      <select
                        value={config.modelName}
                        onChange={(e) => updateConfig({ modelName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none transition-all duration-200"
                      >
                        {selectedProvider.models.map((model) => (
                          <option key={model} value={model}>
                            {model} {isModelFree(model) ? `(${t.editor.aiConfig.freeModel})` : `(${t.editor.aiConfig.paidModel})`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-1 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                      {t.editor.aiConfig.freeModelNote}
                    </p>
                  </div>
                )}

                {/* 验证结果 */}
                {validationResult && (
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-xl border ${
                      validationResult.isValid
                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                        : 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                    }`}
                  >
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{validationResult.message}</span>
                  </div>
                )}

                {/* 验证按钮 */}
                <button
                  onClick={validateConfig}
                  disabled={isValidating || !config.apiKey.trim()}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-gray-900 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>{t.editor.aiConfig.validating}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>{t.editor.aiConfig.validateConfig}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium hover:bg-white rounded-lg"
          >
            {t.editor.aiConfig.resetConfig}
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md text-sm font-medium"
            >
              {t.editor.aiConfig.saveConfig}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
