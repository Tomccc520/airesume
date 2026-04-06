/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 导出预览对话框
 */

'use client'

import { useState } from 'react'
import { X, Download, FileText, Image, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToastContext } from '@/components/Toast'

interface ExportPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'pdf' | 'png' | 'jpg' | 'json') => void | Promise<void>
  resumeName: string
  templateFitTitle?: string | null
  templateFitDescription?: string | null
  templateFitReasons?: string[]
  templateFitRecommendedLabel?: string | null
  templateFitShouldSuggestSwitch?: boolean
  onOptionsChange?: (options: { margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }) => void
}

export default function ExportPreviewDialog({
  isOpen,
  onClose,
  onExport,
  resumeName,
  templateFitTitle,
  templateFitDescription,
  templateFitReasons = [],
  templateFitRecommendedLabel,
  templateFitShouldSuggestSwitch = false,
  onOptionsChange
}: ExportPreviewDialogProps) {
  const { t, locale } = useLanguage()
  const { error: showError } = useToastContext()
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'png' | 'jpg' | 'json'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [margin, setMargin] = useState(10)
  const [showPageBreaks, setShowPageBreaks] = useState(true)
  const [paper, setPaper] = useState<'a4' | 'letter'>('a4')
  const [errorMessage, setErrorMessage] = useState('')

  const formats = [
    {
      id: 'pdf' as const,
      name: t.editor.toolbar.pdfFormat,
      description: t.editor.toolbar.pdfDesc,
      icon: FileText,
      color: 'red',
      recommended: true
    },
    {
      id: 'png' as const,
      name: t.editor.toolbar.pngFormat,
      description: t.editor.toolbar.pngDesc,
      icon: Image,
      color: 'green'
    },
    {
      id: 'jpg' as const,
      name: t.editor.toolbar.jpgFormat,
      description: t.editor.toolbar.jpgDesc,
      icon: Image,
      color: 'orange'
    },
    {
      id: 'json' as const,
      name: locale === 'zh' ? 'JSON 数据' : 'JSON Data',
      description: locale === 'zh' ? '用于备份和导入' : 'For backup and import',
      icon: File,
      color: 'purple'
    }
  ]

  /**
   * 获取导出格式说明
   * 为当前选中的格式补充导出场景、文件特征和建议用途，降低用户选择成本。
   */
  const getFormatGuide = (format: typeof selectedFormat) => {
    const guideMap = {
      pdf: {
        badge: locale === 'zh' ? '投递优先' : 'Best for Delivery',
        summary: locale === 'zh'
          ? '适合正式投递、打印和发送给招聘方。'
          : 'Best for job submission, printing, and recruiter sharing.'
      },
      png: {
        badge: locale === 'zh' ? '高清图片' : 'High Fidelity',
        summary: locale === 'zh'
          ? '适合做长图展示或插入到其他文档中。'
          : 'Great for long-image previews or embedding into other documents.'
      },
      jpg: {
        badge: locale === 'zh' ? '快速分享' : 'Quick Share',
        summary: locale === 'zh'
          ? '文件较小，适合临时预览和即时发送。'
          : 'Smaller file size, suitable for quick previews and fast sharing.'
      },
      json: {
        badge: locale === 'zh' ? '数据备份' : 'Backup Data',
        summary: locale === 'zh'
          ? '用于保存完整编辑数据，方便后续重新导入。'
          : 'Stores full editable data so you can import it again later.'
      }
    }

    return guideMap[format]
  }

  /**
   * 更新导出参数
   * 在调整页边距、分页和纸张时同步约束合法范围，避免导出时再报错。
   */
  const updateExportOptions = (options: Partial<{ margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }>) => {
    if (typeof options.margin === 'number') {
      setMargin(Math.min(25, Math.max(5, options.margin)))
    }

    if (typeof options.showPageBreaks === 'boolean') {
      setShowPageBreaks(options.showPageBreaks)
    }

    if (options.paper) {
      setPaper(options.paper)
    }
  }

  // 格式提示信息
  const formatTips = {
    pdf: locale === 'zh' ? 'PDF 格式最适合打印和投递简历' : 'PDF format is best for printing and submitting resumes',
    png: locale === 'zh' ? 'PNG 格式保留高质量，适合在线展示' : 'PNG format preserves high quality, suitable for online display',
    jpg: locale === 'zh' ? 'JPG 格式文件较小，适合快速分享' : 'JPG format has smaller file size, suitable for quick sharing',
    json: locale === 'zh' ? 'JSON 格式用于备份数据，可以重新导入' : 'JSON format is for data backup and can be re-imported'
  }

  /**
   * 执行导出
   * 在导出前同步当前选项，并将失败信息收敛到站内提示，不再静默失败。
   */
  const handleExport = async () => {
    setIsExporting(true)
    setErrorMessage('')
    try {
      onOptionsChange?.({ margin, showPageBreaks, paper })
      await onExport(selectedFormat)
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      const message = error instanceof Error ? error.message : (locale === 'zh' ? '导出失败，请稍后重试。' : 'Export failed. Please retry later.')
      setErrorMessage(message)
      showError(
        locale === 'zh' ? '导出失败' : 'Export Failed',
        message
      )
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="app-shell-brand-mark h-10 w-10 shrink-0 rounded-xl">
                <Download className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{t.editor.toolbar.exportResume}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.editor.toolbar.selectFormat}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6">
            {/* 文件名预览 */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mb-1 text-sm text-slate-500">{locale === 'zh' ? '文件名' : 'Filename'}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {resumeName || (locale === 'zh' ? '简历' : 'Resume')}.{selectedFormat}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {getFormatGuide(selectedFormat).badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {getFormatGuide(selectedFormat).summary}
              </p>
            </div>

            <div className="mb-6 grid gap-3 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {locale === 'zh' ? '导出工作流' : 'Export Workflow'}
                </p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">
                  {locale === 'zh' ? '先选格式，再确认版式参数' : 'Choose a format, then review layout options'}
                </h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {locale === 'zh'
                    ? '导出会沿用当前模板和编辑内容，页边距、纸张和分页标记可以在这里临时调整。'
                    : 'Export uses the current template and content. Margin, paper size, and page breaks can be adjusted here before export.'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {locale === 'zh' ? '当前格式提示' : 'Current Format Tip'}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatTips[selectedFormat]}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {selectedFormat === 'pdf'
                    ? (locale === 'zh' ? '如果是正式投递，优先使用 PDF。' : 'Use PDF first for formal applications.')
                    : (locale === 'zh' ? '图片和 JSON 更适合展示、分享或备份。' : 'Images and JSON are better for sharing, display, or backup.')}
                </p>
              </div>
            </div>

            {templateFitTitle && templateFitDescription && (
              <div className={`mb-6 rounded-xl border px-4 py-4 ${
                templateFitShouldSuggestSwitch
                  ? 'border-sky-200 bg-sky-50'
                  : 'border-emerald-200 bg-emerald-50'
              }`}>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  templateFitShouldSuggestSwitch ? 'text-sky-700' : 'text-emerald-700'
                }`}>
                  {locale === 'en' ? 'Template Fit' : '模板建议'}
                </p>
                <p className={`mt-2 text-sm font-semibold ${
                  templateFitShouldSuggestSwitch ? 'text-sky-800' : 'text-emerald-800'
                }`}>
                  {templateFitTitle}
                </p>
                <p className={`mt-1 text-sm leading-6 ${
                  templateFitShouldSuggestSwitch ? 'text-sky-700' : 'text-emerald-700'
                }`}>
                  {templateFitDescription}
                </p>
                {templateFitRecommendedLabel || templateFitReasons.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-600">
                    {templateFitRecommendedLabel
                      ? `${locale === 'en' ? 'Recommended: ' : '推荐：'}${templateFitRecommendedLabel}`
                      : templateFitReasons[0]}
                  </p>
                ) : null}
              </div>
            )}

            {/* 格式选择 */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {formats.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setSelectedFormat(format.id)}
                  className={`relative rounded-xl border p-4 text-left transition-colors ${
                    selectedFormat === format.id
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {format.recommended && (
                    <span className="absolute right-3 top-3 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {locale === 'zh' ? '推荐' : 'Recommended'}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl border p-2 ${
                      selectedFormat === format.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}>
                      <format.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-semibold ${selectedFormat === format.id ? 'text-slate-900' : 'text-slate-700'}`}>
                        {format.name}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {format.description}
                      </p>
                    </div>
                    {selectedFormat === format.id && (
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-900">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 导出选项 */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {locale === 'zh' ? '导出参数' : 'Export Options'}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    {locale === 'zh' ? '页边距（mm）' : 'Margin (mm)'}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={25}
                    value={margin}
                    onChange={(e) => updateExportOptions({ margin: parseInt(e.target.value, 10) || 10 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    {locale === 'zh' ? '显示分页标记' : 'Page Breaks'}
                  </label>
                  <button
                    type="button"
                    onClick={() => updateExportOptions({ showPageBreaks: !showPageBreaks })}
                    className={`inline-flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm transition-colors ${
                      showPageBreaks
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{locale === 'zh' ? '导出中显示分页辅助线' : 'Show page guides on export'}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${showPageBreaks ? 'bg-white' : 'bg-slate-300'}`}></span>
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    {locale === 'zh' ? '纸张尺寸' : 'Paper Size'}
                  </label>
                  <select
                    value={paper}
                    onChange={(e) => updateExportOptions({ paper: (e.target.value as 'a4' | 'letter') || 'a4' })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                  >
                    <option value="a4">A4（210×297mm）</option>
                    <option value="letter">Letter（216×279mm）</option>
                  </select>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="app-shell-action-button h-10 rounded-xl px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t.editor.toolbar.exporting}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t.common.confirm}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
