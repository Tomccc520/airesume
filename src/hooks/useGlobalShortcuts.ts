/**
 * @file hooks/useGlobalShortcuts.ts
 * @description 全局快捷键管理 Hook，支持自定义快捷键配置和持久化
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 2.0.0
 */

import { useEffect, useCallback, useState } from 'react'

// 快捷键配置接口
export interface ShortcutConfig {
  /** 快捷键标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 英文名称 */
  nameEn: string
  /** 默认快捷键 */
  defaultKey: string
  /** 用户自定义快捷键 */
  customKey?: string
  /** 快捷键描述 */
  description: string
  /** 英文描述 */
  descriptionEn: string
  /** 是否启用 */
  enabled: boolean
  /** 分类 */
  category: 'file' | 'edit' | 'navigation' | 'view'
}

// 默认快捷键配置
export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    id: 'save',
    name: '保存',
    nameEn: 'Save',
    defaultKey: 'Ctrl+S',
    description: '手动保存当前简历',
    descriptionEn: 'Save current resume',
    enabled: true,
    category: 'file'
  },
  {
    id: 'undo',
    name: '撤销',
    nameEn: 'Undo',
    defaultKey: 'Ctrl+Z',
    description: '撤销上一步操作',
    descriptionEn: 'Undo last action',
    enabled: true,
    category: 'edit'
  },
  {
    id: 'redo',
    name: '重做',
    nameEn: 'Redo',
    defaultKey: 'Ctrl+Shift+Z',
    description: '重做已撤销的操作',
    descriptionEn: 'Redo undone action',
    enabled: true,
    category: 'edit'
  },
  {
    id: 'export',
    name: '导出',
    nameEn: 'Export',
    defaultKey: 'Ctrl+P',
    description: '打开导出对话框',
    descriptionEn: 'Open export dialog',
    enabled: true,
    category: 'file'
  },
  {
    id: 'duplicate',
    name: '复制条目',
    nameEn: 'Duplicate',
    defaultKey: 'Ctrl+D',
    description: '复制当前选中的条目',
    descriptionEn: 'Duplicate selected item',
    enabled: true,
    category: 'edit'
  },
  {
    id: 'delete',
    name: '删除',
    nameEn: 'Delete',
    defaultKey: 'Delete',
    description: '删除选中的条目',
    descriptionEn: 'Delete selected item',
    enabled: true,
    category: 'edit'
  },
  {
    id: 'selectAll',
    name: '全选',
    nameEn: 'Select All',
    defaultKey: 'Ctrl+A',
    description: '全选当前模块的所有条目',
    descriptionEn: 'Select all items in current section',
    enabled: true,
    category: 'edit'
  },
  {
    id: 'aiAssistant',
    name: 'AI助手',
    nameEn: 'AI Assistant',
    defaultKey: 'Ctrl+K',
    description: '打开AI助手',
    descriptionEn: 'Open AI assistant',
    enabled: true,
    category: 'view'
  },
  {
    id: 'section1',
    name: '个人信息',
    nameEn: 'Personal Info',
    defaultKey: 'Ctrl+1',
    description: '切换到个人信息区域',
    descriptionEn: 'Switch to personal info section',
    enabled: true,
    category: 'navigation'
  },
  {
    id: 'section2',
    name: '工作经历',
    nameEn: 'Experience',
    defaultKey: 'Ctrl+2',
    description: '切换到工作经历区域',
    descriptionEn: 'Switch to experience section',
    enabled: true,
    category: 'navigation'
  },
  {
    id: 'section3',
    name: '教育经历',
    nameEn: 'Education',
    defaultKey: 'Ctrl+3',
    description: '切换到教育经历区域',
    descriptionEn: 'Switch to education section',
    enabled: true,
    category: 'navigation'
  },
  {
    id: 'section4',
    name: '专业技能',
    nameEn: 'Skills',
    defaultKey: 'Ctrl+4',
    description: '切换到专业技能区域',
    descriptionEn: 'Switch to skills section',
    enabled: true,
    category: 'navigation'
  },
  {
    id: 'section5',
    name: '项目经历',
    nameEn: 'Projects',
    defaultKey: 'Ctrl+5',
    description: '切换到项目经历区域',
    descriptionEn: 'Switch to projects section',
    enabled: true,
    category: 'navigation'
  }
]

const STORAGE_KEY = 'shortcut-config'

// 解析快捷键字符串为按键组合
export function parseShortcut(shortcut: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string } {
  const parts = shortcut.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    key: parts[parts.length - 1]
  }
}

// 检查按键事件是否匹配快捷键
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut)
  const eventKey = event.key.toLowerCase()
  
  // 处理特殊键名
  const keyMatches = 
    eventKey === parsed.key ||
    (parsed.key === 'delete' && (eventKey === 'delete' || eventKey === 'backspace')) ||
    (parsed.key === 'escape' && eventKey === 'escape') ||
    (parsed.key === 'enter' && eventKey === 'enter')
  
  return (
    (event.ctrlKey || event.metaKey) === (parsed.ctrl || parsed.meta) &&
    event.shiftKey === parsed.shift &&
    event.altKey === parsed.alt &&
    keyMatches
  )
}

// 格式化快捷键显示
export function formatShortcut(shortcut: string, isMac: boolean = false): string {
  if (isMac) {
    return shortcut
      .replace(/Ctrl\+/gi, '⌘')
      .replace(/Shift\+/gi, '⇧')
      .replace(/Alt\+/gi, '⌥')
      .replace(/Meta\+/gi, '⌘')
  }
  return shortcut
}

export interface UseGlobalShortcutsProps {
  onSectionChange: (section: string) => void
  openAIAssistant: () => void
  handleSave: () => void
  handleUndo?: () => void
  handleRedo?: () => void
  handleExport?: () => void
  handleDuplicate?: () => void
  handleDelete?: () => void
  handleSelectAll?: () => void
}

export interface UseGlobalShortcutsReturn {
  shortcuts: ShortcutConfig[]
  updateShortcut: (id: string, customKey: string) => void
  toggleShortcut: (id: string, enabled: boolean) => void
  resetShortcuts: () => void
  getShortcutByAction: (id: string) => ShortcutConfig | undefined
}

export function useGlobalShortcuts({
  onSectionChange,
  openAIAssistant,
  handleSave,
  handleUndo,
  handleRedo,
  handleExport,
  handleDuplicate,
  handleDelete,
  handleSelectAll
}: UseGlobalShortcutsProps): UseGlobalShortcutsReturn {
  // 从本地存储加载快捷键配置
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SHORTCUTS
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ShortcutConfig[]
        // 合并默认配置和存储的配置
        return DEFAULT_SHORTCUTS.map(defaultShortcut => {
          const stored = parsed.find(s => s.id === defaultShortcut.id)
          return stored ? { ...defaultShortcut, ...stored } : defaultShortcut
        })
      }
    } catch {
      // 忽略解析错误
    }
    return DEFAULT_SHORTCUTS
  })

  // 保存到本地存储
  const saveToStorage = useCallback((newShortcuts: ShortcutConfig[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts))
    } catch {
      // 忽略存储错误
    }
  }, [])

  // 更新快捷键
  const updateShortcut = useCallback((id: string, customKey: string) => {
    setShortcuts(prev => {
      const newShortcuts = prev.map(s => 
        s.id === id ? { ...s, customKey } : s
      )
      saveToStorage(newShortcuts)
      return newShortcuts
    })
  }, [saveToStorage])

  // 切换快捷键启用状态
  const toggleShortcut = useCallback((id: string, enabled: boolean) => {
    setShortcuts(prev => {
      const newShortcuts = prev.map(s => 
        s.id === id ? { ...s, enabled } : s
      )
      saveToStorage(newShortcuts)
      return newShortcuts
    })
  }, [saveToStorage])

  // 重置快捷键
  const resetShortcuts = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS)
    saveToStorage(DEFAULT_SHORTCUTS)
  }, [saveToStorage])

  // 获取指定操作的快捷键
  const getShortcutByAction = useCallback((id: string) => {
    return shortcuts.find(s => s.id === id)
  }, [shortcuts])

  // 获取有效的快捷键
  const getEffectiveKey = useCallback((shortcut: ShortcutConfig) => {
    return shortcut.customKey || shortcut.defaultKey
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的按键（除了特定快捷键）
      const isInInput = 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      // 遍历所有启用的快捷键
      for (const shortcut of shortcuts) {
        if (!shortcut.enabled) continue
        
        const effectiveKey = getEffectiveKey(shortcut)
        if (!matchesShortcut(e, effectiveKey)) continue

        // 在输入框中只允许特定快捷键
        if (isInInput && !['save', 'undo', 'redo'].includes(shortcut.id)) {
          continue
        }

        e.preventDefault()

        switch (shortcut.id) {
          case 'save':
            handleSave()
            break
          case 'undo':
            handleUndo?.()
            break
          case 'redo':
            handleRedo?.()
            break
          case 'export':
            handleExport?.()
            break
          case 'duplicate':
            handleDuplicate?.()
            break
          case 'delete':
            handleDelete?.()
            break
          case 'selectAll':
            handleSelectAll?.()
            break
          case 'aiAssistant':
            openAIAssistant()
            break
          case 'section1':
            onSectionChange('personal')
            break
          case 'section2':
            onSectionChange('experience')
            break
          case 'section3':
            onSectionChange('education')
            break
          case 'section4':
            onSectionChange('skills')
            break
          case 'section5':
            onSectionChange('projects')
            break
        }
        return
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [
    shortcuts,
    getEffectiveKey,
    onSectionChange,
    openAIAssistant,
    handleSave,
    handleUndo,
    handleRedo,
    handleExport,
    handleDuplicate,
    handleDelete,
    handleSelectAll
  ])

  return {
    shortcuts,
    updateShortcut,
    toggleShortcut,
    resetShortcuts,
    getShortcutByAction
  }
}
