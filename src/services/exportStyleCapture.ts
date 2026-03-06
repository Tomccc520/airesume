/**
 * @file services/exportStyleCapture.ts
 * @description 导出样式捕获服务，负责捕获预览元素的样式并确保导出时样式一致性
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.1.0
 */

/**
 * 字体样式接口
 */
export interface FontStyles {
  family: string
  size: string
  weight: string
  lineHeight: string
  letterSpacing: string
}

/**
 * 颜色样式接口
 */
export interface ColorStyles {
  text: string
  background: string
  border: string
  primary: string
  secondary: string
  accent: string
}

/**
 * 间距样式接口
 */
export interface SpacingStyles {
  padding: string
  margin: string
  gap: string
}

/**
 * 布局样式接口
 */
export interface LayoutStyles {
  width: string
  maxWidth: string
  minHeight: string
  display: string
  flexDirection: string
  gridTemplateColumns: string
}

/**
 * Flex 布局处理配置接口
 * 满足需求 6.1: 配置 Flex 布局处理选项
 */
export interface FlexLayoutConfig {
  /** 容器宽度（像素） */
  containerWidth: number
  /** 是否递归处理嵌套容器 */
  recursive: boolean
  /** A4 页面宽度 */
  pageWidth: number
}

/**
 * Flex 子元素信息接口
 * 满足需求 4.4, 6.1: 获取 Flex 子元素的布局信息
 */
export interface FlexChildInfo {
  /** 元素 */
  element: HTMLElement
  /** 原始宽度样式 */
  originalWidth: string
  /** 计算后的像素宽度 */
  computedWidth: number
  /** flex-basis 值 */
  flexBasis: string
  /** flex-grow 值 */
  flexGrow: number
  /** flex-shrink 值 */
  flexShrink: number
}


/**
 * 捕获的样式集合接口
 */
export interface CapturedStyles {
  fonts: FontStyles
  colors: ColorStyles
  spacing: SpacingStyles
  layout: LayoutStyles
}

/**
 * 样式差异接口
 */
export interface StyleDiscrepancy {
  /** 差异类型 */
  type: 'font' | 'color' | 'spacing' | 'layout'
  /** 属性名称 */
  property: string
  /** 预览值 */
  previewValue: string
  /** 导出值 */
  exportValue: string
  /** 严重程度 */
  severity: 'warning' | 'error'
  /** 描述 */
  description: string
}

/**
 * 样式验证结果接口
 */
export interface StyleValidationResult {
  /** 是否一致 */
  isConsistent: boolean
  /** 差异列表 */
  discrepancies: StyleDiscrepancy[]
  /** 警告数量 */
  warningCount: number
  /** 错误数量 */
  errorCount: number
}

/**
 * 样式预检结果接口
 */
export interface StylePreCheckResult {
  /** 是否通过预检 */
  passed: boolean
  /** 问题列表 */
  issues: StyleIssue[]
  /** 建议列表 */
  suggestions: string[]
}

/**
 * 样式问题接口
 */
export interface StyleIssue {
  /** 问题类型 */
  type: 'font-unavailable' | 'css-variable-unresolved' | 'color-invalid' | 'layout-issue' | 'overflow' | 'responsive-class' | 'z-index-issue' | 'transform-issue' | 'animation-issue'
  /** 问题描述 */
  message: string
  /** 受影响的元素选择器 */
  affectedSelector?: string
  /** 建议的修复方案 */
  suggestion?: string
  /** 问题严重程度 */
  severity?: 'warning' | 'error'
}


/**
 * 标题重复配置接口
 */
export interface TitleRepetitionConfig {
  /** 是否启用标题重复 */
  enabled: boolean
  /** 标题前缀（如 "续："） */
  prefix?: string
  /** 标题样式 */
  titleStyle?: Partial<CSSStyleDeclaration>
}

/**
 * 分页标题信息接口
 */
export interface PageTitleInfo {
  /** 模块标题文本 */
  title: string
  /** 模块类型 */
  sectionType: string
  /** 原始标题元素 */
  originalElement: HTMLElement
}

/**
 * 样式捕获错误类
 */
export class StyleCaptureError extends Error {
  details: Record<string, unknown>
  
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message)
    this.name = 'StyleCaptureError'
    this.details = details
  }
}

/**
 * 字体加载错误类
 */
export class FontLoadError extends Error {
  fontFamily: string
  
  constructor(message: string, fontFamily: string) {
    super(message)
    this.name = 'FontLoadError'
    this.fontFamily = fontFamily
  }
}

/**
 * 默认备用字体
 */
export const DEFAULT_FALLBACK_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/**
 * 通用备用字体映射
 * 根据字体类型提供合适的备用字体
 */
export const FALLBACK_FONTS = {
  /** 无衬线字体备用 */
  sansSerif: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  /** 衬线字体备用 */
  serif: 'Georgia, "Times New Roman", Times, serif',
  /** 等宽字体备用 */
  monospace: '"SF Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  /** 系统字体栈 */
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
} as const

/**
 * 字体加载状态接口
 */
export interface FontLoadStatus {
  /** 是否全部加载成功 */
  allLoaded: boolean
  /** 已加载的字体列表 */
  loadedFonts: string[]
  /** 加载失败的字体列表 */
  failedFonts: string[]
  /** 是否超时 */
  timedOut: boolean
  /** 加载耗时（毫秒） */
  duration: number
}

/**
 * 字体可用性检查结果接口
 */
export interface FontAvailabilityResult {
  /** 字体名称 */
  fontName: string
  /** 是否可用 */
  available: boolean
  /** 建议的备用字体 */
  suggestedFallback: string
}

/**
 * 常用 CSS 变量列表
 */
export const CSS_VARIABLES = [
  '--font-size-name',
  '--font-size-title',
  '--font-size-content',
  '--font-size-small',
  '--color-primary',
  '--color-secondary',
  '--color-text',
  '--color-accent',
  '--color-background',
  '--spacing-section',
  '--spacing-item',
  '--spacing-line',
  '--avatar-size',
  '--avatar-border-width',
  '--avatar-border-color',
  '--layout-max-width',
  '--layout-padding'
]


/**
 * 导出样式捕获服务类
 * 
 * 用于捕获预览元素的计算样式，并在导出时应用这些样式
 * 以确保导出结果与预览一致
 */
export class ExportStyleCapture {
  /**
   * 捕获预览元素的所有计算样式
   * @param element - 要捕获样式的 HTML 元素
   * @returns 捕获的样式对象
   */
  capturePreviewStyles(element: HTMLElement): CapturedStyles {
    const computed = window.getComputedStyle(element)
    
    return {
      fonts: {
        family: computed.fontFamily,
        size: computed.fontSize,
        weight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing
      },
      colors: {
        text: computed.color,
        background: computed.backgroundColor,
        border: computed.borderColor,
        primary: this.extractCSSVariable(element, '--color-primary') || computed.color,
        secondary: this.extractCSSVariable(element, '--color-secondary') || computed.color,
        accent: this.extractCSSVariable(element, '--color-accent') || computed.color
      },
      spacing: {
        padding: computed.padding,
        margin: computed.margin,
        gap: computed.gap || '0px'
      },
      layout: {
        width: computed.width,
        maxWidth: computed.maxWidth,
        minHeight: computed.minHeight,
        display: computed.display,
        flexDirection: computed.flexDirection,
        gridTemplateColumns: computed.gridTemplateColumns
      }
    }
  }

  /**
   * 提取 CSS 变量的值
   * @param element - HTML 元素
   * @param variableName - CSS 变量名
   * @returns CSS 变量的值或 null
   */
  private extractCSSVariable(element: HTMLElement, variableName: string): string | null {
    const value = getComputedStyle(element).getPropertyValue(variableName).trim()
    return value || null
  }


  /**
   * 解析所有 CSS 变量并转换为实际值
   * 满足需求 1.2: 正确解析所有 CSS 变量并转换为实际值
   * 满足 Property 2: CSS 变量解析完整性
   * @param element - HTML 元素
   */
  resolveCSSVariables(element: HTMLElement): void {
    const computed = window.getComputedStyle(element)
    
    // 解析每个 CSS 变量并设置为内联样式
    CSS_VARIABLES.forEach(varName => {
      const value = computed.getPropertyValue(varName).trim()
      if (value) {
        // 递归解析嵌套的 CSS 变量
        const resolvedValue = this.resolveNestedCSSVariable(value, element)
        element.style.setProperty(varName, resolvedValue)
      }
    })
    
    // 处理根元素的内联样式
    this.resolveCSSVariablesForElement(element)
    
    // 递归处理子元素
    const children = element.querySelectorAll('*')
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        this.resolveCSSVariablesForElement(child)
      }
    })
    
    // 执行完整性检查，确保没有未解析的 var() 表达式
    this.verifyCSSVariableResolution(element)
  }

  /**
   * 递归解析嵌套的 CSS 变量
   * 处理 var(--a) 其中 --a 本身引用另一个变量的情况
   * @param value - CSS 值
   * @param element - HTML 元素（用于获取计算样式）
   * @param maxDepth - 最大递归深度，防止无限循环
   * @returns 解析后的值
   */
  private resolveNestedCSSVariable(value: string, element: HTMLElement, maxDepth: number = 10): string {
    if (maxDepth <= 0 || !value.includes('var(')) {
      return value
    }
    
    const computed = window.getComputedStyle(element)
    
    // 使用正则表达式匹配 var() 表达式，支持嵌套括号和回退值
    const resolvedValue = value.replace(/var\(([^()]+(?:\([^()]*\)[^()]*)*)\)/g, (match, content) => {
      // 解析变量名和回退值
      const { varName, fallback } = this.parseVarExpression(content)
      
      // 获取变量值
      let resolvedVar = computed.getPropertyValue(varName.trim()).trim()
      
      // 如果变量值为空，使用回退值
      if (!resolvedVar && fallback !== undefined) {
        resolvedVar = fallback.trim()
      }
      
      // 如果仍然为空，返回原始匹配
      if (!resolvedVar) {
        return match
      }
      
      // 递归解析嵌套变量
      return this.resolveNestedCSSVariable(resolvedVar, element, maxDepth - 1)
    })
    
    return resolvedValue
  }

  /**
   * 解析 var() 表达式，提取变量名和回退值
   * 支持格式: var(--name), var(--name, fallback), var(--name, var(--other))
   * @param content - var() 括号内的内容
   * @returns 变量名和回退值
   */
  private parseVarExpression(content: string): { varName: string; fallback?: string } {
    // 查找第一个逗号的位置（考虑嵌套括号）
    let depth = 0
    let commaIndex = -1
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i]
      if (char === '(') {
        depth++
      } else if (char === ')') {
        depth--
      } else if (char === ',' && depth === 0) {
        commaIndex = i
        break
      }
    }
    
    if (commaIndex === -1) {
      // 没有回退值
      return { varName: content.trim() }
    }
    
    // 有回退值
    const varName = content.substring(0, commaIndex).trim()
    const fallback = content.substring(commaIndex + 1).trim()
    
    return { varName, fallback }
  }

  /**
   * 为单个元素解析 CSS 变量
   * @param element - HTML 元素
   */
  private resolveCSSVariablesForElement(element: HTMLElement): void {
    const computed = window.getComputedStyle(element)
    const style = element.getAttribute('style') || ''
    
    // 检查样式中是否使用了 CSS 变量
    if (style.includes('var(')) {
      // 递归解析并替换 CSS 变量
      const resolvedStyle = this.resolveNestedCSSVariable(style, element)
      element.setAttribute('style', resolvedStyle)
    }
    
    // 同时检查并解析关键样式属性中的 CSS 变量
    const criticalProperties = [
      'color', 'background-color', 'border-color', 'font-family', 'font-size'
    ]
    
    criticalProperties.forEach(prop => {
      const value = element.style.getPropertyValue(prop)
      if (value && value.includes('var(')) {
        const resolvedValue = this.resolveNestedCSSVariable(value, element)
        element.style.setProperty(prop, resolvedValue)
      }
    })
  }

  /**
   * 验证 CSS 变量解析完整性
   * 检查元素及其所有子元素的内联样式中是否还有未解析的 var() 表达式
   * @param element - HTML 元素
   * @returns 是否所有变量都已解析
   */
  verifyCSSVariableResolution(element: HTMLElement): boolean {
    const unresolvedElements: Array<{ element: HTMLElement; style: string }> = []
    
    // 检查根元素
    const rootStyle = element.getAttribute('style') || ''
    if (this.containsUnresolvedVar(rootStyle)) {
      unresolvedElements.push({ element, style: rootStyle })
    }
    
    // 检查所有子元素
    const children = element.querySelectorAll('*')
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        const childStyle = child.getAttribute('style') || ''
        if (this.containsUnresolvedVar(childStyle)) {
          unresolvedElements.push({ element: child, style: childStyle })
        }
      }
    })
    
    // 如果有未解析的变量，记录警告并尝试再次解析
    if (unresolvedElements.length > 0) {
      console.warn(`CSS variable resolution incomplete: ${unresolvedElements.length} elements have unresolved var() expressions`)
      
      // 尝试再次解析未解析的元素
      unresolvedElements.forEach(({ element: el }) => {
        this.forceResolveCSSVariables(el)
      })
      
      // 再次检查
      return this.checkResolutionComplete(element)
    }
    
    return true
  }

  /**
   * 检查字符串是否包含未解析的 var() 表达式
   * @param style - 样式字符串
   * @returns 是否包含未解析的 var()
   */
  private containsUnresolvedVar(style: string): boolean {
    // 匹配 var() 表达式
    return /var\s*\([^)]+\)/.test(style)
  }

  /**
   * 强制解析元素的 CSS 变量，使用计算样式替换
   * @param element - HTML 元素
   */
  private forceResolveCSSVariables(element: HTMLElement): void {
    const computed = window.getComputedStyle(element)
    const style = element.getAttribute('style') || ''
    
    if (!style.includes('var(')) {
      return
    }
    
    // 使用更激进的解析策略
    const resolvedStyle = style.replace(/var\s*\(([^)]+)\)/g, (match, content) => {
      const { varName, fallback } = this.parseVarExpression(content)
      
      // 尝试获取计算值
      let value = computed.getPropertyValue(varName.trim()).trim()
      
      // 如果计算值仍然包含 var()，尝试使用回退值
      if (!value || value.includes('var(')) {
        if (fallback !== undefined) {
          // 递归解析回退值
          value = this.resolveNestedCSSVariable(fallback, element, 5)
        }
      }
      
      // 如果仍然无法解析，使用默认值
      if (!value || value.includes('var(')) {
        value = this.getDefaultValueForVariable(varName)
      }
      
      return value || match
    })
    
    element.setAttribute('style', resolvedStyle)
  }

  /**
   * 获取 CSS 变量的默认值
   * @param varName - 变量名
   * @returns 默认值
   */
  private getDefaultValueForVariable(varName: string): string {
    const defaults: Record<string, string> = {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#6b7280',
      '--color-text': '#1f2937',
      '--color-accent': '#10b981',
      '--color-background': '#ffffff',
      '--font-size-name': '24px',
      '--font-size-title': '18px',
      '--font-size-content': '14px',
      '--font-size-small': '12px',
      '--spacing-section': '16px',
      '--spacing-item': '8px',
      '--spacing-line': '4px',
      '--avatar-size': '80px',
      '--avatar-border-width': '2px',
      '--avatar-border-color': '#e5e7eb',
      '--layout-max-width': '794px',
      '--layout-padding': '24px'
    }
    
    return defaults[varName.trim()] || ''
  }

  /**
   * 检查解析是否完成
   * @param element - HTML 元素
   * @returns 是否完成
   */
  private checkResolutionComplete(element: HTMLElement): boolean {
    const rootStyle = element.getAttribute('style') || ''
    if (this.containsUnresolvedVar(rootStyle)) {
      return false
    }
    
    const children = element.querySelectorAll('*')
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child instanceof HTMLElement) {
        const childStyle = child.getAttribute('style') || ''
        if (this.containsUnresolvedVar(childStyle)) {
          return false
        }
      }
    }
    
    return true
  }

  /**
   * 检测未解析的 CSS 变量
   * @param element - HTML 元素
   * @returns 未解析的 CSS 变量列表
   */
  detectUnresolvedCSSVariables(element: HTMLElement): string[] {
    const unresolvedVars: string[] = []
    const computed = window.getComputedStyle(element)
    
    CSS_VARIABLES.forEach(varName => {
      const value = computed.getPropertyValue(varName).trim()
      if (!value) {
        unresolvedVars.push(varName)
      }
    })
    
    // 检查子元素
    const children = element.querySelectorAll('*')
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        const style = child.getAttribute('style') || ''
        const matches = style.match(/var\(([^)]+)\)/g)
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace(/var\(|\)/g, '').trim()
            const value = getComputedStyle(child).getPropertyValue(varName).trim()
            if (!value && !unresolvedVars.includes(varName)) {
              unresolvedVars.push(varName)
            }
          })
        }
      }
    })
    
    return unresolvedVars
  }


  /**
   * 处理自定义字体，确保导出时字体正确显示
   * 满足需求 1.3: 正确处理自定义字体，在字体不可用时使用备用字体
   * 满足 Property 3: 字体备用覆盖 - 确保所有元素的 fontFamily 包含备用字体
   * @param element - HTML 元素
   * @param fallbackFont - 备用字体（可选，默认根据字体类型自动选择）
   */
  handleCustomFonts(element: HTMLElement, fallbackFont?: string): void {
    const allElements = element.querySelectorAll('*')
    
    // 处理根元素
    this.ensureFontFallback(element, fallbackFont)
    
    // 处理所有子元素
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.ensureFontFallback(el, fallbackFont)
      }
    })
  }

  /**
   * 确保元素有备用字体
   * 满足 Property 3: 字体备用覆盖 - 元素的 fontFamily 样式应包含备用字体（sans-serif, serif, 或 monospace）
   * @param element - HTML 元素
   * @param fallbackFont - 备用字体（可选）
   */
  private ensureFontFallback(element: HTMLElement, fallbackFont?: string): void {
    const computed = window.getComputedStyle(element)
    const currentFont = computed.fontFamily
    
    // 如果没有字体设置，使用默认备用字体
    if (!currentFont || currentFont === 'inherit' || currentFont === 'initial') {
      element.style.fontFamily = fallbackFont || FALLBACK_FONTS.sansSerif
      return
    }
    
    // 检查是否已经包含通用备用字体
    const hasGenericFallback = this.hasGenericFallbackFont(currentFont)
    
    if (!hasGenericFallback) {
      // 根据当前字体类型选择合适的备用字体
      const appropriateFallback = fallbackFont || this.selectAppropriateFallback(currentFont)
      
      // 清理当前字体字符串，移除可能的重复备用字体
      const cleanedFont = this.cleanFontFamily(currentFont)
      
      // 添加备用字体
      element.style.fontFamily = `${cleanedFont}, ${appropriateFallback}`
    } else {
      // 即使已有备用字体，也确保内联样式中包含完整的字体栈
      element.style.fontFamily = currentFont
    }
  }

  /**
   * 检查字体字符串是否包含通用备用字体
   * @param fontFamily - 字体字符串
   * @returns 是否包含通用备用字体
   */
  private hasGenericFallbackFont(fontFamily: string): boolean {
    const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']
    const lowerFont = fontFamily.toLowerCase()
    return genericFonts.some(generic => lowerFont.includes(generic))
  }

  /**
   * 根据当前字体类型选择合适的备用字体
   * @param currentFont - 当前字体字符串
   * @returns 合适的备用字体
   */
  private selectAppropriateFallback(currentFont: string): string {
    const lowerFont = currentFont.toLowerCase()
    
    // 检测等宽字体
    const monoFonts = ['mono', 'consolas', 'courier', 'fira code', 'sf mono', 'menlo', 'source code']
    if (monoFonts.some(mono => lowerFont.includes(mono))) {
      return FALLBACK_FONTS.monospace
    }
    
    // 检测衬线字体
    const serifFonts = ['georgia', 'times', 'palatino', 'garamond', 'baskerville', 'cambria', 'didot']
    if (serifFonts.some(serif => lowerFont.includes(serif))) {
      return FALLBACK_FONTS.serif
    }
    
    // 默认使用无衬线备用字体
    return FALLBACK_FONTS.sansSerif
  }

  /**
   * 清理字体字符串，移除可能的重复或无效部分
   * @param fontFamily - 字体字符串
   * @returns 清理后的字体字符串
   */
  private cleanFontFamily(fontFamily: string): string {
    // 分割字体列表
    const fonts = fontFamily.split(',').map(f => f.trim())
    
    // 移除通用备用字体（稍后会重新添加）
    const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']
    const cleanedFonts = fonts.filter(font => {
      const lowerFont = font.toLowerCase().replace(/['"]/g, '')
      return !genericFonts.includes(lowerFont)
    })
    
    // 如果清理后没有字体，返回原始字体
    if (cleanedFonts.length === 0) {
      return fonts[0] || 'inherit'
    }
    
    return cleanedFonts.join(', ')
  }

  /**
   * 检测不可用的字体
   * @param element - HTML 元素
   * @returns 不可用的字体列表
   */
  detectUnavailableFonts(element: HTMLElement): string[] {
    const unavailableFonts: string[] = []
    const checkedFonts = new Set<string>()
    
    const checkFontAvailability = (fontFamily: string): boolean => {
      // 创建测试元素
      const testString = 'mmmmmmmmmmlli'
      const testSize = '72px'
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return true // 无法检测，假设可用
      
      // 测试默认字体宽度
      context.font = `${testSize} monospace`
      const defaultWidth = context.measureText(testString).width
      
      // 测试目标字体宽度
      context.font = `${testSize} ${fontFamily}, monospace`
      const testWidth = context.measureText(testString).width
      
      return testWidth !== defaultWidth
    }
    
    const processElement = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el)
      const fontFamily = computed.fontFamily
      
      // 解析字体列表
      const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''))
      
      fonts.forEach(font => {
        if (!checkedFonts.has(font) && !font.includes('sans-serif') && !font.includes('serif') && !font.includes('monospace')) {
          checkedFonts.add(font)
          if (!checkFontAvailability(font)) {
            unavailableFonts.push(font)
          }
        }
      })
    }
    
    processElement(element)
    element.querySelectorAll('*').forEach(child => {
      if (child instanceof HTMLElement) {
        processElement(child)
      }
    })
    
    return unavailableFonts
  }


  /**
   * 验证导出样式与预览样式的一致性
   * 满足需求 3.6: 在导出前验证样式一致性，发现差异时提示用户
   * 满足需求 1.6: 支持更多样式属性比较，添加差异严重程度分类
   * @param previewStyles - 预览样式
   * @param exportStyles - 导出样式
   * @returns 验证结果
   */
  validateStyleConsistency(previewStyles: CapturedStyles, exportStyles: CapturedStyles): StyleValidationResult {
    const discrepancies: StyleDiscrepancy[] = []
    
    // 检查字体 - 字体族是关键属性，差异为错误
    if (previewStyles.fonts.family !== exportStyles.fonts.family) {
      discrepancies.push({
        type: 'font',
        property: 'fontFamily',
        previewValue: previewStyles.fonts.family,
        exportValue: exportStyles.fonts.family,
        severity: 'error',
        description: `字体不一致: 预览使用 "${previewStyles.fonts.family}"，导出使用 "${exportStyles.fonts.family}"`
      })
    }
    
    // 字体大小差异为警告
    if (previewStyles.fonts.size !== exportStyles.fonts.size) {
      discrepancies.push({
        type: 'font',
        property: 'fontSize',
        previewValue: previewStyles.fonts.size,
        exportValue: exportStyles.fonts.size,
        severity: 'warning',
        description: `字体大小不一致: 预览 ${previewStyles.fonts.size}，导出 ${exportStyles.fonts.size}`
      })
    }
    
    // 字体粗细差异为警告
    if (previewStyles.fonts.weight !== exportStyles.fonts.weight) {
      discrepancies.push({
        type: 'font',
        property: 'fontWeight',
        previewValue: previewStyles.fonts.weight,
        exportValue: exportStyles.fonts.weight,
        severity: 'warning',
        description: `字体粗细不一致: 预览 ${previewStyles.fonts.weight}，导出 ${exportStyles.fonts.weight}`
      })
    }
    
    // 行高差异为警告
    if (previewStyles.fonts.lineHeight !== exportStyles.fonts.lineHeight) {
      discrepancies.push({
        type: 'font',
        property: 'lineHeight',
        previewValue: previewStyles.fonts.lineHeight,
        exportValue: exportStyles.fonts.lineHeight,
        severity: 'warning',
        description: `行高不一致: 预览 ${previewStyles.fonts.lineHeight}，导出 ${exportStyles.fonts.lineHeight}`
      })
    }
    
    // 字间距差异为警告
    if (previewStyles.fonts.letterSpacing !== exportStyles.fonts.letterSpacing) {
      discrepancies.push({
        type: 'font',
        property: 'letterSpacing',
        previewValue: previewStyles.fonts.letterSpacing,
        exportValue: exportStyles.fonts.letterSpacing,
        severity: 'warning',
        description: `字间距不一致: 预览 ${previewStyles.fonts.letterSpacing}，导出 ${exportStyles.fonts.letterSpacing}`
      })
    }
    
    // 检查颜色 - 文本颜色是关键属性，差异为错误
    if (previewStyles.colors.text !== exportStyles.colors.text) {
      discrepancies.push({
        type: 'color',
        property: 'textColor',
        previewValue: previewStyles.colors.text,
        exportValue: exportStyles.colors.text,
        severity: 'error',
        description: `文本颜色不一致: 预览 ${previewStyles.colors.text}，导出 ${exportStyles.colors.text}`
      })
    }
    
    // 背景颜色差异为警告
    if (previewStyles.colors.background !== exportStyles.colors.background) {
      discrepancies.push({
        type: 'color',
        property: 'backgroundColor',
        previewValue: previewStyles.colors.background,
        exportValue: exportStyles.colors.background,
        severity: 'warning',
        description: `背景颜色不一致: 预览 ${previewStyles.colors.background}，导出 ${exportStyles.colors.background}`
      })
    }
    
    // 主色调差异为警告
    if (previewStyles.colors.primary !== exportStyles.colors.primary) {
      discrepancies.push({
        type: 'color',
        property: 'primaryColor',
        previewValue: previewStyles.colors.primary,
        exportValue: exportStyles.colors.primary,
        severity: 'warning',
        description: `主色调不一致: 预览 ${previewStyles.colors.primary}，导出 ${exportStyles.colors.primary}`
      })
    }
    
    // 次要颜色差异为警告
    if (previewStyles.colors.secondary !== exportStyles.colors.secondary) {
      discrepancies.push({
        type: 'color',
        property: 'secondaryColor',
        previewValue: previewStyles.colors.secondary,
        exportValue: exportStyles.colors.secondary,
        severity: 'warning',
        description: `次要颜色不一致: 预览 ${previewStyles.colors.secondary}，导出 ${exportStyles.colors.secondary}`
      })
    }
    
    // 强调色差异为警告
    if (previewStyles.colors.accent !== exportStyles.colors.accent) {
      discrepancies.push({
        type: 'color',
        property: 'accentColor',
        previewValue: previewStyles.colors.accent,
        exportValue: exportStyles.colors.accent,
        severity: 'warning',
        description: `强调色不一致: 预览 ${previewStyles.colors.accent}，导出 ${exportStyles.colors.accent}`
      })
    }
    
    // 边框颜色差异为警告
    if (previewStyles.colors.border !== exportStyles.colors.border) {
      discrepancies.push({
        type: 'color',
        property: 'borderColor',
        previewValue: previewStyles.colors.border,
        exportValue: exportStyles.colors.border,
        severity: 'warning',
        description: `边框颜色不一致: 预览 ${previewStyles.colors.border}，导出 ${exportStyles.colors.border}`
      })
    }
    
    // 检查间距 - 内边距差异为警告
    if (previewStyles.spacing.padding !== exportStyles.spacing.padding) {
      discrepancies.push({
        type: 'spacing',
        property: 'padding',
        previewValue: previewStyles.spacing.padding,
        exportValue: exportStyles.spacing.padding,
        severity: 'warning',
        description: `内边距不一致: 预览 ${previewStyles.spacing.padding}，导出 ${exportStyles.spacing.padding}`
      })
    }
    
    // 外边距差异为警告
    if (previewStyles.spacing.margin !== exportStyles.spacing.margin) {
      discrepancies.push({
        type: 'spacing',
        property: 'margin',
        previewValue: previewStyles.spacing.margin,
        exportValue: exportStyles.spacing.margin,
        severity: 'warning',
        description: `外边距不一致: 预览 ${previewStyles.spacing.margin}，导出 ${exportStyles.spacing.margin}`
      })
    }
    
    // 间隙差异为警告
    if (previewStyles.spacing.gap !== exportStyles.spacing.gap) {
      discrepancies.push({
        type: 'spacing',
        property: 'gap',
        previewValue: previewStyles.spacing.gap,
        exportValue: exportStyles.spacing.gap,
        severity: 'warning',
        description: `间隙不一致: 预览 ${previewStyles.spacing.gap}，导出 ${exportStyles.spacing.gap}`
      })
    }
    
    // 检查布局 - display 是关键属性，差异为错误
    if (previewStyles.layout.display !== exportStyles.layout.display) {
      discrepancies.push({
        type: 'layout',
        property: 'display',
        previewValue: previewStyles.layout.display,
        exportValue: exportStyles.layout.display,
        severity: 'error',
        description: `布局类型不一致: 预览 ${previewStyles.layout.display}，导出 ${exportStyles.layout.display}`
      })
    }
    
    // 宽度差异为警告
    if (previewStyles.layout.width !== exportStyles.layout.width) {
      discrepancies.push({
        type: 'layout',
        property: 'width',
        previewValue: previewStyles.layout.width,
        exportValue: exportStyles.layout.width,
        severity: 'warning',
        description: `宽度不一致: 预览 ${previewStyles.layout.width}，导出 ${exportStyles.layout.width}`
      })
    }
    
    // 最大宽度差异为警告
    if (previewStyles.layout.maxWidth !== exportStyles.layout.maxWidth) {
      discrepancies.push({
        type: 'layout',
        property: 'maxWidth',
        previewValue: previewStyles.layout.maxWidth,
        exportValue: exportStyles.layout.maxWidth,
        severity: 'warning',
        description: `最大宽度不一致: 预览 ${previewStyles.layout.maxWidth}，导出 ${exportStyles.layout.maxWidth}`
      })
    }
    
    // flex 方向差异为警告
    if (previewStyles.layout.flexDirection !== exportStyles.layout.flexDirection) {
      discrepancies.push({
        type: 'layout',
        property: 'flexDirection',
        previewValue: previewStyles.layout.flexDirection,
        exportValue: exportStyles.layout.flexDirection,
        severity: 'warning',
        description: `Flex 方向不一致: 预览 ${previewStyles.layout.flexDirection}，导出 ${exportStyles.layout.flexDirection}`
      })
    }
    
    // grid 模板列差异为警告
    if (previewStyles.layout.gridTemplateColumns !== exportStyles.layout.gridTemplateColumns) {
      discrepancies.push({
        type: 'layout',
        property: 'gridTemplateColumns',
        previewValue: previewStyles.layout.gridTemplateColumns,
        exportValue: exportStyles.layout.gridTemplateColumns,
        severity: 'warning',
        description: `Grid 列模板不一致: 预览 ${previewStyles.layout.gridTemplateColumns}，导出 ${exportStyles.layout.gridTemplateColumns}`
      })
    }
    
    // 记录差异
    if (discrepancies.length > 0) {
      console.warn('Style discrepancies detected:', discrepancies)
    }
    
    const warningCount = discrepancies.filter(d => d.severity === 'warning').length
    const errorCount = discrepancies.filter(d => d.severity === 'error').length
    
    return {
      isConsistent: discrepancies.length === 0,
      discrepancies,
      warningCount,
      errorCount
    }
  }


  /**
   * 导出前样式预检功能
   * 满足需求 3.7: 支持导出前的样式预检功能，显示可能的样式问题
   * 满足需求 1.5: 检测字体不可用、CSS 变量未解析、颜色值无效等问题
   * @param element - 要检查的 HTML 元素
   * @returns 预检结果
   */
  preCheckStyles(element: HTMLElement): StylePreCheckResult {
    const issues: StyleIssue[] = []
    const suggestions: string[] = []
    
    // 1. 检测不可用的字体
    const unavailableFonts = this.detectUnavailableFonts(element)
    if (unavailableFonts.length > 0) {
      unavailableFonts.forEach(font => {
        issues.push({
          type: 'font-unavailable',
          message: `字体 "${font}" 可能不可用`,
          suggestion: `将使用备用字体 "${DEFAULT_FALLBACK_FONT}" 替代`,
          severity: 'warning'
        })
      })
      suggestions.push('建议使用系统默认字体以确保导出一致性')
    }
    
    // 2. 检测未解析的 CSS 变量
    const unresolvedVars = this.detectUnresolvedCSSVariables(element)
    if (unresolvedVars.length > 0) {
      unresolvedVars.forEach(varName => {
        issues.push({
          type: 'css-variable-unresolved',
          message: `CSS 变量 "${varName}" 未定义或无法解析`,
          suggestion: '请检查样式配置或使用默认值',
          severity: 'error'
        })
      })
      suggestions.push('导出前将自动解析 CSS 变量为实际值')
    }
    
    // 3. 检测无效颜色值
    const invalidColors = this.detectInvalidColors(element)
    if (invalidColors.length > 0) {
      invalidColors.forEach(({ selector, property, value }) => {
        issues.push({
          type: 'color-invalid',
          message: `元素 "${selector}" 的 ${property} 颜色值 "${value}" 可能无效`,
          affectedSelector: selector,
          suggestion: '请检查颜色值格式是否正确',
          severity: 'error'
        })
      })
    }
    
    // 4. 检测布局问题（溢出、响应式类）
    const layoutIssues = this.detectLayoutIssues(element)
    if (layoutIssues.length > 0) {
      layoutIssues.forEach(issue => {
        issues.push({
          type: 'layout-issue',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
    }
    
    // 5. 检测溢出问题
    const overflowIssues = this.detectOverflowIssues(element)
    if (overflowIssues.length > 0) {
      overflowIssues.forEach(issue => {
        issues.push({
          type: 'overflow',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
    }
    
    // 6. 检测响应式类
    const responsiveIssues = this.detectResponsiveClasses(element)
    if (responsiveIssues.length > 0) {
      responsiveIssues.forEach(issue => {
        issues.push({
          type: 'responsive-class',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
      suggestions.push('响应式样式将在导出时转换为固定样式')
    }
    
    // 7. 检测 z-index 问题
    const zIndexIssues = this.detectZIndexIssues(element)
    if (zIndexIssues.length > 0) {
      zIndexIssues.forEach(issue => {
        issues.push({
          type: 'z-index-issue',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
    }
    
    // 8. 检测 transform 问题
    const transformIssues = this.detectTransformIssues(element)
    if (transformIssues.length > 0) {
      transformIssues.forEach(issue => {
        issues.push({
          type: 'transform-issue',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
    }
    
    // 9. 检测动画问题
    const animationIssues = this.detectAnimationIssues(element)
    if (animationIssues.length > 0) {
      animationIssues.forEach(issue => {
        issues.push({
          type: 'animation-issue',
          message: issue.message,
          affectedSelector: issue.selector,
          suggestion: issue.suggestion,
          severity: 'warning'
        })
      })
      suggestions.push('动画效果在导出时将被禁用')
    }
    
    // 添加通用建议
    if (issues.length === 0) {
      suggestions.push('样式预检通过，可以安全导出')
    } else {
      const errorCount = issues.filter(i => i.severity === 'error').length
      const warningCount = issues.filter(i => i.severity === 'warning').length
      if (errorCount > 0) {
        suggestions.push(`发现 ${errorCount} 个错误和 ${warningCount} 个警告，建议在导出前修复错误`)
      } else {
        suggestions.push(`发现 ${warningCount} 个警告，可以继续导出但建议检查`)
      }
    }
    
    return {
      passed: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    }
  }

  /**
   * 检测无效颜色值
   * @param element - HTML 元素
   * @returns 无效颜色列表
   */
  private detectInvalidColors(element: HTMLElement): Array<{ selector: string; property: string; value: string }> {
    const invalidColors: Array<{ selector: string; property: string; value: string }> = []
    
    const checkColor = (el: HTMLElement, selector: string) => {
      const computed = window.getComputedStyle(el)
      const colorProperties = ['color', 'backgroundColor', 'borderColor']
      
      colorProperties.forEach(prop => {
        const value = computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase())
        // 检查是否为透明或无效值
        if (value && value.includes('var(') && !value.includes('rgb')) {
          invalidColors.push({ selector, property: prop, value })
        }
      })
    }
    
    checkColor(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkColor(child, selector)
      }
    })
    
    return invalidColors
  }

  /**
   * 检测布局问题
   * @param element - HTML 元素
   * @returns 布局问题列表
   */
  private detectLayoutIssues(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    
    const checkLayout = (el: HTMLElement, selector: string) => {
      const computed = window.getComputedStyle(el)
      
      // 检查溢出问题
      if (computed.overflow === 'visible' && el.scrollWidth > el.clientWidth) {
        issues.push({
          selector,
          message: `元素内容可能溢出`,
          suggestion: '考虑设置 overflow: hidden 或调整内容宽度'
        })
      }
      
      // 检查响应式类
      const classList = Array.from(el.classList)
      const hasResponsiveClasses = classList.some(cls => 
        cls.startsWith('sm:') || cls.startsWith('md:') || cls.startsWith('lg:') || cls.startsWith('xl:')
      )
      if (hasResponsiveClasses) {
        issues.push({
          selector,
          message: `元素使用了响应式类，导出时可能与预览不一致`,
          suggestion: '导出时将自动转换响应式样式为固定样式'
        })
      }
    }
    
    checkLayout(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkLayout(child, selector)
      }
    })
    
    return issues
  }

  /**
   * 检测溢出问题
   * @param element - HTML 元素
   * @returns 溢出问题列表
   */
  private detectOverflowIssues(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    
    const checkOverflow = (el: HTMLElement, selector: string) => {
      // 检查水平溢出
      if (el.scrollWidth > el.clientWidth + 1) {
        issues.push({
          selector,
          message: `元素存在水平溢出 (内容宽度: ${el.scrollWidth}px, 容器宽度: ${el.clientWidth}px)`,
          suggestion: '考虑调整内容宽度或设置 overflow-x: hidden'
        })
      }
      
      // 检查垂直溢出
      if (el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0) {
        const computed = window.getComputedStyle(el)
        if (computed.overflow !== 'visible' && computed.overflow !== 'auto' && computed.overflow !== 'scroll') {
          issues.push({
            selector,
            message: `元素存在垂直溢出 (内容高度: ${el.scrollHeight}px, 容器高度: ${el.clientHeight}px)`,
            suggestion: '考虑调整内容高度或设置 overflow-y: auto'
          })
        }
      }
    }
    
    checkOverflow(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkOverflow(child, selector)
      }
    })
    
    return issues
  }

  /**
   * 检测响应式类
   * @param element - HTML 元素
   * @returns 响应式类问题列表
   */
  private detectResponsiveClasses(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    const responsivePrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:', 'max-sm:', 'max-md:', 'max-lg:', 'max-xl:']
    
    const checkResponsive = (el: HTMLElement, selector: string) => {
      const classList = Array.from(el.classList)
      const responsiveClasses = classList.filter(cls => 
        responsivePrefixes.some(prefix => cls.startsWith(prefix))
      )
      
      if (responsiveClasses.length > 0) {
        issues.push({
          selector,
          message: `元素使用了响应式类: ${responsiveClasses.slice(0, 3).join(', ')}${responsiveClasses.length > 3 ? '...' : ''}`,
          suggestion: '导出时将自动转换为固定样式，请确认预览效果'
        })
      }
    }
    
    checkResponsive(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkResponsive(child, selector)
      }
    })
    
    return issues
  }

  /**
   * 检测 z-index 问题
   * @param element - HTML 元素
   * @returns z-index 问题列表
   */
  private detectZIndexIssues(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    
    const checkZIndex = (el: HTMLElement, selector: string) => {
      const computed = window.getComputedStyle(el)
      const zIndex = computed.zIndex
      
      // 检查高 z-index 值
      if (zIndex !== 'auto' && parseInt(zIndex) > 100) {
        issues.push({
          selector,
          message: `元素使用了较高的 z-index 值 (${zIndex})`,
          suggestion: '高 z-index 可能导致导出时层叠顺序问题'
        })
      }
      
      // 检查负 z-index
      if (zIndex !== 'auto' && parseInt(zIndex) < 0) {
        issues.push({
          selector,
          message: `元素使用了负 z-index 值 (${zIndex})`,
          suggestion: '负 z-index 可能导致元素在导出时不可见'
        })
      }
    }
    
    checkZIndex(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkZIndex(child, selector)
      }
    })
    
    return issues
  }

  /**
   * 检测 transform 问题
   * @param element - HTML 元素
   * @returns transform 问题列表
   */
  private detectTransformIssues(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    
    const checkTransform = (el: HTMLElement, selector: string) => {
      const computed = window.getComputedStyle(el)
      const transform = computed.transform
      
      // 检查非 none 的 transform
      if (transform && transform !== 'none') {
        // 检查是否包含 3D 变换
        if (transform.includes('matrix3d') || transform.includes('translate3d') || 
            transform.includes('rotate3d') || transform.includes('scale3d')) {
          issues.push({
            selector,
            message: `元素使用了 3D 变换`,
            suggestion: '3D 变换在导出时可能无法正确渲染'
          })
        }
        // 检查是否包含旋转
        else if (transform.includes('rotate')) {
          issues.push({
            selector,
            message: `元素使用了旋转变换`,
            suggestion: '旋转变换在导出时可能影响布局'
          })
        }
      }
    }
    
    checkTransform(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkTransform(child, selector)
      }
    })
    
    return issues
  }

  /**
   * 检测动画问题
   * @param element - HTML 元素
   * @returns 动画问题列表
   */
  private detectAnimationIssues(element: HTMLElement): Array<{ selector: string; message: string; suggestion: string }> {
    const issues: Array<{ selector: string; message: string; suggestion: string }> = []
    
    const checkAnimation = (el: HTMLElement, selector: string) => {
      const computed = window.getComputedStyle(el)
      
      // 检查 CSS 动画
      const animationName = computed.animationName
      if (animationName && animationName !== 'none') {
        issues.push({
          selector,
          message: `元素使用了 CSS 动画: ${animationName}`,
          suggestion: '动画效果在导出时将被禁用，请确认静态效果'
        })
      }
      
      // 检查 CSS 过渡
      const transition = computed.transition
      if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
        // 只报告有意义的过渡
        if (!transition.includes('0s')) {
          issues.push({
            selector,
            message: `元素使用了 CSS 过渡效果`,
            suggestion: '过渡效果在导出时将被忽略'
          })
        }
      }
    }
    
    checkAnimation(element, 'root')
    element.querySelectorAll('*').forEach((child, index) => {
      if (child instanceof HTMLElement) {
        const selector = child.className ? `.${child.className.split(' ')[0]}` : `element-${index}`
        checkAnimation(child, selector)
      }
    })
    
    return issues
  }


  /**
   * 创建标题重复元素
   * 满足需求 2.3: 当内容块无法避免被分割时，在下一页顶部重复显示该模块的标题
   * @param titleInfo - 标题信息
   * @param config - 标题重复配置
   * @returns 重复的标题元素
   */
  createRepeatedTitle(titleInfo: PageTitleInfo, config: TitleRepetitionConfig = { enabled: true }): HTMLElement | null {
    if (!config.enabled) {
      return null
    }
    
    const { title, sectionType, originalElement } = titleInfo
    
    // 验证输入
    if (!title || !originalElement) {
      return null
    }
    
    // 克隆原始标题元素
    const repeatedTitle = originalElement.cloneNode(true) as HTMLElement
    
    // 清除可能的 ID 以避免重复
    repeatedTitle.removeAttribute('id')
    
    // 添加前缀（如 "续："）
    if (config.prefix) {
      const textContent = repeatedTitle.textContent || ''
      // 避免重复添加前缀
      if (!textContent.startsWith(config.prefix)) {
        repeatedTitle.textContent = `${config.prefix}${textContent}`
      }
    }
    
    // 应用自定义样式
    if (config.titleStyle) {
      Object.entries(config.titleStyle).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          (repeatedTitle.style as unknown as Record<string, string>)[key] = value as string
        }
      })
    }
    
    // 添加标识类和数据属性
    repeatedTitle.classList.add('repeated-title')
    repeatedTitle.classList.add('page-continuation-title')
    repeatedTitle.setAttribute('data-section-type', sectionType)
    repeatedTitle.setAttribute('data-original-title', title)
    repeatedTitle.setAttribute('data-is-repeated', 'true')
    repeatedTitle.setAttribute('aria-label', `${title} (续)`)
    
    // 添加顶部边距以与页面顶部保持距离
    repeatedTitle.style.marginTop = '0'
    repeatedTitle.style.paddingTop = '16px'
    repeatedTitle.style.marginBottom = '8px'
    
    // 添加视觉区分样式（可选）
    if (!config.titleStyle?.borderBottom) {
      repeatedTitle.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)'
      repeatedTitle.style.paddingBottom = '8px'
    }
    
    return repeatedTitle
  }

  /**
   * 检测需要重复标题的分页位置
   * @param element - 容器元素
   * @param pageBreakPositions - 分页位置列表
   * @returns 需要重复标题的信息列表
   */
  detectTitleRepetitionNeeds(element: HTMLElement, pageBreakPositions: number[]): PageTitleInfo[] {
    const titleInfos: PageTitleInfo[] = []
    const processedTitles = new Set<string>() // 避免重复
    
    // 查找所有模块标题
    const sectionHeaders = element.querySelectorAll('[data-section-type], .section-header, h2, h3')
    
    sectionHeaders.forEach(header => {
      if (!(header instanceof HTMLElement)) return
      
      const headerRect = header.getBoundingClientRect()
      const containerRect = element.getBoundingClientRect()
      const headerTop = headerRect.top - containerRect.top
      const headerBottom = headerRect.bottom - containerRect.top
      
      // 查找该标题对应的内容区域
      const contentArea = this.findContentAreaForHeader(header)
      if (!contentArea) return
      
      const contentRect = contentArea.getBoundingClientRect()
      const contentBottom = contentRect.bottom - containerRect.top
      
      // 检查是否有分页线穿过内容区域（但不穿过标题）
      pageBreakPositions.forEach(breakPos => {
        if (breakPos > headerBottom && breakPos < contentBottom) {
          const titleKey = `${header.textContent}-${breakPos}`
          if (!processedTitles.has(titleKey)) {
            processedTitles.add(titleKey)
            // 分页线在标题下方但在内容结束前，需要重复标题
            titleInfos.push({
              title: header.textContent?.trim() || '',
              sectionType: header.getAttribute('data-section-type') || this.inferSectionType(header),
              originalElement: header
            })
          }
        }
      })
    })
    
    return titleInfos
  }

  /**
   * 查找标题对应的内容区域
   * @param header - 标题元素
   * @returns 内容区域元素
   */
  private findContentAreaForHeader(header: HTMLElement): HTMLElement | null {
    // 首先检查下一个兄弟元素
    let nextSibling = header.nextElementSibling
    while (nextSibling) {
      if (nextSibling instanceof HTMLElement) {
        // 如果是另一个标题，则当前标题没有内容
        const tagName = nextSibling.tagName.toLowerCase()
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
            nextSibling.classList.contains('section-header')) {
          return null
        }
        // 找到内容区域
        return nextSibling
      }
      nextSibling = nextSibling.nextElementSibling
    }
    
    // 检查父元素的其他子元素
    const parent = header.parentElement
    if (parent) {
      const children = Array.from(parent.children)
      const headerIndex = children.indexOf(header)
      for (let i = headerIndex + 1; i < children.length; i++) {
        const child = children[i]
        if (child instanceof HTMLElement) {
          return child
        }
      }
    }
    
    return null
  }

  /**
   * 推断模块类型
   * @param header - 标题元素
   * @returns 模块类型
   */
  private inferSectionType(header: HTMLElement): string {
    const text = header.textContent?.toLowerCase() || ''
    
    if (text.includes('教育') || text.includes('education')) return 'education'
    if (text.includes('工作') || text.includes('experience') || text.includes('work')) return 'experience'
    if (text.includes('项目') || text.includes('project')) return 'project'
    if (text.includes('技能') || text.includes('skill')) return 'skills'
    if (text.includes('证书') || text.includes('certificate')) return 'certificates'
    if (text.includes('语言') || text.includes('language')) return 'languages'
    
    return 'unknown'
  }

  /**
   * 在分页位置插入重复标题
   * 满足需求 2.3: 在下一页顶部重复显示该模块的标题
   * @param element - 容器元素
   * @param pageBreakPositions - 分页位置列表
   * @param config - 标题重复配置
   */
  insertRepeatedTitles(
    element: HTMLElement, 
    pageBreakPositions: number[], 
    config: TitleRepetitionConfig = { enabled: true, prefix: '（续）' }
  ): void {
    if (!config.enabled) return
    if (pageBreakPositions.length === 0) return
    
    const titleInfos = this.detectTitleRepetitionNeeds(element, pageBreakPositions)
    
    // 按分页位置排序，从后往前插入以避免位置偏移
    const sortedTitleInfos = [...titleInfos].sort((a, b) => {
      const aRect = a.originalElement.getBoundingClientRect()
      const bRect = b.originalElement.getBoundingClientRect()
      return bRect.top - aRect.top
    })
    
    sortedTitleInfos.forEach(titleInfo => {
      const repeatedTitle = this.createRepeatedTitle(titleInfo, config)
      if (repeatedTitle) {
        // 创建分页标记容器
        const pageBreakMarker = document.createElement('div')
        pageBreakMarker.className = 'page-break-title-container'
        pageBreakMarker.style.pageBreakBefore = 'always'
        pageBreakMarker.style.breakBefore = 'page'
        pageBreakMarker.style.width = '100%'
        pageBreakMarker.appendChild(repeatedTitle)
        
        // 找到合适的插入位置
        const insertPosition = this.findInsertPositionForTitle(element, titleInfo, pageBreakPositions)
        if (insertPosition && insertPosition.parentNode) {
          insertPosition.parentNode.insertBefore(pageBreakMarker, insertPosition)
        }
      }
    })
  }

  /**
   * 查找标题插入位置
   * @param element - 容器元素
   * @param titleInfo - 标题信息
   * @param pageBreakPositions - 分页位置列表
   * @returns 插入位置元素
   */
  private findInsertPositionForTitle(
    element: HTMLElement, 
    titleInfo: PageTitleInfo,
    pageBreakPositions: number[]
  ): Element | null {
    // 查找原始标题的下一个兄弟元素中的子元素
    const originalTitle = titleInfo.originalElement
    const parent = originalTitle.parentElement
    
    if (!parent) return null
    
    const containerRect = element.getBoundingClientRect()
    
    // 找到与此标题相关的分页位置
    const headerRect = originalTitle.getBoundingClientRect()
    const headerBottom = headerRect.bottom - containerRect.top
    
    const relevantBreakPos = pageBreakPositions.find(pos => pos > headerBottom)
    if (relevantBreakPos === undefined) return null
    
    // 查找内容区域中最接近分页位置的元素
    const contentElements = parent.querySelectorAll('li, p, .experience-item, .education-item, .project-item, [data-list-item]')
    
    let bestElement: Element | null = null
    let bestDistance = Infinity
    
    for (let i = 0; i < contentElements.length; i++) {
      const el = contentElements[i]
      const rect = el.getBoundingClientRect()
      const elTop = rect.top - containerRect.top
      
      // 找到分页位置之后最近的元素
      if (elTop >= relevantBreakPos) {
        const distance = elTop - relevantBreakPos
        if (distance < bestDistance) {
          bestDistance = distance
          bestElement = el
        }
      }
    }
    
    return bestElement
  }


  /**
   * 在导出前准备元素，将所有 CSS 变量转换为实际值
   * 满足需求 3.1, 3.3: 确保导出文件的字体、颜色、间距和布局与预览完全一致
   * @param element - 要准备的 HTML 元素
   */
  prepareElementForExport(element: HTMLElement): void {
    // 递归处理所有子元素
    const allElements = element.querySelectorAll('*')
    
    // 首先处理根元素
    this.inlineComputedStyles(element)
    
    // 然后处理所有子元素
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.inlineComputedStyles(el)
      }
    })
  }

  /**
   * 将计算样式内联到元素上
   * @param element - HTML 元素
   */
  private inlineComputedStyles(element: HTMLElement): void {
    const computed = window.getComputedStyle(element)
    
    // 内联关键样式属性
    const criticalProperties = [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'letterSpacing',
      'color',
      'backgroundColor',
      'borderColor',
      'borderWidth',
      'borderStyle',
      'borderRadius',
      'padding',
      'margin',
      'width',
      'maxWidth',
      'minWidth',
      'height',
      'maxHeight',
      'minHeight',
      'display',
      'flexDirection',
      'justifyContent',
      'alignItems',
      'gap',
      'gridTemplateColumns',
      'gridTemplateRows',
      'textAlign',
      'textDecoration',
      'textTransform',
      'whiteSpace',
      'overflow',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'zIndex',
      'opacity',
      'boxShadow'
    ]
    
    criticalProperties.forEach(prop => {
      const value = computed.getPropertyValue(this.camelToKebab(prop))
      if (value && value !== 'initial' && value !== 'inherit' && value !== 'unset') {
        element.style.setProperty(this.camelToKebab(prop), value)
      }
    })
  }

  /**
   * 将驼峰命名转换为 kebab-case
   * @param str - 驼峰命名的字符串
   * @returns kebab-case 格式的字符串
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 等待所有字体加载完成
   * 满足需求 1.3: 等待字体加载完成后再进行渲染，超时时使用备用字体
   * @param timeout - 超时时间（毫秒），默认 3000ms
   * @param onProgress - 进度回调函数（可选）
   * @returns Promise，包含字体加载状态信息
   */
  async waitForFonts(
    timeout: number = 3000,
    onProgress?: (status: { loaded: number; total: number; current?: string }) => void
  ): Promise<FontLoadStatus> {
    const startTime = Date.now()
    const loadedFonts: string[] = []
    const failedFonts: string[] = []
    let timedOut = false

    try {
      // 获取所有需要加载的字体
      const fontFaces = Array.from(document.fonts)
      const totalFonts = fontFaces.length

      if (totalFonts === 0) {
        // 没有自定义字体需要加载
        return {
          allLoaded: true,
          loadedFonts: [],
          failedFonts: [],
          timedOut: false,
          duration: Date.now() - startTime
        }
      }

      // 创建超时 Promise
      const timeoutPromise = new Promise<'timeout'>((resolve) => {
        setTimeout(() => resolve('timeout'), timeout)
      })

      // 创建字体加载 Promise
      const fontLoadPromise = this.loadFontsWithProgress(
        fontFaces,
        loadedFonts,
        failedFonts,
        onProgress
      )

      // 竞争：字体加载 vs 超时
      const result = await Promise.race([fontLoadPromise, timeoutPromise])

      if (result === 'timeout') {
        timedOut = true
        console.warn(`Font loading timed out after ${timeout}ms. Some fonts may not be available.`)
        
        // 标记未完成加载的字体为失败
        fontFaces.forEach(font => {
          const fontName = font.family
          if (!loadedFonts.includes(fontName) && !failedFonts.includes(fontName)) {
            failedFonts.push(fontName)
          }
        })
      }

    } catch (error) {
      console.warn('Font loading error:', error)
      timedOut = true
    }

    const duration = Date.now() - startTime
    const allLoaded = failedFonts.length === 0 && !timedOut

    // 记录加载结果
    if (!allLoaded) {
      console.warn(`Font loading completed with issues:`, {
        loaded: loadedFonts,
        failed: failedFonts,
        timedOut,
        duration: `${duration}ms`
      })
    }

    return {
      allLoaded,
      loadedFonts,
      failedFonts,
      timedOut,
      duration
    }
  }

  /**
   * 加载字体并报告进度
   * @param fontFaces - 字体列表
   * @param loadedFonts - 已加载字体列表（会被修改）
   * @param failedFonts - 加载失败字体列表（会被修改）
   * @param onProgress - 进度回调
   * @returns Promise
   */
  private async loadFontsWithProgress(
    fontFaces: FontFace[],
    loadedFonts: string[],
    failedFonts: string[],
    onProgress?: (status: { loaded: number; total: number; current?: string }) => void
  ): Promise<void> {
    const totalFonts = fontFaces.length
    let loadedCount = 0

    // 并行加载所有字体，但单独处理每个字体的结果
    const loadPromises = fontFaces.map(async (font) => {
      const fontName = font.family
      
      try {
        // 检查字体是否已加载
        if (font.status === 'loaded') {
          loadedFonts.push(fontName)
          loadedCount++
          onProgress?.({ loaded: loadedCount, total: totalFonts, current: fontName })
          return
        }

        // 等待字体加载
        await font.load()
        loadedFonts.push(fontName)
        loadedCount++
        onProgress?.({ loaded: loadedCount, total: totalFonts, current: fontName })
        
      } catch (error) {
        // 字体加载失败
        if (!failedFonts.includes(fontName)) {
          failedFonts.push(fontName)
        }
        loadedCount++
        onProgress?.({ loaded: loadedCount, total: totalFonts, current: fontName })
        console.warn(`Failed to load font "${fontName}":`, error)
      }
    })

    await Promise.all(loadPromises)
  }

  /**
   * 检查特定字体是否可用
   * @param fontFamily - 字体名称
   * @returns 字体可用性检查结果
   */
  checkFontAvailability(fontFamily: string): FontAvailabilityResult {
    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    
    // 创建 canvas 进行字体检测
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      // 无法检测，假设可用
      return {
        fontName: fontFamily,
        available: true,
        suggestedFallback: FALLBACK_FONTS.sansSerif
      }
    }
    
    // 测试默认字体宽度
    context.font = `${testSize} monospace`
    const defaultWidth = context.measureText(testString).width
    
    // 测试目标字体宽度
    const cleanFontName = fontFamily.replace(/['"]/g, '')
    context.font = `${testSize} "${cleanFontName}", monospace`
    const testWidth = context.measureText(testString).width
    
    const available = testWidth !== defaultWidth
    
    return {
      fontName: fontFamily,
      available,
      suggestedFallback: this.selectAppropriateFallback(fontFamily)
    }
  }

  /**
   * 批量检查字体可用性
   * @param element - HTML 元素
   * @returns 所有使用的字体的可用性检查结果
   */
  checkAllFontsAvailability(element: HTMLElement): FontAvailabilityResult[] {
    const results: FontAvailabilityResult[] = []
    const checkedFonts = new Set<string>()
    
    const processElement = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el)
      const fontFamily = computed.fontFamily
      
      // 解析字体列表
      const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''))
      
      fonts.forEach(font => {
        // 跳过通用字体
        const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']
        if (genericFonts.includes(font.toLowerCase()) || checkedFonts.has(font)) {
          return
        }
        
        checkedFonts.add(font)
        results.push(this.checkFontAvailability(font))
      })
    }
    
    processElement(element)
    element.querySelectorAll('*').forEach(child => {
      if (child instanceof HTMLElement) {
        processElement(child)
      }
    })
    
    return results
  }

  /**
   * 在导出前进行完整的字体检查和处理
   * 满足需求 1.3: 等待字体加载完成后再进行渲染，超时时使用备用字体
   * @param element - HTML 元素
   * @param timeout - 超时时间（毫秒）
   * @returns 字体处理结果
   */
  async prepareFontsForExport(
    element: HTMLElement,
    timeout: number = 3000
  ): Promise<{
    fontLoadStatus: FontLoadStatus
    availabilityResults: FontAvailabilityResult[]
    unavailableFonts: string[]
  }> {
    // 1. 等待字体加载
    const fontLoadStatus = await this.waitForFonts(timeout)
    
    // 2. 检查字体可用性
    const availabilityResults = this.checkAllFontsAvailability(element)
    const unavailableFonts = availabilityResults
      .filter(r => !r.available)
      .map(r => r.fontName)
    
    // 3. 处理自定义字体，确保有备用字体
    this.handleCustomFonts(element)
    
    // 4. 如果有不可用的字体，记录警告
    if (unavailableFonts.length > 0) {
      console.warn(`Unavailable fonts detected: ${unavailableFonts.join(', ')}. Fallback fonts will be used.`)
    }
    
    return {
      fontLoadStatus,
      availabilityResults,
      unavailableFonts
    }
  }


  /**
   * 克隆元素并准备导出
   * @param element - 原始元素
   * @returns 准备好导出的克隆元素
   */
  cloneAndPrepareForExport(element: HTMLElement): HTMLElement {
    // 深度克隆元素
    const clone = element.cloneNode(true) as HTMLElement
    
    // 修复响应式布局问题
    this.fixResponsiveLayoutForExport(clone)
    
    // 解析 CSS 变量
    this.resolveCSSVariables(clone)
    
    // 处理自定义字体
    this.handleCustomFonts(clone)
    
    // 准备克隆元素的样式
    this.prepareElementForExport(clone)
    
    // 移除不需要导出的元素（如交互提示、hover 效果等）
    this.removeNonExportElements(clone)
    
    return clone
  }

  /**
   * 移除不需要导出的元素
   * @param element - HTML 元素
   */
  private removeNonExportElements(element: HTMLElement): void {
    // 移除带有 no-export 类的元素
    const noExportElements = element.querySelectorAll('.no-export, [data-no-export]')
    noExportElements.forEach(el => el.remove())
    
    // 移除按钮元素
    const buttons = element.querySelectorAll('button')
    buttons.forEach(btn => btn.remove())
    
    // 移除 hover 效果相关的元素
    const hoverElements = element.querySelectorAll('[class*="hover:"], [class*="group-hover:"]')
    hoverElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // 移除 hover 相关的类名
        const classes = Array.from(el.classList)
        classes.forEach(cls => {
          if (cls.includes('hover:') || cls.includes('group-hover:')) {
            el.classList.remove(cls)
          }
        })
      }
    })
  }

  /**
   * 修复响应式布局在导出时的问题
   * 将响应式类转换为固定样式，确保导出时布局正确
   * @param element - HTML 元素
   */
  fixResponsiveLayoutForExport(element: HTMLElement): void {
    const allElements = element.querySelectorAll('*')
    
    // 处理根元素
    this.convertResponsiveClasses(element)
    
    // 处理所有子元素
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.convertResponsiveClasses(el)
      }
    })
  }

  /**
   * Tailwind 响应式断点前缀列表
   * 用于检测和处理响应式类
   */
  private static readonly RESPONSIVE_PREFIXES = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'] as const

  /**
   * 检查元素是否包含响应式类
   * 满足需求 1.4: 检测响应式布局类
   * @param classList - 元素的类名列表
   * @returns 是否包含响应式类
   */
  hasResponsiveClasses(classList: string[]): boolean {
    return classList.some(cls => 
      ExportStyleCapture.RESPONSIVE_PREFIXES.some(prefix => cls.startsWith(prefix))
    )
  }

  /**
   * 提取响应式类并按断点分组
   * @param classList - 元素的类名列表
   * @returns 按断点分组的响应式类
   */
  private extractResponsiveClasses(classList: string[]): Map<string, string[]> {
    const grouped = new Map<string, string[]>()
    
    ExportStyleCapture.RESPONSIVE_PREFIXES.forEach(prefix => {
      grouped.set(prefix, [])
    })
    
    classList.forEach(cls => {
      for (const prefix of ExportStyleCapture.RESPONSIVE_PREFIXES) {
        if (cls.startsWith(prefix)) {
          const classes = grouped.get(prefix) || []
          classes.push(cls)
          grouped.set(prefix, classes)
          break
        }
      }
    })
    
    return grouped
  }

  /**
   * 将响应式类转换为固定样式
   * 满足需求 1.4: WHEN 导出内容包含响应式布局类 THEN Style_Capture SHALL 将响应式样式转换为固定样式
   * 
   * 增强功能：
   * - 处理所有 Tailwind 响应式断点 (sm:, md:, lg:, xl:, 2xl:)
   * - 转换 flex 和 grid 布局类为内联样式
   * - 处理响应式间距、尺寸和显示类
   * - 确保所有响应式类都转换为固定样式用于导出
   * 
   * @param element - HTML 元素
   */
  convertResponsiveClasses(element: HTMLElement): void {
    const computed = window.getComputedStyle(element)
    const classList = Array.from(element.classList)
    
    // 检查是否有响应式类
    const hasResponsive = this.hasResponsiveClasses(classList)
    
    if (hasResponsive) {
      // 提取并记录响应式类（用于调试）
      const responsiveGroups = this.extractResponsiveClasses(classList)
      
      // 内联所有布局相关的计算样式
      this.inlineLayoutStyles(element, computed)
      
      // 内联间距样式
      this.inlineSpacingStyles(element, computed)
      
      // 内联尺寸样式
      this.inlineSizingStyles(element, computed)
      
      // 内联显示和可见性样式
      this.inlineDisplayStyles(element, computed)
      
      // 内联文本样式
      this.inlineTextStyles(element, computed)
      
      // 内联边框和圆角样式
      this.inlineBorderStyles(element, computed)
      
      // 内联背景样式
      this.inlineBackgroundStyles(element, computed)
      
      // 移除响应式类（可选，保留以便调试）
      // this.removeResponsiveClasses(element)
    }
    
    // 特别处理 flex 布局 - 确保所有 flex 属性都被内联
    if (computed.display === 'flex' || computed.display === 'inline-flex') {
      this.inlineFlexStyles(element, computed)
    }
    
    // 特别处理 grid 布局 - 确保所有 grid 属性都被内联
    if (computed.display === 'grid' || computed.display === 'inline-grid') {
      this.inlineGridStyles(element, computed)
    }
  }

  /**
   * 内联布局相关样式
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineLayoutStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // 基础布局属性
    element.style.display = computed.display
    element.style.position = computed.position
    element.style.float = computed.float
    element.style.clear = computed.clear
    
    // 定位属性（仅当 position 不是 static 时）
    if (computed.position !== 'static') {
      element.style.top = computed.top
      element.style.right = computed.right
      element.style.bottom = computed.bottom
      element.style.left = computed.left
      element.style.zIndex = computed.zIndex
    }
    
    // 溢出处理
    element.style.overflow = computed.overflow
    element.style.overflowX = computed.overflowX
    element.style.overflowY = computed.overflowY
  }

  /**
   * 内联 Flex 布局样式
   * 确保所有 flex 相关属性都被正确内联
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineFlexStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // Flex 容器属性
    element.style.display = computed.display
    element.style.flexDirection = computed.flexDirection
    element.style.flexWrap = computed.flexWrap
    element.style.justifyContent = computed.justifyContent
    element.style.alignItems = computed.alignItems
    element.style.alignContent = computed.alignContent
    element.style.gap = computed.gap
    element.style.rowGap = computed.rowGap
    element.style.columnGap = computed.columnGap
    
    // Flex 子项属性
    element.style.flexGrow = computed.flexGrow
    element.style.flexShrink = computed.flexShrink
    element.style.flexBasis = computed.flexBasis
    element.style.alignSelf = computed.alignSelf
    element.style.order = computed.order
  }

  /**
   * 内联 Grid 布局样式
   * 确保所有 grid 相关属性都被正确内联
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineGridStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // Grid 容器属性
    element.style.display = computed.display
    element.style.gridTemplateColumns = computed.gridTemplateColumns
    element.style.gridTemplateRows = computed.gridTemplateRows
    element.style.gridTemplateAreas = computed.gridTemplateAreas
    element.style.gridAutoColumns = computed.gridAutoColumns
    element.style.gridAutoRows = computed.gridAutoRows
    element.style.gridAutoFlow = computed.gridAutoFlow
    element.style.gap = computed.gap
    element.style.rowGap = computed.rowGap
    element.style.columnGap = computed.columnGap
    element.style.justifyItems = computed.justifyItems
    element.style.alignItems = computed.alignItems
    element.style.justifyContent = computed.justifyContent
    element.style.alignContent = computed.alignContent
    
    // Grid 子项属性
    element.style.gridColumn = computed.gridColumn
    element.style.gridColumnStart = computed.gridColumnStart
    element.style.gridColumnEnd = computed.gridColumnEnd
    element.style.gridRow = computed.gridRow
    element.style.gridRowStart = computed.gridRowStart
    element.style.gridRowEnd = computed.gridRowEnd
    element.style.gridArea = computed.gridArea
    element.style.justifySelf = computed.justifySelf
    element.style.alignSelf = computed.alignSelf
  }

  /**
   * 内联间距样式
   * 处理 padding 和 margin 相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineSpacingStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // Padding
    element.style.padding = computed.padding
    element.style.paddingTop = computed.paddingTop
    element.style.paddingRight = computed.paddingRight
    element.style.paddingBottom = computed.paddingBottom
    element.style.paddingLeft = computed.paddingLeft
    
    // Margin
    element.style.margin = computed.margin
    element.style.marginTop = computed.marginTop
    element.style.marginRight = computed.marginRight
    element.style.marginBottom = computed.marginBottom
    element.style.marginLeft = computed.marginLeft
    
    // Gap (用于 flex 和 grid)
    element.style.gap = computed.gap
    element.style.rowGap = computed.rowGap
    element.style.columnGap = computed.columnGap
    
    // Space between (Tailwind 的 space-x 和 space-y 通过 margin 实现)
    // 这些已经通过 margin 属性处理
  }

  /**
   * 内联尺寸样式
   * 处理 width, height, min/max 尺寸相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineSizingStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // Width
    element.style.width = computed.width
    element.style.minWidth = computed.minWidth
    element.style.maxWidth = computed.maxWidth
    
    // Height
    element.style.height = computed.height
    element.style.minHeight = computed.minHeight
    element.style.maxHeight = computed.maxHeight
    
    // Box sizing
    element.style.boxSizing = computed.boxSizing
    
    // Aspect ratio (如果支持)
    if ('aspectRatio' in computed) {
      element.style.aspectRatio = computed.aspectRatio
    }
  }

  /**
   * 内联显示和可见性样式
   * 处理 display, visibility, opacity 相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineDisplayStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    element.style.display = computed.display
    element.style.visibility = computed.visibility
    element.style.opacity = computed.opacity
  }

  /**
   * 内联文本样式
   * 处理文本相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineTextStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // 字体相关
    element.style.fontSize = computed.fontSize
    element.style.fontWeight = computed.fontWeight
    element.style.lineHeight = computed.lineHeight
    element.style.letterSpacing = computed.letterSpacing
    
    // 文本对齐
    element.style.textAlign = computed.textAlign
    element.style.textDecoration = computed.textDecoration
    element.style.textTransform = computed.textTransform
    element.style.textOverflow = computed.textOverflow
    
    // 空白处理
    element.style.whiteSpace = computed.whiteSpace
    element.style.wordBreak = computed.wordBreak
    element.style.wordWrap = computed.wordWrap
    
    // 行数限制 (webkit)
    if ('webkitLineClamp' in element.style) {
      (element.style as unknown as Record<string, string>).webkitLineClamp = 
        (computed as unknown as Record<string, string>).webkitLineClamp || ''
    }
  }

  /**
   * 内联边框和圆角样式
   * 处理 border 和 border-radius 相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineBorderStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    // 边框
    element.style.border = computed.border
    element.style.borderWidth = computed.borderWidth
    element.style.borderStyle = computed.borderStyle
    element.style.borderColor = computed.borderColor
    
    // 单边边框
    element.style.borderTop = computed.borderTop
    element.style.borderRight = computed.borderRight
    element.style.borderBottom = computed.borderBottom
    element.style.borderLeft = computed.borderLeft
    
    // 圆角
    element.style.borderRadius = computed.borderRadius
    element.style.borderTopLeftRadius = computed.borderTopLeftRadius
    element.style.borderTopRightRadius = computed.borderTopRightRadius
    element.style.borderBottomLeftRadius = computed.borderBottomLeftRadius
    element.style.borderBottomRightRadius = computed.borderBottomRightRadius
    
    // 轮廓
    element.style.outline = computed.outline
    element.style.outlineWidth = computed.outlineWidth
    element.style.outlineStyle = computed.outlineStyle
    element.style.outlineColor = computed.outlineColor
    element.style.outlineOffset = computed.outlineOffset
  }

  /**
   * 内联背景样式
   * 处理 background 相关的响应式类
   * @param element - HTML 元素
   * @param computed - 计算样式
   */
  private inlineBackgroundStyles(element: HTMLElement, computed: CSSStyleDeclaration): void {
    element.style.backgroundColor = computed.backgroundColor
    element.style.backgroundImage = computed.backgroundImage
    element.style.backgroundSize = computed.backgroundSize
    element.style.backgroundPosition = computed.backgroundPosition
    element.style.backgroundRepeat = computed.backgroundRepeat
    element.style.backgroundAttachment = computed.backgroundAttachment
    
    // 阴影
    element.style.boxShadow = computed.boxShadow
  }

  /**
   * 移除元素上的响应式类
   * 可选功能，用于清理导出后的元素
   * @param element - HTML 元素
   */
  removeResponsiveClasses(element: HTMLElement): void {
    const classList = Array.from(element.classList)
    
    classList.forEach(cls => {
      if (ExportStyleCapture.RESPONSIVE_PREFIXES.some(prefix => cls.startsWith(prefix))) {
        element.classList.remove(cls)
      }
    })
  }

  /**
   * 获取元素的所有响应式类信息
   * 用于调试和日志记录
   * @param element - HTML 元素
   * @returns 响应式类信息
   */
  getResponsiveClassInfo(element: HTMLElement): {
    hasResponsive: boolean
    classes: Map<string, string[]>
    totalCount: number
  } {
    const classList = Array.from(element.classList)
    const hasResponsive = this.hasResponsiveClasses(classList)
    const classes = this.extractResponsiveClasses(classList)
    
    let totalCount = 0
    classes.forEach(arr => {
      totalCount += arr.length
    })
    
    return {
      hasResponsive,
      classes,
      totalCount
    }
  }


  /**
   * 检测元素是否为 Flex 容器
   * 满足需求 6.1: 检测 display: flex 或 inline-flex
   * 满足 Property 3: Flex 容器检测准确性
   * 
   * *对于任意* HTML 元素，`isFlexContainer(element)` 应返回 true 
   * 当且仅当该元素的计算样式 display 属性为 'flex' 或 'inline-flex'。
   * 
   * @param element - 要检测的 HTML 元素
   * @returns 是否为 Flex 容器
   */
  isFlexContainer(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element)
    const display = computedStyle.display
    return display === 'flex' || display === 'inline-flex'
  }

  /**
   * 将百分比宽度转换为像素值
   * 满足需求 3.2, 6.3, 6.5: 将百分比宽度转换为固定像素值
   * 满足 Property 2: 百分比宽度转像素计算正确性
   * 
   * *对于任意* 百分比宽度值 p（0 < p <= 100）和容器宽度 w（w > 0），
   * `convertPercentToPixels(p, w)` 应返回 `Math.round(w * p / 100)`，
   * 且结果应为正整数。
   * 
   * @param percent - 百分比值（0-100）
   * @param containerWidth - 容器宽度（像素）
   * @returns 计算后的像素值，边界情况返回 0
   */
  convertPercentToPixels(percent: number, containerWidth: number): number {
    // Handle edge cases: NaN values
    if (isNaN(percent) || isNaN(containerWidth)) {
      return 0
    }
    
    // Handle edge cases: zero or negative container width
    if (containerWidth <= 0) {
      return 0
    }
    
    // Handle edge cases: invalid percentage values (< 0)
    if (percent <= 0) {
      return 0
    }
    
    // Clamp percentage to maximum 100
    if (percent > 100) {
      percent = 100
    }
    
    // Calculate and return the pixel value
    return Math.round(containerWidth * percent / 100)
  }

  /**
   * 获取 Flex 子元素信息
   * 满足需求 4.4, 6.1: 获取 Flex 子元素的原始宽度、flex-basis、flex-grow、flex-shrink
   * 
   * 遍历容器的所有直接子元素，收集它们的 flex 相关属性信息，
   * 用于后续将百分比宽度转换为固定像素值。
   * 
   * 注意：优先使用内联样式值，因为在某些环境（如 JSDOM）中，
   * getComputedStyle 可能无法正确反映内联样式。
   * 
   * @param container - Flex 容器元素
   * @returns Flex 子元素信息数组
   */
  getFlexChildrenInfo(container: HTMLElement): FlexChildInfo[] {
    const children: FlexChildInfo[] = []
    
    // 遍历所有直接子元素
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i]
      
      // 确保是 HTMLElement
      if (!(child instanceof HTMLElement)) {
        continue
      }
      
      const computedStyle = window.getComputedStyle(child)
      
      // 获取原始宽度样式（优先使用内联样式，否则使用计算样式）
      const originalWidth = child.style.width || computedStyle.width
      
      // 获取计算后的实际像素宽度
      const computedWidth = child.getBoundingClientRect().width
      
      // 获取 flex-basis 值（优先使用内联样式）
      const flexBasis = child.style.flexBasis || computedStyle.flexBasis
      
      // 获取 flex-grow 值（优先使用内联样式，默认为 0）
      // 在 JSDOM 中，getComputedStyle 可能无法正确反映内联样式
      const inlineFlexGrow = child.style.flexGrow
      const flexGrow = inlineFlexGrow !== '' ? parseFloat(inlineFlexGrow) : (parseFloat(computedStyle.flexGrow) || 0)
      
      // 获取 flex-shrink 值（优先使用内联样式，默认为 1）
      const inlineFlexShrink = child.style.flexShrink
      const flexShrink = inlineFlexShrink !== '' ? parseFloat(inlineFlexShrink) : (parseFloat(computedStyle.flexShrink) || 1)
      
      children.push({
        element: child,
        originalWidth,
        computedWidth,
        flexBasis,
        flexGrow,
        flexShrink
      })
    }
    
    return children
  }

  /**
   * 处理 Flex 布局，将百分比宽度转换为固定像素值
   * 满足需求 3.4, 6.1, 6.2, 6.4: 处理 Flex 布局导出
   * 满足 Property 4: Flex 子元素宽度应用完整性 - 所有直接子元素应具有以像素为单位的内联 width 样式
   * 满足 Property 6: 嵌套 Flex 容器递归处理 - 所有层级的 Flex 容器的子元素都应具有固定像素宽度
   * 满足 Property 8: Flex 属性保留完整性 - flex-basis、flex-grow、flex-shrink 属性应被正确转换
   * 
   * @param element - 要处理的元素
   * @param config - 配置选项
   */
  processFlexLayouts(element: HTMLElement, config?: Partial<FlexLayoutConfig>): void {
    // 默认配置
    const defaultConfig: FlexLayoutConfig = {
      containerWidth: 794, // A4 width
      recursive: true,
      pageWidth: 794
    }
    const mergedConfig = { ...defaultConfig, ...config }
    
    // Process this element if it's a flex container
    if (this.isFlexContainer(element)) {
      // 获取容器实际宽度，如果无法获取则使用配置的默认宽度
      const containerWidth = element.getBoundingClientRect().width || mergedConfig.containerWidth
      const children = this.getFlexChildrenInfo(element)
      
      for (const child of children) {
        let widthSet = false
        
        // 检查宽度是否为百分比
        if (child.originalWidth.includes('%')) {
          const percent = parseFloat(child.originalWidth)
          if (!isNaN(percent)) {
            const pixelWidth = this.convertPercentToPixels(percent, containerWidth)
            child.element.style.width = `${pixelWidth}px`
            widthSet = true
          }
        } else if (child.computedWidth > 0) {
          // 应用计算后的宽度作为固定像素值
          child.element.style.width = `${Math.round(child.computedWidth)}px`
          widthSet = true
        }
        
        // 处理 flex-basis 属性（Property 8: Flex 属性保留完整性）
        // 如果 flex-basis 是百分比，也需要转换为像素值
        if (child.flexBasis && child.flexBasis !== 'auto' && child.flexBasis !== '0px') {
          if (child.flexBasis.includes('%')) {
            const basisPercent = parseFloat(child.flexBasis)
            if (!isNaN(basisPercent)) {
              const basisPixels = this.convertPercentToPixels(basisPercent, containerWidth)
              child.element.style.flexBasis = `${basisPixels}px`
              // 如果宽度还没有设置，也设置宽度（Property 4: Flex 子元素宽度应用完整性）
              if (!widthSet) {
                child.element.style.width = `${basisPixels}px`
                widthSet = true
              }
            }
          } else if (!child.flexBasis.includes('px')) {
            // 如果 flex-basis 是其他单位（如 em, rem），使用计算后的宽度
            if (child.computedWidth > 0) {
              child.element.style.flexBasis = `${Math.round(child.computedWidth)}px`
            }
          }
        }
        
        // 保留 flex-grow 和 flex-shrink 属性，但确保它们被内联
        // 这样在导出时不会丢失这些属性
        if (child.flexGrow !== 0) {
          child.element.style.flexGrow = String(child.flexGrow)
        }
        if (child.flexShrink !== 1) {
          child.element.style.flexShrink = String(child.flexShrink)
        }
      }
    }
    
    // 递归处理子元素（如果启用）
    // Property 6: 嵌套 Flex 容器递归处理
    if (mergedConfig.recursive) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i]
        if (child instanceof HTMLElement) {
          this.processFlexLayouts(child, mergedConfig)
        }
      }
    }
  }

  /**
   * 获取优化的 html2canvas 配置
   * @param element - 要导出的元素
   * @returns html2canvas 配置对象
   */
  getHtml2CanvasOptions(element: HTMLElement): Record<string, unknown> {
    return {
      scale: 2, // 2倍缩放保证清晰度
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794, // A4 宽度 (96 DPI)
      windowWidth: 794,
      height: element.scrollHeight,
      // 使用 foreignObjectRendering 可以更好地保持样式
      foreignObjectRendering: false, // 某些浏览器不支持，设为 false 更稳定
      // 忽略不需要导出的元素
      ignoreElements: (el: Element) => {
        return el.classList.contains('no-export') || 
               el.hasAttribute('data-no-export') ||
               el.tagName === 'BUTTON'
      },
      // 处理图片跨域
      onclone: (clonedDoc: Document) => {
        // 在克隆的文档中处理图片
        const images = clonedDoc.querySelectorAll('img')
        images.forEach(img => {
          img.crossOrigin = 'anonymous'
        })
      }
    }
  }

  /**
   * 完整的导出前准备流程
   * 整合所有样式处理步骤，确保导出一致性
   * @param element - 要导出的元素
   * @param options - 导出选项
   * @returns 准备好的元素和预检结果
   */
  async prepareForExportComplete(
    element: HTMLElement,
    options: {
      validateStyles?: boolean
      preCheck?: boolean
      handleTitleRepetition?: boolean
      pageBreakPositions?: number[]
      titleRepetitionConfig?: TitleRepetitionConfig
      fontTimeout?: number
    } = {}
  ): Promise<{
    preparedElement: HTMLElement
    preCheckResult?: StylePreCheckResult
    validationResult?: StyleValidationResult
    fontLoadStatus?: FontLoadStatus
  }> {
    const {
      validateStyles = true,
      preCheck = true,
      handleTitleRepetition = true,
      pageBreakPositions = [],
      titleRepetitionConfig = { enabled: true, prefix: '（续）' },
      fontTimeout = 3000
    } = options

    // 1. 等待字体加载并检查可用性
    const fontLoadStatus = await this.waitForFonts(fontTimeout)

    // 2. 执行样式预检
    let preCheckResult: StylePreCheckResult | undefined
    if (preCheck) {
      preCheckResult = this.preCheckStyles(element)
    }

    // 3. 捕获预览样式（用于后续验证）
    const previewStyles = this.capturePreviewStyles(element)

    // 4. 克隆并准备元素
    const preparedElement = this.cloneAndPrepareForExport(element)

    // 5. 处理标题重复（分页时）
    if (handleTitleRepetition && pageBreakPositions.length > 0) {
      this.insertRepeatedTitles(preparedElement, pageBreakPositions, titleRepetitionConfig)
    }

    // 6. 验证样式一致性
    let validationResult: StyleValidationResult | undefined
    if (validateStyles) {
      const exportStyles = this.capturePreviewStyles(preparedElement)
      validationResult = this.validateStyleConsistency(previewStyles, exportStyles)
    }

    return {
      preparedElement,
      preCheckResult,
      validationResult,
      fontLoadStatus
    }
  }
}

// 导出单例实例
export const exportStyleCapture = new ExportStyleCapture()

export default ExportStyleCapture
