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

interface ExportPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'pdf' | 'png' | 'jpg' | 'json' | 'docx') => void | Promise<void>
  resumeName: string
  onOptionsChange?: (options: { margin: number; showPageBreaks: boolean; paper: 'a4' | 'letter' }) => void
}

export default function ExportPreviewDialog({
  isOpen,
  onClose,
  onExport,
  resumeName,
  onOptionsChange
}: ExportPreviewDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'png' | 'jpg' | 'json' | 'docx'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [margin, setMargin] = useState(10)
  const [showPageBreaks, setShowPageBreaks] = useState(true)
  const [paper, setPaper] = useState<'a4' | 'letter'>('a4')

  const formats = [
    {
      id: 'pdf' as const,
      name: 'PDF 文档',
      description: '适合打印和投递',
      icon: FileText,
      color: 'red',
      recommended: true
    },
    {
      id: 'docx' as const,
      name: 'Word 文档',
      description: '可编辑的文档格式',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'png' as const,
      name: 'PNG 图片',
      description: '高质量图片格式',
      icon: Image,
      color: 'green'
    },
    {
      id: 'jpg' as const,
      name: 'JPG 图片',
      description: '压缩图片格式',
      icon: Image,
      color: 'orange'
    },
    {
      id: 'json' as const,
      name: 'JSON 数据',
      description: '用于备份和导入',
      icon: File,
      color: 'purple'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      onOptionsChange?.({ margin, showPageBreaks, paper })
      await onExport(selectedFormat)
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900">导出简历</h3>
              <p className="text-sm text-gray-500 mt-1">选择导出格式</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6">
            {/* 文件名预览 */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">文件名</p>
              <p className="text-lg font-semibold text-gray-900">
                {resumeName || '简历'}.{selectedFormat}
              </p>
            </div>

            {/* 格式选择 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`relative p-4 rounded-xl border transition-all text-left group ${
                    selectedFormat === format.id
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  {format.recommended && (
                    <span className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                      推荐
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedFormat === format.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                    }`}>
                      <format.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-0.5 ${selectedFormat === format.id ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {format.name}
                      </h4>
                      <p className={`text-xs ${selectedFormat === format.id ? 'text-blue-600/80' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {format.description}
                      </p>
                    </div>
                    {selectedFormat === format.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 flex gap-3">
              <div className="text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-blue-600 leading-relaxed">
                <strong className="font-semibold mr-1">提示：</strong>
                {selectedFormat === 'pdf' && ' PDF 格式最适合打印和投递简历'}
                {selectedFormat === 'docx' && ' Word 格式可以进一步编辑和修改'}
                {selectedFormat === 'png' && ' PNG 格式保留高质量，适合在线展示'}
                {selectedFormat === 'jpg' && ' JPG 格式文件较小，适合快速分享'}
                {selectedFormat === 'json' && ' JSON 格式用于备份数据，可以重新导入'}
              </p>
            </div>

            {/* 导出选项 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">页边距（mm）</label>
                <input
                  type="number"
                  min={5}
                  max={25}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">显示分页标记</label>
                <div className="flex items-center gap-3 h-[38px] px-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={showPageBreaks}
                    onChange={(e) => setShowPageBreaks(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-sm text-gray-600">启用</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">纸张尺寸</label>
                <select
                  value={paper}
                  onChange={(e) => setPaper((e.target.value as 'a4' | 'letter') || 'a4')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="a4">A4（210×297mm）</option>
                  <option value="letter">Letter（216×279mm）</option>
                </select>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 font-medium"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  确认导出
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
