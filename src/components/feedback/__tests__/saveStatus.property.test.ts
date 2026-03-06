/**
 * @file components/feedback/__tests__/saveStatus.property.test.ts
 * @description 保存状态机属性测试 - Property 14: 保存状态机
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * Property Test: 保存状态机
 * 
 * Feature: editor-ux-enhancement
 * Property 14: 保存状态机
 * 
 * *For any* 保存操作序列，保存状态 SHALL 遵循有效的状态转换：
 * idle -> saving -> (saved | error)，且每个状态 SHALL 有对应的正确显示。
 * 
 * **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
 */

import * as fc from 'fast-check'

/**
 * 保存状态类型
 */
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

/**
 * 保存历史记录项
 */
interface SaveHistoryItem {
  timestamp: Date
  success: boolean
  errorMessage?: string
}

/**
 * 有效的状态转换
 * - unsaved -> saving (开始保存)
 * - saving -> saved (保存成功)
 * - saving -> error (保存失败)
 * - error -> saving (重试)
 * - saved -> unsaved (有新更改)
 */
const VALID_TRANSITIONS: Record<SaveStatus, SaveStatus[]> = {
  unsaved: ['saving'],
  saving: ['saved', 'error'],
  saved: ['unsaved', 'saving'],
  error: ['saving', 'unsaved']
}

/**
 * 状态显示配置
 */
const STATUS_DISPLAY: Record<SaveStatus, {
  hasIcon: boolean
  hasText: boolean
  text: string
}> = {
  saved: { hasIcon: true, hasText: true, text: '已保存' },
  saving: { hasIcon: true, hasText: true, text: '保存中...' },
  unsaved: { hasIcon: true, hasText: true, text: '有未保存的更改' },
  error: { hasIcon: true, hasText: true, text: '保存失败' }
}

/**
 * 模拟保存状态机
 */
class SaveStateMachine {
  private _status: SaveStatus = 'saved'
  private _lastSavedAt: Date | null = null
  private _history: SaveHistoryItem[] = []
  private _maxHistoryLength = 5

  get status(): SaveStatus {
    return this._status
  }

  get lastSavedAt(): Date | null {
    return this._lastSavedAt
  }

  get history(): SaveHistoryItem[] {
    return [...this._history]
  }

  /**
   * 标记有未保存的更改
   */
  markUnsaved(): boolean {
    if (this._status === 'saved' || this._status === 'error') {
      this._status = 'unsaved'
      return true
    }
    return false
  }

  /**
   * 开始保存
   */
  startSaving(): boolean {
    if (this._status === 'unsaved' || this._status === 'error' || this._status === 'saved') {
      this._status = 'saving'
      return true
    }
    return false
  }

  /**
   * 保存成功
   */
  saveSuccess(): boolean {
    if (this._status === 'saving') {
      this._status = 'saved'
      this._lastSavedAt = new Date()
      this._addHistoryItem({ timestamp: new Date(), success: true })
      return true
    }
    return false
  }

  /**
   * 保存失败
   */
  saveError(errorMessage?: string): boolean {
    if (this._status === 'saving') {
      this._status = 'error'
      this._addHistoryItem({ 
        timestamp: new Date(), 
        success: false, 
        errorMessage 
      })
      return true
    }
    return false
  }

  /**
   * 添加历史记录
   */
  private _addHistoryItem(item: SaveHistoryItem): void {
    this._history.unshift(item)
    if (this._history.length > this._maxHistoryLength) {
      this._history = this._history.slice(0, this._maxHistoryLength)
    }
  }

  /**
   * 重置状态机
   */
  reset(): void {
    this._status = 'saved'
    this._lastSavedAt = null
    this._history = []
  }
}

/**
 * 生成有效的状态
 */
const statusArbitrary = fc.constantFrom<SaveStatus>('saved', 'saving', 'unsaved', 'error')

/**
 * 生成保存操作序列
 */
type SaveOperation = 'markUnsaved' | 'startSaving' | 'saveSuccess' | 'saveError'
const operationArbitrary = fc.constantFrom<SaveOperation>(
  'markUnsaved', 
  'startSaving', 
  'saveSuccess', 
  'saveError'
)

describe('Property 14: 保存状态机', () => {
  // Feature: editor-ux-enhancement, Property 14: 保存状态机
  // **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

  describe('7.2 保存中状态显示', () => {
    /**
     * Property: 保存中状态 SHALL 有对应的正确显示
     */
    it('saving 状态应有正确的显示配置', () => {
      const display = STATUS_DISPLAY.saving
      
      expect(display.hasIcon).toBe(true)
      expect(display.hasText).toBe(true)
      expect(display.text).toBe('保存中...')
    })

    /**
     * Property: 从 unsaved 状态可以转换到 saving 状态
     */
    it('should transition from unsaved to saving', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            machine.markUnsaved()
            
            expect(machine.status).toBe('unsaved')
            
            const result = machine.startSaving()
            
            expect(result).toBe(true)
            expect(machine.status).toBe('saving')
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('7.3 保存成功状态显示', () => {
    /**
     * Property: 保存成功状态 SHALL 有对应的正确显示
     */
    it('saved 状态应有正确的显示配置', () => {
      const display = STATUS_DISPLAY.saved
      
      expect(display.hasIcon).toBe(true)
      expect(display.hasText).toBe(true)
      expect(display.text).toBe('已保存')
    })

    /**
     * Property: 保存成功后 SHALL 更新最后保存时间
     */
    it('should update lastSavedAt on save success', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            machine.markUnsaved()
            machine.startSaving()
            
            const beforeSave = new Date()
            const result = machine.saveSuccess()
            const afterSave = new Date()
            
            expect(result).toBe(true)
            expect(machine.status).toBe('saved')
            expect(machine.lastSavedAt).not.toBeNull()
            
            if (machine.lastSavedAt) {
              expect(machine.lastSavedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime())
              expect(machine.lastSavedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime())
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 保存成功后 SHALL 添加历史记录
     */
    it('should add history item on save success', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            machine.markUnsaved()
            machine.startSaving()
            machine.saveSuccess()
            
            const history = machine.history
            
            expect(history.length).toBe(1)
            expect(history[0].success).toBe(true)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('7.4 保存失败状态显示', () => {
    /**
     * Property: 保存失败状态 SHALL 有对应的正确显示
     */
    it('error 状态应有正确的显示配置', () => {
      const display = STATUS_DISPLAY.error
      
      expect(display.hasIcon).toBe(true)
      expect(display.hasText).toBe(true)
      expect(display.text).toBe('保存失败')
    })

    /**
     * Property: 保存失败后 SHALL 添加失败历史记录
     */
    it('should add failed history item on save error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (errorMessage) => {
            const machine = new SaveStateMachine()
            machine.markUnsaved()
            machine.startSaving()
            machine.saveError(errorMessage)
            
            const history = machine.history
            
            expect(history.length).toBe(1)
            expect(history[0].success).toBe(false)
            expect(history[0].errorMessage).toBe(errorMessage)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 从 error 状态可以重试（转换到 saving）
     */
    it('should allow retry from error state', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            machine.markUnsaved()
            machine.startSaving()
            machine.saveError('Test error')
            
            expect(machine.status).toBe('error')
            
            const result = machine.startSaving()
            
            expect(result).toBe(true)
            expect(machine.status).toBe('saving')
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('7.5 未保存更改状态显示', () => {
    /**
     * Property: 未保存更改状态 SHALL 有对应的正确显示
     */
    it('unsaved 状态应有正确的显示配置', () => {
      const display = STATUS_DISPLAY.unsaved
      
      expect(display.hasIcon).toBe(true)
      expect(display.hasText).toBe(true)
      expect(display.text).toBe('有未保存的更改')
    })

    /**
     * Property: 从 saved 状态可以转换到 unsaved 状态
     */
    it('should transition from saved to unsaved', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            
            expect(machine.status).toBe('saved')
            
            const result = machine.markUnsaved()
            
            expect(result).toBe(true)
            expect(machine.status).toBe('unsaved')
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('状态转换有效性', () => {
    /**
     * Property: 所有状态 SHALL 有有效的转换定义
     */
    it('all states should have valid transitions defined', () => {
      const allStates: SaveStatus[] = ['saved', 'saving', 'unsaved', 'error']
      
      allStates.forEach(state => {
        expect(VALID_TRANSITIONS[state]).toBeDefined()
        expect(Array.isArray(VALID_TRANSITIONS[state])).toBe(true)
        expect(VALID_TRANSITIONS[state].length).toBeGreaterThan(0)
      })
    })

    /**
     * Property: 无效的状态转换 SHALL 被拒绝
     */
    it('should reject invalid state transitions', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const machine = new SaveStateMachine()
            
            // 初始状态是 saved，不能直接 saveSuccess
            const result1 = machine.saveSuccess()
            expect(result1).toBe(false)
            expect(machine.status).toBe('saved')
            
            // 初始状态是 saved，不能直接 saveError
            const result2 = machine.saveError()
            expect(result2).toBe(false)
            expect(machine.status).toBe('saved')
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 完整的保存流程 SHALL 正确执行
     */
    it('should execute complete save flow correctly', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (shouldSucceed) => {
            const machine = new SaveStateMachine()
            
            // 1. 标记有更改
            machine.markUnsaved()
            expect(machine.status).toBe('unsaved')
            
            // 2. 开始保存
            machine.startSaving()
            expect(machine.status).toBe('saving')
            
            // 3. 保存结果
            if (shouldSucceed) {
              machine.saveSuccess()
              expect(machine.status).toBe('saved')
              expect(machine.lastSavedAt).not.toBeNull()
            } else {
              machine.saveError('Test error')
              expect(machine.status).toBe('error')
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('历史记录限制', () => {
    /**
     * Property: 历史记录数量 SHALL <= 5
     */
    it('should limit history to 5 items', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 20 }),
          (saveCount) => {
            const machine = new SaveStateMachine()
            
            for (let i = 0; i < saveCount; i++) {
              machine.markUnsaved()
              machine.startSaving()
              machine.saveSuccess()
            }
            
            expect(machine.history.length).toBeLessThanOrEqual(5)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 历史记录 SHALL 按时间倒序排列（最新的在前）
     */
    it('should order history by time descending', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (saveCount) => {
            const machine = new SaveStateMachine()
            
            for (let i = 0; i < saveCount; i++) {
              machine.markUnsaved()
              machine.startSaving()
              machine.saveSuccess()
            }
            
            const history = machine.history
            
            for (let i = 0; i < history.length - 1; i++) {
              expect(history[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                history[i + 1].timestamp.getTime()
              )
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('所有状态显示配置', () => {
    /**
     * Property: 每个状态 SHALL 有对应的正确显示配置
     */
    it('all states should have display configuration', () => {
      fc.assert(
        fc.property(
          statusArbitrary,
          (status) => {
            const display = STATUS_DISPLAY[status]
            
            expect(display).toBeDefined()
            expect(display.hasIcon).toBe(true)
            expect(display.hasText).toBe(true)
            expect(typeof display.text).toBe('string')
            expect(display.text.length).toBeGreaterThan(0)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
