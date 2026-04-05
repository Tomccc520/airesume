/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 简历导出功能组件，支持PDF、PNG、JPG格式导出
 * 使用 html2canvas 和 jsPDF 进行导出，确保导出结果稳定
 */


/**
 * 简历导出功能组件
 * 支持PDF、PNG、JPG格式导出
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, Loader2, CheckCircle, AlertCircle, Image, Camera, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { exportResumeFile } from '@/services/resumeExportService'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  className?: string
  buttonClassName?: string
  panelClassName?: string
  onExport?: (format: 'pdf' | 'png' | 'jpg') => Promise<void>
}

/**
 * 获取快速导出格式说明
 * 将格式标签、推荐场景和提示收敛为统一结构，供快速导出面板复用。
 */
function getQuickExportGuide(format: 'pdf' | 'png' | 'jpg', locale: 'zh' | 'en') {
  const isZh = locale === 'zh'

  const guideMap = {
    pdf: {
      badge: isZh ? '投递优先' : 'Best for Delivery',
      summary: isZh ? '正式投递、打印和发送给招聘方时优先选择。' : 'Use this first for job delivery, printing, and recruiter sharing.'
    },
    png: {
      badge: isZh ? '高清长图' : 'High Fidelity',
      summary: isZh ? '适合长图展示、发社媒或嵌入其他文档中。' : 'Good for long-image previews, social sharing, or embedding into other documents.'
    },
    jpg: {
      badge: isZh ? '轻量分享' : 'Quick Share',
      summary: isZh ? '文件更小，适合即时发送和快速预览。' : 'Smaller file size for quick previews and fast sharing.'
    }
  }

  return guideMap[format]
}

/**
 * 导出按钮组件
 */
export default function ExportButton({
  className = '',
  buttonClassName = '',
  panelClassName = '',
  onExport
}: ExportButtonProps) {
  /**
   * 导出调试日志
   * 仅在开发环境输出，避免生产环境产生噪音日志
   */
  const logExportDebug = useCallback((...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args)
    }
  }, [])

  const { t, locale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<'pdf' | 'png' | 'jpg' | null>(null)
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 清理延时器
   * 防止组件卸载后仍触发状态更新
   */
  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [clearCloseTimer])

  /**
   * 统一处理导出后收尾逻辑
   * 包含状态提示自动关闭与面板收起
   */
  const scheduleClosePanel = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setExportStatus(null)
      setIsOpen(false)
    }, 2000)
  }, [clearCloseTimer])

  /**
   * 默认导出逻辑
   * 通过统一导出服务执行，避免按钮组件重复维护导出细节
   */
  const defaultExport = useCallback(async (format: 'pdf' | 'png' | 'jpg') => {
    const element = document.getElementById('resume-preview')
    if (!element) {
      throw new Error('找不到简历预览元素 #resume-preview')
    }

    logExportDebug('[导出调试] 找到元素:', element)
    logExportDebug('[导出调试] 元素尺寸:', element.getBoundingClientRect())
    logExportDebug('[导出调试] 内容长度:', element.innerHTML.length)
    logExportDebug('[导出调试] 子元素数量:', element.children.length)

    // 检查元素是否真的有内容
    if (element.innerHTML.length === 0) {
      throw new Error('简历预览元素是空的，请先添加简历内容')
    }

    await exportResumeFile({
      format,
      element,
      fileName: `resume.${format}`,
      logger: logExportDebug
    })
  }, [logExportDebug])

  /**
   * 处理导出 - 支持PDF、PNG、JPG格式
   */
  const handleExport = useCallback(async (format: 'pdf' | 'png' | 'jpg') => {
    if (isExporting) return

    logExportDebug('[导出调试] 开始导出:', format)

    setIsExporting(format)
    setExportStatus(null)

    try {
      const exportHandler = onExport ?? defaultExport
      await exportHandler(format)
      setExportStatus({
        type: 'success',
        message: `${format.toUpperCase()} ${t.editor.toolbar.exportSuccess}`
      })
    } catch (error) {
      console.error('[导出错误] Export failed:', error)
      setExportStatus({
        type: 'error',
        message: t.editor.toolbar.exportFailed
      })
    } finally {
      setIsExporting(null)
      scheduleClosePanel()
    }
  }, [isExporting, logExportDebug, onExport, defaultExport, t.editor.toolbar.exportSuccess, t.editor.toolbar.exportFailed, scheduleClosePanel])

  /**
   * 获取导出选项
   */
  const exportOptions = [
    {
      format: 'pdf' as const,
      label: t.editor.toolbar.pdfFormat,
      description: t.editor.toolbar.pdfDesc,
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      format: 'png' as const,
      label: t.editor.toolbar.pngFormat,
      description: t.editor.toolbar.pngDesc,
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      format: 'jpg' as const,
      label: t.editor.toolbar.jpgFormat,
      description: t.editor.toolbar.jpgDesc,
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    }
  ]

  /**
   * 获取状态提示文案
   * 根据当前导出状态返回头部摘要，减少用户对导出进度的不确定感。
   */
  const getExportStatusSummary = () => {
    if (isExporting) {
      return locale === 'zh'
        ? `正在导出 ${isExporting.toUpperCase()}，请稍候...`
        : `Exporting ${isExporting.toUpperCase()}, please wait...`
    }

    if (exportStatus?.type === 'success') {
      return locale === 'zh' ? '导出完成，文件已开始下载。' : 'Export completed and download has started.'
    }

    if (exportStatus?.type === 'error') {
      return locale === 'zh' ? '导出失败，请检查预览内容后重试。' : 'Export failed. Please verify the preview content and retry.'
    }

    return locale === 'zh'
      ? '当前模板与内容会按所选格式直接导出。'
      : 'The current template and content will be exported directly in the chosen format.'
  }

  return (
    <div className={`relative ${className}`}>
      {/* 主按钮 - 调整为更小的尺寸 */}
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className={`gap-1.5 ${buttonClassName}`}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">{t.editor.toolbar.exportResume}</span>
      </Button>

      {/* 导出选项面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              'absolute top-full right-0 z-[100] mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl',
              panelClassName
            )}
          >
            <div className="p-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {locale === 'zh' ? '快速导出' : 'Quick Export'}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {t.editor.toolbar.selectFormat}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {getExportStatusSummary()}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {locale === 'zh' ? '当前模板导出' : 'Current Template'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {exportOptions.map((option) => {
                  const Icon = option.icon
                  const isCurrentlyExporting = isExporting === option.format
                  const guide = getQuickExportGuide(option.format, locale)
                  
                  return (
                    <button
                      key={option.format}
                      type="button"
                      onClick={() => handleExport(option.format)}
                      disabled={isExporting !== null}
                      className={`w-full rounded-xl border bg-white p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isCurrentlyExporting
                          ? 'border-slate-900 ring-1 ring-slate-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl border p-2.5 ${
                          isCurrentlyExporting
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}>
                          {isCurrentlyExporting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Icon className={`h-5 w-5 ${option.color}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium text-slate-900">{option.label}</div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {guide.badge}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{option.description}</div>
                          <div className="mt-2 text-xs leading-5 text-slate-500">
                            {guide.summary}
                          </div>
                        </div>
                        {isCurrentlyExporting && (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {locale === 'zh' ? '导出中' : 'Exporting'}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* 导出状态 */}
              <AnimatePresence>
                {exportStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-3 rounded-xl border px-4 py-3 ${
                      exportStatus.type === 'success' 
                        ? 'border-emerald-200 bg-emerald-50' 
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {exportStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        exportStatus.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {exportStatus.message}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 提示信息 */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Lightbulb className="w-3 h-3" /> {t.editor.toolbar.exportTip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
