/**
 * @file services/dataExportService.ts
 * @description 数据导出服务，实现完整数据包导出和数据格式验证
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * @requirements 8.1, 8.3, 8.7
 */

/**
 * 简历数据类型
 */
export interface ResumeData {
  personalInfo?: {
    name?: string
    title?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    contactQRCode?: string
    summary?: string
    avatar?: string
  }
  experience?: Array<{
    id?: string
    company?: string
    position?: string
    startDate?: string
    endDate?: string
    current?: boolean
    location?: string
    description?: string
  }>
  education?: Array<{
    id?: string
    school?: string
    degree?: string
    major?: string
    startDate?: string
    endDate?: string
    gpa?: string
    description?: string
  }>
  skills?: Array<{
    id?: string
    name?: string
    level?: number
    category?: string
  }>
  projects?: Array<{
    id?: string
    name?: string
    description?: string
    technologies?: string
    link?: string
    startDate?: string
    endDate?: string
    highlights?: string[]
  }>
}

/**
 * 样式配置类型
 */
export interface StyleConfig {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    text?: string
    background?: string
  }
  fontFamily?: string
  fontSize?: {
    content?: number
    title?: number
    name?: number
    small?: number
  }
  spacing?: {
    section?: number
    item?: number
    line?: number
  }
  layout?: {
    headerLayout?: 'horizontal' | 'vertical' | 'centered'
    contactLayout?: 'inline' | 'grouped' | 'sidebar'
    columns?: 1 | 2
    padding?: number
    columnGap?: number
    leftColumnWidth?: number
    rightColumnWidth?: number
    sectionOrder?: string[]
  }
  skills?: {
    displayStyle?: 'progress' | 'tags' | 'list' | 'cards' | 'grid' | 'radar'
  }
}

/**
 * 配色方案类型
 */
export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  text: string
  background: string
  isPreset: boolean
  createdAt?: string
}

/**
 * 导出数据包类型
 */
export interface ExportPackage {
  /** 应用名称 */
  appName: string
  /** 应用版本 */
  appVersion: string
  /** 数据格式版本 */
  version: string
  /** 导出时间 */
  exportedAt: string
  /** 简历数据 */
  resumeData?: ResumeData
  /** 样式配置 */
  styleConfig?: StyleConfig
  /** 自定义配色方案 */
  colorSchemes?: ColorScheme[]
  /** 校验和（用于验证数据完整性） */
  checksum?: string
}

/**
 * 验证结果类型
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * 验证错误类型
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * 验证警告类型
 */
export interface ValidationWarning {
  field: string
  message: string
  code: string
}

/**
 * 应用信息
 */
const APP_INFO = {
  name: 'AI Resume Builder',
  version: '1.0.0',
  dataVersion: '1.0'
}

/**
 * 计算简单校验和
 */
function calculateChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * 验证颜色格式
 */
function isValidColor(color: unknown): boolean {
  if (typeof color !== 'string') return false
  return /^#[0-9a-fA-F]{6}$/.test(color)
}

/**
 * 验证日期格式
 */
function isValidDate(date: unknown): boolean {
  if (typeof date !== 'string') return false
  if (date === '') return true // 允许空字符串
  // 支持 YYYY-MM 或 YYYY-MM-DD 格式
  return /^\d{4}-\d{2}(-\d{2})?$/.test(date)
}

/**
 * 验证 URL 格式
 */
function isValidUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false
  if (url === '') return true // 允许空字符串
  try {
    new URL(url)
    return true
  } catch {
    return /^https?:\/\//.test(url) || /^www\./.test(url)
  }
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false
  if (email === '') return true // 允许空字符串
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 数据导出服务类
 */
export class DataExportService {
  /**
   * 创建完整的导出数据包
   * @requirements 8.1, 8.7
   */
  static createExportPackage(
    resumeData?: ResumeData,
    styleConfig?: StyleConfig,
    colorSchemes?: ColorScheme[]
  ): ExportPackage {
    const packageData: ExportPackage = {
      appName: APP_INFO.name,
      appVersion: APP_INFO.version,
      version: APP_INFO.dataVersion,
      exportedAt: new Date().toISOString(),
      resumeData,
      styleConfig,
      colorSchemes
    }

    // 计算校验和（不包含校验和字段本身）
    const dataString = JSON.stringify({
      ...packageData,
      checksum: undefined
    })
    packageData.checksum = calculateChecksum(dataString)

    return packageData
  }

  /**
   * 导出为 JSON 字符串
   * @requirements 8.1
   */
  static exportToJson(
    resumeData?: ResumeData,
    styleConfig?: StyleConfig,
    colorSchemes?: ColorScheme[],
    pretty: boolean = true
  ): string {
    const packageData = this.createExportPackage(resumeData, styleConfig, colorSchemes)
    return pretty 
      ? JSON.stringify(packageData, null, 2)
      : JSON.stringify(packageData)
  }

  /**
   * 下载导出文件
   * @requirements 8.1
   */
  static downloadExport(
    resumeData?: ResumeData,
    styleConfig?: StyleConfig,
    colorSchemes?: ColorScheme[],
    filename?: string
  ): void {
    const jsonString = this.exportToJson(resumeData, styleConfig, colorSchemes)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const defaultFilename = `resume-backup-${new Date().toISOString().split('T')[0]}.json`
    const link = document.createElement('a')
    link.href = url
    link.download = filename || defaultFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 验证导入数据格式
   * @requirements 8.3
   */
  static validateImportData(data: unknown): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 基本类型检查
    if (!data || typeof data !== 'object') {
      errors.push({
        field: 'root',
        message: '无效的数据格式，请确保是有效的 JSON 对象',
        code: 'INVALID_FORMAT'
      })
      return { valid: false, errors, warnings }
    }

    const obj = data as Record<string, unknown>

    // 验证版本信息
    if (!obj.version || typeof obj.version !== 'string') {
      errors.push({
        field: 'version',
        message: '缺少版本信息',
        code: 'MISSING_VERSION'
      })
    }

    // 验证导出时间
    if (!obj.exportedAt || typeof obj.exportedAt !== 'string') {
      warnings.push({
        field: 'exportedAt',
        message: '缺少导出时间信息',
        code: 'MISSING_EXPORT_TIME'
      })
    } else {
      const exportDate = new Date(obj.exportedAt)
      if (isNaN(exportDate.getTime())) {
        warnings.push({
          field: 'exportedAt',
          message: '导出时间格式无效',
          code: 'INVALID_EXPORT_TIME'
        })
      }
    }

    // 验证简历数据
    if (obj.resumeData !== undefined) {
      const resumeErrors = this.validateResumeData(obj.resumeData)
      errors.push(...resumeErrors.errors)
      warnings.push(...resumeErrors.warnings)
    }

    // 验证样式配置
    if (obj.styleConfig !== undefined) {
      const styleErrors = this.validateStyleConfig(obj.styleConfig)
      errors.push(...styleErrors.errors)
      warnings.push(...styleErrors.warnings)
    }

    // 验证配色方案
    if (obj.colorSchemes !== undefined) {
      const schemeErrors = this.validateColorSchemes(obj.colorSchemes)
      errors.push(...schemeErrors.errors)
      warnings.push(...schemeErrors.warnings)
    }

    // 验证校验和（如果存在）
    if (obj.checksum && typeof obj.checksum === 'string') {
      const dataWithoutChecksum = { ...obj, checksum: undefined }
      const expectedChecksum = calculateChecksum(JSON.stringify(dataWithoutChecksum))
      if (obj.checksum !== expectedChecksum) {
        warnings.push({
          field: 'checksum',
          message: '数据校验和不匹配，数据可能已被修改',
          code: 'CHECKSUM_MISMATCH'
        })
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证简历数据
   */
  private static validateResumeData(data: unknown): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof data !== 'object' || data === null) {
      errors.push({
        field: 'resumeData',
        message: '简历数据格式无效',
        code: 'INVALID_RESUME_DATA'
      })
      return { errors, warnings }
    }

    const resume = data as Record<string, unknown>

    // 验证个人信息
    if (resume.personalInfo !== undefined) {
      if (typeof resume.personalInfo !== 'object' || resume.personalInfo === null) {
        errors.push({
          field: 'resumeData.personalInfo',
          message: '个人信息格式无效',
          code: 'INVALID_PERSONAL_INFO'
        })
      } else {
        const info = resume.personalInfo as Record<string, unknown>
        
        if (info.email && !isValidEmail(info.email)) {
          warnings.push({
            field: 'resumeData.personalInfo.email',
            message: '邮箱格式可能无效',
            code: 'INVALID_EMAIL_FORMAT'
          })
        }
        
        if (info.website && !isValidUrl(info.website)) {
          warnings.push({
            field: 'resumeData.personalInfo.website',
            message: '网站 URL 格式可能无效',
            code: 'INVALID_URL_FORMAT'
          })
        }
      }
    }

    // 验证工作经历
    if (resume.experience !== undefined) {
      if (!Array.isArray(resume.experience)) {
        errors.push({
          field: 'resumeData.experience',
          message: '工作经历应为数组格式',
          code: 'INVALID_EXPERIENCE_FORMAT'
        })
      } else {
        resume.experience.forEach((exp, index) => {
          if (typeof exp !== 'object' || exp === null) {
            errors.push({
              field: `resumeData.experience[${index}]`,
              message: `第 ${index + 1} 条工作经历格式无效`,
              code: 'INVALID_EXPERIENCE_ITEM'
            })
          } else {
            const expObj = exp as Record<string, unknown>
            if (expObj.startDate && !isValidDate(expObj.startDate)) {
              warnings.push({
                field: `resumeData.experience[${index}].startDate`,
                message: `第 ${index + 1} 条工作经历的开始日期格式可能无效`,
                code: 'INVALID_DATE_FORMAT'
              })
            }
          }
        })
      }
    }

    // 验证教育背景
    if (resume.education !== undefined) {
      if (!Array.isArray(resume.education)) {
        errors.push({
          field: 'resumeData.education',
          message: '教育背景应为数组格式',
          code: 'INVALID_EDUCATION_FORMAT'
        })
      }
    }

    // 验证技能
    if (resume.skills !== undefined) {
      if (!Array.isArray(resume.skills)) {
        errors.push({
          field: 'resumeData.skills',
          message: '技能应为数组格式',
          code: 'INVALID_SKILLS_FORMAT'
        })
      }
    }

    // 验证项目
    if (resume.projects !== undefined) {
      if (!Array.isArray(resume.projects)) {
        errors.push({
          field: 'resumeData.projects',
          message: '项目应为数组格式',
          code: 'INVALID_PROJECTS_FORMAT'
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * 验证样式配置
   */
  private static validateStyleConfig(data: unknown): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof data !== 'object' || data === null) {
      errors.push({
        field: 'styleConfig',
        message: '样式配置格式无效',
        code: 'INVALID_STYLE_CONFIG'
      })
      return { errors, warnings }
    }

    const style = data as Record<string, unknown>

    // 验证颜色配置
    if (style.colors !== undefined) {
      if (typeof style.colors !== 'object' || style.colors === null) {
        errors.push({
          field: 'styleConfig.colors',
          message: '颜色配置格式无效',
          code: 'INVALID_COLORS_CONFIG'
        })
      } else {
        const colors = style.colors as Record<string, unknown>
        const colorFields = ['primary', 'secondary', 'accent', 'text', 'background']
        
        colorFields.forEach(field => {
          if (colors[field] !== undefined && !isValidColor(colors[field])) {
            warnings.push({
              field: `styleConfig.colors.${field}`,
              message: `${field} 颜色格式可能无效，应为 #RRGGBB 格式`,
              code: 'INVALID_COLOR_FORMAT'
            })
          }
        })
      }
    }

    // 验证字体大小配置
    if (style.fontSize !== undefined) {
      if (typeof style.fontSize !== 'object' || style.fontSize === null) {
        errors.push({
          field: 'styleConfig.fontSize',
          message: '字体大小配置格式无效',
          code: 'INVALID_FONT_SIZE_CONFIG'
        })
      } else {
        const fontSize = style.fontSize as Record<string, unknown>
        const sizeFields = ['content', 'title', 'name', 'small']
        
        sizeFields.forEach(field => {
          if (fontSize[field] !== undefined) {
            const value = fontSize[field]
            if (typeof value !== 'number' || value < 8 || value > 72) {
              warnings.push({
                field: `styleConfig.fontSize.${field}`,
                message: `${field} 字体大小应在 8-72 之间`,
                code: 'INVALID_FONT_SIZE_VALUE'
              })
            }
          }
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * 验证配色方案
   */
  private static validateColorSchemes(data: unknown): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!Array.isArray(data)) {
      errors.push({
        field: 'colorSchemes',
        message: '配色方案应为数组格式',
        code: 'INVALID_COLOR_SCHEMES_FORMAT'
      })
      return { errors, warnings }
    }

    data.forEach((scheme, index) => {
      if (typeof scheme !== 'object' || scheme === null) {
        errors.push({
          field: `colorSchemes[${index}]`,
          message: `第 ${index + 1} 个配色方案格式无效`,
          code: 'INVALID_COLOR_SCHEME_ITEM'
        })
      } else {
        const s = scheme as Record<string, unknown>
        
        if (!s.id || typeof s.id !== 'string') {
          errors.push({
            field: `colorSchemes[${index}].id`,
            message: `第 ${index + 1} 个配色方案缺少 ID`,
            code: 'MISSING_SCHEME_ID'
          })
        }
        
        if (!s.name || typeof s.name !== 'string') {
          warnings.push({
            field: `colorSchemes[${index}].name`,
            message: `第 ${index + 1} 个配色方案缺少名称`,
            code: 'MISSING_SCHEME_NAME'
          })
        }

        const colorFields = ['primary', 'secondary', 'accent', 'text', 'background']
        colorFields.forEach(field => {
          if (s[field] !== undefined && !isValidColor(s[field])) {
            warnings.push({
              field: `colorSchemes[${index}].${field}`,
              message: `第 ${index + 1} 个配色方案的 ${field} 颜色格式可能无效`,
              code: 'INVALID_SCHEME_COLOR'
            })
          }
        })
      }
    })

    return { errors, warnings }
  }

  /**
   * 解析导入数据
   */
  static parseImportData(jsonString: string): { data: ExportPackage | null; error: string | null } {
    try {
      const data = JSON.parse(jsonString)
      return { data: data as ExportPackage, error: null }
    } catch (e) {
      return { 
        data: null, 
        error: 'JSON 解析失败，请检查文件格式是否正确' 
      }
    }
  }
}

export default DataExportService
