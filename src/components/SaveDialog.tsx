/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToastContext } from '@/components/Toast'
import { ResumeData } from '@/types/resume'

interface SaveDialogProps {
  /**
   * 是否显示对话框
   */
  isOpen: boolean
  /**
   * 关闭对话框回调
   */
  onClose: () => void
  /**
   * 简历数据
   */
  resumeData: ResumeData
  /**
   * 保存成功回调
   */
  onSaveSuccess?: (filename: string) => void
}

/**
 * 生成默认文件名
 * 根据当前姓名和日期生成更适合导出的初始文件名。
 */
function buildDefaultFilename(resumeData: ResumeData): string {
  const name = resumeData.personalInfo.name || '我的简历'
  const date = new Date().toISOString().split('T')[0]
  return `${name}_${date}`
}

/**
 * 保存对话框组件
 */
export default function SaveDialog({ isOpen, onClose, resumeData, onSaveSuccess }: SaveDialogProps) {
  const [filename, setFilename] = useState(() => buildDefaultFilename(resumeData))
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { error: showError } = useToastContext()

  /**
   * 弹窗打开时重置默认文件名和错误状态
   * 避免上次输入或错误提示残留到下一次保存流程。
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFilename(buildDefaultFilename(resumeData))
    setErrorMessage('')
  }, [isOpen, resumeData])

  /**
   * 处理保存操作
   */
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrorMessage('')
      
      // 确保文件名有效
      const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_').trim()
      if (!sanitizedFilename) {
        throw new Error('请输入有效的文件名')
      }
      
      const finalFilename = sanitizedFilename.endsWith('.json') 
        ? sanitizedFilename 
        : `${sanitizedFilename}.json`
      
      // 创建包含元数据的完整数据结构
      const fileData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        resumeData: resumeData,
        metadata: {
          appName: '简历助手',
          description: '此文件包含您的简历数据，可以重新导入到简历助手中继续编辑',
          originalFilename: finalFilename
        }
      }
      
      // 转换为JSON字符串
      const jsonString = JSON.stringify(fileData, null, 2)
      
      // 创建Blob对象
      const blob = new Blob([jsonString], { type: 'application/json' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = finalFilename
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      onSaveSuccess?.(finalFilename)
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      setErrorMessage(message)
      showError('保存失败', message)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 处理文件名输入
   */
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value)
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* 对话框头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="app-shell-brand-mark h-10 w-10 shrink-0 rounded-xl">
                <Save className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">保存简历</h3>
                <p className="text-sm text-slate-500">将当前简历导出为本地 JSON 文件</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 对话框内容 */}
          <div className="p-6 space-y-4">
            {/* 文件名输入 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                文件名
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={handleFilenameChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-900 transition-colors focus:border-slate-900 focus:outline-none"
                  placeholder="请输入文件名"
                />
                <div className="absolute right-4 top-3 text-sm font-medium text-slate-400">
                  .json
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                文件将保存到浏览器默认下载目录，可重新导入到编辑器继续修改。
              </p>
            </div>

            {/* 保存信息 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600" />
                <div className="text-sm">
                  <p className="mb-1 font-semibold text-slate-900">关于数据保存</p>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• 您的简历数据完全保存在本地，不会上传到服务器</li>
                    <li>• 保存的JSON文件可以重新导入继续编辑</li>
                    <li>• 建议定期备份重要的简历数据</li>
                  </ul>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
          </div>

          {/* 对话框底部 */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
              className="app-shell-action-button h-10 rounded-xl px-4 text-sm"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !filename.trim()}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>保存到本地</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
