/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * 通用加载动画组件
 * 提供多种加载动画样式
 */

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  /**
   * 加载动画类型
   */
  type?: 'spinner' | 'dots' | 'pulse' | 'bars'
  /**
   * 尺寸大小
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 颜色主题
   */
  color?: 'blue' | 'green' | 'purple' | 'gray' | 'white'
  /**
   * 加载文本
   */
  text?: string
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 通用加载动画组件
 */
export default function LoadingSpinner({
  type = 'spinner',
  size = 'md',
  color = 'blue',
  text,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }

  /**
   * 渲染旋转加载器
   */
  const renderSpinner = () => (
    <motion.div
      className={`border-2 border-gray-200 border-t-current rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )

  /**
   * 渲染点状加载器
   */
  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full bg-current ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )

  /**
   * 渲染脉冲加载器
   */
  const renderPulse = () => (
    <motion.div
      className={`rounded-full bg-current ${sizeClasses[size]} ${colorClasses[color]}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  )

  /**
   * 渲染条状加载器
   */
  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`w-1 bg-current ${colorClasses[color]}`}
          animate={{
            height: ['8px', '16px', '8px']
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )

  /**
   * 根据类型渲染对应的加载器
   */
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderLoader()}
      {text && (
        <motion.p
          className={`text-sm ${colorClasses[color]}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

/**
 * 页面级加载组件
 */
interface PageLoadingProps {
  text?: string
}

export function PageLoading({ text = '加载中...' }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/40 flex flex-col items-center">
        <LoadingSpinner type="spinner" size="lg" color="blue" text={text} />
      </div>
    </div>
  )
}

/**
 * 按钮加载组件
 */
interface ButtonLoadingProps {
  text?: string
  size?: 'sm' | 'md'
}

export function ButtonLoading({ text = '处理中...', size = 'sm' }: ButtonLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner type="spinner" size={size} color="white" />
      <span>{text}</span>
    </div>
  )
}