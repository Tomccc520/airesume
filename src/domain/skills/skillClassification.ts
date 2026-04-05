/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { Skill } from '@/types/resume'

export type SkillClassificationLocale = 'zh' | 'en'

export type SkillCategoryKey =
  | 'frontend'
  | 'backend'
  | 'data'
  | 'product'
  | 'design'
  | 'general'

interface SkillCategoryDefinition {
  key: SkillCategoryKey
  labels: Record<SkillClassificationLocale, string>
  namePatterns: string[]
  categoryAliases: string[]
}

export interface SkillReclassificationChange {
  skillId: string
  skillName: string
  previousCategory: string
  nextCategory: string
}

export interface SkillReclassificationPlan {
  changes: SkillReclassificationChange[]
  nextSkills: Skill[]
}

const SKILL_CATEGORY_DEFINITIONS: SkillCategoryDefinition[] = [
  {
    key: 'frontend',
    labels: { zh: '前端开发', en: 'Frontend' },
    namePatterns: ['react', 'vue', 'next', 'javascript', 'typescript', 'css', 'html', '前端', '小程序'],
    categoryAliases: ['前端开发', 'frontend', '前端框架', 'web 前端', 'web frontend', '编程语言']
  },
  {
    key: 'backend',
    labels: { zh: '后端开发', en: 'Backend' },
    namePatterns: ['node', 'java', 'go', 'python', '后端', 'api', '数据库', 'mysql', 'redis', 'server'],
    categoryAliases: ['后端开发', 'backend', '后端技术', '服务端', 'server', 'database', '数据库']
  },
  {
    key: 'data',
    labels: { zh: '数据分析', en: 'Data' },
    namePatterns: ['数据分析', 'sql', 'bi', 'tableau', 'power bi', '埋点', '报表', '增长分析', 'analytics', 'reporting'],
    categoryAliases: ['数据分析', 'data', 'analytics', '商业分析', '数据能力']
  },
  {
    key: 'product',
    labels: { zh: '产品能力', en: 'Product' },
    namePatterns: ['prd', '需求', '产品', 'roadmap', '用户研究', '原型', 'axure', 'product', 'requirement'],
    categoryAliases: ['产品能力', 'product', '产品设计', '产品经理']
  },
  {
    key: 'design',
    labels: { zh: '设计能力', en: 'Design' },
    namePatterns: ['figma', 'sketch', '视觉设计', '交互设计', 'ui', 'ux', '设计系统', 'visual design', 'interaction design'],
    categoryAliases: ['设计能力', 'design', '视觉设计', '交互设计', '设计系统', 'ui 设计', 'ux 设计']
  },
  {
    key: 'general',
    labels: { zh: '通用能力', en: 'General' },
    namePatterns: ['沟通', '协调', '协作', '管理', '推进', '复盘', '表达', 'leadership', 'communication', 'collaboration', 'management'],
    categoryAliases: ['通用能力', 'general', '核心能力', '软技能', '协作能力', '工程化', '综合能力']
  }
]

/**
 * 解析批量技能输入
 * 支持逗号、分号和换行混输，并自动去重。
 */
export function parseQuickSkillTokens(input: string): string[] {
  const tokens = input
    .split(/[\n,，;；]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const normalized = new Set<string>()
  const result: string[] = []

  tokens.forEach((token) => {
    const key = token.toLowerCase()
    if (!normalized.has(key)) {
      normalized.add(key)
      result.push(token)
    }
  })

  return result
}

/**
 * 获取默认技能分类
 * 新增空白技能时统一回退到更中性的通用能力。
 */
export function getDefaultSkillCategory(locale: SkillClassificationLocale): string {
  return getCategoryLabel('general', locale)
}

/**
 * 获取系统分类标签
 * 统一对外暴露当前语言下的六大类名称。
 */
export function getSkillCategoryOptions(locale: SkillClassificationLocale): string[] {
  return SKILL_CATEGORY_DEFINITIONS.map((definition) => definition.labels[locale])
}

/**
 * 推断技能推荐分类
 * 根据技能名中的常见关键词映射到更合适的系统分类。
 */
export function inferSkillCategory(name: string, locale: SkillClassificationLocale): string {
  const matchedDefinition = matchCategoryBySkillName(name)
  if (!matchedDefinition) {
    return getDefaultSkillCategory(locale)
  }
  return matchedDefinition.labels[locale]
}

/**
 * 生成技能重整计划
 * 只对明显错位或系统默认分类的条目生成建议，避免覆盖已有细分分类体系。
 */
export function buildSkillReclassificationPlan(
  skills: Skill[],
  locale: SkillClassificationLocale
): SkillReclassificationPlan {
  const changes: SkillReclassificationChange[] = []
  const nextSkills = skills.map((skill) => {
    if (skill.categoryLocked) {
      return skill
    }

    const recommendedCategory = inferSkillCategory(skill.name, locale)
    if (!shouldRecommendCategoryChange(skill.category, skill.name, recommendedCategory, locale)) {
      return skill
    }

    changes.push({
      skillId: skill.id,
      skillName: skill.name,
      previousCategory: skill.category,
      nextCategory: recommendedCategory
    })

    return {
      ...skill,
      category: recommendedCategory
    }
  })

  return {
    changes,
    nextSkills
  }
}

/**
 * 判断是否应该推荐分类变更
 * 当前为空、属于系统粗分类、或当前分类家族与推荐家族明显冲突时才建议调整。
 */
export function shouldRecommendCategoryChange(
  currentCategory: string,
  skillName: string,
  recommendedCategory: string,
  locale: SkillClassificationLocale
): boolean {
  const normalizedCurrentCategory = currentCategory.trim()
  if (!skillName.trim()) {
    return false
  }

  if (!normalizedCurrentCategory) {
    return true
  }

  if (normalizedCurrentCategory === recommendedCategory) {
    return false
  }

  const currentFamily = resolveCategoryFamily(normalizedCurrentCategory)
  const recommendedFamily = resolveCategoryFamily(recommendedCategory)
  const isSystemCategory = getSkillCategoryOptions(locale).includes(normalizedCurrentCategory)

  if (isSystemCategory) {
    return currentFamily !== recommendedFamily
  }

  if (!currentFamily || !recommendedFamily) {
    return false
  }

  return currentFamily !== recommendedFamily
}

/**
 * 解析分类所属家族
 * 兼容中英文标签和常见细分命名，便于判断当前分类是否明显错位。
 */
export function resolveCategoryFamily(category: string): SkillCategoryKey | null {
  const normalizedCategory = category.trim().toLowerCase()
  if (!normalizedCategory) {
    return null
  }

  const matchedDefinition = SKILL_CATEGORY_DEFINITIONS.find((definition) =>
    definition.categoryAliases.some((alias) => normalizedCategory.includes(alias.toLowerCase()))
  )

  return matchedDefinition?.key || null
}

/**
 * 根据技能名匹配分类定义
 * 找到首个命中的分类家族，供推断和重整计划复用。
 */
function matchCategoryBySkillName(name: string): SkillCategoryDefinition | null {
  const normalizedName = name.trim().toLowerCase()
  if (!normalizedName) {
    return null
  }

  const matchedDefinition = SKILL_CATEGORY_DEFINITIONS.find((definition) =>
    definition.namePatterns.some((pattern) => normalizedName.includes(pattern))
  )

  return matchedDefinition || null
}

/**
 * 获取分类标签
 * 基于分类 key 返回当前语言环境对应的展示名称。
 */
function getCategoryLabel(categoryKey: SkillCategoryKey, locale: SkillClassificationLocale): string {
  return SKILL_CATEGORY_DEFINITIONS.find((definition) => definition.key === categoryKey)?.labels[locale]
    || SKILL_CATEGORY_DEFINITIONS.find((definition) => definition.key === 'general')!.labels[locale]
}
