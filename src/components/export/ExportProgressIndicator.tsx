/**
 * @file components/export/ExportProgressIndicator.tsx
 * @description 导出进度指示器组件，显示导出操作的进度、步骤描述、页码和状态
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  RefreshCw,
  FileText,
  Type,
  ImageIcon,
  FileDown,
  Clock
} from 'lucide-react'

/**
 * 导出步骤类型
 */
export type ExportStep =
  | 'preparing-styles'    // 准备样式
  | 'loading-fonts'       // 加载字体
  | 'rendering-page'      // 渲染页面
  | 'generating-file'     // 生成文件
  | 'complete'            // 完成
  | 'error'               // 错误

/**
 * 导出状态类型
 */
export type ExportStatus = 'preparing' | 'rendering' | 'generating' | 'complete' | 'error'

/**
 * 导出进度指示器属性接口
 */
export interface ExportProgressIndicatorProps {
  /** 当前进度 (0-100) */
  progress: number
  /** 当前步骤描述 */
  currentStep: ExportStep
  /** 当前页码（多页导出时） */
  currentPage?: number
  /** 总页数（多页导出时） */
  totalPages?: number
  /** 预估剩余时间（秒） */
  estimatedTimeRemaining?: number
  /** 是否可取消 */
  cancellable?: boolean
  /** 取消回调 */
  onCancel?: () => void
  /** 导出状态 */
  status: ExportStatus
  /** 错误信息 */
  errorMessage?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 步骤配置接口
 */
interface StepConfig {
  icon: React.ReactNode
  labelZh: string
  labelEn: string
}

/**
 * 获取步骤配置
 */
const getStepConfig = (step: ExportStep): StepConfig => {
  const iconClass = 'w-4 h-4'
  
  switch (step) {
    case 'preparing-styles':
      return {
        icon: <FileText className={iconClass} />,
        labelZh: '准备样式',
        labelEn: 'Preparing styles'
      }
    case 'loading-fonts':
      return {
        icon: <Type className={iconClass} />,
        labelZh: '加载字体',
        labelEn: 'Loading fonts'
      }
    case 'rendering-page':
      return {
        icon: <ImageIcon className={iconClass} />,
        labelZh: '渲染页面',
        labelEn: 'Rendering page'
      }
    case 'generating-file':
      return {
        icon: <FileDown className={iconClass} />,
        labelZh: '生成文件',
        labelEn: 'Generating file'
      }
    case 'complete':
      return {
        icon: <CheckCircle className={iconClass} />,
        labelZh: '导出完成',
        labelEn: 'Export complete'
      }
    case 'error':
      return {
        icon: <XCircle className={iconClass} />,
        labelZh: '导出失败',
        labelEn: 'Export failed'
      }
    default:
      return {
        icon: <Loader2 className={`${iconClass} animate-spin`} />,
        labelZh: '处理中',
        labelEn: 'Processing'
      }
  }
}

/**
 * 格式化剩余时间
 */
const formatTimeRemaining = (seconds: number): { zh: string; en: string } => {
  if (seconds < 60) {
    return {
      zh: `约 ${Math.ceil(seconds)} 秒`,
      en: `~${Math.ceil(seconds)}s`
    }
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.ceil(seconds % 60)
  return {
    zh: `约 ${minutes} 分 ${remainingSeconds} 秒`,
    en: `~${minutes}m ${remainingSeconds}s`
  }
}

/**
 * 导出进度指示器组件
 * 
 * 显示导出操作的进度、步骤描述、页码和状态
 * 支持取消操作和错误状态显示
 * 
 * @example
 * ```tsx
 * <ExportProgressIndicator
 *   progress={50}
 *   currentStep="rendering-page"
 *   currentPage={2}
 *   totalPages={3}
 *   status="rendering"
 *   cancellable
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 */
export function ExportProgressIndicator({
  progress,
  currentStep,
  currentPage,
  totalPages,
  estimatedTimeRemaining,
  cancellable = false,
  onCancel,
  status,
  errorMessage,
  onRetry,
  className = ''
}: ExportProgressIndicatorProps) {
  // 确保进度值在有效范围内 (0-100)
  const normalizedProgress = useMemo(() => {
    return Math.min(100, Math.max(0, progress))
  }, [progress])

  // 获取当前步骤配置
  const stepConfig = useMemo(() => getStepConfig(currentStep), [currentStep])

  // 获取状态样式配置
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'complete':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          progressColor: 'bg-green-500',
          textColor: 'text-green-700',
          iconColor: 'text-green-600'
        }
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
          textColor: 'text-red-700',
          iconColor: 'text-red-600'
        }
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          progressColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-600'
        }
    }
  }, [status])

  // 处理取消操作
  const handleCancel = useCallback(() => {
    if (cancellable && onCancel) {
      onCancel()
    }
  }, [cancellable, onCancel])

  // 处理重试操作
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])

  // 格式化的剩余时间
  const formattedTime = useMemo(() => {
    if (estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0) {
      return formatTimeRemaining(estimatedTimeRemaining)
    }
    return null
  }, [estimatedTimeRemaining])

  // 页码显示文本
  const pageText = useMemo(() => {
    if (currentPage !== undefined && totalPages !== undefined && totalPages > 1) {
      return {
        zh: `正在处理第 ${currentPage}/${totalPages} 页`,
        en: `Processing page ${currentPage}/${totalPages}`
      }
    }
    return null
  }, [currentPage, totalPages])

  return (
    <div
      className={`
        rounded-lg border p-4
        ${statusConfig.bgColor}
        ${statusConfig.borderColor}
        ${className}
      `}
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Export progress"
    >
      {/* 头部：步骤信息和取消按钮 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={statusConfig.iconColor}>
            {status === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : status === 'complete' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </span>
          <div className="flex flex-col">
            <span className={`font-medium ${statusConfig.textColor}`}>
              {stepConfig.labelZh}
            </span>
            <span className="text-xs text-gray-500">
              {stepConfig.labelEn}
            </span>
          </div>
        </div>

        {/* 取消按钮 */}
        {cancellable && status !== 'complete' && status !== 'error' && (
          <button
            onClick={handleCancel}
            className="
              p-1.5 rounded-full
              text-gray-400 hover:text-gray-600
              hover:bg-gray-100
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-gray-300
            "
            aria-label="取消导出 / Cancel export"
            title="取消导出 / Cancel export"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 进度条 */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${statusConfig.progressColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* 进度信息 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* 百分比 */}
          <span className={`font-semibold ${statusConfig.textColor}`}>
            {Math.round(normalizedProgress)}%
          </span>

          {/* 页码信息 */}
          {pageText && status !== 'complete' && status !== 'error' && (
            <span className="text-gray-500 text-xs">
              {pageText.zh}
            </span>
          )}
        </div>

        {/* 预估剩余时间 */}
        {formattedTime && status !== 'complete' && status !== 'error' && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formattedTime.zh}</span>
          </div>
        )}
      </div>

      {/* 错误状态显示 */}
      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-red-200"
          >
            <p className="text-sm text-red-600 mb-3">
              {errorMessage}
            </p>
            {onRetry && (
              <button
                onClick={handleRetry}
                className="
                  inline-flex items-center gap-2
                  px-3 py-1.5 rounded-md
                  bg-red-100 hover:bg-red-200
                  text-red-700 text-sm font-medium
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-red-300
                "
              >
                <RefreshCw className="w-4 h-4" />
                <span>重试 / Retry</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 完成状态显示 */}
      <AnimatePresence>
        {status === 'complete' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-green-200"
          >
            <p className="text-sm text-green-600">
              导出已完成，文件已准备好下载
            </p>
            <p className="text-xs text-green-500 mt-1">
              Export complete, file is ready for download
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 导出步骤列表组件
 * 显示所有导出步骤及其状态
 */
export interface ExportStepsListProps {
  /** 当前步骤 */
  currentStep: ExportStep
  /** 导出状态 */
  status: ExportStatus
  /** 自定义类名 */
  className?: string
}

const EXPORT_STEPS: ExportStep[] = [
  'preparing-styles',
  'loading-fonts',
  'rendering-page',
  'generating-file',
  'complete'
]

/**
 * 获取步骤状态
 */
const getStepStatus = (
  step: ExportStep,
  currentStep: ExportStep,
  status: ExportStatus
): 'completed' | 'current' | 'pending' | 'error' => {
  if (status === 'error' && step === currentStep) {
    return 'error'
  }
  
  const currentIndex = EXPORT_STEPS.indexOf(currentStep)
  const stepIndex = EXPORT_STEPS.indexOf(step)
  
  if (stepIndex < currentIndex) {
    return 'completed'
  } else if (stepIndex === currentIndex) {
    return 'current'
  }
  return 'pending'
}

/**
 * 导出步骤列表组件
 */
export function ExportStepsList({
  currentStep,
  status,
  className = ''
}: ExportStepsListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {EXPORT_STEPS.filter(step => step !== 'complete').map((step) => {
        const stepStatus = getStepStatus(step, currentStep, status)
        const config = getStepConfig(step)
        
        return (
          <div
            key={step}
            className={`
              flex items-center gap-3 p-2 rounded-md
              ${stepStatus === 'current' ? 'bg-blue-50' : ''}
              ${stepStatus === 'completed' ? 'bg-green-50' : ''}
              ${stepStatus === 'error' ? 'bg-red-50' : ''}
              ${stepStatus === 'pending' ? 'bg-gray-50' : ''}
            `}
          >
            <span
              className={`
                flex-shrink-0
                ${stepStatus === 'current' ? 'text-blue-600' : ''}
                ${stepStatus === 'completed' ? 'text-green-600' : ''}
                ${stepStatus === 'error' ? 'text-red-600' : ''}
                ${stepStatus === 'pending' ? 'text-gray-400' : ''}
              `}
            >
              {stepStatus === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : stepStatus === 'error' ? (
                <XCircle className="w-4 h-4" />
              ) : stepStatus === 'current' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`
                  text-sm font-medium truncate
                  ${stepStatus === 'current' ? 'text-blue-700' : ''}
                  ${stepStatus === 'completed' ? 'text-green-700' : ''}
                  ${stepStatus === 'error' ? 'text-red-700' : ''}
                  ${stepStatus === 'pending' ? 'text-gray-500' : ''}
                `}
              >
                {config.labelZh}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {config.labelEn}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ExportProgressIndicator
