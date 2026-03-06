/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * 保存对话框组件
 * 让用户自定义文件名和选择保存选项
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
 * 保存对话框组件
 */
export default function SaveDialog({ isOpen, onClose, resumeData, onSaveSuccess }: SaveDialogProps) {
  const [filename, setFilename] = useState(() => {
    const name = resumeData.personalInfo.name || '我的简历'
    const date = new Date().toISOString().split('T')[0]
    return `${name}_${date}`
  })
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 处理保存操作
   */
  const handleSave = async () => {
    try {
      setIsSaving(true)
      
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
      console.error('保存失败:', error)
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 处理文件名输入
   */
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20 max-w-md w-full border border-white/20 overflow-hidden"
        >
          {/* 对话框头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100/80 rounded-xl shadow-sm">
                <Save className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">保存简历</h3>
                <p className="text-sm text-gray-600 font-medium">将简历数据保存到本地文件</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 对话框内容 */}
          <div className="p-6 space-y-4">
            {/* 文件名输入 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                文件名
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={handleFilenameChange}
                  className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12 text-gray-900 placeholder-gray-400"
                  placeholder="请输入文件名"
                />
                <div className="absolute right-3 top-2.5 text-sm text-gray-500 font-medium">
                  .json
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 font-medium ml-1">
                文件将保存到您的默认下载文件夹
              </p>
            </div>

            {/* 保存信息 */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-bold mb-1">关于数据安全</p>
                  <ul className="text-blue-700/90 space-y-1.5 font-medium">
                    <li>• 您的简历数据完全保存在本地，不会上传到服务器</li>
                    <li>• 保存的JSON文件可以重新导入继续编辑</li>
                    <li>• 建议定期备份重要的简历数据</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 对话框底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200/50 bg-gray-50/50 backdrop-blur-sm">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !filename.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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