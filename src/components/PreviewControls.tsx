/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 预览控制组件 - 缩放、页面边界等
 */

'use client'

import { ZoomIn, ZoomOut, Grid, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface PreviewControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  showGrid: boolean
  onToggleGrid: () => void
  showPageBreaks: boolean
  onTogglePageBreaks: () => void
}

export default function PreviewControls({
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showPageBreaks,
  onTogglePageBreaks
}: PreviewControlsProps) {
  const zoomLevels = [50, 75, 100, 125, 150, 200]

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom)
    if (currentIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentIndex + 1])
    }
  }

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom)
    if (currentIndex > 0) {
      onZoomChange(zoomLevels[currentIndex - 1])
    }
  }

  const handleFitToScreen = () => {
    onZoomChange(100)
  }

  return (
    <div className="flex items-center gap-1">
      {/* 缩小按钮 */}
      <motion.button
        onClick={handleZoomOut}
        disabled={zoom <= zoomLevels[0]}
        className="p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed group text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200"
        title="缩小 (Ctrl + -)"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ZoomOut className="w-4 h-4" />
      </motion.button>

      {/* 缩放级别显示和选择 */}
      <div className="flex items-center gap-1 relative">
        <select
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="appearance-none px-3 py-1.5 border border-gray-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white/50 hover:bg-white transition-all min-w-[70px] text-center text-gray-700 cursor-pointer hover:border-gray-300"
        >
          {zoomLevels.map((level) => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
        </select>
      </div>

      {/* 放大按钮 */}
      <motion.button
        onClick={handleZoomIn}
        disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
        className="p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed group text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200"
        title="放大 (Ctrl + +)"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ZoomIn className="w-4 h-4" />
      </motion.button>

      {/* 重置缩放 */}
      <motion.button
        onClick={handleFitToScreen}
        className="p-2 hover:bg-gray-50 rounded-lg transition-colors group text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200"
        title="重置缩放 (100%)"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw className="w-4 h-4" />
      </motion.button>

      {/* 分隔线 */}
      <div className="w-px h-5 bg-gray-200 mx-1.5" />

      {/* 显示网格切换 */}
      <motion.button
        onClick={onToggleGrid}
        className={`p-2 rounded-lg transition-all duration-200 group ${
          showGrid 
            ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
        }`}
        title={showGrid ? '隐藏网格' : '显示网格'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Grid className="w-4 h-4" />
      </motion.button>

      {/* 显示页面分割线切换 */}
      <motion.button
        onClick={onTogglePageBreaks}
        className={`p-2 rounded-lg transition-all duration-200 group ${
          showPageBreaks 
            ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
        }`}
        title={showPageBreaks ? '隐藏页面分割线' : '显示页面分割线'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showPageBreaks ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </motion.button>

      {/* 缩放提示 */}
      <div className="hidden lg:flex items-center ml-2">
        <span className="bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-medium">
          A4 预览
        </span>
      </div>
    </div>
  )
}
