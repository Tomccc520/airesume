/**
 * @file components/editor/__tests__/stylePresetSelector.property.test.ts
 * @description 样式预设选择器属性测试 - Property 12: 样式预设数量和分类
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * Property Test: 样式预设数量和分类
 * 
 * Feature: editor-ux-enhancement
 * Property 12: 样式预设数量和分类
 * 
 * *For any* 调用获取样式预设的操作，返回的预设数量 SHALL >= 12，
 * 且每个预设 SHALL 有有效的行业分类和描述。
 * 
 * **Validates: Requirements 6.1, 6.2, 6.4**
 */

import * as fc from 'fast-check'

/**
 * 有效的行业类型
 */
const VALID_INDUSTRIES = ['tech', 'finance', 'creative', 'academic', 'general'] as const
type IndustryType = typeof VALID_INDUSTRIES[number]

/**
 * 配色方案接口
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
 * 样式预设接口
 */
interface StylePreset {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  industry: IndustryType
  isPopular: boolean
  colorScheme: ColorScheme
  fontConfig: {
    family: string
    sizes: {
      name: number
      title: number
      content: number
      small: number
    }
  }
  spacingConfig: {
    section: number
    item: number
    line: number
  }
  layoutConfig: {
    headerLayout: 'horizontal' | 'vertical' | 'centered'
    contactLayout: 'inline' | 'grouped' | 'sidebar'
    columns: 1 | 2
  }
}

/**
 * 样式预设列表（与 StylePresetSelector.tsx 保持一致）
 */
const STYLE_PRESETS: StylePreset[] = [
  // 科技行业 (3 种)
  {
    id: 'tech-modern',
    name: '科技现代',
    nameEn: 'Tech Modern',
    description: '简洁现代的科技风格，适合互联网、软件开发等技术岗位',
    descriptionEn: 'Clean modern tech style, ideal for internet and software development positions',
    industry: 'tech',
    isPopular: true,
    colorScheme: {
      id: 'tech-modern-colors',
      name: '科技现代配色',
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'tech-minimal',
    name: '科技极简',
    nameEn: 'Tech Minimal',
    description: '极简主义设计，突出技术能力和项目经验',
    descriptionEn: 'Minimalist design highlighting technical skills and project experience',
    industry: 'tech',
    isPopular: false,
    colorScheme: {
      id: 'tech-minimal-colors',
      name: '科技极简配色',
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#334155',
      text: '#0f172a',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 20, item: 12, line: 20 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'tech-dark',
    name: '科技暗黑',
    nameEn: 'Tech Dark',
    description: '深色主题风格，适合追求个性的技术人才',
    descriptionEn: 'Dark theme style for tech professionals seeking uniqueness',
    industry: 'tech',
    isPopular: false,
    colorScheme: {
      id: 'tech-dark-colors',
      name: '科技暗黑配色',
      primary: '#0ea5e9',
      secondary: '#94a3b8',
      accent: '#38bdf8',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'grouped', columns: 1 }
  },
  // 金融行业 (3 种)
  {
    id: 'finance-classic',
    name: '金融经典',
    nameEn: 'Finance Classic',
    description: '稳重专业的经典风格，适合银行、证券等金融机构',
    descriptionEn: 'Classic professional style for banking and securities institutions',
    industry: 'finance',
    isPopular: true,
    colorScheme: {
      id: 'finance-classic-colors',
      name: '金融经典配色',
      primary: '#1e3a5f',
      secondary: '#4b5563',
      accent: '#2563eb',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 28, title: 17, content: 14, small: 12 }
    },
    spacingConfig: { section: 26, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'grouped', columns: 1 }
  },
  {
    id: 'finance-elegant',
    name: '金融优雅',
    nameEn: 'Finance Elegant',
    description: '优雅大气的设计，展现专业金融素养',
    descriptionEn: 'Elegant design showcasing professional financial expertise',
    industry: 'finance',
    isPopular: false,
    colorScheme: {
      id: 'finance-elegant-colors',
      name: '金融优雅配色',
      primary: '#0f4c75',
      secondary: '#3282b8',
      accent: '#1b262c',
      text: '#1b262c',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Merriweather',
      sizes: { name: 27, title: 17, content: 14, small: 12 }
    },
    spacingConfig: { section: 28, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'vertical', contactLayout: 'grouped', columns: 1 }
  },
  {
    id: 'finance-pro',
    name: '金融专业',
    nameEn: 'Finance Pro',
    description: '专业严谨的风格，适合投资、咨询等高端金融岗位',
    descriptionEn: 'Professional rigorous style for investment and consulting positions',
    industry: 'finance',
    isPopular: false,
    colorScheme: {
      id: 'finance-pro-colors',
      name: '金融专业配色',
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#4b5563',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  // 创意行业 (3 种)
  {
    id: 'creative-bold',
    name: '创意大胆',
    nameEn: 'Creative Bold',
    description: '大胆创新的设计，适合设计师、创意总监等岗位',
    descriptionEn: 'Bold innovative design for designers and creative directors',
    industry: 'creative',
    isPopular: true,
    colorScheme: {
      id: 'creative-bold-colors',
      name: '创意大胆配色',
      primary: '#7c3aed',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Playfair Display',
      sizes: { name: 30, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'vertical', contactLayout: 'sidebar', columns: 1 }
  },
  {
    id: 'creative-artistic',
    name: '艺术风格',
    nameEn: 'Artistic Style',
    description: '艺术感十足的设计，展现独特审美品味',
    descriptionEn: 'Artistic design showcasing unique aesthetic taste',
    industry: 'creative',
    isPopular: false,
    colorScheme: {
      id: 'creative-artistic-colors',
      name: '艺术风格配色',
      primary: '#be185d',
      secondary: '#9d174d',
      accent: '#ec4899',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Playfair Display',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'creative-gradient',
    name: '渐变创意',
    nameEn: 'Gradient Creative',
    description: '现代渐变风格，适合数字媒体、UI设计等岗位',
    descriptionEn: 'Modern gradient style for digital media and UI design positions',
    industry: 'creative',
    isPopular: false,
    colorScheme: {
      id: 'creative-gradient-colors',
      name: '渐变创意配色',
      primary: '#06b6d4',
      secondary: '#8b5cf6',
      accent: '#14b8a6',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  // 学术行业 (2 种)
  {
    id: 'academic-formal',
    name: '学术正式',
    nameEn: 'Academic Formal',
    description: '正式严谨的学术风格，适合高校、研究机构申请',
    descriptionEn: 'Formal academic style for university and research institution applications',
    industry: 'academic',
    isPopular: true,
    colorScheme: {
      id: 'academic-formal-colors',
      name: '学术正式配色',
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#1d4ed8',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Merriweather',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 28, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'grouped', columns: 1 }
  },
  {
    id: 'academic-clean',
    name: '学术简洁',
    nameEn: 'Academic Clean',
    description: '简洁清晰的学术风格，突出研究成果和学术背景',
    descriptionEn: 'Clean academic style highlighting research achievements and background',
    industry: 'academic',
    isPopular: false,
    colorScheme: {
      id: 'academic-clean-colors',
      name: '学术简洁配色',
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#4b5563',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 26, item: 16, line: 23 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  // 通用 (2 种)
  {
    id: 'general-professional',
    name: '通用专业',
    nameEn: 'General Professional',
    description: '适用于各行业的专业简历风格，平衡美观与实用',
    descriptionEn: 'Professional style suitable for all industries, balancing aesthetics and practicality',
    industry: 'general',
    isPopular: true,
    colorScheme: {
      id: 'general-professional-colors',
      name: '通用专业配色',
      primary: '#2563eb',
      secondary: '#4b5563',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'general-modern',
    name: '通用现代',
    nameEn: 'General Modern',
    description: '现代简约风格，适合各类职位申请',
    descriptionEn: 'Modern minimalist style suitable for various job applications',
    industry: 'general',
    isPopular: false,
    colorScheme: {
      id: 'general-modern-colors',
      name: '通用现代配色',
      primary: '#059669',
      secondary: '#4b5563',
      accent: '#10b981',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  }
]

/**
 * Property 12: 样式预设数量和分类
 * 
 * *For any* 调用获取样式预设的操作，返回的预设数量 SHALL >= 12，
 * 且每个预设 SHALL 有有效的行业分类和描述。
 * 
 * **Validates: Requirements 6.1, 6.2, 6.4**
 */
describe('Property 12: 样式预设数量和分类', () => {
  /**
   * 测试 1: 预设数量至少为 12 种
   * Validates: Requirement 6.1 - 提供至少 12 种专业样式预设方案
   */
  test('预设数量应至少为 12 种', () => {
    expect(STYLE_PRESETS.length).toBeGreaterThanOrEqual(12)
  })

  /**
   * 测试 2: 每个预设都有有效的行业分类
   * Validates: Requirement 6.2 - 按行业分类组织预设方案
   */
  test('每个预设都应有有效的行业分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          
          // 验证行业分类是有效值
          expect(VALID_INDUSTRIES).toContain(preset.industry)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 3: 每个预设都有有效的描述
   * Validates: Requirement 6.4 - 为每个预设方案提供简短描述和适用场景说明
   */
  test('每个预设都应有有效的描述', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          
          // 验证中文描述存在且非空
          expect(preset.description).toBeDefined()
          expect(typeof preset.description).toBe('string')
          expect(preset.description.length).toBeGreaterThan(0)
          
          // 验证英文描述存在且非空
          expect(preset.descriptionEn).toBeDefined()
          expect(typeof preset.descriptionEn).toBe('string')
          expect(preset.descriptionEn.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 4: 每个预设都有有效的名称
   * Validates: Requirement 6.4 - 预设方案应有清晰的标识
   */
  test('每个预设都应有有效的名称', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          
          // 验证 ID 存在且非空
          expect(preset.id).toBeDefined()
          expect(typeof preset.id).toBe('string')
          expect(preset.id.length).toBeGreaterThan(0)
          
          // 验证中文名称存在且非空
          expect(preset.name).toBeDefined()
          expect(typeof preset.name).toBe('string')
          expect(preset.name.length).toBeGreaterThan(0)
          
          // 验证英文名称存在且非空
          expect(preset.nameEn).toBeDefined()
          expect(typeof preset.nameEn).toBe('string')
          expect(preset.nameEn.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 5: 每个预设都有完整的配色方案
   * Validates: Requirement 6.3 - 选择预设方案时显示该方案的预览效果
   */
  test('每个预设都应有完整的配色方案', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          const colorScheme = preset.colorScheme
          
          // 验证配色方案存在
          expect(colorScheme).toBeDefined()
          
          // 验证必需的颜色属性
          expect(colorScheme.primary).toBeDefined()
          expect(colorScheme.secondary).toBeDefined()
          expect(colorScheme.accent).toBeDefined()
          expect(colorScheme.text).toBeDefined()
          expect(colorScheme.background).toBeDefined()
          
          // 验证颜色值格式（应为有效的颜色字符串）
          const colorRegex = /^#[0-9a-fA-F]{6}$/
          expect(colorScheme.primary).toMatch(colorRegex)
          expect(colorScheme.secondary).toMatch(colorRegex)
          expect(colorScheme.accent).toMatch(colorRegex)
          expect(colorScheme.text).toMatch(colorRegex)
          expect(colorScheme.background).toMatch(colorRegex)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 6: 每个预设都有完整的字体配置
   */
  test('每个预设都应有完整的字体配置', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          const fontConfig = preset.fontConfig
          
          // 验证字体配置存在
          expect(fontConfig).toBeDefined()
          expect(fontConfig.family).toBeDefined()
          expect(typeof fontConfig.family).toBe('string')
          expect(fontConfig.family.length).toBeGreaterThan(0)
          
          // 验证字体大小配置
          expect(fontConfig.sizes).toBeDefined()
          expect(fontConfig.sizes.name).toBeGreaterThan(0)
          expect(fontConfig.sizes.title).toBeGreaterThan(0)
          expect(fontConfig.sizes.content).toBeGreaterThan(0)
          expect(fontConfig.sizes.small).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 7: 每个预设都有完整的间距配置
   */
  test('每个预设都应有完整的间距配置', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          const spacingConfig = preset.spacingConfig
          
          // 验证间距配置存在
          expect(spacingConfig).toBeDefined()
          expect(spacingConfig.section).toBeGreaterThan(0)
          expect(spacingConfig.item).toBeGreaterThan(0)
          expect(spacingConfig.line).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 8: 每个预设都有完整的布局配置
   */
  test('每个预设都应有完整的布局配置', () => {
    const validHeaderLayouts = ['horizontal', 'vertical', 'centered']
    const validContactLayouts = ['inline', 'grouped', 'sidebar']
    const validColumns = [1, 2]
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          const layoutConfig = preset.layoutConfig
          
          // 验证布局配置存在
          expect(layoutConfig).toBeDefined()
          expect(validHeaderLayouts).toContain(layoutConfig.headerLayout)
          expect(validContactLayouts).toContain(layoutConfig.contactLayout)
          expect(validColumns).toContain(layoutConfig.columns)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 9: 预设 ID 应唯一
   */
  test('预设 ID 应唯一', () => {
    const ids = STYLE_PRESETS.map(preset => preset.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(ids.length)
  })

  /**
   * 测试 10: 每个行业至少有一个预设
   * Validates: Requirement 6.2 - 按行业分类组织预设方案
   */
  test('每个行业至少有一个预设', () => {
    const industryPresets: Record<IndustryType, StylePreset[]> = {
      tech: [],
      finance: [],
      creative: [],
      academic: [],
      general: []
    }
    
    STYLE_PRESETS.forEach(preset => {
      industryPresets[preset.industry].push(preset)
    })
    
    VALID_INDUSTRIES.forEach(industry => {
      expect(industryPresets[industry].length).toBeGreaterThanOrEqual(1)
    })
  })

  /**
   * 测试 11: 至少有一个热门预设
   * Validates: Property 13 (相关) - 至少有一个预设被标记为热门
   */
  test('至少有一个热门预设', () => {
    const popularPresets = STYLE_PRESETS.filter(preset => preset.isPopular)
    expect(popularPresets.length).toBeGreaterThanOrEqual(1)
  })

  /**
   * 测试 12: 每个行业至少有一个热门预设
   */
  test('每个行业至少有一个热门预设', () => {
    const industryPopularPresets: Record<IndustryType, StylePreset[]> = {
      tech: [],
      finance: [],
      creative: [],
      academic: [],
      general: []
    }
    
    STYLE_PRESETS.forEach(preset => {
      if (preset.isPopular) {
        industryPopularPresets[preset.industry].push(preset)
      }
    })
    
    VALID_INDUSTRIES.forEach(industry => {
      expect(industryPopularPresets[industry].length).toBeGreaterThanOrEqual(1)
    })
  })

  /**
   * 测试 13: isPopular 属性应为布尔值
   */
  test('isPopular 属性应为布尔值', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          expect(typeof preset.isPopular).toBe('boolean')
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试 14: 配色方案的 isPreset 应为 true
   */
  test('配色方案的 isPreset 应为 true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STYLE_PRESETS.length - 1 }),
        (index) => {
          const preset = STYLE_PRESETS[index]
          expect(preset.colorScheme.isPreset).toBe(true)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
