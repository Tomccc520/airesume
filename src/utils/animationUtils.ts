/**
 * @file utils/animationUtils.ts
 * @description 动画工具函数，支持动画配置、预设和低性能适配
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

// 动画时长范围常量
export const ANIMATION_DURATION = {
  MIN: 150,
  MAX: 300,
  DEFAULT: 200
} as const

// 动画配置接口
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled: boolean
  /** 是否尊重系统减少动画偏好 */
  respectReducedMotion: boolean
  /** 动画时长倍数 */
  durationMultiplier: number
}

// 默认动画配置
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enabled: true,
  respectReducedMotion: true,
  durationMultiplier: 1
}

// 动画预设类型
export interface AnimationPreset {
  initial: Record<string, number | string>
  animate: Record<string, number | string>
  exit: Record<string, number | string>
  transition: {
    duration: number
    ease?: string | readonly number[] | number[]
  }
}

// 预设动画
export const ANIMATION_PRESETS = {
  /** 淡入淡出 */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  /** 从上滑入 */
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  /** 从下滑入 */
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  /** 从左滑入 */
  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  /** 从右滑入 */
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  /** 缩放 */
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.15 }
  },
  
  /** 弹出 */
  pop: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }
  },
  
  /** 高度展开 */
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.25 }
  }
} as const

export type AnimationPresetName = keyof typeof ANIMATION_PRESETS

/**
 * 检测是否为低性能设备
 */
export function isLowPerformanceDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检查设备内存（如果可用）
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (nav.deviceMemory && nav.deviceMemory < 4) {
    return true
  }
  
  // 检查硬件并发数
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true
  }
  
  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  
  // 移动设备且屏幕较小可能是低性能设备
  if (isMobile && window.innerWidth < 768) {
    return true
  }
  
  return false
}

/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 获取有效的动画时长
 * @param baseDuration 基础时长（毫秒）
 * @param config 动画配置
 * @returns 有效时长（毫秒）
 */
export function getEffectiveDuration(
  baseDuration: number,
  config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
): number {
  // 如果禁用动画，返回 0
  if (!config.enabled) return 0
  
  // 如果尊重系统偏好且用户偏好减少动画，返回 0
  if (config.respectReducedMotion && prefersReducedMotion()) return 0
  
  // 应用时长倍数
  let duration = baseDuration * config.durationMultiplier
  
  // 确保在有效范围内
  duration = Math.max(ANIMATION_DURATION.MIN, Math.min(ANIMATION_DURATION.MAX, duration))
  
  return duration
}

/**
 * 获取动画预设（应用配置）
 * @param presetName 预设名称
 * @param config 动画配置
 * @returns 应用配置后的动画预设
 */
export function getAnimationPreset(
  presetName: AnimationPresetName,
  config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
): AnimationPreset {
  const preset = ANIMATION_PRESETS[presetName]
  
  // 如果禁用动画，返回无动画版本
  if (!config.enabled || (config.respectReducedMotion && prefersReducedMotion())) {
    return {
      initial: preset.animate, // 直接显示最终状态
      animate: preset.animate,
      exit: preset.animate,
      transition: { duration: 0 }
    }
  }
  
  // 应用时长倍数
  const duration = preset.transition.duration * config.durationMultiplier
  const clampedDuration = Math.max(
    ANIMATION_DURATION.MIN / 1000,
    Math.min(ANIMATION_DURATION.MAX / 1000, duration)
  )
  
  return {
    ...preset,
    transition: {
      ...preset.transition,
      duration: clampedDuration
    }
  }
}

/**
 * 创建简化的动画配置（用于低性能设备）
 */
export function getSimplifiedAnimationConfig(): AnimationConfig {
  return {
    enabled: true,
    respectReducedMotion: true,
    durationMultiplier: 0.5 // 减半动画时长
  }
}

/**
 * 创建禁用动画的配置
 */
export function getDisabledAnimationConfig(): AnimationConfig {
  return {
    enabled: false,
    respectReducedMotion: true,
    durationMultiplier: 0
  }
}

/**
 * 验证动画时长是否在有效范围内
 * @param duration 时长（毫秒）
 * @returns 是否有效
 */
export function isValidAnimationDuration(duration: number): boolean {
  return duration >= ANIMATION_DURATION.MIN && duration <= ANIMATION_DURATION.MAX
}

/**
 * 钳制动画时长到有效范围
 * @param duration 时长（毫秒）
 * @returns 钳制后的时长
 */
export function clampAnimationDuration(duration: number): number {
  return Math.max(ANIMATION_DURATION.MIN, Math.min(ANIMATION_DURATION.MAX, duration))
}
