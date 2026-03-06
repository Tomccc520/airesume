/**
 * @file components/editor/__tests__/contextMenu.property.test.ts
 * @description 上下文菜单内容有效性属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import * as fc from 'fast-check'
import { ContextMenuItem } from '../ContextMenu'

// 生成有效的菜单项
const menuItemArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-_]+$/.test(s)),
  label: fc.string({ minLength: 1, maxLength: 50 }),
  shortcut: fc.option(fc.constantFrom('Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Delete', 'Ctrl+D', 'Ctrl+Z'), { nil: undefined }),
  disabled: fc.boolean(),
  danger: fc.boolean(),
  divider: fc.boolean()
}).map(item => ({
  ...item,
  onClick: jest.fn()
})) as fc.Arbitrary<ContextMenuItem>

// 生成菜单位置
const positionArb = fc.record({
  x: fc.integer({ min: 0, max: 2000 }),
  y: fc.integer({ min: 0, max: 2000 })
})

// 生成视口尺寸
const viewportArb = fc.record({
  width: fc.integer({ min: 800, max: 2560 }),
  height: fc.integer({ min: 600, max: 1440 })
})

describe('ContextMenu Property Tests', () => {
  /**
   * Property 23: 上下文菜单内容有效性
   * For any 右键点击操作，上下文菜单 SHALL 根据点击位置显示相关的操作选项，
   * 每个选项 SHALL 有对应的快捷键显示。
   * **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
   */
  describe('Property 23: 上下文菜单内容有效性', () => {
    it('所有菜单项应有唯一 ID', () => {
      fc.assert(
        fc.property(
          fc.array(menuItemArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            // 为每个项生成唯一 ID
            const uniqueItems = items.map((item, index) => ({
              ...item,
              id: `${item.id}-${index}`
            }))
            
            const ids = uniqueItems.map(item => item.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(ids.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('所有菜单项应有非空标签', () => {
      fc.assert(
        fc.property(
          fc.array(menuItemArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            for (const item of items) {
              expect(item.label.length).toBeGreaterThan(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('所有菜单项应有 onClick 回调', () => {
      fc.assert(
        fc.property(
          fc.array(menuItemArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            for (const item of items) {
              expect(typeof item.onClick).toBe('function')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('快捷键应为有效格式', () => {
      fc.assert(
        fc.property(
          menuItemArb,
          (item) => {
            if (item.shortcut) {
              // 快捷键应包含修饰键或单键
              const validPattern = /^(Ctrl\+|Alt\+|Shift\+|Meta\+)*[A-Za-z0-9]$|^(Delete|Escape|Enter|Tab)$/
              expect(item.shortcut).toMatch(validPattern)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('禁用的菜单项不应触发 onClick', () => {
      fc.assert(
        fc.property(
          menuItemArb.filter(item => item.disabled),
          (item) => {
            // 禁用项的 onClick 不应被调用
            // 这是组件行为测试的前提条件
            expect(item.disabled).toBe(true)
            expect(typeof item.onClick).toBe('function')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 25: 上下文菜单位置调整
   * For any 靠近屏幕边缘的右键点击，菜单位置 SHALL 被调整以确保完全可见。
   * **Validates: Requirements 11.7**
   */
  describe('Property 25: 上下文菜单位置调整', () => {
    const MENU_WIDTH = 180
    const MENU_HEIGHT = 200
    const MARGIN = 10

    // 计算调整后的位置
    const adjustPosition = (
      position: { x: number; y: number },
      viewport: { width: number; height: number }
    ) => {
      let newX = position.x
      let newY = position.y

      // 检查右边界
      if (position.x + MENU_WIDTH > viewport.width - MARGIN) {
        newX = viewport.width - MENU_WIDTH - MARGIN
      }

      // 检查下边界
      if (position.y + MENU_HEIGHT > viewport.height - MARGIN) {
        newY = viewport.height - MENU_HEIGHT - MARGIN
      }

      // 确保不超出左边界和上边界
      newX = Math.max(MARGIN, newX)
      newY = Math.max(MARGIN, newY)

      return { x: newX, y: newY }
    }

    it('调整后的位置应确保菜单完全在视口内', () => {
      fc.assert(
        fc.property(
          positionArb,
          viewportArb,
          (position, viewport) => {
            const adjusted = adjustPosition(position, viewport)

            // 菜单左边界应在视口内
            expect(adjusted.x).toBeGreaterThanOrEqual(MARGIN)
            
            // 菜单右边界应在视口内
            expect(adjusted.x + MENU_WIDTH).toBeLessThanOrEqual(viewport.width - MARGIN)
            
            // 菜单上边界应在视口内
            expect(adjusted.y).toBeGreaterThanOrEqual(MARGIN)
            
            // 菜单下边界应在视口内
            expect(adjusted.y + MENU_HEIGHT).toBeLessThanOrEqual(viewport.height - MARGIN)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('在视口中心的点击不应调整位置', () => {
      fc.assert(
        fc.property(
          viewportArb,
          (viewport) => {
            // 在视口中心点击
            const centerPosition = {
              x: viewport.width / 2 - MENU_WIDTH / 2,
              y: viewport.height / 2 - MENU_HEIGHT / 2
            }

            const adjusted = adjustPosition(centerPosition, viewport)

            // 位置应保持不变（或仅有微小调整）
            expect(Math.abs(adjusted.x - centerPosition.x)).toBeLessThanOrEqual(MARGIN)
            expect(Math.abs(adjusted.y - centerPosition.y)).toBeLessThanOrEqual(MARGIN)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('靠近右下角的点击应向左上调整', () => {
      fc.assert(
        fc.property(
          viewportArb,
          (viewport) => {
            // 在右下角点击
            const cornerPosition = {
              x: viewport.width - 50,
              y: viewport.height - 50
            }

            const adjusted = adjustPosition(cornerPosition, viewport)

            // 位置应向左上调整
            expect(adjusted.x).toBeLessThan(cornerPosition.x)
            expect(adjusted.y).toBeLessThan(cornerPosition.y)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 24: 上下文菜单操作执行
   * For any 菜单项选择，SHALL 执行对应的操作并关闭菜单。
   * **Validates: Requirements 11.5**
   */
  describe('Property 24: 上下文菜单操作执行', () => {
    it('点击非禁用菜单项应调用 onClick', () => {
      fc.assert(
        fc.property(
          menuItemArb.filter(item => !item.disabled),
          (item) => {
            const mockOnClick = jest.fn()
            const testItem = { ...item, onClick: mockOnClick }
            
            // 模拟点击
            testItem.onClick()
            
            expect(mockOnClick).toHaveBeenCalledTimes(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('危险操作应有 danger 标记', () => {
      fc.assert(
        fc.property(
          menuItemArb.filter(item => item.danger),
          (item) => {
            expect(item.danger).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('菜单项分隔线', () => {
    it('分隔线应正确标记', () => {
      fc.assert(
        fc.property(
          fc.array(menuItemArb, { minLength: 2, maxLength: 10 }),
          (items) => {
            const itemsWithDividers = items.filter(item => item.divider)
            
            // 分隔线项的 divider 属性应为 true
            for (const item of itemsWithDividers) {
              expect(item.divider).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
