/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.04.14
 */

import { ResumeData } from '@/types/resume'

export type DeliveryCheckLevel = 'critical' | 'warning' | 'good'
export type DeliveryCheckCategory = 'contact' | 'summary' | 'experience' | 'projects' | 'skills' | 'general'

export interface DeliveryCheckItem {
  id: string
  level: DeliveryCheckLevel
  category: DeliveryCheckCategory
  title: string
  description: string
}

export interface DeliveryCheckResult {
  readyScore: number
  criticalCount: number
  warningCount: number
  goodCount: number
  items: DeliveryCheckItem[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const METRIC_PATTERN = /(\d+\s*%|\d+\s*个|\d+\s*项|\d+\s*人|\d+\s*页|\d+\s*秒|\d+\s*天|\d+\s*周|\d+\s*月|\d+\+|提升|降低|缩短|增长|减少|improve|reduce|increase|shorten)/i
const WEAK_PATTERN = /(负责相关工作|参与相关工作|协助完成|日常维护|参与项目开发|负责项目开发)/

/**
 * 生成投递前检查结果
 * 聚焦招聘前最后一轮自检，输出可直接展示给用户的结构化结果。
 */
export function analyzeDeliveryReadiness(resumeData: ResumeData): DeliveryCheckResult {
  const items: DeliveryCheckItem[] = []
  const summary = resumeData.personalInfo.summary?.trim() ?? ''
  const experienceLines = resumeData.experience.flatMap((item) => item.description).filter((item) => item.trim())
  const projectLines = resumeData.projects.flatMap((item) => item.highlights).filter((item) => item.trim())

  if (!EMAIL_PATTERN.test(resumeData.personalInfo.email?.trim() ?? '') || !resumeData.personalInfo.phone?.trim()) {
    items.push({
      id: 'contact-missing',
      level: 'critical',
      category: 'contact',
      title: '联系方式还不完整',
      description: '请确认邮箱格式正确、手机号已填写，避免招聘方无法联系到你。'
    })
  } else {
    items.push({
      id: 'contact-ready',
      level: 'good',
      category: 'contact',
      title: '联系方式检查通过',
      description: '邮箱与电话都已具备，可满足基础投递要求。'
    })
  }

  if (summary.length < 60) {
    items.push({
      id: 'summary-short',
      level: 'warning',
      category: 'summary',
      title: '个人简介偏短',
      description: '建议补充 80-200 字，覆盖工作年限、核心优势、代表成果与目标岗位。'
    })
  } else if (!METRIC_PATTERN.test(summary)) {
    items.push({
      id: 'summary-no-metric',
      level: 'warning',
      category: 'summary',
      title: '个人简介缺少成果量化',
      description: '可以加入“性能提升 40%”“交付效率提升 30%”等结果，让开场更有说服力。'
    })
  } else {
    items.push({
      id: 'summary-strong',
      level: 'good',
      category: 'summary',
      title: '个人简介具备投递说服力',
      description: '简介已包含核心能力与结果表达，适合作为招聘者首屏扫读内容。'
    })
  }

  if (resumeData.experience.length === 0) {
    items.push({
      id: 'experience-empty',
      level: 'critical',
      category: 'experience',
      title: '缺少工作经历',
      description: '社招简历建议至少补充 1 段完整经历，包含职责、动作和结果。'
    })
  } else {
    const weakExperienceCount = resumeData.experience.filter((item) => {
      const lines = item.description.filter((line) => line.trim())
      return lines.length < 2 || !lines.some((line) => METRIC_PATTERN.test(line))
    }).length

    if (weakExperienceCount > 0) {
      items.push({
        id: 'experience-weak',
        level: 'warning',
        category: 'experience',
        title: '部分工作经历缺少结果表达',
        description: '建议每段经历至少写 2-3 条，并补充效率提升、业务增长、项目规模等量化结果。'
      })
    } else {
      items.push({
        id: 'experience-strong',
        level: 'good',
        category: 'experience',
        title: '工作经历表达较完整',
        description: '工作经历已具备动作与结果表达，较符合招聘者快速筛选习惯。'
      })
    }
  }

  if (experienceLines.some((line) => WEAK_PATTERN.test(line))) {
    items.push({
      id: 'experience-vague',
      level: 'warning',
      category: 'experience',
      title: '存在偏空泛的经历表述',
      description: '尽量少用“参与相关工作、负责项目开发”，改成具体动作 + 结果。'
    })
  }

  if (resumeData.projects.length === 0) {
    items.push({
      id: 'project-empty',
      level: 'warning',
      category: 'projects',
      title: '项目经历不足',
      description: '建议补 1-2 个代表项目，尤其适合技术岗、校招和需要证明实战能力的岗位。'
    })
  } else {
    const weakProjectCount = resumeData.projects.filter((item) => {
      const lines = item.highlights.filter((line) => line.trim())
      return lines.length < 2 || !lines.some((line) => METRIC_PATTERN.test(line))
    }).length

    if (weakProjectCount > 0) {
      items.push({
        id: 'project-weak',
        level: 'warning',
        category: 'projects',
        title: '项目亮点还不够突出',
        description: '建议明确你的角色、技术方案和业务收益，最好补充量化成果。'
      })
    } else {
      items.push({
        id: 'project-strong',
        level: 'good',
        category: 'projects',
        title: '项目亮点具备展示价值',
        description: '项目模块已能支撑面试追问，可继续针对目标岗位做关键词微调。'
      })
    }
  }

  if (resumeData.skills.length < 5) {
    items.push({
      id: 'skills-few',
      level: 'warning',
      category: 'skills',
      title: '技能模块偏少',
      description: '建议保留 6-10 个与岗位最相关的技能，并尽量按类别分组。'
    })
  } else {
    items.push({
      id: 'skills-ready',
      level: 'good',
      category: 'skills',
      title: '技能模块数量合理',
      description: '技能数量已达到基础投递要求，注意继续保持与目标岗位的相关性。'
    })
  }

  if (!experienceLines.some((line) => METRIC_PATTERN.test(line)) && !projectLines.some((line) => METRIC_PATTERN.test(line))) {
    items.push({
      id: 'global-no-metric',
      level: 'critical',
      category: 'general',
      title: '简历整体缺少量化结果',
      description: '建议至少补充 2-3 处数字成果，如增长、降本、提效、覆盖规模、响应时间等。'
    })
  }

  const criticalCount = items.filter((item) => item.level === 'critical').length
  const warningCount = items.filter((item) => item.level === 'warning').length
  const goodCount = items.filter((item) => item.level === 'good').length
  const readyScore = Math.max(0, Math.min(100, 100 - criticalCount * 18 - warningCount * 8 + goodCount * 2))

  return {
    readyScore,
    criticalCount,
    warningCount,
    goodCount,
    items
  }
}
