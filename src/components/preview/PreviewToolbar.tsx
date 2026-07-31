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
  const { t, locale } = useLanguage()
  
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
    ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-700 hover:text-white'
    : 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#2554ff]'

  const disabledClass = 'opacity-30 cursor-not-allowed'

  return (
    <div className={`flex h-14 flex-shrink-0 items-center justify-between border-b px-4 ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-800/95'
        : 'border-slate-200 bg-white/95'
    } backdrop-blur`}>
      {/* 左侧：标题和状态 */}
      <div className="flex items-center gap-2">
        <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {t.common.preview}
        </h2>
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            isUpdating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
          }`} 
          title={isUpdating
            ? (locale === 'zh' ? '更新中...' : 'Updating...')
            : (locale === 'zh' ? '就绪' : 'Ready')}
        />
      </div>

      {/* 中间：缩放控制 */}
      <div className={`flex items-center gap-0.5 rounded-xl border p-1 ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-700/90'
          : 'border-slate-200 bg-slate-50'
      }`}>
        {/* 缩小按钮 */}
        <button
          onClick={handleZoomOut}
          disabled={safeZoom <= MIN_ZOOM}
          className={`${buttonBaseClass} ${safeZoom <= MIN_ZOOM ? disabledClass : ''}`}
          title={`${t.preview.zoomOut} (Ctrl + -)`}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* 缩放级别选择 */}
        <select
          value={ZOOM_LEVELS.includes(safeZoom) ? safeZoom : 'custom'}
          onChange={handleZoomSelect}
          className={`min-w-[70px] cursor-pointer appearance-none rounded-lg border px-3 py-1.5 text-center text-sm font-medium transition-colors focus:border-[#2554ff] focus:outline-none focus:ring-2 focus:ring-[#2554ff]/10 ${
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
        <button
          onClick={handleZoomIn}
          disabled={safeZoom >= MAX_ZOOM}
          className={`${buttonBaseClass} ${safeZoom >= MAX_ZOOM ? disabledClass : ''}`}
          title={`${t.preview.zoomIn} (Ctrl + +)`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* 重置缩放 */}
        <button
          onClick={handleResetZoom}
          className={buttonBaseClass}
          title={locale === 'zh' ? '重置缩放 (100%)' : 'Reset zoom (100%)'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* 分隔线 */}
        <div className={`w-px h-5 mx-1.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />

        {/* 分页导航 */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={safeCurrentPage <= 1}
            className={`${buttonBaseClass} ${safeCurrentPage <= 1 ? disabledClass : ''}`}
            title={locale === 'zh' ? '上一页' : 'Previous page'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 页码显示 */}
          <span className={`text-sm font-medium px-2 min-w-[60px] text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {safeCurrentPage} / {safeTotalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={safeCurrentPage >= safeTotalPages}
            className={`${buttonBaseClass} ${safeCurrentPage >= safeTotalPages ? disabledClass : ''}`}
            title={locale === 'zh' ? '下一页' : 'Next page'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 右侧：预留空间或其他功能 */}
      <div className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">A4</div>
    </div>
  )
}

export default PreviewToolbar
