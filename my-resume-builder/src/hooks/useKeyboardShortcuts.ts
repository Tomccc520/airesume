/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { useEffect, useCallback, useRef } from 'react'

/**
 * 键盘快捷键配置接口
 */
interface KeyboardShortcut {
  /** 快捷键组合 */
  key: string
  /** 是否需要Ctrl/Cmd键 */
  ctrl?: boolean
  /** 是否需要Shift键 */
  shift?: boolean
  /** 是否需要Alt键 */
  alt?: boolean
  /** 快捷键描述 */
  description: string
  /** 回调函数 */
  callback: () => void
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

/**
 * 键盘快捷键钩子
 * 提供常用的编辑器快捷键功能
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts)
  const activeShortcutsRef = useRef<Set<string>>(new Set())

  // 更新快捷键引用
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  /**
   * 检查快捷键是否匹配
   */
  const isShortcutMatch = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    const { key, ctrl = false, shift = false, alt = false } = shortcut
    
    // 检查主键
    if (event.key.toLowerCase() !== key.toLowerCase()) {
      return false
    }

    // 检查修饰键
    const ctrlPressed = event.ctrlKey || event.metaKey // 支持Mac的Cmd键
    if (ctrl !== ctrlPressed) return false
    if (shift !== event.shiftKey) return false
    if (alt !== event.altKey) return false

    return true
  }, [])

  /**
   * 获取快捷键字符串表示
   */
  const getShortcutString = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrl) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    }
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }, [])

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 如果在输入框中，跳过某些快捷键
    const target = event.target as HTMLElement
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true'

    for (const shortcut of shortcutsRef.current) {
      if (isShortcutMatch(event, shortcut)) {
        // 对于某些快捷键，在输入框中也要生效（如保存）
        const allowInInput = shortcut.key === 's' && shortcut.ctrl
        
        if (!isInputElement || allowInInput) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          
          // 防止重复触发
          const shortcutKey = getShortcutString(shortcut)
          if (!activeShortcutsRef.current.has(shortcutKey)) {
            activeShortcutsRef.current.add(shortcutKey)
            shortcut.callback()
            
            // 短暂延迟后移除，防止重复触发
            setTimeout(() => {
              activeShortcutsRef.current.delete(shortcutKey)
            }, 100)
          }
          break
        }
      }
    }
  }, [isShortcutMatch, getShortcutString])

  /**
   * 处理键盘释放事件
   */
  const handleKeyUp = useCallback(() => {
    // 清除所有活动快捷键
    activeShortcutsRef.current.clear()
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  /**
   * 获取所有快捷键的帮助信息
   */
  const getShortcutHelp = useCallback((): Array<{ shortcut: string; description: string }> => {
    return shortcutsRef.current.map(shortcut => ({
      shortcut: getShortcutString(shortcut),
      description: shortcut.description
    }))
  }, [getShortcutString])

  return {
    getShortcutHelp
  }
}

/**
 * 预定义的编辑器快捷键
 */
export const createEditorShortcuts = (callbacks: {
  onSave?: () => void
  onExport?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onTogglePreview?: () => void
  onToggleFullscreen?: () => void
  onOpenAI?: () => void
  onFocusSearch?: () => void
}): KeyboardShortcut[] => [
  {
    key: 's',
    ctrl: true,
    description: '保存简历',
    callback: callbacks.onSave || (() => {}),
  },
  {
    key: 'e',
    ctrl: true,
    shift: true,
    description: '导出简历',
    callback: callbacks.onExport || (() => {}),
  },
  {
    key: 'z',
    ctrl: true,
    description: '撤销',
    callback: callbacks.onUndo || (() => {}),
  },
  {
    key: 'y',
    ctrl: true,
    description: '重做',
    callback: callbacks.onRedo || (() => {}),
  },
  {
    key: 'p',
    ctrl: true,
    description: '切换预览模式',
    callback: callbacks.onTogglePreview || (() => {}),
  },
  {
    key: 'f11',
    description: '切换全屏模式',
    callback: callbacks.onToggleFullscreen || (() => {}),
    preventDefault: true,
  },
  {
    key: 'k',
    ctrl: true,
    description: '打开AI助手',
    callback: callbacks.onOpenAI || (() => {}),
  },
  {
    key: 'f',
    ctrl: true,
    description: '搜索',
    callback: callbacks.onFocusSearch || (() => {}),
  },
]