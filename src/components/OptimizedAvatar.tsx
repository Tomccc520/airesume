/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 优化的头像组件 - 使用 Next.js Image 组件
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedAvatarProps {
  src: string
  alt: string
  size: number
  shape?: 'circle' | 'rounded' | 'square'
  border?: boolean
  borderColor?: string
  borderWidth?: number
  className?: string
  priority?: boolean
}

/**
 * 优化的头像组件
 * 自动处理不同类型的图片源（data URL、外部 URL、本地路径）
 */
export default function OptimizedAvatar({
  src,
  alt,
  size,
  shape = 'circle',
  border = false,
  borderColor = '#e5e7eb',
  borderWidth = 2,
  className = '',
  priority = false
}: OptimizedAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // 检测图片类型
  const isDataUrl = src.startsWith('data:')

  // 获取边框半径
  const getBorderRadius = () => {
    switch (shape) {
      case 'circle':
        return '50%'
      case 'rounded':
        return '12px'
      case 'square':
      default:
        return '0'
    }
  }

  // 如果图片加载失败，显示占位符
  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: getBorderRadius(),
          border: border ? `${borderWidth}px solid ${borderColor}` : 'none'
        }}
      >
        <span className="text-white font-bold" style={{ fontSize: `${size / 3}px` }}>
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: getBorderRadius(),
        border: border ? `${borderWidth}px solid ${borderColor}` : 'none'
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        style={{
          width: '100%',
          height: '100%'
        }}
        unoptimized={isDataUrl}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
