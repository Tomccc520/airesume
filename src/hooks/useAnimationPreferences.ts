/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * 动画偏好设置 Hook
 * 检测用户的动画偏好和设备性能，优化动画体验
 * Requirements: 1.6
 */

'use client'

import { useState, useEffect, useMemo } from 'react'

export interface AnimationPreferences {
  /** 是否应该减少动画 */
  shouldReduceMotion: boolean
  /** 是否是低端设备 */
  isLowEndDevice: boolean
  /** 是否应该禁用复杂动画 */
  shouldDisableComplexAnimations: boolean
  /** 推荐的动画持续时间倍数 (0-1) */
  durationMultiplier: number
  /** 是否支持 GPU 加速 */
  supportsGPUAcceleration: boolean
}

interface NavigatorConnectionLike {
  effectiveType?: string
}

interface NavigatorWithPerformanceHints extends Navigator {
  deviceMemory?: number
  connection?: NavigatorConnectionLike
}

interface AnimationVariantLike {
  transition?: {
    duration?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * 检测设备是否为低端设备
 * 基于硬件并发数、内存和连接类型判断
 */
function detectLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  const navigatorWithHints = navigator as NavigatorWithPerformanceHints

  // 检查硬件并发数（CPU 核心数）
  const hardwareConcurrency = navigatorWithHints.hardwareConcurrency || 4
  const isLowCPU = hardwareConcurrency <= 2

  // 检查设备内存（如果可用）
  const deviceMemory = navigatorWithHints.deviceMemory || 4
  const isLowMemory = deviceMemory <= 2

  // 检查网络连接类型（如果可用）
  const connection = navigatorWithHints.connection
  const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g'

  // 检查是否是移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // 综合判断
  return (isLowCPU && isLowMemory) || (isMobile && isLowMemory) || isSlowConnection
}

/**
 * 检测是否支持 GPU 加速
 */
function detectGPUAcceleration(): boolean {
  if (typeof window === 'undefined') return true

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

/**
 * 动画偏好设置 Hook
 * 
 * 功能：
 * - 检测 prefers-reduced-motion 媒体查询
 * - 检测设备性能（CPU、内存、网络）
 * - 提供动画优化建议
 * - 支持动态更新
 * 
 * @returns 动画偏好设置对象
 * 
 * @example
 * ```tsx
 * const { shouldReduceMotion, shouldDisableComplexAnimations, durationMultiplier } = useAnimationPreferences()
 * 
 * // 根据偏好调整动画
 * const animationDuration = shouldReduceMotion ? 0 : 0.3 * durationMultiplier
 * ```
 */
export function useAnimationPreferences(): AnimationPreferences {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [supportsGPUAcceleration, setSupportsGPUAcceleration] = useState(true)

  // 检测 prefers-reduced-motion 媒体查询
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // 监听变化
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // 检测设备性能
  useEffect(() => {
    setIsLowEndDevice(detectLowEndDevice())
    setSupportsGPUAcceleration(detectGPUAcceleration())
  }, [])

  // 计算是否应该减少动画
  const shouldReduceMotion = useMemo(() => {
    return prefersReducedMotion || isLowEndDevice
  }, [prefersReducedMotion, isLowEndDevice])

  // 计算是否应该禁用复杂动画
  const shouldDisableComplexAnimations = useMemo(() => {
    return prefersReducedMotion || (isLowEndDevice && !supportsGPUAcceleration)
  }, [prefersReducedMotion, isLowEndDevice, supportsGPUAcceleration])

  // 计算动画持续时间倍数
  const durationMultiplier = useMemo(() => {
    if (prefersReducedMotion) return 0
    if (isLowEndDevice && !supportsGPUAcceleration) return 0.3
    if (isLowEndDevice) return 0.5
    return 1
  }, [prefersReducedMotion, isLowEndDevice, supportsGPUAcceleration])

  return {
    shouldReduceMotion,
    isLowEndDevice,
    shouldDisableComplexAnimations,
    durationMultiplier,
    supportsGPUAcceleration
  }
}

/**
 * 获取优化的动画配置
 * 根据动画偏好返回适合的动画参数
 * 
 * @param preferences - 动画偏好设置
 * @param baseConfig - 基础动画配置
 * @returns 优化后的动画配置
 */
export function getOptimizedAnimationConfig(
  preferences: AnimationPreferences,
  baseConfig: {
    duration?: number
    delay?: number
    ease?: string | number[]
  } = {}
) {
  const { duration = 0.3, delay = 0, ease = 'easeOut' } = baseConfig
  const { shouldReduceMotion, durationMultiplier } = preferences

  if (shouldReduceMotion) {
    return {
      duration: 0,
      delay: 0,
      ease: 'linear'
    }
  }

  return {
    duration: duration * durationMultiplier,
    delay: delay * durationMultiplier,
    ease
  }
}

/**
 * CSS transform 优化工具
 * 使用 transform 和 opacity 替代 layout 属性动画
 */
export const optimizedTransforms = {
  /** 使用 transform: translateY 替代 top/bottom */
  translateY: (value: number | string) => `translateY(${typeof value === 'number' ? `${value}px` : value})`,
  
  /** 使用 transform: translateX 替代 left/right */
  translateX: (value: number | string) => `translateX(${typeof value === 'number' ? `${value}px` : value})`,
  
  /** 使用 transform: scale 替代 width/height 动画 */
  scale: (value: number) => `scale(${value})`,
  
  /** 组合多个 transform */
  combine: (...transforms: string[]) => transforms.join(' '),
  
  /** GPU 加速的 transform 属性 */
  gpuAccelerated: {
    transform: 'translateZ(0)',
    willChange: 'transform, opacity'
  }
}

/**
 * 优化的 Framer Motion 变体生成器
 * 根据动画偏好生成适合的动画变体
 */
export function createOptimizedVariants(
  preferences: AnimationPreferences,
  variants: {
    hidden: AnimationVariantLike
    visible: AnimationVariantLike
  }
) {
  const { shouldReduceMotion, durationMultiplier } = preferences

  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.1 }
      }
    }
  }

  // 优化变体，使用 transform 替代 layout 属性
  const optimizedHidden = { ...variants.hidden }
  const optimizedVisible = { ...variants.visible }

  // 将 top/left/right/bottom 转换为 transform
  if ('y' in optimizedHidden || 'x' in optimizedHidden) {
    // 已经使用了 transform，保持不变
  }

  // 调整动画时长
  if (optimizedVisible.transition) {
    optimizedVisible.transition = {
      ...optimizedVisible.transition,
      duration: (optimizedVisible.transition.duration || 0.3) * durationMultiplier
    }
  }

  return {
    hidden: optimizedHidden,
    visible: optimizedVisible
  }
}

export default useAnimationPreferences
