/**
 * @file components/feedback/ConfirmDialog.tsx
 * @description 增强版确认对话框组件，支持危险操作警告样式和撤销按钮
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Info, AlertCircle, Undo2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export interface ConfirmDialogProps {
  /** 是否打开 */
  isOpen: boolean
  /** 标题 */
  title: string
  /** 消息内容 */
  message: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认回调 */
  onConfirm: () => void
  /** 取消回调 */
  onCancel: () => void
  /** 对话框类型 */
  type?: 'warning' | 'danger' | 'info'
  /** 是否显示撤销按钮 */
  showUndo?: boolean
  /** 撤销回调 */
  onUndo?: () => void
  /** 撤销按钮文本 */
  undoText?: string
  /** 是否禁用确认按钮 */
  confirmDisabled?: boolean
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning',
  showUndo = false,
  onUndo,
  undoText,
  confirmDisabled = false,
  confirmLoading = false
}: ConfirmDialogProps) {
  const { locale } = useLanguage()

  const t = {
    confirm: locale === 'zh' ? '确定' : 'Confirm',
    cancel: locale === 'zh' ? '取消' : 'Cancel',
    undo: locale === 'zh' ? '撤销' : 'Undo'
  }

  // 键盘事件处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Enter' && !confirmDisabled && !confirmLoading) {
      onConfirm()
    }
  }, [onCancel, onConfirm, confirmDisabled, confirmLoading])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'border-amber-200 bg-amber-50',
      iconColor: 'text-amber-600',
      confirmBg: 'bg-amber-500 hover:bg-amber-600'
    },
    danger: {
      icon: AlertCircle,
      iconBg: 'border-rose-200 bg-rose-50',
      iconColor: 'text-rose-600',
      confirmBg: 'bg-rose-500 hover:bg-rose-600'
    },
    info: {
      icon: Info,
      iconBg: 'border-sky-200 bg-sky-50',
      iconColor: 'text-sky-600',
      confirmBg: 'bg-slate-900 hover:bg-slate-800'
    }
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

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
            {/* 对话框 */}
            <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                  <div className={`rounded-xl border p-2 ${config.iconBg}`}>
                    <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                  </div>
                  <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
                    {title}
                  </h3>
              </div>
                <button
                  onClick={onCancel}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 内容 */}
              <div className="px-6 py-5">
                <p className="leading-relaxed text-slate-600">
                  {message}
                </p>
              </div>

              {/* 底部按钮 */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                {/* 撤销按钮 */}
                <div>
                  {showUndo && onUndo && (
                    <button
                      onClick={onUndo}
                      className="app-shell-action-button h-10 rounded-xl px-3 text-sm"
                    >
                      <Undo2 className="w-4 h-4" />
                      {undoText || t.undo}
                    </button>
                  )}
                </div>

                {/* 确认/取消按钮 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onCancel}
                    className="app-shell-action-button h-10 rounded-xl px-4 text-sm"
                  >
                    {cancelText || t.cancel}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={confirmDisabled || confirmLoading}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition-colors ${config.confirmBg} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {confirmLoading && (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {confirmText || t.confirm}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
