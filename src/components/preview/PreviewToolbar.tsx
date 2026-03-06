/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-15
 * 
 * 预览工具栏组件
 * 实现缩放控制（50%-200%）、分页导航、导出按钮
 * Requirements: 2.3, 2.8, 2.9
 */

'use client'

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { MIN_ZOOM, MAX_ZOOM, clampZoom, clampPageNumber } from './previewUtils'

// 预设缩放级别
const ZOOM_LEVELS = [50, 75, 80, 90, 100, 110, 120, 125, 150, 175, 200]
const ZOOM_STEP = 10

interface PreviewToolbarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onExport?: (format: 'pdf' | 'png' | 'jpg') => void // 保留接口兼容性，但不再使用
  isUpdating?: boolean
  isDarkMode?: boolean
}

/**
 * 预览工具栏组件
 * 提供缩放控制、分页导航功能
 */
export function PreviewToolbar({
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onPageChange,
  onExport: _onExport, // 保留接口兼容性
  isUpdating = false,
  isDarkMode = false
}: PreviewToolbarProps) {
  const { t } = useLanguage()
  
  // 保留接口兼容性
  void _onExport

  // 确保值在有效范围内
  const safeZoom = clampZoom(zoom)
  const safeTotalPages = Math.max(1, totalPages)
  const safeCurrentPage = clampPageNumber(currentPage, safeTotalPages)

  // 放大
  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(safeZoom)
    if (currentIndex >= 0 && currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1])
    } else if (safeZoom < MAX_ZOOM) {
      const nextZoom = Math.min(MAX_ZOOM, safeZoom + ZOOM_STEP)
      onZoomChange(nextZoom)
    }
  }, [safeZoom, onZoomChange])

  // 缩小
  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(safeZoom)
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1])
    } else if (safeZoom > MIN_ZOOM) {
      const nextZoom = Math.max(MIN_ZOOM, safeZoom - ZOOM_STEP)
      onZoomChange(nextZoom)
    }
  }, [safeZoom, onZoomChange])

  // 重置缩放
  const handleResetZoom = useCallback(() => {
    onZoomChange(100)
  }, [onZoomChange])

  // 选择缩放级别
  const handleZoomSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value !== 'custom') {
      onZoomChange(Number(value))
    }
  }, [onZoomChange])

  // 上一页
  const handlePrevPage = useCallback(() => {
    if (safeCurrentPage > 1) {
      onPageChange(safeCurrentPage - 1)
    }
  }, [safeCurrentPage, onPageChange])

  // 下一页
  const handleNextPage = useCallback(() => {
    if (safeCurrentPage < safeTotalPages) {
      onPageChange(safeCurrentPage + 1)
    }
  }, [safeCurrentPage, safeTotalPages, onPageChange])

  const buttonBaseClass = isDarkMode
    ? 'p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white border border-transparent hover:border-gray-600'
    : 'p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200'

  const disabledClass = 'opacity-30 cursor-not-allowed'

  return (
    <div className={`flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b ${
      isDarkMode 
        ? 'bg-gray-800/95 border-gray-700' 
        : 'bg-gray-50/95 border-gray-200'
    } backdrop-blur`}>
      {/* 左侧：标题和状态 */}
      <div className={`backdrop-blur-md border rounded-lg px-3 py-1.5 flex items-center gap-2 ${
        isDarkMode 
          ? 'bg-gray-700/90 border-gray-600' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {t.common.preview}
        </h2>
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            isUpdating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
          }`} 
          title={isUpdating ? '更新中...' : '就绪'}
        />
      </div>

      {/* 中间：缩放控制 */}
      <div className={`flex items-center gap-1 backdrop-blur-md border rounded-lg p-1 ${
        isDarkMode 
          ? 'bg-gray-700/90 border-gray-600' 
          : 'bg-white/90 border-gray-200'
      }`}>
        {/* 缩小按钮 */}
        <motion.button
          onClick={handleZoomOut}
          disabled={safeZoom <= MIN_ZOOM}
          className={`${buttonBaseClass} ${safeZoom <= MIN_ZOOM ? disabledClass : ''}`}
          title={`${t.preview.zoomOut} (Ctrl + -)`}
          whileHover={{ scale: safeZoom <= MIN_ZOOM ? 1 : 1.05 }}
          whileTap={{ scale: safeZoom <= MIN_ZOOM ? 1 : 0.95 }}
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>

        {/* 缩放级别选择 */}
        <select
          value={ZOOM_LEVELS.includes(safeZoom) ? safeZoom : 'custom'}
          onChange={handleZoomSelect}
          className={`appearance-none px-3 py-1.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[70px] text-center cursor-pointer ${
            isDarkMode
              ? 'bg-gray-600/50 border-gray-500 text-gray-200 hover:bg-gray-600 hover:border-gray-400'
              : 'bg-white/50 border-gray-200/60 text-gray-700 hover:bg-white hover:border-gray-300'
          }`}
        >
          {ZOOM_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
          {!ZOOM_LEVELS.includes(safeZoom) && (
            <option value="custom">{safeZoom}%</option>
          )}
        </select>

        {/* 放大按钮 */}
        <motion.button
          onClick={handleZoomIn}
          disabled={safeZoom >= MAX_ZOOM}
          className={`${buttonBaseClass} ${safeZoom >= MAX_ZOOM ? disabledClass : ''}`}
          title={`${t.preview.zoomIn} (Ctrl + +)`}
          whileHover={{ scale: safeZoom >= MAX_ZOOM ? 1 : 1.05 }}
          whileTap={{ scale: safeZoom >= MAX_ZOOM ? 1 : 0.95 }}
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>

        {/* 重置缩放 */}
        <motion.button
          onClick={handleResetZoom}
          className={buttonBaseClass}
          title="重置缩放 (100%)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>

        {/* 分隔线 */}
        <div className={`w-px h-5 mx-1.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />

        {/* 分页导航 */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={handlePrevPage}
            disabled={safeCurrentPage <= 1}
            className={`${buttonBaseClass} ${safeCurrentPage <= 1 ? disabledClass : ''}`}
            title="上一页"
            whileHover={{ scale: safeCurrentPage <= 1 ? 1 : 1.05 }}
            whileTap={{ scale: safeCurrentPage <= 1 ? 1 : 0.95 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* 页码显示 */}
          <span className={`text-sm font-medium px-2 min-w-[60px] text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {safeCurrentPage} / {safeTotalPages}
          </span>

          <motion.button
            onClick={handleNextPage}
            disabled={safeCurrentPage >= safeTotalPages}
            className={`${buttonBaseClass} ${safeCurrentPage >= safeTotalPages ? disabledClass : ''}`}
            title="下一页"
            whileHover={{ scale: safeCurrentPage >= safeTotalPages ? 1 : 1.05 }}
            whileTap={{ scale: safeCurrentPage >= safeTotalPages ? 1 : 0.95 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 右侧：预留空间或其他功能 */}
      <div className="w-20" /> {/* 占位，保持布局平衡 */}
    </div>
  )
}

export default PreviewToolbar
