/**
 * @file components/editor/StylePresetSelector.tsx
 * @description 样式预设选择器组件，提供 12+ 种专业样式预设方案，按行业分类组织
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Briefcase,
  Building2,
  Palette,
  GraduationCap,
  Users,
  Info,
  Save,
  Wand2
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ColorScheme } from './ColorSchemeManager'

/**
 * 样式预设接口
 * @description 定义样式预设的完整数据结构
 */
export interface StylePreset {
  /** 预设 ID */
  id: string
  /** 预设名称 */
  name: string
  /** 英文名称 */
  nameEn: string
  /** 描述 */
  description: string
  /** 英文描述 */
  descriptionEn: string
  /** 适用行业 */
  industry: 'tech' | 'finance' | 'creative' | 'academic' | 'general'
  /** 是否热门 */
  isPopular: boolean
  /** 配色方案 */
  colorScheme: ColorScheme
  /** 字体配置 */
  fontConfig: {
    family: string
    sizes: {
      name: number
      title: number
      content: number
      small: number
    }
  }
  /** 间距配置 */
  spacingConfig: {
    section: number
    item: number
    line: number
  }
  /** 布局配置 */
  layoutConfig: {
    headerLayout: 'horizontal' | 'vertical' | 'centered'
    contactLayout: 'inline' | 'grouped' | 'sidebar'
    columns: 1 | 2
  }
}

/**
 * 样式预设选择器属性接口
 */
export interface StylePresetSelectorProps {
  /** 当前选中的预设 ID */
  selectedPresetId?: string
  /** 选择预设回调 */
  onSelect: (preset: StylePreset) => void
  /** 保存为自定义方案回调 */
  onSaveAsCustom?: (preset: StylePreset, name: string) => void
  /** 是否有未保存的修改 */
  hasUnsavedChanges?: boolean
}

/**
 * 行业类型定义
 */
type IndustryType = 'tech' | 'finance' | 'creative' | 'academic' | 'general'

/**
 * 行业配置
 */
interface IndustryConfig {
  id: IndustryType
  name: string
  nameEn: string
  icon: React.ReactNode
  color: string
}

/**
 * 行业配置列表
 */
const INDUSTRIES: IndustryConfig[] = [
  { id: 'tech', name: '科技', nameEn: 'Tech', icon: <Briefcase size={14} />, color: 'blue' },
  { id: 'finance', name: '金融', nameEn: 'Finance', icon: <Building2 size={14} />, color: 'emerald' },
  { id: 'creative', name: '创意', nameEn: 'Creative', icon: <Palette size={14} />, color: 'purple' },
  { id: 'academic', name: '学术', nameEn: 'Academic', icon: <GraduationCap size={14} />, color: 'amber' },
  { id: 'general', name: '通用', nameEn: 'General', icon: <Users size={14} />, color: 'gray' }
]

/**
 * 默认样式预设列表 (13+ 种)
 * @description 按行业分类的专业样式预设方案
 */
export const STYLE_PRESETS: StylePreset[] = [
  // Editorial Modern - 特色推荐 ⭐
  {
    id: 'editorial-modern',
    name: '编辑美学',
    nameEn: 'Editorial Modern',
    description: '独特的编辑美学设计，琥珀金配色，系统字体，适合追求独特风格的专业人士',
    descriptionEn: 'Unique editorial aesthetic design with amber color scheme and system fonts, ideal for professionals seeking distinctive style',
    industry: 'general',
    isPopular: true,
    colorScheme: {
      id: 'editorial-modern-colors',
      name: '编辑美学配色',
      primary: '#d97706',      // 琥珀金
      secondary: '#1c1917',    // 深墨色
      accent: '#f59e0b',       // 浅琥珀
      text: '#1c1917',         // 深墨色文字
      background: '#fafaf9',   // 纸白色
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',  // 使用系统默认字体
      sizes: { name: 32, title: 20, content: 15, small: 13 }
    },
    spacingConfig: { section: 28, item: 18, line: 23 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  },
  
  // 科技行业 (3 种)
  {
    id: 'tech-modern',
    name: '科技现代',
    nameEn: 'Tech Modern',
    description: '简洁现代的科技风格，适合互联网、软件开发等技术岗位',
    descriptionEn: 'Clean modern tech style, ideal for internet and software development positions',
    industry: 'tech',
    isPopular: true,
    colorScheme: {
      id: 'tech-modern-colors',
      name: '科技现代配色',
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'tech-minimal',
    name: '科技极简',
    nameEn: 'Tech Minimal',
    description: '极简主义设计，突出技术能力和项目经验',
    descriptionEn: 'Minimalist design highlighting technical skills and project experience',
    industry: 'tech',
    isPopular: false,
    colorScheme: {
      id: 'tech-minimal-colors',
      name: '科技极简配色',
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#334155',
      text: '#0f172a',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 20, item: 12, line: 20 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  },

  {
    id: 'tech-dark',
    name: '科技暗黑',
    nameEn: 'Tech Dark',
    description: '深色主题风格，适合追求个性的技术人才',
    descriptionEn: 'Dark theme style for tech professionals seeking uniqueness',
    industry: 'tech',
    isPopular: false,
    colorScheme: {
      id: 'tech-dark-colors',
      name: '科技暗黑配色',
      primary: '#0ea5e9',
      secondary: '#94a3b8',
      accent: '#38bdf8',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'grouped', columns: 1 }
  },

  // 金融行业 (3 种)
  {
    id: 'finance-classic',
    name: '金融经典',
    nameEn: 'Finance Classic',
    description: '稳重专业的经典风格，适合银行、证券等金融机构',
    descriptionEn: 'Classic professional style for banking and securities institutions',
    industry: 'finance',
    isPopular: true,
    colorScheme: {
      id: 'finance-classic-colors',
      name: '金融经典配色',
      primary: '#1e3a5f',
      secondary: '#4b5563',
      accent: '#2563eb',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 28, title: 17, content: 14, small: 12 }
    },
    spacingConfig: { section: 26, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'grouped', columns: 1 }
  },
  {
    id: 'finance-elegant',
    name: '金融优雅',
    nameEn: 'Finance Elegant',
    description: '优雅大气的设计，展现专业金融素养',
    descriptionEn: 'Elegant design showcasing professional financial expertise',
    industry: 'finance',
    isPopular: false,
    colorScheme: {
      id: 'finance-elegant-colors',
      name: '金融优雅配色',
      primary: '#0f4c75',
      secondary: '#3282b8',
      accent: '#1b262c',
      text: '#1b262c',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Merriweather',
      sizes: { name: 27, title: 17, content: 14, small: 12 }
    },
    spacingConfig: { section: 28, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'vertical', contactLayout: 'grouped', columns: 1 }
  },

  {
    id: 'finance-pro',
    name: '金融专业',
    nameEn: 'Finance Pro',
    description: '专业严谨的风格，适合投资、咨询等高端金融岗位',
    descriptionEn: 'Professional rigorous style for investment and consulting positions',
    industry: 'finance',
    isPopular: false,
    colorScheme: {
      id: 'finance-pro-colors',
      name: '金融专业配色',
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#4b5563',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },

  // 创意行业 (3 种)
  {
    id: 'creative-bold',
    name: '创意大胆',
    nameEn: 'Creative Bold',
    description: '大胆创新的设计，适合设计师、创意总监等岗位',
    descriptionEn: 'Bold innovative design for designers and creative directors',
    industry: 'creative',
    isPopular: true,
    colorScheme: {
      id: 'creative-bold-colors',
      name: '创意大胆配色',
      primary: '#7c3aed',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Playfair Display',
      sizes: { name: 30, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'vertical', contactLayout: 'sidebar', columns: 1 }
  },
  {
    id: 'creative-artistic',
    name: '艺术风格',
    nameEn: 'Artistic Style',
    description: '艺术感十足的设计，展现独特审美品味',
    descriptionEn: 'Artistic design showcasing unique aesthetic taste',
    industry: 'creative',
    isPopular: false,
    colorScheme: {
      id: 'creative-artistic-colors',
      name: '艺术风格配色',
      primary: '#be185d',
      secondary: '#9d174d',
      accent: '#ec4899',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Playfair Display',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  },

  {
    id: 'creative-gradient',
    name: '渐变创意',
    nameEn: 'Gradient Creative',
    description: '现代渐变风格，适合数字媒体、UI设计等岗位',
    descriptionEn: 'Modern gradient style for digital media and UI design positions',
    industry: 'creative',
    isPopular: false,
    colorScheme: {
      id: 'creative-gradient-colors',
      name: '渐变创意配色',
      primary: '#06b6d4',
      secondary: '#8b5cf6',
      accent: '#14b8a6',
      text: '#1e293b',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },

  // 学术行业 (2 种)
  {
    id: 'academic-formal',
    name: '学术正式',
    nameEn: 'Academic Formal',
    description: '正式严谨的学术风格，适合高校、研究机构申请',
    descriptionEn: 'Formal academic style for university and research institution applications',
    industry: 'academic',
    isPopular: true,
    colorScheme: {
      id: 'academic-formal-colors',
      name: '学术正式配色',
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#1d4ed8',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Merriweather',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 28, item: 18, line: 24 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'grouped', columns: 1 }
  },
  {
    id: 'academic-clean',
    name: '学术简洁',
    nameEn: 'Academic Clean',
    description: '简洁清晰的学术风格，突出研究成果和学术背景',
    descriptionEn: 'Clean academic style highlighting research achievements and background',
    industry: 'academic',
    isPopular: false,
    colorScheme: {
      id: 'academic-clean-colors',
      name: '学术简洁配色',
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#4b5563',
      text: '#111827',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Source Sans Pro',
      sizes: { name: 26, title: 16, content: 14, small: 12 }
    },
    spacingConfig: { section: 26, item: 16, line: 23 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },

  // 通用 (2 种)
  {
    id: 'general-professional',
    name: '通用专业',
    nameEn: 'General Professional',
    description: '适用于各行业的专业简历风格，平衡美观与实用',
    descriptionEn: 'Professional style suitable for all industries, balancing aesthetics and practicality',
    industry: 'general',
    isPopular: true,
    colorScheme: {
      id: 'general-professional-colors',
      name: '通用专业配色',
      primary: '#2563eb',
      secondary: '#4b5563',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 24, item: 16, line: 22 },
    layoutConfig: { headerLayout: 'horizontal', contactLayout: 'inline', columns: 1 }
  },
  {
    id: 'general-modern',
    name: '通用现代',
    nameEn: 'General Modern',
    description: '现代简约风格，适合各类职位申请',
    descriptionEn: 'Modern minimalist style suitable for various job applications',
    industry: 'general',
    isPopular: false,
    colorScheme: {
      id: 'general-modern-colors',
      name: '通用现代配色',
      primary: '#059669',
      secondary: '#4b5563',
      accent: '#10b981',
      text: '#1f2937',
      background: '#ffffff',
      isPreset: true
    },
    fontConfig: {
      family: 'Inter',
      sizes: { name: 28, title: 18, content: 14, small: 12 }
    },
    spacingConfig: { section: 22, item: 14, line: 21 },
    layoutConfig: { headerLayout: 'centered', contactLayout: 'inline', columns: 1 }
  }
]

/**
 * 获取行业颜色类名
 */
function getIndustryColorClasses(industry: IndustryType, isSelected: boolean): string {
  const colorMap: Record<IndustryType, { bg: string; border: string; text: string; selectedBg: string }> = {
    tech: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', selectedBg: 'bg-blue-100' },
    finance: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', selectedBg: 'bg-emerald-100' },
    creative: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', selectedBg: 'bg-purple-100' },
    academic: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', selectedBg: 'bg-amber-100' },
    general: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', selectedBg: 'bg-gray-100' }
  }
  const colors = colorMap[industry]
  return isSelected ? `${colors.selectedBg} ${colors.border} ${colors.text}` : `${colors.bg} ${colors.border} ${colors.text}`
}

/**
 * 预设预览缩略图组件
 */
const PresetPreviewThumbnail: React.FC<{
  preset: StylePreset
}> = ({ preset }) => {
  return (
    <div className="w-12 h-16 rounded-md border border-gray-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
      {/* 迷你简历预览 */}
      <div className="w-full h-full p-1 flex flex-col">
        {/* 头部区域 */}
        <div 
          className="h-3 rounded-sm mb-0.5"
          style={{ backgroundColor: preset.colorScheme.primary }}
        />
        {/* 内容区域 */}
        <div className="flex-1 space-y-0.5">
          <div 
            className="h-1 w-3/4 rounded-sm"
            style={{ backgroundColor: preset.colorScheme.secondary, opacity: 0.6 }}
          />
          <div 
            className="h-1 w-full rounded-sm"
            style={{ backgroundColor: preset.colorScheme.secondary, opacity: 0.4 }}
          />
          <div 
            className="h-1 w-2/3 rounded-sm"
            style={{ backgroundColor: preset.colorScheme.secondary, opacity: 0.4 }}
          />
          <div 
            className="h-1.5 w-1/2 rounded-sm mt-1"
            style={{ backgroundColor: preset.colorScheme.primary, opacity: 0.8 }}
          />
          <div 
            className="h-1 w-full rounded-sm"
            style={{ backgroundColor: preset.colorScheme.secondary, opacity: 0.3 }}
          />
          <div 
            className="h-1 w-4/5 rounded-sm"
            style={{ backgroundColor: preset.colorScheme.secondary, opacity: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 单个预设项组件 - 紧凑版
 */
const PresetItem: React.FC<{
  preset: StylePreset
  isSelected: boolean
  onSelect: () => void
  locale: string
}> = ({ preset, isSelected, onSelect, locale }) => {
  const name = locale === 'zh' ? preset.name : preset.nameEn

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`
        w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left
        ${isSelected
          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {/* 颜色预览 */}
      <div className="flex-shrink-0 flex gap-0.5">
        <div 
          className="w-3 h-6 rounded-l-sm" 
          style={{ backgroundColor: preset.colorScheme.primary }}
        />
        <div 
          className="w-3 h-6 rounded-r-sm" 
          style={{ backgroundColor: preset.colorScheme.secondary }}
        />
      </div>

      {/* 名称 */}
      <span className={`flex-1 text-xs font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
        {name}
      </span>

      {/* 热门标记 */}
      {preset.isPopular && (
        <Star size={12} className="flex-shrink-0 text-amber-500 fill-amber-500" />
      )}

      {/* 选中标记 */}
      {isSelected && (
        <Check size={14} className="flex-shrink-0 text-blue-600" />
      )}
    </motion.button>
  )
}

/**
 * 行业分类标签组件
 */
const IndustryTabs: React.FC<{
  selectedIndustry: IndustryType | 'all'
  onSelect: (industry: IndustryType | 'all') => void
  locale: string
  presetCounts: Record<IndustryType | 'all', number>
}> = ({ selectedIndustry, onSelect, locale, presetCounts }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* 全部标签 */}
      <button
        onClick={() => onSelect('all')}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
          ${selectedIndustry === 'all'
            ? 'bg-gray-800 border-gray-800 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
          }
        `}
      >
        <Sparkles size={12} />
        {locale === 'zh' ? '全部' : 'All'}
        <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20">
          {presetCounts.all}
        </span>
      </button>

      {/* 行业标签 */}
      {INDUSTRIES.map((industry) => (
        <button
          key={industry.id}
          onClick={() => onSelect(industry.id)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
            ${selectedIndustry === industry.id
              ? getIndustryColorClasses(industry.id, true)
              : `bg-white border-gray-200 text-gray-600 hover:${getIndustryColorClasses(industry.id, false)}`
            }
          `}
        >
          {industry.icon}
          {locale === 'zh' ? industry.name : industry.nameEn}
          <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
            selectedIndustry === industry.id ? 'bg-white/30' : 'bg-gray-100'
          }`}>
            {presetCounts[industry.id]}
          </span>
        </button>
      ))}
    </div>
  )
}

/**
 * 保存为自定义方案对话框
 */
const SaveAsCustomDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  locale: string
}> = ({ isOpen, onClose, onSave, locale }) => {
  const [name, setName] = useState('')

  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim())
      setName('')
      onClose()
    }
  }, [name, onSave, onClose])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-4"
    >
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
        <div className="flex items-center gap-2">
          <Save size={14} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {locale === 'zh' ? '保存为自定义方案' : 'Save as Custom Scheme'}
          </span>
        </div>
        <p className="text-xs text-amber-600">
          {locale === 'zh' 
            ? '您已修改了预设方案，是否保存为新的自定义方案？' 
            : 'You have modified the preset. Save as a new custom scheme?'}
        </p>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === 'zh' ? '请输入方案名称' : 'Enter scheme name'}
            className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') onClose()
            }}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            {locale === 'zh' ? '稍后' : 'Later'}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {locale === 'zh' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 样式预设选择器组件
 * @description 提供 12+ 种专业样式预设方案，按行业分类组织，支持预览和选择
 * 
 * @requirements
 * - 6.1: 提供至少 12 种专业样式预设方案
 * - 6.2: 按行业分类组织预设方案（科技、金融、创意、学术、通用）
 * - 6.3: 选择预设方案时显示该方案的预览效果
 * - 6.4: 为每个预设方案提供简短描述和适用场景说明
 * - 6.5: 支持基于预设方案进行微调
 * - 6.6: 修改预设方案后提示保存为新的自定义方案
 * - 6.7: 标记最受欢迎的预设方案
 */
export function StylePresetSelector({
  selectedPresetId,
  onSelect,
  onSaveAsCustom,
  hasUnsavedChanges = false
}: StylePresetSelectorProps) {
  const { locale } = useLanguage()
  
  // 状态管理
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'all'>('all')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  // 默认只展开第一个行业（科技），减少初始显示内容
  const [expandedIndustries, setExpandedIndustries] = useState<Set<IndustryType>>(() => new Set<IndustryType>(['tech']))

  // 计算各行业预设数量
  const presetCounts = useMemo(() => {
    const counts: Record<IndustryType | 'all', number> = {
      all: STYLE_PRESETS.length,
      tech: 0,
      finance: 0,
      creative: 0,
      academic: 0,
      general: 0
    }
    STYLE_PRESETS.forEach(preset => {
      counts[preset.industry]++
    })
    return counts
  }, [])

  // 过滤预设列表
  const filteredPresets = useMemo(() => {
    if (selectedIndustry === 'all') {
      return STYLE_PRESETS
    }
    return STYLE_PRESETS.filter(preset => preset.industry === selectedIndustry)
  }, [selectedIndustry])

  // 按行业分组预设
  const groupedPresets = useMemo(() => {
    const groups: Record<IndustryType, StylePreset[]> = {
      tech: [],
      finance: [],
      creative: [],
      academic: [],
      general: []
    }
    filteredPresets.forEach(preset => {
      groups[preset.industry].push(preset)
    })
    return groups
  }, [filteredPresets])

  // 处理选择预设
  const handleSelect = useCallback((preset: StylePreset) => {
    onSelect(preset)
  }, [onSelect])

  // 处理保存为自定义方案
  const handleSaveAsCustom = useCallback((name: string) => {
    const selectedPreset = STYLE_PRESETS.find(p => p.id === selectedPresetId)
    if (selectedPreset && onSaveAsCustom) {
      onSaveAsCustom(selectedPreset, name)
    }
    setShowSaveDialog(false)
  }, [selectedPresetId, onSaveAsCustom])

  // 切换行业展开状态
  const toggleIndustryExpand = useCallback((industry: IndustryType) => {
    setExpandedIndustries(prev => {
      const next = new Set(prev)
      if (next.has(industry)) {
        next.delete(industry)
      } else {
        next.add(industry)
      }
      return next
    })
  }, [])

  // 当有未保存修改时显示保存提示
  React.useEffect(() => {
    if (hasUnsavedChanges && selectedPresetId && onSaveAsCustom) {
      setShowSaveDialog(true)
    }
  }, [hasUnsavedChanges, selectedPresetId, onSaveAsCustom])

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {locale === 'zh' ? '样式预设' : 'Style Presets'}
          </span>
          <span className="text-xs text-gray-400">
            ({STYLE_PRESETS.length} {locale === 'zh' ? '种方案' : 'presets'})
          </span>
        </div>
      </div>

      {/* 保存为自定义方案对话框 */}
      <AnimatePresence>
        {showSaveDialog && (
          <SaveAsCustomDialog
            isOpen={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            onSave={handleSaveAsCustom}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* 行业分类标签 */}
      <IndustryTabs
        selectedIndustry={selectedIndustry}
        onSelect={setSelectedIndustry}
        locale={locale}
        presetCounts={presetCounts}
      />

      {/* 预设列表 */}
      <div className="space-y-4">
        {selectedIndustry === 'all' ? (
          // 按行业分组显示
          INDUSTRIES.map((industry) => {
            const presets = groupedPresets[industry.id]
            if (presets.length === 0) return null
            
            const isExpanded = expandedIndustries.has(industry.id)
            
            return (
              <div key={industry.id} className="space-y-2">
                {/* 行业标题 */}
                <button
                  onClick={() => toggleIndustryExpand(industry.id)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {industry.icon}
                    <span>{locale === 'zh' ? industry.name : industry.nameEn}</span>
                    <span className="text-gray-400">({presets.length})</span>
                  </div>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* 预设列表 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {presets.map((preset) => (
                        <PresetItem
                          key={preset.id}
                          preset={preset}
                          isSelected={selectedPresetId === preset.id}
                          onSelect={() => handleSelect(preset)}
                          locale={locale}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        ) : (
          // 显示筛选后的预设
          <div className="space-y-2">
            {filteredPresets.map((preset) => (
              <PresetItem
                key={preset.id}
                preset={preset}
                isSelected={selectedPresetId === preset.id}
                onSelect={() => handleSelect(preset)}
                locale={locale}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {filteredPresets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info size={24} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">
              {locale === 'zh' ? '暂无该分类的预设方案' : 'No presets in this category'}
            </p>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          {locale === 'zh' 
            ? '选择预设后可在其他设置中进行微调，修改后可保存为自定义方案。' 
            : 'After selecting a preset, you can fine-tune it in other settings and save as a custom scheme.'}
        </p>
      </div>
    </div>
  )
}

export default StylePresetSelector