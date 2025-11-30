/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { useEffect, useState } from 'react'
import { Bot, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel?: () => void
  title?: string
  message?: string
  type?: 'loading' | 'success' | 'error'
  progress?: number
  showProgress?: boolean
  allowCancel?: boolean
}

/**
 * 优化的加载模态框组件
 * 提供更好的用户体验，支持取消操作和现代化设计
 */
export default function LoadingModal({
  isOpen,
  onClose,
  onCancel,
  title = 'AI生成中',
  message = '正在为您生成简历内容，请稍候...',
  type = 'loading',
  progress = 0,
  showProgress = false,
  allowCancel = true
}: LoadingModalProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // 平滑进度条动画
  useEffect(() => {
    if (showProgress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [progress, showProgress])

  const getIcon = () => {
    switch (type) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-blue-600" />
          </motion.div>
        )
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
        )
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </motion.div>
        )
      default:
        return <Bot className="w-10 h-10 text-blue-600" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'loading':
        return title
      case 'success':
        return '生成完成'
      case 'error':
        return '生成失败'
      default:
        return title
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
          onClick={(e) => e.target === e.currentTarget && type !== 'loading' && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl shadow-blue-900/20 p-8 max-w-md w-full mx-4 relative"
          >
            {/* 关闭按钮 - 只在非加载状态显示 */}
            {type !== 'loading' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* 内容区域 */}
            <div className="text-center">
              {/* 图标 */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-white/50 border border-white/60 shadow-inner">
                  {getIcon()}
                </div>
              </div>

              {/* 标题 */}
              <motion.h3
                key={getTitle()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 mb-3"
              >
                {getTitle()}
              </motion.h3>

              {/* 消息 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mb-8 leading-relaxed font-medium"
              >
                {message}
              </motion.p>

              {/* 进度条 */}
              {showProgress && type === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                    <span>进度</span>
                    <span>{Math.round(animatedProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full shadow-lg shadow-blue-500/30"
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* 现代化加载动画 */}
              {type === 'loading' && !showProgress && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center space-x-2 mb-8"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-blue-600 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-4 justify-center">
                {type === 'loading' && allowCancel && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleCancel}
                    className="px-8 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm"
                  >
                    取消
                  </motion.button>
                )}
                
                {type !== 'loading' && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={onClose}
                    className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                      type === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40'
                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40'
                    }`}
                  >
                    {type === 'success' ? '确定' : '重试'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
