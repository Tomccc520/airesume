/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.2.2
 * 
 * @description 增强版样式设置面板组件 - 支持本地字体检测和更多样式选项
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Palette, Type, Maximize2, Download, Loader2, AlertCircle } from 'lucide-react'
import { useStyle } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * 本地字体最小元数据定义
 * 仅声明当前组件实际用到的 family 字段
 */
interface LocalFontMetadata {
  family: string
}

/**
 * 扩展 Window 类型以声明 queryLocalFonts
 * 避免使用 ts-ignore，保持类型安全
 */
type WindowWithLocalFonts = Window & {
  queryLocalFonts?: () => Promise<LocalFontMetadata[]>
}

/**
 * 增强版样式设置面板
 * 提供配色、字体（含本地字体）、间距等完整设置
 */
export function StyleSettingsPanel() {
  const { styleConfig, updateStyleConfig } = useStyle()
  const { t, locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors')
  
  // 本地字体相关状态
  const [localFonts, setLocalFonts] = useState<Array<{ name: string; label: string }>>([])
  const [isLoadingFonts, setIsLoadingFonts] = useState(false)
  const [fontError, setFontError] = useState<string | null>(null)

  // 预设配色方案
  const colorPalettes = [
    { name: locale === 'zh' ? '商务蓝' : 'Business Blue', primary: '#2563eb', secondary: '#4b5563' },
    { name: locale === 'zh' ? '优雅灰' : 'Elegant Gray', primary: '#374151', secondary: '#6b7280' },
    { name: locale === 'zh' ? '森林绿' : 'Forest Green', primary: '#059669', secondary: '#4b5563' },
    { name: locale === 'zh' ? '皇家紫' : 'Royal Purple', primary: '#7c3aed', secondary: '#4b5563' },
    { name: locale === 'zh' ? '热情红' : 'Passion Red', primary: '#dc2626', secondary: '#4b5563' },
    { name: locale === 'zh' ? '深海蓝' : 'Deep Sea', primary: '#0f172a', secondary: '#475569' },
  ]

  // 预设字体选项
  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Playfair Display', label: 'Playfair Display (衬线)' },
    { value: 'Merriweather', label: 'Merriweather (衬线)' },
  ]
  
  // 检测本地字体
  const detectLocalFonts = useCallback(async () => {
    const windowWithLocalFonts = window as WindowWithLocalFonts

    // 检查浏览器是否支持 Local Font Access API
    if (!windowWithLocalFonts.queryLocalFonts) {
      setFontError(locale === 'zh' ? '您的浏览器不支持本地字体检测' : 'Your browser does not support local font detection')
      return
    }
    
    setIsLoadingFonts(true)
    setFontError(null)
    
    try {
      const fonts = await windowWithLocalFonts.queryLocalFonts()
      
      // 去重并获取字体家族名称
      const fontFamilies = new Map<string, string>()
      for (const font of fonts) {
        if (!fontFamilies.has(font.family)) {
          fontFamilies.set(font.family, font.family)
        }
      }
      
      // 转换为数组并排序
      const localFontList = Array.from(fontFamilies.values())
        .map(name => ({
          name: name,
          label: name
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      
      setLocalFonts(localFontList)
      setIsLoadingFonts(false)
    } catch (error: any) {
      setIsLoadingFonts(false)
      if (error.name === 'NotAllowedError') {
        setFontError(locale === 'zh' ? '请授权访问本地字体' : 'Please grant permission to access local fonts')
      } else {
        setFontError(locale === 'zh' ? '检测本地字体失败' : 'Failed to detect local fonts')
      }
    }
  }, [locale])
  
  // 应用配色方案
  const applyColorPalette = useCallback((palette: typeof colorPalettes[0]) => {
    updateStyleConfig({
      colors: {
        ...styleConfig.colors,
        primary: palette.primary,
        secondary: palette.secondary,
      }
    })
  }, [styleConfig.colors, updateStyleConfig])

  // 更新字体
  const updateFont = useCallback((font: string) => {
    updateStyleConfig({ fontFamily: font })
  }, [updateStyleConfig])

  // 更新字号
  const updateFontSize = useCallback((type: 'content' | 'title' | 'name', size: number) => {
      updateStyleConfig({
        fontSize: {
        ...styleConfig.fontSize,
        [type]: size
      }
    })
  }, [styleConfig.fontSize, updateStyleConfig])

  // 更新间距
  const updateSpacing = useCallback((type: 'section' | 'item' | 'line', value: number) => {
        updateStyleConfig({
      spacing: {
        ...styleConfig.spacing,
        [type]: value
      }
    })
  }, [styleConfig.spacing, updateStyleConfig])

  // 更新页面边距
  const updatePagePadding = useCallback((value: number) => {
    updateStyleConfig({
      layout: {
        ...styleConfig.layout,
        padding: value
      }
    })
  }, [styleConfig.layout, updateStyleConfig])

        return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* 标签切换 - 响应式优化 */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                    <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === 'colors'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
          <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{locale === 'zh' ? '配色' : 'Colors'}</span>
                    </button>
                    <button
          onClick={() => setActiveTab('typography')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === 'typography'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
          <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{locale === 'zh' ? '字体' : 'Typography'}</span>
                </button>
                <button
          onClick={() => setActiveTab('spacing')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === 'spacing'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{locale === 'zh' ? '间距' : 'Spacing'}</span>
                </button>
              </div>
              
      {/* 配色设置 */}
      {activeTab === 'colors' && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">
            {locale === 'zh' ? '预设配色' : 'Color Presets'}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {colorPalettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => applyColorPalette(palette)}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
                  >
                <div className="flex gap-1 flex-shrink-0">
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-200"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-200"
                    style={{ backgroundColor: palette.secondary }}
                      />
                    </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{palette.name}</span>
              </button>
            ))}
          </div>
                    </div>
                )}

      {/* 字体设置 */}
      {activeTab === 'typography' && (
        <div className="space-y-4">
          {/* 字体选择 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '字体' : 'Font Family'}
            </label>
            <select
              value={styleConfig.fontFamily || 'Inter'}
              onChange={(e) => updateFont(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <optgroup label={locale === 'zh' ? '预设字体' : 'Preset Fonts'}>
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              {localFonts.length > 0 && (
                <optgroup label={locale === 'zh' ? '本地字体' : 'Local Fonts'}>
                  {localFonts.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
                  </div>

          {/* 检测本地字体按钮 - 响应式优化 */}
                  <div>
                             <button 
              onClick={detectLocalFonts}
              disabled={isLoadingFonts}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              {isLoadingFonts ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="truncate">{locale === 'zh' ? '检测中...' : 'Detecting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{locale === 'zh' ? '检测本地字体' : 'Detect Local Fonts'}</span>
                </>
              )}
                            </button>
            {fontError && (
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{fontError}</span>
                          </div>
                      )}
            {localFonts.length > 0 && (
              <div className="mt-2 text-xs text-green-600">
                {locale === 'zh' ? `已检测到 ${localFonts.length} 个本地字体` : `Detected ${localFonts.length} local fonts`}
                </div>
              )}
          </div>

          {/* 姓名字号 */}
              <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '姓名字号' : 'Name Size'}: {styleConfig.fontSize?.name || 28}px
            </label>
                    <input
              type="range"
              min="24"
              max="36"
              value={styleConfig.fontSize?.name || 28}
              onChange={(e) => updateFontSize('name', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>24px</span>
              <span>36px</span>
                  </div>
                </div>

          {/* 标题字号 */}
              <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '标题字号' : 'Title Size'}: {styleConfig.fontSize?.title || 18}px
            </label>
                    <input
              type="range"
              min="14"
              max="22"
              value={styleConfig.fontSize?.title || 18}
              onChange={(e) => updateFontSize('title', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>14px</span>
              <span>22px</span>
              </div>
            </div>

          {/* 正文字号 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '正文字号' : 'Content Size'}: {styleConfig.fontSize?.content || 14}px
            </label>
            <input
              type="range"
              min="12"
              max="18"
              value={styleConfig.fontSize?.content || 14}
              onChange={(e) => updateFontSize('content', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>12px</span>
              <span>18px</span>
            </div>
          </div>
                </div>
              )}
              
      {/* 间距设置 */}
      {activeTab === 'spacing' && (
        <div className="space-y-4">
          {/* 页面边距 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '页面边距' : 'Page Padding'}: {styleConfig.layout?.padding || 32}px
            </label>
            <input
              type="range"
              min="20"
              max="60"
              value={styleConfig.layout?.padding || 32}
              onChange={(e) => updatePagePadding(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20px</span>
              <span>60px</span>
                              </div>
            </div>

          {/* 章节间距 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '章节间距' : 'Section Spacing'}: {styleConfig.spacing?.section || 24}px
            </label>
            <input
              type="range"
              min="16"
              max="40"
              value={styleConfig.spacing?.section || 24}
              onChange={(e) => updateSpacing('section', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>16px</span>
              <span>40px</span>
            </div>
          </div>

          {/* 项目间距 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '项目间距' : 'Item Spacing'}: {styleConfig.spacing?.item || 16}px
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={styleConfig.spacing?.item || 16}
              onChange={(e) => updateSpacing('item', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8px</span>
              <span>24px</span>
          </div>
        </div>
        
          {/* 行高 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              {locale === 'zh' ? '行高' : 'Line Height'}: {styleConfig.spacing?.line || 1.6}
            </label>
            <input
              type="range"
              min="1.4"
              max="2.0"
              step="0.1"
              value={styleConfig.spacing?.line || 1.6}
              onChange={(e) => updateSpacing('line', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.4</span>
              <span>2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StyleSettingsPanel
