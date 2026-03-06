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

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ResumePreview from '@/components/ResumePreview'
import TemplateStyleSync from '@/components/TemplateStyleSync'
import Header from '@/components/Header'
import EditorToolbar from '@/components/EditorToolbar'
import { StyleProvider } from '@/contexts/StyleContext'
import { useToastContext } from '@/components/Toast'
import { useRealtimePreview } from '@/hooks/useRealtimePreview'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useKeyboardShortcuts, createEditorShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHorizontalSwipe } from '@/hooks/useSwipeGesture'
import { ResumeData, Experience } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { getDefaultTemplate, getTemplateById } from '@/data/templates'
import { X } from 'lucide-react'
import { 
  EditorSkeleton, 
  AIAssistantSkeleton, 
  TemplateSelectorSkeleton, 
  ExportPreviewDialogSkeleton 
} from '@/components/LoadingStates'
import { StyleSettingsPanel } from '@/components/editor/StyleSettingsPanel'
import { ThreeColumnLayout } from '@/components/editor/ThreeColumnLayout'
import { SectionNavigation } from '@/components/editor/SectionNavigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { JDSuggestion } from '@/services/jdMatcher'
import { PreviewPanel } from '@/components/preview'
import { ExportProgressIndicator, ExportStep, ExportStatus } from '@/components/export/ExportProgressIndicator'
import { PageBreakOverlay } from '@/components/export/PageBreakPreview'
import { useExportProgress } from '@/hooks/useExportProgress'
import { SaveStatusIndicator, SaveStatus, SaveHistoryItem } from '@/components/feedback/SaveStatusIndicator'
import { ImportExportDialog, ImportedData } from '@/components/data/ImportExportDialog'
import { StorageMonitor, StorageUsage, CleanupOptions } from '@/components/data/StorageMonitor'
import { useStorageMonitor } from '@/hooks/useStorageMonitor'
import { ContextMenu, ContextMenuItem } from '@/components/editor/ContextMenu'
import { BatchEditToolbar } from '@/components/editor/BatchEditToolbar'
import { useContextMenu } from '@/hooks/useContextMenu'
import { useBatchSelection } from '@/hooks/useBatchSelection'
import { LoadingOverlay } from '@/components/feedback/LoadingOverlay'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'

// 懒加载非关键组件 - 优化初始加载性能 (Requirements: 1.5)
const ResumeEditor = dynamic(() => import('@/components/ResumeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
})

// 懒加载 AI 助手组件
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), {
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

// 懒加载 JD 匹配弹窗组件
const JDMatcherModal = dynamic(
  () => import('@/components/ai/JDMatcherModal'),
  {
    loading: () => <AIAssistantSkeleton />,
    ssr: false
  }
)

// 懒加载 AI 分步生成弹窗组件
const StepwiseGeneratorModal = dynamic(
  () => import('@/components/ai/StepwiseGeneratorModal'),
  {
    loading: () => <AIAssistantSkeleton />,
    ssr: false
  }
)

/**
 * 简历编辑器页面 - 简洁版
 * 采用与首页一致的简约设计风格
 */
export default function EditorPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiAssistantType, setAiAssistantType] = useState<'summary' | 'experience' | 'skills' | 'education' | 'projects'>('summary')
  const [aiAssistantContent, setAiAssistantContent] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
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
  const [activeSection, setActiveSection] = useState('personal')
  const [exportOptions, setExportOptions] = useState<{ margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }>({ margin: 10, showPageBreaks: true, paper: 'a4' })
  
  // 新增状态
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // JD 匹配状态
  const [showJDMatcher, setShowJDMatcher] = useState(false)
  
  // AI 分步生成状态
  const [showStepwiseGenerator, setShowStepwiseGenerator] = useState(false)
  
  // 分页预览状态
  const [showPageBreaks, setShowPageBreaks] = useState(false)
  const [customBreakPositions, setCustomBreakPositions] = useState<number[]>([])
  
  // 导出进度 Hook
  const {
    progress: exportProgress,
    estimatedTimeRemaining,
    exportStatus,
    isExporting: isExportInProgress,
    canCancel,
    startExport,
    updateProgress,
    setStep,
    completeExport,
    setError: setExportError,
    cancelExport,
    reset: resetExportProgress
  } = useExportProgress()
  
  const { t } = useLanguage()

  const { success: showSuccess, error: showError, info: showInfo, removeToast } = useToastContext()
  
  // 简历数据状态
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '张三',
      title: '资深前端工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市朝阳区',
      website: 'https://github.com/zhangsan',
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

  // 实时预览状态
  const { 
    previewData,
    isUpdating, 
    getUpdateStatus, 
    performanceMetrics, 
    forceUpdate 
  } = useRealtimePreview(resumeData)

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
    onSaveSuccess: () => {
      console.log(t.editor.messages.autoSaveSuccess)
    },
    onSaveError: (error) => {
      console.error('自动保存失败:', error)
    }
  })

  // 数据导入导出对话框状态
  const [showImportExportDialog, setShowImportExportDialog] = useState(false)
  
  // 存储监控 Hook
  const {
    usage: storageUsage,
    refresh: refreshStorageUsage,
    cleanupOldData: cleanupStorage
  } = useStorageMonitor()
  
  // 上下文菜单 Hook
  const {
    isOpen: isContextMenuOpen,
    position: contextMenuPosition,
    openMenu: openContextMenu,
    closeMenu: closeContextMenu,
    menuItems: contextMenuItems
  } = useContextMenu()
  
  // 批量选择 Hook (用于工作经历)
  const {
    selectedIds: selectedExperienceIds,
    hasSelection: hasExperienceSelection,
    selectionCount: experienceSelectionCount,
    toggleSelection: toggleExperienceSelection,
    selectAll: selectAllExperiences,
    clearSelection: clearExperienceSelection,
    isSelected: isExperienceSelected,
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
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState('')
  
  // 保存历史记录
  const [saveHistory, setSaveHistory] = useState<SaveHistoryItem[]>([])
  
  // 计算保存状态
  const saveStatus: SaveStatus = useMemo(() => {
    if (isSaving) return 'saving'
    if (hasUnsavedChanges) return 'unsaved'
    return 'saved'
  }, [isSaving, hasUnsavedChanges])
  
  // 处理数据导入
  const handleDataImport = useCallback((data: ImportedData, mode: 'replace' | 'merge') => {
    if (data.resumeData) {
      if (mode === 'replace') {
        setResumeData(data.resumeData as unknown as ResumeData)
      } else {
        // 合并模式：简单覆盖
        setResumeData(data.resumeData as unknown as ResumeData)
      }
    }
    showSuccess(t.editor.messages.exportSuccess || '数据导入成功')
    refreshStorageUsage()
  }, [showSuccess, t, refreshStorageUsage])
  
  // 处理存储清理
  const handleStorageCleanup = useCallback(async (options: CleanupOptions): Promise<number> => {
    const freedBytes = await cleanupStorage(options)
    refreshStorageUsage()
    return freedBytes
  }, [cleanupStorage, refreshStorageUsage])
  
  // 上下文菜单项生成器
  const createExperienceContextMenuItems = useCallback((experienceId: string): ContextMenuItem[] => {
    const isZh = t.common.edit === '编辑'
    return [
      {
        id: 'edit',
        label: t.common.edit,
        onClick: () => {
          setActiveSection('experience')
        }
      },
      {
        id: 'duplicate',
        label: isZh ? '复制' : 'Duplicate',
        onClick: () => {
          const exp = resumeData.experience.find(e => e.id === experienceId)
          if (exp) {
            const newExp = { ...exp, id: `exp-${Date.now()}` }
            setResumeData(prev => ({
              ...prev,
              experience: [...prev.experience, newExp]
            }))
            showSuccess(isZh ? '复制成功' : 'Duplicated successfully')
          }
        },
        divider: true
      },
      {
        id: 'delete',
        label: t.common.delete,
        danger: true,
        onClick: () => {
          setConfirmDialog({
            isOpen: true,
            title: isZh ? '确认删除' : 'Confirm Delete',
            message: isZh ? '确定要删除这条工作经历吗？此操作无法撤销。' : 'Are you sure you want to delete this experience? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
              setResumeData(prev => ({
                ...prev,
                experience: prev.experience.filter(e => e.id !== experienceId)
              }))
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
              showSuccess(isZh ? '删除成功' : 'Deleted successfully')
            }
          })
        }
      }
    ]
  }, [resumeData, setResumeData, showSuccess, t])
  
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
  
  // 更新保存历史
  useEffect(() => {
    if (lastSavedAt) {
      setSaveHistory(prev => {
        const newHistory: SaveHistoryItem[] = [
          { timestamp: lastSavedAt, success: true },
          ...prev.slice(0, 4) // 保留最近5条
        ]
        return newHistory
      })
    }
  }, [lastSavedAt])

  /**
   * 手动保存 - 使用 useCallback 优化
   */
  const handleSave = useCallback(async () => {
    await saveNow()
  }, [saveNow])
  
  /**
   * 导出 JSON 格式 - 使用 useCallback 优化
   */
  const handleExportJSON = useCallback(() => {
    try {
      const dataStr = JSON.stringify(resumeData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      showSuccess(t.editor.messages.jsonExportSuccess)
    } catch (error) {
      console.error('导出JSON失败:', error)
      showError(t.editor.messages.exportError)
    }
  }, [resumeData, showSuccess, showError])
  
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
          console.log('本地存储数据不完整，使用默认数据')
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
  }, [])

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
    console.log('编辑器页面接收到数据更新:', newData)
    setResumeData(newData)
  }, [])

  

  /**
   * 导出功能 - 简化版本，直接使用 html2canvas
   * 不使用复杂的 exportStyleCapture 服务
   */
  const handleExport = useCallback(async (format: 'pdf' | 'png' | 'jpg') => {
    try {
      setIsExporting(true)
      startExport(1)
      
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      const element = document.getElementById('resume-preview')
      if (!element) {
        showError('请等待简历预览加载完成后再导出')
        setIsExporting(false)
        setExportError('预览元素未找到')
        return
      }

      console.log('✅ 找到元素:', element)
      console.log('📏 元素尺寸:', element.getBoundingClientRect())

      setStep('preparing-styles')
      updateProgress(10)

      setStep('loading-fonts')
      updateProgress(20)

      await document.fonts.ready.catch(() => {
        console.warn('⚠️ 字体加载超时')
      })
        updateProgress(30)

      // 保存原始样式
      const originalTransform = element.style.transform
      const originalScale = element.style.scale
      
      // 查找并保存所有父元素的 transform
      const parentElements: HTMLElement[] = []
      const parentTransforms: string[] = []
      let parent = element.parentElement
      while (parent) {
        parentElements.push(parent)
        parentTransforms.push(parent.style.transform || '')
        parent = parent.parentElement
      }
      
      try {
        // 临时移除所有变换
        element.style.transform = 'none'
        element.style.scale = '1'
        parentElements.forEach(p => {
          p.style.transform = 'none'
        })
        
        element.classList.add('exporting')
        element.offsetHeight
        await new Promise(resolve => requestAnimationFrame(resolve))
        
        const rect = element.getBoundingClientRect()
        const width = 612
        const height = element.scrollHeight || rect.height || 792
        
        console.log('📐 使用尺寸:', { width, height })

        const html2canvas = (await import('html2canvas')).default
        
        console.log('🎨 开始生成canvas...')
        
        setStep('rendering-page')
        updateProgress(40)
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: width,
          height: height,
          logging: true,
          imageTimeout: 15000,
          onclone: (clonedDoc, clonedElement) => {
            console.log('🔄 处理克隆元素...')
            clonedElement.style.width = `${width}px`
            clonedElement.style.minHeight = `${height}px`
            clonedElement.style.transform = 'none'
            clonedElement.style.margin = '0'
            
            const buttonsToRemove = clonedElement.querySelectorAll('button, .no-export, [data-no-export]')
            buttonsToRemove.forEach(btn => btn.remove())
            console.log('🗑️ 移除了', buttonsToRemove.length, '个按钮')
            
            const pageBreakLines = clonedElement.querySelectorAll('[style*="dashed"]')
            pageBreakLines.forEach(line => line.remove())
            
            console.log('✅ 克隆元素处理完成')
          }
        })
        
        console.log('✅ Canvas生成完成:', { width: canvas.width, height: canvas.height })
        
        updateProgress(70)
        
        // 恢复原始样式
        element.style.transform = originalTransform
        element.style.scale = originalScale
        element.classList.remove('exporting')
        parentElements.forEach((p, i) => {
          p.style.transform = parentTransforms[i]
        })

        setStep('generating-file')
        updateProgress(80)

        if (format === 'pdf') {
          const { jsPDF } = await import('jspdf')
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
          const pdfWidth = 210
          const pdfHeight = 297
          const margin = 10
          const contentWidth = pdfWidth - margin * 2
          const contentHeight = pdfHeight - margin * 2
          const pxToMmScale = contentWidth / canvas.width
          const pageHeightPx = Math.floor(contentHeight / pxToMmScale)

          let offsetY = 0
          let pageIndex = 0
          while (offsetY < canvas.height) {
            if (pageIndex > 0) pdf.addPage()
            const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY)
            const pageCanvas = document.createElement('canvas')
            pageCanvas.width = canvas.width
            pageCanvas.height = sliceHeight
            const ctx = pageCanvas.getContext('2d')
            if (ctx) {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
              ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, pageCanvas.width, pageCanvas.height)
              const pageImg = pageCanvas.toDataURL('image/png')
              const imgH = contentWidth * (sliceHeight / canvas.width)
              pdf.addImage(pageImg, 'PNG', margin, margin, contentWidth, imgH)
            }
            offsetY += sliceHeight
            pageIndex++
            updateProgress(80 + (pageIndex / Math.ceil(canvas.height / pageHeightPx)) * 15)
          }

          const fileName = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.pdf`
          pdf.save(fileName)
        } else if (format === 'png') {
            const link = document.createElement('a')
            link.download = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
        } else if (format === 'jpg') {
            const link = document.createElement('a')
            link.download = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.jpg`
            link.href = canvas.toDataURL('image/jpeg', 0.9)
            link.click()
        }

        completeExport()
        showSuccess(t.editor.messages.exportSuccess)
        
        setTimeout(() => {
          resetExportProgress()
        }, 3000)
      } catch (error) {
        setExportError(error instanceof Error ? error.message : '导出失败')
        throw error
      } finally {
        element.style.transform = originalTransform
        element.style.scale = originalScale
        element.classList.remove('exporting')
        parentElements.forEach((p, i) => {
          p.style.transform = parentTransforms[i]
        })
        setIsExporting(false)
      }
    } catch (error) {
      console.error(`${format.toUpperCase()}导出失败:`, error)
      showError(t.editor.messages.exportError)
      setIsExporting(false)
    }
  }, [resumeData.personalInfo.name, showSuccess, showError, showInfo, startExport, updateProgress, setStep, completeExport, setExportError, resetExportProgress, t])

  

  /**
   * 打开AI助手 - 使用 useCallback 优化
   * @param type - AI助手类型
   * @param content - 当前内容
   */
  const handleOpenAIAssistant = useCallback((type: 'summary' | 'experience' | 'skills' | 'education' | 'projects', content: string) => {
    setAiAssistantType(type)
    setAiAssistantContent(content)
    setShowAIAssistant(true)
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
    console.log('=== 编辑器页面处理模板选择 ===')
    console.log('选择的模板:', template)
    console.log('模板ID:', template.id)
    console.log('模板名称:', template.name)
    
    // 检查简历数据完整性，如果数据为空或不完整，使用默认数据
    setResumeData(prevData => {
      // 确保至少有基本的个人信息结构
      if (!prevData.personalInfo || !prevData.personalInfo.name) {
        console.log('⚠️ 检测到简历数据不完整，使用默认数据')
        return {
          personalInfo: {
            name: '请填写姓名',
            title: '请填写职位',
            email: '',
            phone: '',
            location: '',
            website: '',
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
    console.log('✅ 模板状态已更新')
    
    setShowTemplateSelector(false)
    console.log('✅ 模板选择器已关闭')
    
    // 不显示切换提示
    console.log('=== 模板选择处理完成 ===')
  }, [showSuccess])

  /**
   * 应用单个 JD 建议
   * @param suggestion - JD 优化建议
   */
  const handleApplyJDSuggestion = useCallback((suggestion: JDSuggestion) => {
    const updatedData = { ...resumeData }
    
    switch (suggestion.section) {
      case 'skills':
        // 添加建议的技能
        const newSkills = suggestion.keywords.map((keyword, index) => ({
          id: `skill-jd-${Date.now()}-${index}`,
          name: keyword,
          level: 70,
          category: '技术技能'
        }))
        // 过滤掉已存在的技能
        const existingSkillNames = updatedData.skills.map(s => s.name.toLowerCase())
        const uniqueNewSkills = newSkills.filter(
          s => !existingSkillNames.includes(s.name.toLowerCase())
        )
        updatedData.skills = [...updatedData.skills, ...uniqueNewSkills]
        showSuccess(t.editor.messages.skillsUpdated)
        break
        
      case 'summary':
        // 在个人简介中添加关键词提示
        const currentSummary = updatedData.personalInfo.summary || ''
        if (suggestion.keywords.length > 0) {
          const keywordHint = `具备 ${suggestion.keywords.join('、')} 相关经验。`
          if (!currentSummary.includes(keywordHint)) {
            updatedData.personalInfo.summary = currentSummary + ' ' + keywordHint
          }
        }
        showSuccess(t.editor.messages.summaryUpdated)
        break
        
      case 'experience':
        // 在最近的工作经历中添加关键词
        if (updatedData.experience.length > 0) {
          const lastExp = updatedData.experience[0]
          const keywordDesc = `展现了 ${suggestion.keywords.join('、')} 等能力。`
          if (Array.isArray(lastExp.description)) {
            if (!lastExp.description.some(d => d.includes(keywordDesc))) {
              lastExp.description = [...lastExp.description, keywordDesc]
            }
          }
        }
        showSuccess(t.editor.messages.experienceUpdated)
        break
        
      case 'projects':
        // 在最近的项目中添加技术栈
        if (updatedData.projects.length > 0) {
          const lastProject = updatedData.projects[0]
          const existingTech = lastProject.technologies.map(t => t.toLowerCase())
          const newTech = suggestion.keywords.filter(
            k => !existingTech.includes(k.toLowerCase())
          )
          lastProject.technologies = [...lastProject.technologies, ...newTech]
        }
        showSuccess(t.editor.messages.projectsUpdated)
        break
    }
    
    setResumeData(updatedData)
  }, [resumeData, showSuccess, t])

  /**
   * 应用所有 JD 建议
   * @param suggestions - JD 优化建议数组
   */
  const handleApplyAllJDSuggestions = useCallback((suggestions: JDSuggestion[]) => {
    suggestions.forEach(suggestion => {
      handleApplyJDSuggestion(suggestion)
    })
  }, [handleApplyJDSuggestion])

  // 键盘快捷键配置 - 使用 useMemo 优化
  const shortcuts = useMemo(() => createEditorShortcuts({
    onSave: saveNow,
    onExport: () => setShowExportDialog(true),
    onTogglePreview: () => setIsPreviewMode(prev => !prev),
    onToggleFullscreen: () => setIsFullscreen(prev => !prev),
    onOpenAI: () => setShowAIAssistant(true),
  }), [saveNow])

  // 添加滑动手势支持
  const { isSwiping, ...swipeHandlers } = useHorizontalSwipe(
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

  return (
      <StyleProvider>
          <TemplateStyleSync currentTemplate={currentTemplate} />
          <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900 flex flex-col overflow-hidden">
            {!isFullscreen && <Header />}

          {/* 主要内容区域 - 固定高度，禁止页面滚动 */}
          <main className="flex-1 flex flex-col py-4 lg:py-6 overflow-hidden min-h-0">
            {/* 顶部工具栏 */}
            <EditorToolbar
              resumeData={resumeData}
              onUpdate={setResumeData}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSavedAt={lastSavedAt}
              isPreviewMode={isPreviewMode}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onShowAIAssistant={() => handleOpenAIAssistant('summary', '')}
              onShowShortcutHelp={() => setShowShortcutHelp(true)}
              onShowTemplateSelector={() => setShowTemplateSelector(true)}
              onShowExportDialog={() => setShowExportDialog(true)}
              onExport={handleExport}
              onSave={handleSave}
              onShowJDMatcher={() => setShowJDMatcher(true)}
              onShowStepwiseGenerator={() => setShowStepwiseGenerator(true)}
            />

            {/* 编辑器和预览区域 - 使用三栏布局 */}
            <div 
              className="flex-1 flex flex-col mx-4 sm:mx-6 lg:mx-8 overflow-hidden min-h-0"
              {...swipeHandlers}
            >
              {/* 移动端切换按钮 */}
              <div className="xl:hidden flex-shrink-0 flex items-center justify-center gap-2 px-2 sm:px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 py-2 border-b border-gray-200">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`flex-1 max-w-28 sm:max-w-32 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    !isPreviewMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' 
                      : 'bg-white/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200/60 active:scale-95 backdrop-blur-sm'
                  }`}
                >
                  {t.common.edit}
                </button>
                <button
                  onClick={() => setIsPreviewMode(true)}
                  className={`flex-1 max-w-28 sm:max-w-32 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    isPreviewMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' 
                      : 'bg-white/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200/60 active:scale-95 backdrop-blur-sm'
                  }`}
                >
                  {t.common.preview}
                </button>
              </div>

              {/* 三栏布局 - 桌面端 (>=1280px) */}
              <div className="hidden xl:flex flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <ThreeColumnLayout
                  className="h-full w-full"
                  leftPanel={
                    <SectionNavigation
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                      onShowTemplateSelector={() => setShowTemplateSelector(true)}
                    />
                  }
                  centerPanel={
                    <ResumeEditor
                      resumeData={resumeData}
                      onUpdateResumeData={handleResumeUpdate}
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                      onShowTemplateSelector={() => setShowTemplateSelector(true)}
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
                <div className={`${isPreviewMode ? 'hidden lg:flex' : 'flex'} flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex-col`}>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ResumeEditor
                      resumeData={resumeData}
                      onUpdateResumeData={handleResumeUpdate}
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                      onShowTemplateSelector={() => setShowTemplateSelector(true)}
                    />
                  </div>
                </div>

                {/* 右侧预览 */}
                <div className={`${isPreviewMode ? 'flex' : 'hidden lg:flex'} flex-1 min-h-0 lg:w-1/2 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex-col`}>
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
                      />
                    </div>
                  </PreviewPanel>
                </div>
              </div>
            </div>

          </main>

        {/* AI助手弹窗 */}
        {showAIAssistant && (
          <AIAssistant
            type={aiAssistantType}
            currentContent={aiAssistantContent}
            onClose={() => setShowAIAssistant(false)}
            onApply={(suggestion) => {
              // 根据AI助手类型更新对应的简历数据
              const updatedData = { ...resumeData }
              
              switch (aiAssistantType) {
                case 'summary':
                  updatedData.personalInfo.summary = suggestion
                  break
                case 'experience':
                  // 如果有选中的工作经历，更新其描述
                  if (updatedData.experience.length > 0) {
                    const lastExperience = updatedData.experience[updatedData.experience.length - 1]
                    // 将建议内容按行分割为数组
                    lastExperience.description = suggestion.split('\n').filter(line => line.trim())
                  }
                  break
                case 'skills':
                  // 智能解析技能建议并添加到技能列表
                  const skillLines = suggestion.split('\n').filter(line => line.trim())
                  const newSkills = skillLines.map((line, index) => {
                    // 尝试解析技能名称和等级
                    let skillName = line.trim()
                    let skillLevel = 70 // 默认中等水平 (70%)
                    let skillCategory = '技术技能'
                    
                    // 移除可能的序号或符号
                    skillName = skillName.replace(/^[\d\-\*\•\.\s]+/, '').trim()
                    
                    // 根据关键词判断技能类别
                    if (skillName.match(/(沟通|协调|领导|管理|团队|演讲|谈判)/)) {
                      skillCategory = '软技能'
                    } else if (skillName.match(/(语言|英语|日语|韩语|法语|德语)/)) {
                      skillCategory = '语言技能'
                    } else if (skillName.match(/(设计|UI|UX|Photoshop|Figma|Sketch)/)) {
                      skillCategory = '设计技能'
                    }
                    
                    // 根据描述词判断技能等级 (转换为数字百分比)
                    if (skillName.match(/(精通|专家|资深|高级)/)) {
                      skillLevel = 90 // 专家级别 (90%)
                      skillName = skillName.replace(/(精通|专家|资深|高级)/, '').trim()
                    } else if (skillName.match(/(熟练|良好)/)) {
                      skillLevel = 80 // 高级水平 (80%)
                      skillName = skillName.replace(/(熟练|良好)/, '').trim()
                    } else if (skillName.match(/(了解|基础|初级)/)) {
                      skillLevel = 50 // 初级水平 (50%)
                      skillName = skillName.replace(/(了解|基础|初级)/, '').trim()
                    }
                    
                    return {
                      id: `skill-${Date.now()}-${index}`,
                      name: skillName,
                      level: skillLevel,
                      category: skillCategory
                    }
                  }).filter(skill => skill.name.length > 0) // 过滤掉空技能名
                  
                  updatedData.skills = [...updatedData.skills, ...newSkills]
                  break
                case 'education':
                  // 如果有教育经历，更新最后一个教育经历的描述
                  if (updatedData.education.length > 0) {
                    const lastEducation = updatedData.education[updatedData.education.length - 1]
                    lastEducation.description = suggestion.trim()
                  } else {
                    // 如果没有教育经历，创建一个新的教育经历条目
                    const newEducation = {
                      id: `education-${Date.now()}`,
                      school: '请填写学校名称',
                      degree: '请填写学位',
                      major: '请填写专业',
                      startDate: '',
                      endDate: '',
                      description: suggestion.trim()
                    }
                    updatedData.education.push(newEducation)
                  }
                  break
                case 'projects':
                  // 智能处理项目经验AI建议
                  if (updatedData.projects.length > 0) {
                    const lastProject = updatedData.projects[updatedData.projects.length - 1]
                    
                    // 尝试解析项目描述和亮点
                    const lines = suggestion.split('\n').filter(line => line.trim())
                    const description = lines[0]?.trim() || suggestion.trim()
                    
                    // 提取项目亮点（通常以特定标识符开头）
                    const highlights = lines.slice(1)
                      .filter(line => line.match(/^[\-\*\•\d\.]/))
                      .map(line => line.replace(/^[\-\*\•\d\.\s]+/, '').trim())
                      .filter(highlight => highlight.length > 0)
                    
                    lastProject.description = description
                    if (highlights.length > 0) {
                      lastProject.highlights = [...(lastProject.highlights || []), ...highlights]
                    }
                  } else {
                    // 如果没有项目经验，创建一个新的项目条目
                    const lines = suggestion.split('\n').filter(line => line.trim())
                    const description = lines[0]?.trim() || suggestion.trim()
                    
                    const highlights = lines.slice(1)
                      .filter(line => line.match(/^[\-\*\•\d\.]/))
                      .map(line => line.replace(/^[\-\*\•\d\.\s]+/, '').trim())
                      .filter(highlight => highlight.length > 0)
                    
                    const newProject = {
                      id: `project-${Date.now()}`,
                      name: '请填写项目名称',
                      description: description,
                      technologies: [],
                      startDate: '',
                      endDate: '',
                      highlights: highlights.length > 0 ? highlights : ['请填写项目亮点']
                    }
                    updatedData.projects.push(newProject)
                  }
                  break
              }
              
              setResumeData(updatedData)
              setShowAIAssistant(false)
            }}
          />
        )}

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
                  {getShortcutHelp().map((item: any, index: number) => (
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

        {/* JD 匹配弹窗 - 仅在打开时渲染 */}
        {showJDMatcher && (
          <JDMatcherModal
            isOpen={showJDMatcher}
            onClose={() => setShowJDMatcher(false)}
            resumeData={resumeData}
            onApplySuggestion={handleApplyJDSuggestion}
            onApplyAllSuggestions={handleApplyAllJDSuggestions}
          />
        )}

        {/* AI 分步生成弹窗 - 仅在打开时渲染 */}
        {showStepwiseGenerator && (
          <StepwiseGeneratorModal
            isOpen={showStepwiseGenerator}
            onClose={() => setShowStepwiseGenerator(false)}
            onComplete={(data) => {
              // 合并生成的数据到简历
              setResumeData(prev => ({
                ...prev,
                ...data,
                personalInfo: data.personalInfo ? { ...prev.personalInfo, ...data.personalInfo } : prev.personalInfo
              }))
              showSuccess('AI 生成内容已应用到简历')
            }}
            initialUserInfo={{
              name: resumeData.personalInfo.name,
              targetPosition: resumeData.personalInfo.title,
              industry: '',
              experienceLevel: 'mid'
            }}
          />
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
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
        
        {/* 导出预览对话框 - 仅在打开时渲染 */}
        {showExportDialog && (
          <ExportPreviewDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            onExport={(format) => {
              if (format === 'json') {
                handleExportJSON()
              } else {
                handleExport(format)
              }
            }}
            resumeName={resumeData.personalInfo.name}
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
          <ImportExportDialog
            isOpen={showImportExportDialog}
            onClose={() => setShowImportExportDialog(false)}
            resumeData={{
              personalInfo: resumeData.personalInfo,
              experience: resumeData.experience.map(exp => ({
                company: exp.company,
                position: exp.position,
                startDate: exp.startDate,
                endDate: exp.endDate,
                description: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description
              })),
              education: resumeData.education.map(edu => ({
                school: edu.school,
                degree: edu.degree,
                major: edu.major,
                startDate: edu.startDate,
                endDate: edu.endDate
              })),
              skills: resumeData.skills.map(skill => ({
                name: skill.name,
                level: skill.level
              })),
              projects: resumeData.projects.map(proj => ({
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies?.join(', '),
                link: proj.url
              }))
            }}
            styleConfig={{
              colors: {
                primary: '#2563eb',
                secondary: '#4b5563',
                accent: '#3b82f6'
              },
              fontFamily: 'Inter',
              fontSize: {
                content: 14,
                title: 18,
                name: 28
              },
              spacing: {
                section: 24,
                item: 16,
                line: 22
              }
            }}
            onImport={handleDataImport}
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
