/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-16
 *
 * @description 富文本编辑器组件 - 支持格式化文本、快捷片段、长度建议与内容质量检查
 */

'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,
  Sparkles,
  ChevronDown,
  BookText
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  applyWritingQuickAction,
  analyzeWritingSignals,
  buildDefaultSnippets,
  ContentSnippet,
  evaluateContentQuality,
  inferRecommendedLength,
  resolveLengthState,
  resolveWritingQuickActions
} from '@/domain/editor/richTextCoach'

interface RichTextEditorProps {
  /** 当前文本内容 */
  value: string
  /** 内容变化回调 */
  onChange: (value: string) => void
  /** 字段定位键 */
  fieldKey?: string
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
  /** 推荐字数区间 */
  recommendedLength?: { min: number; max: number }
  /** 快捷片段 */
  snippets?: ContentSnippet[]
  /** 是否启用内容质量检查 */
  enableQualityCheck?: boolean
}

/**
 * 富文本编辑器组件
 * 提供基础格式化能力，并内置编辑提效工具。
 */
export function RichTextEditor({
  value,
  onChange,
  fieldKey,
  placeholder = '',
  minRows = 3,
  maxRows = 10,
  showToolbar = true,
  enableAI = false,
  onAIOptimize,
  label,
  recommendedLength,
  snippets,
  enableQualityCheck = true
}: RichTextEditorProps) {
  const { locale } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)
  const [showSnippetMenu, setShowSnippetMenu] = useState(false)

  const lengthRange = useMemo(
    () => recommendedLength || inferRecommendedLength(label, placeholder),
    [recommendedLength, label, placeholder]
  )
  const lengthState = useMemo(() => resolveLengthState(value.trim().length, lengthRange), [value, lengthRange])
  const qualityResult = useMemo(
    () => evaluateContentQuality(value, lengthState, locale),
    [value, lengthState, locale]
  )
  const writingSignals = useMemo(() => analyzeWritingSignals(value), [value])
  const quickActions = useMemo(
    () => resolveWritingQuickActions(value, locale, lengthState),
    [value, locale, lengthState]
  )
  const effectiveSnippets = useMemo(
    () => (snippets && snippets.length > 0 ? snippets : buildDefaultSnippets(locale, label)),
    [snippets, locale, label]
  )
  const signalItems = useMemo(
    () => [
      {
        key: 'metrics',
        label: locale === 'zh' ? '量化结果' : 'Metrics',
        value: writingSignals.metricCount,
        tone: writingSignals.metricCount > 0 ? 'positive' : 'warning'
      },
      {
        key: 'bullets',
        label: locale === 'zh' ? '要点' : 'Bullets',
        value: writingSignals.bulletCount,
        tone: writingSignals.bulletCount > 0 ? 'positive' : 'neutral'
      },
      {
        key: 'sentences',
        label: locale === 'zh' ? '句子' : 'Sentences',
        value: writingSignals.sentenceCount,
        tone: writingSignals.sentenceCount >= 2 ? 'positive' : 'neutral'
      }
    ],
    [locale, writingSignals]
  )

  /**
   * 自动调整文本框高度
   */
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight || '24', 10)
    const minHeight = lineHeight * minRows
    const maxHeight = lineHeight * maxRows
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`
  }, [minRows, maxRows])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  /**
   * 应用快捷写作动作
   * 在文本回写后自动恢复焦点，保持连续编辑体验。
   */
  const handleQuickAction = useCallback(
    (actionKey: Parameters<typeof applyWritingQuickAction>[1]) => {
      const nextValue = applyWritingQuickAction(value, actionKey, locale)
      if (nextValue === value) return

      onChange(nextValue)

      setTimeout(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.focus()
        textarea.setSelectionRange(nextValue.length, nextValue.length)
      }, 0)
    },
    [value, locale, onChange]
  )

  /**
   * 插入格式化文本
   */
  const insertFormat = useCallback(
    (prefix: string, suffix: string = '') => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      const beforeText = value.substring(0, start)
      const afterText = value.substring(end)
      const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
      onChange(newText)

      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + prefix.length + selectedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange]
  )

  /**
   * 插入快捷片段
   * 若用户已选中文本，则替换选中内容；否则在光标处插入。
   */
  const insertSnippet = useCallback(
    (snippet: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = value.slice(0, start)
      const after = value.slice(end)
      const prefix = before && !before.endsWith('\n') ? '\n' : ''
      const suffix = after && !after.startsWith('\n') ? '\n' : ''
      const nextValue = `${before}${prefix}${snippet}${suffix}${after}`

      onChange(nextValue)
      setShowSnippetMenu(false)

      setTimeout(() => {
        textarea.focus()
      }, 0)
    },
    [value, onChange]
  )

  /**
   * 键盘快捷键处理
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault()
            insertFormat('**', '**')
            break
          case 'i':
            event.preventDefault()
            insertFormat('*', '*')
            break
          case 'l':
            event.preventDefault()
            if (event.shiftKey) {
              insertFormat('1. ')
            } else {
              insertFormat('• ')
            }
            break
          default:
            break
        }
      }
    },
    [insertFormat]
  )

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

  const lengthStateClass =
    lengthState === 'ideal' ? 'text-emerald-600' : lengthState === 'short' ? 'text-amber-600' : 'text-rose-600'

  const lengthHintText =
    lengthState === 'ideal'
      ? locale === 'zh'
        ? '长度合适'
        : 'Length looks good'
      : lengthState === 'short'
        ? locale === 'zh'
          ? `建议至少 ${lengthRange.min} 字`
          : `Suggested min ${lengthRange.min} chars`
        : locale === 'zh'
          ? `建议控制在 ${lengthRange.max} 字以内`
          : `Suggested max ${lengthRange.max} chars`

  return (
    <div className="space-y-3" data-editor-field-key={fieldKey}>
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      {showToolbar && (
        <div
          className={`rounded-lg border p-2 transition-colors ${
            isFocused ? 'border-slate-300 shadow-sm' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-0.5">
              {formatButtons.map((button) => (
                <button
                  key={button.label}
                  onClick={button.action}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  title={`${button.label} (${button.shortcut})`}
                  type="button"
                >
                  <button.icon size={16} />
                </button>
              ))}
            </div>

            <div className="mx-1 h-5 w-px bg-slate-200" />

            <button
              onClick={() => setShowSnippetMenu((prev) => !prev)}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              type="button"
            >
              <BookText size={12} />
              {locale === 'zh' ? '快捷片段' : 'Snippets'}
              <ChevronDown size={12} className={`transition-transform ${showSnippetMenu ? 'rotate-180' : ''}`} />
            </button>

            {enableAI && onAIOptimize && (
              <button
                onClick={onAIOptimize}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                type="button"
              >
                <Sparkles size={14} />
                {locale === 'zh' ? 'AI 优化' : 'AI Optimize'}
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={() => setShowFormatMenu((prev) => !prev)}
                className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                type="button"
              >
                <Type size={12} />
                {locale === 'zh' ? '格式说明' : 'Format'}
                <ChevronDown size={12} className={`transition-transform ${showFormatMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showSnippetMenu && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {effectiveSnippets.map((snippet) => (
                <button
                  key={snippet.label}
                  type="button"
                  onClick={() => insertSnippet(snippet.content)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="text-xs font-semibold text-slate-800">{snippet.label}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-slate-500">{snippet.content}</div>
                </button>
              ))}
            </div>
          )}

          {showFormatMenu && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <div className="mb-1 font-medium">{locale === 'zh' ? '支持格式' : 'Supported formats'}</div>
              <div className="space-y-1">
                <div>
                  <code className="rounded bg-white px-1.5 py-0.5">**文本**</code> -{' '}
                  {locale === 'zh' ? '加粗' : 'Bold'}
                </div>
                <div>
                  <code className="rounded bg-white px-1.5 py-0.5">*文本*</code> -{' '}
                  {locale === 'zh' ? '斜体' : 'Italic'}
                </div>
                <div>
                  <code className="rounded bg-white px-1.5 py-0.5">• 条目</code> -{' '}
                  {locale === 'zh' ? '无序列表' : 'Bullet list'}
                </div>
                <div>
                  <code className="rounded bg-white px-1.5 py-0.5">1. 条目</code> -{' '}
                  {locale === 'zh' ? '有序列表' : 'Numbered list'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {locale === 'zh' ? '写作信号' : 'Writing Signals'}
          </span>
          {signalItems.map((item) => {
            const toneClass =
              item.tone === 'positive'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : item.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600'

            return (
              <span
                key={item.key}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}
              >
                <span>{item.label}</span>
                <span>{item.value}</span>
              </span>
            )
          })}
          <span className="ml-auto text-[11px] text-slate-500">
            {locale === 'zh'
              ? '先补结果，再拆点，投递可读性会更好'
              : 'Add results first, then split into bullets'}
          </span>
        </div>

        {quickActions.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {quickActions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => handleQuickAction(action.key)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="text-xs font-semibold text-slate-800">{action.label}</div>
                <div className="mt-1 text-[11px] leading-5 text-slate-500">{action.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 ${
            isFocused
              ? 'border-slate-300 bg-white ring-slate-100'
              : 'border-slate-200 bg-white'
          }`}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className={lengthStateClass}>
          {value.trim().length} / {lengthRange.min}-{lengthRange.max} · {lengthHintText}
        </div>
        <div className="text-slate-400">
          {locale === 'zh' ? '支持快捷键 Ctrl+B / Ctrl+I / Ctrl+L' : 'Shortcuts: Ctrl+B / Ctrl+I / Ctrl+L'}
        </div>
      </div>

      {enableQualityCheck && value.trim() && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {locale === 'zh' ? '内容质量检查' : 'Content Quality'}
            </span>
            <span
              className={`text-xs font-semibold ${
                qualityResult.score >= 80
                  ? 'text-emerald-600'
                  : qualityResult.score >= 60
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }`}
            >
              {locale === 'zh' ? '评分' : 'Score'} {qualityResult.score}
            </span>
          </div>
          {qualityResult.suggestions.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {qualityResult.suggestions.slice(0, 3).map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-emerald-700">
              {locale === 'zh'
                ? '结构和长度都比较合适，可以继续补充更具体的结果数据。'
                : 'Structure and length look good. You can add more concrete metrics if needed.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
