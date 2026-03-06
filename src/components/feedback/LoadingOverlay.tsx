/**
 * @file components/feedback/LoadingOverlay.tsx
 * @description 加载遮罩层组件，支持骨架屏、加载指示器、超时提示和错误显示
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export interface LoadingOverlayProps {
  /** 是否显示 */
  isLoading: boolean
  /** 加载消息 */
  message?: string
  /** 是否显示骨架屏 */
  showSkeleton?: boolean
  /** 超时时间（毫秒），超过后显示提示 */
  timeout?: number
  /** 是否有错误 */
  hasError?: boolean
  /** 错误消息 */
  errorMessage?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 是否全屏 */
  fullScreen?: boolean
  /** 子元素（骨架屏内容） */
  children?: React.ReactNode
}

export function LoadingOverlay({
  isLoading,
  message,
  showSkeleton = false,
  timeout = 2000,
  hasError = false,
  errorMessage,
  onRetry,
  fullScreen = false,
  children
}: LoadingOverlayProps) {
  const { locale } = useLanguage()
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  const t = {
    loading: locale === 'zh' ? '加载中...' : 'Loading...',
    takingLonger: locale === 'zh' ? '加载时间较长，请稍候...' : 'Taking longer than expected...',
    error: locale === 'zh' ? '加载失败' : 'Loading failed',
    retry: locale === 'zh' ? '重试' : 'Retry'
  }

  // 超时提示
  useEffect(() => {
    if (!isLoading) {
      setShowTimeoutMessage(false)
      return
    }

    const timer = setTimeout(() => {
      setShowTimeoutMessage(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [isLoading, timeout])

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10'

  return (
    <AnimatePresence>
      {(isLoading || hasError) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`${containerClass} flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}
        >
          {hasError ? (
            // 错误状态
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {t.error}
                </p>
                {errorMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {errorMessage}
                  </p>
                )}
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.retry}
                </button>
              )}
            </div>
          ) : showSkeleton && children ? (
            // 骨架屏
            <div className="w-full h-full">
              {children}
            </div>
          ) : (
            // 加载指示器
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-200">
                  {message || t.loading}
                </p>
                {showTimeoutMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t.takingLonger}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 骨架屏组件
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

// 预设骨架屏布局
export function CardSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingOverlay
