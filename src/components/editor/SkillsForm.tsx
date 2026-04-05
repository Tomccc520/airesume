
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Code, GripVertical, Palette, Plus, SlidersHorizontal, ArrowDownWideNarrow, Sparkles, RotateCcw, Lock, Unlock } from 'lucide-react'
import { AnimatePresence, Reorder } from 'framer-motion'
import { Skill } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { useLanguage } from '@/contexts/LanguageContext'
import { StyleConfig, useStyle } from '@/contexts/StyleContext'
import { useToastContext } from '@/components/Toast'
import {
  buildSkillReclassificationPlan,
  getDefaultSkillCategory,
  getSkillCategoryOptions,
  parseQuickSkillTokens,
  resolveCategoryFamily,
  SkillClassificationLocale,
  SkillReclassificationPlan
} from '@/domain/skills/skillClassification'
import {
  buildQuickAddSkillPlan,
  buildSkillCleanupPlan,
  SkillCleanupPlan
} from '@/domain/skills/skillCleanup'

interface SkillsFormProps {
  skills: Skill[]
  onChange: (data: Skill[]) => void
  showSectionHeader?: boolean
}

type SkillDisplayStyle = StyleConfig['skills']['displayStyle']

interface SkillStyleOption {
  value: SkillDisplayStyle
  label: string
  icon: string
}

interface SkillPackOption {
  key: string
  label: string
  category: string
  values: string[]
}

type SkillUndoMode = 'reclassification' | 'cleanup'

/**
 * 预设技能颜色
 * 提供常用且对比度友好的配色，方便快速标记技能类别。
 */
const PRESET_COLORS = [
  '#2563EB',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#4B5563'
]

export function SkillsForm({
  skills,
  onChange,
  showSectionHeader = true
}: SkillsFormProps) {
  const { t, locale } = useLanguage()
  const currentLocale: SkillClassificationLocale = locale === 'zh' ? 'zh' : 'en'
  const { styleConfig, updateStyleConfig } = useStyle()
  const { success: showSuccess, info: showInfo } = useToastContext()
  const [showAdvancedStyles, setShowAdvancedStyles] = useState(false)
  const [showLockedOnly, setShowLockedOnly] = useState(false)
  const [quickInput, setQuickInput] = useState('')
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(skills[0]?.id || null)
  const [reclassificationPreview, setReclassificationPreview] = useState<SkillReclassificationPlan | null>(null)
  const [cleanupPreview, setCleanupPreview] = useState<SkillCleanupPlan | null>(null)
  const [undoState, setUndoState] = useState<{ skills: Skill[]; mode: SkillUndoMode } | null>(null)

  const mainstreamStyles: SkillStyleOption[] = [
    { value: 'progress', label: locale === 'zh' ? '进度条' : 'Progress', icon: '━' },
    { value: 'tags', label: locale === 'zh' ? '标签' : 'Tags', icon: 'TAG' },
    { value: 'list', label: locale === 'zh' ? '列表' : 'List', icon: '•' },
    { value: 'cards', label: locale === 'zh' ? '卡片' : 'Cards', icon: '[]' }
  ]

  const advancedStyles: SkillStyleOption[] = [
    { value: 'minimal', label: locale === 'zh' ? '极简' : 'Minimal', icon: '─' },
    { value: 'grid', label: locale === 'zh' ? '网格' : 'Grid', icon: '##' },
    { value: 'circular', label: locale === 'zh' ? '圆形进度' : 'Circular', icon: 'O' },
    { value: 'radar', label: locale === 'zh' ? '雷达图' : 'Radar', icon: '<>' },
    { value: 'star-rating', label: locale === 'zh' ? '星级' : 'Star', icon: '***' },
    { value: 'badge', label: locale === 'zh' ? '徽章' : 'Badge', icon: 'BDG' },
    { value: 'wave-progress', label: locale === 'zh' ? '波浪' : 'Wave', icon: '~~~' },
    { value: 'gradient-card', label: locale === 'zh' ? '渐变卡片' : 'Gradient', icon: 'GRD' }
  ]

  const categoryOptions = useMemo(() => getSkillCategoryOptions(currentLocale), [currentLocale])
  const lockedSkillCount = useMemo(() => skills.filter((skill) => skill.categoryLocked).length, [skills])
  const quickAddPlan = useMemo(
    () => buildQuickAddSkillPlan(skills, quickInput, currentLocale),
    [skills, quickInput, currentLocale]
  )
  const quickAddMergeEntries = useMemo(
    () => quickAddPlan.entries.filter((entry) => entry.status !== 'new'),
    [quickAddPlan.entries]
  )
  const visibleSkills = useMemo(() => {
    if (!showLockedOnly) {
      return skills
    }
    return skills.filter((skill) => skill.categoryLocked)
  }, [showLockedOnly, skills])

  /**
   * 常见岗位技能包
   * 提供招聘场景常用技能集合，支持一键补齐，降低手动输入成本。
   */
  const skillPackOptions = useMemo<SkillPackOption[]>(() => {
    if (locale === 'zh') {
      return [
        {
          key: 'frontend',
          label: '前端工程师常用',
          category: '前端开发',
          values: ['JavaScript', 'TypeScript', 'React', 'Next.js', '工程化', '性能优化']
        },
        {
          key: 'product',
          label: '产品经理常用',
          category: '产品能力',
          values: ['需求分析', '用户研究', 'PRD', '数据分析', '跨团队协作']
        },
        {
          key: 'operations',
          label: '运营岗位常用',
          category: '通用能力',
          values: ['活动策划', '内容运营', '增长策略', '数据复盘', '用户运营']
        },
        {
          key: 'design',
          label: '设计岗位常用',
          category: '设计能力',
          values: ['Figma', '视觉设计', '交互设计', '设计系统', '可用性测试']
        }
      ]
    }

    return [
      {
        key: 'frontend',
        label: 'Frontend Pack',
        category: 'Frontend',
        values: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Performance', 'Engineering']
      },
      {
        key: 'product',
        label: 'Product Pack',
        category: 'Product',
        values: ['Requirement Analysis', 'User Research', 'Roadmap', 'Data Insight', 'Collaboration']
      },
      {
        key: 'operations',
        label: 'Operations Pack',
        category: 'General',
        values: ['Campaign', 'Content Ops', 'Growth', 'Reporting', 'User Engagement']
      },
      {
        key: 'design',
        label: 'Design Pack',
        category: 'Design',
        values: ['Figma', 'Visual Design', 'Interaction Design', 'Design System', 'Usability Test']
      }
    ]
  }, [locale])

  /**
   * 同步当前展开的技能项
   * 当技能列表变化时，确保展开状态始终指向一个有效条目。
   */
  useEffect(() => {
    if (visibleSkills.length === 0) {
      setExpandedSkillId(null)
      return
    }

    if (!expandedSkillId || !visibleSkills.some((skill) => skill.id === expandedSkillId)) {
      setExpandedSkillId(visibleSkills[0].id)
    }
  }, [expandedSkillId, visibleSkills])

  /**
   * 清理技能整理状态
   * 在用户进行普通编辑后清空预览和撤销快照，避免应用过期结果。
   */
  const clearSkillAssistantState = () => {
    setReclassificationPreview(null)
    setCleanupPreview(null)
    setUndoState(null)
  }

  /**
   * 提交技能列表变更
   * 统一为每一项创建新引用，避免局部状态和动画库复用旧对象导致界面未刷新。
   */
  const commitSkillChanges = (nextSkills: Skill[], nextExpandedSkillId?: string | null) => {
    const normalizedSkills = nextSkills.map((skill) => ({ ...skill }))
    onChange(normalizedSkills)

    if (nextExpandedSkillId !== undefined) {
      setExpandedSkillId(nextExpandedSkillId)
    }
  }

  /**
   * 预览技能分类重整结果
   * 先生成变更建议，不直接修改现有技能数据。
   */
  const handlePreviewReclassification = () => {
    const plan = buildSkillReclassificationPlan(skills, currentLocale)
    if (plan.changes.length === 0) {
      setReclassificationPreview(null)
      setCleanupPreview(null)
      showInfo(
        locale === 'zh' ? '没有发现需要自动重整的分类' : 'No category updates suggested',
        locale === 'zh'
          ? '已有细分分类会被保留，当前没有明显错位项。'
          : 'Detailed custom categories are preserved. No clear mismatch was found.'
      )
      return
    }

    setCleanupPreview(null)
    setReclassificationPreview(plan)
  }

  /**
   * 预览技能清理结果
   * 对重复技能和同义技能先生成清理建议，再决定是否应用。
   */
  const handlePreviewSkillCleanup = () => {
    const plan = buildSkillCleanupPlan(skills)
    if (plan.changes.length === 0) {
      setCleanupPreview(null)
      setReclassificationPreview(null)
      showInfo(
        locale === 'zh' ? '没有发现需要清理的重复或同义技能' : 'No duplicate or alias skills found',
        locale === 'zh'
          ? '当前技能列表已经比较干净。'
          : 'The current skills list is already clean.'
      )
      return
    }

    setReclassificationPreview(null)
    setCleanupPreview(plan)
  }

  /**
   * 应用技能分类重整结果
   * 将建议分类一次性写回，并保留一次撤销机会。
   */
  const handleApplyReclassification = () => {
    if (!reclassificationPreview) {
      return
    }

    const latestPlan = buildSkillReclassificationPlan(skills, currentLocale)
    if (latestPlan.changes.length === 0) {
      setReclassificationPreview(null)
      return
    }

    setUndoState({
      skills: skills.map((skill) => ({ ...skill })),
      mode: 'reclassification'
    })
    commitSkillChanges(latestPlan.nextSkills, latestPlan.changes[0]?.skillId || expandedSkillId)
    setReclassificationPreview(null)
    setCleanupPreview(null)

    showSuccess(
      locale === 'zh' ? '已完成技能分类重整' : 'Skill categories updated',
      locale === 'zh'
        ? `共调整 ${latestPlan.changes.length} 项，可撤销一次。`
        : `${latestPlan.changes.length} skills updated. Undo is available once.`
    )
  }

  /**
   * 应用技能清理结果
   * 合并重复技能并规范同义名称，保持列表更紧凑清晰。
   */
  const handleApplySkillCleanup = () => {
    if (!cleanupPreview) {
      return
    }

    const latestPlan = buildSkillCleanupPlan(skills)
    if (latestPlan.changes.length === 0) {
      setCleanupPreview(null)
      return
    }

    setUndoState({
      skills: skills.map((skill) => ({ ...skill })),
      mode: 'cleanup'
    })
    commitSkillChanges(latestPlan.nextSkills, latestPlan.nextSkills[0]?.id || null)
    setCleanupPreview(null)
    setReclassificationPreview(null)

    showSuccess(
      locale === 'zh' ? '已完成技能清理' : 'Skill cleanup applied',
      locale === 'zh'
        ? `共处理 ${latestPlan.changes.length} 处重复或同义技能。`
        : `${latestPlan.changes.length} duplicate or alias skill issues resolved.`
    )
  }

  /**
   * 撤销上一次技能整理
   * 恢复最近一次分类重整或技能清理前的技能快照。
   */
  const handleUndoSkillChange = () => {
    if (!undoState) {
      return
    }

    commitSkillChanges(undoState.skills, undoState.skills[0]?.id || null)
    setUndoState(null)
    setReclassificationPreview(null)
    setCleanupPreview(null)

    showInfo(
      locale === 'zh'
        ? `已撤销${undoState.mode === 'cleanup' ? '技能清理' : '技能分类重整'}`
        : `${undoState.mode === 'cleanup' ? 'Skill cleanup' : 'Skill category update'} undone`,
      locale === 'zh' ? '已恢复到整理前的技能状态。' : 'Skills have been restored to the previous state.'
    )
  }

  /**
   * 锁定全部技能分类
   * 批量保护当前分类，避免后续智能重整覆盖人工判断。
   */
  const handleLockAllCategories = () => {
    clearSkillAssistantState()
    const nextSkills = skills.map((skill) => ({
      ...skill,
      categoryLocked: true
    }))
    commitSkillChanges(nextSkills, expandedSkillId)
  }

  /**
   * 解锁全部技能分类
   * 恢复自动整理能力，让所有技能重新参与智能建议。
   */
  const handleUnlockAllCategories = () => {
    clearSkillAssistantState()
    const nextSkills = skills.map((skill) => ({
      ...skill,
      categoryLocked: false
    }))
    commitSkillChanges(nextSkills, expandedSkillId)
  }

  /**
   * 添加单个技能条目
   * 保持最小默认字段，降低用户首次输入成本。
   */
  const addSkill = () => {
    clearSkillAssistantState()
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 50,
      category: getDefaultSkillCategory(currentLocale),
      color: '#2563EB'
    }
    commitSkillChanges([...skills, newSkill], newSkill.id)
  }

  /**
   * 更新技能字段
   * 仅替换目标项，保证列表顺序稳定。
   */
  const updateSkill = (id: string, field: keyof Skill, value: string | number | boolean) => {
    clearSkillAssistantState()
    const updatedSkills = skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    )
    commitSkillChanges(updatedSkills)
  }

  /**
   * 更新技能分类
   * 当用户手动选择分类时自动锁定，避免后续智能重整覆盖人工判断。
   */
  const updateSkillCategory = (id: string, category: string) => {
    clearSkillAssistantState()
    const updatedSkills = skills.map((skill) =>
      skill.id === id
        ? {
            ...skill,
            category,
            categoryLocked: true
          }
        : skill
    )
    commitSkillChanges(updatedSkills)
  }

  /**
   * 切换技能分类锁定状态
   * 允许用户决定该技能后续是否参与智能重整。
   */
  const toggleCategoryLock = (id: string) => {
    clearSkillAssistantState()
    const updatedSkills = skills.map((skill) =>
      skill.id === id
        ? {
            ...skill,
            categoryLocked: !skill.categoryLocked
          }
        : skill
    )
    commitSkillChanges(updatedSkills)
  }

  /**
   * 删除技能
   */
  const deleteSkill = (id: string) => {
    clearSkillAssistantState()
    commitSkillChanges(skills.filter(skill => skill.id !== id))
  }

  /**
   * 处理拖拽排序
   */
  const handleReorder = (newSkills: Skill[]) => {
    clearSkillAssistantState()
    if (!showLockedOnly) {
      commitSkillChanges(newSkills)
      return
    }

    const reorderedLockedSkills = [...newSkills]
    const nextSkills = skills.map((skill) => {
      if (!skill.categoryLocked) {
        return skill
      }
      return reorderedLockedSkills.shift() || skill
    })
    commitSkillChanges(nextSkills)
  }

  /**
   * 应用技能展示样式
   * 统一入口，避免在 JSX 中分散写入样式更新逻辑。
   */
  const applyDisplayStyle = (style: SkillDisplayStyle) => {
    updateStyleConfig({
      skills: {
        ...styleConfig.skills,
        displayStyle: style
      }
    })
  }

  /**
   * 批量添加技能
   * 按输入内容拆分后自动去重，已存在技能不会重复添加。
   */
  const handleBatchAddSkills = () => {
    const tokens = parseQuickSkillTokens(quickInput)
    if (tokens.length === 0) return
    clearSkillAssistantState()

    if (quickAddPlan.additions.length === 0) {
      showInfo(
        locale === 'zh' ? '这些技能会并入现有项，无需重复新增' : 'These skills will merge into existing entries',
        locale === 'zh'
          ? '你可以直接保留当前列表，或修改输入内容后再新增。'
          : 'Keep the current list or adjust the input before adding again.'
      )
      return
    }

    const newSkills = quickAddPlan.additions.map((draft, index) => ({
      id: `skill-${Date.now()}-${index}`,
      name: draft.name,
      level: 70,
      category: draft.category,
      color: '#2563EB'
    }))
    const nextSkills = insertSkillsByCategory(skills, newSkills)
    commitSkillChanges(nextSkills, newSkills[0]?.id)

    showSuccess(
      locale === 'zh'
        ? `已新增 ${newSkills.length} 项技能`
        : `${newSkills.length} skills added`,
      quickAddMergeEntries.length > 0
        ? (locale === 'zh'
          ? `${quickAddMergeEntries.length} 项同义技能已识别为合并项，没有重复写入。`
          : `${quickAddMergeEntries.length} alias skills were recognized as merges and skipped.`)
        : (locale === 'zh' ? '已按分类自动成组插入当前列表。' : 'Added and grouped by category.')
    )
    setQuickInput('')
  }

  /**
   * 按熟练度降序排序
   * 让高价值技能优先展示，提升招聘方扫描效率。
   */
  const handleSortByLevel = () => {
    clearSkillAssistantState()
    const sorted = [...skills].sort((a, b) => b.level - a.level)
    commitSkillChanges(sorted)
  }

  /**
   * 应用岗位技能包
   * 只添加当前不存在的技能，避免覆盖用户已编辑内容。
   */
  const handleApplySkillPack = (pack: SkillPackOption) => {
    clearSkillAssistantState()
    const exists = new Set(skills.map((item) => item.name.trim().toLowerCase()))
    const additions: Skill[] = []

    pack.values.forEach((name, index) => {
      const key = name.toLowerCase()
      if (exists.has(key)) return
      exists.add(key)
      additions.push({
        id: `pack-${pack.key}-${Date.now()}-${index}`,
        name,
        level: 70,
        category: pack.category,
        color: '#2563EB'
      })
    })

    if (additions.length > 0) {
      commitSkillChanges([...skills, ...additions], additions[0].id)
    }
  }

  /**
   * 切换技能条目展开状态
   * 保持一次只展开一个条目，降低专业技能编辑区的视觉噪音。
   */
  const toggleSkillExpand = (skillId: string) => {
    setExpandedSkillId((current) => (current === skillId ? null : skillId))
  }

  /**
   * 按分类家族插入新增技能
   * 让批量录入的技能自动贴近同类项，减少用户后续手动拖拽整理。
   */
  const insertSkillsByCategory = (baseSkills: Skill[], additions: Skill[]) => {
    const nextSkills = [...baseSkills]

    additions.forEach((addition) => {
      const additionFamily = resolveCategoryFamily(addition.category)
      let insertIndex = -1

      for (let index = nextSkills.length - 1; index >= 0; index -= 1) {
        const currentSkill = nextSkills[index]
        if (resolveCategoryFamily(currentSkill.category) === additionFamily) {
          insertIndex = index
          break
        }
      }

      if (insertIndex === -1) {
        nextSkills.push(addition)
        return
      }

      nextSkills.splice(insertIndex + 1, 0, addition)
    })

    return nextSkills
  }

  return (
    <div className={showSectionHeader ? 'space-y-6' : 'space-y-5'}>
      {showSectionHeader && (
        <SectionHeader 
          title={t.editor.skills.title}
          description={t.editor.skills.description}
          count={skills.length}
          icon={<Code className="w-5 h-5" />}
        />
      )}

      {/* 样式选择：先给主流样式，减少噪音；高级样式按需展开 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {locale === 'zh' ? '技能展示样式' : 'Skill Display'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {locale === 'zh' ? '先选主流样式，再按需切高级样式' : 'Pick mainstream first, advanced if needed'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mainstreamStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => applyDisplayStyle(style.value)}
              className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                styleConfig.skills.displayStyle === style.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="text-sm font-semibold">{style.icon}</div>
              <div className="text-xs mt-0.5">{style.label}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvancedStyles((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {showAdvancedStyles
            ? (locale === 'zh' ? '收起高级样式' : 'Hide advanced styles')
            : (locale === 'zh' ? '显示高级样式' : 'Show advanced styles')}
        </button>

        {showAdvancedStyles && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {advancedStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => applyDisplayStyle(style.value)}
                className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                  styleConfig.skills.displayStyle === style.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-sm font-semibold">{style.icon}</div>
                <div className="text-xs mt-0.5">{style.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 批量输入：减少逐条添加的操作负担 */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {locale === 'zh' ? '批量添加技能' : 'Batch Add Skills'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSortByLevel}
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
            >
              <ArrowDownWideNarrow className="w-3.5 h-3.5" />
              {locale === 'zh' ? '按熟练度排序' : 'Sort by level'}
            </button>
            <button
              type="button"
              onClick={handleLockAllCategories}
              disabled={skills.length === 0 || lockedSkillCount === skills.length}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" />
              {locale === 'zh' ? '锁定全部' : 'Lock all'}
            </button>
            <button
              type="button"
              onClick={handleUnlockAllCategories}
              disabled={lockedSkillCount === 0}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Unlock className="h-3.5 w-3.5" />
              {locale === 'zh' ? '解锁全部' : 'Unlock all'}
            </button>
            <button
              type="button"
              onClick={() => setShowLockedOnly((current) => !current)}
              disabled={lockedSkillCount === 0 && !showLockedOnly}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                showLockedOnly
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showLockedOnly ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {locale === 'zh' ? '仅看锁定项' : 'Locked only'}
            </button>
            <button
              type="button"
              onClick={handlePreviewReclassification}
              disabled={skills.length === 0}
              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'zh' ? '智能重整分类' : 'Smart Reclassify'}
            </button>
            <button
              type="button"
              onClick={handlePreviewSkillCleanup}
              disabled={skills.length === 0}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'zh' ? '清理重复技能' : 'Clean duplicate skills'}
            </button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>
            {locale === 'zh'
              ? `已锁定 ${lockedSkillCount}/${skills.length} 项`
              : `${lockedSkillCount}/${skills.length} skills locked`}
          </span>
          {showLockedOnly && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-white">
              {locale === 'zh' ? '当前仅显示锁定项' : 'Showing locked skills only'}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder={locale === 'zh' ? '例如：React, TypeScript, Node.js, 产品设计' : 'e.g. React, TypeScript, Node.js'}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={handleBatchAddSkills}
            disabled={!quickInput.trim() || quickAddPlan.additions.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickAddPlan.additions.length > 0
              ? (locale === 'zh' ? `添加 ${quickAddPlan.additions.length} 项` : `Add ${quickAddPlan.additions.length}`)
              : (locale === 'zh' ? '无需新增' : 'No new skills')}
          </button>
        </div>
        {quickAddPlan.entries.length > 0 && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {locale === 'zh'
                  ? `预计新增 ${quickAddPlan.additions.length} 项`
                  : `${quickAddPlan.additions.length} new`}
              </span>
              {quickAddMergeEntries.length > 0 && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                  {locale === 'zh'
                    ? `自动并入 ${quickAddMergeEntries.length} 项`
                    : `${quickAddMergeEntries.length} merged`}
                </span>
              )}
            </div>

            {quickAddPlan.groups.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-slate-600">
                  {locale === 'zh' ? '将按分类自动成组加入' : 'Will be grouped by category'}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickAddPlan.groups.map((group) => (
                    <div
                      key={group.category}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="text-xs font-semibold text-slate-700">{group.category}</div>
                      <div className="mt-1 text-sm text-slate-600">{group.skillNames.join(' / ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quickAddMergeEntries.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-medium text-slate-600">
                  {locale === 'zh' ? '这些输入会自动并入现有或同批技能' : 'These entries will merge automatically'}
                </div>
                {quickAddMergeEntries.slice(0, 4).map((entry) => (
                  <div
                    key={`${entry.inputName}-${entry.nextName}`}
                    className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
                  >
                    <span>{entry.inputName}</span>
                    <span>→</span>
                    <span className="font-medium text-slate-700">{entry.nextName}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {entry.status === 'merge-existing'
                        ? (locale === 'zh' ? '并入现有项' : 'Merge existing')
                        : (locale === 'zh' ? '并入本次输入' : 'Merge input')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 岗位技能包：面向常见招聘场景的一键补齐入口 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {locale === 'zh' ? '岗位技能包' : 'Role Skill Packs'}
          </span>
          <span className="text-xs text-gray-500">
            {locale === 'zh' ? '不会覆盖已填写技能' : 'Will not overwrite existing skills'}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {skillPackOptions.map((pack) => (
            <button
              key={pack.key}
              type="button"
              onClick={() => handleApplySkillPack(pack)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-900">{pack.label}</div>
              <div className="mt-1 truncate text-xs text-gray-500">{pack.values.join(' / ')}</div>
            </button>
          ))}
        </div>
      </div>

      {reclassificationPreview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">
                  {locale === 'zh' ? '智能分类建议' : 'Smart category suggestions'}
                </h3>
              </div>
              <p className="mt-1 text-sm text-amber-800">
                {locale === 'zh'
                  ? `检测到 ${reclassificationPreview.changes.length} 项分类可优化，仅会调整明显错位的系统分类。`
                  : `${reclassificationPreview.changes.length} skills can be optimized. Only clear mismatches will be updated.`}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {locale === 'zh'
                  ? `已锁定 ${lockedSkillCount} 项分类，锁定项不会参与本次重整。`
                  : `${lockedSkillCount} locked skills are excluded from this update.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReclassificationPreview(null)}
                className="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                {locale === 'zh' ? '取消' : 'Dismiss'}
              </button>
              <button
                type="button"
                onClick={handleApplyReclassification}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
              >
                {locale === 'zh' ? '应用调整' : 'Apply changes'}
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {reclassificationPreview.changes.slice(0, 5).map((change) => (
              <div
                key={change.skillId}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <span className="font-medium text-slate-900">{change.skillName || (locale === 'zh' ? '未命名技能' : 'Unnamed skill')}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{change.previousCategory || (locale === 'zh' ? '未分类' : 'Uncategorized')}</span>
                <span className="text-slate-400">→</span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{change.nextCategory}</span>
              </div>
            ))}
          </div>

          {reclassificationPreview.changes.length > 5 && (
            <p className="mt-3 text-xs text-amber-800">
              {locale === 'zh'
                ? `其余 ${reclassificationPreview.changes.length - 5} 项将在应用时一并更新。`
                : `${reclassificationPreview.changes.length - 5} more changes will also be applied.`}
            </p>
          )}
        </div>
      )}

      {cleanupPreview && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-900">
                  {locale === 'zh' ? '技能清理建议' : 'Skill cleanup suggestions'}
                </h3>
              </div>
              <p className="mt-1 text-sm text-emerald-800">
                {locale === 'zh'
                  ? `检测到 ${cleanupPreview.changes.length} 处重复或同义技能，可一键合并并规范名称。`
                  : `${cleanupPreview.changes.length} duplicate or alias skill issues can be cleaned up in one click.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCleanupPreview(null)}
                className="rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                {locale === 'zh' ? '取消' : 'Dismiss'}
              </button>
              <button
                type="button"
                onClick={handleApplySkillCleanup}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {locale === 'zh' ? '应用清理' : 'Apply cleanup'}
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {cleanupPreview.changes.slice(0, 5).map((change) => (
              <div
                key={`${change.type}-${change.skillId}`}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <span className="font-medium text-slate-900">{change.skillName || (locale === 'zh' ? '未命名技能' : 'Unnamed skill')}</span>
                {change.removedSkillNames && change.removedSkillNames.length > 0 && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    + {change.removedSkillNames.join(' / ')}
                  </span>
                )}
                <span className="text-slate-400">→</span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{change.nextName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {undoState && !reclassificationPreview && !cleanupPreview && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-sky-900">
                {locale === 'zh'
                  ? `${undoState.mode === 'cleanup' ? '技能清理' : '分类重整'}已应用`
                  : `${undoState.mode === 'cleanup' ? 'Skill cleanup' : 'Category update'} applied`}
              </h3>
              <p className="mt-1 text-sm text-sky-800">
                {locale === 'zh'
                  ? '如果这次整理不符合你的预期，可以立即撤销一次。'
                  : 'You can undo the latest skill adjustment once.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUndoSkillChange}
              className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {locale === 'zh' ? '撤销本次调整' : 'Undo'}
            </button>
          </div>
        </div>
      )}

      {showLockedOnly && visibleSkills.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {locale === 'zh' ? '当前没有锁定的技能项，可先手动改分类或点击“锁定全部”。' : 'No locked skills yet. Update a category manually or lock all first.'}
        </div>
      )}

      <Reorder.Group axis="y" values={visibleSkills} onReorder={handleReorder} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {visibleSkills.map((skill) => (
            <Reorder.Item key={skill.id} value={skill}>
              <EditableCard
                title={skill.name || t.editor.skills.placeholders.name}
                subtitle={`${skill.category || (locale === 'zh' ? '未分类' : 'Uncategorized')} · ${skill.level}%${skill.categoryLocked ? ` · ${locale === 'zh' ? '已锁定' : 'Locked'}` : ''}`}
                onDelete={() => deleteSkill(skill.id)}
                isExpanded={expandedSkillId === skill.id}
                onToggle={() => toggleSkillExpand(skill.id)}
                dragHandle={<GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing mr-2" />}
              >
                <div className="space-y-4">
                  <FormFieldGroup>
                    <FormField
                      label={t.editor.skills.name}
                      type="text"
                      value={skill.name}
                      onChange={(value) => updateSkill(skill.id, 'name', value)}
                      placeholder={t.editor.skills.placeholders.name}
                    />
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {locale === 'zh' ? '技能分类' : 'Category'}
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleCategoryLock(skill.id)}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                            skill.categoryLocked
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {skill.categoryLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                          {skill.categoryLocked
                            ? (locale === 'zh' ? '已锁定分类' : 'Category locked')
                            : (locale === 'zh' ? '允许自动调整' : 'Auto-adjust enabled')}
                        </button>
                      </div>
                      <select
                        value={skill.category}
                        onChange={(e) => updateSkillCategory(skill.id, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {(categoryOptions.includes(skill.category) || !skill.category
                          ? categoryOptions
                          : [skill.category, ...categoryOptions]).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-gray-500">
                        {skill.categoryLocked
                          ? (locale === 'zh' ? '当前分类已锁定，智能重整不会修改。' : 'This category is locked and will not be changed automatically.')
                          : (locale === 'zh' ? '手动修改分类后会自动锁定，避免被智能重整覆盖。' : 'Manual category changes are locked automatically to preserve your choice.')}
                      </p>
                    </div>
                  </FormFieldGroup>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormField
                        label={`${t.editor.skills.level}: ${skill.level}%`}
                        type="range"
                        min={0}
                        max={100}
                        value={skill.level}
                        onChange={(value) => updateSkill(skill.id, 'level', parseInt(value))}
                        className="mb-0"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[40, 60, 80, 90].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => updateSkill(skill.id, 'level', preset)}
                              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                                skill.level === preset
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">0-100</div>
                      </div>
                    </div>
                    
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
                         {locale === 'zh' ? '技能颜色' : 'Skill Color'}
                       </label>
                       <div className="flex flex-wrap gap-2 mt-1">
                         {PRESET_COLORS.map(color => (
                           <button
                             key={color}
                             type="button"
                             onClick={() => updateSkill(skill.id, 'color', color)}
                             className={`w-6 h-6 rounded-full border-2 transition-all ${
                               skill.color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                             }`}
                             style={{ backgroundColor: color }}
                             aria-label={`Select color ${color}`}
                           />
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </EditableCard>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AddCardButton onAdd={addSkill} text={t.editor.skills.add} />
    </div>
  )
}
