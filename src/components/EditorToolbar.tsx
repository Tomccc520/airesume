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
  FolderOpen as LoadIcon, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Bot,
  Settings,
  Palette,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExportButton from './ExportButton'
import SaveDialog from './SaveDialog'
import AIConfigModal from './AIConfigModal'
import { ResumeData } from '@/types/resume'
import { loadResumeFromFile } from '@/utils/fileOperations'
import { useToastContext } from './Toast'
import { navigationItems } from '@/data/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getAIWorkbenchBadgeLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { useAIConfigStatus } from '@/hooks/useAIConfigStatus'
// 移除清空确认对话框，直接清空

type EditorEntryScenario = 'campus' | 'engineering' | 'product' | 'general'

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
  /** 当前编辑模块 */
  activeSection?: string
  /** 快速切换编辑模块 */
  onQuickSectionChange?: (section: string) => void
  /** 当前投递场景 */
  entryScenario?: EditorEntryScenario | null
  /** 切换投递场景 */
  onEntryScenarioChange?: (scenario: EditorEntryScenario) => void
  /** 简历整体完成度（0-100） */
  completionPercent?: number
  /** 未完成模块数量 */
  incompleteSectionCount?: number
  /** 跳转到下一个未完成模块 */
  onJumpToNextIncomplete?: () => void

}
/**
 * 编辑器工具栏组件
 */
export default function EditorToolbar({
  resumeData,
  onUpdate,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt: _lastSavedAt,
  isPreviewMode,
  onTogglePreview,
  isFullscreen,
  onToggleFullscreen,
  onShowAIAssistant,
  onShowAIConfig,
  onShowShortcutHelp: _onShowShortcutHelp,
  onShowTemplateSelector,
  onShowExportDialog: _onShowExportDialog,
  onExport,
  onSave,
  activeSection,
  onQuickSectionChange,
  entryScenario,
  onEntryScenarioChange,
  completionPercent = 0,
  incompleteSectionCount = 0,
  onJumpToNextIncomplete
}: EditorToolbarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const aiConfigStatus = useAIConfigStatus()
  // 直接清空，无需确认
  const { success, error: showError } = useToastContext()
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'
  const entryScenarioOptions: EditorEntryScenario[] = ['campus', 'engineering', 'product', 'general']
  const toolbarHint = isZh
    ? '模板、内容、导出与 AI 协作都在同一工作流内完成。'
    : 'Templates, content, export, and AI stay in one streamlined workspace.'

  /**
   * 获取编辑模块显示名称
   * 统一处理工具栏下拉框的中英文文案，避免多处重复判断。
   */
  const getSectionLabel = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return t.editor.personalInfo.title
      case 'experience':
        return t.editor.experience.title
      case 'education':
        return t.editor.education.title
      case 'skills':
        return t.editor.skills.title
      case 'projects':
        return t.editor.projects.title
      default:
        return sectionId
    }
  }

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
   * 统一顶部状态徽标、AI 助手按钮和 AI 配置按钮的文案与颜色。
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
        assistantTitle: isZh ? 'AI 已验证通过，打开助手继续优化或生成。' : 'AI is validated. Open the assistant to optimize or generate.',
        configButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        configLabel: isZh ? 'AI 已可用' : 'AI Ready',
        configTitle: isZh ? '当前 AI 已验证通过，点击可继续调整配置。' : 'AI is validated. Open configuration to review or adjust settings.'
      }
    }

    if (statusKey === 'needsValidation') {
      return {
        chipToneClass: toneClass,
        chipLabel,
        assistantButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
        assistantTitle: isZh ? 'AI 配置已补齐，建议打开助手完成验证。' : 'AI setup is filled in. Open the assistant to validate it.',
        configButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
        configLabel: isZh ? '验证 AI 配置' : 'Validate AI',
        configTitle: isZh ? '当前配置已保存，但还需要完成一次验证。' : 'The current setup is saved, but still needs one successful validation.'
      }
    }

    if (statusKey === 'needsConfig') {
      return {
        chipToneClass: toneClass,
        chipLabel,
        assistantButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        assistantTitle: isZh ? 'AI 入口已准备好，打开后会引导你先完成配置。' : 'The AI entry is ready and will guide you through setup first.',
        configButtonClass: 'app-shell-toolbar-button h-9 px-3.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        configLabel: isZh ? '完成 AI 配置' : 'Finish AI Setup',
        configTitle: isZh ? '当前还缺少 AI 配置，点击继续完成。' : 'AI still needs configuration. Click to continue setup.'
      }
    }

    return {
      chipToneClass: toneClass,
      chipLabel,
      assistantButtonClass: getToolbarButtonClass(),
      assistantTitle: isZh ? 'AI 当前已停用，打开助手可重新启用和配置。' : 'AI is disabled. Open the assistant to enable or configure it again.',
      configButtonClass: getToolbarButtonClass(),
      configLabel: isZh ? '启用 AI' : 'Enable AI',
      configTitle: isZh ? '当前 AI 已停用，点击可重新启用。' : 'AI is currently disabled. Click to enable it again.'
    }
  }, [aiConfigStatus, getToolbarButtonClass, isZh])

  /**
   * 获取投递场景文案
   * 统一顶部场景切换条的标签显示，保持首页与编辑器语义一致。
   */
  const getEntryScenarioLabel = (scenario: EditorEntryScenario) => {
    if (locale === 'en') {
      const labelMap: Record<EditorEntryScenario, string> = {
        campus: 'Campus',
        engineering: 'Engineering',
        product: 'Product & Ops',
        general: 'General'
      }
      return labelMap[scenario]
    }

    const labelMap: Record<EditorEntryScenario, string> = {
      campus: '校招',
      engineering: '技术岗',
      product: '产品/运营',
      general: '通用投递'
    }
    return labelMap[scenario]
  }

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
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
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
                <p className="mt-1 text-xs text-slate-500">{toolbarHint}</p>
                {onEntryScenarioChange && (
                  <div className="mt-2 hidden items-center gap-2 xl:flex">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {isZh ? '投递场景' : 'Scenario'}
                    </span>
                    <div className="app-shell-toolbar-group">
                      {entryScenarioOptions.map((scenario) => (
                        <button
                          key={scenario}
                          type="button"
                          onClick={() => onEntryScenarioChange(scenario)}
                          className={`h-8 px-3 text-xs ${
                            entryScenario === scenario
                              ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                              : 'app-shell-toolbar-button'
                          }`}
                        >
                          {getEntryScenarioLabel(scenario)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 2xl:justify-end">
              {activeSection && onQuickSectionChange && (
                <div className="app-shell-toolbar-group hidden lg:inline-flex">
                  <span className="px-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {t.common.edit}
                  </span>
                  <select
                    value={activeSection}
                    onChange={(event) => onQuickSectionChange(event.target.value)}
                    className="h-9 min-w-[138px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-slate-900"
                  >
                    {navigationItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getSectionLabel(item.id)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="hidden xl:flex app-shell-toolbar-group px-2">
                <div className="min-w-[170px] px-1">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>{isZh ? '完成度' : 'Completion'}</span>
                    <span className="font-semibold text-slate-700">{completionPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all ${
                        completionPercent >= 80
                          ? 'bg-emerald-500'
                          : completionPercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-slate-900'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, completionPercent))}%` }}
                    />
                  </div>
                </div>
                {onJumpToNextIncomplete && incompleteSectionCount > 0 && (
                  <button
                    type="button"
                    onClick={onJumpToNextIncomplete}
                    className="app-shell-toolbar-button h-9 px-3"
                  >
                    {isZh ? '继续完善' : 'Next Incomplete'}
                  </button>
                )}
              </div>

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
                <span className="hidden 2xl:inline">{t.editor.toolbar.save}</span>
              </Button>

              <Button
                onClick={handleLoadFile}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className={getToolbarButtonClass()}
                title={t.editor.toolbar.load}
              >
                <LoadIcon className="w-4 h-4" />
                <span className="hidden 2xl:inline">{t.editor.toolbar.load}</span>
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
                  <span className="hidden 2xl:inline">{t.editor.toolbar.template}</span>
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
                <span className="hidden 2xl:inline">{t.editor.toolbar.aiAssistant}</span>
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
                <span className="hidden 2xl:inline">
                  {isPreviewMode ? t.editor.toolbar.edit : t.editor.toolbar.preview}
                </span>
              </Button>

              <Button
                onClick={onToggleFullscreen}
                variant="ghost"
                size="sm"
                className={getToolbarButtonClass(isFullscreen)}
                title={isFullscreen ? t.editor.toolbar.exitFullscreen : t.editor.toolbar.fullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
                <span className="hidden 2xl:inline">
                  {isFullscreen ? t.editor.toolbar.exitFullscreen : t.editor.toolbar.fullscreen}
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
                onClick={() => {
                  if (onShowAIConfig) {
                    onShowAIConfig()
                    return
                  }
                  setShowAIConfig(true)
                }}
                variant="ghost"
                size="sm"
                className={aiToolbarMeta.configButtonClass}
                title={aiToolbarMeta.configTitle}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden 2xl:inline">{aiToolbarMeta.configLabel}</span>
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
