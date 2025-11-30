/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Layout, AlignLeft, ArrowUpWideNarrow } from 'lucide-react'
import { useStyle } from '@/contexts/StyleContext'

// 布局预设常量定义
const LAYOUT_PRESETS = {
  compact: {
    padding: 24,
    line: 20,
    section: 12,
    content: 13
  },
  comfortable: {
    padding: 32,
    line: 24,
    section: 18,
    content: 14
  },
  loose: {
    padding: 40,
    line: 28,
    section: 24,
    content: 15
  }
} as const

/**
 * 快速布局控制组件
 * 提供常用的布局调整功能（如间距、边距、字体大小）
 */
export function QuickLayoutControls() {
  const { styleConfig, updateStyleConfig } = useStyle()

  /**
   * 计算当前布局模式
   * 根据内边距大小判断当前是紧凑、舒适还是宽松模式
   */
  const currentMode = React.useMemo(() => {
    const { padding } = styleConfig.layout
    if (padding <= 24) return 'compact'
    if (padding >= 40) return 'loose'
    return 'comfortable'
  }, [styleConfig.layout])

  /**
   * 应用布局预设
   * @param mode - 布局模式 ('compact' | 'comfortable' | 'loose')
   */
  const applyPreset = (mode: keyof typeof LAYOUT_PRESETS) => {
    const preset = LAYOUT_PRESETS[mode]
    updateStyleConfig({
      layout: { ...styleConfig.layout, padding: preset.padding },
      spacing: { ...styleConfig.spacing, line: preset.line, section: preset.section },
      fontSize: { ...styleConfig.fontSize, content: preset.content }
    })
  }

  /**
   * 调整正文字体大小
   * @param content - 新的字体大小数值
   */
  const handleFontSizeChange = (content: number) => {
    updateStyleConfig({
      fontSize: { ...styleConfig.fontSize, content }
    })
  }

  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="布局控制工具栏">
      {/* 布局密度控制组 */}
      <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-200" role="group" aria-label="布局密度">
        {/* 紧凑模式 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => applyPreset('compact')}
          className={`p-1.5 rounded-md transition-all ${
            currentMode === 'compact' 
              ? 'bg-white text-blue-600 ring-1 ring-blue-200' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
          title="紧凑模式"
          aria-label="切换到紧凑模式"
          aria-pressed={currentMode === 'compact'}
        >
          <ArrowUpWideNarrow className="w-4 h-4" />
        </motion.button>

        {/* 舒适模式 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => applyPreset('comfortable')}
          className={`p-1.5 rounded-md transition-all ${
            currentMode === 'comfortable' 
              ? 'bg-white text-blue-600 ring-1 ring-blue-200' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
          title="舒适模式"
          aria-label="切换到舒适模式"
          aria-pressed={currentMode === 'comfortable'}
        >
          <Layout className="w-4 h-4" />
        </motion.button>

        {/* 宽松模式 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => applyPreset('loose')}
          className={`p-1.5 rounded-md transition-all ${
            currentMode === 'loose' 
              ? 'bg-white text-blue-600 ring-1 ring-blue-200' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
          title="宽松模式"
          aria-label="切换到宽松模式"
          aria-pressed={currentMode === 'loose'}
        >
          <AlignLeft className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-0.5" aria-hidden="true"></div>

      {/* 字体大小微调 */}
      <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-200" role="group" aria-label="字体大小">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFontSizeChange(Math.max(12, styleConfig.fontSize.content - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-blue-600 hover:bg-white transition-all text-xs font-medium"
          title="减小字号"
          aria-label="减小字号"
        >
          A-
        </motion.button>
        
        <span className="text-xs font-medium text-gray-600 w-5 text-center select-none font-mono" aria-label={`当前字号 ${styleConfig.fontSize.content}`}>
          {styleConfig.fontSize.content}
        </span>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFontSizeChange(Math.min(18, styleConfig.fontSize.content + 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-blue-600 hover:bg-white transition-all text-xs font-medium"
          title="增大字号"
          aria-label="增大字号"
        >
          A+
        </motion.button>
      </div>
    </div>
  )
}
