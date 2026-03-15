'use client'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description AI 分步生成主模态框
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ResumeData } from '@/types/resume'
import { GenerationMode, GenerationSession, UserGenerationInfo, StepCallbacks } from '@/types/stepwise'
import { StepwiseGeneratorService } from '@/services/stepwiseGeneratorService'
import { ModeSelectionDialog } from './ModeSelectionDialog'
import { StepList } from './StepList'
import { StepPreview } from './StepPreview'
import { StepControls } from './StepControls'
import { FinalReviewPanel } from './FinalReviewPanel'

interface StepwiseGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: Partial<ResumeData>) => void
  initialUserInfo?: UserGenerationInfo
}

type ModalPhase = 'userInfo' | 'modeSelection' | 'generating' | 'finalReview'

export function StepwiseGeneratorModal({
  isOpen,
  onClose,
  onComplete,
  initialUserInfo
}: StepwiseGeneratorModalProps) {
  const { t } = useLanguage()
  const serviceRef = useRef<StepwiseGeneratorService>(new StepwiseGeneratorService())
  
  const [phase, setPhase] = useState<ModalPhase>('userInfo')
  const [session, setSession] = useState<GenerationSession | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [userInfo, setUserInfo] = useState<UserGenerationInfo>(
    initialUserInfo || { name: '', targetPosition: '', industry: '', experienceLevel: 'mid' }
  )

  const defaultMode = serviceRef.current.getSavedModePreference()

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('userInfo')
      setSession(null)
      setStreamingContent('')
      setEditedContent('')
    }
  }, [isOpen])

  /**
   * 生成回调集合
   * 使用 useMemo 固定回调引用，避免 Hook 依赖抖动导致的重复告警。
   */
  const callbacks = useMemo<StepCallbacks>(() => ({
    onStepStart: (_step) => {
      setStreamingContent('')
      setSession(serviceRef.current.getSession())
    },
    onStepProgress: (_step, content) => {
      setStreamingContent(content)
    },
    onStepComplete: (step) => {
      setSession(serviceRef.current.getSession())
      setEditedContent(step.content || '')
    },
    onStepError: (_step, _error) => {
      setSession(serviceRef.current.getSession())
    },
    onSessionComplete: (sessionData) => {
      setSession(sessionData)
      if (sessionData.mode === 'quick') {
        setPhase('finalReview')
      }
    },
    onModeChange: (_mode) => {
      setSession(serviceRef.current.getSession())
    }
  }), [])

  const handleSelectMode = useCallback((mode: GenerationMode) => {
    const newSession = serviceRef.current.initSession(userInfo, mode)
    setSession(newSession)
    setPhase('generating')
    // Start generation after state update
    setTimeout(() => {
      serviceRef.current.startGeneration(callbacks)
    }, 100)
  }, [userInfo, callbacks])

  const handleConfirm = useCallback(() => {
    serviceRef.current.confirmStep(editedContent || undefined)
    setSession(serviceRef.current.getSession())
    setStreamingContent('')
    // Continue generation
    serviceRef.current.startGeneration(callbacks)
  }, [editedContent, callbacks])

  const handleSkip = useCallback(() => {
    serviceRef.current.skipStep()
    setSession(serviceRef.current.getSession())
    setStreamingContent('')
    serviceRef.current.startGeneration(callbacks)
  }, [callbacks])

  const handleRegenerate = useCallback(async (stepIndex?: number) => {
    await serviceRef.current.regenerateStep(stepIndex)
    setSession(serviceRef.current.getSession())
  }, [])

  // 重新生成全部
  const handleRegenerateAll = useCallback(async () => {
    if (!session) return
    // 重置所有步骤状态
    serviceRef.current.resetAllSteps()
    setSession(serviceRef.current.getSession())
    setPhase('generating')
    // 重新开始生成
    setTimeout(() => {
      serviceRef.current.startGeneration(callbacks)
    }, 100)
  }, [session, callbacks])

  // AI 优化单个步骤
  const handleOptimizeStep = useCallback(async (stepIndex: number, prompt: string) => {
    await serviceRef.current.regenerateStepWithPrompt(stepIndex, prompt)
    setSession(serviceRef.current.getSession())
  }, [])

  const handlePause = useCallback(() => {
    serviceRef.current.pauseGeneration()
    setSession(serviceRef.current.getSession())
  }, [])

  const handleResume = useCallback(() => {
    serviceRef.current.resumeGeneration()
    setSession(serviceRef.current.getSession())
    serviceRef.current.startGeneration(callbacks)
  }, [callbacks])

  const handleSwitchToQuick = useCallback(() => {
    serviceRef.current.switchToQuickMode()
    setSession(serviceRef.current.getSession())
  }, [])

  const handleToggleSelection = useCallback((index: number) => {
    serviceRef.current.toggleStepSelection(index)
    setSession(serviceRef.current.getSession())
  }, [])

  const handleSelectAll = useCallback(() => {
    serviceRef.current.selectAllSteps()
    setSession(serviceRef.current.getSession())
  }, [])

  const handleDeselectAll = useCallback(() => {
    serviceRef.current.deselectAllSteps()
    setSession(serviceRef.current.getSession())
  }, [])

  const handleApply = useCallback(() => {
    const result = serviceRef.current.applyToResume()
    onComplete(result)
    onClose()
  }, [onComplete, onClose])

  const handleStepClick = useCallback((index: number) => {
    // Navigate to step for viewing
    const step = serviceRef.current.navigateToStep(index)
    if (step) {
      setEditedContent(step.content || '')
    }
  }, [])

  const handleClose = useCallback(() => {
    serviceRef.current.cancelGeneration()
    onClose()
  }, [onClose])

  if (!isOpen) return null

  const currentStep = session?.steps[session.currentStepIndex]
  const progress = serviceRef.current.calculateProgress()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl h-[80vh] mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI 智能生成
            </h2>
            {session && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress.completed}/{progress.total} {t.stepwise?.progress?.completed || '已完成'}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            {/* User Info Phase */}
            {phase === 'userInfo' && (
              <div className="h-full p-6 overflow-auto">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t.stepwise?.userInfo?.title || '填写基本信息'}
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.stepwise?.userInfo?.name || '姓名'}
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.stepwise?.userInfo?.namePlaceholder || '请输入您的姓名'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.stepwise?.userInfo?.targetPosition || '目标职位'}
                    </label>
                    <input
                      type="text"
                      value={userInfo.targetPosition}
                      onChange={e => setUserInfo(prev => ({ ...prev, targetPosition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.stepwise?.userInfo?.targetPositionPlaceholder || '请输入目标职位'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.stepwise?.userInfo?.industry || '行业'}
                    </label>
                    <input
                      type="text"
                      value={userInfo.industry}
                      onChange={e => setUserInfo(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.stepwise?.userInfo?.industryPlaceholder || '请输入所在行业'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.stepwise?.userInfo?.experienceLevel || '经验水平'}
                    </label>
                    <select
                      value={userInfo.experienceLevel}
                      onChange={e => setUserInfo(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="junior">{t.stepwise?.userInfo?.junior || '初级 (0-2年)'}</option>
                      <option value="mid">{t.stepwise?.userInfo?.mid || '中级 (3-5年)'}</option>
                      <option value="senior">{t.stepwise?.userInfo?.senior || '高级 (5-8年)'}</option>
                      <option value="lead">{t.stepwise?.userInfo?.lead || '资深 (8年以上)'}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setPhase('modeSelection')}
                    disabled={!userInfo.name || !userInfo.targetPosition}
                    className={`w-full mt-4 px-4 py-3 rounded-lg font-medium transition-colors ${
                      userInfo.name && userInfo.targetPosition
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {t.stepwise?.userInfo?.startGeneration || '开始生成'}
                  </button>
                </div>
              </div>
            )}

            {/* Mode Selection */}
            <ModeSelectionDialog
              isOpen={phase === 'modeSelection'}
              defaultMode={defaultMode}
              onSelectMode={handleSelectMode}
              onClose={() => setPhase('userInfo')}
            />

            {/* Generating Phase */}
            {phase === 'generating' && session && (
              <div className="h-full flex">
                {/* Left: Step List */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-auto">
                  <StepList
                    steps={session.steps}
                    currentStepIndex={session.currentStepIndex}
                    onStepClick={handleStepClick}
                  />
                </div>
                {/* Right: Preview */}
                <div className="flex-1 p-4 flex flex-col">
                  {currentStep && (
                    <>
                      <div className="flex-1 overflow-auto">
                        <StepPreview
                          step={currentStep}
                          streamingContent={streamingContent}
                          isEditable={session.mode === 'stepByStep' && currentStep.status === 'completed'}
                          onContentChange={setEditedContent}
                          onRetry={() => handleRegenerate()}
                          onSkip={handleSkip}
                          onOptimize={(prompt) => handleOptimizeStep(session.currentStepIndex, prompt)}
                        />
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <StepControls
                          step={currentStep}
                          mode={session.mode}
                          isPaused={session.isPaused}
                          onConfirm={handleConfirm}
                          onSkip={handleSkip}
                          onRegenerate={() => handleRegenerate()}
                          onPause={handlePause}
                          onResume={handleResume}
                          onSwitchToQuick={handleSwitchToQuick}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Final Review Phase */}
            {phase === 'finalReview' && session && (
              <div className="h-full p-4">
                <FinalReviewPanel
                  session={session}
                  onToggleSelection={handleToggleSelection}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onApply={handleApply}
                  onRegenerate={handleRegenerate}
                  onRegenerateAll={handleRegenerateAll}
                  onOptimizeStep={handleOptimizeStep}
                />
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

// 默认导出，用于动态导入
export default StepwiseGeneratorModal
