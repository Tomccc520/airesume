/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 预览控制组件 - 缩放、页面边界等
 */

'use client'

import { ZoomIn, ZoomOut, Grid, Eye, EyeOff, RotateCcw, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useToastContext } from '@/components/Toast'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const zoomLevels = [50, 75, 80, 90, 100, 110, 120, 125, 150, 200]
  const { success: showSuccess, error: showError } = useToastContext()
  const { locale } = useLanguage()
  const [isSharing, setIsSharing] = useState(false)

  /**
   * 获取预览控制按钮样式
   * 将缩放、网格和分页标记统一到编辑器工具栏的按钮密度和交互语言。
   */
  const getControlButtonClass = (isActive = false) => {
    if (isActive) {
      return 'app-shell-toolbar-button app-shell-toolbar-button-active h-9 w-9 px-0'
    }

    return 'app-shell-toolbar-button h-9 w-9 border border-slate-200 bg-white px-0 text-slate-600 hover:bg-slate-50'
  }

  /**
   * 处理放大预览
   * 优先按预设缩放级别递增，兜底支持 10% 的非标准微调。
   */
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom)
    if (currentIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentIndex + 1])
    } else if (zoom < 200) {
      const nextZoom = Math.min(200, zoom + 10)
      onZoomChange(nextZoom)
    }
  }

  /**
   * 处理缩小预览
   * 优先按预设缩放级别递减，兜底支持 10% 的非标准微调。
   */
  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom)
    if (currentIndex > 0) {
      onZoomChange(zoomLevels[currentIndex - 1])
    } else if (zoom > 50) {
      const nextZoom = Math.max(50, zoom - 10)
      onZoomChange(nextZoom)
    }
  }

  /**
   * 重置到标准缩放
   * 将预览快速恢复到默认 100% 视图。
   */
  const handleFitToScreen = () => {
    onZoomChange(100)
  }

  /**
   * 复制分享链接
   * 统一使用站内 toast 反馈复制结果，避免调用参数错误导致提示文案异常。
   */
  const handleShare = async () => {
    setIsSharing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const shareUrl = `${window.location.origin}/share/${Math.random().toString(36).substring(7)}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      showSuccess(
        locale === 'zh' ? '分享链接已复制' : 'Share link copied',
        locale === 'zh' ? '链接已经复制到剪贴板，可直接发送给他人。' : 'The share link is ready in your clipboard.'
      )
    } catch (_err) {
      showError(
        locale === 'zh' ? '复制链接失败' : 'Failed to copy link',
        locale === 'zh' ? '请稍后重试，或检查浏览器剪贴板权限。' : 'Please retry or check clipboard permissions.'
      )
    }
    setIsSharing(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* 缩小按钮 */}
      <button
        onClick={handleZoomOut}
        disabled={zoom <= 50}
        className={`${getControlButtonClass()} disabled:cursor-not-allowed disabled:opacity-30`}
        title={locale === 'zh' ? '缩小 (Ctrl + -)' : 'Zoom Out (Ctrl + -)'}
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* 缩放级别显示和选择 */}
      <div className="relative flex items-center gap-1">
        <select
          value={zoomLevels.includes(zoom) ? zoom : 'custom'}
          onChange={(e) => {
            if (e.target.value !== 'custom') {
              onZoomChange(Number(e.target.value))
            }
          }}
          className="min-w-[78px] appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:border-slate-900 focus:outline-none"
        >
          {zoomLevels.map((level) => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
          {!zoomLevels.includes(zoom) && <option value="custom">{zoom}%</option>}
        </select>
      </div>

      {/* 放大按钮 */}
      <button
        onClick={handleZoomIn}
        disabled={zoom >= 200}
        className={`${getControlButtonClass()} disabled:cursor-not-allowed disabled:opacity-30`}
        title={locale === 'zh' ? '放大 (Ctrl + +)' : 'Zoom In (Ctrl + +)'}
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* 重置缩放 */}
      <button
        onClick={handleFitToScreen}
        className={getControlButtonClass()}
        title={locale === 'zh' ? '重置缩放 (100%)' : 'Reset Zoom (100%)'}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* 分隔线 */}
      <div className="mx-1 h-5 w-px bg-slate-200" />

      {/* 显示网格切换 */}
      <button
        onClick={onToggleGrid}
        className={getControlButtonClass(showGrid)}
        title={showGrid
          ? (locale === 'zh' ? '隐藏网格' : 'Hide Grid')
          : (locale === 'zh' ? '显示网格' : 'Show Grid')}
      >
        <Grid className="w-4 h-4" />
      </button>

      {/* 显示页面分割线切换 */}
      <button
        onClick={onTogglePageBreaks}
        className={getControlButtonClass(showPageBreaks)}
        title={showPageBreaks
          ? (locale === 'zh' ? '隐藏页面分割线' : 'Hide Page Breaks')
          : (locale === 'zh' ? '显示页面分割线' : 'Show Page Breaks')}
      >
        {showPageBreaks ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      {/* 分享按钮 */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`${getControlButtonClass()} ml-1 disabled:cursor-not-allowed disabled:opacity-50`}
        title={locale === 'zh' ? '分享简历' : 'Share Resume'}
      >
        <Share2 className={`w-4 h-4 ${isSharing ? 'animate-pulse' : ''}`} />
      </button>

      {/* 缩放提示 */}
      <div className="hidden lg:flex items-center ml-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
          {locale === 'zh' ? 'A4 预览' : 'A4 Preview'}
        </span>
      </div>
    </div>
  )
}
