/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Database,
  Download,
  FolderOpen,
  HardDrive,
  Keyboard,
  Maximize2,
  Minimize2,
  Palette,
  Settings,
  Wand2,
  X
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { StyleSettingsPanel } from './StyleSettingsPanel'
import StorageMonitor, { CleanupOptions, StorageUsage } from '@/components/data/StorageMonitor'

type AdvancedPanelTab = 'tools' | 'style' | 'storage'

interface EditorAdvancedPanelProps {
  /**
   * 是否打开高级面板
   */
  isOpen: boolean
  /**
   * 关闭高级面板
   */
  onClose: () => void
  /**
   * 打开导入导出
   */
  onOpenImportExport: () => void
  /**
   * 打开模板选择器
   */
  onOpenTemplateSelector: () => void
  /**
   * 打开导出面板
   */
  onOpenExportDialog: () => void
  /**
   * 打开 AI 配置
   */
  onOpenAIConfig: () => void
  /**
   * 打开 AI 助手
   */
  onOpenAIAssistant: () => void
  /**
   * 打开快捷键帮助
   */
  onOpenShortcutHelp: () => void
  /**
   * 读取本地文件
   */
  onLoadFromFile: () => Promise<void>
  /**
   * 切换全屏
   */
  onToggleFullscreen: () => void
  /**
   * 当前是否全屏
   */
  isFullscreen: boolean
  /**
   * 是否正在加载文件
   */
  isLoadingFile?: boolean
  /**
   * 本地存储使用情况
   */
  storageUsage: StorageUsage
  /**
   * 清理本地存储
   */
  onCleanupStorage: (options: CleanupOptions) => Promise<number>
  /**
   * 刷新本地存储统计
   */
  onRefreshStorage: () => void
}

/**
 * 获取高级面板页签文案
 * 统一工具、样式和存储三个页签的中英文显示。
 */
function getAdvancedTabLabel(tab: AdvancedPanelTab, locale: 'zh' | 'en') {
  if (locale === 'en') {
    const labelMap: Record<AdvancedPanelTab, string> = {
      tools: 'Tools',
      style: 'Styles',
      storage: 'Storage'
    }
    return labelMap[tab]
  }

  const labelMap: Record<AdvancedPanelTab, string> = {
    tools: '工具',
    style: '样式',
    storage: '存储'
  }
  return labelMap[tab]
}

/**
 * 编辑器高级面板
 * 统一承接低频配置和维护能力，减少主工作台上的入口噪音。
 */
export default function EditorAdvancedPanel({
  isOpen,
  onClose,
  onOpenImportExport,
  onOpenTemplateSelector,
  onOpenExportDialog,
  onOpenAIConfig,
  onOpenAIAssistant,
  onOpenShortcutHelp,
  onLoadFromFile,
  onToggleFullscreen,
  isFullscreen,
  isLoadingFile = false,
  storageUsage,
  onCleanupStorage,
  onRefreshStorage
}: EditorAdvancedPanelProps) {
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<AdvancedPanelTab>('tools')

  /**
   * 获取高级工具列表
   * 把低频入口收敛成一组统一动作，避免主工具栏继续堆叠。
   */
  const toolActions = useMemo(() => {
    return [
      {
        id: 'template',
        icon: Palette,
        title: locale === 'zh' ? '模板切换' : 'Templates',
        description: locale === 'zh' ? '打开模板选择器，切换投递版式。' : 'Open the template selector and switch layouts.',
        onClick: () => {
          onClose()
          onOpenTemplateSelector()
        }
      },
      {
        id: 'export',
        icon: Download,
        title: locale === 'zh' ? '导出面板' : 'Export',
        description: locale === 'zh' ? '打开完整导出设置，选择格式和纸张参数。' : 'Open the full export dialog with format and paper settings.',
        onClick: () => {
          onClose()
          onOpenExportDialog()
        }
      },
      {
        id: 'ai-workbench',
        icon: Wand2,
        title: locale === 'zh' ? 'AI 助手' : 'AI Assistant',
        description: locale === 'zh' ? '进入 AI 优化和 JD 匹配主入口。' : 'Open the AI workspace for optimize and JD match.',
        onClick: () => {
          onClose()
          onOpenAIAssistant()
        }
      },
      {
        id: 'import-export',
        icon: Database,
        title: locale === 'zh' ? '数据导入导出' : 'Import / Export',
        description: locale === 'zh' ? '备份、导入和恢复简历数据。' : 'Backup, import, and restore resume data.',
        onClick: () => {
          onClose()
          onOpenImportExport()
        }
      },
      {
        id: 'load-file',
        icon: FolderOpen,
        title: locale === 'zh' ? '读取本地文件' : 'Load Local File',
        description: locale === 'zh' ? '从本地文件快速加载简历内容。' : 'Load resume content from a local file.',
        onClick: async () => {
          await onLoadFromFile()
          onClose()
        }
      },
      {
        id: 'ai-config',
        icon: Settings,
        title: locale === 'zh' ? 'AI 配置' : 'AI Configuration',
        description: locale === 'zh' ? '管理模型、端点和验证状态。' : 'Manage model, endpoint, and validation state.',
        onClick: () => {
          onClose()
          onOpenAIConfig()
        }
      },
      {
        id: 'shortcut-help',
        icon: Keyboard,
        title: locale === 'zh' ? '快捷键帮助' : 'Shortcut Help',
        description: locale === 'zh' ? '查看保存、切换和编辑快捷键。' : 'Review save, switch, and editing shortcuts.',
        onClick: () => {
          onClose()
          onOpenShortcutHelp()
        }
      },
      {
        id: 'fullscreen',
        icon: isFullscreen ? Minimize2 : Maximize2,
        title: isFullscreen
          ? (locale === 'zh' ? '退出全屏' : 'Exit Fullscreen')
          : (locale === 'zh' ? '进入全屏' : 'Enter Fullscreen'),
        description: locale === 'zh'
          ? '切换当前编辑器的全屏工作状态。'
          : 'Toggle fullscreen mode for the editor workspace.',
        onClick: () => {
          onToggleFullscreen()
          onClose()
        }
      },
      {
        id: 'style-tab',
        icon: Palette,
        title: locale === 'zh' ? '样式设置' : 'Style Settings',
        description: locale === 'zh'
          ? '调整字体、间距和主题细节。'
          : 'Adjust fonts, spacing, and visual styling.',
        onClick: () => {
          setActiveTab('style')
        }
      },
      {
        id: 'storage-tab',
        icon: HardDrive,
        title: locale === 'zh' ? '存储管理' : 'Storage',
        description: locale === 'zh'
          ? '查看缓存占用并执行清理。'
          : 'Review cached data and clean up storage.',
        onClick: () => {
          setActiveTab('storage')
        }
      }
    ]
  }, [
    isFullscreen,
    locale,
    onClose,
    onLoadFromFile,
    onOpenAIConfig,
    onOpenAIAssistant,
    onOpenExportDialog,
    onOpenImportExport,
    onOpenShortcutHelp,
    onOpenTemplateSelector,
    onToggleFullscreen
  ])

  if (!isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="app-shell-brand-mark h-11 w-11 shrink-0 rounded-xl">
                <Settings className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {locale === 'zh' ? '高级工具' : 'Advanced Tools'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {locale === 'zh'
                    ? '把低频功能收进同一个入口，保持编辑主流程更干净。'
                    : 'Keep low-frequency tools in one place so the editor stays focused.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-slate-200 px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {(['tools', 'style', 'storage'] as AdvancedPanelTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'app-shell-toolbar-button app-shell-toolbar-button-active'
                      : 'app-shell-toolbar-button'
                  }`}
                >
                  {getAdvancedTabLabel(tab, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50/70 px-6 py-6">
            {activeTab === 'tools' && (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {toolActions.map((action) => {
                  const Icon = action.icon

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => void action.onClick()}
                      disabled={action.id === 'load-file' && isLoadingFile}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900">
                            {action.title}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {locale === 'zh' ? '样式设置' : 'Style Settings'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === 'zh'
                      ? '样式调整已从左侧导航收纳到这里，减少主编辑区干扰。'
                      : 'Style controls are moved here so the main editor stays focused.'}
                  </p>
                </div>
                <StyleSettingsPanel />
              </div>
            )}

            {activeTab === 'storage' && (
              <StorageMonitor
                usage={storageUsage}
                onCleanup={onCleanupStorage}
                onRefresh={onRefreshStorage}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
