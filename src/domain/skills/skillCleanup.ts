/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { Skill } from '@/types/resume'
import {
  getSkillCategoryOptions,
  inferSkillCategory,
  parseQuickSkillTokens,
  SkillClassificationLocale
} from '@/domain/skills/skillClassification'

interface SkillAliasDefinition {
  canonicalName: string
  aliases: string[]
}

export interface SkillCleanupChange {
  type: 'rename' | 'merge'
  skillId: string
  skillName: string
  nextName: string
  removedSkillIds?: string[]
  removedSkillNames?: string[]
}

export interface SkillCleanupPlan {
  changes: SkillCleanupChange[]
  nextSkills: Skill[]
}

export type QuickAddSkillEntryStatus = 'new' | 'merge-existing' | 'merge-input'

export interface QuickAddSkillEntry {
  inputName: string
  nextName: string
  category: string
  status: QuickAddSkillEntryStatus
  mergeTargetName?: string
}

export interface QuickAddSkillGroup {
  category: string
  skillNames: string[]
}

export interface QuickAddSkillDraft {
  name: string
  category: string
}

export interface QuickAddSkillPlan {
  entries: QuickAddSkillEntry[]
  groups: QuickAddSkillGroup[]
  additions: QuickAddSkillDraft[]
}

const SKILL_ALIAS_DEFINITIONS: SkillAliasDefinition[] = [
  {
    canonicalName: 'React',
    aliases: ['react', 'reactjs', 'react.js', 'react js']
  },
  {
    canonicalName: 'Next.js',
    aliases: ['next', 'nextjs', 'next.js', 'next js']
  },
  {
    canonicalName: 'Vue',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue js']
  },
  {
    canonicalName: 'Node.js',
    aliases: ['node', 'nodejs', 'node.js', 'node js']
  },
  {
    canonicalName: 'JavaScript',
    aliases: ['javascript', 'java script', 'js']
  },
  {
    canonicalName: 'TypeScript',
    aliases: ['typescript', 'type script', 'ts']
  },
  {
    canonicalName: 'Figma',
    aliases: ['figma']
  }
]

/**
 * 获取技能规范名称
 * 将常见别名统一为更适合简历展示的标准技能名。
 */
export function getCanonicalSkillName(name: string): string {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return ''
  }

  const normalizedKey = normalizeSkillLookupKey(trimmedName)
  const matchedDefinition = SKILL_ALIAS_DEFINITIONS.find((definition) =>
    definition.aliases.some((alias) => normalizeSkillLookupKey(alias) === normalizedKey)
  )

  return matchedDefinition?.canonicalName || trimmedName
}

/**
 * 生成技能清理计划
 * 对同义技能做名称规范化，并对明显重复项进行合并。
 */
export function buildSkillCleanupPlan(skills: Skill[]): SkillCleanupPlan {
  const groupedSkills = new Map<string, { canonicalName: string; items: Skill[] }>()

  skills.forEach((skill) => {
    const canonicalName = getCanonicalSkillName(skill.name)
    const lookupKey = canonicalName
      ? normalizeSkillLookupKey(canonicalName)
      : `empty-${skill.id}`

    const currentGroup = groupedSkills.get(lookupKey)
    if (currentGroup) {
      currentGroup.items.push(skill)
      return
    }

    groupedSkills.set(lookupKey, {
      canonicalName,
      items: [skill]
    })
  })

  const changes: SkillCleanupChange[] = []
  const nextSkills: Skill[] = []

  groupedSkills.forEach(({ canonicalName, items }) => {
    if (items.length === 1) {
      const currentSkill = items[0]
      if (canonicalName && canonicalName !== currentSkill.name.trim()) {
        changes.push({
          type: 'rename',
          skillId: currentSkill.id,
          skillName: currentSkill.name,
          nextName: canonicalName
        })
        nextSkills.push({
          ...currentSkill,
          name: canonicalName
        })
        return
      }

      nextSkills.push(currentSkill)
      return
    }

    const mergedSkill = mergeSkillGroup(items, canonicalName || items[0].name.trim())
    changes.push({
      type: 'merge',
      skillId: mergedSkill.id,
      skillName: items[0].name,
      nextName: mergedSkill.name,
      removedSkillIds: items.slice(1).map((item) => item.id),
      removedSkillNames: items.slice(1).map((item) => item.name)
    })
    nextSkills.push(mergedSkill)
  })

  return {
    changes,
    nextSkills
  }
}

/**
 * 生成批量添加技能预览
 * 在真正写入前提示哪些技能会新增、哪些会并入现有或本次输入中的同义项。
 */
export function buildQuickAddSkillPlan(
  skills: Skill[],
  input: string,
  locale: SkillClassificationLocale
): QuickAddSkillPlan {
  const tokens = parseQuickSkillTokens(input)
  const existingCanonicalNameMap = new Map<string, string>()
  const pendingDraftMap = new Map<string, QuickAddSkillDraft>()
  const entries: QuickAddSkillEntry[] = []

  skills.forEach((skill) => {
    const canonicalName = getCanonicalSkillName(skill.name) || skill.name.trim()
    if (!canonicalName) {
      return
    }

    const lookupKey = normalizeSkillLookupKey(canonicalName)
    if (!existingCanonicalNameMap.has(lookupKey)) {
      existingCanonicalNameMap.set(lookupKey, canonicalName)
    }
  })

  tokens.forEach((token) => {
    const nextName = getCanonicalSkillName(token) || token.trim()
    if (!nextName) {
      return
    }

    const lookupKey = normalizeSkillLookupKey(nextName)
    const category = inferSkillCategory(nextName, locale)
    const existingCanonicalName = existingCanonicalNameMap.get(lookupKey)

    if (existingCanonicalName) {
      entries.push({
        inputName: token,
        nextName: existingCanonicalName,
        category,
        status: 'merge-existing',
        mergeTargetName: existingCanonicalName
      })
      return
    }

    const pendingDraft = pendingDraftMap.get(lookupKey)
    if (pendingDraft) {
      entries.push({
        inputName: token,
        nextName: pendingDraft.name,
        category: pendingDraft.category,
        status: 'merge-input',
        mergeTargetName: pendingDraft.name
      })
      return
    }

    const draft: QuickAddSkillDraft = {
      name: nextName,
      category
    }

    pendingDraftMap.set(lookupKey, draft)
    entries.push({
      inputName: token,
      nextName,
      category,
      status: 'new'
    })
  })

  const groupedDraftMap = new Map<string, QuickAddSkillDraft[]>()
  Array.from(pendingDraftMap.values()).forEach((draft) => {
    const currentDrafts = groupedDraftMap.get(draft.category)
    if (currentDrafts) {
      currentDrafts.push(draft)
      return
    }

    groupedDraftMap.set(draft.category, [draft])
  })

  const categoryOrder = getSkillCategoryOptions(locale)
  const groups = Array.from(groupedDraftMap.entries())
    .sort(([currentCategory], [nextCategory]) => {
      const currentIndex = categoryOrder.indexOf(currentCategory)
      const nextIndex = categoryOrder.indexOf(nextCategory)
      const normalizedCurrentIndex = currentIndex === -1 ? Number.MAX_SAFE_INTEGER : currentIndex
      const normalizedNextIndex = nextIndex === -1 ? Number.MAX_SAFE_INTEGER : nextIndex
      return normalizedCurrentIndex - normalizedNextIndex
    })
    .map(([category, drafts]) => ({
      category,
      skillNames: drafts.map((draft) => draft.name)
    }))

  return {
    entries,
    groups,
    additions: groups.flatMap((group) =>
      group.skillNames.map((skillName) => ({
        name: skillName,
        category: group.category
      }))
    )
  }
}

/**
 * 合并同一技能组
 * 优先保留锁定项的分类，其余字段采用对招聘展示更稳定的合并策略。
 */
function mergeSkillGroup(items: Skill[], canonicalName: string): Skill {
  const preferredCategorySkill = [...items].sort((current, next) => {
    return Number(next.categoryLocked) - Number(current.categoryLocked) || next.level - current.level
  })[0]

  return {
    ...items[0],
    name: canonicalName,
    level: Math.max(...items.map((item) => item.level)),
    category: preferredCategorySkill.category,
    categoryLocked: items.some((item) => item.categoryLocked),
    color: items.find((item) => item.color)?.color
  }
}

/**
 * 生成技能查找键
 * 忽略空格、点号、短横线和斜杠，降低同义写法导致的重复概率。
 */
function normalizeSkillLookupKey(name: string): string {
  return name.trim().toLowerCase().replace(/[\s./_-]+/g, '')
}
