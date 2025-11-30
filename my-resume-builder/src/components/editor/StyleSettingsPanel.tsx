/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useState, useEffect } from 'react'
import { Type, Layout, AlignLeft, Palette, RefreshCcw, Check, ChevronDown, Grid, List, Columns, GripVertical, ArrowRight, ArrowLeft, Wand2 } from 'lucide-react'
import { useStyle } from '@/contexts/StyleContext'
import { useToastContext } from '@/components/Toast'
import { SectionHeader } from './SectionHeader'
import { SliderControl } from '../InlineStyleControl'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export function StyleSettingsPanel() {
  const { styleConfig, updateStyleConfig } = useStyle()
  const { success: showToast } = useToastContext()
  const [activeStyleTab, setActiveStyleTab] = useState('presets')
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)
  const { t, locale } = useLanguage()

  const COLOR_PALETTES = [
    { name: locale === 'zh' ? '商务蓝' : 'Business Blue', primary: '#2563eb', secondary: '#4b5563' },
    { name: locale === 'zh' ? '优雅灰' : 'Elegant Gray', primary: '#374151', secondary: '#6b7280' },
    { name: locale === 'zh' ? '森林绿' : 'Forest Green', primary: '#059669', secondary: '#4b5563' },
    { name: locale === 'zh' ? '皇家紫' : 'Royal Purple', primary: '#7c3aed', secondary: '#4b5563' },
    { name: locale === 'zh' ? '热情红' : 'Passion Red', primary: '#dc2626', secondary: '#4b5563' },
    { name: locale === 'zh' ? '深海蓝' : 'Deep Sea', primary: '#0f172a', secondary: '#475569' },
    { name: locale === 'zh' ? '科技蓝' : 'Tech Blue', primary: '#0891b2', secondary: '#4b5563' },
    { name: locale === 'zh' ? '大地棕' : 'Earth Brown', primary: '#78350f', secondary: '#57534e' },
  ]

  const FONT_FAMILIES = [
    { name: 'Inter', label: `Inter (${locale === 'zh' ? '默认' : 'Default'})`, style: 'sans-serif' },
    { name: 'Roboto', label: 'Roboto', style: 'sans-serif' },
    { name: 'Open Sans', label: 'Open Sans', style: 'sans-serif' },
    { name: 'Lato', label: 'Lato', style: 'sans-serif' },
    { name: 'Source Sans Pro', label: 'Source Sans Pro', style: 'sans-serif' },
    { name: 'Playfair Display', label: 'Playfair Display', style: 'serif' },
    { name: 'Merriweather', label: 'Merriweather', style: 'serif' },
  ]
  
  // Section order state for drag and drop
  const [localSectionOrder, setLocalSectionOrder] = useState(
    styleConfig.layout.sectionOrder || ['personal', 'experience', 'education', 'skills', 'projects']
  )
  
  // Section order state for 2-column layout
  const [localColumnOrder, setLocalColumnOrder] = useState<{left: string[], right: string[]}>(
    styleConfig.layout.columnSectionOrder || {
      left: ['personal', 'skills', 'education'],
      right: ['experience', 'projects']
    }
  )

  useEffect(() => {
    if (styleConfig.layout.sectionOrder) {
      setLocalSectionOrder(styleConfig.layout.sectionOrder)
    }
    if (styleConfig.layout.columnSectionOrder) {
      setLocalColumnOrder(styleConfig.layout.columnSectionOrder)
    }
  }, [styleConfig.layout.sectionOrder, styleConfig.layout.columnSectionOrder])

  const SECTION_NAMES: Record<string, string> = {
    personal: t.editor.personalInfo.title,
    experience: t.editor.experience.title,
    education: t.editor.education.title,
    skills: t.editor.skills.title,
    projects: t.editor.projects.title
  }
  
  // 样式配置状态
  const [styleSettings, setStyleSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 1.5,
    sectionSpacing: 24,
    itemSpacing: 16,
    borderRadius: 8,
    pagePadding: 40,
    layout: 'modern',
    targetIndustry: ''
  })

  // 初始化样式设置到StyleContext
  useEffect(() => {
    if (styleConfig.colors?.primary) {
      setStyleSettings(prev => ({
        ...prev,
        primaryColor: styleConfig.colors.primary,
        secondaryColor: styleConfig.colors.secondary,
        fontSize: styleConfig.fontSize?.content || 14,
        sectionSpacing: styleConfig.spacing?.section || 24,
        itemSpacing: styleConfig.spacing?.item || 16,
        lineHeight: styleConfig.spacing?.line ? styleConfig.spacing.line / 6 : 1.5,
        pagePadding: styleConfig.layout?.padding || 40,
        layout: (styleConfig.layout as any)?.presetName || 'modern'
      }))
    }
  }, [styleConfig]) 

  // 更新样式设置并同步到样式上下文
  const updateStyleSetting = (key: string, value: any) => {
    const newSettings = { ...styleSettings, [key]: value }
    setStyleSettings(newSettings)
    
    // 将样式设置同步到样式上下文
    const styleConfigUpdate: Partial<any> = {}
    
    if (key === 'primaryColor') {
      styleConfigUpdate.colors = { ...styleConfig.colors, primary: value, accent: value }
    } else if (key === 'secondaryColor') {
      styleConfigUpdate.colors = { ...styleConfig.colors, secondary: value }
    } else if (key === 'fontFamily') {
      styleConfigUpdate.fontFamily = value
    } else if (key === 'fontSize') {
      styleConfigUpdate.fontSize = {
        ...styleConfig.fontSize,
        content: value,
        small: value - 2,
        title: value + 4,
        name: value + 14
      }
    } else if (key === 'lineHeight') {
      styleConfigUpdate.spacing = { ...styleConfig.spacing, line: Math.round(value * 6) }
    } else if (key === 'sectionSpacing') {
      styleConfigUpdate.spacing = { ...styleConfig.spacing, section: value }
    } else if (key === 'itemSpacing') {
      styleConfigUpdate.spacing = { ...styleConfig.spacing, item: value }
    } else if (key === 'borderRadius') {
      // 圆角设置暂时不在StyleConfig中，可以后续扩展
    } else if (key === 'layout') {
      const presets: Record<string, any> = {
        modern: {
          colors: { primary: '#2563eb', accent: '#2563eb' },
          spacing: { section: 24, item: 16 },
          fontSize: { title: 18, name: 28, content: 14, small: 12 },
          layout: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1, columnGap: 24, leftColumnWidth: 35, rightColumnWidth: 65, presetName: 'modern' }
        },
        classic: {
          colors: { primary: '#1f2937', accent: '#374151' },
          spacing: { section: 28, item: 18 },
          fontSize: { title: 17, name: 27, content: 14, small: 12 },
          layout: { headerLayout: 'centered', contactLayout: 'grouped', columns: 1, columnGap: 24, leftColumnWidth: 35, rightColumnWidth: 65, presetName: 'classic' }
        },
        minimal: {
          colors: { primary: '#374151', accent: '#6b7280' },
          spacing: { section: 20, item: 12 },
          fontSize: { title: 16, name: 26, content: 14, small: 12 },
          layout: { headerLayout: 'centered', contactLayout: 'inline', columns: 1, columnGap: 24, leftColumnWidth: 35, rightColumnWidth: 65, presetName: 'minimal' }
        },
        creative: {
          colors: { primary: '#7c3aed', accent: '#8b5cf6' },
          spacing: { section: 22, item: 14 },
          fontSize: { title: 17, name: 27, content: 14, small: 12 },
          layout: { headerLayout: 'vertical', contactLayout: 'sidebar', columns: 1, columnGap: 24, leftColumnWidth: 35, rightColumnWidth: 65, presetName: 'creative' }
        }
      }
      const preset = presets[value]
      if (preset) {
        styleConfigUpdate.colors = { ...styleConfig.colors, ...preset.colors }
        styleConfigUpdate.spacing = { ...styleConfig.spacing, ...preset.spacing }
        styleConfigUpdate.fontSize = { ...styleConfig.fontSize, ...preset.fontSize }
        styleConfigUpdate.layout = { ...styleConfig.layout, ...preset.layout }
      }
    } else if (key === 'layoutHeader') {
      styleConfigUpdate.layout = { ...styleConfig.layout, headerLayout: value }
    } else if (key === 'contactLayout') {
      styleConfigUpdate.layout = { ...styleConfig.layout, contactLayout: value }
    } else if (key === 'columns') {
      styleConfigUpdate.layout = { ...styleConfig.layout, columns: value }
    } else if (key === 'leftColumnWidth') {
      styleConfigUpdate.layout = { ...styleConfig.layout, leftColumnWidth: value }
    } else if (key === 'rightColumnWidth') {
      styleConfigUpdate.layout = { ...styleConfig.layout, rightColumnWidth: value }
    } else if (key === 'columnGap') {
      styleConfigUpdate.layout = { ...styleConfig.layout, columnGap: value }
    } else if (key === 'pagePadding') {
      styleConfigUpdate.layout = { ...styleConfig.layout, padding: value }
    } else if (key === 'skillStyle') {
      styleConfigUpdate.skills = { ...styleConfig.skills, displayStyle: value }
    } else if (key === 'sectionOrder') {
        styleConfigUpdate.layout = { ...styleConfig.layout, sectionOrder: value }
    } else if (key === 'columnSectionOrder') {
        styleConfigUpdate.layout = { ...styleConfig.layout, columnSectionOrder: value }
    }
    
    if (Object.keys(styleConfigUpdate).length > 0) {
      updateStyleConfig(styleConfigUpdate)
    }
  }

  // 重置样式
  const resetStyles = () => {
    updateStyleSetting('layout', 'modern');
    showToast('样式已重置为默认', 'info');
  };

  // 应用预设配色
  const applyColorPalette = (palette: typeof COLOR_PALETTES[0]) => {
    updateStyleSetting('primaryColor', palette.primary);
    updateStyleSetting('secondaryColor', palette.secondary);
  };

  // 更新列内顺序
  const updateColumnOrder = (column: 'left' | 'right', newOrder: string[]) => {
    const newColumnOrder = { ...localColumnOrder, [column]: newOrder }
    setLocalColumnOrder(newColumnOrder)
    updateStyleSetting('columnSectionOrder', newColumnOrder)
  }

  // 移动项目到另一列
  const moveToColumn = (item: string, targetColumn: 'left' | 'right') => {
    const sourceColumn = targetColumn === 'left' ? 'right' : 'left'
    const newSourceList = localColumnOrder[sourceColumn].filter(i => i !== item)
    const newTargetList = [...localColumnOrder[targetColumn], item]
    
    const newColumnOrder = {
      ...localColumnOrder,
      [sourceColumn]: newSourceList,
      [targetColumn]: newTargetList
    }
    
    setLocalColumnOrder(newColumnOrder)
    updateStyleSetting('columnSectionOrder', newColumnOrder)
  }

  const tabs = [
    { id: 'presets', label: t.styles.presets, icon: Wand2 },
    { id: 'layout', label: t.styles.layout, icon: Layout },
    { id: 'colors', label: t.styles.colors, icon: Palette },
    { id: 'spacing', label: t.styles.spacing, icon: Type },
  ]

  const renderContent = () => {
    switch (activeStyleTab) {
      case 'presets':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.styles.overallStyle}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'modern', name: t.styles.modern, desc: t.styles.modernDesc },
                  { id: 'classic', name: t.styles.classic, desc: t.styles.classicDesc },
                  { id: 'minimal', name: t.styles.minimal, desc: t.styles.minimalDesc },
                  { id: 'creative', name: t.styles.creative, desc: t.styles.creativeDesc }
                ].map((layout) => (
                  <motion.button
                    key={layout.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateStyleSetting('layout', layout.id)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      styleSettings.layout === layout.id
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-0.5 ${styleSettings.layout === layout.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {layout.name}
                    </div>
                    <div className={`text-xs ${styleSettings.layout === layout.id ? 'text-blue-500' : 'text-gray-500'}`}>
                      {layout.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 'layout':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layout size={12} />
                {t.styles.layout}
              </h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t.styles.personalInfoLayout}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'horizontal', name: t.styles.horizontal },
                    { id: 'vertical', name: t.styles.vertical },
                    { id: 'centered', name: t.styles.centered }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateStyleSetting('layoutHeader', opt.id)}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        styleConfig.layout.headerLayout === opt.id
                          ? 'bg-white border-blue-500 text-blue-700 ring-1 ring-blue-100 font-medium'
                          : 'bg-white/50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t.styles.contactInfoLayout}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'inline', name: t.styles.inline },
                    { id: 'grouped', name: t.styles.grouped },
                    { id: 'sidebar', name: t.styles.sidebar },
                    { id: 'cards', name: t.styles.cards },
                    { id: 'grid', name: t.styles.grid }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateStyleSetting('contactLayout', opt.id)}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        styleConfig.layout.contactLayout === opt.id
                          ? 'bg-white border-blue-500 text-blue-700 ring-1 ring-blue-100 font-medium'
                          : 'bg-white/50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t.styles.skillStyle}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'progress', name: t.styles.progress },
                    { id: 'tags', name: t.styles.tags },
                    { id: 'list', name: t.styles.list },
                    { id: 'cards', name: t.styles.cards },
                    { id: 'grid', name: t.styles.grid },
                    { id: 'radar', name: t.styles.radar }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateStyleSetting('skillStyle', opt.id)}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        styleConfig.skills?.displayStyle === opt.id
                          ? 'bg-white border-blue-500 text-blue-700 ring-1 ring-blue-100 font-medium'
                          : 'bg-white/50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.styles.columnLayout}
              </label>
              <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100/80 rounded-lg">
                <button
                  onClick={() => updateStyleSetting('columns', 1)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
                    styleConfig.layout.columns === 1
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <AlignLeft size={14} />
                  {t.styles.singleColumn}
                </button>
                <button
                  onClick={() => updateStyleSetting('columns', 2)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
                    styleConfig.layout.columns === 2
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Columns size={14} />
                  {t.styles.doubleColumn}
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {styleConfig.layout.columns === 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <SliderControl
                        label={`${t.styles.leftColumnWidth}: ${styleConfig.layout.leftColumnWidth}%`}
                        value={styleConfig.layout.leftColumnWidth}
                        min={20}
                        max={50}
                        onChange={(val) => {
                          updateStyleSetting('leftColumnWidth', val)
                          updateStyleSetting('rightColumnWidth', 100 - val)
                        }}
                        unit="%"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <SliderControl
                        label={`${t.styles.columnGap}: ${styleConfig.layout.columnGap}px`}
                        value={styleConfig.layout.columnGap}
                        min={16}
                        max={64}
                        onChange={(val) => updateStyleSetting('columnGap', val)}
                        unit="px"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 模块排序 */}
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <List size={12} />
                {t.styles.moduleOrder}
              </h4>
              <p className="text-xs text-gray-500 mb-3">{t.styles.dragTip}</p>
              
              {styleConfig.layout.columns === 1 ? (
                <Reorder.Group 
                  axis="y" 
                  values={localSectionOrder} 
                  onReorder={(newOrder) => {
                    setLocalSectionOrder(newOrder)
                    updateStyleSetting('sectionOrder', newOrder)
                  }}
                  className="space-y-2"
                >
                  {localSectionOrder.map((item) => (
                    <Reorder.Item 
                      key={item} 
                      value={item}
                      whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                    >
                      <motion.div 
                        layout
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all select-none group"
                      >
                        <GripVertical className="text-gray-400 group-hover:text-blue-400" size={16} />
                        <span className="text-sm text-gray-700 font-medium">{SECTION_NAMES[item] || item}</span>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-medium text-gray-500">{t.styles.leftColumn}</h5>
                        <span className="text-[10px] text-gray-400">{t.styles.dragToReorder}</span>
                    </div>
                    <Reorder.Group 
                      axis="y" 
                      values={localColumnOrder.left} 
                      onReorder={(newOrder) => updateColumnOrder('left', newOrder)}
                      className="space-y-2 min-h-[40px] p-2 bg-gray-100/50 rounded-lg border border-dashed border-gray-200"
                    >
                      {localColumnOrder.left.map((item) => (
                        <Reorder.Item 
                          key={item} 
                          value={item}
                          whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                        >
                          <motion.div 
                            layout
                            className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg mb-2 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all select-none group"
                          >
                            <div className="flex items-center gap-2">
                                <GripVertical className="text-gray-400 group-hover:text-blue-400" size={14} />
                                <span className="text-sm text-gray-700 font-medium">{SECTION_NAMES[item] || item}</span>
                            </div>
                            <button 
                                onClick={() => moveToColumn(item, 'right')}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title={t.styles.moveToRight}
                            >
                                <ArrowRight size={14} />
                            </button>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                      {localColumnOrder.left.length === 0 && (
                          <div className="text-center py-4 text-xs text-gray-400">
                              {t.styles.empty}
                          </div>
                      )}
                    </Reorder.Group>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-500 mb-2">{t.styles.rightColumn}</h5>
                    <Reorder.Group 
                      axis="y" 
                      values={localColumnOrder.right} 
                      onReorder={(newOrder) => updateColumnOrder('right', newOrder)}
                      className="space-y-2 min-h-[40px] p-2 bg-gray-100/50 rounded-lg border border-dashed border-gray-200"
                    >
                      {localColumnOrder.right.map((item) => (
                        <Reorder.Item 
                          key={item} 
                          value={item}
                          whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                        >
                          <motion.div 
                            layout
                            className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg mb-2 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all select-none group"
                          >
                             <button 
                                onClick={() => moveToColumn(item, 'left')}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title={t.styles.moveToLeft}
                            >
                                <ArrowLeft size={14} />
                            </button>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="text-sm text-gray-700 font-medium">{SECTION_NAMES[item] || item}</span>
                                <GripVertical className="text-gray-400 group-hover:text-blue-400" size={14} />
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                      {localColumnOrder.right.length === 0 && (
                          <div className="text-center py-4 text-xs text-gray-400">
                              {t.styles.empty}
                          </div>
                      )}
                    </Reorder.Group>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'colors':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 颜色选择器 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t.styles.primaryColor}</label>
                <div className="flex items-center gap-2">
                  <div className="relative group flex-shrink-0">
                    <input
                      type="color"
                      value={styleSettings.primaryColor}
                      onChange={(e) => updateStyleSetting('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0 transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-lg border border-black/5 pointer-events-none"></div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50/50 px-2 py-1 rounded border border-gray-200 flex-1 text-center backdrop-blur-sm">
                    {styleSettings.primaryColor}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t.styles.secondaryColor}</label>
                <div className="flex items-center gap-2">
                  <div className="relative group flex-shrink-0">
                    <input
                      type="color"
                      value={styleSettings.secondaryColor}
                      onChange={(e) => updateStyleSetting('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0 transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-lg border border-black/5 pointer-events-none"></div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50/50 px-2 py-1 rounded border border-gray-200 flex-1 text-center backdrop-blur-sm">
                    {styleSettings.secondaryColor}
                  </div>
                </div>
              </div>
            </div>

            {/* 预设配色方案 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.styles.recommendColors}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <motion.button
                    key={palette.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => applyColorPalette(palette)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors group relative overflow-hidden"
                    title={palette.name}
                  >
                    <div className="flex -space-x-1 relative z-10">
                      <div 
                        className="w-5 h-5 rounded-full border border-white ring-1 ring-gray-100 z-10" 
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div 
                        className="w-5 h-5 rounded-full border border-white ring-1 ring-gray-100" 
                        style={{ backgroundColor: palette.secondary }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-full relative z-10">
                      {palette.name}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 'spacing':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 字体选择 - 下拉菜单 */}
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.styles.fontFamily}
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:bg-gray-50/50 transition-all"
                >
                  <span style={{ fontFamily: styleSettings.fontFamily }}>
                    {FONT_FAMILIES.find(f => f.name === styleSettings.fontFamily)?.label || styleSettings.fontFamily}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${isFontDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                <AnimatePresence>
                  {isFontDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden py-1 z-30 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                      {FONT_FAMILIES.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => {
                            updateStyleSetting('fontFamily', font.name)
                            setIsFontDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            styleSettings.fontFamily === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <span style={{ fontFamily: font.name }}>{font.label}</span>
                          {styleSettings.fontFamily === font.name && <Check size={14} className="text-blue-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isFontDropdownOpen && (
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFontDropdownOpen(false)}
                />
              )}
            </div>

            {/* 字号设置 */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              <SliderControl
                label={t.styles.fontSize}
                value={styleSettings.fontSize}
                min={12}
                max={18}
                onChange={(val) => updateStyleSetting('fontSize', val)}
                unit="px"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1 font-medium">
                <span>{locale === 'zh' ? '小' : 'Small'} (12px)</span>
                <span>{locale === 'zh' ? '标准' : 'Normal'} (14px)</span>
                <span>{locale === 'zh' ? '大' : 'Large'} (18px)</span>
              </div>
            </div>

            {[
              { label: t.styles.pagePadding, key: 'pagePadding', min: 20, max: 60, unit: 'px', icon: <Layout size={14} /> },
              { label: t.styles.sectionSpacing, key: 'sectionSpacing', min: 16, max: 40, unit: 'px', icon: <AlignLeft size={14} /> },
              { label: t.styles.itemSpacing, key: 'itemSpacing', min: 8, max: 24, unit: 'px', icon: <List size={14} /> },
              { label: t.styles.lineHeight, key: 'lineHeight', min: 1.2, max: 2.0, step: 0.1, unit: '', icon: <Type size={14} /> },
              { label: t.styles.borderRadius, key: 'borderRadius', min: 0, max: 16, unit: 'px', icon: <Grid size={14} /> },
            ].map((item) => (
              <motion.div 
                key={item.key}
                whileHover={{ y: -1 }}
                className="bg-white p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                     {item.icon}
                   </div>
                   <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <SliderControl
                  label=""
                  value={styleSettings[item.key as keyof typeof styleSettings] as number}
                  min={item.min}
                  max={item.max}
                  step={item.step || 1}
                  onChange={(val) => updateStyleSetting(item.key, val)}
                  unit={item.unit}
                />
              </motion.div>
            ))}
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 移除重复的 SectionHeader，因为外部容器已经有了标题 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* 样式选项卡 */}
          <div className="flex p-1 bg-gray-100/80 rounded-xl backdrop-blur-sm overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStyleTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                  activeStyleTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                {activeStyleTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white shadow-sm rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* 选项卡内容 */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {t.styles.realtimePreview}
          </p>
          <button 
            onClick={resetStyles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t.styles.resetStyles}
          >
            <RefreshCcw size={12} />
            {t.editor.reset}
          </button>
        </div>
      </div>
    </div>
  )
}
