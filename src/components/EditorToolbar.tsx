/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  FolderOpen as LoadIcon, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Bot,
  Settings,
  Trash2,
  Sparkles,
  Palette,
  HelpCircle
} from 'lucide-react'
import ExportButton from './ExportButton'
import LoadingSpinner from './LoadingSpinner'
import SaveDialog from './SaveDialog'
import AIConfigModal from './AIConfigModal'
import { ResumeData } from '@/types/resume'
import { loadResumeFromFile } from '@/utils/fileOperations'
import { useToastContext } from './Toast'
// 移除清空确认对话框，直接清空

/**
 * 编辑器工具栏组件
 * 提供保存、加载、导出、预览切换等全局操作功能
 */
interface EditorToolbarProps {
  /** 简历数据 */
  resumeData: ResumeData
  /** 数据更新回调 */
  onUpdate: (data: ResumeData) => void
  /** 是否正在保存 */
  isSaving: boolean
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean
  /** 最后保存时间 */
  lastSavedAt: Date | null
  /** 是否预览模式 */
  isPreviewMode: boolean
  /** 切换预览模式 */
  onTogglePreview: () => void
  /** 是否全屏模式 */
  isFullscreen: boolean
  /** 切换全屏模式 */
  onToggleFullscreen: () => void
  /** 显示AI助手 */
  onShowAIAssistant: () => void
  /** 显示快捷键帮助 */
  onShowShortcutHelp: () => void
  /** 显示模板选择器 */
  onShowTemplateSelector?: () => void
  /** 显示导出预览对话框 */
  onShowExportDialog?: () => void
  /** 导出功能 */
  onExport: (format: 'pdf' | 'png' | 'jpg' | 'docx') => Promise<void>
  /** 手动保存功能 */
  onSave?: () => Promise<void>
  /** AI一键生成简历 */
  onAIGenerateResume?: () => void
}

/**
 * 编辑器工具栏组件
 */
export default function EditorToolbar({
  resumeData,
  onUpdate,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt,
  isPreviewMode,
  onTogglePreview,
  isFullscreen,
  onToggleFullscreen,
  onShowAIAssistant,
  onShowShortcutHelp,
  onShowTemplateSelector,
  onShowExportDialog,
  onExport,
  onSave,
  onAIGenerateResume
}: EditorToolbarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAIConfig, setShowAIConfig] = useState(false)
  // 直接清空，无需确认
  const { success, error: showError } = useToastContext()

  /**
   * 处理AI配置保存
   */
  const handleAIConfigSave = () => {
    success('AI配置已保存')
  }

  /**
   * 处理手动保存
   */
  const handleManualSave = () => {
    setShowSaveDialog(true)
  }

  /**
   * 处理文件加载
   */
  const handleLoadFile = async () => {
    setIsLoading(true)
    try {
      const loadedData = await loadResumeFromFile()
      if (loadedData) {
        onUpdate(loadedData)
        success('简历数据加载成功！')
      }
    } catch (error) {
      console.error('加载文件失败:', error)
      showError('加载文件失败，请检查文件格式')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理清空内容
   */
  const handleClearContent = () => {
    const emptyResumeData: ResumeData = {
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: []
    }
    
    onUpdate(emptyResumeData)
    success('所有内容已清空')
  }

  /**
   * 保存成功回调
   */
  const handleSaveSuccess = () => {
    success('简历已成功保存到本地！')
  }

  return (
    <>
      {/* 顶部工具栏 */}
      <div className="relative z-40 bg-white border border-gray-200 rounded-xl mx-4 lg:mx-6 mb-4 px-4 py-3 flex-shrink-0">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">简历编辑器</h1>
            
            {/* 自动保存状态显示 */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 sm:space-x-4">
              {/* 自动保存状态 */}
              <div className="flex items-center space-x-2">
                {isSaving ? (
                  <div className="flex items-center text-xs sm:text-sm text-blue-400">
                    <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden xs:inline">保存中...</span>
                    <span className="xs:hidden">保存</span>
                  </div>
                ) : hasUnsavedChanges ? (
                  <div className="flex items-center text-xs sm:text-sm text-orange-400">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">有未保存的更改</span>
                    <span className="xs:hidden">未保存</span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs sm:text-sm text-green-400">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">已保存</span>
                    <span className="xs:hidden">已保存</span>
                    {lastSavedAt && (
                      <span className="hidden sm:inline ml-2 text-gray-400">
                        {lastSavedAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 工具栏按钮组 */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-0 flex-1 ml-0 sm:ml-4">
            {/* 手动保存按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave ? onSave() : handleManualSave()}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="保存简历 (Ctrl+S)"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              )}
              <span className="hidden xs:inline">保存</span>
            </motion.button>

            {/* 加载文件按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadFile}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="加载本地简历文件"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <LoadIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              )}
              <span className="hidden sm:inline">加载</span>
            </motion.button>

            {/* 模板选择按钮 */}
            {onShowTemplateSelector && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowTemplateSelector}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
                style={{ minHeight: '40px' }}
                title="选择简历模板"
              >
                <Palette className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">模板</span>
              </motion.button>
            )}

            {/* 导出预览按钮 */}
            {onShowExportDialog && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowExportDialog}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
                style={{ minHeight: '40px' }}
                title="导出预览"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">导出预览</span>
              </motion.button>
            )}

            {/* AI一键生成按钮 */}
            {onAIGenerateResume && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAIGenerateResume}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
                style={{ minHeight: '40px' }}
                title="AI智能生成简历"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">AI生成</span>
              </motion.button>
            )}

            {/* 清空内容按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearContent}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="清空所有内容"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">清空</span>
            </motion.button>

            {/* AI配置按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIConfig(true)}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="配置AI模型"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">AI配置</span>
            </motion.button>

            {/* AI助手按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowAIAssistant}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="打开AI助手"
            >
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">AI助手</span>
            </motion.button>

            {/* 预览切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTogglePreview}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title={isPreviewMode ? '切换到编辑模式' : '切换到预览模式'}
            >
              {isPreviewMode ? (
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isPreviewMode ? '编辑' : '预览'}
              </span>
            </motion.button>

            {/* 全屏切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFullscreen}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title={isFullscreen ? '退出全屏' : '全屏模式'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              ) : (
                <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? '退出全屏' : '全屏'}
              </span>
            </motion.button>

            {/* 快捷键帮助按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowShortcutHelp}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border border-gray-200/50 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              style={{ minHeight: '40px' }}
              title="查看快捷键"
            >
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">帮助</span>
            </motion.button>

            {/* 导出按钮 */}
            <ExportButton 
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 shadow-sm flex items-center space-x-1 sm:space-x-2 min-w-0 touch-manipulation"
              onExport={onExport}
            />
          </div>
        </div>

      </div>

      {/* 保存对话框 */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        resumeData={resumeData}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* AI配置模态框 */}
      <AIConfigModal
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        onSave={handleAIConfigSave}
      />

      {/* 已移除清空确认，直接清空 */}
    </>
  )
}
