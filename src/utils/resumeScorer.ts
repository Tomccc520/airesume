/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-10-04
 */

import { ResumeData } from '@/types/resume'

export interface ScoreResult {
  /** 总分 (0-100) */
  totalScore: number
  /** 各部分得分 */
  scores: {
    personalInfo: number
    experience: number
    education: number
    skills: number
    projects: number
  }
  /** 改进建议 */
  suggestions: Suggestion[]
  /** 完成度百分比 */
  completeness: number
  /** 质量等级 */
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface Suggestion {
  /** 建议类型 */
  type: 'error' | 'warning' | 'info' | 'success'
  /** 建议分类 */
  category: 'personalInfo' | 'experience' | 'education' | 'skills' | 'projects' | 'general'
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 优先级 (1-5, 5最高) */
  priority: number
  /** 预计提升分数 */
  impact: number
}

/**
 * 简历评分器
 * 分析简历质量并提供改进建议
 */
export class ResumeScorer {
  /**
   * 计算简历总分
   */
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
      scores.experience * 0.3 +
      scores.education * 0.2 +
      scores.skills * 0.15 +
      scores.projects * 0.15
    )

    const suggestions = this.generateSuggestions(data, scores)
    const completeness = this.calculateCompleteness(data)
    const grade = this.getGrade(totalScore)

    return {
      totalScore,
      scores,
      suggestions,
      completeness,
      grade
    }
  }

  /**
   * 评分个人信息 (满分100)
   */
  private static scorePersonalInfo(data: ResumeData): number {
    let score = 0
    const { personalInfo } = data

    // 必填字段 (60分)
    if (personalInfo.name) score += 15
    if (personalInfo.title) score += 15
    if (personalInfo.email) score += 15
    if (personalInfo.phone) score += 15

    // 可选字段 (20分)
    if (personalInfo.location) score += 10
    if (personalInfo.website) score += 10

    // 个人简介 (20分)
    if (personalInfo.summary) {
      const summaryLength = personalInfo.summary.length
      if (summaryLength >= 50 && summaryLength <= 300) {
        score += 20
      } else if (summaryLength > 0) {
        score += 10
      }
    }

    return Math.min(score, 100)
  }

  /**
   * 评分工作经历 (满分100)
   */
  private static scoreExperience(data: ResumeData): number {
    const { experience } = data
    
    if (experience.length === 0) return 0

    let score = 0

    // 有工作经历 (30分)
    score += 30

    // 经历数量 (20分)
    score += Math.min(experience.length * 5, 20)

    // 经历质量 (50分)
    experience.forEach(exp => {
      let expScore = 0

      // 基本信息完整
      if (exp.company) expScore += 2
      if (exp.position) expScore += 2
      if (exp.startDate) expScore += 2
      if (exp.location) expScore += 1

      // 描述质量
      if (exp.description && exp.description.length > 0) {
        const validDesc = exp.description.filter(d => d.trim().length > 0)
        if (validDesc.length >= 3) {
          expScore += 5
        } else if (validDesc.length > 0) {
          expScore += 2
        }

        // 描述长度
        const avgLength = validDesc.reduce((sum, d) => sum + d.length, 0) / validDesc.length
        if (avgLength >= 50) {
          expScore += 3
        }
      }

      score += Math.min(expScore, 10)
    })

    return Math.min(score, 100)
  }

  /**
   * 评分教育背景 (满分100)
   */
  private static scoreEducation(data: ResumeData): number {
    const { education } = data
    
    if (education.length === 0) return 0

    let score = 0

    // 有教育背景 (40分)
    score += 40

    // 教育数量 (20分)
    score += Math.min(education.length * 10, 20)

    // 教育质量 (40分)
    education.forEach(edu => {
      let eduScore = 0

      if (edu.school) eduScore += 3
      if (edu.degree) eduScore += 3
      if (edu.major) eduScore += 3
      if (edu.startDate) eduScore += 2
      if (edu.endDate) eduScore += 2
      if (edu.gpa) eduScore += 2
      if (edu.description) eduScore += 5

      score += Math.min(eduScore, 10)
    })

    return Math.min(score, 100)
  }

  /**
   * 评分技能 (满分100)
   */
  private static scoreSkills(data: ResumeData): number {
    const { skills } = data
    
    if (skills.length === 0) return 0

    let score = 0

    // 有技能 (30分)
    score += 30

    // 技能数量 (30分)
    if (skills.length >= 10) {
      score += 30
    } else if (skills.length >= 5) {
      score += 20
    } else {
      score += skills.length * 4
    }

    // 技能多样性 (20分)
    const categories = new Set(skills.map(s => s.category))
    score += Math.min(categories.size * 5, 20)

    // 技能等级分布 (20分)
    const levels = skills.map(s => s.level)
    const hasExpert = levels.some(level => level >= 90)  // expert level
    const hasAdvanced = levels.some(level => level >= 80 && level < 90)  // advanced level
    
    if (hasExpert) score += 10
    if (hasAdvanced) score += 10

    return Math.min(score, 100)
  }

  /**
   * 评分项目经验 (满分100)
   */
  private static scoreProjects(data: ResumeData): number {
    const { projects } = data
    
    if (projects.length === 0) return 0

    let score = 0

    // 有项目经验 (30分)
    score += 30

    // 项目数量 (20分)
    score += Math.min(projects.length * 5, 20)

    // 项目质量 (50分)
    projects.forEach(proj => {
      let projScore = 0

      if (proj.name) projScore += 2
      if (proj.description) projScore += 3
      if (proj.technologies && proj.technologies.length > 0) {
        projScore += Math.min(proj.technologies.length, 3)
      }
      if (proj.startDate) projScore += 1
      if (proj.url) projScore += 1
      if (proj.highlights && proj.highlights.length > 0) {
        projScore += Math.min(proj.highlights.length, 3)
      }

      score += Math.min(projScore, 10)
    })

    return Math.min(score, 100)
  }

  /**
   * 生成改进建议
   */
  private static generateSuggestions(data: ResumeData, scores: any): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 个人信息建议
    if (!data.personalInfo.name) {
      suggestions.push({
        type: 'error',
        category: 'personalInfo',
        title: '缺少姓名',
        description: '请填写您的姓名，这是简历最基本的信息',
        priority: 5,
        impact: 15
      })
    }

    if (!data.personalInfo.title) {
      suggestions.push({
        type: 'error',
        category: 'personalInfo',
        title: '缺少职位',
        description: '请填写您的目标职位或当前职位',
        priority: 5,
        impact: 15
      })
    }

    if (!data.personalInfo.summary || data.personalInfo.summary.length < 50) {
      suggestions.push({
        type: 'warning',
        category: 'personalInfo',
        title: '个人简介过短',
        description: '建议个人简介在50-300字之间，突出您的核心优势',
        priority: 4,
        impact: 10
      })
    }

    // 工作经历建议
    if (data.experience.length === 0) {
      suggestions.push({
        type: 'error',
        category: 'experience',
        title: '缺少工作经历',
        description: '添加工作经历可以大幅提升简历质量',
        priority: 5,
        impact: 30
      })
    } else {
      data.experience.forEach((exp, i) => {
        if (!exp.description || exp.description.length === 0) {
          suggestions.push({
            type: 'warning',
            category: 'experience',
            title: `第${i + 1}个工作经历缺少描述`,
            description: '详细描述您的工作内容和成果，建议3-5条',
            priority: 4,
            impact: 8
          })
        }
      })
    }

    // 教育背景建议
    if (data.education.length === 0) {
      suggestions.push({
        type: 'warning',
        category: 'education',
        title: '缺少教育背景',
        description: '添加教育背景信息可以提升简历完整度',
        priority: 4,
        impact: 20
      })
    }

    // 技能建议
    if (data.skills.length === 0) {
      suggestions.push({
        type: 'warning',
        category: 'skills',
        title: '缺少技能信息',
        description: '添加专业技能可以展示您的能力',
        priority: 3,
        impact: 15
      })
    } else if (data.skills.length < 5) {
      suggestions.push({
        type: 'info',
        category: 'skills',
        title: '技能数量较少',
        description: '建议添加5-10个相关技能',
        priority: 2,
        impact: 5
      })
    }

    // 项目经验建议
    if (data.projects.length === 0) {
      suggestions.push({
        type: 'info',
        category: 'projects',
        title: '缺少项目经验',
        description: '添加项目经验可以展示您的实践能力',
        priority: 3,
        impact: 15
      })
    }

    // 按优先级和影响力排序
    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return b.impact - a.impact
    })
  }

  /**
   * 计算完成度
   */
  private static calculateCompleteness(data: ResumeData): number {
    let total = 0
    let completed = 0

    // 个人信息 (7项)
    const personalFields = ['name', 'title', 'email', 'phone', 'location', 'website', 'summary']
    total += personalFields.length
    completed += personalFields.filter(f => 
      data.personalInfo[f as keyof typeof data.personalInfo]
    ).length

    // 工作经历
    total += 1
    if (data.experience.length > 0) completed += 1

    // 教育背景
    total += 1
    if (data.education.length > 0) completed += 1

    // 技能
    total += 1
    if (data.skills.length > 0) completed += 1

    // 项目经验
    total += 1
    if (data.projects.length > 0) completed += 1

    return Math.round((completed / total) * 100)
  }

  /**
   * 获取等级
   */
  private static getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 获取等级描述
   */
  static getGradeDescription(grade: string): string {
    const descriptions = {
      'A': '优秀 - 您的简历质量很高，可以直接投递',
      'B': '良好 - 简历质量不错，稍作优化会更好',
      'C': '中等 - 简历基本完整，但还有提升空间',
      'D': '及格 - 简历需要进一步完善',
      'F': '不及格 - 简历信息不完整，需要大幅改进'
    }
    return descriptions[grade as keyof typeof descriptions] || ''
  }

  /**
   * 获取建议类型的图标
   */
  static getSuggestionIcon(type: string): string {
    const icons = {
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️',
      'success': '✅'
    }
    return icons[type as keyof typeof icons] || 'ℹ️'
  }
}
