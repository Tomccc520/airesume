/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

/**
 * 表单验证工具类
 * 提供各种字段的验证函数和错误处理
 */

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => ValidationResult
}

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: '邮箱不能为空' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' }
  }
  
  return { isValid: true }
}

/**
 * 验证手机号格式
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, message: '手机号不能为空' }
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
    return { isValid: false, message: '请输入有效的手机号码' }
  }
  
  return { isValid: true }
}

/**
 * 验证必填字段
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName}不能为空` }
  }
  return { isValid: true }
}

/**
 * 验证字符串长度
 */
export const validateLength = (
  value: string, 
  minLength: number = 0, 
  maxLength: number = Infinity,
  fieldName: string = '字段'
): ValidationResult => {
  const length = value.trim().length
  
  if (length < minLength) {
    return { isValid: false, message: `${fieldName}至少需要${minLength}个字符` }
  }
  
  if (length > maxLength) {
    return { isValid: false, message: `${fieldName}不能超过${maxLength}个字符` }
  }
  
  return { isValid: true }
}

/**
 * 验证URL格式
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true } // URL是可选的
  }
  
  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, message: '请输入有效的URL地址' }
  }
}

/**
 * 验证日期格式
 */
export const validateDate = (date: string, fieldName: string = '日期'): ValidationResult => {
  if (!date.trim()) {
    return { isValid: false, message: `${fieldName}不能为空` }
  }
  
  const dateRegex = /^\d{4}-\d{2}$/
  if (!dateRegex.test(date)) {
    return { isValid: false, message: `请输入有效的${fieldName}格式 (YYYY-MM)` }
  }
  
  return { isValid: true }
}

/**
 * 验证日期范围
 */
export const validateDateRange = (startDate: string, endDate: string, isCurrent: boolean = false): ValidationResult => {
  if (!startDate.trim()) {
    return { isValid: false, message: '开始日期不能为空' }
  }
  
  if (!isCurrent && !endDate.trim()) {
    return { isValid: false, message: '结束日期不能为空' }
  }
  
  if (!isCurrent && endDate && startDate > endDate) {
    return { isValid: false, message: '开始日期不能晚于结束日期' }
  }
  
  return { isValid: true }
}

/**
 * 验证GPA格式
 */
export const validateGPA = (gpa: string): ValidationResult => {
  if (!gpa.trim()) {
    return { isValid: true } // GPA是可选的
  }
  
  const gpaRegex = /^\d+(\.\d+)?(\/\d+(\.\d+)?)?$/
  if (!gpaRegex.test(gpa)) {
    return { isValid: false, message: '请输入有效的GPA格式 (如: 3.8 或 3.8/4.0)' }
  }
  
  return { isValid: true }
}

/**
 * 通用字段验证器
 */
export const validateField = (value: string, rules: FieldValidation, fieldName: string): ValidationResult => {
  // 必填验证
  if (rules.required) {
    const requiredResult = validateRequired(value, fieldName)
    if (!requiredResult.isValid) return requiredResult
  }
  
  // 如果字段为空且不是必填，则跳过其他验证
  if (!value.trim() && !rules.required) {
    return { isValid: true }
  }
  
  // 长度验证
  if (rules.minLength !== undefined || rules.maxLength !== undefined) {
    const lengthResult = validateLength(
      value, 
      rules.minLength || 0, 
      rules.maxLength || Infinity, 
      fieldName
    )
    if (!lengthResult.isValid) return lengthResult
  }
  
  // 正则表达式验证
  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, message: `${fieldName}格式不正确` }
  }
  
  // 自定义验证
  if (rules.custom) {
    return rules.custom(value)
  }
  
  return { isValid: true }
}

/**
 * 验证个人信息
 */
export const validatePersonalInfo = (personalInfo: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  // 姓名验证
  const nameResult = validateField(personalInfo.name, { 
    required: true, 
    minLength: 2, 
    maxLength: 20 
  }, '姓名')
  if (!nameResult.isValid) errors.name = nameResult.message!
  
  // 邮箱验证
  if (personalInfo.email) {
    const emailResult = validateEmail(personalInfo.email)
    if (!emailResult.isValid) errors.email = emailResult.message!
  }
  
  // 手机号验证
  if (personalInfo.phone) {
    const phoneResult = validatePhone(personalInfo.phone)
    if (!phoneResult.isValid) errors.phone = phoneResult.message!
  }
  
  // 职位验证
  const titleResult = validateField(personalInfo.title, { 
    minLength: 2, 
    maxLength: 50 
  }, '职位')
  if (!titleResult.isValid) errors.title = titleResult.message!
  
  // 个人简介验证
  const summaryResult = validateField(personalInfo.summary, { 
    maxLength: 500 
  }, '个人简介')
  if (!summaryResult.isValid) errors.summary = summaryResult.message!
  
  return errors
}

/**
 * 验证工作经历
 */
export const validateExperience = (experience: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  // 公司名称验证
  const companyResult = validateField(experience.company, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  }, '公司名称')
  if (!companyResult.isValid) errors.company = companyResult.message!
  
  // 职位验证
  const positionResult = validateField(experience.position, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  }, '职位')
  if (!positionResult.isValid) errors.position = positionResult.message!
  
  // 日期范围验证
  const dateResult = validateDateRange(experience.startDate, experience.endDate, experience.current)
  if (!dateResult.isValid) errors.dateRange = dateResult.message!
  
  return errors
}

/**
 * 验证教育背景
 */
export const validateEducation = (education: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  // 学校名称验证
  const schoolResult = validateField(education.school, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  }, '学校名称')
  if (!schoolResult.isValid) errors.school = schoolResult.message!
  
  // 学历验证
  const degreeResult = validateRequired(education.degree, '学历')
  if (!degreeResult.isValid) errors.degree = degreeResult.message!
  
  // 专业验证
  const majorResult = validateField(education.major, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  }, '专业')
  if (!majorResult.isValid) errors.major = majorResult.message!
  
  // GPA验证
  if (education.gpa) {
    const gpaResult = validateGPA(education.gpa)
    if (!gpaResult.isValid) errors.gpa = gpaResult.message!
  }
  
  // 日期范围验证
  const dateResult = validateDateRange(education.startDate, education.endDate, false)
  if (!dateResult.isValid) errors.dateRange = dateResult.message!
  
  return errors
}

/**
 * 验证技能
 */
export const validateSkill = (skill: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  // 技能名称验证
  const nameResult = validateField(skill.name, { 
    required: true, 
    minLength: 1, 
    maxLength: 30 
  }, '技能名称')
  if (!nameResult.isValid) errors.name = nameResult.message!
  
  // 技能等级验证
  const validLevels = ['初级', '中级', '高级', '专家']
  if (!validLevels.includes(skill.level)) {
    errors.level = '请选择有效的技能等级'
  }
  
  return errors
}

/**
 * 验证项目经历
 */
export const validateProject = (project: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  // 项目名称验证
  const nameResult = validateField(project.name, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  }, '项目名称')
  if (!nameResult.isValid) errors.name = nameResult.message!
  
  // 项目URL验证
  if (project.url) {
    const urlResult = validateUrl(project.url)
    if (!urlResult.isValid) errors.url = urlResult.message!
  }
  
  // 日期范围验证
  const dateResult = validateDateRange(project.startDate, project.endDate, project.current)
  if (!dateResult.isValid) errors.dateRange = dateResult.message!
  
  return errors
}