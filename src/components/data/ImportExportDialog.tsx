/**
 * @file components/data/ImportExportDialog.tsx
 * @description 数据导入导出对话框组件，支持 JSON 格式导入导出、数据验证和预览
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * @requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */

'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  Upload,
  FileJson,
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  FileText,
  Palette,
  Settings,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useToastContext } from '@/components/Toast'
import { StyleConfig } from '@/contexts/StyleContext'
import { ColorScheme } from '@/hooks/useColorSchemes'
import { ResumeData } from '@/types/resume'
import {
  createDefaultImportSelection,
  ImportConflictSummary,
  ExperienceMergeFieldSelection,
  getImportConflictSummary,
  getImportImpactSummary,
  getAvailableImportResumeSections,
  hasSelectedImportContent,
  ImportConflictAction,
  ImportMode,
  ImportResumeSection,
  ImportSelection,
  ProjectMergeFieldSelection
} from '@/domain/editor/importExport'

/**
 * 导入的数据包
 */
export interface ImportedData {
  appName?: string
  appVersion?: string
  resumeData?: ResumeData
  styleConfig?: StyleConfig
  colorSchemes?: ColorScheme[]
  version: string
  exportedAt: string
}

/**
 * 导出数据包
 */
export interface ExportPackage extends ImportedData {
  appName: string
  appVersion: string
}

/**
 * 验证错误
 */
interface ValidationError {
  field: string
  message: string
}

/**
 * 对话框属性
 */
export interface ImportExportDialogProps {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 当前简历数据 */
  resumeData: ResumeData
  /** 当前样式配置 */
  styleConfig: StyleConfig
  /** 当前自定义配色方案 */
  colorSchemes?: ColorScheme[]
  /** 导入回调 */
  onImport: (data: ImportedData, mode: ImportMode, selection: ImportSelection) => void
}

/**
 * 验证导入数据
 */
function validateImportData(data: unknown): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: '无效的数据格式，请确保是有效的 JSON 文件' })
    return { valid: false, errors }
  }

  const obj = data as Record<string, unknown>

  // 验证版本
  if (!obj.version || typeof obj.version !== 'string') {
    errors.push({ field: 'version', message: '缺少版本信息' })
  }

  // 验证导出时间
  if (!obj.exportedAt || typeof obj.exportedAt !== 'string') {
    errors.push({ field: 'exportedAt', message: '缺少导出时间信息' })
  }

  // 验证简历数据（如果存在）
  if (obj.resumeData !== undefined) {
    if (typeof obj.resumeData !== 'object' || obj.resumeData === null) {
      errors.push({ field: 'resumeData', message: '简历数据格式无效' })
    }
  }

  // 验证样式配置（如果存在）
  if (obj.styleConfig !== undefined) {
    if (typeof obj.styleConfig !== 'object' || obj.styleConfig === null) {
      errors.push({ field: 'styleConfig', message: '样式配置格式无效' })
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 创建导出数据包
 */
function createExportPackage(
  resumeData: ResumeData,
  styleConfig: StyleConfig,
  colorSchemes: ColorScheme[] = []
): ExportPackage {
  return {
    appName: 'AI Resume Builder',
    appVersion: '1.0.0',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    resumeData,
    styleConfig,
    colorSchemes
  }
}

/**
 * 获取导入数据摘要
 * 将导入包转换成用户更容易理解的结构化统计，便于在预览区快速确认内容范围。
 */
function getImportedDataSummary(data: ImportedData) {
  return {
    resumeName: data.resumeData?.personalInfo?.name || '未命名',
    experienceCount: data.resumeData?.experience?.length || 0,
    educationCount: data.resumeData?.education?.length || 0,
    skillCount: data.resumeData?.skills?.length || 0,
    projectCount: data.resumeData?.projects?.length || 0,
    hasStyleConfig: Boolean(data.styleConfig),
    hasColorSchemes: Boolean(data.colorSchemes && data.colorSchemes.length > 0)
  }
}

/**
 * 获取导入模块摘要
 * 将可导入模块转换为更容易理解的标题和数量，便于预览区做勾选说明。
 */
function getImportSectionMeta(importedData: ImportedData) {
  const sections = getAvailableImportResumeSections(importedData.resumeData)

  const sectionConfig: Record<ImportResumeSection, { label: string; countLabel: string }> = {
    personalInfo: { label: '个人信息', countLabel: importedData.resumeData?.personalInfo?.name || '基础资料' },
    experience: { label: '工作经历', countLabel: `${importedData.resumeData?.experience?.length || 0} 段经历` },
    education: { label: '教育背景', countLabel: `${importedData.resumeData?.education?.length || 0} 条记录` },
    skills: { label: '专业技能', countLabel: `${importedData.resumeData?.skills?.length || 0} 项技能` },
    projects: { label: '项目经历', countLabel: `${importedData.resumeData?.projects?.length || 0} 个项目` }
  }

  return sections.map((section) => ({
    key: section,
    ...sectionConfig[section]
  }))
}

/**
 * 构建冲突条目展开键
 * 使用模块名和条目 ID 组合，避免重复项展开状态互相影响。
 */
function buildConflictEntryKey(section: 'experience' | 'projects', entryId: string): string {
  return `${section}:${entryId}`
}

const EXPERIENCE_MERGE_FIELD_OPTIONS: Array<{ key: keyof ExperienceMergeFieldSelection; label: string }> = [
  { key: 'dates', label: '时间' },
  { key: 'location', label: '地点' },
  { key: 'description', label: '职责' }
]

const PROJECT_MERGE_FIELD_OPTIONS: Array<{ key: keyof ProjectMergeFieldSelection; label: string }> = [
  { key: 'dates', label: '时间' },
  { key: 'description', label: '简介' },
  { key: 'technologies', label: '技术栈' },
  { key: 'highlights', label: '亮点' },
  { key: 'url', label: '链接' }
]
const IMPORT_MERGE_PREFERENCES_STORAGE_KEY = 'resume-import-merge-preferences'
type ImportMergePresetKey = 'conservative' | 'incremental' | 'keep-all'

/**
 * 创建默认的工作经历字段级合并配置
 * 默认全开，便于用户在首次导入时直接使用“合并新增”。
 */
function createDefaultExperienceMergeFields(): ExperienceMergeFieldSelection {
  return {
    dates: true,
    location: true,
    description: true
  }
}

/**
 * 创建默认的项目字段级合并配置
 * 默认全开，减少首次使用时的额外设置成本。
 */
function createDefaultProjectMergeFields(): ProjectMergeFieldSelection {
  return {
    dates: true,
    description: true,
    technologies: true,
    highlights: true,
    url: true
  }
}

interface ImportMergePreferences {
  sourceProfiles: Record<string, ImportMergePreferenceProfile>
  actions: {
    experience: ImportConflictAction
    project: ImportConflictAction
  }
  experience: ExperienceMergeFieldSelection
  project: ProjectMergeFieldSelection
}

interface ImportMergePreferenceProfile {
  actions: {
    experience: ImportConflictAction
    project: ImportConflictAction
  }
  experience: ExperienceMergeFieldSelection
  project: ProjectMergeFieldSelection
  sourceLabel?: string
  updatedAt?: string
}

/**
 * 获取默认的导入合并偏好
 * 当本地还没有保存用户习惯时，使用全字段开启作为兜底值。
 */
function createDefaultImportMergePreferences(): ImportMergePreferences {
  return {
    sourceProfiles: {},
    actions: {
      experience: 'merge',
      project: 'merge'
    },
    experience: createDefaultExperienceMergeFields(),
    project: createDefaultProjectMergeFields()
  }
}

/**
 * 生成导入偏好配置快照
 * 用于保存全局默认值或某个来源的专属策略。
 */
function createImportMergePreferenceProfile(input?: Partial<ImportMergePreferenceProfile>): ImportMergePreferenceProfile {
  return {
    actions: {
      experience: input?.actions?.experience || 'merge',
      project: input?.actions?.project || 'merge'
    },
    experience: {
      ...createDefaultExperienceMergeFields(),
      ...(input?.experience || {})
    },
    project: {
      ...createDefaultProjectMergeFields(),
      ...(input?.project || {})
    },
    sourceLabel: input?.sourceLabel?.trim() || undefined,
    updatedAt: input?.updatedAt || undefined
  }
}

const IMPORT_MERGE_PRESETS: Array<{
  key: ImportMergePresetKey
  label: string
  description: string
  preferences: ImportMergePreferenceProfile
}> = [
  {
    key: 'conservative',
    label: '保守恢复',
    description: '重复岗位默认跳过，同名项目只合并技术栈。',
    preferences: {
      actions: {
        experience: 'skip',
        project: 'merge'
      },
      experience: {
        dates: false,
        location: false,
        description: false
      },
      project: {
        dates: false,
        description: false,
        technologies: true,
        highlights: false,
        url: false
      }
    }
  },
  {
    key: 'incremental',
    label: '增量补全',
    description: '重复岗位和项目都默认合并新增字段。',
    preferences: createDefaultImportMergePreferences()
  },
  {
    key: 'keep-all',
    label: '完整保留',
    description: '重复岗位和项目默认保留为新条目继续导入。',
    preferences: {
      actions: {
        experience: 'append',
        project: 'append'
      },
      experience: createDefaultExperienceMergeFields(),
      project: createDefaultProjectMergeFields()
    }
  }
]

/**
 * 判断两个工作经历字段配置是否一致
 * 用于识别当前偏好是否命中某一套导入预设。
 */
function isExperienceMergeFieldsEqual(
  left: ExperienceMergeFieldSelection,
  right: ExperienceMergeFieldSelection
): boolean {
  return left.dates === right.dates &&
    left.location === right.location &&
    left.description === right.description
}

/**
 * 判断两个项目字段配置是否一致
 * 用于识别当前偏好是否命中某一套导入预设。
 */
function isProjectMergeFieldsEqual(
  left: ProjectMergeFieldSelection,
  right: ProjectMergeFieldSelection
): boolean {
  return left.dates === right.dates &&
    left.description === right.description &&
    left.technologies === right.technologies &&
    left.highlights === right.highlights &&
    left.url === right.url
}

/**
 * 判断两套导入偏好配置是否等价
 * 忽略来源标签和更新时间，仅比较动作与字段级合并规则是否一致。
 */
function isImportMergeProfileEquivalent(
  left: ImportMergePreferenceProfile,
  right: ImportMergePreferenceProfile
): boolean {
  return left.actions.experience === right.actions.experience &&
    left.actions.project === right.actions.project &&
    isExperienceMergeFieldsEqual(left.experience, right.experience) &&
    isProjectMergeFieldsEqual(left.project, right.project)
}

/**
 * 读取本地存储的导入合并偏好
 * 仅在浏览器环境执行，失败时回退到默认配置。
 */
function readImportMergePreferences(): ImportMergePreferences {
  if (typeof window === 'undefined') {
    return createDefaultImportMergePreferences()
  }

  try {
    const rawValue = window.localStorage.getItem(IMPORT_MERGE_PREFERENCES_STORAGE_KEY)
    if (!rawValue) {
      return createDefaultImportMergePreferences()
    }

    const parsedValue = JSON.parse(rawValue) as Partial<ImportMergePreferences>
    return {
      sourceProfiles: Object.fromEntries(
        Object.entries(parsedValue.sourceProfiles || {}).map(([key, profile]) => [
          key,
          createImportMergePreferenceProfile(profile)
        ])
      ),
      actions: {
        experience: parsedValue.actions?.experience || 'merge',
        project: parsedValue.actions?.project || 'merge'
      },
      experience: {
        ...createDefaultExperienceMergeFields(),
        ...(parsedValue.experience || {})
      },
      project: {
        ...createDefaultProjectMergeFields(),
        ...(parsedValue.project || {})
      }
    }
  } catch {
    return createDefaultImportMergePreferences()
  }
}

/**
 * 获取导入来源标识
 * 使用应用信息、简历名和版本组合，区分不同来源的数据包策略。
 */
function getImportSourceProfileKey(data: ImportedData): string | null {
  const appName = data.appName?.trim()
  const appVersion = data.appVersion?.trim()
  const resumeName = data.resumeData?.personalInfo?.name?.trim()
  const version = data.version?.trim()

  const segments = [appName, appVersion, resumeName, version]
    .filter(Boolean)
    .map((segment) => segment?.replace(/\|/g, '-'))

  if (segments.length === 0) {
    return null
  }

  return segments.join('|')
}

/**
 * 获取导入来源展示文案
 * 在预览区标识当前是否已命中某个来源策略。
 */
function getImportSourceLabel(data: ImportedData): string {
  const appName = data.appName?.trim() || '外部来源'
  const resumeName = data.resumeData?.personalInfo?.name?.trim()

  return resumeName ? `${appName} / ${resumeName}` : appName
}

/**
 * 从来源标识中恢复展示文案
 * 兼容旧版本未保存来源标签时的历史策略列表展示。
 */
function getImportSourceLabelFromProfileKey(profileKey: string): string {
  const [appName, , resumeName] = profileKey.split('|')
  const safeAppName = appName?.trim() || '外部来源'
  const safeResumeName = resumeName?.trim()

  return safeResumeName ? `${safeAppName} / ${safeResumeName}` : safeAppName
}

/**
 * 格式化来源策略更新时间
 * 在列表中展示更容易理解的本地时间，而不是原始 ISO 字符串。
 */
function formatSourceProfileUpdatedAt(updatedAt?: string): string {
  if (!updatedAt) {
    return '时间未记录'
  }

  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) {
    return '时间未记录'
  }

  return date.toLocaleString('zh-CN')
}

/**
 * 写入导入合并偏好
 * 将用户习惯持久化到本地，供下次导入时直接复用。
 */
function writeImportMergePreferences(preferences: ImportMergePreferences): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(IMPORT_MERGE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // 忽略本地存储失败，避免影响主链导入功能
  }
}

/**
 * 获取当前已启用的工作经历合并字段标签
 * 用于在冲突卡中直接告诉用户这次会吸收哪些字段。
 */
function getEnabledExperienceFieldLabels(fields: ExperienceMergeFieldSelection): string[] {
  return EXPERIENCE_MERGE_FIELD_OPTIONS
    .filter((option) => fields[option.key])
    .map((option) => option.label)
}

/**
 * 获取当前已启用的项目合并字段标签
 * 用于在冲突卡中直接告诉用户这次会吸收哪些字段。
 */
function getEnabledProjectFieldLabels(fields: ProjectMergeFieldSelection): string[] {
  return PROJECT_MERGE_FIELD_OPTIONS
    .filter((option) => fields[option.key])
    .map((option) => option.label)
}

/**
 * 获取导入动作中文标签
 * 用于来源策略摘要和批量策略提示，避免多处重复硬编码文案。
 */
function getImportConflictActionLabel(action: ImportConflictAction): string {
  if (action === 'skip') {
    return '跳过'
  }

  if (action === 'append') {
    return '保留重复'
  }

  return '合并新增'
}

/**
 * 构建冲突项默认映射
 * 根据当前冲突摘要和一套偏好配置，统一生成动作与字段级映射。
 */
function buildConflictSelectionState(
  conflictSummary: ImportConflictSummary,
  profile: ImportMergePreferenceProfile
): Pick<ImportSelection, 'experienceConflictActions' | 'projectConflictActions' | 'experienceMergeFields' | 'projectMergeFields'> {
  return {
    experienceConflictActions: Object.fromEntries(
      conflictSummary.experience.duplicateEntries.map((entry) => [entry.id, profile.actions.experience])
    ),
    projectConflictActions: Object.fromEntries(
      conflictSummary.projects.duplicateEntries.map((entry) => [entry.id, profile.actions.project])
    ),
    experienceMergeFields: Object.fromEntries(
      conflictSummary.experience.duplicateEntries.map((entry) => [entry.id, { ...profile.experience }])
    ),
    projectMergeFields: Object.fromEntries(
      conflictSummary.projects.duplicateEntries.map((entry) => [entry.id, { ...profile.project }])
    )
  }
}

/**
 * 数据导入导出对话框组件
 * 
 * @requirements
 * - 8.1: 支持将简历数据导出为 JSON 格式文件
 * - 8.2: 支持从 JSON 文件导入简历数据
 * - 8.3: 导入数据时验证数据格式的有效性
 * - 8.4: 导入的数据格式无效时显示具体的错误信息
 * - 8.5: 支持导入时选择覆盖或合并现有数据
 * - 8.6: 导入成功时显示导入的数据摘要
 * - 8.7: 支持导出包含样式配置的完整数据包
 * - 8.8: 导入前显示数据预览，让用户确认后再导入
 */
export function ImportExportDialog({
  isOpen,
  onClose,
  resumeData,
  styleConfig,
  colorSchemes = [],
  onImport
}: ImportExportDialogProps) {
  const { success: showSuccess, error: showError } = useToastContext()
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [importedData, setImportedData] = useState<ImportedData | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importMode, setImportMode] = useState<ImportMode>('replace')
  const [importSelection, setImportSelection] = useState<ImportSelection>({
    includeResumeData: false,
    includeStyleConfig: false,
    includeColorSchemes: false,
    resumeSections: [],
    experienceConflictActions: {},
    projectConflictActions: {},
    experienceMergeFields: {},
    projectMergeFields: {}
  })
  const [showPreview, setShowPreview] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [expandedConflictEntries, setExpandedConflictEntries] = useState<Record<string, boolean>>({})
  const [previewSourceProfileKey, setPreviewSourceProfileKey] = useState<string | null>(null)
  const [sourceMergeProfiles, setSourceMergeProfiles] = useState<Record<string, ImportMergePreferenceProfile>>({})
  const [currentImportSourceKey, setCurrentImportSourceKey] = useState<string | null>(null)
  const [defaultExperienceConflictAction, setDefaultExperienceConflictAction] = useState<ImportConflictAction>('merge')
  const [defaultProjectConflictAction, setDefaultProjectConflictAction] = useState<ImportConflictAction>('merge')
  const [defaultExperienceMergeFields, setDefaultExperienceMergeFields] = useState<ExperienceMergeFieldSelection>(createDefaultExperienceMergeFields)
  const [defaultProjectMergeFields, setDefaultProjectMergeFields] = useState<ProjectMergeFieldSelection>(createDefaultProjectMergeFields)
  const [hasLoadedMergePreferences, setHasLoadedMergePreferences] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 读取已保存的字段级合并偏好
   * 组件挂载后恢复用户上一次的默认合并字段习惯。
   */
  useEffect(() => {
    const preferences = readImportMergePreferences()
    setSourceMergeProfiles(preferences.sourceProfiles)
    setDefaultExperienceConflictAction(preferences.actions.experience)
    setDefaultProjectConflictAction(preferences.actions.project)
    setDefaultExperienceMergeFields(preferences.experience)
    setDefaultProjectMergeFields(preferences.project)
    setHasLoadedMergePreferences(true)
  }, [])

  /**
   * 持久化字段级合并偏好
   * 当用户更新默认字段组合时，将其写入本地供后续导入复用。
   */
  useEffect(() => {
    if (!hasLoadedMergePreferences) {
      return
    }

    writeImportMergePreferences({
      sourceProfiles: sourceMergeProfiles,
      actions: {
        experience: defaultExperienceConflictAction,
        project: defaultProjectConflictAction
      },
      experience: defaultExperienceMergeFields,
      project: defaultProjectMergeFields
    })
  }, [
    defaultExperienceConflictAction,
    defaultProjectConflictAction,
    defaultExperienceMergeFields,
    defaultProjectMergeFields,
    hasLoadedMergePreferences,
    sourceMergeProfiles
  ])

  /**
   * 计算本次导入影响摘要
   * 根据当前勾选和导入模式，提前展示会替换或追加哪些资源。
   */
  const importImpactItems = useMemo(() => {
    if (!importedData) {
      return []
    }

    return getImportImpactSummary({
      currentResumeData: resumeData,
      currentStyleConfig: styleConfig,
      importedResumeData: importedData.resumeData,
      importedStyleConfig: importedData.styleConfig,
      currentCustomSchemeCount: colorSchemes.length,
      importedColorSchemes: importedData.colorSchemes,
      mode: importMode,
      selection: importSelection
    })
  }, [colorSchemes.length, importMode, importSelection, importedData, resumeData, styleConfig])

  /**
   * 计算重复项冲突摘要
   * 仅在导入预览阶段使用，驱动“跳过重复项”交互和说明文案。
   */
  const importConflictSummary = useMemo(() => {
    return getImportConflictSummary(resumeData, importedData?.resumeData)
  }, [importedData?.resumeData, resumeData])

  /**
   * 计算当前命中的导入预设
   * 当默认动作和默认字段组合与预设完全一致时，直接标记当前预设。
   */
  const activeImportMergePresetKey = useMemo(() => {
    const matchedPreset = IMPORT_MERGE_PRESETS.find((preset) => (
      preset.preferences.actions.experience === defaultExperienceConflictAction &&
      preset.preferences.actions.project === defaultProjectConflictAction &&
      isExperienceMergeFieldsEqual(preset.preferences.experience, defaultExperienceMergeFields) &&
      isProjectMergeFieldsEqual(preset.preferences.project, defaultProjectMergeFields)
    ))

    return matchedPreset?.key || null
  }, [
    defaultExperienceConflictAction,
    defaultExperienceMergeFields,
    defaultProjectConflictAction,
    defaultProjectMergeFields
  ])

  /**
   * 获取当前来源已保存的独立策略
   * 仅在导入预览阶段使用，用于展示来源级策略摘要和管理入口。
   */
  const currentSourceProfile = useMemo(() => {
    return currentImportSourceKey ? sourceMergeProfiles[currentImportSourceKey] || null : null
  }, [currentImportSourceKey, sourceMergeProfiles])

  /**
   * 获取当前全局默认偏好快照
   * 用于清除来源策略后快速回退到全局默认动作与字段配置。
   */
  const globalPreferenceProfile = useMemo(() => {
    return createImportMergePreferenceProfile({
      actions: {
        experience: defaultExperienceConflictAction,
        project: defaultProjectConflictAction
      },
      experience: defaultExperienceMergeFields,
      project: defaultProjectMergeFields
    })
  }, [
    defaultExperienceConflictAction,
    defaultExperienceMergeFields,
    defaultProjectConflictAction,
    defaultProjectMergeFields
  ])

  /**
   * 统计已保存的来源级策略数量
   * 用于在来源策略卡中提示当前本地已记住多少套来源偏好。
   */
  const sourceProfileCount = useMemo(() => {
    return Object.keys(sourceMergeProfiles).length
  }, [sourceMergeProfiles])

  /**
   * 生成来源策略列表
   * 便于在导入弹窗中查看最近保存的来源偏好，并支持单独删除历史策略。
   */
  const sourceProfileEntries = useMemo(() => {
    return Object.entries(sourceMergeProfiles)
      .map(([profileKey, profile]) => ({
        profileKey,
        profile,
        label: profile.sourceLabel || getImportSourceLabelFromProfileKey(profileKey),
        updatedAtLabel: formatSourceProfileUpdatedAt(profile.updatedAt),
        isCurrent: profileKey === currentImportSourceKey,
        isAppliedToCurrentImport: isImportMergeProfileEquivalent(profile, globalPreferenceProfile)
      }))
      .sort((left, right) => {
        const leftTime = left.profile.updatedAt ? new Date(left.profile.updatedAt).getTime() : 0
        const rightTime = right.profile.updatedAt ? new Date(right.profile.updatedAt).getTime() : 0

        if (leftTime !== rightTime) {
          return rightTime - leftTime
        }

        return left.label.localeCompare(right.label, 'zh-CN')
      })
  }, [currentImportSourceKey, globalPreferenceProfile, sourceMergeProfiles])

  /**
   * 获取当前正在预演的历史来源策略
   * 点击“预演后套用”时，仅暂存策略键，不立即改动当前导入默认值。
   */
  const previewSourceProfile = useMemo(() => {
    return previewSourceProfileKey ? sourceMergeProfiles[previewSourceProfileKey] || null : null
  }, [previewSourceProfileKey, sourceMergeProfiles])

  /**
   * 生成历史来源策略预演摘要
   * 在真正套用前，先说明这次会影响多少条重复岗位和同名项目。
   */
  const previewSourceImpactItems = useMemo(() => {
    if (!previewSourceProfile || !importSelection.includeResumeData) {
      return []
    }

    const items: Array<{
      key: 'experience' | 'projects'
      title: string
      count: number
      actionLabel: string
      description: string
    }> = []

    if (importSelection.resumeSections.includes('experience') && importConflictSummary.experience.duplicateCount > 0) {
      const action = previewSourceProfile.actions.experience
      const fieldLabels = getEnabledExperienceFieldLabels(previewSourceProfile.experience)
      items.push({
        key: 'experience',
        title: '重复岗位',
        count: importConflictSummary.experience.duplicateCount,
        actionLabel: getImportConflictActionLabel(action),
        description: action === 'merge'
          ? fieldLabels.length > 0
            ? `将统一按“合并新增”处理，并吸收字段：${fieldLabels.join('、')}`
            : '将统一按“合并新增”处理，但不会吸收任何字段'
          : action === 'skip'
            ? '将统一按“跳过”处理，不导入这些重复岗位'
            : '将统一按“保留重复”处理，继续作为新条目导入'
      })
    }

    if (importSelection.resumeSections.includes('projects') && importConflictSummary.projects.duplicateCount > 0) {
      const action = previewSourceProfile.actions.project
      const fieldLabels = getEnabledProjectFieldLabels(previewSourceProfile.project)
      items.push({
        key: 'projects',
        title: '同名项目',
        count: importConflictSummary.projects.duplicateCount,
        actionLabel: getImportConflictActionLabel(action),
        description: action === 'merge'
          ? fieldLabels.length > 0
            ? `将统一按“合并新增”处理，并吸收字段：${fieldLabels.join('、')}`
            : '将统一按“合并新增”处理，但不会吸收任何字段'
          : action === 'skip'
            ? '将统一按“跳过”处理，不导入这些同名项目'
            : '将统一按“保留重复”处理，继续作为新条目导入'
      })
    }

    return items
  }, [importConflictSummary.experience.duplicateCount, importConflictSummary.projects.duplicateCount, importSelection.includeResumeData, importSelection.resumeSections, previewSourceProfile])

  /**
   * 获取当前来源策略展示摘要
   * 若该来源尚未保存独立策略，则展示当前全局默认值作为回退说明。
   */
  const displayedSourcePreferenceProfile = currentSourceProfile || globalPreferenceProfile

  /**
   * 计算当前来源策略的展示标签
   * 用于在来源策略卡中快速说明岗位和项目会按什么动作处理。
   */
  const currentSourcePreferenceLabels = useMemo(() => {
    return {
      experienceAction: getImportConflictActionLabel(displayedSourcePreferenceProfile.actions.experience),
      projectAction: getImportConflictActionLabel(displayedSourcePreferenceProfile.actions.project),
      experienceFields: getEnabledExperienceFieldLabels(displayedSourcePreferenceProfile.experience),
      projectFields: getEnabledProjectFieldLabels(displayedSourcePreferenceProfile.project)
    }
  }, [displayedSourcePreferenceProfile])

  /**
   * 将指定偏好应用到当前冲突项
   * 用于来源策略恢复、预设切换和清除来源策略后的统一回写。
   */
  const applyProfileToCurrentConflicts = useCallback((profile: ImportMergePreferenceProfile) => {
    setImportSelection((prev) => ({
      ...prev,
      ...buildConflictSelectionState(importConflictSummary, profile)
    }))
  }, [importConflictSummary])

  /**
   * 处理导出
   * 导出完成后给出站内成功提示，避免用户误以为点击无效。
   */
  const handleExport = useCallback(() => {
    const exportData = createExportPackage(resumeData, styleConfig, colorSchemes)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `resume-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showSuccess('数据包已开始下载', '已导出当前简历数据和样式配置。')
  }, [colorSchemes, resumeData, showSuccess, styleConfig])

  /**
   * 解析导入文件内容
   * 同时复用在文件选择和拖拽导入两条路径上，确保校验逻辑一致。
   */
  const processImportContent = useCallback((content: string) => {
    try {
      const data = JSON.parse(content)
      const { valid, errors } = validateImportData(data)

      if (valid) {
        const nextImportedData = data as ImportedData
        const conflictSummary = getImportConflictSummary(resumeData, nextImportedData.resumeData)
        const nextImportSourceKey = getImportSourceProfileKey(nextImportedData)
        const sourceProfile = nextImportSourceKey ? sourceMergeProfiles[nextImportSourceKey] : undefined
        const appliedProfile = sourceProfile || createImportMergePreferenceProfile({
          actions: {
            experience: defaultExperienceConflictAction,
            project: defaultProjectConflictAction
          },
          experience: defaultExperienceMergeFields,
          project: defaultProjectMergeFields
        })
        setImportedData(nextImportedData)
        setCurrentImportSourceKey(nextImportSourceKey)
        setPreviewSourceProfileKey(null)
        setImportSelection({
          ...createDefaultImportSelection(nextImportedData),
          ...buildConflictSelectionState(conflictSummary, appliedProfile)
        })
        setValidationErrors([])
        setShowPreview(true)
        setExpandedConflictEntries({})
        showSuccess('导入文件已解析', '请先确认预览内容，再决定覆盖或合并导入。')
      } else {
      setImportedData(null)
      setCurrentImportSourceKey(null)
      setPreviewSourceProfileKey(null)
      setValidationErrors(errors)
      setShowPreview(false)
    }
  } catch {
      setValidationErrors([{ field: 'parse', message: 'JSON 解析失败，请检查文件格式' }])
      setImportedData(null)
      setCurrentImportSourceKey(null)
      setPreviewSourceProfileKey(null)
      setShowPreview(false)
      showError('文件解析失败', '请检查 JSON 文件格式是否正确。')
    }
  }, [
    defaultExperienceConflictAction,
    defaultExperienceMergeFields,
    defaultProjectConflictAction,
    defaultProjectMergeFields,
    resumeData,
    showError,
    showSuccess,
    sourceMergeProfiles
  ])

  /**
   * 读取指定文件
   * 支持点击选择与拖拽导入两种入口，共用 FileReader 读取逻辑。
   */
  const readImportFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setValidationErrors([{ field: 'file', message: '仅支持导入 JSON 格式文件' }])
      setImportedData(null)
      setShowPreview(false)
      showError('文件格式不支持', '请选择 .json 格式的导出备份文件。')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      processImportContent((e.target?.result as string) || '')
    }
    reader.readAsText(file)
  }, [processImportContent, showError])

  /**
   * 处理文件选择
   * 选择文件后立即读取，并重置 input 以允许重复选择同一文件。
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    readImportFile(file)
    event.target.value = ''
  }, [readImportFile])

  /**
   * 处理导入确认
   * 导入成功后短暂展示结果提示，再自动关闭弹层。
   */
  const handleImportConfirm = useCallback(() => {
    if (importedData) {
      onImport(importedData, importMode, importSelection)
      setImportSuccess(true)
      showSuccess('数据导入成功', importMode === 'replace' ? '现有内容已按新数据覆盖。' : '新数据已合并到当前简历。')
      setTimeout(() => {
        setImportSuccess(false)
        setImportedData(null)
        setShowPreview(false)
        onClose()
      }, 1500)
    }
  }, [
    importMode,
    importSelection,
    importedData,
    onClose,
    onImport,
    showSuccess
  ])

  /**
   * 重置导入状态
   * 在切换标签或重新选择文件时清理预览、错误和拖拽状态。
   */
  const resetImport = useCallback(() => {
    setImportedData(null)
    setValidationErrors([])
    setShowPreview(false)
    setImportSuccess(false)
    setIsDragging(false)
    setExpandedConflictEntries({})
    setPreviewSourceProfileKey(null)
    setCurrentImportSourceKey(null)
    setImportSelection({
      includeResumeData: false,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: [],
      experienceConflictActions: {},
      projectConflictActions: {},
      experienceMergeFields: {},
      projectMergeFields: {}
    })
  }, [])

  /**
   * 复制导出数据到剪贴板
   * 使用站内 toast 反馈复制结果，避免静默成功或失败。
   */
  const handleCopyToClipboard = useCallback(async () => {
    const exportData = createExportPackage(resumeData, styleConfig, colorSchemes)
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      showSuccess('数据已复制到剪贴板', '可以直接粘贴到本地文件或其他编辑器中。')
    } catch {
      showError('复制失败', '请检查浏览器剪贴板权限后重试。')
    }
  }, [colorSchemes, resumeData, showError, showSuccess, styleConfig])

  /**
   * 切换导入资源勾选状态
   * 在用户选择只导入内容、样式或配色时同步更新本次导入范围。
   */
  const toggleImportResource = useCallback((resource: 'resumeData' | 'styleConfig' | 'colorSchemes') => {
    setImportSelection((prev) => {
      if (resource === 'resumeData') {
        const nextIncludeResumeData = !prev.includeResumeData
        return {
          ...prev,
          includeResumeData: nextIncludeResumeData,
          resumeSections: nextIncludeResumeData && importedData
            ? getAvailableImportResumeSections(importedData.resumeData)
            : []
        }
      }

      if (resource === 'styleConfig') {
        return {
          ...prev,
          includeStyleConfig: !prev.includeStyleConfig
        }
      }

      return {
        ...prev,
        includeColorSchemes: !prev.includeColorSchemes
      }
    })
  }, [importedData])

  /**
   * 切换简历模块勾选状态
   * 支持只恢复某几个模块，减少整包导入造成的误覆盖。
   */
  const toggleResumeSection = useCallback((section: ImportResumeSection) => {
    setImportSelection((prev) => {
      const hasSection = prev.resumeSections.includes(section)
      const nextSections = hasSection
        ? prev.resumeSections.filter((item) => item !== section)
        : [...prev.resumeSections, section]

      return {
        ...prev,
        includeResumeData: nextSections.length > 0,
        resumeSections: nextSections
      }
    })
  }, [])

  /**
   * 获取冲突条目的当前处理动作
   * 未显式设置时默认返回“合并新增”，与导入建议保持一致。
   */
  const getConflictAction = useCallback((section: 'experience' | 'projects', entryId: string): ImportConflictAction => {
    return section === 'experience'
      ? importSelection.experienceConflictActions[entryId] || 'merge'
      : importSelection.projectConflictActions[entryId] || 'merge'
  }, [importSelection.experienceConflictActions, importSelection.projectConflictActions])

  /**
   * 设置单条冲突项的处理动作
   * 支持跳过、合并新增和保留重复三种导入方式。
   */
  const setConflictAction = useCallback((section: 'experience' | 'projects', entryId: string, action: ImportConflictAction) => {
    setImportSelection((prev) => (
      section === 'experience'
        ? {
            ...prev,
            experienceConflictActions: {
              ...prev.experienceConflictActions,
              [entryId]: action
            }
          }
        : {
            ...prev,
            projectConflictActions: {
              ...prev.projectConflictActions,
              [entryId]: action
            }
          }
    ))
  }, [])

  /**
   * 批量设置冲突项处理动作
   * 当重复项较多时，支持一键全部跳过、全部合并或全部保留重复。
   */
  const setAllConflictActions = useCallback((section: 'experience' | 'projects', action: ImportConflictAction) => {
    setImportSelection((prev) => (
      section === 'experience'
        ? {
            ...prev,
            experienceConflictActions: Object.fromEntries(
              importConflictSummary.experience.duplicateEntries.map((entry) => [entry.id, action])
            )
          }
        : {
            ...prev,
            projectConflictActions: Object.fromEntries(
              importConflictSummary.projects.duplicateEntries.map((entry) => [entry.id, action])
            )
        }
    ))
  }, [importConflictSummary.experience.duplicateEntries, importConflictSummary.projects.duplicateEntries])

  /**
   * 获取工作经历的字段级合并配置
   * 若当前条目尚未单独配置，则回退到默认全开策略。
   */
  const getExperienceMergeFields = useCallback((entryId: string): ExperienceMergeFieldSelection => {
    return {
      ...createDefaultExperienceMergeFields(),
      ...(importSelection.experienceMergeFields[entryId] || {})
    }
  }, [importSelection.experienceMergeFields])

  /**
   * 获取项目的字段级合并配置
   * 若当前条目尚未单独配置，则回退到默认全开策略。
   */
  const getProjectMergeFields = useCallback((entryId: string): ProjectMergeFieldSelection => {
    return {
      ...createDefaultProjectMergeFields(),
      ...(importSelection.projectMergeFields[entryId] || {})
    }
  }, [importSelection.projectMergeFields])

  /**
   * 切换工作经历的字段级合并开关
   * 用户可决定合并新增时是否吸收时间、地点或职责内容。
   */
  const toggleExperienceMergeField = useCallback((entryId: string, field: keyof ExperienceMergeFieldSelection) => {
    setImportSelection((prev) => {
      const currentFields = {
        ...createDefaultExperienceMergeFields(),
        ...(prev.experienceMergeFields[entryId] || {})
      }

      return {
        ...prev,
        experienceMergeFields: {
          ...prev.experienceMergeFields,
          [entryId]: {
            ...currentFields,
            [field]: !currentFields[field]
          }
        }
      }
    })
  }, [])

  /**
   * 切换项目的字段级合并开关
   * 用户可决定合并新增时是否吸收简介、技术栈、亮点、链接和时间。
   */
  const toggleProjectMergeField = useCallback((entryId: string, field: keyof ProjectMergeFieldSelection) => {
    setImportSelection((prev) => {
      const currentFields = {
        ...createDefaultProjectMergeFields(),
        ...(prev.projectMergeFields[entryId] || {})
      }

      return {
        ...prev,
        projectMergeFields: {
          ...prev.projectMergeFields,
          [entryId]: {
            ...currentFields,
            [field]: !currentFields[field]
          }
        }
      }
    })
  }, [])

  /**
   * 切换默认的工作经历合并字段
   * 更新后会同步应用到当前重复岗位，减少重复配置成本。
   */
  const toggleDefaultExperienceMergeField = useCallback((field: keyof ExperienceMergeFieldSelection) => {
    const nextFields = {
      ...defaultExperienceMergeFields,
      [field]: !defaultExperienceMergeFields[field]
    }

    setDefaultExperienceMergeFields(nextFields)
    setImportSelection((prev) => ({
      ...prev,
      experienceMergeFields: {
        ...prev.experienceMergeFields,
        ...Object.fromEntries(
          importConflictSummary.experience.duplicateEntries.map((entry) => [entry.id, { ...nextFields }])
        )
      }
    }))
  }, [defaultExperienceMergeFields, importConflictSummary.experience.duplicateEntries])

  /**
   * 切换默认的项目合并字段
   * 更新后会同步应用到当前同名项目，确保默认值与当前视图一致。
   */
  const toggleDefaultProjectMergeField = useCallback((field: keyof ProjectMergeFieldSelection) => {
    const nextFields = {
      ...defaultProjectMergeFields,
      [field]: !defaultProjectMergeFields[field]
    }

    setDefaultProjectMergeFields(nextFields)
    setImportSelection((prev) => ({
      ...prev,
      projectMergeFields: {
        ...prev.projectMergeFields,
        ...Object.fromEntries(
          importConflictSummary.projects.duplicateEntries.map((entry) => [entry.id, { ...nextFields }])
        )
      }
    }))
  }, [defaultProjectMergeFields, importConflictSummary.projects.duplicateEntries])

  /**
   * 切换默认的工作经历处理动作
   * 更新后会同步覆盖当前重复岗位的处理动作，并保存为后续导入默认值。
   */
  const setDefaultExperienceAction = useCallback((action: ImportConflictAction) => {
    setDefaultExperienceConflictAction(action)
    setImportSelection((prev) => ({
      ...prev,
      experienceConflictActions: Object.fromEntries(
        importConflictSummary.experience.duplicateEntries.map((entry) => [entry.id, action])
      )
    }))
  }, [importConflictSummary.experience.duplicateEntries])

  /**
   * 切换默认的项目处理动作
   * 更新后会同步覆盖当前同名项目的处理动作，并保存为后续导入默认值。
   */
  const setDefaultProjectAction = useCallback((action: ImportConflictAction) => {
    setDefaultProjectConflictAction(action)
    setImportSelection((prev) => ({
      ...prev,
      projectConflictActions: Object.fromEntries(
        importConflictSummary.projects.duplicateEntries.map((entry) => [entry.id, action])
      )
    }))
  }, [importConflictSummary.projects.duplicateEntries])

  /**
   * 应用导入偏好预设
   * 统一更新默认动作、默认字段，并同步覆盖当前冲突项的导入策略。
   */
  const applyImportMergePreset = useCallback((presetKey: ImportMergePresetKey) => {
    const preset = IMPORT_MERGE_PRESETS.find((item) => item.key === presetKey)
    if (!preset) {
      return
    }

    setDefaultExperienceConflictAction(preset.preferences.actions.experience)
    setDefaultProjectConflictAction(preset.preferences.actions.project)
    setDefaultExperienceMergeFields(preset.preferences.experience)
    setDefaultProjectMergeFields(preset.preferences.project)
    applyProfileToCurrentConflicts(preset.preferences)
  }, [applyProfileToCurrentConflicts])

  /**
   * 覆盖保存当前来源策略
   * 将当前默认动作和默认字段写入来源级策略，并立即同步到当前冲突项。
   */
  const handleSaveCurrentSourceProfile = useCallback(() => {
    if (!currentImportSourceKey || !importedData) {
      return
    }

    const nextProfile = createImportMergePreferenceProfile({
      actions: {
        experience: defaultExperienceConflictAction,
        project: defaultProjectConflictAction
      },
      experience: defaultExperienceMergeFields,
      project: defaultProjectMergeFields,
      sourceLabel: getImportSourceLabel(importedData),
      updatedAt: new Date().toISOString()
    })

    setSourceMergeProfiles((prev) => ({
      ...prev,
      [currentImportSourceKey]: nextProfile
    }))
    applyProfileToCurrentConflicts(nextProfile)
    showSuccess('来源策略已保存', `下次导入“${getImportSourceLabel(importedData)}”时会优先使用这套默认策略。`)
  }, [
    applyProfileToCurrentConflicts,
    currentImportSourceKey,
    defaultExperienceConflictAction,
    defaultExperienceMergeFields,
    defaultProjectConflictAction,
    defaultProjectMergeFields,
    importedData,
    showSuccess
  ])

  /**
   * 套用历史来源策略到当前导入
   * 直接覆盖当前默认动作和默认字段，并同步刷新本次导入冲突项的处理方式。
   */
  const handleApplySourceProfileToCurrentImport = useCallback((profileKey: string) => {
    const targetProfile = sourceMergeProfiles[profileKey]
    if (!targetProfile) {
      return
    }

    const targetLabel = targetProfile.sourceLabel || getImportSourceLabelFromProfileKey(profileKey)
    setDefaultExperienceConflictAction(targetProfile.actions.experience)
    setDefaultProjectConflictAction(targetProfile.actions.project)
    setDefaultExperienceMergeFields(targetProfile.experience)
    setDefaultProjectMergeFields(targetProfile.project)
    applyProfileToCurrentConflicts(targetProfile)
    setPreviewSourceProfileKey(null)
    showSuccess('历史策略已套用', `已将“${targetLabel}”的处理方式应用到当前这次导入。`)
  }, [applyProfileToCurrentConflicts, showSuccess, sourceMergeProfiles])

  /**
   * 删除指定来源策略
   * 支持在历史来源列表中单独清理一条记录；若删除的是当前来源，则同步回退到全局默认。
   */
  const handleRemoveSourceProfile = useCallback((profileKey: string, silent = false) => {
    const removedProfile = sourceMergeProfiles[profileKey]
    if (!removedProfile) {
      return
    }

    const removedLabel = removedProfile.sourceLabel || getImportSourceLabelFromProfileKey(profileKey)
    setSourceMergeProfiles((prev) => {
      const nextProfiles = { ...prev }
      delete nextProfiles[profileKey]
      return nextProfiles
    })

    if (profileKey === previewSourceProfileKey) {
      setPreviewSourceProfileKey(null)
    }

    if (profileKey === currentImportSourceKey) {
      applyProfileToCurrentConflicts(globalPreferenceProfile)
    }

    if (!silent) {
      showSuccess('来源策略已删除', `“${removedLabel}”的历史导入策略已从本地移除。`)
    }
  }, [
    applyProfileToCurrentConflicts,
    currentImportSourceKey,
    globalPreferenceProfile,
    previewSourceProfileKey,
    showSuccess,
    sourceMergeProfiles
  ])

  /**
   * 清除当前来源策略
   * 删除来源级历史偏好，并让当前冲突项立即回退到全局默认策略。
   */
  const handleClearCurrentSourceProfile = useCallback(() => {
    if (!currentImportSourceKey || !importedData) {
      return
    }

    handleRemoveSourceProfile(currentImportSourceKey, true)
    showSuccess('来源策略已清除', `“${getImportSourceLabel(importedData)}”已回退为跟随全局默认策略。`)
  }, [currentImportSourceKey, handleRemoveSourceProfile, importedData, showSuccess])

  /**
   * 切换冲突条目完整差异展开状态
   * 仅在用户需要看完整职责、亮点和技术栈时展开详细视图。
   */
  const toggleConflictEntryExpanded = useCallback((section: 'experience' | 'projects', entryId: string) => {
    const entryKey = buildConflictEntryKey(section, entryId)

    setExpandedConflictEntries((prev) => ({
      ...prev,
      [entryKey]: !prev[entryKey]
    }))
  }, [])

  /**
   * 处理文件拖拽进入
   * 激活拖拽高亮态，提升导入区域的可感知性。
   */
  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  /**
   * 处理文件拖拽悬停
   * 阻止浏览器默认打开文件行为，保持在当前对话框内导入。
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  /**
   * 处理文件拖拽离开
   * 当拖拽离开导入区域时取消高亮状态。
   */
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  /**
   * 处理文件拖拽释放
   * 直接读取第一个拖入文件，完成真正可用的拖拽导入闭环。
   */
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]
    if (!droppedFile) {
      return
    }

    readImportFile(droppedFile)
  }, [readImportFile])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="app-shell-brand-mark h-10 w-10 shrink-0 rounded-xl">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">数据管理</h2>
                <p className="mt-1 text-sm text-slate-500">导入、导出和备份当前简历数据与样式配置。</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* 标签页 */}
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="app-shell-toolbar-group w-full justify-start">
              <button
                type="button"
                onClick={() => { setActiveTab('export'); resetImport(); }}
                className={`inline-flex h-10 items-center gap-2 px-4 ${
                  activeTab === 'export'
                    ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                    : 'app-shell-toolbar-button'
                }`}
              >
                <Download size={16} />
                导出数据
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('import'); resetImport(); }}
                className={`inline-flex h-10 items-center gap-2 px-4 ${
                  activeTab === 'import'
                    ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                    : 'app-shell-toolbar-button'
                }`}
              >
                <Upload size={16} />
                导入数据
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {activeTab === 'export' ? (
              /* 导出面板 */
              <div className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      导出工作流
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">导出完整备份数据包</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      当前简历内容、样式设置和版本信息会一起打包为 JSON，适合跨设备迁移和长期备份。
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      当前状态
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      已准备好导出一份完整数据快照
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      建议在重要修改前后各导出一次，减少误删或覆盖带来的损失。
                    </p>
                  </div>
                </div>
                
                {/* 导出内容预览 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-700">导出内容包含：</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText size={14} className="text-blue-500" />
                      <span>简历数据（个人信息、工作经历、教育背景等）</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Palette size={14} className="text-purple-500" />
                      <span>样式配置（颜色、字体、间距等）</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Settings size={14} className="text-gray-500" />
                      <span>版本信息和导出时间</span>
                    </div>
                  </div>
                </div>

                {/* 导出按钮 */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Download size={16} />
                    下载 JSON 文件
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="app-shell-action-button h-11 rounded-xl px-4 text-sm"
                    title="复制到剪贴板"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* 导入面板 */
              <div className="space-y-4">
                {importSuccess ? (
                  /* 导入成功 */
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">导入成功</h3>
                    <p className="text-sm text-gray-500">数据已成功导入</p>
                  </motion.div>
                ) : showPreview && importedData ? (
                  /* 数据预览 */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-700">数据预览</h4>
                      <button
                        type="button"
                        onClick={resetImport}
                        className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                      >
                        <RefreshCw size={12} />
                        重新选择
                      </button>
                    </div>

                    {/* 预览内容 */}
                    <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 no-scrollbar">
                      {(() => {
                        const summary = getImportedDataSummary(importedData)
                        const sectionMeta = getImportSectionMeta(importedData)

                        return (
                          <div className="space-y-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">简历主体</p>
                              <p className="mt-1 text-sm font-medium text-slate-800">{summary.resumeName}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">内容条目</p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {summary.experienceCount} 段经历 / {summary.projectCount} 个项目 / {summary.skillCount} 项技能
                              </p>
                            </div>
                          </div>
                            <div className="grid gap-2">
                              {importedData.resumeData && (
                                <button
                                  type="button"
                                  onClick={() => toggleImportResource('resumeData')}
                                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                    importSelection.includeResumeData
                                      ? 'border-slate-900 bg-white'
                                      : 'border-slate-200 bg-white/70 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
                                        importSelection.includeResumeData
                                          ? 'border-slate-900 bg-slate-900 text-white'
                                          : 'border-slate-300 bg-white text-transparent'
                                      }`}>
                                        ✓
                                      </span>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">导入简历内容</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          个人信息、经历、教育、技能和项目内容将按所选模块恢复。
                                        </p>
                                      </div>
                                    </div>
                                    <FileText size={16} className="shrink-0 text-blue-500" />
                                  </div>
                                </button>
                              )}

                              {importSelection.includeResumeData && sectionMeta.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    内容模块选择
                                  </p>
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {sectionMeta.map((section) => {
                                      const isSelected = importSelection.resumeSections.includes(section.key)
                                      return (
                                        <button
                                          key={section.key}
                                          type="button"
                                          onClick={() => toggleResumeSection(section.key)}
                                          className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                                            isSelected
                                              ? 'border-slate-900 bg-slate-50'
                                              : 'border-slate-200 bg-white hover:bg-slate-50'
                                          }`}
                                        >
                                          <p className="text-sm font-medium text-slate-900">{section.label}</p>
                                          <p className="mt-1 text-xs text-slate-500">{section.countLabel}</p>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {importedData.styleConfig && (
                                <button
                                  type="button"
                                  onClick={() => toggleImportResource('styleConfig')}
                                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                    importSelection.includeStyleConfig
                                      ? 'border-slate-900 bg-white'
                                      : 'border-slate-200 bg-white/70 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
                                        importSelection.includeStyleConfig
                                          ? 'border-slate-900 bg-slate-900 text-white'
                                          : 'border-slate-300 bg-white text-transparent'
                                      }`}>
                                        ✓
                                      </span>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">导入样式设置</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          会恢复当前简历的字号、间距、颜色和布局配置。
                                        </p>
                                      </div>
                                    </div>
                                    <Palette size={16} className="shrink-0 text-purple-500" />
                                  </div>
                                </button>
                              )}

                              {importedData.colorSchemes && importedData.colorSchemes.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleImportResource('colorSchemes')}
                                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                    importSelection.includeColorSchemes
                                      ? 'border-slate-900 bg-white'
                                      : 'border-slate-200 bg-white/70 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
                                        importSelection.includeColorSchemes
                                          ? 'border-slate-900 bg-slate-900 text-white'
                                          : 'border-slate-300 bg-white text-transparent'
                                      }`}>
                                        ✓
                                      </span>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">导入自定义配色</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          本次备份包含 {importedData.colorSchemes.length} 套配色方案，可用于后续模板切换。
                                        </p>
                                      </div>
                                    </div>
                                    <Settings size={16} className="shrink-0 text-slate-500" />
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                      <div className="border-t border-slate-200 pt-2 text-xs text-slate-400">
                        导出时间: {new Date(importedData.exportedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {/* 导入模式选择 */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        导入模式
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setImportMode('replace')}
                          className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                            importMode === 'replace'
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          覆盖现有数据
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportMode('merge')}
                          className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                            importMode === 'merge'
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          合并数据
                        </button>
                      </div>
                    </div>

                    {importMode === 'merge' && (
                      (importSelection.includeResumeData && importSelection.resumeSections.includes('experience') && importConflictSummary.experience.duplicateCount > 0) ||
                      (importSelection.includeResumeData && importSelection.resumeSections.includes('projects') && importConflictSummary.projects.duplicateCount > 0)
                    ) && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          重复项处理
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">导入偏好预设</p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  先选一套常用策略，再按模块微调默认动作和合并字段。
                                </p>
                                {importedData && (
                                  <p className="mt-2 text-xs leading-5 text-slate-400">
                                    当前来源：{getImportSourceLabel(importedData)}{currentSourceProfile ? '，已保存独立策略。' : '，当前使用全局默认策略。'}
                                  </p>
                                )}
                              </div>
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                {activeImportMergePresetKey
                                  ? IMPORT_MERGE_PRESETS.find((preset) => preset.key === activeImportMergePresetKey)?.label
                                  : '自定义'}
                              </span>
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              {IMPORT_MERGE_PRESETS.map((preset) => {
                                const isActive = activeImportMergePresetKey === preset.key
                                return (
                                  <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => applyImportMergePreset(preset.key)}
                                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                      isActive
                                        ? 'border-slate-900 bg-white'
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                    }`}
                                  >
                                    <p className="text-sm font-medium text-slate-900">{preset.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{preset.description}</p>
                                  </button>
                                )
                              })}
                            </div>
                            {importedData && currentImportSourceKey && (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">来源策略管理</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                      当前来源可单独保存一套处理策略，下次导入时会优先套用，不影响其他来源的默认规则。
                                    </p>
                                  </div>
                                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                    currentSourceProfile
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : 'border-slate-200 bg-slate-50 text-slate-500'
                                  }`}>
                                    {currentSourceProfile ? '已保存来源策略' : '跟随全局默认'}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    岗位默认：{currentSourcePreferenceLabels.experienceAction}
                                  </span>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    项目默认：{currentSourcePreferenceLabels.projectAction}
                                  </span>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    岗位字段：{currentSourcePreferenceLabels.experienceFields.length > 0 ? currentSourcePreferenceLabels.experienceFields.join('、') : '不合并字段'}
                                  </span>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    项目字段：{currentSourcePreferenceLabels.projectFields.length > 0 ? currentSourcePreferenceLabels.projectFields.join('、') : '不合并字段'}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={handleSaveCurrentSourceProfile}
                                    className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                  >
                                    覆盖保存当前来源策略
                                  </button>
                                  {currentSourceProfile && (
                                    <button
                                      type="button"
                                      onClick={handleClearCurrentSourceProfile}
                                      className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100"
                                    >
                                      清除当前来源策略
                                    </button>
                                  )}
                                </div>
                                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                                  当前本地已记住 {sourceProfileCount} 个来源策略。保存后只会覆盖“{getImportSourceLabel(importedData)}”这一类导入包。
                                </p>
                                {sourceProfileEntries.length > 0 && (
                                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                          最近保存的来源策略
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                          可直接把历史来源策略套用到当前导入，也能按需单独删除某条历史策略。
                                        </p>
                                      </div>
                                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                        最近 {Math.min(sourceProfileEntries.length, 5)} 条
                                      </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {sourceProfileEntries.slice(0, 5).map((entry) => {
                                        const experienceFields = getEnabledExperienceFieldLabels(entry.profile.experience)
                                        const projectFields = getEnabledProjectFieldLabels(entry.profile.project)
                                        const isPreviewing = previewSourceProfileKey === entry.profileKey
                                        return (
                                          <div
                                            key={entry.profileKey}
                                            className={`rounded-xl border px-3 py-3 ${
                                              entry.isCurrent
                                                ? 'border-slate-900 bg-white'
                                                : 'border-slate-200 bg-white'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                                                  {entry.isCurrent && (
                                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                                      当前来源
                                                    </span>
                                                  )}
                                                  {entry.isAppliedToCurrentImport && (
                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                      已套用到当前导入
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                                                  更新时间：{entry.updatedAtLabel}
                                                </p>
                                              </div>
                                              <div className="flex flex-wrap items-center justify-end gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => setPreviewSourceProfileKey((prev) => (
                                                    prev === entry.profileKey ? null : entry.profileKey
                                                  ))}
                                                  disabled={entry.isAppliedToCurrentImport}
                                                  className={`inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[11px] font-medium transition-colors ${
                                                    entry.isAppliedToCurrentImport
                                                      ? 'cursor-default border border-slate-200 bg-slate-100 text-slate-400'
                                                      : isPreviewing
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'app-shell-action-button border px-2.5'
                                                  }`}
                                                >
                                                  {entry.isAppliedToCurrentImport ? '当前已套用' : isPreviewing ? '取消预演' : '预演后套用'}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemoveSourceProfile(entry.profileKey)}
                                                  className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-medium text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100"
                                                >
                                                  删除
                                                </button>
                                              </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                岗位：{getImportConflictActionLabel(entry.profile.actions.experience)}
                                              </span>
                                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                项目：{getImportConflictActionLabel(entry.profile.actions.project)}
                                              </span>
                                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                岗位字段：{experienceFields.length > 0 ? experienceFields.join('、') : '不合并字段'}
                                              </span>
                                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                项目字段：{projectFields.length > 0 ? projectFields.join('、') : '不合并字段'}
                                              </span>
                                            </div>
                                            {isPreviewing && (
                                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                  <div>
                                                    <p className="text-sm font-semibold text-slate-900">策略预演</p>
                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                      确认后会把这套历史来源策略应用到当前这次导入，不会自动覆盖当前来源的保存关系。
                                                    </p>
                                                  </div>
                                                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                                    {entry.label}
                                                  </span>
                                                </div>
                                                <div className="mt-3 grid gap-2">
                                                  {previewSourceImpactItems.length > 0 ? previewSourceImpactItems.map((item) => (
                                                    <div key={`${entry.profileKey}-${item.key}`} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                      <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                          <p className="text-sm font-medium text-slate-900">
                                                            {item.title}：{item.count} 条
                                                          </p>
                                                          <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                                                        </div>
                                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                          {item.actionLabel}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )) : (
                                                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs leading-5 text-slate-500">
                                                      当前导入范围里没有可预演的重复岗位或同名项目。
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleApplySourceProfileToCurrentImport(entry.profileKey)}
                                                    className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                                  >
                                                    确认套用这套策略
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => setPreviewSourceProfileKey(null)}
                                                    className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                                                  >
                                                    先不应用
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {importSelection.includeResumeData && importSelection.resumeSections.includes('experience') && importConflictSummary.experience.duplicateCount > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">重复岗位处理</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    检测到 {importConflictSummary.experience.duplicateCount} 条与当前简历相同的公司/职位组合，可逐条决定跳过、合并新增或保留重复。
                                  </p>
                                </div>
                                <FileText size={16} className="shrink-0 text-blue-500" />
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <div className="w-full rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    默认处理动作
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    会记住你的偏好，并同步应用到当前重复岗位。
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {[
                                      { key: 'skip', label: '默认跳过' },
                                      { key: 'merge', label: '默认合并新增' },
                                      { key: 'append', label: '默认保留重复' }
                                    ].map((option) => (
                                      <button
                                        key={`default-experience-action-${option.key}`}
                                        type="button"
                                        onClick={() => setDefaultExperienceAction(option.key as ImportConflictAction)}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                          defaultExperienceConflictAction === option.key
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="w-full rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    默认合并字段
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    会记住你的偏好，并同步应用到当前重复岗位。
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {EXPERIENCE_MERGE_FIELD_OPTIONS.map((option) => {
                                      const enabled = defaultExperienceMergeFields[option.key]
                                      return (
                                        <button
                                          key={`default-experience-${option.key}`}
                                          type="button"
                                          onClick={() => toggleDefaultExperienceMergeField(option.key)}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                            enabled
                                              ? 'border-slate-900 bg-slate-900 text-white'
                                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                          }`}
                                        >
                                          {option.label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('experience', 'skip')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部跳过
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('experience', 'merge')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部合并新增
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('experience', 'append')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部保留重复
                                </button>
                              </div>
                              <div className="mt-3 space-y-2">
                                {importConflictSummary.experience.duplicateEntries.map((entry) => {
                                  const action = getConflictAction('experience', entry.id)
                                  const experienceMergeFields = getExperienceMergeFields(entry.id)
                                  const enabledExperienceFieldLabels = getEnabledExperienceFieldLabels(experienceMergeFields)
                                  const entryKey = buildConflictEntryKey('experience', entry.id)
                                  const isExpanded = Boolean(expandedConflictEntries[entryKey])
                                  const hasExpandedDetails = entry.comparisonSections.length > 0
                                  const actionText = action === 'skip'
                                    ? '当前将跳过该重复岗位'
                                    : action === 'append'
                                      ? '当前将保留为重复岗位继续导入'
                                      : enabledExperienceFieldLabels.length > 0
                                        ? `当前将合并字段：${enabledExperienceFieldLabels.join('、')}`
                                        : '当前未选择任何合并字段，将保留当前版本'
                                  return (
                                    <div
                                      key={entry.id}
                                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                                        action === 'skip'
                                          ? 'border-slate-900 bg-white'
                                          : action === 'append'
                                            ? 'border-amber-300 bg-amber-50/60'
                                            : 'border-emerald-300 bg-emerald-50/50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                                          <p className="mt-1 text-xs text-slate-500">{actionText}</p>
                                          {entry.diffDetails.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              {entry.diffDetails.map((detail) => (
                                                <span
                                                  key={`${entry.id}-${detail}`}
                                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] leading-5 text-slate-600"
                                                >
                                                  {detail}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                        {action === 'skip' ? '跳过' : action === 'append' ? '保留重复' : '合并新增'}
                                      </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setConflictAction('experience', entry.id, 'skip')}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                          action === 'skip'
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                        }`}
                                      >
                                        跳过
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConflictAction('experience', entry.id, 'merge')}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                          action === 'merge'
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                        }`}
                                      >
                                        合并新增
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConflictAction('experience', entry.id, 'append')}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                          action === 'append'
                                            ? 'border-amber-500 bg-amber-500 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                        }`}
                                      >
                                        保留重复
                                      </button>
                                    </div>
                                    {action === 'merge' && (
                                      <div className="mt-3 rounded-xl border border-emerald-200 bg-white/80 p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                          合并字段
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {EXPERIENCE_MERGE_FIELD_OPTIONS.map((option) => {
                                            const enabled = experienceMergeFields[option.key]
                                            return (
                                              <button
                                                key={`${entry.id}-${option.key}`}
                                                type="button"
                                                onClick={() => toggleExperienceMergeField(entry.id, option.key)}
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                                  enabled
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                                }`}
                                              >
                                                {option.label}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                      {hasExpandedDetails && (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                          <button
                                            type="button"
                                            onClick={() => toggleConflictEntryExpanded('experience', entry.id)}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                                          >
                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            {isExpanded ? '收起完整差异' : '查看完整差异'}
                                          </button>
                                          {isExpanded && (
                                            <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                                              {entry.comparisonSections.map((section) => (
                                                <div key={`${entry.id}-${section.title}`}>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    {section.title}
                                                  </p>
                                                  <div className="mt-2 grid gap-3 lg:grid-cols-2">
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                        当前版本
                                                      </p>
                                                      <div className="mt-2 space-y-1.5">
                                                        {section.currentItems.length > 0 ? section.currentItems.map((item) => (
                                                          <div
                                                            key={`${entry.id}-${section.title}-current-${item}`}
                                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
                                                          >
                                                            {item}
                                                          </div>
                                                        )) : (
                                                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-400">
                                                            未填写
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                        导入版本
                                                      </p>
                                                      <div className="mt-2 space-y-1.5">
                                                        {section.importedItems.length > 0 ? section.importedItems.map((item) => (
                                                          <div
                                                            key={`${entry.id}-${section.title}-imported-${item}`}
                                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
                                                          >
                                                            {item}
                                                          </div>
                                                        )) : (
                                                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-400">
                                                            未填写
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {importSelection.includeResumeData && importSelection.resumeSections.includes('projects') && importConflictSummary.projects.duplicateCount > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">同名项目处理</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    检测到 {importConflictSummary.projects.duplicateCount} 个同名项目，可逐条决定跳过、合并新增或保留重复。
                                  </p>
                                </div>
                                <Settings size={16} className="shrink-0 text-amber-500" />
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <div className="w-full rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    默认处理动作
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    会记住你的偏好，并同步应用到当前同名项目。
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {[
                                      { key: 'skip', label: '默认跳过' },
                                      { key: 'merge', label: '默认合并新增' },
                                      { key: 'append', label: '默认保留重复' }
                                    ].map((option) => (
                                      <button
                                        key={`default-project-action-${option.key}`}
                                        type="button"
                                        onClick={() => setDefaultProjectAction(option.key as ImportConflictAction)}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                          defaultProjectConflictAction === option.key
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="w-full rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    默认合并字段
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    会记住你的偏好，并同步应用到当前同名项目。
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {PROJECT_MERGE_FIELD_OPTIONS.map((option) => {
                                      const enabled = defaultProjectMergeFields[option.key]
                                      return (
                                        <button
                                          key={`default-project-${option.key}`}
                                          type="button"
                                          onClick={() => toggleDefaultProjectMergeField(option.key)}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                            enabled
                                              ? 'border-slate-900 bg-slate-900 text-white'
                                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                          }`}
                                        >
                                          {option.label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('projects', 'skip')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部跳过
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('projects', 'merge')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部合并新增
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAllConflictActions('projects', 'append')}
                                  className="app-shell-action-button h-8 rounded-xl px-3 text-xs"
                                >
                                  全部保留重复
                                </button>
                              </div>
                              <div className="mt-3 space-y-2">
                                {importConflictSummary.projects.duplicateEntries.map((entry) => {
                                  const action = getConflictAction('projects', entry.id)
                                  const projectMergeFields = getProjectMergeFields(entry.id)
                                  const enabledProjectFieldLabels = getEnabledProjectFieldLabels(projectMergeFields)
                                  const entryKey = buildConflictEntryKey('projects', entry.id)
                                  const isExpanded = Boolean(expandedConflictEntries[entryKey])
                                  const hasExpandedDetails = entry.comparisonSections.length > 0
                                  const actionText = action === 'skip'
                                    ? '当前将跳过该同名项目'
                                    : action === 'append'
                                      ? '当前将保留为同名项目继续导入'
                                      : enabledProjectFieldLabels.length > 0
                                        ? `当前将合并字段：${enabledProjectFieldLabels.join('、')}`
                                        : '当前未选择任何合并字段，将保留当前版本'
                                  return (
                                    <div
                                      key={entry.id}
                                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                                        action === 'skip'
                                          ? 'border-slate-900 bg-white'
                                          : action === 'append'
                                            ? 'border-amber-300 bg-amber-50/60'
                                            : 'border-emerald-300 bg-emerald-50/50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                                          <p className="mt-1 text-xs text-slate-500">{actionText}</p>
                                          {entry.diffDetails.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              {entry.diffDetails.map((detail) => (
                                                <span
                                                  key={`${entry.id}-${detail}`}
                                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] leading-5 text-slate-600"
                                                >
                                                  {detail}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                          {action === 'skip' ? '跳过' : action === 'append' ? '保留重复' : '合并新增'}
                                        </span>
                                      </div>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setConflictAction('projects', entry.id, 'skip')}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                            action === 'skip'
                                              ? 'border-slate-900 bg-slate-900 text-white'
                                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                          }`}
                                        >
                                          跳过
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConflictAction('projects', entry.id, 'merge')}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                            action === 'merge'
                                              ? 'border-emerald-600 bg-emerald-600 text-white'
                                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                          }`}
                                        >
                                          合并新增
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConflictAction('projects', entry.id, 'append')}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                            action === 'append'
                                              ? 'border-amber-500 bg-amber-500 text-white'
                                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                          }`}
                                        >
                                        保留重复
                                      </button>
                                    </div>
                                    {action === 'merge' && (
                                      <div className="mt-3 rounded-xl border border-emerald-200 bg-white/80 p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                          合并字段
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {PROJECT_MERGE_FIELD_OPTIONS.map((option) => {
                                            const enabled = projectMergeFields[option.key]
                                            return (
                                              <button
                                                key={`${entry.id}-${option.key}`}
                                                type="button"
                                                onClick={() => toggleProjectMergeField(entry.id, option.key)}
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                                  enabled
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                                }`}
                                              >
                                                {option.label}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                      {hasExpandedDetails && (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                          <button
                                            type="button"
                                            onClick={() => toggleConflictEntryExpanded('projects', entry.id)}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                                          >
                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            {isExpanded ? '收起完整差异' : '查看完整差异'}
                                          </button>
                                          {isExpanded && (
                                            <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                                              {entry.comparisonSections.map((section) => (
                                                <div key={`${entry.id}-${section.title}`}>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    {section.title}
                                                  </p>
                                                  <div className="mt-2 grid gap-3 lg:grid-cols-2">
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                        当前版本
                                                      </p>
                                                      <div className="mt-2 space-y-1.5">
                                                        {section.currentItems.length > 0 ? section.currentItems.map((item) => (
                                                          <div
                                                            key={`${entry.id}-${section.title}-current-${item}`}
                                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
                                                          >
                                                            {item}
                                                          </div>
                                                        )) : (
                                                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-400">
                                                            未填写
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                        导入版本
                                                      </p>
                                                      <div className="mt-2 space-y-1.5">
                                                        {section.importedItems.length > 0 ? section.importedItems.map((item) => (
                                                          <div
                                                            key={`${entry.id}-${section.title}-imported-${item}`}
                                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
                                                          >
                                                            {item}
                                                          </div>
                                                        )) : (
                                                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-400">
                                                            未填写
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {importImpactItems.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          导入影响摘要
                        </p>
                        <div className="mt-3 space-y-2">
                          {importImpactItems.map((item) => {
                            const iconClassName = item.type === 'content'
                              ? 'border-blue-200 bg-blue-50 text-blue-600'
                              : item.type === 'style'
                                ? 'border-purple-200 bg-purple-50 text-purple-600'
                                : 'border-amber-200 bg-amber-50 text-amber-600'

                            return (
                              <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                <div className="flex items-start gap-3">
                                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${iconClassName}`}>
                                    {item.type === 'content' ? <FileText size={14} /> : item.type === 'style' ? <Palette size={14} /> : <Settings size={14} />}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                                    {item.details && item.details.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {item.details.map((detail) => (
                                          <span
                                            key={detail}
                                            className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                                          >
                                            {detail}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* 确认导入按钮 */}
                    <button
                      type="button"
                      onClick={handleImportConfirm}
                      disabled={!hasSelectedImportContent(importSelection)}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={16} />
                      确认导入选中内容
                    </button>
                  </div>
                ) : (
                  /* 文件选择 */
                  <div className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)]">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          导入工作流
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">从 JSON 备份恢复简历数据</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          支持点击选择和拖拽导入，导入前会先校验格式并展示内容预览。
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          导入建议
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          如需完全恢复旧数据，选择“覆盖现有数据”更稳妥。
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          如果只是补充部分内容，可先预览再选择“合并数据”。
                        </p>
                      </div>
                    </div>

                    {/* 验证错误 */}
                    {validationErrors.length > 0 && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-rose-700">
                          <AlertCircle size={16} />
                          <span className="font-medium">导入失败</span>
                        </div>
                        <ul className="space-y-1 text-sm text-rose-600">
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 文件上传区域 */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      } cursor-pointer`}
                    >
                      <FileJson size={40} className={`mx-auto mb-3 ${isDragging ? 'text-slate-900' : 'text-slate-400'}`} />
                      <p className="mb-1 text-sm font-medium text-slate-700">
                        点击选择文件或拖拽到此处
                      </p>
                      <p className="text-xs text-slate-500">
                        支持 .json 格式文件
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        仅导入由简历助手导出的备份文件，其他 JSON 可能无法识别。
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImportExportDialog
