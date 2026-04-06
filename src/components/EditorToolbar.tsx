/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { useCallback, useMemo, useState } from 'react'
import { 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Bot,
  Palette,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExportButton from './ExportButton'
import SaveDialog from './SaveDialog'
import { ResumeData } from '@/types/resume'
import { useToastContext } from './Toast'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getAIWorkbenchBadgeLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { useAIConfigStatus } from '@/hooks/useAIConfigStatus'
// 移除清空确认对话框，直接清空

/**
 * 编辑器工具栏组件
 * 提供保存、模板、AI、预览、导出和高级入口等核心操作。
 */
interface EditorToolbarProps {
  /** 简历数据 */
  resumeData: ResumeData
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
  /** 显示AI助手 */
  onShowAIAssistant: () => void
  /** 显示模板选择器 */
  onShowTemplateSelector?: () => void
  /** 显示高级面板 */
  onShowAdvancedPanel: () => void
  /** 导出功能 */
  onExport: (format: 'pdf' | 'png' | 'jpg') => Promise<void>
  /** 手动保存功能 */
  onSave?: () => Promise<void>
}
/**
 * 编辑器工具栏组件
 */
export default function EditorToolbar({
  resumeData,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt: _lastSavedAt,
  isPreviewMode,
  onTogglePreview,
  onShowAIAssistant,
  onShowTemplateSelector,
  onShowAdvancedPanel,
  onExport,
  onSave,
}: EditorToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const aiConfigStatus = useAIConfigStatus()
  const { success } = useToastContext()
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'

  /**
   * 获取保存状态展示
   * 统一顶部状态徽标的颜色、图标与文案，避免工具栏中重复判断。
   */
  const getSaveStatusMeta = () => {
    if (isSaving) {
      return {
        toneClass: 'border-slate-200 bg-slate-100 text-slate-600',
        label: t.editor.messages.saving,
        icon: (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )
      }
    }

    if (hasUnsavedChanges) {
      return {
        toneClass: 'border-amber-200 bg-amber-50 text-amber-700',
        label: t.editor.messages.unsaved,
        icon: <AlertCircle className="h-3.5 w-3.5" />
      }
    }

    return {
      toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      label: t.editor.messages.saved,
      icon: <CheckCircle className="h-3.5 w-3.5" />
    }
  }

  /**
   * 获取工具栏按钮样式
   * 让编辑器顶部操作区与首页头部共用同一套胶囊按钮规范。
   */
  const getToolbarButtonClass = useCallback((isActive = false) => {
    return isActive
      ? 'app-shell-toolbar-button app-shell-toolbar-button-active h-9 px-3.5'
      : 'app-shell-toolbar-button h-9 px-3.5'
  }, [])

  /**
   * 获取工具栏里的 AI 状态摘要
   * 统一顶部状态徽标和 AI 主按钮的文案与颜色。
   */
  const aiToolbarMeta = useMemo(() => {
    const statusKey = getAIWorkbenchStatusKey(aiConfigStatus)
    const { toneClass } = getAIWorkbenchToneMeta(statusKey)
    const chipLabel = getAIWorkbenchBadgeLabel(statusKey, isZh ? 'zh' : 'en')

    if (statusKey === 'ready') {
      return {
        chipToneClass: toneClass,
        chipLabel,
        assistantButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        assistantTitle: isZh ? 'AI 已验证通过，打开助手继续优化。' : 'AI is validated. Open the assistant to optimize content.'
      }
    }

    if (statusKey === 'needsValidation') {
      return {
        chipToneClass: toneClass,
        chipLabel,
        assistantButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
        assistantTitle: isZh ? 'AI 配置已补齐，打开助手完成验证。' : 'AI setup is filled in. Open the assistant to validate it.'
      }
    }

    if (statusKey === 'needsConfig') {
      return {
        chipToneClass: toneClass,
        chipLabel,
        assistantButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        assistantTitle: isZh ? 'AI 入口已准备好，打开后会引导你先完成配置。' : 'The AI entry is ready and will guide you through setup first.'
      }
    }

    return {
      chipToneClass: toneClass,
      chipLabel,
      assistantButtonClass: getToolbarButtonClass(),
      assistantTitle: isZh ? 'AI 当前已停用，打开助手可重新启用和配置。' : 'AI is disabled. Open the assistant to enable or configure it again.'
    }
  }, [aiConfigStatus, getToolbarButtonClass, isZh])

  /**
   * 处理手动保存
   */
  const handleManualSave = () => {
    setShowSaveDialog(true)
  }

  /**
   * 保存成功回调
   */
  const handleSaveSuccess = () => {
    success(t.editor.messages.saveSuccess)
  }

  const saveStatusMeta = getSaveStatusMeta()

  return (
    <>
      <div className="relative z-40 flex-shrink-0 px-4 lg:px-8">
        <div className="app-shell-toolbar-surface px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="app-shell-brand-mark h-10 w-10 shrink-0">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-lg font-semibold text-slate-900">{t.editor.title}</h1>
                  <div className={`app-shell-status-chip ${saveStatusMeta.toneClass}`}>
                    {saveStatusMeta.icon}
                    <span>{saveStatusMeta.label}</span>
                  </div>
                  <div className={`app-shell-status-chip ${aiToolbarMeta.chipToneClass}`}>
                    <Bot className="h-3.5 w-3.5" />
                    <span>{aiToolbarMeta.chipLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden flex-wrap items-center gap-2 xl:flex xl:justify-end">
              <div className="app-shell-toolbar-group">
                <Button
                  onClick={() => onSave ? onSave() : handleManualSave()}
                  disabled={isSaving}
                  variant="ghost"
                  size="sm"
                  className={getToolbarButtonClass()}
                  title={`${t.editor.toolbar.save} (Ctrl+S)`}
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden xl:inline">{t.editor.toolbar.save}</span>
                </Button>
              </div>

              <div className="app-shell-toolbar-group">
                {onShowTemplateSelector && (
                <Button
                  onClick={onShowTemplateSelector}
                  variant="ghost"
                  size="sm"
                  className={getToolbarButtonClass()}
                  title={t.editor.toolbar.template}
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden xl:inline">{t.editor.toolbar.template}</span>
                </Button>
                )}

                <Button
                  onClick={onShowAIAssistant}
                  variant="ghost"
                  size="sm"
                  className={aiToolbarMeta.assistantButtonClass}
                  title={aiToolbarMeta.assistantTitle}
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden xl:inline">{t.editor.toolbar.aiAssistant}</span>
                </Button>
              </div>

              <div className="app-shell-toolbar-group">
                <Button
                  onClick={onTogglePreview}
                  variant="ghost"
                  size="sm"
                  className={getToolbarButtonClass(isPreviewMode)}
                  title={isPreviewMode ? t.editor.toolbar.edit : t.editor.toolbar.preview}
                >
                  {isPreviewMode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="hidden xl:inline">
                    {isPreviewMode ? t.editor.toolbar.edit : t.editor.toolbar.preview}
                  </span>
                </Button>
              </div>

              <div className="app-shell-toolbar-group">
                <ExportButton
                  onExport={onExport}
                  buttonClassName="h-9 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-900"
                  panelClassName="rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl"
                />

                <Button
                  onClick={onShowAdvancedPanel}
                  variant="ghost"
                  size="sm"
                  className={getToolbarButtonClass()}
                  title={isZh ? '更多工具' : 'More tools'}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="hidden xl:inline">{isZh ? '更多' : 'More'}</span>
                </Button>
              </div>
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

      {/* 已移除清空确认，直接清空 */}
    </>
  )
}
