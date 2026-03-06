/**
 * AI Config Guide Component
 * AI 配置引导组件 - 检测配置是否完整并显示设置引导
 * 
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-01-16
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Settings, Sparkles, AlertCircle, ArrowRight, X, Zap, Shield, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AIConfig } from '@/components/AIConfigModal'

export interface AIConfigStatus {
  isConfigured: boolean
  isEnabled: boolean
  provider: string | null
  modelName: string | null
  hasApiKey: boolean
}

interface AIConfigGuideProps {
  /** 打开配置弹窗的回调 */
  onOpenConfig: () => void
  /** 自定义类名 */
  className?: string
  /** 显示模式 */
  variant?: 'inline' | 'card' | 'banner' | 'minimal'
  /** 是否显示关闭按钮 */
  dismissible?: boolean
  /** 关闭回调 */
  onDismiss?: () => void
}

/**
 * 检查 AI 配置状态
 */
export function checkAIConfigStatus(): AIConfigStatus {
  try {
    const savedConfig = localStorage.getItem('ai-config')
    if (!savedConfig) {
      return {
        isConfigured: false,
        isEnabled: false,
        provider: null,
        modelName: null,
        hasApiKey: false
      }
    }

    const config: AIConfig = JSON.parse(savedConfig)
    
    // 免费模型不需要 API Key
    const needsApiKey = config.provider !== 'free'
    const hasApiKey = !needsApiKey || (config.apiKey && config.apiKey.trim().length > 0)
    
    return {
      isConfigured: Boolean(config.enabled && hasApiKey),
      isEnabled: Boolean(config.enabled),
      provider: config.provider,
      modelName: config.modelName,
      hasApiKey: Boolean(hasApiKey)
    }
  } catch (error) {
    console.error('Failed to check AI config:', error)
    return {
      isConfigured: false,
      isEnabled: false,
      provider: null,
      modelName: null,
      hasApiKey: false
    }
  }
}

/**
 * 使用 AI 配置状态的 Hook
 */
export function useAIConfigStatus() {
  const [status, setStatus] = useState<AIConfigStatus>(() => checkAIConfigStatus())

  useEffect(() => {
    // 初始检查
    setStatus(checkAIConfigStatus())

    // 监听 storage 变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai-config') {
        setStatus(checkAIConfigStatus())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const refresh = useCallback(() => {
    setStatus(checkAIConfigStatus())
  }, [])

  return { ...status, refresh }
}

/**
 * AI 配置引导组件
 */
export function AIConfigGuide({
  onOpenConfig,
  className = '',
  variant = 'card',
  dismissible = false,
  onDismiss
}: AIConfigGuideProps) {
  const { locale } = useLanguage()
  const configStatus = useAIConfigStatus()
  const [dismissed, setDismissed] = useState(false)

  // 获取引导内容 - 必须在所有条件返回之前调用
  const guideContent = useMemo(() => {
    if (!configStatus.isEnabled) {
      return {
        title: locale === 'zh' ? 'AI 助手未启用' : 'AI Assistant Not Enabled',
        description: locale === 'zh' 
          ? '启用 AI 助手，获得智能简历优化建议和内容生成功能' 
          : 'Enable AI Assistant for smart resume optimization and content generation',
        buttonText: locale === 'zh' ? '立即启用' : 'Enable Now'
      }
    }
    
    if (!configStatus.hasApiKey && configStatus.provider !== 'free') {
      return {
        title: locale === 'zh' ? 'API 密钥未配置' : 'API Key Not Configured',
        description: locale === 'zh' 
          ? '请配置 API 密钥以使用 AI 功能，或切换到免费模型' 
          : 'Please configure API key to use AI features, or switch to free model',
        buttonText: locale === 'zh' ? '配置密钥' : 'Configure Key'
      }
    }

    return {
      title: locale === 'zh' ? '配置 AI 助手' : 'Configure AI Assistant',
      description: locale === 'zh' 
        ? '完成配置后即可使用 AI 智能功能' 
        : 'Complete configuration to use AI features',
      buttonText: locale === 'zh' ? '开始配置' : 'Start Setup'
    }
  }, [configStatus.isEnabled, configStatus.hasApiKey, configStatus.provider, locale])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    onDismiss?.()
  }, [onDismiss])

  // 如果已配置或已关闭，不显示
  if (configStatus.isConfigured || dismissed) {
    return null
  }

  // 最小化模式
  if (variant === 'minimal') {
    return (
      <button
        onClick={onOpenConfig}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors ${className}`}
      >
        <AlertCircle className="w-4 h-4" />
        <span>{guideContent.buttonText}</span>
      </button>
    )
  }

  // 横幅模式
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">{guideContent.title}</p>
              <p className="text-xs text-amber-600">{guideContent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              {guideContent.buttonText}
            </button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // 内联模式
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 text-sm text-amber-600 ${className}`}
      >
        <AlertCircle className="w-4 h-4" />
        <span>{guideContent.title}</span>
        <button
          onClick={onOpenConfig}
          className="font-medium hover:underline"
        >
          {guideContent.buttonText}
        </button>
      </motion.div>
    )
  }

  // 卡片模式（默认）
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden ${className}`}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />

      {/* 关闭按钮 */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative p-6">
        {/* 图标 */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg shadow-blue-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 标题和描述 */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {guideContent.title}
          </h3>
          <p className="text-sm text-gray-500">
            {guideContent.description}
          </p>
        </div>

        {/* 功能亮点 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">
              {locale === 'zh' ? '智能生成' : 'Smart Gen'}
            </span>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">
              {locale === 'zh' ? '数据安全' : 'Secure'}
            </span>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">
              {locale === 'zh' ? '免费可用' : 'Free'}
            </span>
          </div>
        </div>

        {/* 配置按钮 */}
        <button
          onClick={onOpenConfig}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Settings className="w-4 h-4" />
          {guideContent.buttonText}
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 提示文字 */}
        <p className="text-center text-xs text-gray-400 mt-3">
          {locale === 'zh' 
            ? '免费模型无需 API 密钥，开箱即用' 
            : 'Free models work out of the box, no API key needed'}
        </p>
      </div>
    </motion.div>
  )
}

export default AIConfigGuide
