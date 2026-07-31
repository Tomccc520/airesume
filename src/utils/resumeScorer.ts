/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-10-04
 */

import { ResumeData } from '@/types/resume'

export interface ScoreResult {
  totalScore: number
  scores: {
    personalInfo: number
    experience: number
    education: number
    skills: number
    projects: number
  }
  suggestions: Suggestion[]
  completeness: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface Suggestion {
  type: 'error' | 'warning' | 'info' | 'success'
  category: 'personalInfo' | 'experience' | 'education' | 'skills' | 'projects' | 'general'
  title: string
  description: string
  priority: number
  impact: number
}

const ACTION_VERBS = ['主导', '负责', '推动', '搭建', '设计', '实现', '优化', '管理', '协调', '交付', 'Led', 'Built', 'Designed', 'Implemented', 'Drove', 'Managed', 'Optimized', 'Delivered', 'Launched', 'Owned']
const WEAK_PHRASES = ['负责相关工作', '参与相关工作', '协助完成', '日常维护', '参与项目开发', '负责项目开发']
const METRIC_PATTERN = /(\d+\s*%|\d+\s*个|\d+\s*项|\d+\s*人|\d+\s*页|\d+\s*秒|\d+\s*天|\d+\s*周|\d+\s*月|\d+\+|from\s+\d+(\.\d+)?s\s+to\s+\d+(\.\d+)?s|reduced|increased|improved|提升|降低|缩短|增长|减少)/i
const RESULT_PATTERN = /(提升|降低|缩短|增长|减少|优化至|带来|帮助|支撑|improve|reduce|increase|shorten|launch|support|enable|cut)/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\//i

export class ResumeScorer {
  static calculateScore(data: ResumeData): ScoreResult {
    const scores = {
      personalInfo: this.scorePersonalInfo(data),
      experience: this.scoreExperience(data),
      education: this.scoreEducation(data),
      skills: this.scoreSkills(data),
      projects: this.scoreProjects(data)
    }

    const totalScore = Math.round(
      scores.personalInfo * 0.2 +
      scores.experience * 0.32 +
      scores.education * 0.16 +
      scores.skills * 0.14 +
      scores.projects * 0.18
    )

    return {
      totalScore,
      scores,
      suggestions: this.generateSuggestions(data, scores),
      completeness: this.calculateCompleteness(data),
      grade: this.getGrade(totalScore)
    }
  }

  private static scorePersonalInfo(data: ResumeData): number {
    let score = 0
    const info = data.personalInfo
    const summary = info.summary?.trim() ?? ''

    if (info.name?.trim()) score += 18
    if (info.title?.trim()) score += 16
    if (EMAIL_PATTERN.test(info.email?.trim() ?? '')) score += 14
    if (info.phone?.trim()) score += 12
    if (info.location?.trim()) score += 8
    if (info.website?.trim()) score += URL_PATTERN.test(info.website.trim()) ? 10 : 4

    if (summary.length >= 80 && summary.length <= 220) score += 16
    else if (summary.length >= 40) score += 10
    else if (summary.length > 0) score += 4

    if (this.containsMetric(summary)) score += 4
    if (this.containsResult(summary)) score += 2
    return Math.min(score, 100)
  }

  private static scoreExperience(data: ResumeData): number {
    const items = data.experience
    if (items.length === 0) return 0

    let score = 30 + Math.min(items.length * 8, 16)
    let detail = 0

    items.forEach((exp) => {
      let s = 0
      if (exp.company?.trim()) s += 2
      if (exp.position?.trim()) s += 2
      if (exp.startDate?.trim()) s += 2
      if (exp.endDate?.trim() || exp.current) s += 1
      if (exp.location?.trim()) s += 1

      const lines = exp.description.filter((line) => line.trim())
      if (lines.length >= 3) s += 4
      else if (lines.length >= 2) s += 2
      s += Math.min(lines.filter((line) => this.isStrongBullet(line)).length * 2, 8)
      if (lines.some((line) => this.containsMetric(line))) s += 2
      if (lines.some((line) => this.containsResult(line))) s += 2
      detail += Math.min(s, 20)
    })

    score += Math.min(detail, 54)
    return Math.min(score, 100)
  }

  private static scoreEducation(data: ResumeData): number {
    const items = data.education
    if (items.length === 0) return 0

    let score = 40 + Math.min(items.length * 10, 15)
    items.forEach((edu) => {
      let s = 0
      if (edu.school?.trim()) s += 4
      if (edu.degree?.trim()) s += 4
      if (edu.major?.trim()) s += 4
      if (edu.startDate?.trim()) s += 2
      if (edu.endDate?.trim()) s += 2
      if (edu.gpa?.trim()) s += 3
      if (edu.description?.trim()) s += edu.description.trim().length >= 20 ? 6 : 3
      score += Math.min(s, 15)
    })

    return Math.min(score, 100)
  }

  private static scoreSkills(data: ResumeData): number {
    const skills = data.skills
    if (skills.length === 0) return 0

    let score = 25
    if (skills.length >= 8) score += 24
    else if (skills.length >= 6) score += 18
    else if (skills.length >= 4) score += 12
    else score += skills.length * 3

    score += Math.min(new Set(skills.map((s) => s.category.trim()).filter(Boolean)).size * 6, 24)
    score += Math.min(skills.filter((s) => s.level >= 80).length * 4, 16)
    if (skills.every((s) => s.name.trim().length >= 2)) score += 11
    return Math.min(score, 100)
  }

  private static scoreProjects(data: ResumeData): number {
    const items = data.projects
    if (items.length === 0) return 0

    let score = 26 + Math.min(items.length * 9, 18)
    let detail = 0

    items.forEach((project) => {
      let s = 0
      if (project.name?.trim()) s += 2
      if (project.description?.trim()) s += project.description.trim().length >= 24 ? 4 : 2
      if (project.technologies.length >= 3) s += 3
      else if (project.technologies.length > 0) s += 1
      if (project.startDate?.trim()) s += 1
      if (project.endDate?.trim()) s += 1
      if (project.url?.trim()) s += URL_PATTERN.test(project.url.trim()) ? 2 : 1

      const lines = project.highlights.filter((line) => line.trim())
      if (lines.length >= 3) s += 4
      else if (lines.length >= 2) s += 2
      s += Math.min(lines.filter((line) => this.isStrongBullet(line)).length * 2, 8)
      detail += Math.min(s, 22)
    })

    score += Math.min(detail, 56)
    return Math.min(score, 100)
  }

  private static generateSuggestions(data: ResumeData, scores: ScoreResult['scores']): Suggestion[] {
    const suggestions: Suggestion[] = []
    const summary = data.personalInfo.summary?.trim() ?? ''

    if (!data.personalInfo.name?.trim()) suggestions.push({ type: 'error', category: 'personalInfo', title: '缺少姓名', description: '请先填写姓名，确保招聘方能快速识别候选人身份。', priority: 5, impact: 15 })
    if (!EMAIL_PATTERN.test(data.personalInfo.email?.trim() ?? '')) suggestions.push({ type: 'error', category: 'personalInfo', title: '邮箱格式不完整', description: '建议填写规范邮箱地址，避免招聘方无法联系到你。', priority: 5, impact: 12 })

    if (summary.length < 60) {
      suggestions.push({ type: 'warning', category: 'personalInfo', title: '个人简介偏短', description: '建议用 80-200 字概括年限、核心技术、代表成果和目标方向。', priority: 4, impact: 10 })
    } else if (!this.containsMetric(summary) && !this.containsResult(summary)) {
      suggestions.push({ type: 'info', category: 'personalInfo', title: '个人简介缺少成果表达', description: '可补充“性能提升 40%”“交付效率提升 30%”等量化成果，提高说服力。', priority: 3, impact: 6 })
    }

    if (data.experience.length === 0) {
      suggestions.push({ type: 'error', category: 'experience', title: '缺少工作经历', description: '工作经历是社招简历的核心模块，建议至少补充 1 段完整经历。', priority: 5, impact: 30 })
    } else {
      const weakExperiences = data.experience.filter((exp) => {
        const lines = exp.description.filter((line) => line.trim())
        return lines.length < 2 || !lines.some((line) => this.containsMetric(line) || this.containsResult(line))
      })
      if (weakExperiences.length > 0) suggestions.push({ type: 'warning', category: 'experience', title: '部分工作经历缺少结果导向表述', description: '建议每段经历至少写 3 条内容，并尽量补充指标、效率提升或业务结果。', priority: 5, impact: 18 })
      if (data.experience.flatMap((exp) => exp.description).some((line) => this.isWeakBullet(line))) suggestions.push({ type: 'info', category: 'experience', title: '经历描述偏泛', description: '少用“负责相关工作、参与项目开发”这类空泛表达，改成具体动作 + 结果。', priority: 3, impact: 8 })
    }

    if (data.education.length === 0) suggestions.push({ type: 'warning', category: 'education', title: '缺少教育背景', description: '建议至少补充学校、专业、学历和时间范围，增强简历完整度。', priority: 4, impact: 14 })
    if (data.skills.length < 5) suggestions.push({ type: 'info', category: 'skills', title: '技能模块还不够丰富', description: '建议保留 6-10 个与目标岗位最相关的核心技能，避免只写基础工具。', priority: 2, impact: 6 })
    if (data.skills.length > 0 && new Set(data.skills.map((s) => s.category.trim()).filter(Boolean)).size < 2) suggestions.push({ type: 'info', category: 'skills', title: '技能分类层次不明显', description: '可以按“语言 / 框架 / 工程化 / 业务能力”分组，增强招聘方扫读效率。', priority: 2, impact: 5 })

    if (data.projects.length === 0) {
      suggestions.push({ type: 'warning', category: 'projects', title: '缺少项目经验', description: '建议补充 1-2 个能代表岗位能力的项目，尤其是校招或技术岗位。', priority: 4, impact: 15 })
    } else {
      const weakProjects = data.projects.filter((project) => {
        const lines = project.highlights.filter((line) => line.trim())
        return lines.length < 2 || !lines.some((line) => this.containsMetric(line) || this.containsResult(line))
      })
      if (weakProjects.length > 0) suggestions.push({ type: 'warning', category: 'projects', title: '项目亮点不够突出', description: '建议突出你的角色、技术方案和业务收益，最好补充可量化结果。', priority: 4, impact: 12 })
    }

    if (scores.experience >= 85 && scores.projects >= 80 && scores.personalInfo >= 85) suggestions.push({ type: 'success', category: 'general', title: '简历核心模块质量较好', description: '你的核心内容已经具备较强投递基础，下一步可针对目标 JD 做关键词定制。', priority: 1, impact: 3 })

    return suggestions.sort((a, b) => (a.priority !== b.priority ? b.priority - a.priority : b.impact - a.impact))
  }

  private static calculateCompleteness(data: ResumeData): number {
    let total = 0
    let completed = 0
    const personalChecks = [
      Boolean(data.personalInfo.name?.trim()),
      Boolean(data.personalInfo.title?.trim()),
      EMAIL_PATTERN.test(data.personalInfo.email?.trim() ?? ''),
      Boolean(data.personalInfo.phone?.trim()),
      Boolean(data.personalInfo.location?.trim()),
      Boolean(data.personalInfo.summary?.trim()),
      (data.personalInfo.summary?.trim().length ?? 0) >= 60
    ]
    total += personalChecks.length
    completed += personalChecks.filter(Boolean).length
    total += 5
    completed += data.experience.length > 0 ? 1 : 0
    completed += data.experience.every((exp) => exp.description.filter((line) => line.trim()).length >= 2) ? 1 : 0
    completed += data.education.length > 0 ? 1 : 0
    completed += data.skills.length >= 4 ? 1 : 0
    completed += data.projects.length > 0 ? 1 : 0
    return Math.round((completed / total) * 100)
  }

  private static getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  static getGradeDescription(grade: string): string {
    const descriptions = {
      A: '优秀 - 已具备较强投递竞争力，可进一步做 JD 定制',
      B: '良好 - 核心信息完整，补强成果表达会更有说服力',
      C: '中等 - 内容基本齐全，但结果导向与亮点仍可增强',
      D: '及格 - 结构可用，但多处内容还比较泛，建议继续补充',
      F: '待完善 - 关键信息缺失较多，建议先补全核心模块'
    }
    return descriptions[grade as keyof typeof descriptions] || ''
  }

  static getSuggestionIcon(type: string): string {
    const icons = { error: '❌', warning: '⚠️', info: 'ℹ️', success: '✅' }
    return icons[type as keyof typeof icons] || 'ℹ️'
  }

  private static containsMetric(text: string): boolean { return METRIC_PATTERN.test(text) }
  private static containsResult(text: string): boolean { return RESULT_PATTERN.test(text) }
  private static containsActionVerb(text: string): boolean { return ACTION_VERBS.some((verb) => text.includes(verb)) }
  private static isWeakBullet(text: string): boolean { return WEAK_PHRASES.some((phrase) => text.includes(phrase)) }

  private static isStrongBullet(text: string): boolean {
    const normalized = text.trim()
    if (normalized.length < 18 || this.isWeakBullet(normalized)) return false
    let score = 0
    if (this.containsActionVerb(normalized)) score += 1
    if (this.containsMetric(normalized)) score += 1
    if (this.containsResult(normalized)) score += 1
    if (normalized.length >= 28) score += 1
    return score >= 2
  }
}
