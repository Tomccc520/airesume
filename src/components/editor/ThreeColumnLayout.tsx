'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Column width configuration
 */
export interface ColumnWidths {
  left: number    // Left column width percentage
  center: number  // Center column width percentage
  right: number   // Right column width percentage
}

/**
 * ThreeColumnLayout component props
 */
interface ThreeColumnLayoutProps {
  /** Left panel content (section navigation) */
  leftPanel: React.ReactNode
  /** Center panel content (editor) */
  centerPanel: React.ReactNode
  /** Right panel content (preview) */
  rightPanel: React.ReactNode
  /** Default column widths in percentage */
  defaultWidths?: ColumnWidths
  /** Minimum column widths in percentage */
  minWidths?: ColumnWidths
  /** localStorage key for persisting widths */
  storageKey?: string
  /** Callback when widths change */
  onWidthChange?: (widths: ColumnWidths) => void
  /** Custom class name */
  className?: string
}

const DEFAULT_WIDTHS: ColumnWidths = { left: 18, center: 42, right: 40 }
const MIN_WIDTHS: ColumnWidths = { left: 15, center: 35, right: 25 }

/**
 * ThreeColumnLayout - A responsive three-column layout component
 * 
 * Features:
 * - Three-column layout for desktop (>=1280px)
 * - Two-column layout for tablet (768px-1279px)
 * - Single-column layout for mobile (<768px)
 * - Resizable columns via drag handles
 * - Persists column widths to localStorage
 */
export function ThreeColumnLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultWidths = DEFAULT_WIDTHS,
  minWidths = MIN_WIDTHS,
  storageKey = 'editor-column-widths',
  onWidthChange,
  className = ''
}: ThreeColumnLayoutProps) {
  const [widths, setWidths] = useState<ColumnWidths>(defaultWidths)
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null)
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  )
  const containerRef = useRef<HTMLDivElement>(null)


  // Load saved widths from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedWidths = JSON.parse(saved) as ColumnWidths
        // Validate the parsed widths
        if (
          typeof parsedWidths.left === 'number' &&
          typeof parsedWidths.center === 'number' &&
          typeof parsedWidths.right === 'number' &&
          parsedWidths.left + parsedWidths.center + parsedWidths.right === 100
        ) {
          setWidths(parsedWidths)
        }
      }
    } catch (e) {
      console.error('Failed to parse saved column widths:', e)
    }
  }, [storageKey])

  // Save widths to localStorage
  const saveWidths = useCallback((newWidths: ColumnWidths) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newWidths))
      onWidthChange?.(newWidths)
    } catch (e) {
      console.error('Failed to save column widths:', e)
    }
  }, [storageKey, onWidthChange])

  // Handle viewport resize
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const mouseX = e.clientX - containerRect.left
    const percentage = (mouseX / containerWidth) * 100

    setWidths(prev => {
      let newWidths = { ...prev }

      if (isDragging === 'left') {
        // Dragging the left handle (between left and center)
        const newLeft = Math.max(minWidths.left, Math.min(percentage, 30))
        const diff = newLeft - prev.left
        newWidths = {
          left: newLeft,
          center: prev.center - diff,
          right: prev.right
        }
      } else if (isDragging === 'right') {
        // Dragging the right handle (between center and right)
        const leftPlusCenter = percentage
        const newRight = 100 - leftPlusCenter
        const clampedRight = Math.max(minWidths.right, Math.min(newRight, 60))
        const diff = clampedRight - prev.right
        newWidths = {
          left: prev.left,
          center: prev.center - diff,
          right: clampedRight
        }
      }

      // Ensure center column doesn't go below minimum
      if (newWidths.center < minWidths.center) {
        return prev
      }

      // Ensure total is 100%
      const total = newWidths.left + newWidths.center + newWidths.right
      if (Math.abs(total - 100) > 0.1) {
        return prev
      }

      saveWidths(newWidths)
      return newWidths
    })
  }, [isDragging, minWidths, saveWidths])

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  // Add/remove global mouse event listeners during drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Single column layout for mobile (<768px)
  if (viewportWidth < 768) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {centerPanel}
      </div>
    )
  }

  // Two column layout for tablet (768px - 1279px)
  if (viewportWidth < 1280) {
    return (
      <div className={`flex h-full ${className}`}>
        <div className="w-1/2 border-r border-gray-200 overflow-hidden">
          {centerPanel}
        </div>
        <div className="w-1/2 overflow-hidden">
          {rightPanel}
        </div>
      </div>
    )
  }

  // Three column layout for desktop (>=1280px)
  return (
    <div ref={containerRef} className={`flex h-full ${className}`}>
      {/* Left column - Section Navigation - Independent scroll */}
      <div 
        style={{ width: `${widths.left}%`, height: '100%' }} 
        className="border-r border-gray-200 overflow-y-auto overflow-x-hidden flex-shrink-0 custom-scrollbar"
      >
        {leftPanel}
      </div>

      {/* Left resize handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors flex-shrink-0 relative group"
        onMouseDown={() => setIsDragging('left')}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20" />
      </div>

      {/* Center column - Editor - Independent scroll */}
      <div 
        style={{ width: `${widths.center}%`, height: '100%' }} 
        className="border-r border-gray-200 overflow-y-auto overflow-x-hidden flex-shrink-0 custom-scrollbar"
      >
        {centerPanel}
      </div>

      {/* Right resize handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors flex-shrink-0 relative group"
        onMouseDown={() => setIsDragging('right')}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20" />
      </div>

      {/* Right column - Preview - Content handles its own scroll */}
      <div 
        style={{ width: `${widths.right}%`, height: '100%' }} 
        className="overflow-hidden flex-shrink-0"
      >
        {rightPanel}
      </div>
    </div>
  )
}

export default ThreeColumnLayout
