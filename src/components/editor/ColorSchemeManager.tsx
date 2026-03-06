/**
 * @file components/editor/ColorSchemeManager.tsx
 * @description 配色方案管理器组件，支持配色方案列表显示、选择、保存、删除和重命名
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Star,
  ChevronDown,
  ChevronUp,
  Save,
  Info
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * 配色方案接口
 * @description 定义配色方案的数据结构
 */
export interface ColorScheme {
  /** 唯一标识 */
  id: string
  /** 方案名称 */
  name: string
  /** 主色 */
  primary: string
  /** 次色 */
  secondary: string
  /** 强调色 */
  accent: string
  /** 文本色 */
  text: string
  /** 背景色 */
  background: string
  /** 是否为预设方案 */
  isPreset: boolean
  /** 创建时间 */
  createdAt?: Date
}

/**
 * 配色方案管理器属性接口
 */
export interface ColorSchemeManagerProps {
  /** 当前配色方案 */
  currentScheme: ColorScheme
  /** 预设配色方案列表 */
  presetSchemes?: ColorScheme[]
  /** 自定义配色方案列表 */
  customSchemes?: ColorScheme[]
  /** 选择配色方案回调 */
  onSelect: (scheme: ColorScheme) => void
  /** 保存自定义方案回调 */
  onSave: (scheme: ColorScheme) => void
  /** 删除方案回调 */
  onDelete: (schemeId: string) => void
  /** 重命名方案回调 */
  onRename?: (schemeId: string, newName: string) => void
}

/**
 * 默认预设配色方案
 */
const DEFAULT_PRESET_SCHEMES: ColorScheme[] = [
  {
    id: 'preset-business-blue',
    name: '商务蓝',
    primary: '#2563eb',
    secondary: '#4b5563',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-elegant-gray',
    name: '优雅灰',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#4b5563',
    text: '#111827',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-forest-green',
    name: '森林绿',
    primary: '#059669',
    secondary: '#4b5563',
    accent: '#10b981',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-royal-purple',
    name: '皇家紫',
    primary: '#7c3aed',
    secondary: '#4b5563',
    accent: '#8b5cf6',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-passion-red',
    name: '热情红',
    primary: '#dc2626',
    secondary: '#4b5563',
    accent: '#ef4444',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-deep-sea',
    name: '深海蓝',
    primary: '#0f172a',
    secondary: '#475569',
    accent: '#1e3a8a',
    text: '#0f172a',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-tech-cyan',
    name: '科技蓝',
    primary: '#0891b2',
    secondary: '#4b5563',
    accent: '#06b6d4',
    text: '#1f2937',
    background: '#ffffff',
    isPreset: true
  },
  {
    id: 'preset-earth-brown',
    name: '大地棕',
    primary: '#78350f',
    secondary: '#57534e',
    accent: '#92400e',
    text: '#1c1917',
    background: '#ffffff',
    isPreset: true
  }
]

/**
 * 颜色预览缩略图组件
 */
const ColorPreviewThumbnail: React.FC<{
  scheme: ColorScheme
  size?: 'sm' | 'md' | 'lg'
}> = ({ scheme, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex -space-x-1">
      <div
        className={`${sizeClasses[size]} rounded-full border-2 border-white ring-1 ring-gray-100 z-20`}
        style={{ backgroundColor: scheme.primary }}
        title={`主色: ${scheme.primary}`}
      />
      <div
        className={`${sizeClasses[size]} rounded-full border-2 border-white ring-1 ring-gray-100 z-10`}
        style={{ backgroundColor: scheme.secondary }}
        title={`次色: ${scheme.secondary}`}
      />
      <div
        className={`${sizeClasses[size]} rounded-full border-2 border-white ring-1 ring-gray-100`}
        style={{ backgroundColor: scheme.accent }}
        title={`强调色: ${scheme.accent}`}
      />
    </div>
  )
}

/**
 * 配色方案详情悬浮卡片
 */
const ColorSchemeTooltip: React.FC<{
  scheme: ColorScheme
  t: any
}> = ({ scheme, t }) => {
  const labels = {
    primary: t.styles.colorScheme.primary,
    secondary: t.styles.colorScheme.secondary,
    accent: t.styles.colorScheme.accent,
    text: t.styles.colorScheme.text,
    background: t.styles.colorScheme.background
  }

  const colors = [
    { label: labels.primary, color: scheme.primary },
    { label: labels.secondary, color: scheme.secondary },
    { label: labels.accent, color: scheme.accent },
    { label: labels.text, color: scheme.text },
    { label: labels.background, color: scheme.background }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute left-full top-0 ml-2 z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-3 min-w-[180px]"
    >
      <div className="text-xs font-medium text-gray-700 mb-2">{scheme.name}</div>
      <div className="space-y-1.5">
        {colors.map(({ label, color }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500">{label}</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-gray-400">{color}</span>
            </div>
          </div>
        ))}
      </div>
      {scheme.createdAt && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">
            {t.styles.colorScheme.createdAt}: {new Date(scheme.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * 单个配色方案项组件
 */
const ColorSchemeItem: React.FC<{
  scheme: ColorScheme
  isSelected: boolean
  isEditing: boolean
  editName: string
  onSelect: () => void
  onDelete?: () => void
  onStartEdit?: () => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onEditNameChange?: (name: string) => void
  t: any
}> = ({
  scheme,
  isSelected,
  isEditing,
  editName,
  onSelect,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  t
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onSelect}
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg border transition-all
          ${isSelected
            ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        {/* 颜色预览 */}
        <ColorPreviewThumbnail scheme={scheme} />

        {/* 名称 */}
        <div className="flex-1 text-left">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange?.(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSaveEdit?.()
                } else if (e.key === 'Escape') {
                  onCancelEdit?.()
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
          ) : (
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
              {scheme.name}
            </span>
          )}
        </div>

        {/* 预设标记 */}
        {scheme.isPreset && (
          <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
        )}

        {/* 选中标记 */}
        {isSelected && !isEditing && (
          <Check size={16} className="text-blue-600 flex-shrink-0" />
        )}

        {/* 编辑/删除按钮 (仅自定义方案) */}
        {!scheme.isPreset && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onStartEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit()
                }}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={t.styles.colorScheme.rename}
              >
                <Edit3 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title={t.common.delete}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        {/* 编辑模式按钮 */}
        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSaveEdit?.()
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title={t.common.save}
            >
              <Check size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCancelEdit?.()
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              title={t.common.cancel}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </motion.button>

      {/* 悬浮详情卡片 */}
      <AnimatePresence>
        {showTooltip && !isEditing && (
          <ColorSchemeTooltip scheme={scheme} t={t} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * 配色方案管理器组件
 * @description 提供配色方案的列表显示、选择、保存、删除和重命名功能
 * 
 * @requirements
 * - 5.1: 支持保存当前配色为自定义方案
 * - 5.2: 显示已保存的自定义配色方案列表
 * - 5.3: 选择配色方案时立即应用该配色
 * - 5.4: 支持删除和重命名自定义配色方案
 * - 5.6: 为每个配色方案显示颜色预览缩略图
 * - 5.8: 悬停时显示该方案的详细颜色信息
 */
export function ColorSchemeManager({
  currentScheme,
  presetSchemes = DEFAULT_PRESET_SCHEMES,
  customSchemes = [],
  onSelect,
  onSave,
  onDelete,
  onRename
}: ColorSchemeManagerProps) {
  const { t } = useLanguage()
  
  // 状态管理
  const [showPresets, setShowPresets] = useState(true)
  const [showCustom, setShowCustom] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newSchemeName, setNewSchemeName] = useState('')

  // 处理选择配色方案
  const handleSelect = useCallback((scheme: ColorScheme) => {
    onSelect(scheme)
  }, [onSelect])

  // 处理保存当前配色
  const handleSaveCurrentScheme = useCallback(() => {
    if (!newSchemeName.trim()) return

    const newScheme: ColorScheme = {
      id: `custom-${Date.now()}`,
      name: newSchemeName.trim(),
      primary: currentScheme.primary,
      secondary: currentScheme.secondary,
      accent: currentScheme.accent,
      text: currentScheme.text,
      background: currentScheme.background,
      isPreset: false,
      createdAt: new Date()
    }

    onSave(newScheme)
    setNewSchemeName('')
    setShowSaveDialog(false)
  }, [currentScheme, newSchemeName, onSave])

  // 处理删除配色方案
  const handleDelete = useCallback((schemeId: string) => {
    if (window.confirm(t.styles.colorScheme.deleteConfirm)) {
      onDelete(schemeId)
    }
  }, [onDelete, t.styles.colorScheme.deleteConfirm])

  // 处理开始编辑
  const handleStartEdit = useCallback((scheme: ColorScheme) => {
    setEditingId(scheme.id)
    setEditName(scheme.name)
  }, [])

  // 处理保存编辑
  const handleSaveEdit = useCallback(() => {
    if (editingId && editName.trim() && onRename) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }, [editingId, editName, onRename])

  // 处理取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditName('')
  }, [])

  // 检查方案是否被选中
  const isSchemeSelected = useCallback((scheme: ColorScheme) => {
    return scheme.id === currentScheme.id ||
      (scheme.primary === currentScheme.primary &&
       scheme.secondary === currentScheme.secondary &&
       scheme.accent === currentScheme.accent)
  }, [currentScheme])

  return (
    <div className="space-y-4">
      {/* 标题和保存按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t.styles.colorScheme.title}</span>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={14} />
          {t.styles.colorScheme.saveCurrentScheme}
        </button>
      </div>

      {/* 保存对话框 */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <Save size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{t.styles.colorScheme.saveCurrentScheme}</span>
              </div>
              
              {/* 当前配色预览 */}
              <div className="flex items-center gap-2 p-2 bg-white rounded-md">
                <ColorPreviewThumbnail scheme={currentScheme} size="lg" />
                <span className="text-xs text-gray-500">
                  {t.styles.colorScheme.currentColors}
                </span>
              </div>

              {/* 名称输入 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t.styles.colorScheme.schemeName}</label>
                <input
                  type="text"
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                  placeholder={t.styles.colorScheme.enterName}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCurrentScheme()
                    } else if (e.key === 'Escape') {
                      setShowSaveDialog(false)
                    }
                  }}
                  autoFocus
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowSaveDialog(false)
                    setNewSchemeName('')
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSaveCurrentScheme}
                  disabled={!newSchemeName.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 预设方案列表 */}
      <div className="space-y-2">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <span>{t.styles.colorScheme.presetSchemes} ({presetSchemes.length})</span>
          {showPresets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {presetSchemes.map((scheme) => (
                <div key={scheme.id} className="group">
                  <ColorSchemeItem
                    scheme={scheme}
                    isSelected={isSchemeSelected(scheme)}
                    isEditing={false}
                    editName=""
                    onSelect={() => handleSelect(scheme)}
                    t={t}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 自定义方案列表 */}
      <div className="space-y-2">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <span>{t.styles.colorScheme.customSchemes} ({customSchemes.length})</span>
          {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {customSchemes.length > 0 ? (
                customSchemes.map((scheme) => (
                  <div key={scheme.id} className="group">
                    <ColorSchemeItem
                      scheme={scheme}
                      isSelected={isSchemeSelected(scheme)}
                      isEditing={editingId === scheme.id}
                      editName={editName}
                      onSelect={() => handleSelect(scheme)}
                      onDelete={() => handleDelete(scheme.id)}
                      onStartEdit={() => handleStartEdit(scheme)}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onEditNameChange={setEditName}
                      t={t}
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Info size={24} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">{t.styles.colorScheme.noCustomSchemes}</p>
                  <p className="text-xs text-gray-300 mt-1">{t.styles.colorScheme.createFirst}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ColorSchemeManager
