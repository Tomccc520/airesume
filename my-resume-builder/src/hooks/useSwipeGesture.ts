/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-01
 */

import { useCallback, useRef, useState } from 'react'

interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  deltaX: number
  deltaY: number
  duration: number
  angle: number
}

interface SwipeCallbacks {
  onSwipeLeft?: (event: SwipeEvent) => void
  onSwipeRight?: (event: SwipeEvent) => void
  onSwipeUp?: (event: SwipeEvent) => void
  onSwipeDown?: (event: SwipeEvent) => void
  onSwipe?: (event: SwipeEvent) => void
  onSwipeStart?: (x: number, y: number) => void
  onSwipeMove?: (x: number, y: number, deltaX: number, deltaY: number) => void
  onSwipeEnd?: () => void
  onSwipeCancel?: () => void
  onSwipeAbort?: (reason: 'timeout' | 'threshold' | 'disabled' | 'direction') => void
}

interface SwipeOptions {
  minSwipeDistance?: number
  minSwipeVelocity?: number
  maxSwipeTime?: number
  preventDefault?: boolean
  stopPropagation?: boolean
  allowedDirections?: Array<'left' | 'right' | 'up' | 'down'>
  angleTolerance?: number
  axisLock?: boolean
  minHorizontalDistance?: number
  minVerticalDistance?: number
  disabled?: boolean
  usePointerEvents?: boolean
  preventDefaultOnMoveWhenAxisLocked?: boolean
}

interface TouchData {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  lockedAxis: 'horizontal' | 'vertical' | null
}

/**
 * 触摸滑动手势检测 Hook
 * @param callbacks - 滑动事件回调函数
 * @param options - 配置选项
 * @returns 触摸事件处理器
 */
/**
 * 触摸/指针滑动手势检测 Hook
 * 支持取消事件、角度容差与轴锁定，统一触摸与指针事件
 * @param callbacks - 滑动事件回调函数
 * @param options - 配置选项
 * @returns 触摸/指针事件处理器与状态
 */
export function useSwipeGesture(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    minSwipeDistance = 50,
    minSwipeVelocity = 0.3,
    maxSwipeTime = 1000,
    preventDefault = false,
    stopPropagation = false,
    allowedDirections = ['left', 'right', 'up', 'down'],
    angleTolerance = 25,
    axisLock = true,
    minHorizontalDistance,
    minVerticalDistance,
    disabled = false,
    usePointerEvents = true,
    preventDefaultOnMoveWhenAxisLocked = true
  } = options

  const touchDataRef = useRef<TouchData | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const start = useCallback((x: number, y: number) => {
    touchDataRef.current = {
      startX: x,
      startY: y,
      startTime: Date.now(),
      currentX: x,
      currentY: y,
      lockedAxis: null
    }
    callbacks.onSwipeStart?.(x, y)
    setIsSwiping(true)
  }, [callbacks])

  const move = useCallback((x: number, y: number) => {
    const touchData = touchDataRef.current
    if (!touchData) return
    touchData.currentX = x
    touchData.currentY = y

    const deltaX = x - touchData.startX
    const deltaY = y - touchData.startY

    // 轴锁定：首次超过一定位移后按角度锁定水平或垂直
    if (axisLock && touchData.lockedAxis === null) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (distance >= 10) {
        const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI)
        const isHorizontal = angle <= angleTolerance || angle >= (180 - angleTolerance)
        const isVertical = Math.abs(angle - 90) <= angleTolerance
        if (isHorizontal) touchData.lockedAxis = 'horizontal'
        else if (isVertical) touchData.lockedAxis = 'vertical'
      }
    }

    callbacks.onSwipeMove?.(x, y, deltaX, deltaY)
  }, [callbacks, axisLock, angleTolerance])

  const finish = useCallback(() => {
    const touchData = touchDataRef.current
    if (!touchData) return

    const deltaX = touchData.currentX - touchData.startX
    const deltaY = touchData.currentY - touchData.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = Date.now() - touchData.startTime
    const velocity = distance / duration

    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI)
    const isHorizontal = angle <= angleTolerance || angle >= (180 - angleTolerance)
    const isVertical = Math.abs(angle - 90) <= angleTolerance

    const hMin = minHorizontalDistance ?? minSwipeDistance
    const vMin = minVerticalDistance ?? minSwipeDistance

    let direction: 'left' | 'right' | 'up' | 'down' | null = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (isHorizontal && Math.abs(deltaX) >= hMin) {
        direction = deltaX > 0 ? 'right' : 'left'
      }
    } else {
      if (isVertical && Math.abs(deltaY) >= vMin) {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }

    const meetsVelocity = velocity >= minSwipeVelocity
    const meetsTime = duration <= maxSwipeTime

    if (direction && meetsVelocity && meetsTime && allowedDirections.includes(direction)) {
      const swipeEvent: SwipeEvent = {
        direction,
        distance,
        velocity,
        deltaX,
        deltaY,
        duration,
        angle
      }
      switch (direction) {
        case 'left':
          callbacks.onSwipeLeft?.(swipeEvent)
          break
        case 'right':
          callbacks.onSwipeRight?.(swipeEvent)
          break
        case 'up':
          callbacks.onSwipeUp?.(swipeEvent)
          break
        case 'down':
          callbacks.onSwipeDown?.(swipeEvent)
          break
      }
      callbacks.onSwipe?.(swipeEvent)
    } else {
      let reason: 'timeout' | 'threshold' | 'disabled' | 'direction' = 'threshold'
      if (!meetsTime) reason = 'timeout'
      else if (!direction) reason = 'direction'
      callbacks.onSwipeAbort?.(reason)
    }

    callbacks.onSwipeEnd?.()
    touchDataRef.current = null
    setIsSwiping(false)
  }, [callbacks, minSwipeDistance, minSwipeVelocity, maxSwipeTime, allowedDirections, angleTolerance, minHorizontalDistance, minVerticalDistance])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) {
      callbacks.onSwipeAbort?.('disabled')
      return
    }
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    const touch = e.touches[0]
    start(touch.clientX, touch.clientY)
  }, [callbacks, preventDefault, stopPropagation, start, disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchDataRef.current) return
    const touch = e.touches[0]
    const lockedAxis = touchDataRef.current.lockedAxis
    if (preventDefaultOnMoveWhenAxisLocked && lockedAxis) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    move(touch.clientX, touch.clientY)
  }, [move, stopPropagation, preventDefaultOnMoveWhenAxisLocked])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchDataRef.current) return
    if (stopPropagation) e.stopPropagation()
    finish()
  }, [finish, stopPropagation])

  const handleTouchCancel = useCallback((_e: React.TouchEvent) => {
    if (!touchDataRef.current) return
    callbacks.onSwipeCancel?.()
    callbacks.onSwipeEnd?.()
    touchDataRef.current = null
    setIsSwiping(false)
  }, [callbacks])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!usePointerEvents) return
    if (disabled) {
      callbacks.onSwipeAbort?.('disabled')
      return
    }
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    start(e.clientX, e.clientY)
  }, [usePointerEvents, disabled, preventDefault, stopPropagation, start, callbacks])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!usePointerEvents || !touchDataRef.current) return
    const lockedAxis = touchDataRef.current.lockedAxis
    if (preventDefaultOnMoveWhenAxisLocked && lockedAxis) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    move(e.clientX, e.clientY)
  }, [usePointerEvents, move, stopPropagation, preventDefaultOnMoveWhenAxisLocked])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!usePointerEvents || !touchDataRef.current) return
    if (stopPropagation) e.stopPropagation()
    finish()
  }, [usePointerEvents, finish, stopPropagation])

  const handlePointerCancel = useCallback((_e: React.PointerEvent) => {
    if (!usePointerEvents || !touchDataRef.current) return
    callbacks.onSwipeCancel?.()
    callbacks.onSwipeEnd?.()
    touchDataRef.current = null
    setIsSwiping(false)
  }, [usePointerEvents, callbacks])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onPointerDown: usePointerEvents ? handlePointerDown : undefined,
    onPointerMove: usePointerEvents ? handlePointerMove : undefined,
    onPointerUp: usePointerEvents ? handlePointerUp : undefined,
    onPointerCancel: usePointerEvents ? handlePointerCancel : undefined,
    isSwiping
  }
}

/**
 * 水平滑动检测 Hook（简化版）
 * @param onSwipeLeft - 左滑回调
 * @param onSwipeRight - 右滑回调
 * @param options - 配置选项
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options?: SwipeOptions
) {
  return useSwipeGesture(
    {
      onSwipeLeft: onSwipeLeft ? () => onSwipeLeft() : undefined,
      onSwipeRight: onSwipeRight ? () => onSwipeRight() : undefined
    },
    {
      ...options,
      allowedDirections: ['left', 'right']
    }
  )
}

/**
 * 垂直滑动检测 Hook（简化版）
 * @param onSwipeUp - 上滑回调
 * @param onSwipeDown - 下滑回调
 * @param options - 配置选项
 */
export function useVerticalSwipe(
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options?: SwipeOptions
) {
  return useSwipeGesture(
    {
      onSwipeUp: onSwipeUp ? () => onSwipeUp() : undefined,
      onSwipeDown: onSwipeDown ? () => onSwipeDown() : undefined
    },
    {
      ...options,
      allowedDirections: ['up', 'down']
    }
  )
}