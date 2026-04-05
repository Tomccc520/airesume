/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { StyleConfig, defaultStyleConfig } from '@/contexts/StyleContext'
import { getCanonicalSkillName } from '@/domain/skills/skillCleanup'
import { ColorScheme } from '@/hooks/useColorSchemes'
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project } from '@/types/resume'

export type ImportMode = 'replace' | 'merge'
export type ImportResumeSection = 'personalInfo' | 'experience' | 'education' | 'skills' | 'projects'
export type ImportConflictAction = 'skip' | 'merge' | 'append'

export interface ExperienceMergeFieldSelection {
  dates: boolean
  location: boolean
  description: boolean
}

export interface ProjectMergeFieldSelection {
  dates: boolean
  description: boolean
  technologies: boolean
  highlights: boolean
  url: boolean
}

const EXPERIENCE_MERGE_FIELD_LABELS: Record<keyof ExperienceMergeFieldSelection, string> = {
  dates: '时间',
  location: '地点',
  description: '职责'
}

const PROJECT_MERGE_FIELD_LABELS: Record<keyof ProjectMergeFieldSelection, string> = {
  dates: '时间',
  description: '简介',
  technologies: '技术栈',
  highlights: '亮点',
  url: '链接'
}

export interface ImportSelection {
  includeResumeData: boolean
  includeStyleConfig: boolean
  includeColorSchemes: boolean
  resumeSections: ImportResumeSection[]
  experienceConflictActions: Record<string, ImportConflictAction>
  projectConflictActions: Record<string, ImportConflictAction>
  experienceMergeFields: Record<string, ExperienceMergeFieldSelection>
  projectMergeFields: Record<string, ProjectMergeFieldSelection>
}

export interface ImportImpactItem {
  key: string
  title: string
  description: string
  type: 'content' | 'style' | 'palette'
  details?: string[]
}

export interface ImportConflictEntry {
  id: string
  label: string
  identity: string
  diffDetails: string[]
  detailSections: ImportConflictDetailSection[]
  comparisonSections: ImportConflictComparisonSection[]
}

export interface ImportConflictDetailSection {
  title: string
  items: string[]
}

export interface ImportConflictComparisonSection {
  title: string
  currentItems: string[]
  importedItems: string[]
}

export interface ImportConflictSummaryItem {
  duplicateNames: string[]
  duplicateCount: number
  duplicateEntries: ImportConflictEntry[]
}

export interface ImportConflictSummary {
  experience: ImportConflictSummaryItem
  projects: ImportConflictSummaryItem
}

type ImportedResumeLike = Partial<ResumeData> & {
  experience?: Array<Partial<Experience> & { description?: string[] | string }>
  projects?: Array<Partial<Project> & { technologies?: string[] | string; link?: string }>
}
type ImportedProjectLike = Partial<Project> & { technologies?: string[] | string; link?: string }

const ALL_IMPORT_RESUME_SECTIONS: ImportResumeSection[] = ['personalInfo', 'experience', 'education', 'skills', 'projects']
const PERSONAL_INFO_FIELD_LABELS: Record<keyof PersonalInfo, string> = {
  name: '姓名',
  title: '职位',
  email: '邮箱',
  phone: '电话',
  location: '城市',
  website: '主页',
  contactQRCode: '联系二维码',
  summary: '个人简介',
  avatar: '头像',
  avatarBorderRadius: '头像圆角'
}

/**
 * 生成导入条目的唯一 ID
 * 使用时间戳和随机串组合，避免不同来源导入时产生冲突。
 */
function buildImportedId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 将未知值规范化为字符串
 * 导入旧版本数据时允许缺字段，并统一转成编辑器可消费的字符串。
 */
function toSafeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/**
 * 将描述文本拆分为列表
 * 兼容旧导出中的单字符串描述和当前结构中的字符串数组。
 */
function normalizeDescriptionList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toSafeString(item).trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

/**
 * 将技术栈字段拆分为数组
 * 兼容字符串、数组和中英文分隔符，避免导入后项目技术栈丢失结构。
 */
function normalizeTechnologyList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toSafeString(item).trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n，/]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

/**
 * 规范化可比较文本
 * 用于导入冲突检测，忽略大小写、空格和常见分隔符带来的表面差异。
 */
function normalizeComparableText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\-_/\\.·()（）]+/g, '')
}

/**
 * 获取条目新增列表项
 * 用于抽取导入内容中相对当前版本新增的职责、亮点和技术栈。
 */
function getAddedListItems(currentItems: string[], importedItems: string[]): string[] {
  const currentIdentitySet = new Set(
    currentItems
      .map((item) => normalizeComparableText(item))
      .filter(Boolean)
  )

  return importedItems.filter((item) => {
    const identity = normalizeComparableText(item)
    return Boolean(identity) && !currentIdentitySet.has(identity)
  })
}

/**
 * 合并列表项
 * 保留当前内容顺序，并将导入中的新增项追加到末尾。
 */
function mergeListItems(currentItems: string[], importedItems: string[]): string[] {
  return [...currentItems, ...getAddedListItems(currentItems, importedItems)]
}

/**
 * 创建差异分组
 * 统一过滤空项，避免 UI 层额外处理空分组。
 */
function createDetailSection(title: string, items: string[]): ImportConflictDetailSection | null {
  const normalizedItems = items
    .map((item) => item.trim())
    .filter(Boolean)

  if (normalizedItems.length === 0) {
    return null
  }

  return {
    title,
    items: normalizedItems
  }
}

/**
 * 创建双列对比分组
 * 将当前版本与导入版本整理成统一结构，供弹窗展开区直接渲染左右对比。
 */
function createComparisonSection(
  title: string,
  currentItems: string[],
  importedItems: string[]
): ImportConflictComparisonSection | null {
  const normalizedCurrentItems = currentItems
    .map((item) => item.trim())
    .filter(Boolean)
  const normalizedImportedItems = importedItems
    .map((item) => item.trim())
    .filter(Boolean)

  if (normalizedCurrentItems.length === 0 && normalizedImportedItems.length === 0) {
    return null
  }

  return {
    title,
    currentItems: normalizedCurrentItems,
    importedItems: normalizedImportedItems
  }
}

/**
 * 获取默认的工作经历合并字段
 * 默认开启时间、地点和职责合并，保证首次导入就具备完整的增量合并能力。
 */
function getDefaultExperienceMergeFields(): ExperienceMergeFieldSelection {
  return {
    dates: true,
    location: true,
    description: true
  }
}

/**
 * 获取默认的项目合并字段
 * 默认开启项目主信息、技术栈、亮点和链接合并，减少用户首次配置成本。
 */
function getDefaultProjectMergeFields(): ProjectMergeFieldSelection {
  return {
    dates: true,
    description: true,
    technologies: true,
    highlights: true,
    url: true
  }
}

/**
 * 读取工作经历的字段级合并配置
 * 若当前条目未单独配置，则回退到全部开启的默认策略。
 */
function getExperienceMergeFields(
  mergeFieldMap: Record<string, ExperienceMergeFieldSelection>,
  entryId: string
): ExperienceMergeFieldSelection {
  return {
    ...getDefaultExperienceMergeFields(),
    ...(mergeFieldMap[entryId] || {})
  }
}

/**
 * 读取项目的字段级合并配置
 * 若当前条目未单独配置，则回退到全部开启的默认策略。
 */
function getProjectMergeFields(
  mergeFieldMap: Record<string, ProjectMergeFieldSelection>,
  entryId: string
): ProjectMergeFieldSelection {
  return {
    ...getDefaultProjectMergeFields(),
    ...(mergeFieldMap[entryId] || {})
  }
}

/**
 * 获取已启用的工作经历合并字段名称
 * 将布尔字段配置转换为可展示的中文字段名，便于写入导入摘要。
 */
function getEnabledExperienceMergeFieldLabels(
  mergeFields: ExperienceMergeFieldSelection
): string[] {
  return (Object.keys(EXPERIENCE_MERGE_FIELD_LABELS) as Array<keyof ExperienceMergeFieldSelection>)
    .filter((field) => mergeFields[field])
    .map((field) => EXPERIENCE_MERGE_FIELD_LABELS[field])
}

/**
 * 获取已启用的项目合并字段名称
 * 将布尔字段配置转换为可展示的中文字段名，便于写入导入摘要。
 */
function getEnabledProjectMergeFieldLabels(
  mergeFields: ProjectMergeFieldSelection
): string[] {
  return (Object.keys(PROJECT_MERGE_FIELD_LABELS) as Array<keyof ProjectMergeFieldSelection>)
    .filter((field) => mergeFields[field])
    .map((field) => PROJECT_MERGE_FIELD_LABELS[field])
}

/**
 * 构建字段级合并摘要
 * 将“合并新增”动作进一步细化到字段范围，让导入影响摘要能明确告诉用户会合并什么。
 */
function buildMergeFieldDetailLine(label: string, enabledFieldLabels: string[]): string {
  return enabledFieldLabels.length > 0
    ? `字段合并：${label}（${enabledFieldLabels.join('、')}）`
    : `字段合并：${label}（当前未选择任何字段）`
}

/**
 * 获取工作经历的字段级合并摘要
 * 仅为当前选择“合并新增”的重复岗位生成字段级说明。
 */
function getExperienceMergeFieldDetailLines(
  duplicateEntries: ImportConflictEntry[],
  actionMap: Record<string, ImportConflictAction>,
  mergeFieldMap: Record<string, ExperienceMergeFieldSelection>
): string[] {
  return duplicateEntries
    .filter((entry) => getConflictAction(actionMap, entry.id) === 'merge')
    .map((entry) => buildMergeFieldDetailLine(
      entry.label,
      getEnabledExperienceMergeFieldLabels(getExperienceMergeFields(mergeFieldMap, entry.id))
    ))
}

/**
 * 获取项目的字段级合并摘要
 * 仅为当前选择“合并新增”的同名项目生成字段级说明。
 */
function getProjectMergeFieldDetailLines(
  duplicateEntries: ImportConflictEntry[],
  actionMap: Record<string, ImportConflictAction>,
  mergeFieldMap: Record<string, ProjectMergeFieldSelection>
): string[] {
  return duplicateEntries
    .filter((entry) => getConflictAction(actionMap, entry.id) === 'merge')
    .map((entry) => buildMergeFieldDetailLine(
      entry.label,
      getEnabledProjectMergeFieldLabels(getProjectMergeFields(mergeFieldMap, entry.id))
    ))
}

/**
 * 获取冲突条目的处理动作
 * 未显式设置时默认使用“合并新增”，避免重复项直接被整条追加。
 */
function getConflictAction(
  actionMap: Record<string, ImportConflictAction>,
  entryId: string
): ImportConflictAction {
  return actionMap[entryId] || 'merge'
}

/**
 * 统计冲突条目的处理动作数量
 * 供导入影响摘要和冲突提示统一计算“跳过 / 合并 / 保留重复”数量。
 */
function getConflictActionStats(
  duplicateEntries: ImportConflictEntry[],
  actionMap: Record<string, ImportConflictAction>
): {
  skipCount: number
  mergeCount: number
  appendCount: number
} {
  return duplicateEntries.reduce((stats, entry) => {
    const action = getConflictAction(actionMap, entry.id)

    if (action === 'skip') {
      stats.skipCount += 1
    } else if (action === 'append') {
      stats.appendCount += 1
    } else {
      stats.mergeCount += 1
    }

    return stats
  }, {
    skipCount: 0,
    mergeCount: 0,
    appendCount: 0
  })
}

/**
 * 获取指定动作下的冲突条目名称
 * 将已选择的处理方式回写到摘要文案中，帮助用户确认本次导入策略。
 */
function getConflictEntryLabelsByAction(
  duplicateEntries: ImportConflictEntry[],
  actionMap: Record<string, ImportConflictAction>,
  action: ImportConflictAction
): string[] {
  return duplicateEntries
    .filter((entry) => getConflictAction(actionMap, entry.id) === action)
    .map((entry) => entry.label)
}

/**
 * 构建重复项处理说明
 * 在合并模式下输出“新增 / 合并 / 跳过 / 保留重复”的最终导入结果。
 */
function buildConflictActionDescription(input: {
  currentCount: number
  importedCount: number
  nonDuplicateCount: number
  skipCount: number
  mergeCount: number
  appendCount: number
  appendedLabel: string
  mergedLabel: string
  skippedLabel: string
  fallbackLabel: string
}): string {
  const {
    currentCount,
    importedCount,
    nonDuplicateCount,
    skipCount,
    mergeCount,
    appendCount,
    appendedLabel,
    mergedLabel,
    skippedLabel,
    fallbackLabel
  } = input
  const descriptionSegments: string[] = []
  const appendedCount = nonDuplicateCount + appendCount

  if (appendedCount > 0) {
    descriptionSegments.push(`追加 ${appendedCount} ${appendedLabel}`)
  }

  if (mergeCount > 0) {
    descriptionSegments.push(`合并 ${mergeCount} ${mergedLabel}`)
  }

  if (skipCount > 0) {
    descriptionSegments.push(`跳过 ${skipCount} ${skippedLabel}`)
  }

  if (descriptionSegments.length === 0) {
    return `将向当前 ${currentCount} 条记录后追加 ${importedCount} 条${fallbackLabel}。`
  }

  return `将基于当前 ${currentCount} 条记录，${descriptionSegments.join('，')}。`
}

/**
 * 格式化时间区间
 * 将开始和结束时间统一转成可读文案，便于在差异摘要中直接展示。
 */
function formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
  const nextStartDate = toSafeString(startDate).trim()
  const nextEndDate = current ? '至今' : toSafeString(endDate).trim()

  if (!nextStartDate && !nextEndDate) {
    return ''
  }

  if (!nextStartDate) {
    return nextEndDate
  }

  if (!nextEndDate) {
    return nextStartDate
  }

  return `${nextStartDate} - ${nextEndDate}`
}

/**
 * 获取工作经历字段差异摘要
 * 让重复岗位在导入前就能看到时间、地点和新增职责差异。
 */
function getExperienceDiffDetails(
  currentExperience: Experience,
  importedExperience: Experience
): {
  diffDetails: string[]
  detailSections: ImportConflictDetailSection[]
  comparisonSections: ImportConflictComparisonSection[]
} {
  const nextDetails: string[] = []
  const detailSections: ImportConflictDetailSection[] = []
  const comparisonSections: ImportConflictComparisonSection[] = []
  const currentPeriod = formatDateRange(
    currentExperience.startDate,
    currentExperience.endDate,
    currentExperience.current
  )
  const importedPeriod = formatDateRange(
    importedExperience.startDate,
    importedExperience.endDate,
    importedExperience.current
  )

  if (currentPeriod !== importedPeriod && importedPeriod) {
    nextDetails.push(`时间调整：${importedPeriod}`)
    const dateSection = createDetailSection('导入时间', [importedPeriod])
    if (dateSection) {
      detailSections.push(dateSection)
    }
  }
  const periodComparisonSection = createComparisonSection('任职时间', [currentPeriod], [importedPeriod])
  if (periodComparisonSection) {
    comparisonSections.push(periodComparisonSection)
  }

  if (
    normalizeComparableText(currentExperience.location || '') !== normalizeComparableText(importedExperience.location || '') &&
    importedExperience.location
  ) {
    nextDetails.push(`地点变更：${importedExperience.location}`)
    const locationSection = createDetailSection('导入地点', [importedExperience.location])
    if (locationSection) {
      detailSections.push(locationSection)
    }
  }
  const locationComparisonSection = createComparisonSection(
    '工作地点',
    [toSafeString(currentExperience.location)],
    [toSafeString(importedExperience.location)]
  )
  if (locationComparisonSection) {
    comparisonSections.push(locationComparisonSection)
  }

  const addedDescriptions = getAddedListItems(currentExperience.description, importedExperience.description)
  if (addedDescriptions.length > 0) {
    const visibleDescriptions = addedDescriptions.slice(0, 2)
    const suffix = addedDescriptions.length > 2 ? ' 等' : ''
    nextDetails.push(`新增职责：${visibleDescriptions.join('；')}${suffix}`)
    const descriptionSection = createDetailSection('新增职责明细', addedDescriptions)
    if (descriptionSection) {
      detailSections.push(descriptionSection)
    }
  }
  const descriptionComparisonSection = createComparisonSection(
    '职责内容',
    currentExperience.description,
    importedExperience.description
  )
  if (descriptionComparisonSection) {
    comparisonSections.push(descriptionComparisonSection)
  }

  return {
    diffDetails: nextDetails.length > 0 ? nextDetails : ['关键字段基本一致'],
    detailSections,
    comparisonSections
  }
}

/**
 * 获取项目字段差异摘要
 * 用于提前展示同名项目在技术栈、亮点和链接上的变化。
 */
function getProjectDiffDetails(
  currentProject: Project,
  importedProject: Project
): {
  diffDetails: string[]
  detailSections: ImportConflictDetailSection[]
  comparisonSections: ImportConflictComparisonSection[]
} {
  const nextDetails: string[] = []
  const detailSections: ImportConflictDetailSection[] = []
  const comparisonSections: ImportConflictComparisonSection[] = []
  const currentPeriod = currentProject.date || formatDateRange(currentProject.startDate, currentProject.endDate)
  const importedPeriod = importedProject.date || formatDateRange(importedProject.startDate, importedProject.endDate)

  if (currentPeriod !== importedPeriod && importedPeriod) {
    nextDetails.push(`时间调整：${importedPeriod}`)
    const dateSection = createDetailSection('导入时间', [importedPeriod])
    if (dateSection) {
      detailSections.push(dateSection)
    }
  }
  const periodComparisonSection = createComparisonSection('项目时间', [currentPeriod], [importedPeriod])
  if (periodComparisonSection) {
    comparisonSections.push(periodComparisonSection)
  }

  const descriptionComparisonSection = createComparisonSection(
    '项目简介',
    [currentProject.description],
    [importedProject.description]
  )
  if (descriptionComparisonSection) {
    comparisonSections.push(descriptionComparisonSection)
  }

  const addedTechnologies = getAddedListItems(currentProject.technologies, importedProject.technologies)
  if (addedTechnologies.length > 0) {
    const visibleTechnologies = addedTechnologies.slice(0, 3)
    const suffix = addedTechnologies.length > 3 ? ' 等' : ''
    nextDetails.push(`新增技术栈：${visibleTechnologies.join(' / ')}${suffix}`)
    const technologiesSection = createDetailSection('新增技术栈明细', addedTechnologies)
    if (technologiesSection) {
      detailSections.push(technologiesSection)
    }
  }
  const technologiesComparisonSection = createComparisonSection(
    '技术栈',
    currentProject.technologies,
    importedProject.technologies
  )
  if (technologiesComparisonSection) {
    comparisonSections.push(technologiesComparisonSection)
  }

  const addedHighlights = getAddedListItems(currentProject.highlights, importedProject.highlights)
  if (addedHighlights.length > 0) {
    const visibleHighlights = addedHighlights.slice(0, 2)
    const suffix = addedHighlights.length > 2 ? ' 等' : ''
    nextDetails.push(`新增亮点：${visibleHighlights.join('；')}${suffix}`)
    const highlightsSection = createDetailSection('新增亮点明细', addedHighlights)
    if (highlightsSection) {
      detailSections.push(highlightsSection)
    }
  }
  const highlightsComparisonSection = createComparisonSection(
    '项目亮点',
    currentProject.highlights,
    importedProject.highlights
  )
  if (highlightsComparisonSection) {
    comparisonSections.push(highlightsComparisonSection)
  }

  if (
    toSafeString(importedProject.url).trim() &&
    toSafeString(currentProject.url).trim() !== toSafeString(importedProject.url).trim()
  ) {
    nextDetails.push('项目链接已更新')
    const urlSection = createDetailSection('导入项目链接', [toSafeString(importedProject.url)])
    if (urlSection) {
      detailSections.push(urlSection)
    }
  }
  const urlComparisonSection = createComparisonSection(
    '项目链接',
    [toSafeString(currentProject.url)],
    [toSafeString(importedProject.url)]
  )
  if (urlComparisonSection) {
    comparisonSections.push(urlComparisonSection)
  }

  return {
    diffDetails: nextDetails.length > 0 ? nextDetails : ['关键字段基本一致'],
    detailSections,
    comparisonSections
  }
}

/**
 * 合并重复工作经历
 * 只吸收新增职责和缺失字段，避免把当前记录整体覆盖成导入版本。
 */
function mergeExperienceEntry(
  currentExperience: Experience,
  importedExperience: Experience,
  mergeFields: ExperienceMergeFieldSelection
): Experience {
  return {
    ...currentExperience,
    startDate: mergeFields.dates
      ? (currentExperience.startDate || importedExperience.startDate)
      : currentExperience.startDate,
    endDate: mergeFields.dates
      ? (currentExperience.endDate || importedExperience.endDate)
      : currentExperience.endDate,
    current: mergeFields.dates
      ? (currentExperience.current || importedExperience.current)
      : currentExperience.current,
    description: mergeFields.description
      ? mergeListItems(currentExperience.description, importedExperience.description)
      : currentExperience.description,
    location: mergeFields.location
      ? (currentExperience.location || importedExperience.location)
      : currentExperience.location
  }
}

/**
 * 合并重复项目
 * 优先保留当前项目主信息，仅将新增技术栈、亮点和缺失字段补齐到当前项目。
 */
function mergeProjectEntry(
  currentProject: Project,
  importedProject: Project,
  mergeFields: ProjectMergeFieldSelection
): Project {
  return {
    ...currentProject,
    description: mergeFields.description
      ? (currentProject.description || importedProject.description)
      : currentProject.description,
    technologies: mergeFields.technologies
      ? mergeListItems(currentProject.technologies, importedProject.technologies)
      : currentProject.technologies,
    startDate: mergeFields.dates
      ? (currentProject.startDate || importedProject.startDate)
      : currentProject.startDate,
    endDate: mergeFields.dates
      ? (currentProject.endDate || importedProject.endDate)
      : currentProject.endDate,
    date: mergeFields.dates
      ? (currentProject.date || importedProject.date)
      : currentProject.date,
    url: mergeFields.url
      ? (currentProject.url || importedProject.url)
      : currentProject.url,
    highlights: mergeFields.highlights
      ? mergeListItems(currentProject.highlights, importedProject.highlights)
      : currentProject.highlights
  }
}

/**
 * 获取技能比较标识
 * 使用规范技能名做比较，减少 ReactJS/React.js 这类别名造成的重复导入。
 */
function getSkillIdentity(skillName: string): string {
  return normalizeComparableText(getCanonicalSkillName(skillName))
}

/**
 * 获取工作经历比较标识
 * 默认按公司 + 职位判断是否可能为重复经历。
 */
function getExperienceIdentity(experience: Pick<Experience, 'company' | 'position'>): string {
  return normalizeComparableText(`${experience.company}-${experience.position}`)
}

/**
 * 获取项目比较标识
 * 默认按项目名称判断是否为同名项目。
 */
function getProjectIdentity(project: Pick<Project, 'name'>): string {
  return normalizeComparableText(project.name)
}

/**
 * 规范化个人信息
 * 将导入内容补齐为编辑器完整结构，避免缺字段时渲染异常。
 */
function normalizeImportedPersonalInfo(data?: Partial<PersonalInfo>): PersonalInfo {
  return {
    name: toSafeString(data?.name),
    title: toSafeString(data?.title),
    email: toSafeString(data?.email),
    phone: toSafeString(data?.phone),
    location: toSafeString(data?.location),
    website: toSafeString(data?.website),
    contactQRCode: toSafeString(data?.contactQRCode),
    summary: toSafeString(data?.summary),
    avatar: toSafeString(data?.avatar) || undefined,
    avatarBorderRadius: typeof data?.avatarBorderRadius === 'number' ? data.avatarBorderRadius : undefined
  }
}

/**
 * 规范化工作经历
 * 自动补齐 ID、布尔字段和描述数组，兼容旧版本导出格式。
 */
function normalizeImportedExperiences(experiences?: ImportedResumeLike['experience']): Experience[] {
  if (!Array.isArray(experiences)) {
    return []
  }

  return experiences.map((experience) => ({
    id: toSafeString(experience.id) || buildImportedId('exp'),
    company: toSafeString(experience.company),
    position: toSafeString(experience.position),
    startDate: toSafeString(experience.startDate),
    endDate: toSafeString(experience.endDate),
    current: Boolean(experience.current),
    description: normalizeDescriptionList(experience.description),
    location: toSafeString(experience.location) || undefined
  }))
}

/**
 * 规范化教育经历
 * 统一补齐主字段和可选说明，保证教育模块导入后可直接编辑。
 */
function normalizeImportedEducation(educationList?: Partial<Education>[]): Education[] {
  if (!Array.isArray(educationList)) {
    return []
  }

  return educationList.map((education) => ({
    id: toSafeString(education.id) || buildImportedId('edu'),
    school: toSafeString(education.school),
    degree: toSafeString(education.degree),
    major: toSafeString(education.major),
    startDate: toSafeString(education.startDate),
    endDate: toSafeString(education.endDate),
    gpa: toSafeString(education.gpa) || undefined,
    description: toSafeString(education.description) || undefined
  }))
}

/**
 * 规范化技能列表
 * 为旧格式技能补齐分类和等级，确保技能编辑器和智能整理链路可继续使用。
 */
function normalizeImportedSkills(skills?: Partial<Skill>[]): Skill[] {
  if (!Array.isArray(skills)) {
    return []
  }

  return skills.map((skill) => ({
    id: toSafeString(skill.id) || buildImportedId('skill'),
    name: toSafeString(skill.name),
    level: typeof skill.level === 'number' ? skill.level : 80,
    category: toSafeString(skill.category) || '专业技能',
    categoryLocked: Boolean(skill.categoryLocked),
    color: toSafeString(skill.color) || undefined
  }))
}

/**
 * 规范化项目经历
 * 将旧导出中的字符串技术栈和链接字段统一映射到当前项目结构。
 */
function normalizeImportedProjects(projects?: ImportedProjectLike[]): Project[] {
  if (!Array.isArray(projects)) {
    return []
  }

  return projects.map((project: ImportedProjectLike) => {
    const description = toSafeString(project.description)
    const highlights = Array.isArray(project.highlights)
      ? project.highlights.map((item: string) => toSafeString(item).trim()).filter(Boolean)
      : normalizeDescriptionList(description)

    return {
      id: toSafeString(project.id) || buildImportedId('project'),
      name: toSafeString(project.name),
      description,
      technologies: normalizeTechnologyList(project.technologies),
      startDate: toSafeString(project.startDate),
      endDate: toSafeString(project.endDate),
      date: toSafeString(project.date) || undefined,
      url: toSafeString(project.url) || toSafeString(project.link) || undefined,
      highlights
    }
  })
}

/**
 * 生成技能合并计划
 * 合并导入时对同名或同义技能自动去重，并保留更有价值的等级和分类信息。
 */
function buildSkillMergePlan(currentSkills: Skill[], importedSkills: Skill[]) {
  const nextSkills = [...currentSkills]
  const skillIndexMap = new Map<string, number>()
  const duplicateNames = new Set<string>()
  let appendedCount = 0

  nextSkills.forEach((skill, index) => {
    const identity = getSkillIdentity(skill.name)
    if (identity) {
      skillIndexMap.set(identity, index)
    }
  })

  importedSkills.forEach((importedSkill) => {
    const identity = getSkillIdentity(importedSkill.name)
    if (!identity) {
      nextSkills.push(importedSkill)
      appendedCount += 1
      return
    }

    const existingIndex = skillIndexMap.get(identity)
    if (existingIndex === undefined) {
      skillIndexMap.set(identity, nextSkills.length)
      nextSkills.push({
        ...importedSkill,
        name: getCanonicalSkillName(importedSkill.name)
      })
      appendedCount += 1
      return
    }

    duplicateNames.add(getCanonicalSkillName(importedSkill.name))
    const existingSkill = nextSkills[existingIndex]
    nextSkills[existingIndex] = {
      ...existingSkill,
      name: getCanonicalSkillName(existingSkill.name || importedSkill.name),
      level: Math.max(existingSkill.level ?? 0, importedSkill.level ?? 0),
      category: existingSkill.category && existingSkill.category !== '专业技能'
        ? existingSkill.category
        : importedSkill.category || existingSkill.category,
      categoryLocked: Boolean(existingSkill.categoryLocked || importedSkill.categoryLocked),
      color: existingSkill.color || importedSkill.color
    }
  })

  return {
    nextSkills,
    appendedCount,
    duplicateNames: Array.from(duplicateNames)
  }
}

/**
 * 获取重复条目摘要
 * 用于在导入前预警项目和经历冲突，并支持后续按勾选跳过重复项。
 */
function getDuplicateEntrySummary<T>(
  currentEntries: T[],
  importedEntries: T[],
  getIdentity: (entry: T) => string,
  getLabel: (entry: T) => string,
  getDiffDetails: (
    currentEntry: T,
    importedEntry: T
  ) => {
    diffDetails: string[]
    detailSections: ImportConflictDetailSection[]
    comparisonSections: ImportConflictComparisonSection[]
  }
): ImportConflictSummaryItem {
  const currentEntryMap = new Map<string, T>()

  currentEntries.forEach((entry) => {
    const identity = getIdentity(entry)
    if (identity && !currentEntryMap.has(identity)) {
      currentEntryMap.set(identity, entry)
    }
  })

  const duplicateEntries = importedEntries.filter((entry) => currentEntryMap.has(getIdentity(entry)))
  const normalizedDuplicateEntries = duplicateEntries
    .map((entry) => {
      const identity = getIdentity(entry)
      const currentEntry = currentEntryMap.get(identity)
      const diffResult = currentEntry
        ? getDiffDetails(currentEntry, entry)
        : { diffDetails: ['关键字段基本一致'], detailSections: [], comparisonSections: [] }
      return {
        id: (entry as { id?: string }).id || identity,
        label: getLabel(entry),
        identity,
        diffDetails: diffResult.diffDetails,
        detailSections: diffResult.detailSections,
        comparisonSections: diffResult.comparisonSections
      }
    })
    .filter((entry) => entry.id && entry.label)

  return {
    duplicateCount: duplicateEntries.length,
    duplicateNames: Array.from(new Set(
      normalizedDuplicateEntries
        .map((entry) => entry.label)
        .filter(Boolean)
    )),
    duplicateEntries: normalizedDuplicateEntries
  }
}

/**
 * 获取个人信息字段变更摘要
 * 将个人资料的字段级变化转换为可直接展示的文案，便于用户在导入前确认影响范围。
 */
function getPersonalInfoImpactDetails(
  currentPersonalInfo: PersonalInfo,
  importedPersonalInfo: Partial<PersonalInfo>,
  mode: ImportMode
): string[] {
  const nextDetails: string[] = []
  const importedEntries = Object.entries(importedPersonalInfo).filter(([, value]) => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return value !== undefined && value !== null
  }) as Array<[keyof PersonalInfo, PersonalInfo[keyof PersonalInfo]]>

  if (importedEntries.length === 0) {
    return ['导入包未提供可识别的个人信息字段。']
  }

  const overwriteFields = importedEntries
    .filter(([key]) => {
      const currentValue = currentPersonalInfo[key]
      return typeof currentValue === 'string'
        ? currentValue.trim().length > 0
        : currentValue !== undefined && currentValue !== null
    })
    .map(([key]) => PERSONAL_INFO_FIELD_LABELS[key])

  const fillFields = importedEntries
    .filter(([key]) => {
      const currentValue = currentPersonalInfo[key]
      return typeof currentValue === 'string'
        ? currentValue.trim().length === 0
        : currentValue === undefined || currentValue === null
    })
    .map(([key]) => PERSONAL_INFO_FIELD_LABELS[key])

  if (mode === 'replace' && overwriteFields.length > 0) {
    nextDetails.push(`将覆盖：${overwriteFields.join('、')}`)
  }

  if (mode === 'merge' && overwriteFields.length > 0) {
    nextDetails.push(`将更新：${overwriteFields.join('、')}`)
  }

  if (fillFields.length > 0) {
    nextDetails.push(`将补充：${fillFields.join('、')}`)
  }

  return nextDetails
}

/**
 * 获取内容条目预览
 * 从经历、教育、技能、项目中提取可识别名称，帮助用户在导入前快速确认来源条目。
 */
function getEntryPreviewNames(section: Exclude<ImportResumeSection, 'personalInfo'>, resumeData?: ImportedResumeLike): string[] {
  if (!resumeData) {
    return []
  }

  if (section === 'experience') {
    return normalizeImportedExperiences(resumeData.experience)
      .map((item) => [item.company, item.position].filter(Boolean).join(' · '))
      .filter(Boolean)
  }

  if (section === 'education') {
    return normalizeImportedEducation(resumeData.education)
      .map((item) => [item.school, item.degree].filter(Boolean).join(' · '))
      .filter(Boolean)
  }

  if (section === 'skills') {
    return normalizeImportedSkills(resumeData.skills)
      .map((item) => item.name)
      .filter(Boolean)
  }

  return normalizeImportedProjects(resumeData.projects)
    .map((item) => item.name)
    .filter(Boolean)
}

/**
 * 构建条目型模块的影响明细
 * 在覆盖或合并模式下展示数量变化和前几条名称，减少误操作。
 */
function getListSectionImpactDetails(input: {
  currentCount: number
  importedCount: number
  previewNames: string[]
  mode: ImportMode
  conflictNames?: string[]
  conflictPrefix?: string
  dedupeNames?: string[]
  appendedCount?: number
}): string[] {
  const {
    currentCount,
    importedCount,
    previewNames,
    mode,
    conflictNames = [],
    conflictPrefix,
    dedupeNames = [],
    appendedCount
  } = input
  const nextDetails: string[] = []

  nextDetails.push(
    mode === 'replace'
      ? `数量变化：当前 ${currentCount} 条 -> 导入 ${importedCount} 条`
      : `新增数量：将在当前 ${currentCount} 条基础上追加 ${appendedCount ?? importedCount} 条`
  )

  if (previewNames.length > 0) {
    const visibleNames = previewNames.slice(0, 3)
    const suffix = previewNames.length > 3 ? ' 等' : ''
    nextDetails.push(`涉及条目：${visibleNames.join('、')}${suffix}`)
  }

  if (dedupeNames.length > 0) {
    const visibleNames = dedupeNames.slice(0, 3)
    const suffix = dedupeNames.length > 3 ? ' 等' : ''
    nextDetails.push(`自动去重：${visibleNames.join('、')}${suffix}`)
  }

  if (conflictNames.length > 0 && conflictPrefix) {
    const visibleNames = conflictNames.slice(0, 3)
    const suffix = conflictNames.length > 3 ? ' 等' : ''
    nextDetails.push(`${conflictPrefix}：${visibleNames.join('、')}${suffix}`)
  }

  return nextDetails
}

/**
 * 获取样式影响明细
 * 将导入样式中实际包含的能力维度转成摘要，避免用户不知道会改到哪里。
 */
function getStyleImpactDetails(importedStyleConfig?: Partial<StyleConfig>): string[] {
  if (!importedStyleConfig) {
    return []
  }

  const sections: string[] = []
  if (importedStyleConfig.colors) sections.push('颜色')
  if (importedStyleConfig.fontFamily) sections.push('字体')
  if (importedStyleConfig.fontSize) sections.push('字号')
  if (importedStyleConfig.spacing) sections.push('间距')
  if (importedStyleConfig.layout) sections.push('布局')
  if (importedStyleConfig.avatar) sections.push('头像样式')
  if (importedStyleConfig.skills) sections.push('技能展示')

  if (sections.length === 0) {
    return ['将按导入包中的可用样式字段更新当前配置。']
  }

  return [`涉及设置：${sections.join('、')}`]
}

/**
 * 获取配色方案影响明细
 * 展示将导入的配色名称，让用户能更直观看到会写入哪些色板。
 */
function getColorSchemeImpactDetails(importedColorSchemes?: ColorScheme[]): string[] {
  if (!importedColorSchemes?.length) {
    return []
  }

  const visibleNames = importedColorSchemes
    .map((scheme) => scheme.name.trim())
    .filter(Boolean)
    .slice(0, 3)

  if (visibleNames.length === 0) {
    return [`将导入 ${importedColorSchemes.length} 套自定义配色。`]
  }

  const suffix = importedColorSchemes.length > 3 ? ' 等' : ''
  return [`配色名称：${visibleNames.join('、')}${suffix}`]
}

/**
 * 获取可导入的内容模块
 * 根据导入包中实际存在的数据，计算可供用户勾选的简历模块。
 */
export function getAvailableImportResumeSections(resumeData?: ImportedResumeLike): ImportResumeSection[] {
  if (!resumeData) {
    return []
  }

  return ALL_IMPORT_RESUME_SECTIONS.filter((section) => {
    if (section === 'personalInfo') {
      return Boolean(resumeData.personalInfo)
    }

    const sectionValue = resumeData[section]
    return Array.isArray(sectionValue) ? sectionValue.length > 0 : Boolean(sectionValue)
  })
}

/**
 * 生成默认导入选择
 * 默认勾选导入包中实际存在的内容、样式和配色，减少首次操作成本。
 */
export function createDefaultImportSelection(input: {
  resumeData?: ImportedResumeLike
  styleConfig?: Partial<StyleConfig>
  colorSchemes?: ColorScheme[]
}): ImportSelection {
  const resumeSections = getAvailableImportResumeSections(input.resumeData)

  return {
    includeResumeData: resumeSections.length > 0,
    includeStyleConfig: Boolean(input.styleConfig),
    includeColorSchemes: Boolean(input.colorSchemes?.length),
    resumeSections,
    experienceConflictActions: {},
    projectConflictActions: {},
    experienceMergeFields: {},
    projectMergeFields: {}
  }
}

/**
 * 判断导入选择是否有效
 * 至少需要勾选一类可导入资源，避免用户空提交。
 */
export function hasSelectedImportContent(selection: ImportSelection): boolean {
  return Boolean(
    (selection.includeResumeData && selection.resumeSections.length > 0) ||
    selection.includeStyleConfig ||
    selection.includeColorSchemes
  )
}

/**
 * 获取导入冲突摘要
 * 汇总工作经历和项目的潜在重复项，供弹窗渲染“跳过重复项”控制。
 */
export function getImportConflictSummary(
  currentResumeData: ResumeData,
  importedResumeData?: ImportedResumeLike
): ImportConflictSummary {
  if (!importedResumeData) {
    return {
      experience: { duplicateNames: [], duplicateCount: 0, duplicateEntries: [] },
      projects: { duplicateNames: [], duplicateCount: 0, duplicateEntries: [] }
    }
  }

  return {
    experience: getDuplicateEntrySummary(
      currentResumeData.experience,
      normalizeImportedExperiences(importedResumeData.experience),
      getExperienceIdentity,
      (item) => [item.company, item.position].filter(Boolean).join(' · '),
      getExperienceDiffDetails
    ),
    projects: getDuplicateEntrySummary(
      currentResumeData.projects,
      normalizeImportedProjects(importedResumeData.projects),
      getProjectIdentity,
      (item) => item.name,
      getProjectDiffDetails
    )
  }
}

/**
 * 生成导入影响摘要
 * 在真正执行导入前，先根据当前状态和勾选范围计算“将替换什么 / 将追加什么”。
 */
export function getImportImpactSummary(input: {
  currentResumeData: ResumeData
  currentStyleConfig?: StyleConfig
  importedResumeData?: ImportedResumeLike
  importedStyleConfig?: Partial<StyleConfig>
  currentCustomSchemeCount: number
  importedColorSchemes?: ColorScheme[]
  mode: ImportMode
  selection: ImportSelection
}): ImportImpactItem[] {
  const items: ImportImpactItem[] = []
  const {
    currentResumeData,
    currentStyleConfig: _currentStyleConfig,
    importedResumeData,
    importedStyleConfig,
    currentCustomSchemeCount,
    importedColorSchemes,
    mode,
    selection
  } = input

  const sectionLabels: Record<ImportResumeSection, string> = {
    personalInfo: '个人信息',
    experience: '工作经历',
    education: '教育背景',
    skills: '专业技能',
    projects: '项目经历'
  }

  if (selection.includeResumeData && importedResumeData) {
    selection.resumeSections.forEach((section) => {
      if (section === 'personalInfo' && importedResumeData.personalInfo) {
        items.push({
          key: section,
          title: sectionLabels[section],
          description: mode === 'replace'
            ? '将覆盖当前姓名、职位、联系方式和个人简介。'
            : '将用导入包中的非空字段补充当前个人资料。',
          type: 'content',
          details: getPersonalInfoImpactDetails(currentResumeData.personalInfo, importedResumeData.personalInfo, mode)
        })
        return
      }

      const currentCount = Array.isArray(currentResumeData[section]) ? currentResumeData[section].length : 0
      const importedCount = Array.isArray(importedResumeData[section]) ? importedResumeData[section].length : 0

      if (importedCount === 0) {
        return
      }

      const listSection = section as Exclude<ImportResumeSection, 'personalInfo'>
      const importedPreviewNames = getEntryPreviewNames(listSection, importedResumeData)
      const conflictSummary = listSection === 'experience'
        ? getDuplicateEntrySummary(
            currentResumeData.experience,
            normalizeImportedExperiences(importedResumeData.experience),
            getExperienceIdentity,
            (item) => [item.company, item.position].filter(Boolean).join(' · '),
            getExperienceDiffDetails
          )
        : listSection === 'projects'
          ? getDuplicateEntrySummary(
              currentResumeData.projects,
              normalizeImportedProjects(importedResumeData.projects),
              getProjectIdentity,
              (item) => item.name,
              getProjectDiffDetails
            )
          : { duplicateNames: [], duplicateCount: 0, duplicateEntries: [] }

      const skillMergePlan = listSection === 'skills'
        ? buildSkillMergePlan(
            currentResumeData.skills,
            normalizeImportedSkills(importedResumeData.skills)
          )
        : null
      const conflictActionMap = listSection === 'experience'
        ? selection.experienceConflictActions
        : listSection === 'projects'
          ? selection.projectConflictActions
          : {}
      const conflictActionStats = getConflictActionStats(conflictSummary.duplicateEntries, conflictActionMap)
      const nonDuplicateCount = importedCount - conflictSummary.duplicateCount

      const duplicateLabel = listSection === 'experience'
        ? '重复岗位提醒'
        : listSection === 'projects'
          ? '同名项目提醒'
          : undefined
      const details = getListSectionImpactDetails({
        currentCount,
        importedCount,
        previewNames: importedPreviewNames,
        mode,
        dedupeNames: listSection === 'skills' ? skillMergePlan?.duplicateNames : [],
        appendedCount: listSection === 'experience' || listSection === 'projects'
          ? nonDuplicateCount + conflictActionStats.appendCount
          : listSection === 'skills'
            ? skillMergePlan?.appendedCount
            : undefined,
        conflictNames: conflictSummary.duplicateNames,
        conflictPrefix: duplicateLabel
      })

      if (listSection === 'experience' || listSection === 'projects') {
        const mergedLabels = getConflictEntryLabelsByAction(conflictSummary.duplicateEntries, conflictActionMap, 'merge')
        const skippedLabels = getConflictEntryLabelsByAction(conflictSummary.duplicateEntries, conflictActionMap, 'skip')
        const appendedLabels = getConflictEntryLabelsByAction(conflictSummary.duplicateEntries, conflictActionMap, 'append')

        if (mergedLabels.length > 0) {
          const visibleLabels = mergedLabels.slice(0, 3)
          const suffix = mergedLabels.length > 3 ? ' 等' : ''
          details.push(`${listSection === 'experience' ? '合并重复岗位' : '合并同名项目'}：${visibleLabels.join('、')}${suffix}`)
        }

        const mergeFieldDetails = listSection === 'experience'
          ? getExperienceMergeFieldDetailLines(
              conflictSummary.duplicateEntries,
              selection.experienceConflictActions,
              selection.experienceMergeFields
            )
          : getProjectMergeFieldDetailLines(
              conflictSummary.duplicateEntries,
              selection.projectConflictActions,
              selection.projectMergeFields
            )
        details.push(...mergeFieldDetails)

        if (skippedLabels.length > 0) {
          const visibleLabels = skippedLabels.slice(0, 3)
          const suffix = skippedLabels.length > 3 ? ' 等' : ''
          details.push(`${listSection === 'experience' ? '跳过重复岗位' : '跳过同名项目'}：${visibleLabels.join('、')}${suffix}`)
        }

        if (appendedLabels.length > 0) {
          const visibleLabels = appendedLabels.slice(0, 3)
          const suffix = appendedLabels.length > 3 ? ' 等' : ''
          details.push(`${listSection === 'experience' ? '保留重复岗位' : '保留同名项目'}：${visibleLabels.join('、')}${suffix}`)
        }
      }

      items.push({
        key: section,
        title: sectionLabels[section],
        description: mode === 'replace'
          ? `将用导入包中的 ${importedCount} 条记录替换当前 ${currentCount} 条记录。`
          : listSection === 'skills' && skillMergePlan && skillMergePlan.duplicateNames.length > 0
            ? `将合并 ${importedCount} 项导入技能，其中 ${skillMergePlan.duplicateNames.length} 项同名技能会自动去重。`
            : conflictSummary.duplicateCount > 0
              ? listSection === 'experience'
                ? buildConflictActionDescription({
                    currentCount,
                    importedCount,
                    nonDuplicateCount,
                    skipCount: conflictActionStats.skipCount,
                    mergeCount: conflictActionStats.mergeCount,
                    appendCount: conflictActionStats.appendCount,
                    appendedLabel: '条新经历',
                    mergedLabel: '条重复岗位',
                    skippedLabel: '条重复岗位',
                    fallbackLabel: '导入经历'
                  })
                : listSection === 'projects'
                  ? buildConflictActionDescription({
                      currentCount,
                      importedCount,
                      nonDuplicateCount,
                      skipCount: conflictActionStats.skipCount,
                      mergeCount: conflictActionStats.mergeCount,
                      appendCount: conflictActionStats.appendCount,
                      appendedLabel: '个新项目',
                      mergedLabel: '个同名项目',
                      skippedLabel: '个同名项目',
                      fallbackLabel: '导入项目'
                    })
                  : `将向当前 ${currentCount} 条记录后追加 ${importedCount} 条导入内容，并发现 ${conflictSummary.duplicateCount} 条可能重复记录。`
              : `将向当前 ${currentCount} 条记录后追加 ${importedCount} 条导入内容。`,
        type: 'content',
        details
      })
    })
  }

  if (selection.includeStyleConfig) {
    items.push({
      key: 'style-config',
      title: '样式设置',
      description: mode === 'replace'
        ? '将覆盖当前字号、间距、颜色和布局配置。'
        : '将按导入备份补充并更新当前样式设置。',
      type: 'style',
      details: getStyleImpactDetails(importedStyleConfig)
    })
  }

  if (selection.includeColorSchemes && importedColorSchemes?.length) {
    items.push({
      key: 'color-schemes',
      title: '自定义配色',
      description: mode === 'replace'
        ? `将用 ${importedColorSchemes.length} 套导入配色替换当前 ${currentCustomSchemeCount} 套自定义配色。`
        : `将把 ${importedColorSchemes.length} 套导入配色追加到现有 ${currentCustomSchemeCount} 套自定义配色中。`,
      type: 'palette',
      details: getColorSchemeImpactDetails(importedColorSchemes)
    })
  }

  return items
}

/**
 * 应用导入的简历内容
 * 以“只替换选中的模块”为原则执行覆盖或合并，避免误伤未勾选部分。
 */
export function applyImportedResumeData(
  currentResumeData: ResumeData,
  importedResumeData: ImportedResumeLike,
  mode: ImportMode,
  selection: ImportSelection
): ResumeData {
  const nextResumeData: ResumeData = {
    ...currentResumeData,
    personalInfo: { ...currentResumeData.personalInfo },
    experience: [...currentResumeData.experience],
    education: [...currentResumeData.education],
    skills: [...currentResumeData.skills],
    projects: [...currentResumeData.projects]
  }

  if (selection.resumeSections.includes('personalInfo') && importedResumeData.personalInfo) {
    const normalizedPersonalInfo = normalizeImportedPersonalInfo(importedResumeData.personalInfo)

    nextResumeData.personalInfo = mode === 'replace'
      ? normalizedPersonalInfo
      : {
          ...currentResumeData.personalInfo,
          ...Object.fromEntries(
            Object.entries(normalizedPersonalInfo).filter(([, value]) => value !== '' && value !== undefined)
          )
        }
  }

  if (selection.resumeSections.includes('experience')) {
    const normalizedExperiences = normalizeImportedExperiences(importedResumeData.experience)
    nextResumeData.experience = mode === 'replace'
      ? normalizedExperiences
      : (() => {
          const mergedExperiences = [...currentResumeData.experience]
          const experienceIndexMap = new Map<string, number>()
          const appendedExperiences: Experience[] = []

          mergedExperiences.forEach((item, index) => {
            const identity = getExperienceIdentity(item)
            if (identity && !experienceIndexMap.has(identity)) {
              experienceIndexMap.set(identity, index)
            }
          })

          normalizedExperiences.forEach((item) => {
            const identity = getExperienceIdentity(item)
            const existingIndex = identity ? experienceIndexMap.get(identity) : undefined

            if (existingIndex === undefined) {
              appendedExperiences.push(item)
              return
            }

            const action = getConflictAction(selection.experienceConflictActions, item.id)
            if (action === 'skip') {
              return
            }

            if (action === 'append') {
              appendedExperiences.push(item)
              return
            }

            mergedExperiences[existingIndex] = mergeExperienceEntry(
              mergedExperiences[existingIndex],
              item,
              getExperienceMergeFields(selection.experienceMergeFields, item.id)
            )
          })

          return [...mergedExperiences, ...appendedExperiences]
        })()
  }

  if (selection.resumeSections.includes('education')) {
    const normalizedEducation = normalizeImportedEducation(importedResumeData.education)
    nextResumeData.education = mode === 'replace'
      ? normalizedEducation
      : [...currentResumeData.education, ...normalizedEducation]
  }

  if (selection.resumeSections.includes('skills')) {
    const normalizedSkills = normalizeImportedSkills(importedResumeData.skills)
    nextResumeData.skills = mode === 'replace'
      ? normalizedSkills
      : buildSkillMergePlan(currentResumeData.skills, normalizedSkills).nextSkills
  }

  if (selection.resumeSections.includes('projects')) {
    const normalizedProjects = normalizeImportedProjects(importedResumeData.projects)
    nextResumeData.projects = mode === 'replace'
      ? normalizedProjects
      : (() => {
          const mergedProjects = [...currentResumeData.projects]
          const projectIndexMap = new Map<string, number>()
          const appendedProjects: Project[] = []

          mergedProjects.forEach((item, index) => {
            const identity = getProjectIdentity(item)
            if (identity && !projectIndexMap.has(identity)) {
              projectIndexMap.set(identity, index)
            }
          })

          normalizedProjects.forEach((item) => {
            const identity = getProjectIdentity(item)
            const existingIndex = identity ? projectIndexMap.get(identity) : undefined

            if (existingIndex === undefined) {
              appendedProjects.push(item)
              return
            }

            const action = getConflictAction(selection.projectConflictActions, item.id)
            if (action === 'skip') {
              return
            }

            if (action === 'append') {
              appendedProjects.push(item)
              return
            }

            mergedProjects[existingIndex] = mergeProjectEntry(
              mergedProjects[existingIndex],
              item,
              getProjectMergeFields(selection.projectMergeFields, item.id)
            )
          })

          return [...mergedProjects, ...appendedProjects]
        })()
  }

  return nextResumeData
}

/**
 * 解析导入的样式配置
 * 用默认配置或当前配置兜底，保证旧备份导入后仍是完整可渲染样式。
 */
export function resolveImportedStyleConfig(
  currentStyleConfig: StyleConfig,
  importedStyleConfig: Partial<StyleConfig>,
  mode: ImportMode
): StyleConfig {
  const baseStyleConfig = mode === 'replace' ? defaultStyleConfig : currentStyleConfig

  return {
    ...baseStyleConfig,
    ...importedStyleConfig,
    fontSize: {
      ...baseStyleConfig.fontSize,
      ...importedStyleConfig.fontSize
    },
    colors: {
      ...baseStyleConfig.colors,
      ...importedStyleConfig.colors
    },
    spacing: {
      ...baseStyleConfig.spacing,
      ...importedStyleConfig.spacing
    },
    avatar: {
      ...baseStyleConfig.avatar,
      ...importedStyleConfig.avatar
    },
    layout: {
      ...baseStyleConfig.layout,
      ...importedStyleConfig.layout,
      sectionOrder: importedStyleConfig.layout?.sectionOrder
        ? importedStyleConfig.layout.sectionOrder.filter(
            (item): item is 'personal' | 'experience' | 'education' | 'skills' | 'projects' => item !== undefined
          )
        : baseStyleConfig.layout.sectionOrder
    },
    skills: {
      ...baseStyleConfig.skills,
      ...importedStyleConfig.skills
    }
  }
}
