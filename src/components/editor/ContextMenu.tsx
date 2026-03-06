/**
 * @file components/editor/ContextMenu.tsx
 * @description 上下文菜单组件，支持键盘导航和边缘位置调整
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ContextMenuItem {
  /** 菜单项标识 */
  id: string
  /** 显示标签 */
  label: string
  /** 图标 */
  icon?: React.ReactNode
  /** 快捷键 */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为危险操作 */
  danger?: boolean
  /** 点击回调 */
  onClick: () => void
  /** 分隔线（在此项之后显示分隔线） */
  divider?: boolean
}

export interface ContextMenuProps {
  /** 菜单项 */
  items: ContextMenuItem[]
  /** 位置 */
  position: { x: number; y: number }
  /** 关闭回调 */
  onClose: () => void
  /** 是否显示 */
  isOpen: boolean
}

export function ContextMenu({ items, position, onClose, isOpen }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // 调整菜单位置以确保完全可见
  useEffect(() => {
    if (!isOpen || !menuRef.current) return

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let newX = position.x
    let newY = position.y

    // 检查右边界
    if (position.x + rect.width > viewportWidth - 10) {
      newX = viewportWidth - rect.width - 10
    }

    // 检查下边界
    if (position.y + rect.height > viewportHeight - 10) {
      newY = viewportHeight - rect.height - 10
    }

    // 确保不超出左边界和上边界
    newX = Math.max(10, newX)
    newY = Math.max(10, newY)

    setAdjustedPosition({ x: newX, y: newY })
  }, [isOpen, position])

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const enabledItems = items.filter(item => !item.disabled)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => {
          const nextIndex = prev + 1
          return nextIndex >= enabledItems.length ? 0 : nextIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => {
          const nextIndex = prev - 1
          return nextIndex < 0 ? enabledItems.length - 1 : nextIndex
        })
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
          enabledItems[focusedIndex].onClick()
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [items, focusedIndex, onClose])

  // 重置焦点索引
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return
    item.onClick()
    onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50 min-w-[180px] py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="menu"
          aria-label="上下文菜单"
        >
          {items.map((item, index) => {
            const enabledIndex = items.filter((i, idx) => idx < index && !i.disabled).length
            const isFocused = focusedIndex === enabledIndex && !item.disabled

            return (
              <React.Fragment key={item.id}>
                <button
                  className={`
                    w-full px-3 py-2 text-left flex items-center justify-between gap-3
                    text-sm transition-colors
                    ${item.disabled 
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : item.danger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  role="menuitem"
                  tabIndex={-1}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </span>
                  {item.shortcut && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-4">
                      {item.shortcut}
                    </span>
                  )}
                </button>
                {item.divider && (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                )}
              </React.Fragment>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ContextMenu
