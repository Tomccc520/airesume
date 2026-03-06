/**
 * @file components/export/PageBreakPreview.tsx
 * @description 分页预览组件，在预览面板显示分页线位置，支持手动调整分页位置
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import {
  Scissors,
  GripHorizontal,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  FileText
} from 'lucide-react'
import {
  PageBreakService,
  PageBreakConfig,
  PageBreakResult,
  DEFAULT_PAGE_BREAK_CONFIG
} from '@/services/pageBreakService'

/**
 * 分页线信息接口
 */
export interface PageBreakLine {
  /** 分页线 ID */
  id: string
  /** 分页位置（像素，相对于容器顶部） */
  position: number
  /** 页码（分页线之后的页码） */
  pageNumber: number
  /** 是否为用户手动调整的位置 */
  isManual: boolean
  /** 是否有警告（如分割了不可分割的内容块） */
  hasWarning: boolean
  /** 警告信息 */
  warningMessage?: string
}

/**
 * 分页预览组件属性接口
 */
export interface PageBreakPreviewProps {
  /** 容器元素引用 */
  containerRef: React.RefObject<HTMLElement>
  /** 分页配置 */
  config?: PageBreakConfig
  /** 缩放比例 (0-100) */
  zoom?: number
  /** 是否启用手动调整 */
  enableManualAdjust?: boolean
  /** 分页位置变化回调 */
  onBreakPositionsChange?: (positions: number[]) => void
  /** 自定义分页位置（覆盖自动计算） */
  customBreakPositions?: number[]
  /** 是否显示页码标签 */
  showPageLabels?: boolean
  /** 是否显示警告 */
  showWarnings?: boolean
  /** 自定义类名 */
  className?: string
  /** 深色模式 */
  isDarkMode?: boolean
}

/**
 * 分页线组件属性
 */
interface PageBreakLineComponentProps {
  line: PageBreakLine
  zoom: number
  enableDrag: boolean
  onDragEnd: (id: string, newPosition: number) => void
  minPosition: number
  maxPosition: number
  isDarkMode: boolean
  showPageLabel: boolean
  showWarning: boolean
}

/**
 * 单个分页线组件
 */
function PageBreakLineComponent({
  line,
  zoom,
  enableDrag,
  onDragEnd,
  minPosition,
  maxPosition,
  isDarkMode,
  showPageLabel,
  showWarning
}: PageBreakLineComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const y = useMotionValue(0)
  
  // 计算缩放后的位置
  const scaledPosition = (line.position * zoom) / 100
  const scaledMinPosition = (minPosition * zoom) / 100
  const scaledMaxPosition = (maxPosition * zoom) / 100
  
  // 拖拽约束
  const dragConstraints = useMemo(() => ({
    top: scaledMinPosition - scaledPosition,
    bottom: scaledMaxPosition - scaledPosition
  }), [scaledMinPosition, scaledMaxPosition, scaledPosition])

  // 处理拖拽结束
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newScaledPosition = scaledPosition + info.offset.y
    const newPosition = (newScaledPosition * 100) / zoom
    onDragEnd(line.id, Math.max(minPosition, Math.min(maxPosition, newPosition)))
    y.set(0)
    setIsDragging(false)
  }, [scaledPosition, zoom, onDragEnd, line.id, minPosition, maxPosition, y])

  // 处理拖拽开始
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  // 线条颜色
  const lineColor = useMemo(() => {
    if (line.hasWarning) {
      return isDarkMode ? 'border-yellow-500' : 'border-yellow-400'
    }
    if (line.isManual) {
      return isDarkMode ? 'border-purple-500' : 'border-purple-400'
    }
    return isDarkMode ? 'border-blue-500' : 'border-blue-400'
  }, [line.hasWarning, line.isManual, isDarkMode])

  // 背景颜色
  const bgColor = useMemo(() => {
    if (line.hasWarning) {
      return isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-50'
    }
    if (line.isManual) {
      return isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'
    }
    return isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
  }, [line.hasWarning, line.isManual, isDarkMode])

  // 文字颜色
  const textColor = useMemo(() => {
    if (line.hasWarning) {
      return isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
    }
    if (line.isManual) {
      return isDarkMode ? 'text-purple-400' : 'text-purple-600'
    }
    return isDarkMode ? 'text-blue-400' : 'text-blue-600'
  }, [line.hasWarning, line.isManual, isDarkMode])

  return (
    <motion.div
      className="absolute left-0 right-0 z-10"
      style={{
        top: scaledPosition,
        y
      }}
      drag={enableDrag ? 'y' : false}
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 分页线 */}
      <div
        className={`
          relative w-full h-0 border-t-2 border-dashed
          ${lineColor}
          ${isDragging ? 'border-solid' : ''}
          transition-colors duration-200
        `}
      >
        {/* 左侧标签 */}
        <div
          className={`
            absolute left-0 -top-3 flex items-center gap-1 px-2 py-0.5 rounded-r-md
            ${bgColor}
            ${textColor}
            text-xs font-medium
            transition-all duration-200
            ${isHovered || isDragging ? 'opacity-100' : 'opacity-80'}
          `}
        >
          <Scissors className="w-3 h-3" />
          {showPageLabel && (
            <span>
              第 {line.pageNumber} 页
            </span>
          )}
        </div>

        {/* 拖拽手柄 */}
        {enableDrag && (
          <motion.div
            className={`
              absolute left-1/2 -translate-x-1/2 -top-3
              flex items-center justify-center
              w-8 h-6 rounded-md
              ${bgColor}
              ${textColor}
              cursor-grab active:cursor-grabbing
              transition-all duration-200
              ${isHovered || isDragging ? 'opacity-100 scale-110' : 'opacity-60'}
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <GripHorizontal className="w-4 h-4" />
          </motion.div>
        )}

        {/* 右侧页码指示 */}
        {showPageLabel && (
          <div
            className={`
              absolute right-0 -top-3 flex items-center gap-1 px-2 py-0.5 rounded-l-md
              ${bgColor}
              ${textColor}
              text-xs font-medium
              transition-all duration-200
              ${isHovered || isDragging ? 'opacity-100' : 'opacity-80'}
            `}
          >
            <FileText className="w-3 h-3" />
            <span>Page {line.pageNumber}</span>
          </div>
        )}

        {/* 拖拽提示箭头 */}
        {enableDrag && (isHovered || isDragging) && (
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.div
              className={`${textColor} -mt-6`}
              animate={{ y: [-2, 0, -2] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ChevronUp className="w-4 h-4" />
            </motion.div>
            <motion.div
              className={`${textColor} mt-1`}
              animate={{ y: [2, 0, 2] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        )}
      </div>

      {/* 警告提示 */}
      {showWarning && line.hasWarning && line.warningMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            absolute left-1/2 -translate-x-1/2 top-2
            flex items-center gap-1 px-2 py-1 rounded-md
            ${isDarkMode ? 'bg-yellow-900/80 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}
            text-xs whitespace-nowrap
            shadow-sm
          `}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>{line.warningMessage}</span>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * 分页预览组件
 * 
 * 在预览面板显示分页线位置，支持手动调整分页位置
 * 
 * @example
 * ```tsx
 * <PageBreakPreview
 *   containerRef={previewRef}
 *   zoom={100}
 *   enableManualAdjust
 *   onBreakPositionsChange={(positions) => console.log(positions)}
 *   showPageLabels
 *   showWarnings
 * />
 * ```
 */
export function PageBreakPreview({
  containerRef,
  config = DEFAULT_PAGE_BREAK_CONFIG,
  zoom = 100,
  enableManualAdjust = false,
  onBreakPositionsChange,
  customBreakPositions,
  showPageLabels = true,
  showWarnings = true,
  className = '',
  isDarkMode = false
}: PageBreakPreviewProps) {
  const pageBreakService = useRef(new PageBreakService())
  const [breakLines, setBreakLines] = useState<PageBreakLine[]>([])
  const [totalHeight, setTotalHeight] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  // 计算分页位置
  const calculateBreakPositions = useCallback(() => {
    if (!containerRef.current) return

    setIsCalculating(true)

    try {
      const container = containerRef.current
      const height = container.scrollHeight
      setTotalHeight(height)

      // 如果有自定义分页位置，使用自定义位置
      if (customBreakPositions && customBreakPositions.length > 0) {
        const lines: PageBreakLine[] = customBreakPositions.map((position, index) => ({
          id: `break-${index}`,
          position,
          pageNumber: index + 2,
          isManual: true,
          hasWarning: false
        }))
        setBreakLines(lines)
        return
      }

      // 使用服务计算分页位置
      const result: PageBreakResult = pageBreakService.current.detectBreakPositions(container, config)

      // 转换为分页线数据
      const lines: PageBreakLine[] = result.breakPositions.map((position, index) => {
        // 检查是否有被分割的内容块
        const splitBlock = result.splitBlocks.find(block => 
          position > block.top && position < block.bottom
        )

        return {
          id: `break-${index}`,
          position,
          pageNumber: index + 2,
          isManual: false,
          hasWarning: !!splitBlock && !splitBlock.splittable,
          warningMessage: splitBlock && !splitBlock.splittable
            ? `此位置可能分割 ${getBlockTypeName(splitBlock.type)} 内容`
            : undefined
        }
      })

      setBreakLines(lines)
    } finally {
      setIsCalculating(false)
    }
  }, [containerRef, config, customBreakPositions])

  // 监听容器变化，重新计算分页位置
  useEffect(() => {
    calculateBreakPositions()

    // 使用 ResizeObserver 监听容器大小变化
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        calculateBreakPositions()
      })
      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [calculateBreakPositions, containerRef])

  // 处理分页线拖拽结束
  const handleDragEnd = useCallback((id: string, newPosition: number) => {
    setBreakLines(prev => {
      const updated = prev.map(line => {
        if (line.id === id) {
          return {
            ...line,
            position: newPosition,
            isManual: true
          }
        }
        return line
      })

      // 按位置排序
      updated.sort((a, b) => a.position - b.position)

      // 更新页码
      const withUpdatedPageNumbers = updated.map((line, index) => ({
        ...line,
        pageNumber: index + 2
      }))

      // 通知父组件
      if (onBreakPositionsChange) {
        onBreakPositionsChange(withUpdatedPageNumbers.map(l => l.position))
      }

      return withUpdatedPageNumbers
    })
  }, [onBreakPositionsChange])

  // 计算每条分页线的拖拽范围
  const getLineConstraints = useCallback((index: number): { min: number; max: number } => {
    const minGap = config.minOrphanHeight || 80 // 最小间距
    
    const prevPosition = index > 0 ? breakLines[index - 1].position : 0
    const nextPosition = index < breakLines.length - 1 
      ? breakLines[index + 1].position 
      : totalHeight

    return {
      min: prevPosition + minGap,
      max: nextPosition - minGap
    }
  }, [breakLines, totalHeight, config.minOrphanHeight])

  // 总页数
  const totalPages = breakLines.length + 1

  // 如果没有分页线，不显示任何内容
  if (breakLines.length === 0 && !isCalculating) {
    return null
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ height: (totalHeight * zoom) / 100 }}
    >
      {/* 分页线 */}
      {breakLines.map((line, index) => {
        const constraints = getLineConstraints(index)
        return (
          <div key={line.id} className="pointer-events-auto">
            <PageBreakLineComponent
              line={line}
              zoom={zoom}
              enableDrag={enableManualAdjust}
              onDragEnd={handleDragEnd}
              minPosition={constraints.min}
              maxPosition={constraints.max}
              isDarkMode={isDarkMode}
              showPageLabel={showPageLabels}
              showWarning={showWarnings}
            />
          </div>
        )
      })}

      {/* 页面信息摘要 */}
      {showPageLabels && (
        <div
          className={`
            absolute bottom-4 right-4 pointer-events-auto
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${isDarkMode ? 'bg-gray-800/90 text-gray-200' : 'bg-white/90 text-gray-700'}
            shadow-lg backdrop-blur-sm
            text-sm font-medium
          `}
        >
          <FileText className="w-4 h-4" />
          <span>
            共 {totalPages} 页 / {totalPages} Pages
          </span>
        </div>
      )}

      {/* 计算中指示器 */}
      {isCalculating && (
        <div
          className={`
            absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${isDarkMode ? 'bg-gray-800/90 text-gray-200' : 'bg-white/90 text-gray-700'}
            shadow-lg backdrop-blur-sm
            text-sm
          `}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Scissors className="w-4 h-4" />
          </motion.div>
          <span>计算分页位置...</span>
        </div>
      )}
    </div>
  )
}

/**
 * 获取内容块类型的中文名称
 */
function getBlockTypeName(type: string): string {
  switch (type) {
    case 'section-header':
      return '章节标题'
    case 'section-content':
      return '章节内容'
    case 'list-item':
      return '列表项'
    case 'paragraph':
      return '段落'
    default:
      return '内容'
  }
}

/**
 * 分页预览覆盖层组件
 * 用于在现有预览面板上叠加显示分页线
 */
export interface PageBreakOverlayProps extends Omit<PageBreakPreviewProps, 'containerRef'> {
  /** 是否显示覆盖层 */
  visible?: boolean
  /** 子元素（预览内容） */
  children: React.ReactNode
}

export function PageBreakOverlay({
  visible = true,
  children,
  ...previewProps
}: PageBreakOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative">
      {children}
      {visible && containerRef.current && (
        <PageBreakPreview
          containerRef={containerRef as React.RefObject<HTMLElement>}
          {...previewProps}
        />
      )}
    </div>
  )
}

export default PageBreakPreview
