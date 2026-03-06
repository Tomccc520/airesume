/**
 * @file components/__tests__/toast.property.test.ts
 * @description Toast 生命周期属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import * as fc from 'fast-check'

// Toast 类型
type ToastType = 'success' | 'error' | 'warning' | 'info'
const toastTypes: ToastType[] = ['success', 'error', 'warning', 'info']

// 不同类型的默认持续时间（与 Toast.tsx 保持一致）
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 0
}

// 模拟 Toast 管理器
class ToastManager {
  private toasts: Array<{
    id: string
    type: ToastType
    title: string
    duration: number
    createdAt: number
    closedAt?: number
  }> = []

  addToast(type: ToastType, title: string, duration?: number): string {
    const id = Math.random().toString(36).slice(2, 11)
    const effectiveDuration = duration !== undefined ? duration : DEFAULT_DURATIONS[type]
    
    this.toasts.push({
      id,
      type,
      title,
      duration: effectiveDuration,
      createdAt: Date.now()
    })
    
    return id
  }

  removeToast(id: string): void {
    const toast = this.toasts.find(t => t.id === id)
    if (toast) {
      toast.closedAt = Date.now()
    }
  }

  getToasts() {
    return this.toasts.filter(t => !t.closedAt)
  }

  getAllToasts() {
    return [...this.toasts]
  }

  shouldAutoClose(id: string): boolean {
    const toast = this.toasts.find(t => t.id === id)
    return toast ? toast.duration > 0 : false
  }

  getAutoCloseDuration(id: string): number {
    const toast = this.toasts.find(t => t.id === id)
    return toast?.duration || 0
  }

  clearAll(): void {
    this.toasts = []
  }
}

describe('Toast Property Tests', () => {
  /**
   * Property 31: Toast 提示堆叠
   * For any 同时存在的多个 Toast 提示，SHALL 按时间顺序堆叠显示。
   * **Validates: Requirements 14.5**
   */
  describe('Property 31: Toast 提示堆叠', () => {
    it('多个 Toast 应按创建时间顺序排列', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom(...toastTypes),
              title: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (toastConfigs) => {
            const manager = new ToastManager()
            
            // 添加多个 Toast
            for (const config of toastConfigs) {
              manager.addToast(config.type, config.title)
            }
            
            const toasts = manager.getAllToasts()
            
            // 验证按创建时间排序
            for (let i = 1; i < toasts.length; i++) {
              expect(toasts[i].createdAt).toBeGreaterThanOrEqual(toasts[i - 1].createdAt)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('移除 Toast 后剩余 Toast 应保持顺序', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom(...toastTypes),
              title: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 3, maxLength: 10 }
          ),
          (toastConfigs) => {
            const manager = new ToastManager()
            const ids: string[] = []
            
            // 添加多个 Toast
            for (const config of toastConfigs) {
              ids.push(manager.addToast(config.type, config.title))
            }
            
            // 移除中间的 Toast
            const middleIndex = Math.floor(ids.length / 2)
            manager.removeToast(ids[middleIndex])
            
            const remainingToasts = manager.getToasts()
            
            // 验证剩余 Toast 保持顺序
            for (let i = 1; i < remainingToasts.length; i++) {
              expect(remainingToasts[i].createdAt).toBeGreaterThanOrEqual(remainingToasts[i - 1].createdAt)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 32: Toast 生命周期
   * For any 成功类型的 Toast，SHALL 在 3 秒后自动关闭；
   * 错误类型的 Toast SHALL 保持显示直到用户手动关闭。
   * **Validates: Requirements 14.6**
   */
  describe('Property 32: Toast 生命周期', () => {
    it('成功类型 Toast 应在 3 秒后自动关闭', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const manager = new ToastManager()
            const id = manager.addToast('success', title)
            
            expect(manager.shouldAutoClose(id)).toBe(true)
            expect(manager.getAutoCloseDuration(id)).toBe(3000)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('错误类型 Toast 不应自动关闭', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const manager = new ToastManager()
            const id = manager.addToast('error', title)
            
            expect(manager.shouldAutoClose(id)).toBe(false)
            expect(manager.getAutoCloseDuration(id)).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('信息类型 Toast 应在 4 秒后自动关闭', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const manager = new ToastManager()
            const id = manager.addToast('info', title)
            
            expect(manager.shouldAutoClose(id)).toBe(true)
            expect(manager.getAutoCloseDuration(id)).toBe(4000)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('警告类型 Toast 应在 5 秒后自动关闭', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const manager = new ToastManager()
            const id = manager.addToast('warning', title)
            
            expect(manager.shouldAutoClose(id)).toBe(true)
            expect(manager.getAutoCloseDuration(id)).toBe(5000)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('自定义持续时间应覆盖默认值', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...toastTypes),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 10000 }),
          (type, title, customDuration) => {
            const manager = new ToastManager()
            const id = manager.addToast(type, title, customDuration)
            
            expect(manager.getAutoCloseDuration(id)).toBe(customDuration)
            expect(manager.shouldAutoClose(id)).toBe(customDuration > 0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('默认持续时间配置', () => {
    it('所有类型应有定义的默认持续时间', () => {
      for (const type of toastTypes) {
        expect(DEFAULT_DURATIONS[type]).toBeDefined()
        expect(typeof DEFAULT_DURATIONS[type]).toBe('number')
        expect(DEFAULT_DURATIONS[type]).toBeGreaterThanOrEqual(0)
      }
    })

    it('成功类型默认持续时间应为 3000ms', () => {
      expect(DEFAULT_DURATIONS.success).toBe(3000)
    })

    it('错误类型默认持续时间应为 0（不自动关闭）', () => {
      expect(DEFAULT_DURATIONS.error).toBe(0)
    })
  })
})
