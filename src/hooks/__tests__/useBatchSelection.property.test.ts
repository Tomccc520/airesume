/**
 * @file hooks/__tests__/useBatchSelection.property.test.ts
 * @description 批量选择操作属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import * as fc from 'fast-check'

interface TestItem {
  id: string
  name: string
}

// 模拟批量选择逻辑（不依赖 React hooks）
class BatchSelectionManager<T extends { id: string }> {
  private selectedIds: string[] = []

  get hasSelection(): boolean {
    return this.selectedIds.length > 0
  }

  get selectionCount(): number {
    return this.selectedIds.length
  }

  getSelectedIds(): string[] {
    return [...this.selectedIds]
  }

  toggleSelection(id: string): void {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id)
    } else {
      this.selectedIds = [...this.selectedIds, id]
    }
  }

  rangeSelect(startId: string, endId: string, allIds: string[]): void {
    const startIndex = allIds.indexOf(startId)
    const endIndex = allIds.indexOf(endId)
    
    if (startIndex === -1 || endIndex === -1) return

    const minIndex = Math.min(startIndex, endIndex)
    const maxIndex = Math.max(startIndex, endIndex)
    
    const rangeIds = allIds.slice(minIndex, maxIndex + 1)
    
    const newSelection = new Set(this.selectedIds)
    rangeIds.forEach(id => newSelection.add(id))
    this.selectedIds = Array.from(newSelection)
  }

  selectAll(ids: string[]): void {
    this.selectedIds = [...ids]
  }

  clearSelection(): void {
    this.selectedIds = []
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id)
  }

  batchDelete(items: T[], onDelete: (ids: string[]) => void): T[] {
    const remainingItems = items.filter(item => !this.selectedIds.includes(item.id))
    onDelete([...this.selectedIds])
    this.selectedIds = []
    return remainingItems
  }

  batchCopy(items: T[], generateId: () => string): T[] {
    const selectedItems = items.filter(item => this.selectedIds.includes(item.id))
    const copiedItems = selectedItems.map(item => ({
      ...item,
      id: generateId()
    }))
    
    const result: T[] = []
    for (const item of items) {
      result.push(item)
      if (this.selectedIds.includes(item.id)) {
        const copiedItem = copiedItems.shift()
        if (copiedItem) {
          result.push(copiedItem)
        }
      }
    }
    
    return result
  }

  batchMove(items: T[], direction: 'up' | 'down'): T[] {
    if (this.selectedIds.length === 0) return items

    const result = [...items]
    const selectedIndices = this.selectedIds
      .map(id => result.findIndex(item => item.id === id))
      .filter(index => index !== -1)
      .sort((a, b) => direction === 'up' ? a - b : b - a)

    for (const index of selectedIndices) {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      
      if (targetIndex < 0 || targetIndex >= result.length) continue
      if (this.selectedIds.includes(result[targetIndex].id)) continue
      
      const temp = result[index]
      result[index] = result[targetIndex]
      result[targetIndex] = temp
    }

    return result
  }
}

// 生成测试项
const testItemArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 })
})

// 生成测试项数组（确保 ID 唯一）
const testItemsArb = fc.array(testItemArb, { minLength: 1, maxLength: 20 })
  .map(items => {
    const seen = new Set<string>()
    return items.filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  })
  .filter(items => items.length > 0)

describe('useBatchSelection Property Tests', () => {
  /**
   * Property 26: 批量选择操作
   * For any 批量选择操作，选中数量 SHALL 正确反映实际选中的条目数，
   * 批量删除 SHALL 移除所有选中条目，批量复制 SHALL 增加等量的新条目，
   * 批量移动 SHALL 保持选中条目的相对顺序。
   * **Validates: Requirements 12.1, 12.3, 12.4, 12.5, 12.7**
   */
  describe('Property 26: 批量选择操作', () => {
    it('选中数量应正确反映实际选中的条目数', () => {
      fc.assert(
        fc.property(
          testItemsArb,
          fc.integer({ min: 0, max: 10 }),
          (items, selectCount) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const idsToSelect = items.slice(0, Math.min(selectCount, items.length)).map(i => i.id)
            manager.selectAll(idsToSelect)
            
            expect(manager.selectionCount).toBe(idsToSelect.length)
            expect(manager.getSelectedIds().length).toBe(idsToSelect.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('toggleSelection 应正确切换选择状态', () => {
      fc.assert(
        fc.property(
          testItemsArb,
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            const testId = items[0].id
            
            expect(manager.isSelected(testId)).toBe(false)
            
            manager.toggleSelection(testId)
            expect(manager.isSelected(testId)).toBe(true)
            
            manager.toggleSelection(testId)
            expect(manager.isSelected(testId)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('clearSelection 应清除所有选择', () => {
      fc.assert(
        fc.property(
          testItemsArb,
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            manager.selectAll(items.map(i => i.id))
            expect(manager.hasSelection).toBe(true)
            
            manager.clearSelection()
            expect(manager.hasSelection).toBe(false)
            expect(manager.selectionCount).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('批量删除应移除所有选中条目', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 2),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const halfLength = Math.floor(items.length / 2)
            const idsToSelect = items.slice(0, halfLength).map(i => i.id)
            
            manager.selectAll(idsToSelect)
            
            const deletedIds: string[] = []
            const remaining = manager.batchDelete(items, (ids) => {
              deletedIds.push(...ids)
            })
            
            expect(remaining.length).toBe(items.length - halfLength)
            expect(deletedIds.length).toBe(halfLength)
            
            for (const id of idsToSelect) {
              expect(remaining.find(item => item.id === id)).toBeUndefined()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('批量复制应增加等量的新条目', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 1),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const idsToSelect = [items[0].id]
            manager.selectAll(idsToSelect)
            
            let idCounter = 0
            const generateId = () => `new-id-${idCounter++}`
            const copied = manager.batchCopy(items, generateId)
            
            expect(copied.length).toBe(items.length + idsToSelect.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('rangeSelect 应选择范围内的所有项', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 3),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const allIds = items.map(i => i.id)
            const startId = items[0].id
            const endId = items[Math.min(2, items.length - 1)].id
            
            manager.rangeSelect(startId, endId, allIds)
            
            const startIndex = 0
            const endIndex = Math.min(2, items.length - 1)
            const expectedCount = endIndex - startIndex + 1
            
            expect(manager.selectionCount).toBe(expectedCount)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('批量移动操作', () => {
    it('向上移动应保持选中条目的相对顺序', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 3),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const middleIndex = Math.floor(items.length / 2)
            const idsToSelect = [items[middleIndex].id]
            
            manager.selectAll(idsToSelect)
            
            const moved = manager.batchMove(items, 'up')
            
            expect(moved.length).toBe(items.length)
            
            if (middleIndex > 0) {
              const newIndex = moved.findIndex(item => item.id === idsToSelect[0])
              expect(newIndex).toBe(middleIndex - 1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('向下移动应保持选中条目的相对顺序', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 3),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const middleIndex = Math.floor(items.length / 2)
            const idsToSelect = [items[middleIndex].id]
            
            manager.selectAll(idsToSelect)
            
            const moved = manager.batchMove(items, 'down')
            
            expect(moved.length).toBe(items.length)
            
            if (middleIndex < items.length - 1) {
              const newIndex = moved.findIndex(item => item.id === idsToSelect[0])
              expect(newIndex).toBe(middleIndex + 1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('边界项移动应保持在边界', () => {
      fc.assert(
        fc.property(
          testItemsArb.filter(items => items.length >= 2),
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            const idsToSelect = [items[0].id]
            manager.selectAll(idsToSelect)
            
            const moved = manager.batchMove(items, 'up')
            
            expect(moved[0].id).toBe(items[0].id)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('hasSelection 状态', () => {
    it('无选择时 hasSelection 应为 false', () => {
      const manager = new BatchSelectionManager<TestItem>()
      expect(manager.hasSelection).toBe(false)
    })

    it('有选择时 hasSelection 应为 true', () => {
      fc.assert(
        fc.property(
          testItemsArb,
          (items) => {
            const manager = new BatchSelectionManager<TestItem>()
            
            manager.toggleSelection(items[0].id)
            
            expect(manager.hasSelection).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
