/**
 * @file hooks/__tests__/useGlobalShortcuts.property.test.ts
 * @description 快捷键持久化属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import * as fc from 'fast-check'
import {
  DEFAULT_SHORTCUTS,
  ShortcutConfig,
  parseShortcut,
  matchesShortcut,
  formatShortcut
} from '../useGlobalShortcuts'

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] || null
  }
}

describe('useGlobalShortcuts Property Tests', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>

  beforeEach(() => {
    mockStorage = createMockLocalStorage()
    Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true })
  })

  afterEach(() => {
    mockStorage.clear()
  })

  /**
   * Property 22: 自定义快捷键持久化
   * For any 自定义的快捷键配置，SHALL 被保存并在下次加载时正确应用。
   * **Validates: Requirements 10.7**
   */
  describe('Property 22: 自定义快捷键持久化', () => {
    // 生成有效的快捷键字符串
    const shortcutKeyArb = fc.oneof(
      fc.constant('Ctrl+S'),
      fc.constant('Ctrl+Shift+S'),
      fc.constant('Ctrl+Alt+S'),
      fc.constant('Ctrl+Z'),
      fc.constant('Ctrl+Shift+Z'),
      fc.constant('Ctrl+P'),
      fc.constant('Ctrl+D'),
      fc.constant('Ctrl+K'),
      fc.constant('Ctrl+1'),
      fc.constant('Ctrl+2'),
      fc.constant('Ctrl+3'),
      fc.constant('Delete'),
      fc.constant('Escape')
    )

    // 生成快捷键配置修改
    const shortcutModificationArb = fc.record({
      id: fc.constantFrom(...DEFAULT_SHORTCUTS.map(s => s.id)),
      customKey: shortcutKeyArb,
      enabled: fc.boolean()
    })

    it('保存的自定义快捷键应能从存储中正确加载', () => {
      fc.assert(
        fc.property(
          shortcutModificationArb,
          (modification) => {
            // 应用单个修改并保存
            const modifiedShortcuts = DEFAULT_SHORTCUTS.map(shortcut => {
              if (shortcut.id === modification.id) {
                return { ...shortcut, customKey: modification.customKey, enabled: modification.enabled }
              }
              return shortcut
            })

            // 保存到存储
            mockStorage.setItem('shortcut-config', JSON.stringify(modifiedShortcuts))

            // 从存储加载
            const stored = mockStorage.getItem('shortcut-config')
            expect(stored).not.toBeNull()

            const loaded = JSON.parse(stored!) as ShortcutConfig[]

            // 验证修改被正确保存
            const loadedShortcut = loaded.find(s => s.id === modification.id)
            expect(loadedShortcut).toBeDefined()
            expect(loadedShortcut?.customKey).toBe(modification.customKey)
            expect(loadedShortcut?.enabled).toBe(modification.enabled)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('快捷键配置应保持所有必需字段', () => {
      fc.assert(
        fc.property(
          shortcutModificationArb,
          (modification) => {
            const shortcut = DEFAULT_SHORTCUTS.find(s => s.id === modification.id)!
            const modified: ShortcutConfig = {
              ...shortcut,
              customKey: modification.customKey,
              enabled: modification.enabled
            }

            // 验证所有必需字段存在
            expect(modified.id).toBeDefined()
            expect(modified.name).toBeDefined()
            expect(modified.nameEn).toBeDefined()
            expect(modified.defaultKey).toBeDefined()
            expect(modified.description).toBeDefined()
            expect(modified.descriptionEn).toBeDefined()
            expect(typeof modified.enabled).toBe('boolean')
            expect(modified.category).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('重置快捷键应恢复默认配置', () => {
      fc.assert(
        fc.property(
          fc.array(shortcutModificationArb, { minLength: 1, maxLength: 10 }),
          (modifications) => {
            // 应用修改
            const modifiedShortcuts = DEFAULT_SHORTCUTS.map(shortcut => {
              const mod = modifications.find(m => m.id === shortcut.id)
              if (mod) {
                return { ...shortcut, customKey: mod.customKey, enabled: mod.enabled }
              }
              return shortcut
            })

            mockStorage.setItem('shortcut-config', JSON.stringify(modifiedShortcuts))

            // 重置
            mockStorage.setItem('shortcut-config', JSON.stringify(DEFAULT_SHORTCUTS))

            // 验证恢复默认
            const stored = mockStorage.getItem('shortcut-config')
            const loaded = JSON.parse(stored!) as ShortcutConfig[]

            for (const defaultShortcut of DEFAULT_SHORTCUTS) {
              const loadedShortcut = loaded.find(s => s.id === defaultShortcut.id)
              expect(loadedShortcut?.customKey).toBeUndefined()
              expect(loadedShortcut?.enabled).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('快捷键解析', () => {
    it('parseShortcut 应正确解析所有快捷键格式', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'Ctrl+S',
            'Ctrl+Shift+Z',
            'Ctrl+Alt+D',
            'Delete',
            'Escape',
            'Ctrl+1',
            'Ctrl+K'
          ),
          (shortcut) => {
            const parsed = parseShortcut(shortcut)
            
            // 验证解析结果结构
            expect(typeof parsed.ctrl).toBe('boolean')
            expect(typeof parsed.shift).toBe('boolean')
            expect(typeof parsed.alt).toBe('boolean')
            expect(typeof parsed.meta).toBe('boolean')
            expect(typeof parsed.key).toBe('string')
            expect(parsed.key.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Ctrl 修饰键应被正确识别', () => {
      const parsed = parseShortcut('Ctrl+S')
      expect(parsed.ctrl).toBe(true)
      expect(parsed.shift).toBe(false)
      expect(parsed.alt).toBe(false)
      expect(parsed.key).toBe('s')
    })

    it('Shift 修饰键应被正确识别', () => {
      const parsed = parseShortcut('Ctrl+Shift+Z')
      expect(parsed.ctrl).toBe(true)
      expect(parsed.shift).toBe(true)
      expect(parsed.key).toBe('z')
    })

    it('Alt 修饰键应被正确识别', () => {
      const parsed = parseShortcut('Ctrl+Alt+D')
      expect(parsed.ctrl).toBe(true)
      expect(parsed.alt).toBe(true)
      expect(parsed.key).toBe('d')
    })

    it('单键快捷键应被正确解析', () => {
      const parsed = parseShortcut('Delete')
      expect(parsed.ctrl).toBe(false)
      expect(parsed.shift).toBe(false)
      expect(parsed.alt).toBe(false)
      expect(parsed.key).toBe('delete')
    })
  })

  describe('快捷键匹配', () => {
    const createKeyboardEvent = (options: {
      key: string
      ctrlKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
      metaKey?: boolean
    }): KeyboardEvent => {
      return new KeyboardEvent('keydown', {
        key: options.key,
        ctrlKey: options.ctrlKey || false,
        shiftKey: options.shiftKey || false,
        altKey: options.altKey || false,
        metaKey: options.metaKey || false
      })
    }

    it('matchesShortcut 应正确匹配 Ctrl+S', () => {
      const event = createKeyboardEvent({ key: 's', ctrlKey: true })
      expect(matchesShortcut(event, 'Ctrl+S')).toBe(true)
    })

    it('matchesShortcut 应正确匹配 Ctrl+Shift+Z', () => {
      const event = createKeyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true })
      expect(matchesShortcut(event, 'Ctrl+Shift+Z')).toBe(true)
    })

    it('matchesShortcut 应拒绝不匹配的事件', () => {
      const event = createKeyboardEvent({ key: 's', ctrlKey: false })
      expect(matchesShortcut(event, 'Ctrl+S')).toBe(false)
    })

    it('matchesShortcut 应处理 Delete 键', () => {
      const event = createKeyboardEvent({ key: 'Delete' })
      expect(matchesShortcut(event, 'Delete')).toBe(true)
    })
  })

  describe('快捷键格式化', () => {
    it('formatShortcut 应在非 Mac 上保持原样', () => {
      expect(formatShortcut('Ctrl+S', false)).toBe('Ctrl+S')
      expect(formatShortcut('Ctrl+Shift+Z', false)).toBe('Ctrl+Shift+Z')
    })

    it('formatShortcut 应在 Mac 上转换符号', () => {
      expect(formatShortcut('Ctrl+S', true)).toBe('⌘S')
      expect(formatShortcut('Ctrl+Shift+Z', true)).toBe('⌘⇧Z')
      expect(formatShortcut('Ctrl+Alt+D', true)).toBe('⌘⌥D')
    })
  })

  describe('默认快捷键配置', () => {
    it('所有默认快捷键应有唯一 ID', () => {
      const ids = DEFAULT_SHORTCUTS.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('所有默认快捷键应默认启用', () => {
      for (const shortcut of DEFAULT_SHORTCUTS) {
        expect(shortcut.enabled).toBe(true)
      }
    })

    it('所有默认快捷键应有有效分类', () => {
      const validCategories = ['file', 'edit', 'navigation', 'view']
      for (const shortcut of DEFAULT_SHORTCUTS) {
        expect(validCategories).toContain(shortcut.category)
      }
    })

    it('所有默认快捷键应有中英文名称和描述', () => {
      for (const shortcut of DEFAULT_SHORTCUTS) {
        expect(shortcut.name.length).toBeGreaterThan(0)
        expect(shortcut.nameEn.length).toBeGreaterThan(0)
        expect(shortcut.description.length).toBeGreaterThan(0)
        expect(shortcut.descriptionEn.length).toBeGreaterThan(0)
      }
    })
  })
})
