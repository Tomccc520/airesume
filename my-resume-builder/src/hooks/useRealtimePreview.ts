/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { useEffect, useRef, useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'

/**
 * 实时预览钩子
 * 提供防抖更新、变更检测和性能优化功能
 */
export function useRealtimePreview(resumeData: ResumeData, delay: number = 300) {
  const [previewData, setPreviewData] = useState<ResumeData>(resumeData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [updateCount, setUpdateCount] = useState(0)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageUpdateTime: 0,
    totalUpdates: 0
  })
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousDataRef = useRef<ResumeData>(resumeData)
  const updateStartTimeRef = useRef<number>()

  /**
   * 检测数据是否发生变化（优化版本）
   */
  const hasDataChanged = useCallback((newData: ResumeData, oldData: ResumeData): boolean => {
    // 快速检查引用是否相同
    if (newData === oldData) return false
    
    // 深度比较关键字段
    const newStr = JSON.stringify(newData)
    const oldStr = JSON.stringify(oldData)
    return newStr !== oldStr
  }, [])

  /**
   * 计算性能指标
   */
  const updatePerformanceMetrics = useCallback((updateTime: number) => {
    setPerformanceMetrics(prev => {
      const newTotalUpdates = prev.totalUpdates + 1
      const newAverageTime = (prev.averageUpdateTime * prev.totalUpdates + updateTime) / newTotalUpdates
      
      return {
        averageUpdateTime: Math.round(newAverageTime * 100) / 100,
        totalUpdates: newTotalUpdates
      }
    })
  }, [])

  /**
   * 防抖更新函数（增强版本）
   * 优化：移除立即触发的状态更新，减少不必要的重渲染
   */
  const debouncedUpdate = useCallback((newData: ResumeData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 移除 setIsUpdating(true) 以避免每次输入都触发重渲染
    // 只有在实际处理更新时才标记状态
    updateStartTimeRef.current = performance.now()

    timeoutRef.current = setTimeout(() => {
      const updateEndTime = performance.now()
      const updateDuration = updateEndTime - (updateStartTimeRef.current || 0)
      
      // 在防抖回调中进行比较，避免阻塞主线程
      if (hasDataChanged(newData, previousDataRef.current)) {
        setIsUpdating(true) // 标记开始更新
        
        // 使用 requestAnimationFrame 确保状态更新不会阻塞 UI
        requestAnimationFrame(() => {
          previousDataRef.current = { ...newData } // 创建副本避免引用问题
          setPreviewData(previousDataRef.current) // 更新预览数据
          setLastUpdateTime(new Date())
          setUpdateCount(prev => prev + 1)
          updatePerformanceMetrics(updateDuration)
          setIsUpdating(false) // 更新完成
        })
      }
    }, delay)
  }, [delay, hasDataChanged, updatePerformanceMetrics])

  useEffect(() => {
    debouncedUpdate(resumeData)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [resumeData, debouncedUpdate])

  /**
   * 获取更新状态文本
   */
  const getUpdateStatus = useCallback((): string => {
    if (isUpdating) return '正在同步...'
    if (lastUpdateTime) {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000)
      if (diff < 60) return `${diff}秒前更新`
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前更新`
      return `${Math.floor(diff / 3600)}小时前更新`
    }
    return '等待输入...'
  }, [isUpdating, lastUpdateTime])

  /**
   * 强制立即更新
   */
  const forceUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsUpdating(true)
    
    setTimeout(() => {
      previousDataRef.current = { ...resumeData }
      setLastUpdateTime(new Date())
      setUpdateCount(prev => prev + 1)
      setIsUpdating(false)
    }, 0)
  }, [resumeData])

  return {
    previewData,
    isUpdating,
    lastUpdateTime,
    updateCount,
    performanceMetrics,
    getUpdateStatus,
    forceUpdate
  }
}