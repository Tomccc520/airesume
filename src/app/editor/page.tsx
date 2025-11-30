/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ResumePreview from '@/components/ResumePreview'
import AIAssistant from '@/components/AIAssistant'
import TemplateSelector from '@/components/TemplateSelector'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EditorToolbar from '@/components/EditorToolbar'
import ExportPreviewDialog from '@/components/ExportPreviewDialog'
import PreviewControls from '@/components/PreviewControls'
import { QuickLayoutControls } from '@/components/QuickLayoutControls'
import { StyleProvider } from '@/contexts/StyleContext'
import { useToastContext } from '@/components/Toast'
import { useRealtimePreview } from '@/hooks/useRealtimePreview'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useKeyboardShortcuts, createEditorShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHorizontalSwipe } from '@/hooks/useSwipeGesture'
import { ResumeData } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { getDefaultTemplate } from '@/data/templates'
import { X, Palette } from 'lucide-react'
import AIResumeGenerator from '@/services/aiResumeGenerator'
import LoadingModal from '@/components/LoadingModal'
import { EditorSkeleton } from '@/components/LoadingStates'
import { StyleSettingsPanel } from '@/components/editor/StyleSettingsPanel'
import { useLanguage } from '@/contexts/LanguageContext'

// 动态导入 ResumeEditor 组件以优化初始加载性能
const ResumeEditor = dynamic(() => import('@/components/ResumeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
})

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
  const [currentTemplate, setCurrentTemplate] = useState<TemplateStyle>(getDefaultTemplate())
  const [activeSection, setActiveSection] = useState('personal')
  const [exportOptions, setExportOptions] = useState<{ margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }>({ margin: 10, showPageBreaks: true, paper: 'a4' })
  
  // 新增状态
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showStyleSettings, setShowStyleSettings] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [showPageBreaks, setShowPageBreaks] = useState(true)
  
  const { t } = useLanguage()

  // AI生成加载状态
  const [aiGenerationState, setAiGenerationState] = useState<{
    isLoading: boolean
    type: 'loading' | 'success' | 'error'
    message: string
    progress: number
  }>({
    isLoading: false,
    type: 'loading',
    message: '',
    progress: 0
  })

  const { success: showSuccess, error: showError, info: showInfo, removeToast } = useToastContext()
  
  // 简历数据状态
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '张三',
      title: '前端开发工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市朝阳区',
      website: 'https://github.com/zhangsan',
      summary: '具有3年前端开发经验，熟练掌握React、Vue等主流框架，有丰富的项目开发经验。'
    },
    experience: [
      {
        id: '1',
        company: '科技有限公司',
        position: '前端开发工程师',
        startDate: '2022-01',
        endDate: '2024-12',
        current: true,
        description: ['负责公司主要产品的前端开发工作，参与需求分析、技术选型、代码实现等全流程开发', '使用React、TypeScript等技术栈，提升了产品性能和用户体验', '与后端团队协作，完成API接口对接和数据交互']
      }
    ],
    education: [
      {
        id: '1',
        school: '北京大学',
        degree: '本科',
        major: '计算机科学与技术',
        startDate: '2018-09',
        endDate: '2022-06',
        gpa: '3.8'
      }
    ],
    skills: [
      {
        id: '1',
        name: 'JavaScript',
        level: 90,
        category: '编程语言'
      },
      {
        id: '2',
        name: 'React',
        level: 85,
        category: '前端框架'
      },
      {
        id: '3',
        name: 'TypeScript',
        level: 80,
        category: '编程语言'
      }
    ],
    projects: [
      {
        id: '1',
        name: '企业管理系统',
        description: '基于React和Node.js开发的企业内部管理系统，包含用户管理、权限控制、数据统计等功能。',
        technologies: ['React', 'Node.js', 'MongoDB'],
        startDate: '2023-03',
        endDate: '2023-08',
        url: 'https://github.com/zhangsan/enterprise-system',
        highlights: ['实现了完整的用户权限管理系统', '优化了数据查询性能，提升50%响应速度', '集成了实时数据统计和可视化图表']
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
    interval: 3000, // 3秒自动保存
    enabled: true,
    onSaveSuccess: () => {
      console.log('自动保存成功')
    },
    onSaveError: (error) => {
      console.error('自动保存失败:', error)
    }
  })

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
      showSuccess('JSON导出成功')
    } catch (error) {
      console.error('导出JSON失败:', error)
      showError('导出失败，请重试')
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
        setResumeData(parsedData)
      }
    } catch (error) {
      console.error('加载数据失败，尝试从备份恢复:', error)
      try {
        document.body.classList.add('export-mode')
        const backupData = localStorage.getItem('resumeData_backup')
        if (backupData) {
          const parsedData = JSON.parse(backupData)
          setResumeData(parsedData)
          showInfo('已从备份恢复数据', '由于加载失败，系统自动恢复了最近的备份')
        }
      } catch (backupError) {
        console.error('备份恢复也失败:', backupError)
      }
    }
  }, [])

  /**
   * 更新简历数据 - 使用 useCallback 优化
   * @param newData - 新的简历数据
   */
  const handleResumeUpdate = useCallback((newData: ResumeData) => {
    console.log('编辑器页面接收到数据更新:', newData)
    setResumeData(newData)
  }, [])

  

  /**
   * 导出功能 - 支持多种格式，优化PDF质量和文件大小 - 使用 useCallback 优化
   */
  const handleExport = useCallback(async (format: 'pdf' | 'png' | 'jpg' | 'docx') => {
    try {
      setIsExporting(true) // 设置导出模式
      
      const element = document.getElementById('resume-preview')
      if (!element) {
        showError('请等待简历预览加载完成后再导出')
        return
      }

      // 显示导出进度提示
      const loadingToastId = showInfo('正在生成导出文件...', '请稍候', { duration: 0 })

      try {
        if (format === 'docx') {
          // 临时禁用 DOCX 导出，转为 PDF
          showInfo('Word 导出功能升级中', '将为您导出 PDF 格式作为替代')
          format = 'pdf'
        }

        // 动态导入html2canvas
        const html2canvas = (await import('html2canvas')).default
        
        // 克隆元素以确保导出样式的一致性（不受当前屏幕尺寸影响）
        const clone = element.cloneNode(true) as HTMLElement
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.top = '-9999px'
        container.style.left = '0'
        container.style.width = '794px' // A4 宽度 (96 DPI)
        container.appendChild(clone)
        document.body.appendChild(container)
        
        // 强制克隆元素样式
        clone.style.width = '100%'
        clone.style.height = 'auto'
        clone.style.transform = 'none'
        clone.style.margin = '0'
        clone.classList.add('export-mode')
        
        // 等待布局重绘
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 优化canvas生成参数，减小文件大小
        const canvas = await html2canvas(clone, {
          scale: 2, // 统一使用 2 倍缩放以保证清晰度
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          windowWidth: 794,
          height: clone.scrollHeight
        })
        
        // 清理 DOM
        document.body.removeChild(container)

        if (format === 'pdf') {
          const { jsPDF } = await import('jspdf')
          const pdfFormat = exportOptions.paper === 'letter' ? 'letter' : 'a4'
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: pdfFormat })
          const pdfWidth = pdfFormat === 'letter' ? 216 : 210
          const pdfHeight = pdfFormat === 'letter' ? 279 : 297
          const margin = exportOptions.margin ?? 10
          const contentWidth = pdfWidth - margin * 2
          const contentHeight = pdfHeight - margin * 2

          // Calculate scale factor to fit canvas width to PDF content width
          // canvas.width (px) maps to contentWidth (mm)
          const pxToMmScale = contentWidth / canvas.width
          
          // Calculate page height in pixels based on the aspect ratio
          // pageHeightPx corresponds to the height of the content area on one PDF page
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
          }

          const fileName = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.pdf`
          pdf.save(fileName)
        } else if (format === 'png') {
          // PNG导出 - 支持多页导出
          const maxPageHeight = 3508 // A4纸张像素高度 (297mm * 300dpi / 25.4)
          const pageWidth = canvas.width
          
          if (canvas.height <= maxPageHeight) {
            // 单页PNG导出
            const link = document.createElement('a')
            link.download = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
          } else {
            // 多页PNG导出
            let remainingHeight = canvas.height
            let sourceY = 0
            let pageCount = 1
            
            while (remainingHeight > 0) {
              const currentPageHeight = Math.min(remainingHeight, maxPageHeight)
              
              // 创建当前页面的canvas
              const pageCanvas = document.createElement('canvas')
              const pageCtx = pageCanvas.getContext('2d')
              pageCanvas.width = pageWidth
              pageCanvas.height = currentPageHeight
              
              if (pageCtx) {
                // 设置白色背景
                pageCtx.fillStyle = '#ffffff'
                pageCtx.fillRect(0, 0, pageWidth, currentPageHeight)
                
                // 绘制当前页面内容
                pageCtx.drawImage(canvas, 0, sourceY, pageWidth, currentPageHeight, 0, 0, pageWidth, currentPageHeight)
                
                // 下载当前页面
                const link = document.createElement('a')
                link.download = `${resumeData.personalInfo.name || '简历'}_第${pageCount}页_${new Date().toISOString().split('T')[0]}.png`
                link.href = pageCanvas.toDataURL('image/png')
                link.click()
                
                // 添加延迟避免浏览器阻止多个下载
                if (remainingHeight > currentPageHeight) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                }
              }
              
              sourceY += currentPageHeight
              remainingHeight -= currentPageHeight
              pageCount++
            }
          }
        } else if (format === 'jpg') {
          // JPG导出 - 支持多页导出
          const maxPageHeight = 3508 // A4纸张像素高度
          const pageWidth = canvas.width
          
          if (canvas.height <= maxPageHeight) {
            // 单页JPG导出
            const link = document.createElement('a')
            link.download = `${resumeData.personalInfo.name || '简历'}_${new Date().toISOString().split('T')[0]}.jpg`
            link.href = canvas.toDataURL('image/jpeg', 0.9)
            link.click()
          } else {
            // 多页JPG导出
            let remainingHeight = canvas.height
            let sourceY = 0
            let pageCount = 1
            
            while (remainingHeight > 0) {
              const currentPageHeight = Math.min(remainingHeight, maxPageHeight)
              
              // 创建当前页面的canvas
              const pageCanvas = document.createElement('canvas')
              const pageCtx = pageCanvas.getContext('2d')
              pageCanvas.width = pageWidth
              pageCanvas.height = currentPageHeight
              
              if (pageCtx) {
                // 设置白色背景
                pageCtx.fillStyle = '#ffffff'
                pageCtx.fillRect(0, 0, pageWidth, currentPageHeight)
                
                // 绘制当前页面内容
                pageCtx.drawImage(canvas, 0, sourceY, pageWidth, currentPageHeight, 0, 0, pageWidth, currentPageHeight)
                
                // 下载当前页面
                const link = document.createElement('a')
                link.download = `${resumeData.personalInfo.name || '简历'}_第${pageCount}页_${new Date().toISOString().split('T')[0]}.jpg`
                link.href = pageCanvas.toDataURL('image/jpeg', 0.9)
                link.click()
                
                // 添加延迟避免浏览器阻止多个下载
                if (remainingHeight > currentPageHeight) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                }
              }
              
              sourceY += currentPageHeight
              remainingHeight -= currentPageHeight
              pageCount++
            }
          }
        }

        // 移除 loading toast
        removeToast(loadingToastId)
        showSuccess('导出成功！')
      } catch (error) {
        removeToast(loadingToastId)
        throw error
      } finally {
        document.body.classList.remove('export-mode')
        setIsExporting(false) // 重置导出模式
      }
    } catch (error) {
      console.error(`${format.toUpperCase()}导出失败:`, error)
      showError(`${format.toUpperCase()}导出失败，请重试`)
      
      setIsExporting(false) // 重置导出模式
    }
  }, [resumeData.personalInfo.name, previewZoom, exportOptions, showSuccess, showError, showInfo, removeToast])

  

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
   */
  const handleTemplateSelect = useCallback((template: TemplateStyle) => {
    console.log('=== 编辑器页面处理模板选择 ===')
    console.log('选择的模板:', template)
    console.log('模板ID:', template.id)
    console.log('模板名称:', template.name)
    
    setCurrentTemplate(template)
    console.log('模板状态已更新')
    
    setShowTemplateSelector(false)
    console.log('模板选择器已关闭')
    console.log('=== 模板选择处理完成 ===')
  }, [])

  /**
   * AI一键生成简历
   * 使用AI生成完整的简历内容并自动填充到编辑器
   */
  const handleAIGenerateResume = async () => {
    try {
      // 检查AI服务是否已配置
      const savedConfig = localStorage.getItem('ai-config')
      if (!savedConfig) {
        setAiGenerationState({
          isLoading: true,
          type: 'error',
          message: '请先在工具栏中点击"AI配置"按钮配置AI服务，然后再使用AI生成功能',
          progress: 0
        })
        return
      }

      const config = JSON.parse(savedConfig)
      if (!config.apiKey || !config.provider || !config.modelName) {
        setAiGenerationState({
          isLoading: true,
          type: 'error',
          message: 'AI配置不完整，请重新配置AI服务',
          progress: 0
        })
        return
      }

      // 获取用户基本信息作为生成参数
      const userInfo = {
        name: resumeData.personalInfo.name || '求职者',
        targetPosition: resumeData.personalInfo.title || '软件工程师',
        industry: 'IT',
        experience: '3年'
      }

      // 显示加载状态
      setAiGenerationState({
        isLoading: true,
        type: 'loading',
        message: '正在分析您的信息并生成简历内容...',
        progress: 10
      })
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setAiGenerationState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 15, 90)
        }))
      }, 1000)
      
      // 调用AI生成器生成完整简历
      const generatedResume = await AIResumeGenerator.generateCompleteResume(userInfo)
      
      // 清除进度定时器
      clearInterval(progressInterval)
      
      // 合并生成的数据与现有数据
      const mergedData: ResumeData = {
        personalInfo: {
          ...resumeData.personalInfo,
          ...generatedResume.personalInfo,
          // 保留用户已填写的基本信息
          name: resumeData.personalInfo.name || generatedResume.personalInfo.name,
          title: resumeData.personalInfo.title || generatedResume.personalInfo.title,
          email: resumeData.personalInfo.email || generatedResume.personalInfo.email,
          phone: resumeData.personalInfo.phone || generatedResume.personalInfo.phone,
          location: resumeData.personalInfo.location || generatedResume.personalInfo.location
        },
        experience: generatedResume.experience,
        education: generatedResume.education,
        skills: generatedResume.skills,
        projects: generatedResume.projects
      }
      
      // 更新简历数据
      setResumeData(mergedData)
      
      // 显示成功状态
      setAiGenerationState({
        isLoading: true,
        type: 'success',
        message: 'AI简历生成完成！已自动填充到编辑器中',
        progress: 100
      })
      
    } catch (error) {
      console.error('AI生成简历失败:', error)
      setAiGenerationState({
        isLoading: true,
        type: 'error',
        message: 'AI生成简历失败，请检查网络连接或AI配置后重试',
        progress: 0
      })
    }
  }

  /**
   * 关闭AI生成模态框
   */
  const handleCloseAIModal = () => {
    setAiGenerationState({
      isLoading: false,
      type: 'loading',
      message: '',
      progress: 0
    })
  }

  

  // 键盘快捷键配置 - 使用 useMemo 优化
  const shortcuts = useMemo(() => createEditorShortcuts({
    onSave: saveNow,
    onExport: () => setShowExportDialog(true),
    onTogglePreview: () => setIsPreviewMode(prev => !prev),
    onToggleFullscreen: () => setIsFullscreen(prev => !prev),
    onOpenAI: () => setShowAIAssistant(true),
  }), [saveNow])

  // 添加滑动手势支持
  const swipeHandlers = useHorizontalSwipe(
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900 flex flex-col">
            {!isFullscreen && <Header />}

          {/* 主要内容区域 - 自适应布局，预留上下空间 */}
          <main className="flex-1 flex flex-col py-6 lg:py-8">
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
              onAIGenerateResume={handleAIGenerateResume}
            />

            {/* 编辑器和预览区域 - 支持滑动手势 */}
            <div 
              className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mx-4 sm:mx-6 lg:mx-8 items-start"
              {...swipeHandlers}
            >
              {/* 移动端切换按钮 */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4 px-4 sticky top-20 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 py-2 border-b border-gray-200 w-full">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`mobile-toggle-btn flex-1 max-w-32 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    !isPreviewMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' 
                      : 'bg-white/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200/60 active:scale-95 backdrop-blur-sm'
                  }`}
                >
                  {t.common.edit}
                </button>
                <button
                  onClick={() => setIsPreviewMode(true)}
                  className={`mobile-toggle-btn flex-1 max-w-32 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isPreviewMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' 
                      : 'bg-white/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200/60 active:scale-95 backdrop-blur-sm'
                  }`}
                >
                  {t.common.preview}
                </button>
              </div>

              {/* 左侧编辑器 - 固定定位 */}
              <div className={`${isPreviewMode ? 'hidden lg:flex' : 'flex'} flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] flex-col`}>
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

              {/* 右侧预览 - 跟随页面滚动 */}
                <div className={`${isPreviewMode ? 'flex' : 'hidden lg:flex'} flex-1 lg:w-1/2 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex-col`}>
                  <div className="h-full flex flex-col relative">
                    {/* 顶部统一工具栏 - 绝对定位在预览框内 */}
                    <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gray-50/95 backdrop-blur border-b border-gray-200">
                      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-gray-800">{t.common.preview}</h2>
                        <div className={`w-1.5 h-1.5 rounded-full ${isUpdating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} title={isUpdating ? '更新中...' : '就绪'}></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-1 flex items-center gap-2">
                           <PreviewControls
                              zoom={previewZoom}
                              onZoomChange={setPreviewZoom}
                              showGrid={showGrid}
                              onToggleGrid={() => setShowGrid(!showGrid)}
                              showPageBreaks={showPageBreaks}
                              onTogglePageBreaks={() => setShowPageBreaks(!showPageBreaks)}
                            />
                           <div className="w-px h-4 bg-gray-200 mx-1"></div>
                           <QuickLayoutControls />
                           <div className="w-px h-4 bg-gray-200 mx-1 xl:hidden"></div>
                           <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowStyleSettings(true)}
                              className={`p-1.5 rounded-md transition-all xl:hidden ${
                                showStyleSettings 
                                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' 
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                              }`}
                              title="样式设置"
                           >
                             <Palette className="w-4 h-4" />
                           </motion.button>
                        </div>
                      </div>
                    </div>
                  
                  {/* 预览内容区域 - 自然高度 */}
                  <div className="flex-1 flex flex-col relative bg-gray-100/50 min-h-[800px]">
                    <div className="flex-1 p-4 sm:p-8 flex justify-center">
                        <div className="w-full max-w-4xl transition-transform duration-200 ease-out origin-top" style={{ transform: `scale(${previewZoom / 100})` }}>
                          <ResumePreview 
                            resumeData={previewData} 
                            className="resume-preview shadow-lg border border-gray-200/60" 
                            currentTemplate={currentTemplate}
                            scale={1} 
                            isExporting={isExporting}
                          />
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 样式设置面板 - 固定定位 */}
              <div className="hidden xl:flex w-80 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] flex-col">
                <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900">{t.editor.styleSettings}</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <StyleSettingsPanel />
                </div>
              </div>
            </div>

          </main>

        {!isFullscreen && <Footer />}

        {/* 样式设置抽屉 */}
        <AnimatePresence>
          {showStyleSettings && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowStyleSettings(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.editor.styleSettings}</h3>
                  <button
                    onClick={() => setShowStyleSettings(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <StyleSettingsPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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

        {/* AI生成加载模态框 */}
        <LoadingModal
          isOpen={aiGenerationState.isLoading}
          onClose={handleCloseAIModal}
          type={aiGenerationState.type}
          message={aiGenerationState.message}
          progress={aiGenerationState.progress}
          showProgress={aiGenerationState.type === 'loading'}
        />

        {/* 模板选择器 */}
        {showTemplateSelector && (
          <TemplateSelector
            isOpen={showTemplateSelector}
            currentTemplate={currentTemplate.id}
            onSelectTemplate={handleTemplateSelect}
            onUpdateResumeData={(data) => {
              console.log('=== 编辑器页面接收到模板数据 ===')
              console.log('接收到的数据:', data)
              console.log('数据中的个人信息:', data.personalInfo)
              console.log('数据中的工作经历:', data.experience)
              console.log('数据中的教育背景:', data.education)
              console.log('数据中的技能:', data.skills)
              console.log('数据中的项目经历:', data.projects)
              console.log('当前resumeData状态:', resumeData)
              setResumeData(data)
              console.log('setResumeData调用完成')
              console.log('=== 编辑器页面数据更新结束 ===')
            }}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
        
        {/* 导出预览对话框 */}
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
            setShowPageBreaks(opts.showPageBreaks)
          }}
        />

        </div>
      </StyleProvider>
  )
}
