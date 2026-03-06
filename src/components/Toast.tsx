/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

/**
 * Toast 通知组件
 * 用于显示成功、错误、警告等消息
 */

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

// 不同类型的默认持续时间
export const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,  // 成功提示 3 秒后自动关闭
  info: 4000,     // 信息提示 4 秒后自动关闭
  warning: 5000,  // 警告提示 5 秒后自动关闭
  error: 0        // 错误提示不自动关闭，需手动关闭
}

export interface ToastProps {
  /**
   * 唯一标识符
   */
  id: string
  /**
   * 通知类型
   */
  type: ToastType
  /**
   * 标题
   */
  title: string
  /**
   * 描述信息
   */
  description?: string
  /**
   * 自动关闭时间（毫秒），0表示不自动关闭
   * 如果不指定，将使用类型对应的默认值
   */
  duration?: number
  /**
   * 是否可手动关闭
   */
  closable?: boolean
  /**
   * 关闭回调
   */
  onClose?: (id: string) => void
  /**
   * 点击回调
   */
  onClick?: () => void
  /**
   * 创建时间戳（用于排序）
   */
  createdAt?: number
}

/**
 * 单个Toast组件
 */
export function Toast({
  id,
  type,
  title,
  description,
  duration,
  closable = true,
  onClose,
  onClick
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  // 使用类型对应的默认持续时间
  const effectiveDuration = duration !== undefined ? duration : DEFAULT_DURATIONS[type]

  /**
   * 处理Toast关闭
   * @copyright Tomda (https://www.tomda.top)
   * @copyright UIED技术团队 (https://fsuied.com)
   * @author UIED技术团队
   * @createDate 2025-9-22
   */
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 300) // 等待动画完成
  }, [id, onClose])

  useEffect(() => {
    if (effectiveDuration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, effectiveDuration)

      return () => clearTimeout(timer)
    }
  }, [effectiveDuration, handleClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          description: 'text-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          description: 'text-yellow-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          description: 'text-blue-700'
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          description: 'text-gray-700'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            relative w-full max-w-sm p-4 border rounded-lg shadow-lg cursor-pointer
            ${colors.bg}
            ${onClick ? 'hover:shadow-xl transition-shadow' : ''}
          `}
          onClick={onClick}
        >
          <div className="flex items-start space-x-3">
            {/* 图标 */}
            <div className={`flex-shrink-0 ${colors.icon}`}>
              {getIcon()}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${colors.title}`}>
                {title}
              </h4>
              {description && (
                <p className={`mt-1 text-sm ${colors.description}`}>
                  {description}
                </p>
              )}
            </div>

            {/* 关闭按钮 */}
            {closable && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className={`
                  flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors
                  ${colors.icon}
                `}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 进度条 */}
          {effectiveDuration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: effectiveDuration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Toast容器组件
 */
interface ToastContainerProps {
  /**
   * Toast列表
   */
  toasts: ToastProps[]
  /**
   * 位置
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /**
   * 移除Toast回调
   */
  onRemove: (id: string) => void
}

export function ToastContainer({
  toasts,
  position = 'top-right',
  onRemove
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Toast Hook
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11)
    const newToast: ToastProps = {
      ...toast,
      id,
      createdAt: Date.now()
    }
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  // 便捷方法
  const success = (title: string, description?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'success', title, description, ...options })
  }

  const error = (title: string, description?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'error', title, description, ...options })
  }

  const warning = (title: string, description?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'warning', title, description, ...options })
  }

  const info = (title: string, description?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'info', title, description, ...options })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}

/**
 * Toast Provider Context
 */
import { createContext, useContext } from 'react'

interface ToastContextType {
  success: (title: string, description?: string, options?: Partial<ToastProps>) => string
  error: (title: string, description?: string, options?: Partial<ToastProps>) => string
  warning: (title: string, description?: string, options?: Partial<ToastProps>) => string
  info: (title: string, description?: string, options?: Partial<ToastProps>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast()

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        toasts={toast.toasts}
        onRemove={toast.removeToast}
      />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
