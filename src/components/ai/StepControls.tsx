'use client'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 步骤控制按钮组件
 */

import { Check, SkipForward, RefreshCw, Pause, Play, Zap, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { GenerationStep, GenerationMode } from '@/types/stepwise'

interface StepControlsProps {
  step: GenerationStep
  mode: GenerationMode
  isPaused: boolean
  onConfirm: () => void
  onSkip: () => void
  onRegenerate: () => void
  onPause: () => void
  onResume: () => void
  onSwitchToQuick?: () => void
  onOpenOptimize?: () => void
}

export function StepControls({
  step,
  mode,
  isPaused,
  onConfirm,
  onSkip,
  onRegenerate,
  onPause,
  onResume,
  onSwitchToQuick,
  onOpenOptimize
}: StepControlsProps) {
  const { t, locale } = useLanguage()

  const isGenerating = step.status === 'generating'
  const isCompleted = step.status === 'completed'
  const isError = step.status === 'error'
  const isStepByStep = mode === 'stepByStep'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 确认按钮 - 仅逐步模式且已完成时显示 */}
      {isStepByStep && isCompleted && (
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Check className="w-4 h-4" />
          {t.stepwise?.controls?.confirm || '确认'}
        </button>
      )}

      {/* AI优化按钮 - 已完成时显示 */}
      {isCompleted && onOpenOptimize && (
        <button
          onClick={onOpenOptimize}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {locale === 'zh' ? 'AI优化' : 'AI Optimize'}
        </button>
      )}

      {/* 跳过按钮 */}
      {(isGenerating || isCompleted || isError) && (
        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          {t.stepwise?.controls?.skip || '跳过'}
        </button>
      )}

      {/* 重新生成按钮 */}
      {(isCompleted || isError) && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t.stepwise?.controls?.regenerate || '重新生成'}
        </button>
      )}

      {/* 暂停/继续按钮 */}
      {isGenerating && (
        isPaused ? (
          <button
            onClick={onResume}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Play className="w-4 h-4" />
            {t.stepwise?.controls?.resume || '继续'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            <Pause className="w-4 h-4" />
            {t.stepwise?.controls?.pause || '暂停'}
          </button>
        )
      )}

      {/* 切换到快速模式按钮 - 仅逐步模式时显示 */}
      {isStepByStep && onSwitchToQuick && (
        <button
          onClick={onSwitchToQuick}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          <Zap className="w-4 h-4" />
          {t.stepwise?.controls?.switchToQuick || '切换到快速模式'}
        </button>
      )}
    </div>
  )
}
