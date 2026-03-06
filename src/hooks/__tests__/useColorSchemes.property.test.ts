/**
 * @file hooks/__tests__/useColorSchemes.property.test.ts
 * @description 配色方案持久化属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * Property Test: 配色方案持久化
 * 
 * Feature: editor-ux-enhancement
 * Property 10: 配色方案持久化
 * 
 * *For any* 保存的自定义配色方案，SHALL 被存储到本地存储中，
 * 且 SHALL 出现在配色方案列表中，且 SHALL 可被正确加载和应用。
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.7**
 */

import * as fc from 'fast-check'

/**
 * 配色方案接口（与 useColorSchemes.ts 保持一致）
 */
interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  text: string
  background: string
  isPreset: boolean
  createdAt?: Date
}

/**
 * 本地存储键名（与 useColorSchemes.ts 保持一致）
 */
const STORAGE_KEY = 'custom-color-schemes'

/**
 * 生成有效的十六进制颜色
 */
const hexColorArbitrary = fc.array(
  fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
  { minLength: 6, maxLength: 6 }
).map(chars => `#${chars.join('')}`)


/**
 * 生成有效的配色方案名称
 */
const schemeNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(name => name.trim().length > 0)

/**
 * 生成有效的配色方案（不含 id 和 createdAt）
 */
const colorSchemeInputArbitrary = fc.record({
  name: schemeNameArbitrary,
  primary: hexColorArbitrary,
  secondary: hexColorArbitrary,
  accent: hexColorArbitrary,
  text: hexColorArbitrary,
  background: hexColorArbitrary,
  isPreset: fc.constant(false)
})

/**
 * 生成完整的配色方案（含 id）
 */
const fullColorSchemeArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 30 }).map(s => `custom-${s}`),
  name: schemeNameArbitrary,
  primary: hexColorArbitrary,
  secondary: hexColorArbitrary,
  accent: hexColorArbitrary,
  text: hexColorArbitrary,
  background: hexColorArbitrary,
  isPreset: fc.constant(false),
  createdAt: fc.date()
})

/**
 * 模拟本地存储
 */
class MockLocalStorage {
  private store: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}


/**
 * 验证配色方案数据有效性（与 useColorSchemes.ts 保持一致）
 */
function isValidColorScheme(scheme: unknown): scheme is ColorScheme {
  if (!scheme || typeof scheme !== 'object') return false
  
  const s = scheme as Record<string, unknown>
  
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.primary === 'string' &&
    typeof s.secondary === 'string' &&
    typeof s.accent === 'string' &&
    typeof s.text === 'string' &&
    typeof s.background === 'string' &&
    typeof s.isPreset === 'boolean'
  )
}

/**
 * 生成唯一 ID（与 useColorSchemes.ts 保持一致）
 */
function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 模拟配色方案管理器（纯函数实现，用于属性测试）
 */
class ColorSchemeManager {
  private storage: MockLocalStorage
  private customSchemes: ColorScheme[] = []

  constructor(storage: MockLocalStorage) {
    this.storage = storage
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    const stored = this.storage.getItem(STORAGE_KEY)
    if (!stored) {
      this.customSchemes = []
      return
    }

    try {
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        this.customSchemes = []
        return
      }

      this.customSchemes = parsed
        .filter(isValidColorScheme)
        .map(scheme => ({
          ...scheme,
          createdAt: scheme.createdAt ? new Date(scheme.createdAt) : undefined,
          isPreset: false
        }))
    } catch {
      this.customSchemes = []
    }
  }


  private saveToStorage(): void {
    const toStore = this.customSchemes.map(scheme => ({
      ...scheme,
      createdAt: scheme.createdAt?.toISOString()
    }))
    this.storage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  }

  /**
   * 保存自定义配色方案
   */
  saveScheme(scheme: Omit<ColorScheme, 'id' | 'createdAt'>): ColorScheme {
    const newScheme: ColorScheme = {
      ...scheme,
      id: generateId(),
      createdAt: new Date(),
      isPreset: false
    }
    this.customSchemes.push(newScheme)
    this.saveToStorage()
    return newScheme
  }

  /**
   * 删除自定义配色方案
   */
  deleteScheme(schemeId: string): boolean {
    const index = this.customSchemes.findIndex(s => s.id === schemeId)
    if (index === -1) return false
    
    const scheme = this.customSchemes[index]
    if (scheme.isPreset) return false
    
    this.customSchemes.splice(index, 1)
    this.saveToStorage()
    return true
  }

  /**
   * 重命名配色方案
   */
  renameScheme(schemeId: string, newName: string): boolean {
    if (!newName.trim()) return false
    
    const scheme = this.customSchemes.find(s => s.id === schemeId)
    if (!scheme || scheme.isPreset) return false
    
    scheme.name = newName.trim()
    this.saveToStorage()
    return true
  }

  /**
   * 获取所有自定义方案
   */
  getCustomSchemes(): ColorScheme[] {
    return [...this.customSchemes]
  }

  /**
   * 根据 ID 获取方案
   */
  getSchemeById(id: string): ColorScheme | undefined {
    return this.customSchemes.find(s => s.id === id)
  }
}


describe('Property 10: 配色方案持久化', () => {
  // Feature: editor-ux-enhancement, Property 10: 配色方案持久化
  // **Validates: Requirements 5.1, 5.2, 5.3, 5.7**

  let storage: MockLocalStorage

  beforeEach(() => {
    storage = new MockLocalStorage()
  })

  describe('5.1 保存配色方案到本地存储', () => {
    /**
     * Property: 保存的配色方案 SHALL 被存储到本地存储中
     */
    it('should persist saved schemes to localStorage', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            // 保存方案
            manager.saveScheme(schemeInput)
            
            // 验证本地存储中有数据
            const stored = storage.getItem(STORAGE_KEY)
            if (!stored) return false
            
            const parsed = JSON.parse(stored)
            return Array.isArray(parsed) && parsed.length === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 保存的方案数据 SHALL 与输入数据一致
     */
    it('should store scheme data correctly', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            manager.saveScheme(schemeInput)
            
            const stored = storage.getItem(STORAGE_KEY)
            if (!stored) return false
            
            const parsed = JSON.parse(stored)
            const savedScheme = parsed[0]
            
            // 验证核心属性一致
            return (
              savedScheme.name === schemeInput.name &&
              savedScheme.primary === schemeInput.primary &&
              savedScheme.secondary === schemeInput.secondary &&
              savedScheme.accent === schemeInput.accent &&
              savedScheme.text === schemeInput.text &&
              savedScheme.background === schemeInput.background &&
              savedScheme.isPreset === false
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  describe('5.2 配色方案出现在列表中', () => {
    /**
     * Property: 保存的方案 SHALL 出现在 customSchemes 列表中
     */
    it('should include saved schemes in customSchemes list', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            const savedScheme = manager.saveScheme(schemeInput)
            const schemes = manager.getCustomSchemes()
            
            // 验证方案在列表中
            return schemes.some(s => s.id === savedScheme.id)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 多个保存的方案 SHALL 全部出现在列表中
     */
    it('should include all saved schemes in list', () => {
      fc.assert(
        fc.property(
          fc.array(colorSchemeInputArbitrary, { minLength: 1, maxLength: 10 }),
          (schemeInputs) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            const savedSchemes = schemeInputs.map(input => manager.saveScheme(input))
            const schemes = manager.getCustomSchemes()
            
            // 验证所有方案都在列表中
            return savedSchemes.every(saved => 
              schemes.some(s => s.id === saved.id)
            ) && schemes.length === savedSchemes.length
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('5.3 配色方案可被正确加载', () => {
    /**
     * Property: 保存后重新加载 SHALL 恢复相同的方案数据
     */
    it('should correctly load saved schemes after reload', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            
            // 第一个管理器保存方案
            const manager1 = new ColorSchemeManager(storage)
            const savedScheme = manager1.saveScheme(schemeInput)
            
            // 第二个管理器从存储加载
            const manager2 = new ColorSchemeManager(storage)
            const loadedSchemes = manager2.getCustomSchemes()
            
            // 验证加载的方案与保存的一致
            const loadedScheme = loadedSchemes.find(s => s.id === savedScheme.id)
            if (!loadedScheme) return false
            
            return (
              loadedScheme.name === savedScheme.name &&
              loadedScheme.primary === savedScheme.primary &&
              loadedScheme.secondary === savedScheme.secondary &&
              loadedScheme.accent === savedScheme.accent &&
              loadedScheme.text === savedScheme.text &&
              loadedScheme.background === savedScheme.background
            )
          }
        ),
        { numRuns: 100 }
      )
    })


    /**
     * Property: 多个方案保存后重新加载 SHALL 全部恢复
     */
    it('should correctly load multiple saved schemes', () => {
      fc.assert(
        fc.property(
          fc.array(colorSchemeInputArbitrary, { minLength: 1, maxLength: 5 }),
          (schemeInputs) => {
            storage.clear()
            
            // 保存多个方案
            const manager1 = new ColorSchemeManager(storage)
            const savedSchemes = schemeInputs.map(input => manager1.saveScheme(input))
            
            // 重新加载
            const manager2 = new ColorSchemeManager(storage)
            const loadedSchemes = manager2.getCustomSchemes()
            
            // 验证数量一致
            if (loadedSchemes.length !== savedSchemes.length) return false
            
            // 验证每个方案都能找到
            return savedSchemes.every(saved => 
              loadedSchemes.some(loaded => 
                loaded.id === saved.id &&
                loaded.name === saved.name &&
                loaded.primary === saved.primary
              )
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('5.7 本地存储持久化', () => {
    /**
     * Property: 存储的数据格式 SHALL 是有效的 JSON
     */
    it('should store valid JSON format', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            manager.saveScheme(schemeInput)
            
            const stored = storage.getItem(STORAGE_KEY)
            if (!stored) return false
            
            try {
              JSON.parse(stored)
              return true
            } catch {
              return false
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 存储的每个方案 SHALL 包含所有必需字段
     */
    it('should store all required fields', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            manager.saveScheme(schemeInput)
            
            const stored = storage.getItem(STORAGE_KEY)
            if (!stored) return false
            
            const parsed = JSON.parse(stored)
            const scheme = parsed[0]
            
            // 验证所有必需字段存在
            return (
              typeof scheme.id === 'string' &&
              typeof scheme.name === 'string' &&
              typeof scheme.primary === 'string' &&
              typeof scheme.secondary === 'string' &&
              typeof scheme.accent === 'string' &&
              typeof scheme.text === 'string' &&
              typeof scheme.background === 'string' &&
              typeof scheme.isPreset === 'boolean'
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  describe('删除和重命名操作', () => {
    /**
     * Property: 删除操作 SHALL 从列表和存储中移除方案
     */
    it('should remove scheme from list and storage on delete', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            // 保存方案
            const savedScheme = manager.saveScheme(schemeInput)
            
            // 删除方案
            const deleted = manager.deleteScheme(savedScheme.id)
            if (!deleted) return false
            
            // 验证列表中不存在
            const schemes = manager.getCustomSchemes()
            if (schemes.some(s => s.id === savedScheme.id)) return false
            
            // 验证存储中不存在
            const stored = storage.getItem(STORAGE_KEY)
            if (!stored) return true // 空存储也是正确的
            
            const parsed = JSON.parse(stored)
            return !parsed.some((s: ColorScheme) => s.id === savedScheme.id)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 删除不存在的方案 SHALL 返回 false
     */
    it('should return false when deleting non-existent scheme', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 30 }),
          (randomId) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            // 尝试删除不存在的方案
            const deleted = manager.deleteScheme(`non-existent-${randomId}`)
            return deleted === false
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 重命名操作 SHALL 更新方案名称
     */
    it('should update scheme name on rename', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          schemeNameArbitrary,
          (schemeInput, newName) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            // 保存方案
            const savedScheme = manager.saveScheme(schemeInput)
            
            // 重命名方案
            const renamed = manager.renameScheme(savedScheme.id, newName)
            if (!renamed) return false
            
            // 验证名称已更新
            const scheme = manager.getSchemeById(savedScheme.id)
            if (!scheme) return false
            
            return scheme.name === newName.trim()
          }
        ),
        { numRuns: 100 }
      )
    })


    /**
     * Property: 重命名后存储 SHALL 反映新名称
     */
    it('should persist renamed scheme to storage', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          schemeNameArbitrary,
          (schemeInput, newName) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            // 保存并重命名
            const savedScheme = manager.saveScheme(schemeInput)
            manager.renameScheme(savedScheme.id, newName)
            
            // 重新加载验证
            const manager2 = new ColorSchemeManager(storage)
            const loadedScheme = manager2.getSchemeById(savedScheme.id)
            
            if (!loadedScheme) return false
            return loadedScheme.name === newName.trim()
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 空名称重命名 SHALL 失败
     */
    it('should fail to rename with empty name', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          fc.constantFrom('', '   ', '\t', '\n'),
          (schemeInput, emptyName) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            const savedScheme = manager.saveScheme(schemeInput)
            const renamed = manager.renameScheme(savedScheme.id, emptyName)
            
            // 重命名应该失败
            return renamed === false
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('边界情况', () => {
    /**
     * Property: 空存储加载 SHALL 返回空列表
     */
    it('should return empty list when storage is empty', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            return manager.getCustomSchemes().length === 0
          }
        ),
        { numRuns: 10 }
      )
    })

    /**
     * Property: 无效 JSON 存储 SHALL 返回空列表
     */
    it('should return empty list when storage contains invalid JSON', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
            try {
              JSON.parse(s)
              return false
            } catch {
              return true
            }
          }),
          (invalidJson) => {
            storage.clear()
            storage.setItem(STORAGE_KEY, invalidJson)
            
            const manager = new ColorSchemeManager(storage)
            return manager.getCustomSchemes().length === 0
          }
        ),
        { numRuns: 50 }
      )
    })


    /**
     * Property: 非数组存储 SHALL 返回空列表
     */
    it('should return empty list when storage contains non-array', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({ key: fc.string() })
          ),
          (nonArray) => {
            storage.clear()
            storage.setItem(STORAGE_KEY, JSON.stringify(nonArray))
            
            const manager = new ColorSchemeManager(storage)
            return manager.getCustomSchemes().length === 0
          }
        ),
        { numRuns: 50 }
      )
    })

    /**
     * Property: 无效方案数据 SHALL 被过滤掉
     */
    it('should filter out invalid scheme data', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (validSchemeInput) => {
            storage.clear()
            
            // 存储混合有效和无效数据
            const invalidScheme = { id: 'invalid', name: 123 } // 无效：name 不是字符串
            const validScheme = {
              id: 'valid-1',
              ...validSchemeInput,
              isPreset: false
            }
            
            storage.setItem(STORAGE_KEY, JSON.stringify([invalidScheme, validScheme]))
            
            const manager = new ColorSchemeManager(storage)
            const schemes = manager.getCustomSchemes()
            
            // 只有有效方案被加载
            return schemes.length === 1 && schemes[0].id === 'valid-1'
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 保存的方案 SHALL 自动生成唯一 ID
     */
    it('should generate unique IDs for saved schemes', () => {
      fc.assert(
        fc.property(
          fc.array(colorSchemeInputArbitrary, { minLength: 2, maxLength: 10 }),
          (schemeInputs) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            const savedSchemes = schemeInputs.map(input => manager.saveScheme(input))
            const ids = savedSchemes.map(s => s.id)
            
            // 所有 ID 应该唯一
            const uniqueIds = new Set(ids)
            return uniqueIds.size === ids.length
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 保存的方案 SHALL 有 createdAt 时间戳
     */
    it('should set createdAt timestamp on save', () => {
      fc.assert(
        fc.property(
          colorSchemeInputArbitrary,
          (schemeInput) => {
            storage.clear()
            const manager = new ColorSchemeManager(storage)
            
            const beforeSave = new Date()
            const savedScheme = manager.saveScheme(schemeInput)
            const afterSave = new Date()
            
            if (!savedScheme.createdAt) return false
            
            // createdAt 应该在保存前后之间
            return (
              savedScheme.createdAt >= beforeSave &&
              savedScheme.createdAt <= afterSave
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
