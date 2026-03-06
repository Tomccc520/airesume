/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * 优化状态管理 Hook
 * 实现防抖状态管理，支持批量更新和更新状态指示
 * Requirements: 1.1, 1.2
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseOptimizedStateOptions<T> {
  /** 防抖延迟时间（毫秒），默认 300ms */
  debounceMs?: number
  /** 是否启用批量更新，默认 true */
  batchUpdates?: boolean
  /** 更新回调函数 */
  onUpdate?: (value: T) => void
}

export interface UseOptimizedStateReturn<T> {
  /** 当前值（防抖后的稳定值） */
  value: T
  /** 设置值的函数（会触发防抖） */
  setValue: (value: T | ((prev: T) => T)) => void
  /** 是否正在更新中 */
  isUpdating: boolean
  /** 立即刷新值（跳过防抖） */
  flush: () => void
  /** 取消待处理的更新 */
  cancel: () => void
  /** 获取最新的待处理值（未防抖的值） */
  getPendingValue: () => T
}

/**
 * 优化状态管理 Hook
 * 
 * 特性：
 * - 防抖状态更新，减少不必要的重渲染
 * - 支持批量更新，合并多次快速更新
 * - 提供更新状态指示
 * - 支持立即刷新和取消操作
 * 
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 优化状态管理对象
 * 
 * @example
 * ```tsx
 * const { value, setValue, isUpdating } = useOptimizedState(initialData, {
 *   debounceMs: 300,
 *   onUpdate: (newValue) => console.log('Updated:', newValue)
 * })
 * ```
 */
export function useOptimizedState<T>(
  initialValue: T,
  options: UseOptimizedStateOptions<T> = {}
): UseOptimizedStateReturn<T> {
  const {
    debounceMs = 300,
    batchUpdates = true,
    onUpdate
  } = options

  // 稳定值（防抖后的值）
  const [value, setValueInternal] = useState<T>(initialValue)
  // 更新状态指示
  const [isUpdating, setIsUpdating] = useState(false)
  
  // 待处理的值（最新的未防抖值）
  const pendingValueRef = useRef<T>(initialValue)
  // 防抖定时器
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  // 批量更新队列
  const updateQueueRef = useRef<Array<T | ((prev: T) => T)>>([])
  // 是否已挂载
  const isMountedRef = useRef(true)

  /**
   * 清除定时器
   */
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  /**
   * 应用更新
   */
  const applyUpdate = useCallback(() => {
    if (!isMountedRef.current) return

    const newValue = pendingValueRef.current
    setValueInternal(newValue)
    setIsUpdating(false)
    
    // 触发更新回调
    onUpdate?.(newValue)
    
    // 清空更新队列
    updateQueueRef.current = []
  }, [onUpdate])

  /**
   * 设置值（带防抖）
   */
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    // 计算新值
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(pendingValueRef.current)
      : newValue

    // 更新待处理值
    pendingValueRef.current = resolvedValue

    // 批量更新：将更新加入队列
    if (batchUpdates) {
      updateQueueRef.current.push(newValue)
    }

    // 标记为更新中
    setIsUpdating(true)

    // 清除之前的定时器
    clearTimer()

    // 设置新的防抖定时器
    timeoutRef.current = setTimeout(() => {
      applyUpdate()
    }, debounceMs)
  }, [debounceMs, batchUpdates, clearTimer, applyUpdate])

  /**
   * 立即刷新值（跳过防抖）
   */
  const flush = useCallback(() => {
    clearTimer()
    applyUpdate()
  }, [clearTimer, applyUpdate])

  /**
   * 取消待处理的更新
   */
  const cancel = useCallback(() => {
    clearTimer()
    setIsUpdating(false)
    // 重置待处理值为当前稳定值
    pendingValueRef.current = value
    updateQueueRef.current = []
  }, [clearTimer, value])

  /**
   * 获取最新的待处理值
   */
  const getPendingValue = useCallback(() => {
    return pendingValueRef.current
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      clearTimer()
    }
  }, [clearTimer])

  // 当初始值变化时同步更新（用于受控组件场景）
  useEffect(() => {
    // 只有在没有待处理更新时才同步初始值
    if (!isUpdating && updateQueueRef.current.length === 0) {
      pendingValueRef.current = initialValue
      setValueInternal(initialValue)
    }
  }, [initialValue, isUpdating])

  return {
    value,
    setValue,
    isUpdating,
    flush,
    cancel,
    getPendingValue
  }
}

/**
 * 简化版本的防抖状态 Hook
 * 返回元组形式，类似 useState
 * 
 * @param initialValue - 初始值
 * @param debounceMs - 防抖延迟时间（毫秒）
 * @returns [value, setValue, isUpdating]
 */
export function useDebouncedState<T>(
  initialValue: T,
  debounceMs: number = 300
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const { value, setValue, isUpdating } = useOptimizedState(initialValue, { debounceMs })
  return [value, setValue, isUpdating]
}

export default useOptimizedState
