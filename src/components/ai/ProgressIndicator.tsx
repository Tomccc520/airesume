/**
 * Progress Indicator Component
 * 进度指示器组件 - 显示 AI 操作进度
 * 
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-01-16
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export type ProgressStatus = 'loading' | 'success' | 'error' | 'warning'

interface ProgressIndicatorProps {
  /** 进度百分比 (0-100) */
  progress: number
  /** 当前状态 */
  status: ProgressStatus
  /** 显示的消息 */
  message?: string
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 变体样式 */
  variant?: 'linear' | 'circular'
  /** 自定义类名 */
  className?: string
}

/**
 * 进度指示器组件
 * 支持线性和圆形两种样式，以及多种状态显示
 */
export function ProgressIndicator({
  progress,
  status,
  message,
  showPercentage = true,
  size = 'md',
  variant = 'linear',
  className = ''
}: ProgressIndicatorProps) {
  // 确保进度值在有效范围内
  const normalizedProgress = Math.min(100, Math.max(0, progress))

  // 根据状态获取配置
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'success':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          progressColor: 'bg-green-500',
          strokeColor: '#22c55e',
          Icon: CheckCircle
        }
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
          strokeColor: '#ef4444',
          Icon: XCircle
        }
      case 'warning':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          progressColor: 'bg-yellow-500',
          strokeColor: '#eab308',
          Icon: AlertCircle
        }
      case 'loading':
      default:
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          progressColor: 'bg-blue-500',
          strokeColor: '#3b82f6',
          Icon: Loader2
        }
    }
  }, [status])

  // 尺寸配置
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          height: 'h-1.5',
          circleSize: 48,
          strokeWidth: 4,
          iconSize: 'w-4 h-4',
          textSize: 'text-xs',
          messageSize: 'text-xs'
        }
      case 'lg':
        return {
          height: 'h-3',
          circleSize: 80,
          strokeWidth: 6,
          iconSize: 'w-6 h-6',
          textSize: 'text-lg',
          messageSize: 'text-base'
        }
      case 'md':
      default:
        return {
          height: 'h-2',
          circleSize: 64,
          strokeWidth: 5,
          iconSize: 'w-5 h-5',
          textSize: 'text-sm',
          messageSize: 'text-sm'
        }
    }
  }, [size])

  const { Icon } = statusConfig

  // 圆形进度条
  if (variant === 'circular') {
    const { circleSize, strokeWidth } = sizeConfig
    const radius = (circleSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference

    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="relative" style={{ width: circleSize, height: circleSize }}>
          {/* 背景圆环 */}
          <svg
            className="transform -rotate-90"
            width={circleSize}
            height={circleSize}
          >
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* 进度圆环 */}
            <motion.circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke={statusConfig.strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          
          {/* 中心内容 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === 'loading' ? (
              showPercentage ? (
                <span className={`font-semibold ${statusConfig.color} ${sizeConfig.textSize}`}>
                  {Math.round(normalizedProgress)}%
                </span>
              ) : (
                <Loader2 className={`${sizeConfig.iconSize} ${statusConfig.color} animate-spin`} />
              )
            ) : (
              <Icon className={`${sizeConfig.iconSize} ${statusConfig.color}`} />
            )}
          </div>
        </div>
        
        {/* 消息 */}
        {message && (
          <span className={`${sizeConfig.messageSize} ${statusConfig.color} text-center`}>
            {message}
          </span>
        )}
      </div>
    )
  }

  // 线性进度条
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <Loader2 className={`${sizeConfig.iconSize} ${statusConfig.color} animate-spin`} />
          ) : (
            <Icon className={`${sizeConfig.iconSize} ${statusConfig.color}`} />
          )}
          {message && (
            <span className={`${sizeConfig.messageSize} ${statusConfig.color}`}>
              {message}
            </span>
          )}
        </div>
        {showPercentage && (
          <span className={`${sizeConfig.textSize} font-medium ${statusConfig.color}`}>
            {Math.round(normalizedProgress)}%
          </span>
        )}
      </div>
      
      {/* 进度条 */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeConfig.height}`}>
        <motion.div
          className={`${sizeConfig.height} ${statusConfig.progressColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default ProgressIndicator
