/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * 简历编辑器页面 - 性能优化版本
 * 使用懒加载优化非关键组件
 * Requirements: 1.5
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import ResumePreview from '@/components/ResumePreview'
import TemplateStyleSync from '@/components/TemplateStyleSync'
import Header from '@/components/Header'
import EditorToolbar from '@/components/EditorToolbar'
import AIConfigModal, { AIConfig } from '@/components/AIConfigModal'
import { StyleProvider } from '@/contexts/StyleContext'
import { useToastContext } from '@/components/Toast'
import { useRealtimePreview } from '@/hooks/useRealtimePreview'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useKeyboardShortcuts, createEditorShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHorizontalSwipe } from '@/hooks/useSwipeGesture'
import { ResumeData, Experience } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { getDefaultTemplate, getTemplateById } from '@/data/templates'
import { Bot, Settings, X } from 'lucide-react'
import { 
  EditorSkeleton, 
  AIAssistantSkeleton, 
  TemplateSelectorSkeleton, 
  ExportPreviewDialogSkeleton 
} from '@/components/LoadingStates'
import { ThreeColumnLayout } from '@/components/editor/ThreeColumnLayout'
import EditorAdvancedPanel from '@/components/editor/EditorAdvancedPanel'
import { SectionNavigation } from '@/components/editor/SectionNavigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { JDSuggestion } from '@/services/jdMatcher'
import { PreviewPanel } from '@/components/preview'
import { ExportProgressIndicator } from '@/components/export/ExportProgressIndicator'
import ImportExportBridge from '@/components/data/ImportExportBridge'
import { useStorageMonitor } from '@/hooks/useStorageMonitor'
import { ContextMenu } from '@/components/editor/ContextMenu'
import { BatchEditToolbar } from '@/components/editor/BatchEditToolbar'
import { useContextMenu } from '@/hooks/useContextMenu'
import { useBatchSelection } from '@/hooks/useBatchSelection'
import { LoadingOverlay } from '@/components/feedback/LoadingOverlay'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useEditorExportFlow } from '@/hooks/useEditorExportFlow'
import {
  calculateResumeCompleteness,
  ResumeSectionId,
  SectionCompleteness
} from '@/utils/resumeCompleteness'
import {
  AISection,
  applyAISuggestionToResumeData,
  mergeGeneratedResumeData,
  normalizePreviewSectionToEditor,
  normalizeSectionToAISection
} from '@/domain/editor/resumeAIActions'
import { getPrimaryEditorFieldGuidance } from '@/domain/editor/editorFieldGuidance'
import { getTemplateFitInsight, TemplateFitInsight } from '@/domain/templates/templateFitInsights'
import {
  getAIWorkbenchAction,
  getAIWorkbenchActionLabel,
  getAIWorkbenchBadgeLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { useAIConfigStatus } from '@/hooks/useAIConfigStatus'
import { loadResumeFromFile } from '@/utils/fileOperations'

type EditorEntryScenario = 'campus' | 'engineering' | 'product' | 'general'
type EditorRoutePanel = 'template' | 'ai'

interface EditorRouteSource {
  get: (name: string) => string | null
}

interface EditorRouteIntent {
  hasRouteIntent: boolean
  entryScenario: EditorEntryScenario | null
  section: ResumeSectionId | null
  panel: EditorRoutePanel | null
  template: TemplateStyle | null
  aiSection: AISection | null
  toastTitle: string | null
  toastDescription: string | null
}

interface TemplateFitDisplayMeta {
  insight: TemplateFitInsight
  recommendedTemplateLabel: string
  alternateTemplateLabel: string | null
  title: string
  description: string
}

/**
 * 规范化编辑器模块参数
 * 兼容首页入口、历史参数和语义化别名，统一落到编辑器主链模块。
 */
function normalizeEditorFocusParam(value: string | null): ResumeSectionId | null {
  if (!value) {
    return null
  }

  const normalizedMap: Record<string, ResumeSectionId> = {
    personal: 'personal',
    'personal-info': 'personal',
    personalInfo: 'personal',
    summary: 'personal',
    experience: 'experience',
    experiences: 'experience',
    work: 'experience',
    education: 'education',
    educations: 'education',
    skills: 'skills',
    skill: 'skills',
    projects: 'projects',
    project: 'projects'
  }

  return normalizedMap[value] ?? null
}

/**
 * 规范化编辑器面板参数
 * 收敛模板选择和 AI 面板的不同命名，避免首页入口继续散落字符串。
 */
function normalizeEditorPanelParam(value: string | null): EditorRoutePanel | null {
  if (!value) {
    return null
  }

  const normalizedMap: Record<string, EditorRoutePanel> = {
    template: 'template',
    templates: 'template',
    selector: 'template',
    ai: 'ai',
    assistant: 'ai'
  }

  return normalizedMap[value] ?? null
}

/**
 * 规范化首页入口场景参数
 * 将不同入口别名统一到固定场景，便于编辑器按场景预设默认状态。
 */
function normalizeEditorEntryParam(value: string | null): EditorEntryScenario | null {
  if (!value) {
    return null
  }

  const normalizedMap: Record<string, EditorEntryScenario> = {
    campus: 'campus',
    student: 'campus',
    engineering: 'engineering',
    tech: 'engineering',
    product: 'product',
    operation: 'product',
    operations: 'product',
    general: 'general',
    default: 'general',
    universal: 'general'
  }

  return normalizedMap[value] ?? null
}

/**
 * 规范化模板参数
 * 支持语义化别名和真实模板 ID，确保首页跳转能稳定命中目标模板。
 */
function normalizeEditorTemplateParam(value: string | null): TemplateStyle | null {
  if (!value) {
    return null
  }

  const normalizedMap: Record<string, string> = {
    standard: 'banner-layout',
    banner: 'banner-layout',
    business: 'card-layout-executive',
    card: 'card-layout-executive',
    timeline: 'timeline-layout-classic',
    senior: 'timeline-layout-classic'
  }

  return getTemplateById(normalizedMap[value] ?? value) ?? null
}

/**
 * 获取首页入口场景预设
 * 用统一配置描述“校招 / 技术岗 / 产品运营 / 通用投递”的默认落点。
 */
function getEditorEntryPreset(
  entry: EditorEntryScenario | null,
  locale: 'zh' | 'en'
): Omit<EditorRouteIntent, 'hasRouteIntent'> {
  if (!entry) {
    return {
      entryScenario: null,
      section: null,
      panel: null,
      template: null,
      aiSection: null,
      toastTitle: null,
      toastDescription: null
    }
  }

  const standardTemplate = getTemplateById('banner-layout') ?? null
  const businessTemplate = getTemplateById('card-layout-executive') ?? null

  const presetMap: Record<EditorEntryScenario, Omit<EditorRouteIntent, 'hasRouteIntent'>> = locale === 'en'
    ? {
        campus: {
          entryScenario: 'campus',
          section: 'education',
          panel: null,
          template: standardTemplate,
          aiSection: null,
          toastTitle: 'Campus entry applied',
          toastDescription: 'Education is focused first, and the standard single-column template is ready.'
        },
        engineering: {
          entryScenario: 'engineering',
          section: 'experience',
          panel: 'ai',
          template: standardTemplate,
          aiSection: 'experience',
          toastTitle: 'Engineering entry applied',
          toastDescription: 'Experience is focused first and AI rewrite is ready for your delivery highlights.'
        },
        product: {
          entryScenario: 'product',
          section: 'projects',
          panel: 'ai',
          template: businessTemplate,
          aiSection: 'projects',
          toastTitle: 'Product / Ops entry applied',
          toastDescription: 'Projects are focused first with the business dual-column template selected.'
        },
        general: {
          entryScenario: 'general',
          section: 'personal',
          panel: 'template',
          template: standardTemplate,
          aiSection: null,
          toastTitle: 'General delivery entry applied',
          toastDescription: 'The template selector is opened first so you can choose a delivery-ready layout.'
        }
      }
    : {
        campus: {
          entryScenario: 'campus',
          section: 'education',
          panel: null,
          template: standardTemplate,
          aiSection: null,
          toastTitle: '已切换到校招入口',
          toastDescription: '已优先定位教育模块，并预设标准单栏投递模板。'
        },
        engineering: {
          entryScenario: 'engineering',
          section: 'experience',
          panel: 'ai',
          template: standardTemplate,
          aiSection: 'experience',
          toastTitle: '已切换到技术岗入口',
          toastDescription: '已优先定位工作经历，并准备好 AI 润色入口。'
        },
        product: {
          entryScenario: 'product',
          section: 'projects',
          panel: 'ai',
          template: businessTemplate,
          aiSection: 'projects',
          toastTitle: '已切换到产品/运营入口',
          toastDescription: '已优先定位项目模块，并预设商务双栏投递模板。'
        },
        general: {
          entryScenario: 'general',
          section: 'personal',
          panel: 'template',
          template: standardTemplate,
          aiSection: null,
          toastTitle: '已打开通用投递入口',
          toastDescription: '已先为你打开模板选择器，方便直接挑选投递版式。'
        }
      }

  return presetMap[entry]
}

/**
 * 解析编辑器路由入口意图
 * 将首页与其他入口传入的场景、模块、面板、模板参数收敛成统一状态。
 */
function resolveEditorRouteIntent(
  routeSource: EditorRouteSource,
  locale: 'zh' | 'en'
): EditorRouteIntent {
  const entry = normalizeEditorEntryParam(routeSource.get('entry'))
  const preset = getEditorEntryPreset(entry, locale)
  const section = normalizeEditorFocusParam(routeSource.get('focus')) ?? preset.section
  const panel = normalizeEditorPanelParam(routeSource.get('panel')) ?? preset.panel
  const template = normalizeEditorTemplateParam(routeSource.get('template')) ?? preset.template
  const aiSectionParam = routeSource.get('aiSection') ?? routeSource.get('ai')
  const aiSection = aiSectionParam
    ? normalizeSectionToAISection(aiSectionParam)
    : preset.aiSection ?? (panel === 'ai' && section ? normalizeSectionToAISection(section) : null)

  return {
    hasRouteIntent: Boolean(entry || section || panel || template),
    entryScenario: entry,
    section,
    panel,
    template,
    aiSection,
    toastTitle: preset.toastTitle,
    toastDescription: preset.toastDescription
  }
}

// 懒加载非关键组件 - 优化初始加载性能 (Requirements: 1.5)
const ResumeEditor = dynamic(() => import('@/components/ResumeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
})

// 懒加载统一 AI 助手面板
const UnifiedAIPanel = dynamic(() => import('@/components/UnifiedAIPanel'), {
  loading: () => <AIAssistantSkeleton />,
  ssr: false
})

// 懒加载模板选择器组件
const TemplateSelector = dynamic(() => import('@/components/TemplateSelector'), {
  loading: () => <TemplateSelectorSkeleton />,
  ssr: false
})

// 懒加载导出预览对话框组件
const ExportPreviewDialog = dynamic(() => import('@/components/ExportPreviewDialog'), {
  loading: () => <ExportPreviewDialogSkeleton />,
  ssr: false
})

/**
 * 简历编辑器页面 - 简洁版
 * 采用与首页一致的简约设计风格
 */
export default function EditorPage() {
  /**
   * 编辑器调试日志
   * 仅在开发环境输出，避免生产环境污染控制台
   */
  const logEditorDebug = useCallback((...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args)
    }
  }, [])

  const [showUnifiedAI, setShowUnifiedAI] = useState(false)
  const [preferredAISection, setPreferredAISection] = useState<AISection | null>(null)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [aiConfigVersion, setAIConfigVersion] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)
  const [showShortcutHelp, setShowShortcutHelp] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<TemplateStyle>(() => {
    // 尝试从 localStorage 恢复用户之前选择的模板
    if (typeof window !== 'undefined') {
      try {
        const savedTemplateId = localStorage.getItem('currentTemplateId')
        if (savedTemplateId) {
          const savedTemplate = getTemplateById(savedTemplateId)
          if (savedTemplate) {
            return savedTemplate
          }
        }
      } catch (error) {
        console.error('恢复模板失败:', error)
      }
    }
    return getDefaultTemplate()
  })
  const [activeSection, setActiveSection] = useState<ResumeSectionId>('personal')
  const [, setExportOptions] = useState<{ margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }>({ margin: 10, showPageBreaks: true, paper: 'a4' })
  
  // 新增状态
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 1
  const searchParams = useSearchParams()
  const lastAppliedRouteSignatureRef = useRef<string | null>(null)
  
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'
  const mobileAIConfigStatus = useAIConfigStatus()

  const { success: showSuccess, error: showError, info: showInfo } = useToastContext()

  /**
   * 获取移动端顶部 AI 状态摘要
   * 保持移动端切换条与桌面工具栏使用同一套状态语义，但压缩成更适合小屏的显示密度。
   */
  const mobileAIStatusMeta = useMemo(() => {
    const statusKey = getAIWorkbenchStatusKey(mobileAIConfigStatus)
    const { toneClass } = getAIWorkbenchToneMeta(statusKey)
    const action = getAIWorkbenchAction(statusKey)
    const label = getAIWorkbenchBadgeLabel(statusKey, isZh ? 'zh' : 'en')
    const actionLabel = getAIWorkbenchActionLabel(statusKey, isZh ? 'zh' : 'en')

    if (statusKey === 'ready') {
      return {
        toneClass,
        label,
        description: isZh ? '已可直接使用。' : 'Ready to use.',
        actionLabel,
        action
      }
    }

    if (statusKey === 'needsValidation') {
      return {
        toneClass,
        label,
        description: isZh ? '还差一次验证。' : 'One validation is still needed.',
        actionLabel,
        action
      }
    }

    if (statusKey === 'needsConfig') {
      return {
        toneClass,
        label,
        description: isZh ? '还缺少配置项。' : 'Some required settings are missing.',
        actionLabel,
        action
      }
    }

    return {
      toneClass,
      label,
      description: isZh ? '当前已停用。' : 'Currently disabled.',
      actionLabel,
      action
    }
  }, [mobileAIConfigStatus, isZh])
  // 简历数据状态
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '张三',
      title: '资深前端工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市朝阳区',
      website: 'https://github.com/zhangsan',
      contactQRCode: 'https://github.com/zhangsan',
      summary: '拥有5年前端开发经验，专注于构建高性能、可扩展的Web应用。精通React技术栈和现代前端工程化。具备良好的团队协作能力和技术领导力，曾主导多个大型项目的架构设计与开发。',
      avatar: '/avatars/img1.png'
    },
    experience: [
      {
        id: '1',
        company: '未来科技有限公司',
        position: '高级前端开发工程师',
        startDate: '2022-01',
        endDate: '至今',
        current: true,
        description: [
          '主导公司核心SaaS产品的前端重构，采用Next.js + TypeScript架构，首屏加载速度提升40%',
          '设计并实现企业级组件库，覆盖50+常用组件，提升团队开发效率30%',
          '负责前端团队技术建设，制定代码规范和Code Review流程，显著降低线上故障率'
        ],
        location: '北京'
      },
      {
        id: '2',
        company: '创新网络科技有限公司',
        position: '前端开发工程师',
        startDate: '2019-06',
        endDate: '2021-12',
        current: false,
        description: [
          '负责电商平台C端业务开发，参与双11大促活动页面的性能优化',
          '实现复杂的数据可视化大屏，支持实时数据更新和交互分析',
          '优化移动端H5页面体验，解决不同机型的兼容性问题'
        ],
        location: '北京'
      }
    ],
    education: [
      {
        id: '1',
        school: '北京大学',
        degree: '硕士',
        major: '软件工程',
        startDate: '2016-09',
        endDate: '2019-06',
        gpa: '3.8/4.0'
      },
      {
        id: '2',
        school: '北京邮电大学',
        degree: '学士',
        major: '计算机科学与技术',
        startDate: '2012-09',
        endDate: '2016-06',
        gpa: '3.7/4.0'
      }
    ],
    skills: [
      {
        id: '1',
        name: 'React / Next.js',
        level: 95,
        category: '前端框架',
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'TypeScript',
        level: 90,
        category: '编程语言',
        color: '#3B82F6'
      },
      {
        id: '3',
        name: 'Node.js',
        level: 85,
        category: '后端技术',
        color: '#10B981'
      },
      {
        id: '4',
        name: '性能优化',
        level: 85,
        category: '核心能力',
        color: '#F59E0B'
      },
      {
        id: '5',
        name: 'CI/CD',
        level: 80,
        category: '工程化',
        color: '#6B7280'
      }
    ],
    projects: [
      {
        id: '1',
        name: '企业级协作平台',
        description: '一款支持千人即时通讯和文档协作的企业级SaaS平台。',
        technologies: ['React', 'WebSocket', 'WebRTC', 'Redis'],
        startDate: '2023-03',
        endDate: '2023-08',
        url: 'https://example.com/project',
        highlights: [
          '设计并实现即时通讯模块，支持单聊、群聊和消息漫游，日均消息量达百万级',
          '基于WebRTC实现多人音视频通话功能，延迟控制在200ms以内',
          '优化富文本编辑器性能，支持大文档流畅编辑和协同操作'
        ]
      }
    ]
  })
  const completeness = useMemo(() => calculateResumeCompleteness(resumeData), [resumeData])
  const sectionCompletenessMap = useMemo(() => {
    return completeness.sections.reduce((acc, item) => {
      acc[item.section] = item
      return acc
    }, {} as Partial<Record<ResumeSectionId, SectionCompleteness>>)
  }, [completeness.sections])
  const templateFitDisplayMeta = useMemo<TemplateFitDisplayMeta>(() => {
    const insight = getTemplateFitInsight(resumeData, locale, currentTemplate.id)
    const recommendedTemplate = getTemplateById(insight.recommendedTemplateId)
    const alternateTemplate = insight.alternateTemplateId ? getTemplateById(insight.alternateTemplateId) : null
    const recommendedTemplateLabel = locale === 'en' && recommendedTemplate?.nameEn
      ? recommendedTemplate.nameEn
      : recommendedTemplate?.name || insight.recommendedTemplateId
    const alternateTemplateLabel = alternateTemplate
      ? (locale === 'en' && alternateTemplate.nameEn ? alternateTemplate.nameEn : alternateTemplate.name)
      : null

    if (!insight.shouldSuggestSwitch) {
      return {
        insight,
        recommendedTemplateLabel,
        alternateTemplateLabel,
        title: locale === 'zh'
          ? `当前内容与「${recommendedTemplateLabel}」匹配度较高`
          : `Current content already fits ${recommendedTemplateLabel}`,
        description: `${insight.detail}${alternateTemplateLabel
          ? (locale === 'zh' ? ` 如需备选，可考虑「${alternateTemplateLabel}」。` : ` ${alternateTemplateLabel} is also a solid fallback.`)
          : ''}`
      }
    }

    return {
      insight,
      recommendedTemplateLabel,
      alternateTemplateLabel,
      title: locale === 'zh'
        ? `当前内容更适合「${recommendedTemplateLabel}」`
        : `Current content fits ${recommendedTemplateLabel} better`,
      description: `${insight.detail}${alternateTemplateLabel
        ? (locale === 'zh' ? ` 如果不想切得太激进，也可先试「${alternateTemplateLabel}」。` : ` If you want a milder change, try ${alternateTemplateLabel} first.`)
        : ''}`
    }
  }, [currentTemplate.id, locale, resumeData])

  // 导出工作流 Hook
  const {
    isExporting,
    handleExport,
    handleExportByFormat,
    exportProgress,
    estimatedTimeRemaining,
    exportStatus,
    isExportInProgress,
    canCancel,
    cancelExport,
    resetExportProgress
  } = useEditorExportFlow({
    resumeData,
    resumeName: resumeData.personalInfo.name || '简历',
    exportSuccessMessage: t.editor.messages.exportSuccess,
    jsonExportSuccessMessage: t.editor.messages.jsonExportSuccess,
    exportErrorMessage: t.editor.messages.exportError,
    onSuccess: showSuccess,
    onError: showError,
    logger: logEditorDebug
  })

  // 实时预览状态
  const { previewData, isUpdating } = useRealtimePreview(resumeData)

  /**
   * 保存简历数据到本地存储 - 使用 useCallback 优化
   */
  const saveResumeData = useCallback(async (data: ResumeData) => {
    try {
      localStorage.setItem('resumeData', JSON.stringify(data))
      localStorage.setItem('resumeData_backup', JSON.stringify(data))
      localStorage.setItem('resumeData_timestamp', new Date().toISOString())
    } catch (error) {
      console.error('保存失败:', error)
      throw error
    }
  }, [])

  // 自动保存功能
  const {
    isSaving,
    lastSavedAt,
    hasUnsavedChanges,
    saveNow,
  } = useAutoSave(resumeData, saveResumeData, {
    interval: 30000, // 30秒自动保存
    enabled: true,
    onSaveSuccess: () => undefined,
    onSaveError: (error) => {
      console.error('自动保存失败:', error)
    }
  })

  // 数据导入导出对话框状态
  const [showImportExportDialog, setShowImportExportDialog] = useState(false)
  
  // 存储监控 Hook
  const {
    usage: storageUsage,
    cleanupOldData: cleanupStorageUsage,
    refresh: refreshStorageUsage
  } = useStorageMonitor()
  
  // 上下文菜单 Hook
  const {
    isOpen: isContextMenuOpen,
    position: contextMenuPosition,
    closeMenu: closeContextMenu,
    menuItems: contextMenuItems
  } = useContextMenu()
  
  // 批量选择 Hook (用于工作经历)
  const {
    selectedIds: selectedExperienceIds,
    selectionCount: experienceSelectionCount,
    selectAll: selectAllExperiences,
    clearSelection: clearExperienceSelection,
    batchDelete: batchDeleteExperiences,
    batchCopy: batchCopyExperiences,
    batchMove: batchMoveExperiences
  } = useBatchSelection<Experience>()
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'warning' | 'danger' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })
  
  // 全局加载状态
  const [globalLoading, _setGlobalLoading] = useState(false)
  const [globalLoadingMessage, _setGlobalLoadingMessage] = useState('')
  
  // 批量删除工作经历
  const handleBatchDeleteExperiences = useCallback(() => {
    if (experienceSelectionCount === 0) return
    
    const isZh = t.common.edit === '编辑'
    setConfirmDialog({
      isOpen: true,
      title: isZh ? '确认删除' : 'Confirm Delete',
      message: isZh 
        ? `确定要删除选中的 ${experienceSelectionCount} 条工作经历吗？此操作无法撤销。`
        : `Are you sure you want to delete ${experienceSelectionCount} selected experience(s)? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        const remainingExperiences = batchDeleteExperiences(
          resumeData.experience,
          () => {}
        )
        setResumeData(prev => ({
          ...prev,
          experience: remainingExperiences
        }))
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        showSuccess(isZh ? `已删除 ${experienceSelectionCount} 条工作经历` : `Deleted ${experienceSelectionCount} experience(s)`)
      }
    })
  }, [experienceSelectionCount, batchDeleteExperiences, resumeData.experience, setResumeData, showSuccess, t])
  
  // 批量复制工作经历
  const handleBatchCopyExperiences = useCallback(() => {
    const isZh = t.common.edit === '编辑'
    const copiedExperiences = batchCopyExperiences(
      resumeData.experience,
      () => `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    )
    setResumeData(prev => ({
      ...prev,
      experience: copiedExperiences
    }))
    showSuccess(isZh ? `已复制 ${experienceSelectionCount} 条工作经历` : `Copied ${experienceSelectionCount} experience(s)`)
  }, [batchCopyExperiences, resumeData.experience, experienceSelectionCount, setResumeData, showSuccess, t])
  
  // 批量移动工作经历
  const handleBatchMoveExperiences = useCallback((direction: 'up' | 'down') => {
    const movedExperiences = batchMoveExperiences(resumeData.experience, direction)
    setResumeData(prev => ({
      ...prev,
      experience: movedExperiences
    }))
  }, [batchMoveExperiences, resumeData.experience, setResumeData])
  
  /**
   * 手动保存 - 使用 useCallback 优化
   */
  const handleSave = useCallback(async () => {
    await saveNow()
  }, [saveNow])

  /**
   * 应用导入后的简历数据
   * 导入成功后立即写回本地存储，避免刷新页面后仍停留在旧数据。
   */
  const handleImportedResumeData = useCallback((nextResumeData: ResumeData) => {
    setResumeData(nextResumeData)
    void saveResumeData(nextResumeData).catch((error) => {
      logEditorDebug('导入后的数据持久化失败:', error)
    })
  }, [logEditorDebug, saveResumeData])

  /**
   * 从本地存储加载简历数据 - 增强错误恢复
   */
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('resumeData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        // 验证数据完整性，确保至少有基本的个人信息
        if (parsedData?.personalInfo?.name) {
          setResumeData(parsedData)
        } else {
          logEditorDebug('本地存储数据不完整，使用默认数据')
        }
      }
    } catch (error) {
      console.error('加载数据失败，尝试从备份恢复:', error)
      try {
        const backupData = localStorage.getItem('resumeData_backup')
        if (backupData) {
          const parsedData = JSON.parse(backupData)
          if (parsedData?.personalInfo?.name) {
            setResumeData(parsedData)
            showInfo(t.editor.messages.backupRestored, t.editor.messages.backupRestoredDesc)
          }
        }
      } catch (backupError) {
        console.error('备份恢复也失败:', backupError)
      }
    }
  }, [showInfo, t, logEditorDebug])

  /**
   * 保存当前模板到本地存储
   */
  useEffect(() => {
    if (currentTemplate?.id) {
      localStorage.setItem('currentTemplateId', currentTemplate.id)
    }
  }, [currentTemplate])

  /**
   * 更新简历数据 - 使用 useCallback 优化
   * @param newData - 新的简历数据
   */
  const handleResumeUpdate = useCallback((newData: ResumeData) => {
    setResumeData(newData)
  }, [])

  

  /**
   * 处理模板选择
   * @param template - 选择的模板
   */
  /**
   * 处理模板选择
   * 修复：确保即使删除内容后也能正常切换模板
   */
  const handleTemplateSelect = useCallback((template: TemplateStyle) => {
    // 检查简历数据完整性，如果数据为空或不完整，使用默认数据
    setResumeData(prevData => {
      // 确保至少有基本的个人信息结构
      if (!prevData.personalInfo || !prevData.personalInfo.name) {
        logEditorDebug('[编辑器提示] 检测到简历数据不完整，使用默认数据')
        return {
          personalInfo: {
            name: '请填写姓名',
            title: '请填写职位',
            email: '',
            phone: '',
            location: '',
            website: '',
            contactQRCode: '',
            summary: '',
            avatar: template.components?.personalInfo?.defaultAvatar || '/avatars/img1.png'
          },
          experience: [],
          education: [],
          skills: [],
          projects: []
        }
      }
      
      // 数据完整，保持原样
      return prevData
    })
    
    setCurrentTemplate(template)
    
    setShowTemplateSelector(false)
  }, [logEditorDebug])

  /**
   * 规范化编辑模块到 AI 模块
   * 确保来自编辑器、预览区或快捷入口的 section 都能映射到统一 AI 模式。
   */
  const normalizeAISection = useCallback((section: string): AISection => {
    return normalizeSectionToAISection(section)
  }, [])

  /**
   * 聚焦到指定编辑模块
   * 统一预览区、AI 面板和快捷入口的“回到编辑区”行为。
   */
  const focusEditorSection = useCallback((section: ResumeSectionId) => {
    setActiveSection(section)

    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsPreviewMode(false)
    }
  }, [])

  /**
   * 应用单条 AI 建议
   * 通过领域层 action 统一处理文案解析和数据写回。
   */
  const handleApplyAISuggestion = useCallback((content: string, section: string) => {
    const result = applyAISuggestionToResumeData(resumeData, content, section)
    if (!result.changed) {
      return
    }

    const aiSection = normalizeSectionToAISection(section)
    const editorSection = aiSection === 'summary' ? 'personal' : aiSection
    const fieldGuidance = getPrimaryEditorFieldGuidance(editorSection, null, locale)
    const successLabelMap: Record<AISection, string> = locale === 'zh'
      ? {
          summary: '个人简介已更新',
          experience: '工作经历已更新',
          skills: '专业技能已更新',
          education: '教育经历已更新',
          projects: '项目经验已更新'
        }
      : {
          summary: 'Summary updated',
          experience: 'Experience updated',
          skills: 'Skills updated',
          education: 'Education updated',
          projects: 'Projects updated'
        }

    setResumeData(result.nextResumeData)
    focusEditorSection(editorSection)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('switchToEditor', {
          detail: {
            section: editorSection,
            fieldKey: fieldGuidance.fieldKey
          }
        })
      )
    }

    showSuccess(
      successLabelMap[aiSection],
      locale === 'zh'
        ? '已自动定位到对应模块，并高亮本次更新的内容区域。'
        : 'Jumped to the updated section and highlighted the edited field.'
    )
  }, [focusEditorSection, locale, resumeData, showSuccess])

  /**
   * 应用所有 JD 建议
   * @param suggestions - JD 优化建议数组
   */
  const handleApplyAllJDSuggestions = useCallback((suggestions: JDSuggestion[]) => {
    let appliedCount = 0
    let nextResumeData = resumeData
    let firstAppliedSection: AISection | null = null

    suggestions.forEach((suggestion) => {
      const content = (suggestion as JDSuggestion & { optimized?: string }).suggestedText || (suggestion as JDSuggestion & { optimized?: string }).optimized || ''
      if (!content || !suggestion.section) return
      const result = applyAISuggestionToResumeData(nextResumeData, content, suggestion.section)
      if (!result.changed) return
      nextResumeData = result.nextResumeData
      appliedCount += 1
      if (!firstAppliedSection) {
        firstAppliedSection = normalizeSectionToAISection(suggestion.section)
      }
    })

    if (appliedCount > 0) {
      if (firstAppliedSection) {
        const editorSection = firstAppliedSection === 'summary' ? 'personal' : firstAppliedSection
        const fieldGuidance = getPrimaryEditorFieldGuidance(editorSection, null, locale)

        focusEditorSection(editorSection)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('switchToEditor', {
              detail: {
                section: editorSection,
                fieldKey: fieldGuidance.fieldKey
              }
            })
          )
        }
      }

      setResumeData(nextResumeData)
      showSuccess(
        locale === 'zh'
          ? `已应用 ${appliedCount} 条 JD 优化建议`
          : `Applied ${appliedCount} JD suggestions`,
        locale === 'zh'
          ? '已自动定位到首个更新模块，方便继续检查和微调。'
          : 'Jumped to the first updated section so you can review and refine it.'
      )
    }
  }, [focusEditorSection, locale, resumeData, showSuccess])

  /**
   * 处理AI生成完成
   * @param data - 生成的简历数据
   */
  const handleAIGenerateComplete = useCallback((data: Partial<ResumeData>) => {
    const nextResumeData = mergeGeneratedResumeData(resumeData, data)
    const fieldGuidance = getPrimaryEditorFieldGuidance('personal', null, locale)

    setResumeData(nextResumeData)
    focusEditorSection('personal')

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('switchToEditor', {
          detail: {
            section: 'personal',
            fieldKey: fieldGuidance.fieldKey
          }
        })
      )
    }

    showSuccess(
      locale === 'zh' ? 'AI 生成内容已应用到简历' : 'AI-generated content applied',
      locale === 'zh'
        ? '已自动定位到个人信息区域，方便继续补真实信息。'
        : 'Jumped to the personal section so you can continue refining the real details.'
    )
  }, [focusEditorSection, locale, resumeData, showSuccess])

  /**
   * 处理 AI 配置保存
   * 用于统一 AI 配置入口的成功反馈
   */
  const handleAIConfigSave = useCallback((_config: AIConfig) => {
    setAIConfigVersion((currentVersion) => currentVersion + 1)
    showSuccess(
      locale === 'zh' ? 'AI 配置已保存' : 'AI configuration saved',
      locale === 'zh' ? '可以回到 AI 助手继续验证或开始优化。' : 'Return to AI Assistant to validate or start optimizing.'
    )
  }, [locale, showSuccess])

  /**
   * 读取本地简历文件
   * 把低频的文件导入能力收进高级入口，避免继续占用顶部主操作位。
   */
  const handleLoadResumeFile = useCallback(async () => {
    try {
      const loadedData = await loadResumeFromFile()
      if (!loadedData) {
        return
      }

      setResumeData(loadedData)
      showSuccess(
        locale === 'zh' ? '本地文件已加载' : 'Local file loaded',
        locale === 'zh' ? '简历内容已更新到当前编辑器。' : 'The resume content was loaded into the current editor.'
      )
    } catch (error) {
      logEditorDebug('加载本地文件失败:', error)
      showError(
        locale === 'zh' ? '读取失败' : 'Load failed',
        locale === 'zh' ? '请检查文件内容后重试。' : 'Please verify the file and retry.'
      )
    }
  }, [locale, logEditorDebug, showError, showSuccess])

  /**
   * 处理编辑器模块切换
   * 兼容来自工具栏、导航和编辑器内部的字符串 section 标识。
   */
  const handleSectionChange = useCallback((section: string) => {
    const normalizedSection = normalizeEditorFocusParam(section)
    if (!normalizedSection) {
      return
    }
    setActiveSection(normalizedSection)
  }, [])

  /**
   * 处理预览区章节点击
   * 点击预览中的模块后，自动定位到对应编辑模块，并在小屏切换到编辑视图。
   */
  const handlePreviewSectionClick = useCallback((section: string) => {
    const normalizedSection = normalizePreviewSectionToEditor(section)
    if (!normalizedSection) {
      return
    }

    focusEditorSection(normalizedSection)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('switchToEditor', {
          detail: { section: normalizedSection }
        })
      )
    }
  }, [focusEditorSection])

  /**
   * 打开统一 AI 面板
   * 支持按当前编辑模块预定位，减少重复点击和路径跳转。
   */
  const openUnifiedAIPanel = useCallback((section?: AISection) => {
    setPreferredAISection(section ?? null)
    setShowUnifiedAI(true)
  }, [])

  /**
   * 从 AI 面板回到指定编辑模块
   * 用于“先补内容再优化”的闭环，避免用户手动来回找对应表单。
   */
  const handleFocusSectionFromAI = useCallback((section: AISection) => {
    focusEditorSection(section === 'summary' ? 'personal' : section)
    setPreferredAISection(section)
    setShowUnifiedAI(false)
  }, [focusEditorSection])

  /**
   * 应用首页和外部入口参数
   * 让首页场景入口、模板推荐和 AI 面板入口都通过统一协议落到编辑器状态。
   */
  useEffect(() => {
    const routeSignature = searchParams.toString()
    if (lastAppliedRouteSignatureRef.current === routeSignature) {
      return
    }

    lastAppliedRouteSignatureRef.current = routeSignature

    const routeIntent = resolveEditorRouteIntent(searchParams, locale)
    if (!routeIntent.hasRouteIntent) {
      return
    }

    if (routeIntent.section) {
      setActiveSection(routeIntent.section)
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        setIsPreviewMode(false)
      }
    }

    if (routeIntent.template) {
      setCurrentTemplate(routeIntent.template)
    }

    if (routeIntent.panel === 'template') {
      setShowUnifiedAI(false)
      setShowTemplateSelector(true)
    }

    if (routeIntent.panel === 'ai') {
      setShowTemplateSelector(false)
      openUnifiedAIPanel(routeIntent.aiSection ?? undefined)
    }

    if (routeIntent.toastTitle && routeIntent.toastDescription) {
      showInfo(routeIntent.toastTitle, routeIntent.toastDescription)
    }
  }, [locale, openUnifiedAIPanel, searchParams, showInfo])

  // 键盘快捷键配置 - 使用 useMemo 优化
  const shortcuts = useMemo(() => createEditorShortcuts({
    onSave: saveNow,
    onExport: () => setShowExportDialog(true),
    onTogglePreview: () => setIsPreviewMode(prev => !prev),
    onToggleFullscreen: () => setIsFullscreen(prev => !prev),
    onOpenAI: () => openUnifiedAIPanel(normalizeAISection(activeSection)),
  }), [saveNow, openUnifiedAIPanel, normalizeAISection, activeSection])

  // 添加滑动手势支持
  const { isSwiping: _isSwiping, ...swipeHandlers } = useHorizontalSwipe(
    () => {
      // 左滑：切换到预览模式（仅在移动端且当前为编辑模式时）
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && !isPreviewMode) {
        setIsPreviewMode(true)
      }
    },
    () => {
      // 右滑：切换到编辑模式（仅在移动端且当前为预览模式时）
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && isPreviewMode) {
        setIsPreviewMode(false)
      }
    },
    {
      minSwipeDistance: 80, // 增加最小滑动距离，避免误触
      minSwipeVelocity: 0.4, // 适中的滑动速度要求
      preventDefault: false, // 不阻止默认行为，保持滚动功能
    }
  )
  // 使用键盘快捷键
  const { getShortcutHelp } = useKeyboardShortcuts(shortcuts)

  /**
   * 页面离开提醒
   * 当存在未保存修改时，阻止用户误关闭标签页导致内容丢失。
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  return (
      <StyleProvider>
          <TemplateStyleSync currentTemplate={currentTemplate} />
          <div className="h-screen bg-slate-50 text-gray-900 flex flex-col overflow-hidden">
            {!isFullscreen && <Header />}

          {/* 主要内容区域 - 固定高度，禁止页面滚动 */}
          <main className="flex-1 flex flex-col py-4 lg:py-6 overflow-hidden min-h-0">
            {/* 顶部工具栏 */}
            <EditorToolbar
              resumeData={resumeData}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSavedAt={lastSavedAt}
              isPreviewMode={isPreviewMode}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              onShowAIAssistant={() => openUnifiedAIPanel(normalizeAISection(activeSection))}
              onShowTemplateSelector={() => setShowTemplateSelector(true)}
              onShowAdvancedPanel={() => setShowAdvancedPanel(true)}
              onExport={handleExport}
              onSave={handleSave}
            />

            {/* 编辑器和预览区域 - 使用三栏布局 */}
            <div 
              className="flex-1 flex flex-col mx-4 mt-3 sm:mx-6 lg:mx-8 overflow-hidden min-h-0"
              {...swipeHandlers}
            >
              {/* 移动端切换按钮 */}
              <div className="xl:hidden flex-shrink-0 px-2 pt-3 sm:px-4">
                <div className="app-shell-toolbar-surface p-1.5">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setIsPreviewMode(false)}
                      className={`h-10 rounded-xl px-4 text-sm font-medium transition-colors ${
                        !isPreviewMode
                          ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                          : 'app-shell-toolbar-button'
                      }`}
                    >
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => setIsPreviewMode(true)}
                      className={`h-10 rounded-xl px-4 text-sm font-medium transition-colors ${
                        isPreviewMode
                          ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                          : 'app-shell-toolbar-button'
                      }`}
                    >
                      {t.common.preview}
                    </button>
                  </div>
                  <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${mobileAIStatusMeta.toneClass}`}>
                      <div className="min-w-0 flex items-start gap-2">
                        <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {mobileAIStatusMeta.label}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] opacity-80">
                            {mobileAIStatusMeta.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (mobileAIStatusMeta.action === 'assistant') {
                            openUnifiedAIPanel(normalizeAISection(activeSection))
                            return
                          }

                          setShowAIConfig(true)
                        }}
                        className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border border-current/15 bg-white/80 px-3 text-[11px] font-medium text-current transition-colors hover:bg-white"
                      >
                        {mobileAIStatusMeta.action === 'assistant'
                          ? <Bot className="h-3.5 w-3.5" />
                          : <Settings className="h-3.5 w-3.5" />}
                        <span>{mobileAIStatusMeta.actionLabel}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedPanel(true)}
                      className="app-shell-toolbar-button h-full min-h-[56px] px-3"
                      title={isZh ? '更多工具' : 'More tools'}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1.5 px-1 text-[11px] text-slate-500">
                    {isZh ? '模板、导出、导入和配置已收进“更多”。' : 'Templates, export, import, and configuration are under More.'}
                  </p>
                </div>
              </div>

              {/* 三栏布局 - 桌面端 (>=1280px) */}
              <div className="hidden xl:flex flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <ThreeColumnLayout
                  className="h-full w-full"
                  leftPanel={
                    <SectionNavigation
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      sectionCompleteness={sectionCompletenessMap}
                    />
                  }
                  centerPanel={
                    <ResumeEditor
                      resumeData={resumeData}
                      onUpdateResumeData={handleResumeUpdate}
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      onShowTemplateSelector={() => setShowTemplateSelector(true)}
                      onShowAIAssistant={(type) => openUnifiedAIPanel(type)}
                      hideNavigation={true}
                    />
                  }
                  rightPanel={
                    <PreviewPanel
                      resumeData={previewData}
                      template={currentTemplate}
                      zoom={previewZoom}
                      onZoomChange={setPreviewZoom}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      onExport={handleExport}
                      isLoading={false}
                      isDarkMode={false}
                      isUpdating={isUpdating}
                    >
                      <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}>
                        <ResumePreview 
                          key={currentTemplate.id}
                          resumeData={previewData} 
                          className="resume-preview" 
                          currentTemplate={currentTemplate}
                          isExporting={isExporting}
                          onSectionClick={handlePreviewSectionClick}
                        />
                      </div>
                    </PreviewPanel>
                  }
                  defaultWidths={{ left: 15, center: 45, right: 40 }}
                  storageKey="editor-column-widths"
                />
              </div>

              {/* 双栏/单栏布局 - 平板和移动端 (<1280px) */}
              <div className="xl:hidden flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
                {/* 左侧编辑器 */}
                <div className={`${isPreviewMode ? 'hidden lg:flex' : 'flex'} flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex-col`}>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ResumeEditor
                      resumeData={resumeData}
                      onUpdateResumeData={handleResumeUpdate}
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      onShowTemplateSelector={() => setShowTemplateSelector(true)}
                      onShowAIAssistant={(type) => openUnifiedAIPanel(type)}
                      hideNavigation={true}
                    />
                  </div>
                </div>

                {/* 右侧预览 */}
                <div className={`${isPreviewMode ? 'flex' : 'hidden lg:flex'} flex-1 min-h-0 lg:w-1/2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex-col`}>
                  <PreviewPanel
                    resumeData={previewData}
                    template={currentTemplate}
                    zoom={previewZoom}
                    onZoomChange={setPreviewZoom}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onExport={handleExport}
                    isLoading={false}
                    isDarkMode={false}
                    isUpdating={isUpdating}
                    className="h-full"
                  >
                    <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}>
                      <ResumePreview 
                        key={currentTemplate.id}
                        resumeData={previewData} 
                        className="resume-preview" 
                        currentTemplate={currentTemplate}
                        isExporting={isExporting}
                        onSectionClick={handlePreviewSectionClick}
                      />
                    </div>
                  </PreviewPanel>
                </div>
              </div>

            </div>

          </main>

        {/* 统一 AI 助手面板 */}
        {showUnifiedAI && (
          <UnifiedAIPanel
            isOpen={showUnifiedAI}
            onClose={() => {
              setShowUnifiedAI(false)
              setPreferredAISection(null)
            }}
            resumeData={resumeData}
            preferredSection={preferredAISection}
            configVersion={aiConfigVersion}
            onOpenAIConfig={() => setShowAIConfig(true)}
            onFocusSection={handleFocusSectionFromAI}
            onApplySuggestion={handleApplyAISuggestion}
            onApplyJDSuggestions={handleApplyAllJDSuggestions}
            onGenerateComplete={handleAIGenerateComplete}
          />
        )}

        {/* AI 配置弹窗 - 统一入口 */}
        <AIConfigModal
          isOpen={showAIConfig}
          onClose={() => setShowAIConfig(false)}
          onSave={handleAIConfigSave}
        />

        <EditorAdvancedPanel
          isOpen={showAdvancedPanel}
          onClose={() => setShowAdvancedPanel(false)}
          onOpenImportExport={() => setShowImportExportDialog(true)}
          onOpenTemplateSelector={() => setShowTemplateSelector(true)}
          onOpenExportDialog={() => setShowExportDialog(true)}
          onOpenAIConfig={() => setShowAIConfig(true)}
          onOpenAIAssistant={() => openUnifiedAIPanel(normalizeAISection(activeSection))}
          onOpenShortcutHelp={() => setShowShortcutHelp(true)}
          onLoadFromFile={handleLoadResumeFile}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
          storageUsage={storageUsage}
          onCleanupStorage={cleanupStorageUsage}
          onRefreshStorage={refreshStorageUsage}
        />

        {/* 快捷键帮助弹窗 */}
        {showShortcutHelp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg max-w-md w-full mx-4 overflow-hidden border border-gray-200/60 transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between p-5 border-b border-gray-200/50 bg-white/50 backdrop-blur-md">
                <h3 className="text-lg font-bold text-gray-900">键盘快捷键</h3>
                <button
                  onClick={() => setShowShortcutHelp(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {getShortcutHelp().map((item, index) => (
                    <div key={index} className="flex items-center justify-between group p-2 hover:bg-white/50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{item.description}</span>
                      <kbd className="px-2.5 py-1 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg transition-all font-mono">
                        {item.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    提示：在输入框中时，某些快捷键可能不会生效
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 模板选择器 - 仅在打开时渲染 */}
        {showTemplateSelector && (
          <TemplateSelector
            isOpen={showTemplateSelector}
            currentTemplate={currentTemplate.id}
            onSelectTemplate={handleTemplateSelect}
            onUpdateResumeData={(data) => {
              setResumeData(data)
            }}
            templateFitTitle={templateFitDisplayMeta.title}
            templateFitDescription={templateFitDisplayMeta.description}
            templateFitReasons={templateFitDisplayMeta.insight.reasons}
            templateFitRecommendedId={templateFitDisplayMeta.insight.recommendedTemplateId}
            templateFitRecommendedLabel={templateFitDisplayMeta.recommendedTemplateLabel}
            templateFitAlternateId={templateFitDisplayMeta.insight.alternateTemplateId ?? null}
            templateFitAlternateLabel={templateFitDisplayMeta.alternateTemplateLabel}
            templateFitShouldSuggestSwitch={templateFitDisplayMeta.insight.shouldSuggestSwitch}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
        
        {/* 导出预览对话框 - 仅在打开时渲染 */}
        {showExportDialog && (
          <ExportPreviewDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            onExport={handleExportByFormat}
            resumeName={resumeData.personalInfo.name}
            templateFitTitle={templateFitDisplayMeta.title}
            templateFitDescription={templateFitDisplayMeta.description}
            templateFitReasons={templateFitDisplayMeta.insight.reasons}
            templateFitRecommendedLabel={templateFitDisplayMeta.recommendedTemplateLabel}
            templateFitShouldSuggestSwitch={templateFitDisplayMeta.insight.shouldSuggestSwitch}
            onOptionsChange={(opts) => {
              setExportOptions(opts)
            }}
          />
        )}

        {/* 导出进度指示器 */}
        <AnimatePresence>
          {isExportInProgress && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50 w-80"
            >
              <ExportProgressIndicator
                progress={exportProgress.percentage}
                currentStep={exportProgress.step}
                currentPage={exportProgress.currentPage}
                totalPages={exportProgress.totalPages}
                estimatedTimeRemaining={estimatedTimeRemaining}
                cancellable={canCancel}
                onCancel={cancelExport}
                status={exportStatus}
                errorMessage={exportProgress.error}
                onRetry={() => {
                  resetExportProgress()
                  setShowExportDialog(true)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 数据导入导出对话框 - 仅在打开时渲染 */}
        {showImportExportDialog && (
          <ImportExportBridge
            isOpen={showImportExportDialog}
            onClose={() => setShowImportExportDialog(false)}
            resumeData={resumeData}
            onResumeDataImport={handleImportedResumeData}
            onImportApplied={refreshStorageUsage}
          />
        )}

        {/* 上下文菜单 */}
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPosition}
          onClose={closeContextMenu}
          isOpen={isContextMenuOpen}
        />

        {/* 批量编辑工具栏 */}
        <BatchEditToolbar
          selectedCount={experienceSelectionCount}
          onBatchDelete={handleBatchDeleteExperiences}
          onBatchMove={handleBatchMoveExperiences}
          onBatchCopy={handleBatchCopyExperiences}
          onClearSelection={clearExperienceSelection}
          onSelectAll={() => selectAllExperiences(resumeData.experience.map(e => e.id))}
          canMoveUp={selectedExperienceIds.length > 0 && !selectedExperienceIds.includes(resumeData.experience[0]?.id)}
          canMoveDown={selectedExperienceIds.length > 0 && !selectedExperienceIds.includes(resumeData.experience[resumeData.experience.length - 1]?.id)}
        />

        {/* 确认对话框 */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

        {/* 全局加载遮罩 */}
        {globalLoading && (
          <LoadingOverlay
            isLoading={globalLoading}
            message={globalLoadingMessage}
            fullScreen={true}
          />
        )}

        </div>
      </StyleProvider>
  )
}
