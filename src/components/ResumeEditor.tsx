/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 * 
 * 简历编辑器组件 - 性能优化版本
 * 使用 React.memo、useMemo、useCallback 优化渲染性能
 * Requirements: 1.3, 1.4
 */

'use client'

import React, { useState, useCallback, useMemo, memo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, Target } from 'lucide-react'
import { ResumeData, Experience, Skill, PersonalInfo, Education, Project } from '../types/resume'
import { PersonalInfoForm } from './editor/PersonalInfoForm'
import { ExperienceForm } from './editor/ExperienceForm'
import { EducationForm } from './editor/EducationForm'
import { SkillsForm } from './editor/SkillsForm'
import { ProjectsForm } from './editor/ProjectsForm'
import { useToastContext } from '@/components/Toast'
import { EditorSidebar } from './editor/EditorSidebar'
import { EditorHeader } from './editor/EditorHeader'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { useChecklistCompletionFeedback } from '@/hooks/useChecklistCompletionFeedback'
import { navigationItems } from '@/data/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { ResumeSectionId } from '@/utils/resumeCompleteness'
import { getOptimizeSectionInsight } from '@/domain/editor/optimizeSectionInsights'
import { EditorFieldKey, getPrimaryEditorFieldGuidance } from '@/domain/editor/editorFieldGuidance'

type AIAssistantType = 'summary' | 'experience' | 'skills' | 'education' | 'projects'

interface ResumeEditorProps {
  resumeData: ResumeData
  onUpdateResumeData: (data: ResumeData) => void
  activeSection: string
  onSectionChange: (section: string) => void
  onShowTemplateSelector?: () => void
  /** 统一 AI 面板入口 */
  onShowAIAssistant?: (type: AIAssistantType) => void
  /** Hide internal navigation sidebar (for three-column layout) */
  hideNavigation?: boolean
}

/**
 * 优化的动画配置 - 使用 useMemo 缓存
 */
const sectionAnimationVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const sectionAnimationTransition = { duration: 0.2 }

/**
 * 规范化编辑器模块
 * 将外部传入的字符串 section 收敛到编辑器支持的固定模块。
 */
function normalizeEditorSection(section: string): ResumeSectionId {
  if (
    section === 'personal' ||
    section === 'experience' ||
    section === 'education' ||
    section === 'skills' ||
    section === 'projects'
  ) {
    return section
  }
  return 'personal'
}

/**
 * 将编辑器模块映射为 AI 内容模块
 * 个人信息模块在 AI 优化里归为 summary。
 */
function mapEditorSectionToInsightSection(section: ResumeSectionId) {
  return section === 'personal' ? 'summary' : section
}

/**
 * 获取诊断徽标样式
 * 统一编辑区提示卡里的信号标签色阶。
 */
function getGuidanceBadgeClass(tone: 'positive' | 'neutral' | 'warning'): string {
  if (tone === 'positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-slate-200 bg-white text-slate-600'
}

/**
 * 简历编辑器组件
 * 提供简历内容编辑功能，包含导航、表单和样式设置
 * 支持全局快捷键操作
 * 
 * 性能优化：
 * - 使用 useMemo 缓存计算密集型操作
 * - 使用 useCallback 优化事件处理器
 * - 使用 React.memo 包装子组件
 */
function ResumeEditorComponent({
  resumeData,
  onUpdateResumeData,
  activeSection,
  onSectionChange,
  onShowTemplateSelector,
  onShowAIAssistant,
  hideNavigation = false
}: ResumeEditorProps) {
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [pendingFieldFocus, setPendingFieldFocus] = useState<EditorFieldKey | null>(null)
  const [showGuidanceChecklist, setShowGuidanceChecklist] = useState(false)
  const editorRootRef = useRef<HTMLDivElement>(null)
  
  const { success: showToast } = useToastContext()
  const { t, locale } = useLanguage()
  const normalizedActiveSection = useMemo(
    () => normalizeEditorSection(activeSection),
    [activeSection]
  )

  // 使用 useMemo 缓存导航项翻译，避免每次渲染都重新计算
  const translatedNavigationItems = useMemo(() => navigationItems.map(item => {
    let label = item.label
    let description = item.description
    
    switch (item.id) {
      case 'personal':
        label = t.editor.personalInfo.title
        description = t.editor.personalInfo.description
        break
      case 'experience':
        label = t.editor.experience.title
        description = t.editor.experience.description
        break
      case 'education':
        label = t.editor.education.title
        description = t.editor.education.description
        break
      case 'skills':
        label = t.editor.skills.title
        description = t.editor.skills.description
        break
      case 'projects':
        label = t.editor.projects.title
        description = t.editor.projects.description
        break
    }
    
    return {
      ...item,
      label,
      description
    }
  }), [t])

  /**
   * 打开统一 AI 助手
   * 由父组件控制统一 AI 面板，避免编辑器内存在多套 AI 入口。
   */
  const openAIAssistant = useCallback((type: AIAssistantType = 'summary') => {
    onShowAIAssistant?.(type)
  }, [onShowAIAssistant])

  /**
   * 规范化 AI 助手分区类型
   * 将外部 section 字符串收敛到助手支持的固定枚举，避免 any 转换。
   */
  const normalizeAssistantType = useCallback((section: string): AIAssistantType => {
    if (
      section === 'summary' ||
      section === 'experience' ||
      section === 'skills' ||
      section === 'education' ||
      section === 'projects'
    ) {
      return section
    }
    return 'summary'
  }, [])

  /**
   * 聚焦编辑字段
   * 通过字段锚点滚动并短暂高亮目标区域，缩短从诊断到编辑的路径。
   */
  const focusEditorField = useCallback((fieldKey: EditorFieldKey) => {
    const target = editorRootRef.current?.querySelector<HTMLElement>(`[data-editor-field-key="${fieldKey}"]`)
    if (!target) {
      return false
    }

    const scrollContainer = target.closest<HTMLElement>('[data-editor-scroll-area="true"]')
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const nextTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 20

      scrollContainer.scrollTo({
        top: Math.max(nextTop, 0),
        behavior: 'smooth'
      })
    } else {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

    target.classList.add(
      'ring-2',
      'ring-sky-300',
      'ring-offset-4',
      'ring-offset-white',
      'rounded-2xl',
      'bg-amber-50'
    )

    const primaryFocusable =
      target.querySelector<HTMLElement>('input, textarea, select') ||
      target.querySelector<HTMLElement>('button')
    window.setTimeout(() => {
      primaryFocusable?.focus()
    }, 160)

    window.setTimeout(() => {
      target.classList.remove(
        'ring-2',
        'ring-sky-300',
        'ring-offset-4',
        'ring-offset-white',
        'rounded-2xl',
        'bg-amber-50'
      )
    }, 2200)
    return true
  }, [])

  /**
   * 处理跨区域字段聚焦请求
   * 预览区、AI 面板和移动端诊断会通过事件把 section 与 fieldKey 传入编辑器。
   */
  const handleSwitchToEditor = useCallback((event: CustomEvent<{ section: string; fieldKey?: EditorFieldKey }>) => {
    const { section, fieldKey } = event.detail
    onSectionChange(section)

    if (!fieldKey) {
      return
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSectionModal(true)
    }

    setPendingFieldFocus(fieldKey)
  }, [onSectionChange])

  // 保存功能
  const handleSave = useCallback(() => {
    // 保存到本地存储
    localStorage.setItem('resumeData', JSON.stringify(resumeData))
    showToast(t.editor.messages.saved, 'success')
  }, [resumeData, showToast, t])

  // 使用全局快捷键 Hook
  useGlobalShortcuts({
    onSectionChange,
    openAIAssistant: () => openAIAssistant(),
    handleSave
  })

  // 监听预览区域的点击事件
  React.useEffect(() => {
    window.addEventListener('switchToEditor', handleSwitchToEditor as EventListener)
    
    return () => {
      window.removeEventListener('switchToEditor', handleSwitchToEditor as EventListener)
    }
  }, [handleSwitchToEditor])

  /**
   * 消费待聚焦字段
   * 等待模块切换和移动端弹窗完成渲染后，再执行真实滚动与高亮。
   */
  React.useEffect(() => {
    if (!pendingFieldFocus) {
      return
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768 && !showSectionModal) {
      return
    }

    let isCancelled = false
    let attempt = 0

    const tryFocusField = () => {
      if (isCancelled) {
        return
      }

      const focused = focusEditorField(pendingFieldFocus)
      if (focused) {
        setPendingFieldFocus(null)
        return
      }

      attempt += 1
      if (attempt < 6) {
        window.setTimeout(tryFocusField, 120)
      }
    }

    const timer = window.setTimeout(tryFocusField, 120)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
  }, [focusEditorField, pendingFieldFocus, showSectionModal])

  // 获取当前导航项索引 - 使用 useMemo 缓存
  const currentIndex = useMemo(() => 
    navigationItems.findIndex(item => item.id === activeSection),
    [activeSection]
  )

  // 使用 useCallback 优化数据更新处理器，避免不必要的重渲染
  const handlePersonalInfoChange = useCallback((data: PersonalInfo) => {
    onUpdateResumeData({ ...resumeData, personalInfo: data })
  }, [resumeData, onUpdateResumeData])

  const handleExperienceChange = useCallback((data: Experience[]) => {
    onUpdateResumeData({ ...resumeData, experience: data })
  }, [resumeData, onUpdateResumeData])

  const handleEducationChange = useCallback((data: Education[]) => {
    onUpdateResumeData({ ...resumeData, education: data })
  }, [resumeData, onUpdateResumeData])

  const handleSkillsChange = useCallback((data: Skill[]) => {
    onUpdateResumeData({ ...resumeData, skills: data })
  }, [resumeData, onUpdateResumeData])

  const handleProjectsChange = useCallback((data: Project[]) => {
    onUpdateResumeData({ ...resumeData, projects: data })
  }, [resumeData, onUpdateResumeData])

  const activeSectionInsight = useMemo(
    () => getOptimizeSectionInsight(mapEditorSectionToInsightSection(normalizedActiveSection), resumeData, locale === 'zh' ? 'zh' : 'en'),
    [locale, normalizedActiveSection, resumeData]
  )
  const activeFieldGuidance = useMemo(
    () => getPrimaryEditorFieldGuidance(normalizedActiveSection, activeSectionInsight.primaryGapLabel, locale === 'zh' ? 'zh' : 'en'),
    [activeSectionInsight.primaryGapLabel, locale, normalizedActiveSection]
  )
  const recentlyCompletedChecklistKeys = useChecklistCompletionFeedback(
    normalizedActiveSection,
    activeSectionInsight.checklist
  )
  const supportsAIAssistant = normalizedActiveSection !== 'education'

  /**
   * 模块切换时重置清单展开态
   * 避免上一模块展开的清单影响当前模块的首屏密度。
   */
  React.useEffect(() => {
    setShowGuidanceChecklist(false)
  }, [normalizedActiveSection])

  /**
   * 生成最新完成反馈文案
   * 当用户刚补齐关键内容时，在编辑诊断卡里给出短暂成功提示。
   */
  const recentCompletionSummary = useMemo(() => {
    if (recentlyCompletedChecklistKeys.length === 0) {
      return null
    }

    const completedLabels = activeSectionInsight.checklist
      .filter((item) => recentlyCompletedChecklistKeys.includes(item.key))
      .map((item) => item.label)

    if (completedLabels.length === 0) {
      return null
    }

    if (locale === 'zh') {
      return completedLabels.length === 1
        ? `已补齐：${completedLabels[0]}`
        : `刚完成 ${completedLabels.length} 项：${completedLabels.join('、')}`
    }

    return completedLabels.length === 1
      ? `Completed: ${completedLabels[0]}`
      : `Completed ${completedLabels.length} checklist items`
  }, [activeSectionInsight.checklist, locale, recentlyCompletedChecklistKeys])

  /**
   * 聚焦当前模块建议字段
   * 让编辑区顶部诊断卡可以直接跳到最值得先补的字段。
   */
  const handleJumpToSuggestedField = useCallback(() => {
    focusEditorField(activeFieldGuidance.fieldKey)
  }, [activeFieldGuidance.fieldKey, focusEditorField])

  const editorGuidanceCard = useMemo(() => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              recentCompletionSummary
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : activeSectionInsight.shouldEditFirst
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600'
            }`}>
              {recentCompletionSummary
                ? (locale === 'zh' ? '刚完成' : 'Done')
                : activeSectionInsight.shouldEditFirst
                  ? (locale === 'zh' ? '待补内容' : 'Need Edit')
                  : (locale === 'zh' ? '可继续优化' : 'Ready')}
            </span>
            {activeSectionInsight.signalBadges.slice(0, 2).map((badge) => (
              <span
                key={`${normalizedActiveSection}-${badge.key}`}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getGuidanceBadgeClass(badge.tone)}`}
              >
                <span>{badge.label}</span>
                <span>{badge.value}</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {recentCompletionSummary
              || (activeSectionInsight.shouldEditFirst
                ? activeFieldGuidance.description
                : activeSectionInsight.coachingHint)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToSuggestedField}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Target className="h-3.5 w-3.5" />
            {activeFieldGuidance.label}
          </button>
          {supportsAIAssistant && (
            <button
              type="button"
              onClick={() => openAIAssistant(normalizeAssistantType(mapEditorSectionToInsightSection(normalizedActiveSection)))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'zh' ? 'AI 优化' : 'AI Optimize'}
            </button>
          )}
          {activeSectionInsight.checklist.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGuidanceChecklist((current) => !current)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span>
                {locale === 'zh'
                  ? `清单 ${activeSectionInsight.checklist.filter((item) => item.completed).length}/${activeSectionInsight.checklist.length}`
                  : `Checklist ${activeSectionInsight.checklist.filter((item) => item.completed).length}/${activeSectionInsight.checklist.length}`}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showGuidanceChecklist ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {showGuidanceChecklist && activeSectionInsight.checklist.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
          <div className="grid gap-2">
            {activeSectionInsight.checklist.map((item) => {
              const isRecentlyCompleted = recentlyCompletedChecklistKeys.includes(item.key)

              return (
                <div
                  key={`${normalizedActiveSection}-${item.key}`}
                  className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    isRecentlyCompleted ? 'bg-emerald-50/80' : ''
                  }`}
                >
                  <span
                    className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${item.completed ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  />
                  <div className="min-w-0">
                    <p className={`flex flex-wrap items-center gap-2 text-xs font-medium ${item.completed ? 'text-emerald-700' : 'text-slate-700'}`}>
                      <span>{item.label}</span>
                      {isRecentlyCompleted && (
                        <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          {locale === 'zh' ? '刚完成' : 'Just Done'}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  ), [
    activeFieldGuidance.description,
    activeFieldGuidance.label,
    activeSectionInsight.checklist,
    activeSectionInsight.shouldEditFirst,
    activeSectionInsight.signalBadges,
    activeSectionInsight.coachingHint,
    handleJumpToSuggestedField,
    locale,
    normalizeAssistantType,
    normalizedActiveSection,
    openAIAssistant,
    recentCompletionSummary,
    recentlyCompletedChecklistKeys,
    showGuidanceChecklist,
    setShowGuidanceChecklist,
    supportsAIAssistant
  ])

  // 处理上一步/下一步 - 使用 useCallback 优化
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onSectionChange(navigationItems[currentIndex - 1].id)
    }
  }, [currentIndex, onSectionChange])

  const handleNext = useCallback(() => {
    if (currentIndex < navigationItems.length - 1) {
      onSectionChange(navigationItems[currentIndex + 1].id)
    }
  }, [currentIndex, onSectionChange])

  // 渲染当前活动部分 - 使用 useMemo 缓存组件渲染
  const activeSectionContent = useMemo(() => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoForm 
            personalInfo={resumeData.personalInfo} 
            onChange={handlePersonalInfoChange}
            onAiOptimize={() => openAIAssistant('summary')}
            showSectionHeader={!hideNavigation}
          />
        )
      case 'experience':
        return (
          <ExperienceForm 
            experiences={resumeData.experience} 
            onChange={handleExperienceChange}
            showSectionHeader={!hideNavigation}
          />
        )
      case 'education':
        return (
          <EducationForm 
            education={resumeData.education} 
            onChange={handleEducationChange}
            showSectionHeader={!hideNavigation}
          />
        )
      case 'skills':
        return (
          <SkillsForm 
            skills={resumeData.skills} 
            onChange={handleSkillsChange}
            showSectionHeader={!hideNavigation}
          />
        )
      case 'projects':
        return (
          <ProjectsForm 
            projects={resumeData.projects} 
            onChange={handleProjectsChange}
            showSectionHeader={!hideNavigation}
          />
        )
      default:
        return (
          <PersonalInfoForm 
            personalInfo={resumeData.personalInfo} 
            onChange={handlePersonalInfoChange}
            onAiOptimize={() => openAIAssistant('summary')}
            showSectionHeader={!hideNavigation}
          />
        )
    }
  }, [
    activeSection, 
    resumeData.personalInfo, 
    resumeData.experience, 
    resumeData.education, 
    resumeData.skills, 
    resumeData.projects,
    handlePersonalInfoChange,
    handleExperienceChange,
    handleEducationChange,
    handleSkillsChange,
    handleProjectsChange,
    openAIAssistant,
    hideNavigation
  ])

  // 渲染当前活动部分（带动画）
  const renderActiveSection = useCallback(() => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={sectionAnimationVariants.initial}
          animate={sectionAnimationVariants.animate}
          exit={sectionAnimationVariants.exit}
          transition={sectionAnimationTransition}
        >
          {activeSectionContent}
        </motion.div>
      </AnimatePresence>
    )
  }, [activeSection, activeSectionContent])

  return (
    <div ref={editorRootRef} className={`${hideNavigation ? '' : 'h-full'} flex flex-col bg-white/50 backdrop-blur-sm`}>
      {/* 标题栏 - 三栏模式下隐藏 */}
      {!hideNavigation && (
        <EditorHeader 
          onOpenAIAssistant={() => openAIAssistant(normalizeAssistantType(activeSection))}
          onSave={handleSave}
        />
      )}

      {/* 主要内容区域 */}
      <div className={`flex-1 flex ${hideNavigation ? '' : 'overflow-hidden'}`}>
        {/* 左侧导航 - 三栏模式下隐藏 */}
        {!hideNavigation && (
          <EditorSidebar 
            navigationItems={translatedNavigationItems}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            onShowTemplateSelector={() => onShowTemplateSelector?.()}
          />
        )}

        {/* 右侧编辑区域 */}
        <div className={`flex-1 flex flex-col ${hideNavigation ? '' : 'overflow-hidden'} bg-white/50`}>
          {/* 头部面包屑/标题 */}
          <div className={`${hideNavigation ? 'border-b border-slate-100 px-6 py-5' : 'px-8 py-6'} ${hideNavigation ? '' : 'pb-0'}`}>
             <h2 className={`${hideNavigation ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
               {translatedNavigationItems.find(item => item.id === activeSection)?.label}
             </h2>
             <p className="text-gray-500 text-sm">
               {translatedNavigationItems.find(item => item.id === activeSection)?.description}
             </p>
          </div>

          {/* 桌面端内联编辑 */}
          <div
            data-editor-scroll-area="true"
            className={`hidden md:block flex-1 ${hideNavigation ? 'px-6 py-5' : 'px-8 py-6'} ${hideNavigation ? '' : 'overflow-y-auto custom-scrollbar'}`}
          >
            <div className={hideNavigation ? '' : 'max-w-3xl'}>
              <div className="mb-5">
                {editorGuidanceCard}
              </div>
              {renderActiveSection()}
            </div>
            
            {/* 底部导航按钮 */}
                <div className={`${hideNavigation ? '' : 'max-w-3xl'} mt-8 flex items-center justify-between pt-6 border-t border-gray-100`}>
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentIndex === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t.common.back}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === navigationItems.length - 1}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentIndex === navigationItems.length - 1
                         ? 'text-gray-300 cursor-not-allowed'
                         : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                    }`}
                  >
                    {t.common.next}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
          </div>
          {/* 移动端浮动编辑入口 */}
          <div className="md:hidden p-3">
            <button
              onClick={() => setShowSectionModal(true)}
              className="w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow active:scale-95"
            >
              {t.editor.mobile.editSection}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端分区编辑弹窗 */}
      <AnimatePresence>
        {showSectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowSectionModal(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-xl mx-4 rounded-lg border border-gray-200 shadow-xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">{t.editor.mobile.editSection}</h3>
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div data-editor-scroll-area="true" className="p-3 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  {editorGuidanceCard}
                </div>
                {renderActiveSection()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

/**
 * 使用 React.memo 包装组件，避免不必要的重渲染
 * 只有当 props 发生变化时才会重新渲染
 */
const ResumeEditor = memo(ResumeEditorComponent)

export default ResumeEditor
