/**
 * @file services/__tests__/dataExportService.property.test.ts
 * @description 数据导入导出往返属性测试 - Property 16: 数据导入导出往返
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * Property Test: 数据导入导出往返
 * 
 * Feature: editor-ux-enhancement
 * Property 16: 数据导入导出往返
 * 
 * *For any* 有效的简历数据，导出为 JSON 后再导入 SHALL 产生等价的数据对象。
 * 
 * **Validates: Requirements 8.1, 8.2**
 */

import * as fc from 'fast-check'
import { DataExportService, ResumeData, StyleConfig, ColorScheme, ExportPackage } from '../dataExportService'

/**
 * 生成有效的十六进制颜色
 */
const hexColorArbitrary = fc.array(
  fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
  { minLength: 6, maxLength: 6 }
).map(chars => `#${chars.join('')}`)

/**
 * 生成有效的日期字符串 (YYYY-MM)
 */
const dateStringArbitrary = fc.tuple(
  fc.integer({ min: 2000, max: 2030 }),
  fc.integer({ min: 1, max: 12 })
).map(([year, month]) => `${year}-${month.toString().padStart(2, '0')}`)

/**
 * 生成有效的邮箱
 */
const emailArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z]+$/.test(s)),
  fc.constantFrom('gmail.com', 'example.com', 'test.org')
).map(([name, domain]) => `${name}@${domain}`)

/**
 * 生成有效的 URL
 */
const urlArbitrary = fc.tuple(
  fc.constantFrom('https://', 'http://'),
  fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-z]+$/.test(s)),
  fc.constantFrom('.com', '.org', '.io')
).map(([protocol, domain, tld]) => `${protocol}${domain}${tld}`)

/**
 * 生成有效的个人信息
 */
const personalInfoArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 0, maxLength: 100 }),
  email: fc.option(emailArbitrary, { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 0, maxLength: 20 }), { nil: undefined }),
  location: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  website: fc.option(urlArbitrary, { nil: undefined }),
  summary: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined })
})

/**
 * 生成有效的工作经历
 */
const experienceArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  company: fc.string({ minLength: 1, maxLength: 100 }),
  position: fc.string({ minLength: 1, maxLength: 100 }),
  startDate: dateStringArbitrary,
  endDate: fc.option(dateStringArbitrary, { nil: undefined }),
  current: fc.boolean(),
  location: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 1000 }), { nil: undefined })
})

/**
 * 生成有效的教育背景
 */
const educationArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  school: fc.string({ minLength: 1, maxLength: 100 }),
  degree: fc.string({ minLength: 1, maxLength: 100 }),
  major: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  startDate: dateStringArbitrary,
  endDate: fc.option(dateStringArbitrary, { nil: undefined }),
  gpa: fc.option(fc.string({ minLength: 0, maxLength: 10 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined })
})

/**
 * 生成有效的技能
 */
const skillArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  level: fc.integer({ min: 0, max: 100 }),
  category: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined })
})

/**
 * 生成有效的项目
 */
const projectArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  technologies: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  link: fc.option(urlArbitrary, { nil: undefined }),
  startDate: fc.option(dateStringArbitrary, { nil: undefined }),
  endDate: fc.option(dateStringArbitrary, { nil: undefined })
})

/**
 * 生成有效的简历数据
 */
const resumeDataArbitrary = fc.record({
  personalInfo: fc.option(personalInfoArbitrary, { nil: undefined }),
  experience: fc.option(fc.array(experienceArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined }),
  education: fc.option(fc.array(educationArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  skills: fc.option(fc.array(skillArbitrary, { minLength: 0, maxLength: 10 }), { nil: undefined }),
  projects: fc.option(fc.array(projectArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined })
})

/**
 * 生成有效的样式配置
 */
const styleConfigArbitrary = fc.record({
  colors: fc.option(fc.record({
    primary: hexColorArbitrary,
    secondary: hexColorArbitrary,
    accent: hexColorArbitrary,
    text: hexColorArbitrary,
    background: hexColorArbitrary
  }), { nil: undefined }),
  fontFamily: fc.option(fc.constantFrom('Inter', 'Roboto', 'Open Sans', 'Lato'), { nil: undefined }),
  fontSize: fc.option(fc.record({
    content: fc.integer({ min: 12, max: 18 }),
    title: fc.integer({ min: 14, max: 24 }),
    name: fc.integer({ min: 20, max: 36 }),
    small: fc.integer({ min: 10, max: 14 })
  }), { nil: undefined }),
  spacing: fc.option(fc.record({
    section: fc.integer({ min: 16, max: 40 }),
    item: fc.integer({ min: 8, max: 24 }),
    line: fc.integer({ min: 16, max: 32 })
  }), { nil: undefined })
})

/**
 * 生成有效的配色方案
 */
const colorSchemeArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 30 }).map(s => `custom-${s}`),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  primary: hexColorArbitrary,
  secondary: hexColorArbitrary,
  accent: hexColorArbitrary,
  text: hexColorArbitrary,
  background: hexColorArbitrary,
  isPreset: fc.constant(false)
})

/**
 * 深度比较两个对象是否等价（忽略 undefined 值）
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === undefined && b === undefined) return true
  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => deepEqual(item, b[index]))
    }
    
    const aKeys = Object.keys(aObj).filter(k => aObj[k] !== undefined)
    const bKeys = Object.keys(bObj).filter(k => bObj[k] !== undefined)
    
    if (aKeys.length !== bKeys.length) return false
    
    return aKeys.every(key => deepEqual(aObj[key], bObj[key]))
  }
  
  return false
}

describe('Property 16: 数据导入导出往返', () => {
  // Feature: editor-ux-enhancement, Property 16: 数据导入导出往返
  // **Validates: Requirements 8.1, 8.2**

  describe('8.1 导出为 JSON 格式', () => {
    /**
     * Property: 导出的数据 SHALL 是有效的 JSON 格式
     */
    it('should export valid JSON format', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          (resumeData, styleConfig) => {
            const jsonString = DataExportService.exportToJson(resumeData, styleConfig)
            
            // 验证是有效的 JSON
            expect(() => JSON.parse(jsonString)).not.toThrow()
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 导出的数据包 SHALL 包含必需的元数据
     */
    it('should include required metadata in export package', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          (resumeData, styleConfig) => {
            const exportPackage = DataExportService.createExportPackage(resumeData, styleConfig)
            
            expect(exportPackage.appName).toBeDefined()
            expect(exportPackage.appVersion).toBeDefined()
            expect(exportPackage.version).toBeDefined()
            expect(exportPackage.exportedAt).toBeDefined()
            
            // 验证导出时间是有效的 ISO 日期
            const exportDate = new Date(exportPackage.exportedAt)
            expect(isNaN(exportDate.getTime())).toBe(false)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 导出的数据包 SHALL 包含校验和
     */
    it('should include checksum in export package', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          (resumeData, styleConfig) => {
            const exportPackage = DataExportService.createExportPackage(resumeData, styleConfig)
            
            expect(exportPackage.checksum).toBeDefined()
            expect(typeof exportPackage.checksum).toBe('string')
            expect(exportPackage.checksum!.length).toBeGreaterThan(0)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('8.2 导入导出往返一致性', () => {
    /**
     * Property: 简历数据导出后再导入 SHALL 产生等价的数据
     */
    it('should preserve resume data through export-import cycle', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          (resumeData) => {
            // 导出
            const jsonString = DataExportService.exportToJson(resumeData, undefined)
            
            // 解析
            const { data, error } = DataExportService.parseImportData(jsonString)
            
            expect(error).toBeNull()
            expect(data).not.toBeNull()
            
            if (data) {
              // 验证简历数据等价
              expect(deepEqual(data.resumeData, resumeData)).toBe(true)
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 样式配置导出后再导入 SHALL 产生等价的数据
     */
    it('should preserve style config through export-import cycle', () => {
      fc.assert(
        fc.property(
          styleConfigArbitrary,
          (styleConfig) => {
            // 导出
            const jsonString = DataExportService.exportToJson(undefined, styleConfig)
            
            // 解析
            const { data, error } = DataExportService.parseImportData(jsonString)
            
            expect(error).toBeNull()
            expect(data).not.toBeNull()
            
            if (data) {
              // 验证样式配置等价
              expect(deepEqual(data.styleConfig, styleConfig)).toBe(true)
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 配色方案导出后再导入 SHALL 产生等价的数据
     */
    it('should preserve color schemes through export-import cycle', () => {
      fc.assert(
        fc.property(
          fc.array(colorSchemeArbitrary, { minLength: 0, maxLength: 5 }),
          (colorSchemes) => {
            // 导出
            const jsonString = DataExportService.exportToJson(undefined, undefined, colorSchemes)
            
            // 解析
            const { data, error } = DataExportService.parseImportData(jsonString)
            
            expect(error).toBeNull()
            expect(data).not.toBeNull()
            
            if (data) {
              // 验证配色方案等价
              expect(deepEqual(data.colorSchemes, colorSchemes)).toBe(true)
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 完整数据包导出后再导入 SHALL 产生等价的数据
     */
    it('should preserve complete data package through export-import cycle', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          fc.array(colorSchemeArbitrary, { minLength: 0, maxLength: 3 }),
          (resumeData, styleConfig, colorSchemes) => {
            // 导出
            const jsonString = DataExportService.exportToJson(resumeData, styleConfig, colorSchemes)
            
            // 解析
            const { data, error } = DataExportService.parseImportData(jsonString)
            
            expect(error).toBeNull()
            expect(data).not.toBeNull()
            
            if (data) {
              expect(deepEqual(data.resumeData, resumeData)).toBe(true)
              expect(deepEqual(data.styleConfig, styleConfig)).toBe(true)
              expect(deepEqual(data.colorSchemes, colorSchemes)).toBe(true)
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('数据验证', () => {
    /**
     * Property: 有效的导出数据 SHALL 通过验证
     */
    it('should validate valid export data', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          (resumeData, styleConfig) => {
            const exportPackage = DataExportService.createExportPackage(resumeData, styleConfig)
            const result = DataExportService.validateImportData(exportPackage)
            
            expect(result.valid).toBe(true)
            expect(result.errors.length).toBe(0)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 无效的 JSON 格式 SHALL 返回解析错误
     */
    it('should return error for invalid JSON', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
            try {
              JSON.parse(s)
              return false
            } catch {
              return true
            }
          }),
          (invalidJson) => {
            const { data, error } = DataExportService.parseImportData(invalidJson)
            
            expect(data).toBeNull()
            expect(error).not.toBeNull()
            
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    /**
     * Property: 缺少版本信息的数据 SHALL 验证失败
     */
    it('should fail validation for data without version', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          (resumeData) => {
            const invalidData = {
              exportedAt: new Date().toISOString(),
              resumeData
              // 缺少 version
            }
            
            const result = DataExportService.validateImportData(invalidData)
            
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.field === 'version')).toBe(true)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 非对象类型的数据 SHALL 验证失败
     */
    it('should fail validation for non-object data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null)
          ),
          (invalidData) => {
            const result = DataExportService.validateImportData(invalidData)
            
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
            
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('边界情况', () => {
    /**
     * Property: 空数据 SHALL 正确处理
     */
    it('should handle empty data correctly', () => {
      const jsonString = DataExportService.exportToJson(undefined, undefined, undefined)
      const { data, error } = DataExportService.parseImportData(jsonString)
      
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data?.resumeData).toBeUndefined()
      expect(data?.styleConfig).toBeUndefined()
      expect(data?.colorSchemes).toBeUndefined()
    })

    /**
     * Property: 空对象 SHALL 正确处理
     */
    it('should handle empty objects correctly', () => {
      const jsonString = DataExportService.exportToJson({}, {}, [])
      const { data, error } = DataExportService.parseImportData(jsonString)
      
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    /**
     * Property: 多次导出导入 SHALL 保持数据一致
     */
    it('should maintain consistency through multiple export-import cycles', () => {
      fc.assert(
        fc.property(
          resumeDataArbitrary,
          styleConfigArbitrary,
          fc.integer({ min: 2, max: 5 }),
          (resumeData, styleConfig, cycles) => {
            let currentResumeData = resumeData
            let currentStyleConfig = styleConfig
            
            for (let i = 0; i < cycles; i++) {
              const jsonString = DataExportService.exportToJson(currentResumeData, currentStyleConfig)
              const { data, error } = DataExportService.parseImportData(jsonString)
              
              expect(error).toBeNull()
              expect(data).not.toBeNull()
              
              if (data) {
                currentResumeData = data.resumeData as ResumeData
                currentStyleConfig = data.styleConfig as StyleConfig
              }
            }
            
            // 最终数据应与原始数据等价
            expect(deepEqual(currentResumeData, resumeData)).toBe(true)
            expect(deepEqual(currentStyleConfig, styleConfig)).toBe(true)
            
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
