/**
 * @file hooks/useBatchSelection.ts
 * @description 批量选择状态管理 Hook，支持多选、范围选择、全选功能
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react'

export interface UseBatchSelectionReturn<T extends { id: string }> {
  /** 选中的项目 ID 列表 */
  selectedIds: string[]
  /** 是否有选中项 */
  hasSelection: boolean
  /** 选中数量 */
  selectionCount: number
  /** 切换选择 */
  toggleSelection: (id: string) => void
  /** 范围选择 */
  rangeSelect: (startId: string, endId: string, allIds: string[]) => void
  /** 全选 */
  selectAll: (ids: string[]) => void
  /** 清除选择 */
  clearSelection: () => void
  /** 检查是否选中 */
  isSelected: (id: string) => boolean
  /** 批量删除 */
  batchDelete: (items: T[], onDelete: (ids: string[]) => void) => T[]
  /** 批量复制 */
  batchCopy: (items: T[], generateId: () => string) => T[]
  /** 批量移动 */
  batchMove: (items: T[], direction: 'up' | 'down') => T[]
}

export function useBatchSelection<T extends { id: string }>(): UseBatchSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds])
  const selectionCount = useMemo(() => selectedIds.length, [selectedIds])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id)
      }
      return [...prev, id]
    })
  }, [])

  const rangeSelect = useCallback((startId: string, endId: string, allIds: string[]) => {
    const startIndex = allIds.indexOf(startId)
    const endIndex = allIds.indexOf(endId)
    
    if (startIndex === -1 || endIndex === -1) return

    const minIndex = Math.min(startIndex, endIndex)
    const maxIndex = Math.max(startIndex, endIndex)
    
    const rangeIds = allIds.slice(minIndex, maxIndex + 1)
    
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      rangeIds.forEach(id => newSelection.add(id))
      return Array.from(newSelection)
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id)
  }, [selectedIds])

  const batchDelete = useCallback((items: T[], onDelete: (ids: string[]) => void): T[] => {
    const remainingItems = items.filter(item => !selectedIds.includes(item.id))
    onDelete(selectedIds)
    setSelectedIds([])
    return remainingItems
  }, [selectedIds])

  const batchCopy = useCallback((items: T[], generateId: () => string): T[] => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id))
    const copiedItems = selectedItems.map(item => ({
      ...item,
      id: generateId()
    }))
    
    // 在选中项后面插入复制的项
    const result: T[] = []
    for (const item of items) {
      result.push(item)
      if (selectedIds.includes(item.id)) {
        const copiedItem = copiedItems.find(c => 
          JSON.stringify({ ...c, id: '' }) === JSON.stringify({ ...item, id: '' })
        )
        if (copiedItem) {
          result.push(copiedItem)
        }
      }
    }
    
    return result
  }, [selectedIds])

  const batchMove = useCallback((items: T[], direction: 'up' | 'down'): T[] => {
    if (selectedIds.length === 0) return items

    const result = [...items]
    const selectedIndices = selectedIds
      .map(id => result.findIndex(item => item.id === id))
      .filter(index => index !== -1)
      .sort((a, b) => direction === 'up' ? a - b : b - a)

    for (const index of selectedIndices) {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      
      // 检查边界
      if (targetIndex < 0 || targetIndex >= result.length) continue
      
      // 检查目标位置是否也是选中项
      if (selectedIds.includes(result[targetIndex].id)) continue
      
      // 交换位置
      const temp = result[index]
      result[index] = result[targetIndex]
      result[targetIndex] = temp
    }

    return result
  }, [selectedIds])

  return {
    selectedIds,
    hasSelection,
    selectionCount,
    toggleSelection,
    rangeSelect,
    selectAll,
    clearSelection,
    isSelected,
    batchDelete,
    batchCopy,
    batchMove
  }
}

export default useBatchSelection
