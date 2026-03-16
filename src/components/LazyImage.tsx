/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 懒加载图片组件 - 支持模糊占位符
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { generateBlurDataURL } from '@/utils/imageUtils'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

/**
 * 懒加载图片组件
 * 自动添加 loading="lazy" 和模糊占位符
 */
export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  objectFit = 'cover'
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // 检测图片类型
  const isDataUrl = src.startsWith('data:')

  // 如果图片加载失败，显示占位符
  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{
          width: fill ? '100%' : width ? `${width}px` : 'auto',
          height: fill ? '100%' : height ? `${height}px` : 'auto',
        }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  // 生成模糊占位符
  const blurDataURL = !isDataUrl && !priority ? generateBlurDataURL() : undefined

  const imageProps = {
    src,
    alt,
    className: `${className} transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    }`,
    onLoadingComplete: () => setIsLoading(false),
    onError: () => setImageError(true),
    unoptimized: isDataUrl,
    priority,
    quality,
    ...(fill
      ? { fill: true, sizes }
      : { width, height }),
    style: fill ? { objectFit } : undefined,
    ...(blurDataURL && {
      placeholder: 'blur' as const,
      blurDataURL
    })
  }

  return (
    <div className="relative">
      {/* 图片 */}
      <Image {...imageProps} alt={alt} loading={priority ? 'eager' : 'lazy'} />
    </div>
  )
}
