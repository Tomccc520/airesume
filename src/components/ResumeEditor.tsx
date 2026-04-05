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

import React, { useState, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import { navigationItems } from '@/data/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

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
  
  const { success: showToast } = useToastContext()
  const { t } = useLanguage()

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
    const handleSwitchToEditor = (event: CustomEvent) => {
      const { section } = event.detail
      onSectionChange(section)
    }

    window.addEventListener('switchToEditor', handleSwitchToEditor as EventListener)
    
    return () => {
      window.removeEventListener('switchToEditor', handleSwitchToEditor as EventListener)
    }
  }, [onSectionChange])

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
    <div className={`${hideNavigation ? '' : 'h-full'} flex flex-col bg-white/50 backdrop-blur-sm`}>
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
          <div className={`hidden md:block flex-1 ${hideNavigation ? 'px-6 py-5' : 'px-8 py-6'} ${hideNavigation ? '' : 'overflow-y-auto custom-scrollbar'}`}>
            <div className={hideNavigation ? '' : 'max-w-3xl'}>
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
              <div className="p-3 max-h-[70vh] overflow-y-auto">
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
