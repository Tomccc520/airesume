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
import AIAssistant from './AIAssistant'
import AISuggestionsModal from './AISuggestionsModal'
import { EditorSidebar } from './editor/EditorSidebar'
import { EditorHeader } from './editor/EditorHeader'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { useAIAssistant } from '@/hooks/useAIAssistant'
import { navigationItems } from '@/data/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

type AIAssistantType = 'summary' | 'experience' | 'skills' | 'education' | 'projects'

interface ResumeEditorProps {
  resumeData: ResumeData
  onUpdateResumeData: (data: ResumeData) => void
  activeSection: string
  onSectionChange: (section: string) => void
  onShowTemplateSelector?: () => void
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
  hideNavigation = false
}: ResumeEditorProps) {
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiAssistantType, setAiAssistantType] = useState<AIAssistantType>('summary')
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

  const {
    suggestionsTitle,
    suggestionsLoading,
    currentSuggestions,
    showSuggestionsModal,
    setShowSuggestionsModal,
    handleAIOptimize,
    handleApplySuggestion,
    handleApplyAllSuggestions
  } = useAIAssistant({
    resumeData,
    onUpdateResumeData,
    showToast
  })

  // 打开AI助手
  const openAIAssistant = useCallback((type: AIAssistantType = 'summary') => {
    setAiAssistantType(type)
    setShowAiAssistant(true)
  }, [])

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

  // 获取当前内容
  const getCurrentContent = useCallback(() => {
    switch (aiAssistantType) {
      case 'summary':
        return resumeData.personalInfo.summary || ''
      case 'experience':
        return resumeData.experience.map(exp => `${exp.company} - ${exp.position}\n${exp.description.join('\n')}`).join('\n\n')
      case 'skills':
        return resumeData.skills.map(skill => `${skill.name} (${skill.level}%)`).join(', ')
      case 'education':
        return resumeData.education.map(edu => `${edu.school} - ${edu.degree} ${edu.major}`).join('\n')
      case 'projects':
        return resumeData.projects.map(proj => `${proj.name}\n${proj.description}\n技术栈: ${proj.technologies.join(', ')}`).join('\n\n')
      default:
        return ''
    }
  }, [aiAssistantType, resumeData])

  // 应用AI建议
  const handleAIApply = useCallback((content: string) => {
    try {
      switch (aiAssistantType) {
        case 'summary':
          onUpdateResumeData({
            ...resumeData,
            personalInfo: {
              ...resumeData.personalInfo,
              summary: content
            }
          })
          showToast(t.editor.messages.summaryUpdated, 'success')
          break
        
        case 'experience':
          // 解析工作经历内容并更新到第一个工作经历项
          if (resumeData.experience.length > 0) {
            const updatedExperience = [...resumeData.experience]
            // 将AI建议的内容应用到第一个工作经历的描述中
            const lines = content.split('\n').filter(line => line.trim())
            updatedExperience[0] = {
              ...updatedExperience[0],
              description: lines
            }
            onUpdateResumeData({
              ...resumeData,
              experience: updatedExperience
            })
            showToast(t.editor.messages.experienceUpdated, 'success')
          } else {
            showToast(t.editor.messages.addExperienceFirst, 'warning')
          }
          break
        
        case 'skills':
          // 解析技能内容并更新
          try {
            const skillLines = content.split('\n').filter(line => line.trim())
            const newSkills: Skill[] = skillLines.map((line, index) => {
              // 尝试解析 "技能名称 (百分比%)" 格式
              const match = line.match(/^(.+?)\s*\((\d+)%?\)$/)
              if (match) {
                return {
                  id: `skill-${Date.now()}-${index}`,
                  name: match[1].trim(),
                  level: parseInt(match[2]),
                  category: '技术技能'
                }
              }
              // 如果没有百分比，默认设置为80%
              return {
                id: `skill-${Date.now()}-${index}`,
                name: line.trim(),
                level: 80,
                category: '技术技能'
              }
            }).filter(skill => skill.name)
            
            if (newSkills.length > 0) {
              onUpdateResumeData({
                ...resumeData,
                skills: newSkills
              })
              showToast(t.editor.messages.skillsUpdated, 'success')
            } else {
              showToast(t.editor.messages.parseSkillsFailed, 'warning')
            }
          } catch (_error) {
            showToast(t.editor.messages.skillsContentError, 'error')
          }
          break
        
        case 'education':
          // 解析教育经历内容并更新到第一个教育经历项
          if (resumeData.education.length > 0) {
            const lines = content.split('\n').filter(line => line.trim())
            const updatedEducation = [...resumeData.education]
            
            // 尝试解析第一行作为学校和专业信息
            if (lines.length > 0) {
              const firstLine = lines[0]
              const parts = firstLine.split(' - ')
              if (parts.length >= 2) {
                updatedEducation[0] = {
                  ...updatedEducation[0],
                  school: parts[0].trim(),
                  degree: parts[1].trim(),
                  major: parts[2]?.trim() || updatedEducation[0].major
                }
              }
            }
            
            onUpdateResumeData({
              ...resumeData,
              education: updatedEducation
            })
            showToast(t.editor.messages.educationUpdated, 'success')
          } else {
            showToast(t.editor.messages.addEducationFirst, 'warning')
          }
          break
        
        case 'projects':
          // 解析项目经历内容并更新到第一个项目
          if (resumeData.projects.length > 0) {
            const sections = content.split('\n\n')
            const updatedProjects = [...resumeData.projects]
            
            if (sections.length > 0) {
              const projectLines = sections[0].split('\n').filter(line => line.trim())
              if (projectLines.length > 0) {
                updatedProjects[0] = {
                  ...updatedProjects[0],
                  name: projectLines[0].trim(),
                  description: projectLines.slice(1).join('\n').trim() || updatedProjects[0].description,
                  technologies: updatedProjects[0].technologies // 保持原有技术栈
                }
              }
            }
            
            onUpdateResumeData({
              ...resumeData,
              projects: updatedProjects
            })
            showToast(t.editor.messages.projectsUpdated, 'success')
          } else {
            showToast(t.editor.messages.addProjectsFirst, 'warning')
          }
          break
        
        default:
          showToast(t.editor.messages.unknownError, 'warning')
      }
    } catch (error) {
      console.error('应用AI建议时出错:', error)
      showToast(t.editor.messages.applyError, 'error')
    }
    
    setShowAiAssistant(false)
  }, [aiAssistantType, resumeData, onUpdateResumeData, showToast, t])

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
            onAiOptimize={() => handleAIOptimize('summary')}
          />
        )
      case 'experience':
        return (
          <ExperienceForm 
            experiences={resumeData.experience} 
            onChange={handleExperienceChange}
          />
        )
      case 'education':
        return (
          <EducationForm 
            education={resumeData.education} 
            onChange={handleEducationChange}
          />
        )
      case 'skills':
        return (
          <SkillsForm 
            skills={resumeData.skills} 
            onChange={handleSkillsChange}
          />
        )
      case 'projects':
        return (
          <ProjectsForm 
            projects={resumeData.projects} 
            onChange={handleProjectsChange}
          />
        )
      default:
        return (
          <PersonalInfoForm 
            personalInfo={resumeData.personalInfo} 
            onChange={handlePersonalInfoChange}
            onAiOptimize={() => handleAIOptimize('summary')}
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
    handleAIOptimize
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
          <div className={`${hideNavigation ? 'px-6 py-4' : 'px-8 py-6'} pb-0`}>
             <h2 className={`${hideNavigation ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
               {translatedNavigationItems.find(item => item.id === activeSection)?.label}
             </h2>
             <p className="text-gray-500 text-sm">
               {translatedNavigationItems.find(item => item.id === activeSection)?.description}
             </p>
          </div>

          {/* 桌面端内联编辑 */}
          <div className={`hidden md:block flex-1 ${hideNavigation ? 'px-6 py-4' : 'px-8 py-6'} ${hideNavigation ? '' : 'overflow-y-auto custom-scrollbar'}`}>
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

      {/* AI助手组件 */}
      <AnimatePresence>
        {showAiAssistant && (
          <AIAssistant
            type={aiAssistantType}
            currentContent={getCurrentContent()}
            onClose={() => setShowAiAssistant(false)}
            onApply={handleAIApply}
          />
        )}
      </AnimatePresence>

      {/* AI建议弹窗 */}
      <AISuggestionsModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        suggestions={currentSuggestions}
        title={suggestionsTitle}
        loading={suggestionsLoading}
        onApplySuggestion={handleApplySuggestion}
        onApplyAll={handleApplyAllSuggestions}
      />

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
