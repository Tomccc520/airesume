/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

'use client'

import { useCallback, useState } from 'react'
import { useExportProgress } from '@/hooks/useExportProgress'
import { ResumeData } from '@/types/resume'
import {
  exportResumeFile,
  exportResumeJsonFile,
  ResumeExportFormat
} from '@/services/resumeExportService'

export type EditorExportFormat = ResumeExportFormat | 'json'

interface UseEditorExportFlowOptions {
  resumeData: ResumeData
  resumeName: string
  exportSuccessMessage: string
  jsonExportSuccessMessage: string
  exportErrorMessage: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
  logger?: (...args: unknown[]) => void
}

/**
 * 编辑器导出工作流 Hook
 * 统一管理导出进度、状态和错误处理
 */
export function useEditorExportFlow({
  resumeData,
  resumeName,
  exportSuccessMessage,
  jsonExportSuccessMessage,
  exportErrorMessage,
  onSuccess,
  onError,
  logger
}: UseEditorExportFlowOptions) {
  const [isExporting, setIsExporting] = useState(false)
  const debugLog = useCallback((...args: unknown[]) => {
    if (logger) {
      logger(...args)
    }
  }, [logger])

  const {
    progress: exportProgress,
    estimatedTimeRemaining,
    exportStatus,
    isExporting: isExportInProgress,
    canCancel,
    startExport,
    updateProgress,
    setStep,
    completeExport,
    setError: setExportError,
    cancelExport,
    reset: resetExportProgress
  } = useExportProgress()

  /**
   * 执行导出动作
   * 在页面层只需调用该方法，不关心底层导出实现
   */
  const handleExport = useCallback(async (format: ResumeExportFormat) => {
    if (isExporting) {
      return
    }

    try {
      setIsExporting(true)
      startExport(1)

      await new Promise(resolve => requestAnimationFrame(resolve))

      const element = document.getElementById('resume-preview')
      if (!element) {
        onError('请等待简历预览加载完成后再导出')
        setExportError('预览元素未找到')
        return
      }

      await exportResumeFile({
        format,
        element,
        fileName: `${resumeName || '简历'}_${new Date().toISOString().split('T')[0]}.${format}`,
        onStep: (step) => setStep(step),
        onProgress: updateProgress,
        logger: debugLog
      })

      completeExport()
      onSuccess(exportSuccessMessage)

      setTimeout(() => {
        resetExportProgress()
      }, 3000)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : '导出失败')
      console.error(`${format.toUpperCase()}导出失败:`, error)
      onError(exportErrorMessage)
    } finally {
      setIsExporting(false)
    }
  }, [
    isExporting,
    onError,
    setExportError,
    resumeName,
    setStep,
    updateProgress,
    debugLog,
    completeExport,
    onSuccess,
    exportSuccessMessage,
    resetExportProgress,
    exportErrorMessage,
    startExport
  ])

  /**
   * 导出 JSON 数据
   * 统一复用导出服务，确保命名和异常处理一致
   */
  const handleExportJson = useCallback(async () => {
    if (isExporting) {
      return
    }

    try {
      setIsExporting(true)
      exportResumeJsonFile({
        resumeData,
        resumeName
      })
      onSuccess(jsonExportSuccessMessage)
    } catch (error) {
      console.error('JSON导出失败:', error)
      onError(exportErrorMessage)
    } finally {
      setIsExporting(false)
    }
  }, [
    isExporting,
    resumeData,
    resumeName,
    onSuccess,
    jsonExportSuccessMessage,
    onError,
    exportErrorMessage
  ])

  /**
   * 统一导出入口
   * 支持 PDF/PNG/JPG/JSON，供页面主链直接调用
   */
  const handleExportByFormat = useCallback(async (format: EditorExportFormat) => {
    if (format === 'json') {
      await handleExportJson()
      return
    }
    await handleExport(format)
  }, [handleExport, handleExportJson])

  return {
    isExporting,
    handleExport,
    handleExportJson,
    handleExportByFormat,
    exportProgress,
    estimatedTimeRemaining,
    exportStatus,
    isExportInProgress,
    canCancel,
    cancelExport,
    resetExportProgress
  }
}
