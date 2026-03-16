/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 模板数据验证工具
 */

import { TemplateStyle } from '@/types/template'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 验证模板数据的完整性和正确性
 */
export const validateTemplate = (template: TemplateStyle): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // 必填字段验证
  if (!template.id) {
    errors.push('模板ID不能为空')
  }
  if (!template.name) {
    errors.push('模板名称不能为空')
  }
  if (!template.description) {
    errors.push('模板描述不能为空')
  }
  if (!template.preview) {
    errors.push('模板预览图不能为空')
  }
  if (!template.category) {
    errors.push('模板分类不能为空')
  }

  // 布局类型验证
  if (template.layoutType && !['top-bottom', 'left-right'].includes(template.layoutType)) {
    errors.push(`无效的布局类型: ${template.layoutType}，只支持 'top-bottom' 或 'left-right'`)
  }

  // 颜色配置验证
  if (!template.colors) {
    errors.push('颜色配置不能为空')
  } else {
    const requiredColors = ['primary', 'secondary', 'accent', 'text', 'background']
    requiredColors.forEach(color => {
      if (!template.colors[color as keyof typeof template.colors]) {
        errors.push(`缺少必需的颜色配置: ${color}`)
      } else if (!isValidColor(template.colors[color as keyof typeof template.colors])) {
        errors.push(`无效的颜色值: ${color} = ${template.colors[color as keyof typeof template.colors]}`)
      }
    })
  }

  // 字体配置验证
  if (!template.fonts) {
    errors.push('字体配置不能为空')
  } else {
    if (!template.fonts.heading) {
      errors.push('缺少标题字体配置')
    }
    if (!template.fonts.body) {
      errors.push('缺少正文字体配置')
    }
    if (!template.fonts.size) {
      errors.push('缺少字体大小配置')
    }
  }

  // 布局配置验证
  if (!template.layout) {
    errors.push('布局配置不能为空')
  } else {
    if (!template.layout.margins) {
      errors.push('缺少边距配置')
    }
    if (!template.layout.columns) {
      errors.push('缺少分栏配置')
    } else {
      if (template.layout.columns.count !== 1 && template.layout.columns.count !== 2) {
        errors.push(`无效的分栏数量: ${template.layout.columns.count}，只支持 1 或 2`)
      }
      // 如果是双栏布局，检查是否有宽度配置
      if (template.layout.columns.count === 2) {
        if (!template.layout.columns.leftWidth || !template.layout.columns.rightWidth) {
          warnings.push('双栏布局建议配置 leftWidth 和 rightWidth')
        }
      }
    }
    if (!template.layout.spacing) {
      errors.push('缺少间距配置')
    }
  }

  // 组件配置验证
  if (!template.components) {
    errors.push('组件配置不能为空')
  } else {
    if (!template.components.personalInfo) {
      errors.push('缺少个人信息组件配置')
    }
    if (!template.components.sectionTitle) {
      errors.push('缺少章节标题组件配置')
    }
    if (!template.components.listItem) {
      errors.push('缺少列表项组件配置')
    }
    if (!template.components.dateFormat) {
      errors.push('缺少日期格式组件配置')
    }
  }

  // 布局类型与分栏数量一致性检查
  if (template.layoutType && template.layout?.columns) {
    if (template.layoutType === 'top-bottom' && template.layout.columns.count === 2) {
      warnings.push('布局类型为 top-bottom 但分栏数量为 2，可能存在不一致')
    }
    if (template.layoutType === 'left-right' && template.layout.columns.count === 1) {
      warnings.push('布局类型为 left-right 但分栏数量为 1，可能存在不一致')
    }
  }

  // 预览图路径检查
  if (template.preview && !template.preview.startsWith('/templates/')) {
    warnings.push(`预览图路径不规范: ${template.preview}，建议使用 /templates/ 开头的路径`)
  }

  // 国际化检查
  if (!template.nameEn) {
    warnings.push('缺少英文名称，建议添加以支持国际化')
  }
  if (!template.descriptionEn) {
    warnings.push('缺少英文描述，建议添加以支持国际化')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证颜色值是否有效
 */
const isValidColor = (color: string): boolean => {
  // 支持 hex、rgb、rgba、hsl、hsla 格式
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
  const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/
  const hslaPattern = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/
  
  return hexPattern.test(color) || 
         rgbPattern.test(color) || 
         rgbaPattern.test(color) || 
         hslPattern.test(color) || 
         hslaPattern.test(color)
}

/**
 * 批量验证模板列表
 */
export const validateTemplates = (templates: TemplateStyle[]): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {}
  
  templates.forEach(template => {
    results[template.id] = validateTemplate(template)
  })
  
  return results
}

/**
 * 获取验证摘要
 */
export const getValidationSummary = (results: Record<string, ValidationResult>) => {
  const totalTemplates = Object.keys(results).length
  const validTemplates = Object.values(results).filter(r => r.isValid).length
  const invalidTemplates = totalTemplates - validTemplates
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = Object.values(results).reduce((sum, r) => sum + r.warnings.length, 0)
  
  return {
    totalTemplates,
    validTemplates,
    invalidTemplates,
    totalErrors,
    totalWarnings,
    validationRate: totalTemplates > 0 ? (validTemplates / totalTemplates * 100).toFixed(2) + '%' : '0%'
  }
}

/**
 * 打印验证报告
 */
export const printValidationReport = (
  results: Record<string, ValidationResult>,
  writer?: (line: string) => void
) => {
  const summary = getValidationSummary(results)
  const lines: string[] = []
  
  lines.push('')
  lines.push('========== 模板验证报告 ==========')
  lines.push(`总模板数: ${summary.totalTemplates}`)
  lines.push(`有效模板: ${summary.validTemplates}`)
  lines.push(`无效模板: ${summary.invalidTemplates}`)
  lines.push(`总错误数: ${summary.totalErrors}`)
  lines.push(`总警告数: ${summary.totalWarnings}`)
  lines.push(`验证通过率: ${summary.validationRate}`)
  lines.push('==================================')
  lines.push('')
  
  // 打印详细错误和警告
  Object.entries(results).forEach(([templateId, result]) => {
    if (!result.isValid || result.warnings.length > 0) {
      lines.push('')
      lines.push(`模板: ${templateId}`)
      
      if (result.errors.length > 0) {
        lines.push('  错误:')
        result.errors.forEach(error => lines.push(`    - ${error}`))
      }
      
      if (result.warnings.length > 0) {
        lines.push('  警告:')
        result.warnings.forEach(warning => lines.push(`    - ${warning}`))
      }
    }
  })

  if (writer) {
    lines.forEach((line) => writer(line))
  }

  return lines.join('\n')
}

/**
 * 检查模板预览图是否存在
 */
export const checkTemplatePreviewImages = async (templates: TemplateStyle[]): Promise<{
  existing: string[]
  missing: string[]
}> => {
  const existing: string[] = []
  const missing: string[] = []
  
  for (const template of templates) {
    const imagePath = template.preview
    
    // 在浏览器环境中，我们可以尝试加载图片来检查是否存在
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(imagePath, { method: 'HEAD' })
        if (response.ok) {
          existing.push(imagePath)
        } else {
          missing.push(imagePath)
        }
      } catch {
        missing.push(imagePath)
      }
    }
  }
  
  return { existing, missing }
}

/**
 * 自动修复常见问题
 */
export const autoFixTemplate = (template: TemplateStyle): TemplateStyle => {
  const fixed = { ...template }
  
  // 自动推断布局类型
  if (!fixed.layoutType && fixed.layout?.columns) {
    fixed.layoutType = fixed.layout.columns.count === 2 ? 'left-right' : 'top-bottom'
  }
  
  // 确保双栏布局有宽度配置
  if (fixed.layout?.columns.count === 2) {
    if (!fixed.layout.columns.leftWidth) {
      fixed.layout.columns.leftWidth = '35%'
    }
    if (!fixed.layout.columns.rightWidth) {
      fixed.layout.columns.rightWidth = '65%'
    }
  }
  
  // 确保有国际化字段
  if (!fixed.nameEn) {
    fixed.nameEn = fixed.name
  }
  if (!fixed.descriptionEn) {
    fixed.descriptionEn = fixed.description
  }
  
  return fixed
}
