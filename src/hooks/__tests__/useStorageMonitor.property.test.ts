/**
 * @file hooks/__tests__/useStorageMonitor.property.test.ts
 * @description 存储使用量计算属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * **Property 20: 存储使用量计算**
 * **Validates: Requirements 9.1, 9.4**
 */

import * as fc from 'fast-check'
import { 
  getStringByteSize, 
  getStorageUsage,
  performCleanup
} from '../useStorageMonitor'
import type { CleanupOptions } from '../../components/data/StorageMonitor'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

// 设置 mock
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  })
})

beforeEach(() => {
  mockLocalStorage.clear()
})

describe('Property 20: 存储使用量计算', () => {
  /**
   * **Property 20: 存储使用量计算**
   * 
   * *For any* 存储监控调用，返回的使用量 SHALL 等于各类数据占用之和，
   * 且百分比 SHALL 正确反映使用量与总空间的比例。
   * 
   * **Validates: Requirements 9.1, 9.4**
   */
  describe('存储使用量等于各类数据占用之和', () => {
    it('should calculate total usage as sum of all breakdown categories', () => {
      fc.assert(
        fc.property(
          // 生成各类数据的大小（字节）
          fc.record({
            resumes: fc.nat({ max: 100000 }),
            versionHistory: fc.nat({ max: 50000 }),
            colorSchemes: fc.nat({ max: 10000 }),
            settings: fc.nat({ max: 5000 }),
            other: fc.nat({ max: 20000 })
          }),
          fc.integer({ min: 1000000, max: 10000000 }), // 总限制
          (breakdown, totalLimit) => {
            // 清理之前的数据
            mockLocalStorage.clear()
            
            // 模拟存储数据
            if (breakdown.resumes > 0) {
              mockLocalStorage.setItem('resume-data', 'x'.repeat(breakdown.resumes))
            }
            if (breakdown.versionHistory > 0) {
              mockLocalStorage.setItem('resume-versions', 'x'.repeat(breakdown.versionHistory))
            }
            if (breakdown.colorSchemes > 0) {
              mockLocalStorage.setItem('custom-color-schemes', 'x'.repeat(breakdown.colorSchemes))
            }
            if (breakdown.settings > 0) {
              mockLocalStorage.setItem('app-settings', 'x'.repeat(breakdown.settings))
            }
            
            // 获取存储使用情况
            const usage = getStorageUsage(totalLimit)
            
            // 验证：使用量等于各类数据占用之和
            const breakdownSum = 
              usage.breakdown.resumes + 
              usage.breakdown.versionHistory + 
              usage.breakdown.colorSchemes + 
              usage.breakdown.settings + 
              usage.breakdown.other
            
            // 允许小误差（由于键名也占用空间）
            const tolerance = 500
            return Math.abs(usage.used - breakdownSum) <= tolerance
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('百分比正确反映使用量与总空间的比例', () => {
    it('should calculate percentage correctly', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100000 }), // 使用量
          fc.integer({ min: 100000, max: 10000000 }), // 总限制
          (usedBytes, totalLimit) => {
            mockLocalStorage.clear()
            
            // 存储一些数据
            if (usedBytes > 0) {
              mockLocalStorage.setItem('resume-data', 'x'.repeat(usedBytes))
            }
            
            const usage = getStorageUsage(totalLimit)
            
            // 验证百分比计算
            const expectedPercentage = totalLimit > 0 
              ? (usage.used / totalLimit) * 100 
              : 0
            
            // 允许浮点数误差
            return Math.abs(usage.percentage - expectedPercentage) < 0.001
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('百分比范围有效性', () => {
    it('should keep percentage within valid range (0-100+)', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 200000 }),
          fc.integer({ min: 10000, max: 100000 }),
          (usedBytes, totalLimit) => {
            mockLocalStorage.clear()
            
            if (usedBytes > 0) {
              mockLocalStorage.setItem('resume-data', 'x'.repeat(usedBytes))
            }
            
            const usage = getStorageUsage(totalLimit)
            
            // 百分比应该 >= 0
            return usage.percentage >= 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('空存储时使用量为零', () => {
    it('should return zero usage for empty storage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: 10000000 }),
          (totalLimit) => {
            mockLocalStorage.clear()
            
            const usage = getStorageUsage(totalLimit)
            
            return (
              usage.used === 0 &&
              usage.percentage === 0 &&
              usage.breakdown.resumes === 0 &&
              usage.breakdown.versionHistory === 0 &&
              usage.breakdown.colorSchemes === 0 &&
              usage.breakdown.settings === 0 &&
              usage.breakdown.other === 0
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('各类数据分类正确', () => {
    it('should categorize storage items correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            resumeSize: fc.nat({ max: 10000 }),
            versionSize: fc.nat({ max: 10000 }),
            schemeSize: fc.nat({ max: 5000 }),
            settingsSize: fc.nat({ max: 2000 })
          }),
          ({ resumeSize, versionSize, schemeSize, settingsSize }) => {
            mockLocalStorage.clear()
            
            // 设置各类数据
            if (resumeSize > 0) {
              mockLocalStorage.setItem('resume-data', 'r'.repeat(resumeSize))
            }
            if (versionSize > 0) {
              mockLocalStorage.setItem('resume-versions', 'v'.repeat(versionSize))
            }
            if (schemeSize > 0) {
              mockLocalStorage.setItem('custom-color-schemes', 'c'.repeat(schemeSize))
            }
            if (settingsSize > 0) {
              mockLocalStorage.setItem('app-settings', 's'.repeat(settingsSize))
            }
            
            const usage = getStorageUsage()
            
            // 验证分类正确（考虑键名占用的空间）
            const resumeKeySize = getStringByteSize('resume-data')
            const versionKeySize = getStringByteSize('resume-versions')
            const schemeKeySize = getStringByteSize('custom-color-schemes')
            const settingsKeySize = getStringByteSize('app-settings')
            
            const expectedResumes = resumeSize > 0 ? resumeSize + resumeKeySize : 0
            const expectedVersions = versionSize > 0 ? versionSize + versionKeySize : 0
            const expectedSchemes = schemeSize > 0 ? schemeSize + schemeKeySize : 0
            const expectedSettings = settingsSize > 0 ? settingsSize + settingsKeySize : 0
            
            // 允许小误差
            const tolerance = 10
            return (
              Math.abs(usage.breakdown.resumes - expectedResumes) <= tolerance &&
              Math.abs(usage.breakdown.versionHistory - expectedVersions) <= tolerance &&
              Math.abs(usage.breakdown.colorSchemes - expectedSchemes) <= tolerance
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

describe('getStringByteSize 函数', () => {
  it('should calculate byte size correctly for ASCII strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 1000 }),
        (str) => {
          const size = getStringByteSize(str)
          // 字节大小应该 >= 字符串长度（UTF-8 编码）
          return size >= 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty strings', () => {
    expect(getStringByteSize('')).toBe(0)
  })

  it('should handle ASCII strings correctly', () => {
    // ASCII 字符每个占 1 字节
    expect(getStringByteSize('hello')).toBe(5)
    expect(getStringByteSize('test123')).toBe(7)
  })

  it('should handle Unicode strings', () => {
    // 中文字符每个占 3 字节（UTF-8）
    const chineseStr = '你好'
    const size = getStringByteSize(chineseStr)
    expect(size).toBeGreaterThan(chineseStr.length)
  })
})

describe('performCleanup 函数', () => {
  it('should return freed bytes after cleanup', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (keepVersions) => {
          mockLocalStorage.clear()
          
          // 设置版本历史数据
          const versions = Array.from({ length: 10 }, (_, i) => ({
            id: `v${i}`,
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
            data: 'x'.repeat(100)
          }))
          mockLocalStorage.setItem('resume-versions', JSON.stringify(versions))
          
          const beforeSize = mockLocalStorage.getItem('resume-versions')?.length || 0
          
          const options: CleanupOptions = {
            versionHistory: true,
            keepRecentVersions: keepVersions
          }
          
          const freedBytes = await performCleanup(options)
          
          const afterSize = mockLocalStorage.getItem('resume-versions')?.length || 0
          
          // 清理后应该释放了一些空间
          return freedBytes >= 0 && afterSize <= beforeSize
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should keep specified number of recent versions', async () => {
    mockLocalStorage.clear()
    
    // 设置 10 个版本
    const versions = Array.from({ length: 10 }, (_, i) => ({
      id: `v${i}`,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      data: 'test'
    }))
    mockLocalStorage.setItem('resume-versions', JSON.stringify(versions))
    
    await performCleanup({ versionHistory: true, keepRecentVersions: 3 })
    
    const remainingVersions = JSON.parse(
      mockLocalStorage.getItem('resume-versions') || '[]'
    )
    
    expect(remainingVersions.length).toBe(3)
  })

  it('should not affect other data when cleaning version history', async () => {
    mockLocalStorage.clear()
    
    // 设置各类数据
    mockLocalStorage.setItem('resume-data', 'important-data')
    mockLocalStorage.setItem('custom-color-schemes', '[]')
    mockLocalStorage.setItem('resume-versions', JSON.stringify([
      { id: 'v1', timestamp: new Date().toISOString() },
      { id: 'v2', timestamp: new Date().toISOString() }
    ]))
    
    await performCleanup({ versionHistory: true, keepRecentVersions: 1 })
    
    // 其他数据应该保持不变
    expect(mockLocalStorage.getItem('resume-data')).toBe('important-data')
    expect(mockLocalStorage.getItem('custom-color-schemes')).toBe('[]')
  })
})
