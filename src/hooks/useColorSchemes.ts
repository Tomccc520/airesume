/**
 * @file hooks/useColorSchemes.ts
 * @description 配色方案管理 Hook，提供配色方案的 CRUD 操作和本地存储持久化
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * 配色方案接口
 * @description 定义配色方案的数据结构
 */
export interface ColorScheme {
  /** 唯一标识 */
  id: string
  /** 方案名称 */
  name: string
  /** 主色 */
  primary: string
  /** 次色 */
  secondary: string
  /** 强调色 */
  accent: string
  /** 文本色 */
  text: string
  /** 背景色 */
  background: string
  /** 是否为预设方案 */
  isPreset: boolean
  /** 创建时间 */
  createdAt?: Date
}

/**
 * useColorSchemes Hook 返回值接口
 */
export interface UseColorSchemesReturn {
  /** 预设配色方案 */
  presetSchemes: ColorScheme[]
  /** 自定义配色方案 */
  customSchemes: ColorScheme[]
  /** 保存自定义方案 */
  saveScheme: (scheme: Omit<ColorScheme, 'id' | 'createdAt'>) => void
  /** 删除自定义方案 */
  deleteScheme: (schemeId: string) => void
  /** 重命名方案 */
  renameScheme: (schemeId: string, newName: string) => void
  /** 导入方案 */
  importScheme: (scheme: ColorScheme) => void
  /** 批量导入方案 */
  importSchemes: (schemes: ColorScheme[], mode?: 'replace' | 'merge') => void
  /** 是否正在加载 */
  isLoading: boolean
}

/** 本地存储键名 */
const STORAGE_KEY = 'custom-color-schemes'

/**
 * 默认预设配色方案
 * @description 提供多种专业配色方案供用户选择
 */
const DEFAULT_PRESET_SCHEMES: ColorScheme[] = [
  {
    id: 'preset-business-blue',
    name: '商务蓝',
    primary: '#2563eb',
    secondary: '#4b5563',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-elegant-gray',
    name: '优雅灰',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#4b5563',
    text: '#111827',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-forest-green',
    name: '森林绿',
    primary: '#059669',
    secondary: '#4b5563',
    accent: '#10b981',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-royal-purple',
    name: '皇家紫',
    primary: '#7c3aed',
    secondary: '#4b5563',
    accent: '#8b5cf6',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-passion-red',
    name: '热情红',
    primary: '#dc2626',
    secondary: '#4b5563',
    accent: '#ef4444',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-deep-sea',
    name: '深海蓝',
    primary: '#0f172a',
    secondary: '#475569',
    accent: '#1e3a8a',
    text: '#0f172a',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-tech-cyan',
    name: '科技蓝',
    primary: '#0891b2',
    secondary: '#4b5563',
    accent: '#06b6d4',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-earth-brown',
    name: '大地棕',
    primary: '#78350f',
    secondary: '#57534e',
    accent: '#92400e',
    text: '#1c1917',
    background: '#ffffff',
    isPreset: true
  }
]

/**
 * 生成唯一 ID
 * @returns 唯一标识符
 */
function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 生成可用的导入方案名称
 * 避免与现有方案重名，同时保持用户可识别的原始名称。
 */
function buildImportedSchemeName(existingNames: Set<string>, preferredName: string): string {
  const baseName = preferredName.trim() || '导入配色'
  if (!existingNames.has(baseName)) {
    return baseName
  }

  let suffix = 1
  let nextName = `${baseName} (导入)`
  while (existingNames.has(nextName)) {
    suffix += 1
    nextName = `${baseName} (导入${suffix})`
  }

  return nextName
}

/**
 * 验证配色方案数据有效性
 * @param scheme 待验证的配色方案
 * @returns 是否有效
 */
function isValidColorScheme(scheme: unknown): scheme is ColorScheme {
  if (!scheme || typeof scheme !== 'object') return false
  
  const s = scheme as Record<string, unknown>
  
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.primary === 'string' &&
    typeof s.secondary === 'string' &&
    typeof s.accent === 'string' &&
    typeof s.text === 'string' &&
    typeof s.background === 'string' &&
    typeof s.isPreset === 'boolean'
  )
}

/**
 * 从本地存储加载自定义配色方案
 * @returns 自定义配色方案数组
 */
function loadCustomSchemes(): ColorScheme[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    
    // 验证并转换数据
    return parsed
      .filter(isValidColorScheme)
      .map(scheme => ({
        ...scheme,
        createdAt: scheme.createdAt ? new Date(scheme.createdAt) : undefined,
        isPreset: false // 确保从存储加载的都是自定义方案
      }))
  } catch (error) {
    console.warn('加载自定义配色方案失败:', error)
    return []
  }
}

/**
 * 保存自定义配色方案到本地存储
 * @param schemes 自定义配色方案数组
 */
function saveCustomSchemes(schemes: ColorScheme[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const toStore = schemes.map(scheme => ({
      ...scheme,
      createdAt: scheme.createdAt?.toISOString()
    }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error('保存自定义配色方案失败:', error)
  }
}

/**
 * 配色方案管理 Hook
 * @description 提供配色方案的 CRUD 操作和本地存储持久化功能
 * 
 * @requirements
 * - 5.5: 支持从其他简历导入配色方案
 * - 5.7: 将自定义配色方案存储在本地存储中
 * 
 * @example
 * ```tsx
 * const {
 *   presetSchemes,
 *   customSchemes,
 *   saveScheme,
 *   deleteScheme,
 *   renameScheme,
 *   importScheme
 * } = useColorSchemes()
 * 
 * // 保存新方案
 * saveScheme({
 *   name: '我的配色',
 *   primary: '#2563eb',
 *   secondary: '#4b5563',
 *   accent: '#3b82f6',
 *   text: '#1f2937',
 *   background: '#ffffff',
 *   isPreset: false
 * })
 * 
 * // 删除方案
 * deleteScheme('custom-123')
 * 
 * // 重命名方案
 * renameScheme('custom-123', '新名称')
 * 
 * // 导入方案
 * importScheme(importedScheme)
 * ```
 * 
 * @returns {UseColorSchemesReturn} 配色方案管理接口
 */
export function useColorSchemes(): UseColorSchemesReturn {
  const [customSchemes, setCustomSchemes] = useState<ColorScheme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从本地存储加载自定义方案
  useEffect(() => {
    const loaded = loadCustomSchemes()
    setCustomSchemes(loaded)
    setIsLoading(false)
  }, [])

  // 预设方案（使用 useMemo 避免重复创建）
  const presetSchemes = useMemo(() => DEFAULT_PRESET_SCHEMES, [])

  /**
   * 保存自定义配色方案
   * @param scheme 配色方案数据（不含 id 和 createdAt）
   */
  const saveScheme = useCallback((scheme: Omit<ColorScheme, 'id' | 'createdAt'>) => {
    const newScheme: ColorScheme = {
      ...scheme,
      id: generateId(),
      createdAt: new Date(),
      isPreset: false // 确保保存的是自定义方案
    }

    setCustomSchemes(prev => {
      const updated = [...prev, newScheme]
      saveCustomSchemes(updated)
      return updated
    })
  }, [])

  /**
   * 删除自定义配色方案
   * @param schemeId 方案 ID
   */
  const deleteScheme = useCallback((schemeId: string) => {
    setCustomSchemes(prev => {
      // 只能删除自定义方案
      const scheme = prev.find(s => s.id === schemeId)
      if (!scheme || scheme.isPreset) {
        console.warn('无法删除预设方案或方案不存在')
        return prev
      }

      const updated = prev.filter(s => s.id !== schemeId)
      saveCustomSchemes(updated)
      return updated
    })
  }, [])

  /**
   * 重命名配色方案
   * @param schemeId 方案 ID
   * @param newName 新名称
   */
  const renameScheme = useCallback((schemeId: string, newName: string) => {
    if (!newName.trim()) {
      console.warn('方案名称不能为空')
      return
    }

    setCustomSchemes(prev => {
      const schemeIndex = prev.findIndex(s => s.id === schemeId)
      if (schemeIndex === -1) {
        console.warn('方案不存在')
        return prev
      }

      const scheme = prev[schemeIndex]
      if (scheme.isPreset) {
        console.warn('无法重命名预设方案')
        return prev
      }

      const updated = [...prev]
      updated[schemeIndex] = {
        ...scheme,
        name: newName.trim()
      }
      saveCustomSchemes(updated)
      return updated
    })
  }, [])

  /**
   * 批量导入配色方案
   * 支持覆盖或合并导入，并自动为导入方案生成新的自定义 ID。
   */
  const importSchemes = useCallback((schemes: ColorScheme[], mode: 'replace' | 'merge' = 'merge') => {
    const validSchemes = schemes.filter(isValidColorScheme)
    if (validSchemes.length === 0) {
      console.warn('导入的配色方案格式无效')
      return
    }

    setCustomSchemes(prev => {
      const baseSchemes = mode === 'replace' ? [] : prev
      const existingNames = new Set(baseSchemes.map((scheme) => scheme.name))
      const importedSchemes = validSchemes.map((scheme) => {
        const nextName = buildImportedSchemeName(existingNames, scheme.name)
        existingNames.add(nextName)

        return {
          id: generateId(),
          name: nextName,
          primary: scheme.primary,
          secondary: scheme.secondary,
          accent: scheme.accent,
          text: scheme.text,
          background: scheme.background,
          isPreset: false,
          createdAt: new Date()
        }
      })

      const updated = [...baseSchemes, ...importedSchemes]
      saveCustomSchemes(updated)
      return updated
    })
  }, [])

  /**
   * 导入单个配色方案
   * 复用批量导入逻辑，保持单条和批量导入结果一致。
   */
  const importScheme = useCallback((scheme: ColorScheme) => {
    importSchemes([scheme], 'merge')
  }, [importSchemes])

  return {
    presetSchemes,
    customSchemes,
    saveScheme,
    deleteScheme,
    renameScheme,
    importScheme,
    importSchemes,
    isLoading
  }
}

export default useColorSchemes
