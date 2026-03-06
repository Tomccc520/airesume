/**
 * @file hooks/useStorageMonitor.ts
 * @description 存储监控 Hook，实现存储使用量计算和数据清理功能
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * @requirements 9.1, 9.2, 9.4
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { StorageUsage, CleanupOptions } from '@/components/data/StorageMonitor'

/**
 * 存储键名常量
 */
const STORAGE_KEYS = {
  RESUMES: 'resume-data',
  VERSION_HISTORY: 'resume-versions',
  COLOR_SCHEMES: 'custom-color-schemes',
  SETTINGS: 'app-settings',
  AI_CONFIG: 'ai-config',
  STYLE_CONFIG: 'style-config'
} as const

/**
 * 默认存储限制（5MB，localStorage 通常限制为 5-10MB）
 */
const DEFAULT_STORAGE_LIMIT = 5 * 1024 * 1024

/**
 * 警告阈值（80%）
 */
const WARNING_THRESHOLD = 80

/**
 * 计算字符串的字节大小
 */
export function getStringByteSize(str: string): number {
  // 使用 Blob 计算准确的字节大小
  if (typeof Blob !== 'undefined') {
    return new Blob([str]).size
  }
  // 回退方案：估算 UTF-8 编码大小
  let bytes = 0
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    if (charCode < 0x80) {
      bytes += 1
    } else if (charCode < 0x800) {
      bytes += 2
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      bytes += 3
    } else {
      // 代理对
      i++
      bytes += 4
    }
  }
  return bytes
}

/**
 * 计算指定键的存储大小
 */
function getStorageItemSize(key: string): number {
  if (typeof window === 'undefined') return 0
  
  try {
    const value = localStorage.getItem(key)
    if (value === null) return 0
    // 键名和值都占用空间
    return getStringByteSize(key) + getStringByteSize(value)
  } catch {
    return 0
  }
}

/**
 * 计算所有 localStorage 的使用量
 */
function calculateTotalUsage(): number {
  if (typeof window === 'undefined') return 0
  
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        total += getStorageItemSize(key)
      }
    }
  } catch {
    // 忽略错误
  }
  return total
}

/**
 * 计算各类数据的存储占用
 */
function calculateBreakdown(): StorageUsage['breakdown'] {
  const breakdown = {
    resumes: 0,
    versionHistory: 0,
    colorSchemes: 0,
    settings: 0,
    other: 0
  }

  if (typeof window === 'undefined') return breakdown

  try {
    // 简历数据
    breakdown.resumes = getStorageItemSize(STORAGE_KEYS.RESUMES)
    
    // 版本历史
    breakdown.versionHistory = getStorageItemSize(STORAGE_KEYS.VERSION_HISTORY)
    
    // 配色方案
    breakdown.colorSchemes = getStorageItemSize(STORAGE_KEYS.COLOR_SCHEMES)
    
    // 设置（包括 AI 配置和样式配置）
    breakdown.settings = 
      getStorageItemSize(STORAGE_KEYS.SETTINGS) +
      getStorageItemSize(STORAGE_KEYS.AI_CONFIG) +
      getStorageItemSize(STORAGE_KEYS.STYLE_CONFIG)
    
    // 其他
    const knownTotal = breakdown.resumes + breakdown.versionHistory + 
                       breakdown.colorSchemes + breakdown.settings
    const totalUsage = calculateTotalUsage()
    breakdown.other = Math.max(0, totalUsage - knownTotal)
  } catch {
    // 忽略错误
  }

  return breakdown
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage(totalLimit: number = DEFAULT_STORAGE_LIMIT): StorageUsage {
  const breakdown = calculateBreakdown()
  const used = breakdown.resumes + breakdown.versionHistory + 
               breakdown.colorSchemes + breakdown.settings + breakdown.other
  
  return {
    used,
    total: totalLimit,
    percentage: totalLimit > 0 ? (used / totalLimit) * 100 : 0,
    breakdown
  }
}

/**
 * 清理版本历史
 */
function cleanupVersionHistory(keepRecentVersions: number): number {
  if (typeof window === 'undefined') return 0
  
  const beforeSize = getStorageItemSize(STORAGE_KEYS.VERSION_HISTORY)
  
  try {
    const versionsStr = localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY)
    if (!versionsStr) return 0
    
    const versions = JSON.parse(versionsStr)
    if (!Array.isArray(versions)) return 0
    
    // 按时间排序，保留最近的 N 个版本
    const sortedVersions = versions
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
        return timeB - timeA
      })
      .slice(0, keepRecentVersions)
    
    localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify(sortedVersions))
    
    const afterSize = getStorageItemSize(STORAGE_KEYS.VERSION_HISTORY)
    return Math.max(0, beforeSize - afterSize)
  } catch {
    return 0
  }
}

/**
 * 清理未使用的配色方案
 */
function cleanupUnusedColorSchemes(): number {
  if (typeof window === 'undefined') return 0
  
  const beforeSize = getStorageItemSize(STORAGE_KEYS.COLOR_SCHEMES)
  
  try {
    const schemesStr = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEMES)
    if (!schemesStr) return 0
    
    const schemes = JSON.parse(schemesStr)
    if (!Array.isArray(schemes)) return 0
    
    // 获取当前使用的配色方案 ID
    const styleConfigStr = localStorage.getItem(STORAGE_KEYS.STYLE_CONFIG)
    const currentSchemeId = styleConfigStr 
      ? JSON.parse(styleConfigStr)?.colorSchemeId 
      : null
    
    // 保留预设方案和当前使用的方案
    const filteredSchemes = schemes.filter(
      (scheme: { isPreset?: boolean; id?: string }) => 
        scheme.isPreset || scheme.id === currentSchemeId
    )
    
    localStorage.setItem(STORAGE_KEYS.COLOR_SCHEMES, JSON.stringify(filteredSchemes))
    
    const afterSize = getStorageItemSize(STORAGE_KEYS.COLOR_SCHEMES)
    return Math.max(0, beforeSize - afterSize)
  } catch {
    return 0
  }
}

/**
 * 执行清理操作
 */
export async function performCleanup(options: CleanupOptions): Promise<number> {
  let freedBytes = 0
  
  if (options.versionHistory) {
    const keepVersions = options.keepRecentVersions ?? 3
    freedBytes += cleanupVersionHistory(keepVersions)
  }
  
  if (options.unusedColorSchemes) {
    freedBytes += cleanupUnusedColorSchemes()
  }
  
  return freedBytes
}

/**
 * useStorageMonitor Hook 返回类型
 */
export interface UseStorageMonitorReturn {
  /** 存储使用情况 */
  usage: StorageUsage
  /** 是否接近上限 */
  isNearLimit: boolean
  /** 是否已达临界值 */
  isCritical: boolean
  /** 清理旧数据 */
  cleanupOldData: (options: CleanupOptions) => Promise<number>
  /** 刷新使用情况 */
  refresh: () => void
  /** 是否正在加载 */
  isLoading: boolean
}

/**
 * useStorageMonitor Hook 配置
 */
export interface UseStorageMonitorConfig {
  /** 存储总限制（字节） */
  totalLimit?: number
  /** 警告阈值（百分比） */
  warningThreshold?: number
  /** 临界阈值（百分比） */
  criticalThreshold?: number
  /** 自动刷新间隔（毫秒），0 表示禁用 */
  autoRefreshInterval?: number
}

/**
 * 存储监控 Hook
 * 
 * @description 监控 localStorage 使用情况，提供清理功能
 * 
 * @requirements
 * - 9.1: 显示当前本地存储的使用量和剩余空间
 * - 9.2: 存储空间使用超过 80% 时显示警告提示
 * - 9.4: 显示各类数据的存储占用
 * 
 * @example
 * ```tsx
 * const { usage, isNearLimit, cleanupOldData, refresh } = useStorageMonitor()
 * 
 * if (isNearLimit) {
 *   console.log('存储空间不足')
 * }
 * 
 * // 清理旧版本
 * const freedBytes = await cleanupOldData({ versionHistory: true, keepRecentVersions: 3 })
 * ```
 */
export function useStorageMonitor(config: UseStorageMonitorConfig = {}): UseStorageMonitorReturn {
  const {
    totalLimit = DEFAULT_STORAGE_LIMIT,
    warningThreshold = WARNING_THRESHOLD,
    criticalThreshold = 90,
    autoRefreshInterval = 0
  } = config

  const [usage, setUsage] = useState<StorageUsage>(() => getStorageUsage(totalLimit))
  const [isLoading, setIsLoading] = useState(false)

  // 刷新存储使用情况
  const refresh = useCallback(() => {
    setUsage(getStorageUsage(totalLimit))
  }, [totalLimit])

  // 清理旧数据
  const cleanupOldData = useCallback(async (options: CleanupOptions): Promise<number> => {
    setIsLoading(true)
    try {
      const freedBytes = await performCleanup(options)
      // 清理后刷新使用情况
      refresh()
      return freedBytes
    } finally {
      setIsLoading(false)
    }
  }, [refresh])

  // 计算是否接近上限
  const isNearLimit = useMemo(() => {
    return usage.percentage >= warningThreshold
  }, [usage.percentage, warningThreshold])

  // 计算是否已达临界值
  const isCritical = useMemo(() => {
    return usage.percentage >= criticalThreshold
  }, [usage.percentage, criticalThreshold])

  // 自动刷新
  useEffect(() => {
    if (autoRefreshInterval <= 0) return

    const intervalId = setInterval(refresh, autoRefreshInterval)
    return () => clearInterval(intervalId)
  }, [autoRefreshInterval, refresh])

  // 监听 storage 事件（其他标签页的变化）
  useEffect(() => {
    const handleStorageChange = () => {
      refresh()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refresh])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    usage,
    isNearLimit,
    isCritical,
    cleanupOldData,
    refresh,
    isLoading
  }
}

export default useStorageMonitor
