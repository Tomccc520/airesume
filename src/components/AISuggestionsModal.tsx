/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import React, { useState } from 'react'
import { X, Check, Sparkles, Copy, CheckCircle2, AlertCircle, Loader2, Wrench, Plus, Zap, Lightbulb } from 'lucide-react'
import { useToastContext } from '@/components/Toast'

interface AISuggestion {
  id: string
  content: string
  type: 'improvement' | 'addition' | 'optimization'
  category: string
  applied?: boolean
}

interface AISuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  suggestions: AISuggestion[]
  title: string
  onApplySuggestion: (suggestion: AISuggestion) => void
  onApplyAll: (suggestions: AISuggestion[]) => void
  loading?: boolean
}

/**
 * AI建议选择弹窗组件
 * 显示AI生成的优化建议，支持单个或批量应用
 */
export default function AISuggestionsModal({
  isOpen,
  onClose,
  suggestions,
  title,
  onApplySuggestion,
  onApplyAll,
  loading = false
}: AISuggestionsModalProps) {
  const { success: showSuccessToast } = useToastContext()
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [thinkingText, setThinkingText] = useState('AI正在分析并生成优化建议...')

  // 思考状态文字轮播
  React.useEffect(() => {
    if (!loading) return
    
    const texts = [
      'AI正在分析并生成优化建议...',
      '正在检查内容完整性...',
      '正在优化语言表达...',
      '即将完成...'
    ]
    let index = 0
    
    const interval = setInterval(() => {
      index = (index + 1) % texts.length
      setThinkingText(texts[index])
    }, 2000)
    
    return () => clearInterval(interval)
  }, [loading])

  // 切换建议选择状态
  const toggleSuggestion = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId)
    } else {
      newSelected.add(suggestionId)
    }
    setSelectedSuggestions(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSuggestions.size === suggestions.length) {
      setSelectedSuggestions(new Set())
    } else {
      setSelectedSuggestions(new Set(suggestions.map(s => s.id)))
    }
  }

  // 应用单个建议
  const handleApplySingle = async (suggestion: AISuggestion) => {
    setApplyingId(suggestion.id)
    // 模拟应用延迟
    await new Promise(resolve => setTimeout(resolve, 600))
    
    onApplySuggestion(suggestion)
    setAppliedSuggestions(prev => new Set([...Array.from(prev), suggestion.id]))
    setApplyingId(null)
  }

  // 批量应用建议逻辑
  const applySuggestionsBatch = async (suggestionsToApply: AISuggestion[]) => {
    if (suggestionsToApply.length === 0) return

    setIsBatchProcessing(true)
    let appliedCount = 0
    
    // 逐个应用建议，添加视觉延迟效果
    for (const suggestion of suggestionsToApply) {
      if (!appliedSuggestions.has(suggestion.id)) {
        setApplyingId(suggestion.id)
        await new Promise(resolve => setTimeout(resolve, 400)) // 模拟处理时间
        onApplySuggestion(suggestion)
        setAppliedSuggestions(prev => new Set([...Array.from(prev), suggestion.id]))
        appliedCount++
      }
    }
    
    // 清除选中状态
    setSelectedSuggestions(prev => {
      const newSelected = new Set(prev)
      suggestionsToApply.forEach(s => newSelected.delete(s.id))
      return newSelected
    })
    
    setApplyingId(null)
    setIsBatchProcessing(false)

    if (appliedCount > 0) {
      showSuccessToast(`已成功应用 ${appliedCount} 条优化建议`, 'success')
    }
  }

  // 应用选中的建议
  const handleApplySelected = () => {
    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.has(s.id))
    applySuggestionsBatch(selectedSuggestionObjects)
  }

  // 应用全部建议
  const handleApplyAll = () => {
    const unappliedSuggestions = suggestions.filter(s => !appliedSuggestions.has(s.id))
    applySuggestionsBatch(unappliedSuggestions)
  }

  // 复制建议内容
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  // 获取建议类型的图标和颜色
  const getSuggestionStyle = (type: AISuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return { icon: <Wrench className="w-5 h-5 text-blue-600" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
      case 'addition':
        return { icon: <Plus className="w-5 h-5 text-green-600" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
      case 'optimization':
        return { icon: <Zap className="w-5 h-5 text-purple-600" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
      default:
        return { icon: <Lightbulb className="w-5 h-5 text-gray-600" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div
        className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
      >
        {/* 头部 */}
        <div className="flex-none flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {loading ? '正在生成建议...' : `共 ${suggestions.length} 条优化建议`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* 内容区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto">
            {/* 加载状态 */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block mb-6">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  </div>
                  <p className="text-gray-600 mb-6 text-lg font-medium">
                    {thinkingText}
                  </p>
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 建议列表 */}
            {!loading && suggestions.length > 0 && (
              <>
                {/* 操作栏 */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.size === suggestions.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors font-medium">全选</span>
                    </label>
                    <span className="text-sm text-gray-500 font-medium">
                      已选择 <span className="font-bold text-blue-600">{selectedSuggestions.size}</span> 条建议
                    </span>
                  </div>
                  <button
                    onClick={handleApplySelected}
                    disabled={selectedSuggestions.size === 0 || isBatchProcessing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {isBatchProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isBatchProcessing ? '正在应用...' : `应用选中建议 (${selectedSuggestions.size})`}</span>
                  </button>
                </div>

                {/* 建议卡片列表 */}
                <div className="p-4 space-y-4">
                  {suggestions.map((suggestion) => {
                    const style = getSuggestionStyle(suggestion.type)
                    const isSelected = selectedSuggestions.has(suggestion.id)
                    const isApplied = appliedSuggestions.has(suggestion.id)
                    const isProcessing = applyingId === suggestion.id

                    return (
                      <div
                        key={suggestion.id}
                        className={`group relative p-4 border rounded-xl transition-colors cursor-pointer ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : isApplied 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300'
                        }`}
                        onClick={() => !isApplied && !isBatchProcessing && toggleSuggestion(suggestion.id)}
                      >
                        <div className="flex items-start space-x-4">
                          {/* 选择框 */}
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            <div
                              onClick={() => !isApplied && !isBatchProcessing && toggleSuggestion(suggestion.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-gray-300 bg-white/80'
                              } ${isApplied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>

                          {/* 建议内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="filter drop-shadow-sm">{style.icon}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${style.border} ${style.bg} ${style.color}`}>
                                {suggestion.category}
                              </span>
                              {isApplied && (
                                <span className="flex items-center space-x-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>已应用</span>
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                              {suggestion.content}
                            </p>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => copyToClipboard(suggestion.content)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                              title="复制建议"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApplySingle(suggestion)}
                              disabled={isApplied || isBatchProcessing || applyingId !== null}
                              className={`flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm ${
                                isApplied
                                  ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                                  : isProcessing
                                  ? 'bg-blue-500 text-white cursor-wait shadow-md'
                                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                              }`}
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              <span>{isApplied ? '已应用' : isProcessing ? '应用中' : '应用'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* 空状态 */}
            {!loading && suggestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="bg-gray-50/50 p-6 rounded-full mb-4 backdrop-blur-sm border border-gray-100">
                  <AlertCircle className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-lg font-bold mb-2 text-gray-900">暂无优化建议</p>
                <p className="text-sm text-gray-500 font-medium">AI 认为当前内容已经很棒了，无需优化</p>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          {!loading && suggestions.length > 0 && (
            <div className="flex-none flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-green-600">{appliedSuggestions.size}</span> 条建议已应用，
                <span className="font-bold text-blue-600">{suggestions.length - appliedSuggestions.size}</span> 条待处理
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm font-medium"
                >
                  关闭
                </button>
                <button
                  onClick={handleApplyAll}
                  disabled={appliedSuggestions.size === suggestions.length || isBatchProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2 font-medium"
                >
                  {isBatchProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isBatchProcessing ? '正在应用...' : '应用全部建议'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}

export type { AISuggestion }
