/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

/**
 * 个人信息接口
 */
export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website?: string
  summary: string
  avatar?: string  // 添加头像字段
}

/**
 * 工作经历接口
 */
export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string[]
  location?: string
}

/**
 * 教育经历接口
 */
export interface Education {
  id: string
  school: string
  degree: string
  major: string
  startDate: string
  endDate: string
  gpa?: string
  description?: string
}

/**
 * 技能接口
 */
export interface Skill {
  id: string
  name: string
  level: number  // 改为数字类型，表示百分比 0-100
  category: string
}

/**
 * 项目经历接口
 */
export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  startDate: string
  endDate: string
  url?: string
  highlights: string[]
}

/**
 * 完整简历数据接口
 */
export interface ResumeData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects: Project[]
}

/**
 * 简历主题接口
 */
export interface ResumeTheme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  layout: 'classic' | 'modern' | 'creative'
}