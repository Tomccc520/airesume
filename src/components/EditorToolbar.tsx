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
  HelpCircle,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  /** 显示AI配置弹窗 */
  onShowAIConfig?: () => void
  /** 显示快捷键帮助 */
  onShowShortcutHelp: () => void
  /** 显示模板选择器 */
  onShowTemplateSelector?: () => void
  /** 显示导出预览对话框 */
  onShowExportDialog?: () => void
  /** 导出功能 */
  onExport: (format: 'pdf' | 'png' | 'jpg') => Promise<void>
  /** 手动保存功能 */
  onSave?: () => Promise<void>

}

import { useLanguage } from '@/contexts/LanguageContext'

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
  onShowAIConfig,
  onShowShortcutHelp,
  onShowTemplateSelector,
  onShowExportDialog,
  onExport,
  onSave
}: EditorToolbarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAIConfig, setShowAIConfig] = useState(false)
  // 直接清空，无需确认
  const { success, error: showError } = useToastContext()
  const { t, locale } = useLanguage()

  /**
   * 处理AI配置保存
   */
  const handleAIConfigSave = () => {
    success(t.editor.messages.aiConfigSaved)
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
        success(t.editor.messages.loadSuccess)
      }
    } catch (error) {
      console.error('加载文件失败:', error)
      showError(t.editor.messages.loadError)
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
    success(t.editor.messages.clearSuccess)
  }

  /**
   * 保存成功回调
   */
  const handleSaveSuccess = () => {
    success(t.editor.messages.saveSuccess)
  }

  return (
    <>
      {/* 顶部工具栏 - Magic Resume 风格：简洁分组 */}
      <div className="relative z-40 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：标题 + 状态 */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap">{t.editor.title}</h1>
            
            {/* 自动保存状态 */}
            <div className="flex items-center">
                {isSaving ? (
                <div className="flex items-center text-xs text-gray-500">
                  <div className="animate-spin w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full mr-1.5"></div>
                  <span>{t.editor.messages.saving}</span>
                  </div>
                ) : hasUnsavedChanges ? (
                <div className="flex items-center text-xs text-orange-500">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  <span>{t.editor.messages.unsaved}</span>
                  </div>
                ) : (
                <div className="flex items-center text-xs text-emerald-500">
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  <span>{t.editor.messages.saved}</span>
                  </div>
                )}
            </div>
          </div>

          {/* 右侧：工具栏按钮组 - 分组设计 */}
          <div className="flex items-center gap-2">
            {/* 第一组：主要操作 */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <Button
              onClick={() => onSave ? onSave() : handleManualSave()}
              disabled={isSaving}
                variant="ghost"
                size="sm"
              title={`${t.editor.toolbar.save} (Ctrl+S)`}
            >
                <Save className="w-4 h-4" />
              </Button>

              <Button
              onClick={handleLoadFile}
              disabled={isLoading}
                variant="ghost"
                size="sm"
              title={t.editor.toolbar.load}
            >
                <LoadIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* 第二组：模板和AI */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
            {onShowTemplateSelector && (
                <Button
                onClick={onShowTemplateSelector}
                  variant="ghost"
                  size="sm"
                title={t.editor.toolbar.template}
              >
                  <Palette className="w-4 h-4" />
                </Button>
            )}

              <Button
              onClick={onShowAIAssistant}
                variant="ghost"
                size="sm"
              title={t.editor.toolbar.aiAssistant}
            >
                <Bot className="w-4 h-4" />
              </Button>
            </div>

            {/* 第三组：视图控制 */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <Button
              onClick={onTogglePreview}
                variant="ghost"
                size="sm"
              title={isPreviewMode ? t.editor.toolbar.edit : t.editor.toolbar.preview}
            >
              {isPreviewMode ? (
                  <EyeOff className="w-4 h-4" />
              ) : (
                  <Eye className="w-4 h-4" />
              )}
              </Button>

              <Button
              onClick={onToggleFullscreen}
                variant="ghost"
                size="sm"
              title={isFullscreen ? t.editor.toolbar.exitFullscreen : t.editor.toolbar.fullscreen}
            >
              {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
              ) : (
                  <Maximize2 className="w-4 h-4" />
              )}
              </Button>
            </div>

            {/* 第四组：导出和更多 */}
            <div className="flex items-center gap-1">
              <ExportButton onExport={onExport} />

              {/* 更多菜单 */}
              <Button
                onClick={() => {
                  if (onShowAIConfig) {
                    onShowAIConfig()
                    return
                  }
                  setShowAIConfig(true)
                }}
                variant="ghost"
                size="sm"
                title={t.editor.toolbar.aiConfig}
            >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
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
        isOpen={!!showAIConfig && !onShowAIConfig}
        onClose={() => setShowAIConfig(false)}
        onSave={handleAIConfigSave}
      />

      {/* 已移除清空确认，直接清空 */}
    </>
  )
}
