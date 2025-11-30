/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { useEffect, useRef, useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'

interface UseAutoSaveOptions {
  /** 自动保存间隔时间（毫秒），默认3秒 */
  interval?: number
  /** 是否启用自动保存，默认true */
  enabled?: boolean
  /** 保存成功回调 */
  onSaveSuccess?: () => void
  /** 保存失败回调 */
  onSaveError?: (error: Error) => void
}

interface UseAutoSaveReturn {
  /** 是否正在保存 */
  isSaving: boolean
  /** 最后保存时间 */
  lastSavedAt: Date | null
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean
  /** 手动触发保存 */
  saveNow: () => Promise<void>
  /** 保存状态文本 */
  saveStatusText: string
}

/**
 * 自动保存Hook
 * 提供简历数据的自动保存功能
 */
export function useAutoSave(
  data: ResumeData,
  saveFunction: (data: ResumeData) => Promise<void>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    interval = 3000,
    enabled = true,
    onSaveSuccess,
    onSaveError
  } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatusText, setSaveStatusText] = useState('已保存')

  const dataRef = useRef(data)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>('')

  /**
   * 执行保存操作
   * @copyright Tomda (https://www.tomda.top)
   * @copyright UIED技术团队 (https://fsuied.com)
   * @author UIED技术团队
   * @createDate 2025-9-22
   */
  const performSave = useCallback(async (currentData: ResumeData) => {
    if (isSaving) return

    try {
      setIsSaving(true)
      setSaveStatusText('保存中...')
      
      await saveFunction(currentData)
      
      const now = new Date()
      setLastSavedAt(now)
      setHasUnsavedChanges(false)
      setSaveStatusText('已保存')
      lastSavedDataRef.current = JSON.stringify(currentData)
      
      onSaveSuccess?.()
    } catch (error) {
      console.error('自动保存失败:', error)
      setSaveStatusText('保存失败')
      onSaveError?.(error as Error)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, saveFunction, onSaveSuccess, onSaveError])

  /**
   * 检查数据是否发生变化
   * @copyright Tomda (https://www.tomda.top)
   * @copyright UIED技术团队 (https://fsuied.com)
   * @author UIED技术团队
   * @createDate 2025-9-22
   */
  const checkForChanges = useCallback((newData: ResumeData) => {
    const newDataString = JSON.stringify(newData)
    const hasChanges = newDataString !== lastSavedDataRef.current
    
    if (hasChanges && !hasUnsavedChanges) {
      setHasUnsavedChanges(true)
      setSaveStatusText('有未保存的更改')
    }
    
    return hasChanges
  }, [hasUnsavedChanges])

  /**
   * 手动触发保存
   * @copyright Tomda (https://www.tomda.top)
   * @copyright UIED技术团队 (https://fsuied.com)
   * @author UIED技术团队
   * @createDate 2025-9-22
   */
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await performSave(dataRef.current)
  }, [performSave])

  /**
   * 监听数据变化并触发自动保存
   * 优化：将变更检测移至定时器回调中，避免每次渲染都执行JSON.stringify
   */
  useEffect(() => {
    dataRef.current = data
    
    if (!enabled) return

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 设置新的定时器 - 延迟检测和保存
    timeoutRef.current = setTimeout(() => {
      // 在定时器回调中进行变更检测（JSON.stringify），避免阻塞主线程
      const hasChanges = checkForChanges(data)
      
      if (hasChanges) {
        performSave(data)
      }
    }, interval)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, interval, checkForChanges, performSave])

  /**
   * 组件卸载时清理定时器
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  /**
   * 页面卸载前保存数据
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '您有未保存的更改，确定要离开吗？'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  return {
    isSaving,
    lastSavedAt,
    hasUnsavedChanges,
    saveNow,
    saveStatusText
  }
}