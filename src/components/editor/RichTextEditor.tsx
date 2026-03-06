/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 * 
 * @description 富文本编辑器组件 - 支持格式化文本、列表、链接等
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Type,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface RichTextEditorProps {
  /** 当前文本内容 */
  value: string
  /** 内容变化回调 */
  onChange: (value: string) => void
  /** 占位符文本 */
  placeholder?: string
  /** 最小行数 */
  minRows?: number
  /** 最大行数 */
  maxRows?: number
  /** 是否显示格式化工具栏 */
  showToolbar?: boolean
  /** 是否启用 AI 优化 */
  enableAI?: boolean
  /** AI 优化回调 */
  onAIOptimize?: () => void
  /** 标签 */
  label?: string
}

/**
 * 富文本编辑器组件
 * 提供基础的文本格式化功能，包括加粗、斜体、列表等
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minRows = 3,
  maxRows = 10,
  showToolbar = true,
  enableAI = false,
  onAIOptimize,
  label
}: RichTextEditorProps) {
  const { locale } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)

  // 自动调整文本框高度
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
    const minHeight = lineHeight * minRows
    const maxHeight = lineHeight * maxRows
    
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`
  }, [minRows, maxRows])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  // 插入格式化文本
  const insertFormat = useCallback((prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
    onChange(newText)

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  // 格式化按钮配置
  const formatButtons = [
    {
      icon: Bold,
      label: locale === 'zh' ? '加粗' : 'Bold',
      action: () => insertFormat('**', '**'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: locale === 'zh' ? '斜体' : 'Italic',
      action: () => insertFormat('*', '*'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: List,
      label: locale === 'zh' ? '无序列表' : 'Bullet List',
      action: () => insertFormat('• '),
      shortcut: 'Ctrl+L'
    },
    {
      icon: ListOrdered,
      label: locale === 'zh' ? '有序列表' : 'Numbered List',
      action: () => insertFormat('1. '),
      shortcut: 'Ctrl+Shift+L'
    }
  ]

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          insertFormat('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertFormat('*', '*')
          break
        case 'l':
          e.preventDefault()
          if (e.shiftKey) {
            insertFormat('1. ')
          } else {
            insertFormat('• ')
          }
          break
      }
    }
  }, [insertFormat])

  return (
    <div className="space-y-2">
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* 工具栏 - 优化版本 */}
      {showToolbar && (
        <div className={`flex items-center gap-1 p-2 bg-white border rounded-lg transition-colors ${
          isFocused ? 'border-blue-300 shadow-sm' : 'border-gray-200'
        }`}>
          {/* 格式化按钮 */}
          <div className="flex items-center gap-0.5">
            {formatButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={`${button.label} (${button.shortcut})`}
                type="button"
              >
                <button.icon size={16} />
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* AI 优化按钮 */}
          {enableAI && onAIOptimize && (
            <button
              onClick={onAIOptimize}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors border border-purple-200"
              type="button"
            >
              <Sparkles size={14} />
              {locale === 'zh' ? 'AI 优化' : 'AI Optimize'}
            </button>
          )}

          {/* 格式说明 */}
          <div className="ml-auto">
            <button
              onClick={() => setShowFormatMenu(!showFormatMenu)}
              className="flex items-center gap-1 h-8 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              type="button"
            >
              <Type size={12} />
              {locale === 'zh' ? '格式' : 'Format'}
              <ChevronDown size={12} className={`transition-transform ${showFormatMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* 格式说明菜单 - 简化版本 */}
      {showFormatMenu && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
          <div className="font-medium text-blue-900">
            {locale === 'zh' ? '支持的格式：' : 'Supported formats:'}
          </div>
          <div className="space-y-1 text-blue-700">
            <div><code className="px-1.5 py-0.5 bg-white rounded">**文本**</code> - {locale === 'zh' ? '加粗' : 'Bold'}</div>
            <div><code className="px-1.5 py-0.5 bg-white rounded">*文本*</code> - {locale === 'zh' ? '斜体' : 'Italic'}</div>
            <div><code className="px-1.5 py-0.5 bg-white rounded">• 项目</code> - {locale === 'zh' ? '无序列表' : 'Bullet list'}</div>
            <div><code className="px-1.5 py-0.5 bg-white rounded">1. 项目</code> - {locale === 'zh' ? '有序列表' : 'Numbered list'}</div>
          </div>
        </div>
      )}

      {/* 文本输入区域 - 优化版本 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-sm border rounded-lg resize-none transition-colors focus:outline-none focus:ring-2 ${
            isFocused
              ? 'border-blue-300 ring-blue-100 bg-white'
              : 'border-gray-200 bg-white'
          }`}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`
          }}
        />
        
        {/* 字符计数 */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-0.5 rounded">
          {value.length} {locale === 'zh' ? '字符' : 'chars'}
        </div>
      </div>

      {/* 提示信息 */}
      {showToolbar && !isFocused && (
        <div className="text-xs text-gray-400">
          {locale === 'zh' 
            ? '提示：使用工具栏按钮或快捷键格式化文本' 
            : 'Tip: Use toolbar buttons or shortcuts to format text'}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor

