/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger' | 'info'
}

/**
 * 确认对话框组件
 * 符合页面设计规范的自定义对话框
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      confirmButton: 'btn-warning'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      confirmButton: 'btn-error'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-500',
      confirmButton: 'btn-primary'
    }
  }

  const currentStyle = typeStyles[type]
  const IconComponent = currentStyle.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
          >
            {/* 对话框容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full mx-4 border border-gray-200 overflow-hidden shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-md">
                <div className="flex items-center">
                  <div className={`p-2 rounded-xl bg-opacity-10 mr-3 ${currentStyle.iconColor.replace('text-', 'bg-')}`}>
                    <IconComponent className={`h-6 w-6 ${currentStyle.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-black/5 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 内容 */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed font-medium">
                  {message}
                </p>
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200/50 bg-gray-50/80 backdrop-blur-md">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-white rounded-xl transition-all font-medium flex items-center border border-transparent ${
                    type === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : type === 'warning'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}