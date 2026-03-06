/**
 * @file hooks/useContextMenu.ts
 * @description 上下文菜单状态管理 Hook
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'
import { ContextMenuItem } from '@/components/editor/ContextMenu'

export interface UseContextMenuReturn {
  /** 是否显示菜单 */
  isOpen: boolean
  /** 菜单位置 */
  position: { x: number; y: number }
  /** 打开菜单 */
  openMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
  /** 关闭菜单 */
  closeMenu: () => void
  /** 当前菜单项 */
  menuItems: ContextMenuItem[]
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([])

  const openMenu = useCallback((event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault()
    event.stopPropagation()
    
    setPosition({ x: event.clientX, y: event.clientY })
    setMenuItems(items)
    setIsOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    position,
    openMenu,
    closeMenu,
    menuItems
  }
}

export default useContextMenu
