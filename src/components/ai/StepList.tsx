'use client'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 生成步骤列表组件
 */

import { useCallback } from 'react'
import { User, Briefcase, GraduationCap, Wrench, FolderOpen, Check, Loader2, AlertCircle, SkipForward } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { GenerationStep, StepStatus } from '@/types/stepwise'

interface StepListProps {
  steps: GenerationStep[]
  currentStepIndex: number
  onStepClick: (index: number) => void
}

const STEP_ICONS = {
  summary: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen
}

const STATUS_COLORS: Record<StepStatus, string> = {
  pending: 'bg-gray-100 text-gray-400 dark:bg-gray-700',
  generating: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50',
  completed: 'bg-green-100 text-green-600 dark:bg-green-900/50',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/50',
  skipped: 'bg-gray-100 text-gray-400 dark:bg-gray-700'
}

export function StepList({ steps, currentStepIndex, onStepClick }: StepListProps) {
  const { t } = useLanguage()

  const getStatusIcon = useCallback((status: StepStatus) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <Check className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'skipped':
        return <SkipForward className="w-4 h-4" />
      default:
        return null
    }
  }, [])

  const getStepTitle = useCallback((type: string) => {
    const titles: Record<string, string> = {
      summary: t.stepwise?.steps?.summary || '个人简介',
      experience: t.stepwise?.steps?.experience || '工作经历',
      education: t.stepwise?.steps?.education || '教育背景',
      skills: t.stepwise?.steps?.skills || '技能特长',
      projects: t.stepwise?.steps?.projects || '项目经历'
    }
    return titles[type] || type
  }, [t])

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.type]
        const isActive = index === currentStepIndex
        const isClickable = step.status === 'completed' || step.status === 'error'

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : isClickable
                ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                : 'cursor-default'
            }`}
          >
            <div className={`p-2 rounded-lg ${STATUS_COLORS[step.status]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {getStepTitle(step.type)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.stepwise?.status?.[step.status] || step.status}
              </div>
            </div>
            <div className={STATUS_COLORS[step.status].replace('bg-', 'text-').split(' ')[0]}>
              {getStatusIcon(step.status)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
