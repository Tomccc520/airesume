/**
 * @file components/feedback/SaveStatusIndicator.tsx
 * @description 保存状态指示器组件，显示保存状态、最后保存时间、保存历史
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * @requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud,
  CloudOff,
  Check,
  AlertCircle,
  RefreshCw,
  Clock,
  ChevronDown,
  Save,
  Loader2
} from 'lucide-react'

/**
 * 保存状态类型
 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

/**
 * 保存历史记录项
 */
export interface SaveHistoryItem {
  /** 保存时间 */
  timestamp: Date
  /** 是否成功 */
  success: boolean
  /** 错误信息（如果失败） */
  errorMessage?: string
}

/**
 * 保存状态指示器属性
 */
export interface SaveStatusIndicatorProps {
  /** 保存状态 */
  status: SaveStatus
  /** 最后保存时间 */
  lastSavedAt: Date | null
  /** 保存历史记录（最多5条） */
  saveHistory?: SaveHistoryItem[]
  /** 手动保存回调 */
  onManualSave: () => void
  /** 重试回调 */
  onRetry?: () => void
  /** 是否紧凑模式 */
  compact?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 10) {
    return '刚刚'
  } else if (diffSeconds < 60) {
    return `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else {
    return `${diffDays}天前`
  }
}

/**
 * 格式化时间为 HH:mm:ss
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 状态配置
 */
const STATUS_CONFIG: Record<SaveStatus, {
  icon: React.ReactNode
  text: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  saved: {
    icon: <Check size={14} />,
    text: '已保存',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  saving: {
    icon: <Loader2 size={14} className="animate-spin" />,
    text: '保存中...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  unsaved: {
    icon: <Cloud size={14} />,
    text: '有未保存的更改',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  error: {
    icon: <AlertCircle size={14} />,
    text: '保存失败',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
}

/**
 * 保存历史下拉菜单
 */
const SaveHistoryDropdown: React.FC<{
  history: SaveHistoryItem[]
  isOpen: boolean
  onClose: () => void
}> = ({ history, isOpen, onClose }) => {
  if (!isOpen || history.length === 0) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* 下拉菜单 */}
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Clock size={12} />
            保存历史（最近5次）
          </div>
        </div>
        
        <div className="max-h-48 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={index}
              className={`px-3 py-2 flex items-center justify-between text-xs border-b border-gray-50 last:border-0 ${
                item.success ? 'bg-white' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.success ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <AlertCircle size={12} className="text-red-500" />
                )}
                <span className={item.success ? 'text-gray-700' : 'text-red-700'}>
                  {formatTime(item.timestamp)}
                </span>
              </div>
              <span className="text-gray-400">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}

/**
 * 保存状态指示器组件
 * 
 * @description 显示保存状态、最后保存时间、保存历史，支持手动保存和重试
 * 
 * @requirements
 * - 7.1: 在界面显眼位置显示保存状态指示器
 * - 7.2: 数据正在保存时显示"保存中..."状态和动画
 * - 7.3: 保存成功时显示"已保存"状态和最后保存时间
 * - 7.4: 保存失败时显示错误状态和重试按钮
 * - 7.5: 有未保存的更改时显示提示
 * - 7.7: 支持手动触发保存操作
 * - 7.8: 显示保存历史记录（最近5次保存的时间）
 */
export function SaveStatusIndicator({
  status,
  lastSavedAt,
  saveHistory = [],
  onManualSave,
  onRetry,
  compact = false,
  className = ''
}: SaveStatusIndicatorProps) {
  const [showHistory, setShowHistory] = useState(false)
  
  const config = STATUS_CONFIG[status]
  
  // 限制历史记录最多5条
  const limitedHistory = useMemo(() => {
    return saveHistory.slice(0, 5)
  }, [saveHistory])
  
  // 处理手动保存
  const handleManualSave = useCallback(() => {
    if (status !== 'saving') {
      onManualSave()
    }
  }, [status, onManualSave])
  
  // 处理重试
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])
  
  // 切换历史显示
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  if (compact) {
    // 紧凑模式 - 只显示图标和状态
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={status === 'error' ? handleRetry : handleManualSave}
          disabled={status === 'saving'}
          className={`
            flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
            transition-all duration-200
            ${config.bgColor} ${config.color} ${config.borderColor} border
            hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={status === 'error' ? '点击重试' : '点击保存'}
        >
          {config.icon}
          <span className="hidden sm:inline">{config.text}</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
          transition-all duration-200
          ${config.bgColor} ${config.borderColor} border
        `}
      >
        {/* 状态图标和文本 */}
        <div className={`flex items-center gap-1.5 ${config.color}`}>
          {config.icon}
          <span className="font-medium">{config.text}</span>
        </div>
        
        {/* 最后保存时间 */}
        {status === 'saved' && lastSavedAt && (
          <span className="text-gray-400 hidden sm:inline">
            · {formatRelativeTime(lastSavedAt)}
          </span>
        )}
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-1 ml-1">
          {/* 重试按钮（错误状态） */}
          {status === 'error' && onRetry && (
            <button
              onClick={handleRetry}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="重试"
            >
              <RefreshCw size={12} />
            </button>
          )}
          
          {/* 手动保存按钮（非保存中状态） */}
          {status !== 'saving' && (
            <button
              onClick={handleManualSave}
              className={`p-1 ${config.color} hover:bg-white/50 rounded transition-colors`}
              title="手动保存 (Ctrl+S)"
            >
              <Save size={12} />
            </button>
          )}
          
          {/* 历史记录按钮 */}
          {limitedHistory.length > 0 && (
            <button
              onClick={toggleHistory}
              className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded transition-colors ${
                showHistory ? 'bg-white/50' : ''
              }`}
              title="查看保存历史"
            >
              <ChevronDown 
                size={12} 
                className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>
      
      {/* 保存历史下拉菜单 */}
      <AnimatePresence>
        <SaveHistoryDropdown
          history={limitedHistory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </AnimatePresence>
    </div>
  )
}

export default SaveStatusIndicator
