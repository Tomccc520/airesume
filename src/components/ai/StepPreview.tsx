'use client'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 步骤内容预览组件
 */

import { useCallback, useState } from 'react'
import { AlertCircle, RefreshCw, SkipForward, Loader2, Sparkles, Send } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { GenerationStep } from '@/types/stepwise'

interface StepPreviewProps {
  step: GenerationStep
  streamingContent: string
  isEditable: boolean
  onContentChange: (content: string) => void
  onRetry?: () => void
  onSkip?: () => void
  onOptimize?: (prompt: string) => void
}

export function StepPreview({
  step,
  streamingContent,
  isEditable,
  onContentChange,
  onRetry,
  onSkip,
  onOptimize
}: StepPreviewProps) {
  const { t, locale } = useLanguage()
  const [optimizePrompt, setOptimizePrompt] = useState('')
  const [showOptimizeInput, setShowOptimizeInput] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value)
  }, [onContentChange])

  const handleOptimize = useCallback(() => {
    if (onOptimize && optimizePrompt.trim()) {
      onOptimize(optimizePrompt.trim())
      setOptimizePrompt('')
      setShowOptimizeInput(false)
    }
  }, [onOptimize, optimizePrompt])

  const quickOptimizeOptions = locale === 'zh' ? [
    { label: '更专业', prompt: '使用更专业的语言优化这段内容' },
    { label: '更简洁', prompt: '精简这段内容，保留核心信息' },
    { label: '更详细', prompt: '扩展这段内容，增加更多细节' },
    { label: '突出成果', prompt: '突出量化成果和核心贡献' }
  ] : [
    { label: 'Professional', prompt: 'Make this content more professional' },
    { label: 'Concise', prompt: 'Make this content more concise' },
    { label: 'Detailed', prompt: 'Expand this content with more details' },
    { label: 'Results', prompt: 'Highlight quantified results and contributions' }
  ]

  // 生成中状态
  if (step.status === 'generating') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">
            {t.stepwise?.progress?.generating || '正在生成...'}
          </span>
        </div>
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {streamingContent || '...'}
            <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
          </p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (step.status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t.stepwise?.status?.error || '生成出错'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {step.error || t.stepwise?.errors?.unknown || '生成失败，请重试'}
        </p>
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t.stepwise?.controls?.regenerate || '重新生成'}
            </button>
          )}
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              {t.stepwise?.controls?.skip || '跳过'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // 已完成状态 - 可编辑或只读
  if (step.status === 'completed') {
    const content = step.content || ''
    
    if (isEditable) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.stepwise?.finalReview?.preview || '预览'} - {locale === 'zh' ? '可编辑' : 'Editable'}
            </div>
            {onOptimize && (
              <button
                onClick={() => setShowOptimizeInput(!showOptimizeInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showOptimizeInput
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {locale === 'zh' ? 'AI优化' : 'AI Optimize'}
              </button>
            )}
          </div>
          
          {/* AI 优化输入区域 */}
          {showOptimizeInput && onOptimize && (
            <div className="mb-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickOptimizeOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOptimize(option.prompt)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={optimizePrompt}
                    onChange={(e) => setOptimizePrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOptimize()}
                    placeholder={locale === 'zh' ? '输入自定义优化要求...' : 'Enter custom optimization request...'}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleOptimize}
                    disabled={!optimizePrompt.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <textarea
            value={content}
            onChange={handleChange}
            className="flex-1 w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-300"
            placeholder={locale === 'zh' ? '生成的内容将显示在这里...' : 'Generated content will appear here...'}
          />
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t.stepwise?.progress?.completed || '已完成'}
          </div>
          {onOptimize && (
            <button
              onClick={() => setShowOptimizeInput(!showOptimizeInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showOptimizeInput
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {locale === 'zh' ? 'AI优化' : 'AI Optimize'}
            </button>
          )}
        </div>
        
        {/* AI 优化输入区域 */}
        {showOptimizeInput && onOptimize && (
          <div className="mb-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickOptimizeOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOptimize(option.prompt)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={optimizePrompt}
                  onChange={(e) => setOptimizePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOptimize()}
                  placeholder={locale === 'zh' ? '输入自定义优化要求...' : 'Enter custom optimization request...'}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleOptimize}
                  disabled={!optimizePrompt.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    )
  }

  // 等待中或已跳过状态
  return (
    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
      <p>{step.status === 'skipped' ? (t.stepwise?.status?.skipped || '已跳过') : (t.stepwise?.status?.pending || '等待中')}</p>
    </div>
  )
}
