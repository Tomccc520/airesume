/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 样式历史记录和撤销/重做功能
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { StyleConfig } from '@/contexts/StyleContext'

/**
 * 历史记录接口
 */
interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

/**
 * 历史记录配置
 */
interface HistoryConfig {
  maxHistory?: number
  debounceMs?: number
}

/**
 * 样式历史记录 Hook
 */
export function useStyleHistory(
  initialState: StyleConfig,
  config: HistoryConfig = {}
) {
  const { maxHistory = 50, debounceMs = 500 } = config
  
  const [history, setHistory] = useState<HistoryState<StyleConfig>>({
    past: [],
    present: initialState,
    future: []
  })
  
  const debounceTimer = useRef<NodeJS.Timeout>()
  const isUndoRedo = useRef(false)
  
  // 设置新状态（带防抖）
  const setState = useCallback((newState: StyleConfig | ((prev: StyleConfig) => StyleConfig)) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      setHistory(prev => {
        const actualNewState = typeof newState === 'function' 
          ? newState(prev.present) 
          : newState
        
        // 如果是撤销/重做操作，不添加到历史记录
        if (isUndoRedo.current) {
          isUndoRedo.current = false
          return {
            ...prev,
            present: actualNewState
          }
        }
        
        // 检查是否真的有变化
        if (JSON.stringify(actualNewState) === JSON.stringify(prev.present)) {
          return prev
        }
        
        const newPast = [...prev.past, prev.present]
        
        // 限制历史记录数量
        if (newPast.length > maxHistory) {
          newPast.shift()
        }
        
        return {
          past: newPast,
          present: actualNewState,
          future: [] // 新操作会清空 future
        }
      })
    }, debounceMs)
  }, [maxHistory, debounceMs])
  
  // 撤销
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev
      
      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, prev.past.length - 1)
      
      isUndoRedo.current = true
      
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      }
    })
  }, [])
  
  // 重做
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev
      
      const next = prev.future[0]
      const newFuture = prev.future.slice(1)
      
      isUndoRedo.current = true
      
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      }
    })
  }, [])
  
  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: prev.present,
      future: []
    }))
  }, [])
  
  // 跳转到特定历史记录
  const goToHistory = useCallback((index: number) => {
    setHistory(prev => {
      const totalStates = [...prev.past, prev.present, ...prev.future]
      
      if (index < 0 || index >= totalStates.length) return prev
      
      const newPresent = totalStates[index]
      const newPast = totalStates.slice(0, index)
      const newFuture = totalStates.slice(index + 1)
      
      isUndoRedo.current = true
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      }
    })
  }, [])
  
  // 获取所有历史记录
  const getAllHistory = useCallback(() => {
    return [...history.past, history.present, ...history.future]
  }, [history])
  
  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Ctrl+Shift+Z / Cmd+Shift+Z: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      
      // Ctrl+Y / Cmd+Y: 重做（备选）
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])
  
  return {
    state: history.present,
    setState,
    undo,
    redo,
    clearHistory,
    goToHistory,
    getAllHistory,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length + 1 + history.future.length,
    currentIndex: history.past.length
  }
}

/**
 * 历史记录持久化 Hook
 */
export function usePersistedStyleHistory(
  key: string,
  initialState: StyleConfig,
  config: HistoryConfig = {}
) {
  const history = useStyleHistory(initialState, config)
  const { setState, getAllHistory, state } = history
  
  // 从 localStorage 加载历史记录
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        // 这里可以恢复历史记录，但为了简化，我们只恢复当前状态
        if (parsed.present) {
          setState(parsed.present)
        }
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error)
    }
  }, [key, setState])
  
  // 保存历史记录到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const toSave = {
        past: getAllHistory().slice(-10), // 只保存最近10条
        present: state,
        future: []
      }
      localStorage.setItem(key, JSON.stringify(toSave))
    } catch (error) {
      console.error('Failed to save history to localStorage:', error)
    }
  }, [getAllHistory, key, state])
  
  return history
}

/**
 * 历史记录比较工具
 */
export function compareStyleConfigs(
  config1: StyleConfig,
  config2: StyleConfig
): {
  hasChanges: boolean
  changes: string[]
} {
  const changes: string[] = []
  
  // 比较颜色
  if (JSON.stringify(config1.colors) !== JSON.stringify(config2.colors)) {
    changes.push('colors')
  }
  
  // 比较字体
  if (config1.fontFamily !== config2.fontFamily) {
    changes.push('fontFamily')
  }
  
  if (JSON.stringify(config1.fontSize) !== JSON.stringify(config2.fontSize)) {
    changes.push('fontSize')
  }
  
  // 比较间距
  if (JSON.stringify(config1.spacing) !== JSON.stringify(config2.spacing)) {
    changes.push('spacing')
  }
  
  // 比较布局
  if (JSON.stringify(config1.layout) !== JSON.stringify(config2.layout)) {
    changes.push('layout')
  }
  
  return {
    hasChanges: changes.length > 0,
    changes
  }
}

/**
 * 历史记录快照
 */
export interface HistorySnapshot {
  id: string
  timestamp: number
  name: string
  config: StyleConfig
}

/**
 * 历史记录快照管理
 */
export function useHistorySnapshots() {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([])
  
  // 创建快照
  const createSnapshot = useCallback((name: string, config: StyleConfig) => {
    const snapshot: HistorySnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      name,
      config: JSON.parse(JSON.stringify(config)) // 深拷贝
    }
    
    setSnapshots(prev => [...prev, snapshot])
    return snapshot
  }, [])
  
  // 删除快照
  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id))
  }, [])
  
  // 恢复快照
  const restoreSnapshot = useCallback((id: string): StyleConfig | null => {
    const snapshot = snapshots.find(s => s.id === id)
    return snapshot ? JSON.parse(JSON.stringify(snapshot.config)) : null
  }, [snapshots])
  
  // 重命名快照
  const renameSnapshot = useCallback((id: string, newName: string) => {
    setSnapshots(prev => prev.map(s => 
      s.id === id ? { ...s, name: newName } : s
    ))
  }, [])
  
  // 持久化快照
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('style-snapshots', JSON.stringify(snapshots))
    } catch (error) {
      console.error('Failed to save snapshots:', error)
    }
  }, [snapshots])
  
  // 加载快照
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('style-snapshots')
      if (stored) {
        setSnapshots(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error)
    }
  }, [])
  
  return {
    snapshots,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    renameSnapshot
  }
}
