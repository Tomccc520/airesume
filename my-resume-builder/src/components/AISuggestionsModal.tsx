/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Sparkles, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
        return { icon: '🔧', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
      case 'addition':
        return { icon: '➕', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
      case 'optimization':
        return { icon: '⚡', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
      default:
        return { icon: '💡', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    }
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 弹窗内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col border border-white/20"
        >
          {/* 头部 */}
          <div className="flex-none flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="p-2.5 bg-blue-100/50 rounded-xl border border-blue-200/50 shadow-sm backdrop-blur-sm"
              >
                <Sparkles className="w-6 h-6 text-blue-600" />
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-gray-900"
                >
                  {title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-600 font-medium"
                >
                  {loading ? '正在生成建议...' : `共 ${suggestions.length} 条优化建议`}
                </motion.p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* 内容区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto">
            {/* 加载状态 */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <Loader2 className="h-12 w-12 text-indigo-600" />
                  </motion.div>
                  <motion.p 
                    key={thinkingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-600 mb-6 text-lg font-medium"
                  >
                    {thinkingText}
                  </motion.p>
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-indigo-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 建议列表 */}
            {!loading && suggestions.length > 0 && (
              <>
                {/* 操作栏 */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <motion.input
                        whileTap={{ scale: 0.9 }}
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplySelected}
                    disabled={selectedSuggestions.size === 0 || isBatchProcessing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
                  >
                    {isBatchProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isBatchProcessing ? '正在应用...' : `应用选中建议 (${selectedSuggestions.size})`}</span>
                  </motion.button>
                </div>

                {/* 建议卡片列表 */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-4 space-y-4"
                >
                  {suggestions.map((suggestion) => {
                    const style = getSuggestionStyle(suggestion.type)
                    const isSelected = selectedSuggestions.has(suggestion.id)
                    const isApplied = appliedSuggestions.has(suggestion.id)
                    const isProcessing = applyingId === suggestion.id

                    return (
                      <motion.div
                        key={suggestion.id}
                        variants={itemVariants}
                        layout
                        initial={false}
                        animate={{
                          scale: isSelected ? 1.01 : 1,
                          borderColor: isSelected ? 'rgba(59, 130, 246, 0.5)' : isApplied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.6)',
                          backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.6)' : isApplied ? 'rgba(240, 253, 244, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                        }}
                        whileHover={{ scale: isSelected ? 1.01 : 1.005 }}
                        whileTap={{ scale: 0.99 }}
                        className={`group relative p-4 border rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                          !isSelected && !isApplied ? 'hover:bg-white/60 hover:border-blue-200/50 hover:shadow-lg hover:shadow-blue-900/5' : ''
                        } ${isSelected ? 'shadow-md shadow-blue-900/10' : ''}`}
                        onClick={() => !isApplied && !isBatchProcessing && toggleSuggestion(suggestion.id)}
                      >
                        <div className="flex items-start space-x-4">
                          {/* 选择框 */}
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            <motion.div
                              whileTap={{ scale: 0.8 }}
                              onClick={() => !isApplied && !isBatchProcessing && toggleSuggestion(suggestion.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-gray-300 bg-white/80'
                              } ${isApplied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </motion.div>
                          </div>

                          {/* 建议内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-xl filter drop-shadow-sm">{style.icon}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${style.border} ${style.bg} ${style.color}`}>
                                {suggestion.category}
                              </span>
                              <AnimatePresence>
                                {isApplied && (
                                  <motion.span 
                                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className="flex items-center space-x-1 text-xs font-bold text-green-600 bg-green-100/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-green-200"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>已应用</span>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                              {suggestion.content}
                            </p>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(suggestion.content)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                              title="复制建议"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApplySingle(suggestion)}
                              disabled={isApplied || isBatchProcessing || applyingId !== null}
                              className={`flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                isApplied
                                  ? 'bg-green-100/50 text-green-600 cursor-not-allowed border border-green-200/50'
                                  : isProcessing
                                  ? 'bg-blue-500 text-white cursor-wait shadow-md'
                                  : 'bg-white/80 text-blue-600 border border-blue-200/50 hover:bg-blue-50/80 hover:border-blue-300 hover:shadow-md backdrop-blur-sm'
                              }`}
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              <span>{isApplied ? '已应用' : isProcessing ? '应用中' : '应用'}</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </>
            )}

            {/* 空状态 */}
            {!loading && suggestions.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-gray-500"
              >
                <div className="bg-gray-50/50 p-6 rounded-full mb-4 backdrop-blur-sm border border-gray-100">
                  <AlertCircle className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-lg font-bold mb-2 text-gray-900">暂无优化建议</p>
                <p className="text-sm text-gray-500 font-medium">AI 认为当前内容已经很棒了，无需优化</p>
              </motion.div>
            )}
          </div>

          {/* 底部操作栏 */}
          {!loading && suggestions.length > 0 && (
            <div className="flex-none flex items-center justify-between p-6 border-t border-gray-200/50 bg-gray-50/80 backdrop-blur-md">
              <div className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-green-600">{appliedSuggestions.size}</span> 条建议已应用，
                <span className="font-bold text-blue-600">{suggestions.length - appliedSuggestions.size}</span> 条待处理
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-white/80 border border-gray-200/50 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium backdrop-blur-sm"
                >
                  关闭
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplyAll}
                  disabled={appliedSuggestions.size === suggestions.length || isBatchProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 flex items-center gap-2 font-medium"
                >
                  {isBatchProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isBatchProcessing ? '正在应用...' : '应用全部建议'}</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export type { AISuggestion }
