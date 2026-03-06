/**
 * @file hooks/useExportProgress.ts
 * @description 导出进度管理 Hook，管理导出进度状态、时间估算和取消操作
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import type { ExportStep, ExportStatus } from '@/components/export/ExportProgressIndicator'

/**
 * 导出进度状态接口
 */
export interface ExportProgress {
  /** 进度百分比 (0-100) */
  percentage: number
  /** 当前步骤 */
  step: ExportStep
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 开始时间 (timestamp) */
  startTime: number
  /** 预估完成时间 (timestamp) */
  estimatedEndTime: number
  /** 状态 */
  status: 'idle' | 'running' | 'complete' | 'error' | 'cancelled'
  /** 错误信息 */
  error?: string
}

/**
 * 导出进度 Hook 返回值接口
 */
export interface UseExportProgressReturn {
  /** 当前进度状态 */
  progress: ExportProgress
  /** 预估剩余时间（秒） */
  estimatedTimeRemaining: number | undefined
  /** 导出状态（用于 ExportProgressIndicator 组件） */
  exportStatus: ExportStatus
  /** 是否正在导出 */
  isExporting: boolean
  /** 是否可以取消 */
  canCancel: boolean
  /** 开始导出 */
  startExport: (totalPages?: number) => void
  /** 更新进度 */
  updateProgress: (percentage: number, step?: ExportStep, currentPage?: number) => void
  /** 设置当前步骤 */
  setStep: (step: ExportStep) => void
  /** 设置当前页码 */
  setCurrentPage: (page: number) => void
  /** 设置总页数 */
  setTotalPages: (pages: number) => void
  /** 完成导出 */
  completeExport: () => void
  /** 设置错误 */
  setError: (error: string) => void
  /** 取消导出 */
  cancelExport: () => void
  /** 重置状态 */
  reset: () => void
  /** 重试导出 */
  retry: () => void
}

/**
 * 初始进度状态
 */
const initialProgress: ExportProgress = {
  percentage: 0,
  step: 'preparing-styles',
  currentPage: 1,
  totalPages: 1,
  startTime: 0,
  estimatedEndTime: 0,
  status: 'idle',
  error: undefined
}

/**
 * 步骤权重配置（用于计算进度）
 */
const STEP_WEIGHTS: Record<ExportStep, { start: number; end: number }> = {
  'preparing-styles': { start: 0, end: 15 },
  'loading-fonts': { start: 15, end: 30 },
  'rendering-page': { start: 30, end: 85 },
  'generating-file': { start: 85, end: 100 },
  'complete': { start: 100, end: 100 },
  'error': { start: 0, end: 0 }
}

/**
 * 将 ExportProgress status 转换为 ExportStatus
 */
const mapToExportStatus = (status: ExportProgress['status'], step: ExportStep): ExportStatus => {
  switch (status) {
    case 'complete':
      return 'complete'
    case 'error':
      return 'error'
    case 'running':
      if (step === 'preparing-styles' || step === 'loading-fonts') {
        return 'preparing'
      } else if (step === 'rendering-page') {
        return 'rendering'
      } else if (step === 'generating-file') {
        return 'generating'
      }
      return 'preparing'
    case 'cancelled':
      return 'error'
    default:
      return 'preparing'
  }
}

/**
 * 计算预估剩余时间
 * 基于已用时间和当前进度计算
 */
const calculateEstimatedTimeRemaining = (
  startTime: number,
  currentPercentage: number
): number | undefined => {
  if (currentPercentage <= 0 || startTime === 0) {
    return undefined
  }

  const elapsedTime = Date.now() - startTime
  const elapsedSeconds = elapsedTime / 1000

  // 如果进度太小，不进行估算
  if (currentPercentage < 5) {
    return undefined
  }

  // 基于当前进度估算总时间
  const estimatedTotalTime = (elapsedSeconds / currentPercentage) * 100
  const remainingTime = estimatedTotalTime - elapsedSeconds

  // 返回剩余时间（至少1秒）
  return Math.max(1, Math.round(remainingTime))
}

/**
 * 导出进度管理 Hook
 * 
 * 提供导出进度状态管理、时间估算和取消操作支持
 * 
 * @example
 * ```tsx
 * const {
 *   progress,
 *   estimatedTimeRemaining,
 *   exportStatus,
 *   isExporting,
 *   startExport,
 *   updateProgress,
 *   completeExport,
 *   cancelExport
 * } = useExportProgress()
 * 
 * // 开始导出
 * startExport(3) // 3 页
 * 
 * // 更新进度
 * updateProgress(50, 'rendering-page', 2)
 * 
 * // 完成导出
 * completeExport()
 * ```
 * 
 * @returns {UseExportProgressReturn} 导出进度管理方法和状态
 */
export function useExportProgress(): UseExportProgressReturn {
  const [progress, setProgress] = useState<ExportProgress>(initialProgress)
  
  // 用于取消操作的 ref
  const cancelledRef = useRef<boolean>(false)
  
  // 计算预估剩余时间
  const estimatedTimeRemaining = useMemo(() => {
    if (progress.status !== 'running') {
      return undefined
    }
    return calculateEstimatedTimeRemaining(progress.startTime, progress.percentage)
  }, [progress.status, progress.startTime, progress.percentage])

  // 转换为 ExportStatus
  const exportStatus = useMemo(() => {
    return mapToExportStatus(progress.status, progress.step)
  }, [progress.status, progress.step])

  // 是否正在导出
  const isExporting = useMemo(() => {
    return progress.status === 'running'
  }, [progress.status])

  // 是否可以取消
  const canCancel = useMemo(() => {
    return progress.status === 'running' && progress.step !== 'complete'
  }, [progress.status, progress.step])

  /**
   * 开始导出
   */
  const startExport = useCallback((totalPages: number = 1) => {
    cancelledRef.current = false
    const now = Date.now()
    
    setProgress({
      percentage: 0,
      step: 'preparing-styles',
      currentPage: 1,
      totalPages: Math.max(1, totalPages),
      startTime: now,
      estimatedEndTime: 0,
      status: 'running',
      error: undefined
    })
  }, [])

  /**
   * 更新进度
   */
  const updateProgress = useCallback((
    percentage: number,
    step?: ExportStep,
    currentPage?: number
  ) => {
    if (cancelledRef.current) {
      return
    }

    setProgress(prev => {
      // 确保进度值在有效范围内
      const normalizedPercentage = Math.min(100, Math.max(0, percentage))
      
      // 计算预估完成时间
      let estimatedEndTime = prev.estimatedEndTime
      if (normalizedPercentage > 0 && prev.startTime > 0) {
        const elapsedTime = Date.now() - prev.startTime
        const estimatedTotalTime = (elapsedTime / normalizedPercentage) * 100
        estimatedEndTime = prev.startTime + estimatedTotalTime
      }

      return {
        ...prev,
        percentage: normalizedPercentage,
        step: step ?? prev.step,
        currentPage: currentPage !== undefined ? Math.max(1, currentPage) : prev.currentPage,
        estimatedEndTime,
        status: prev.status === 'running' ? 'running' : prev.status
      }
    })
  }, [])

  /**
   * 设置当前步骤
   */
  const setStep = useCallback((step: ExportStep) => {
    if (cancelledRef.current) {
      return
    }

    setProgress(prev => {
      // 根据步骤自动更新进度
      const stepWeight = STEP_WEIGHTS[step]
      const newPercentage = stepWeight ? stepWeight.start : prev.percentage

      return {
        ...prev,
        step,
        percentage: Math.max(prev.percentage, newPercentage)
      }
    })
  }, [])

  /**
   * 设置当前页码
   */
  const setCurrentPage = useCallback((page: number) => {
    if (cancelledRef.current) {
      return
    }

    setProgress(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }))
  }, [])

  /**
   * 设置总页数
   */
  const setTotalPages = useCallback((pages: number) => {
    setProgress(prev => ({
      ...prev,
      totalPages: Math.max(1, pages),
      currentPage: Math.min(prev.currentPage, Math.max(1, pages))
    }))
  }, [])

  /**
   * 完成导出
   */
  const completeExport = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      percentage: 100,
      step: 'complete',
      status: 'complete',
      estimatedEndTime: Date.now(),
      error: undefined
    }))
  }, [])

  /**
   * 设置错误
   */
  const setError = useCallback((error: string) => {
    setProgress(prev => ({
      ...prev,
      step: 'error',
      status: 'error',
      error
    }))
  }, [])

  /**
   * 取消导出
   */
  const cancelExport = useCallback(() => {
    cancelledRef.current = true
    setProgress(prev => ({
      ...prev,
      status: 'cancelled',
      error: '导出已取消 / Export cancelled'
    }))
  }, [])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    cancelledRef.current = false
    setProgress(initialProgress)
  }, [])

  /**
   * 重试导出
   */
  const retry = useCallback(() => {
    setProgress(prev => ({
      ...initialProgress,
      totalPages: prev.totalPages
    }))
    cancelledRef.current = false
  }, [])

  return {
    progress,
    estimatedTimeRemaining,
    exportStatus,
    isExporting,
    canCancel,
    startExport,
    updateProgress,
    setStep,
    setCurrentPage,
    setTotalPages,
    completeExport,
    setError,
    cancelExport,
    reset,
    retry
  }
}

/**
 * 导出进度工具函数
 */
export const exportProgressUtils = {
  /**
   * 计算基于步骤和页码的进度百分比
   */
  calculateProgressPercentage: (
    step: ExportStep,
    currentPage: number,
    totalPages: number
  ): number => {
    const stepWeight = STEP_WEIGHTS[step]
    if (!stepWeight) {
      return 0
    }

    // 对于渲染页面步骤，根据页码计算进度
    if (step === 'rendering-page' && totalPages > 1) {
      const stepRange = stepWeight.end - stepWeight.start
      const pageProgress = (currentPage / totalPages) * stepRange
      return Math.round(stepWeight.start + pageProgress)
    }

    return stepWeight.start
  },

  /**
   * 获取步骤的进度范围
   */
  getStepProgressRange: (step: ExportStep): { start: number; end: number } => {
    return STEP_WEIGHTS[step] || { start: 0, end: 0 }
  },

  /**
   * 验证进度状态是否有效
   */
  isValidProgress: (progress: ExportProgress): boolean => {
    // 进度百分比必须在 0-100 范围内
    if (progress.percentage < 0 || progress.percentage > 100) {
      return false
    }

    // 当前页码必须 >= 1 且 <= 总页数
    if (progress.currentPage < 1 || progress.currentPage > progress.totalPages) {
      return false
    }

    // 总页数必须 >= 1
    if (progress.totalPages < 1) {
      return false
    }

    return true
  },

  /**
   * 格式化剩余时间为可读字符串
   */
  formatTimeRemaining: (seconds: number | undefined): { zh: string; en: string } | null => {
    if (seconds === undefined || seconds <= 0) {
      return null
    }

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
}

export default useExportProgress
