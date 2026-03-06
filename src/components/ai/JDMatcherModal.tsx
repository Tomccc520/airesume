/**
 * JD Matcher Modal Component
 * 职位描述匹配弹窗组件 - 分析 JD 并显示匹配结果和优化建议
 * 
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-15
 * @updateDate 2026-01-16 - 改进建议展示界面、添加快速重新生成和内联编辑功能
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Sparkles, AlertCircle, RefreshCw, Edit3, Check, Copy, Lightbulb } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ResumeData } from '@/types/resume'
import { jdMatcherService, JDMatchResult, JDSuggestion } from '@/services/jdMatcher'
import { MatchScoreDisplay } from './MatchScoreDisplay'
import { ProgressIndicator } from './ProgressIndicator'

interface JDMatcherModalProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  onApplySuggestion?: (suggestion: JDSuggestion) => void
  onApplyAllSuggestions?: (suggestions: JDSuggestion[]) => void
}

/**
 * 可编辑建议卡片组件
 */
function EditableSuggestionCard({
  suggestion,
  index,
  onApply,
  t
}: {
  suggestion: JDSuggestion
  index: number
  onApply?: (suggestion: JDSuggestion) => void
  t: ReturnType<typeof useLanguage>['t']
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(suggestion.suggestedText)
  const [copied, setCopied] = useState(false)

  const handleSave = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleCancel = useCallback(() => {
    setEditedText(suggestion.suggestedText)
    setIsEditing(false)
  }, [suggestion.suggestedText])

  const handleApply = useCallback(() => {
    if (onApply) {
      onApply({
        ...suggestion,
        suggestedText: editedText
      })
    }
  }, [onApply, suggestion, editedText])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [editedText])

  // 获取 section 的中文名称
  const sectionName = useMemo(() => {
    const sectionMap: Record<string, string> = {
      summary: '个人简介',
      experience: '工作经历',
      skills: '技能',
      projects: '项目经历'
    }
    return sectionMap[suggestion.section] || suggestion.section
  }, [suggestion.section])

  // 获取 section 的颜色
  const sectionColor = useMemo(() => {
    const colorMap: Record<string, string> = {
      summary: 'bg-purple-100 text-purple-700',
      experience: 'bg-blue-100 text-blue-700',
      skills: 'bg-green-100 text-green-700',
      projects: 'bg-orange-100 text-orange-700'
    }
    return colorMap[suggestion.section] || 'bg-gray-100 text-gray-700'
  }, [suggestion.section])

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* 头部：section 标签和操作按钮 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sectionColor}`}>
                {sectionName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="复制"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 建议内容 */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {editedText}
            </p>
          )}

          {/* 原因说明 */}
          {!isEditing && (
            <p className="text-xs text-gray-500 mb-3">
              {suggestion.reason}
            </p>
          )}

          {/* 关键词标签 */}
          {!isEditing && suggestion.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {suggestion.keywords.map((keyword, kidx) => (
                <span
                  key={kidx}
                  className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* 应用按钮 */}
          {!isEditing && onApply && (
            <button
              onClick={handleApply}
              className="w-full py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
            >
              {t.editor.jdMatcher.applySuggestion}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function JDMatcherModal({
  isOpen,
  onClose,
  resumeData,
  onApplySuggestion,
  onApplyAllSuggestions
}: JDMatcherModalProps) {
  const { t } = useLanguage()
  const [jdText, setJdText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [matchResult, setMatchResult] = useState<JDMatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * 分析 JD 与简历的匹配度
   */
  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim()) {
      setError(t.editor.jdMatcher.noKeywords)
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // 提取并分类关键词
      setAnalysisProgress(30)
      const categorizedKeywords = jdMatcherService.extractAndCategorizeKeywords(jdText)
      const allKeywords = [
        ...categorizedKeywords.required,
        ...categorizedKeywords.preferred,
        ...categorizedKeywords.niceToHave
      ]
      
      if (allKeywords.length === 0) {
        clearInterval(progressInterval)
        setError(t.editor.jdMatcher.noKeywords)
        setIsAnalyzing(false)
        setAnalysisProgress(0)
        return
      }

      setAnalysisProgress(60)

      // 分析匹配度（传入 jdText 以获取分类信息）
      const result = jdMatcherService.analyzeResume(resumeData, allKeywords, jdText)
      
      setAnalysisProgress(100)
      clearInterval(progressInterval)
      
      // 短暂延迟后显示结果
      setTimeout(() => {
        setMatchResult(result)
        setIsAnalyzing(false)
      }, 300)
    } catch (err) {
      console.error('JD analysis error:', err)
      setError('分析失败，请重试')
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }, [jdText, resumeData, t])

  /**
   * 重新分析
   */
  const handleReanalyze = useCallback(() => {
    setMatchResult(null)
    handleAnalyze()
  }, [handleAnalyze])

  /**
   * 应用单个建议
   */
  const handleApplySuggestion = useCallback((suggestion: JDSuggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    }
  }, [onApplySuggestion])

  /**
   * 应用所有建议
   */
  const handleApplyAll = useCallback(() => {
    if (matchResult && onApplyAllSuggestions) {
      onApplyAllSuggestions(matchResult.suggestions)
    }
  }, [matchResult, onApplyAllSuggestions])

  /**
   * 重置状态
   */
  const handleReset = useCallback(() => {
    setJdText('')
    setMatchResult(null)
    setError(null)
    setAnalysisProgress(0)
  }, [])

  /**
   * 关闭弹窗
   */
  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* 弹窗内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-gray-50 rounded-2xl shadow-2xl overflow-hidden mx-4"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t.editor.jdMatcher.title}</h2>
                <p className="text-sm text-gray-500">{t.editor.jdMatcher.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* JD 输入区域 */}
            <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.editor.jdMatcher.pasteJD}
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder={t.editor.jdMatcher.placeholder}
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50"
                disabled={isAnalyzing}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* 分析进度 */}
            {isAnalyzing && (
              <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
                <ProgressIndicator
                  progress={analysisProgress}
                  status="loading"
                  message={t.editor.jdMatcher.analyzing}
                  variant="linear"
                />
              </div>
            )}

            {/* 分析按钮 */}
            {!matchResult && !isAnalyzing && (
              <div className="mb-6">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jdText.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.editor.jdMatcher.analyze}
                </button>
              </div>
            )}

            {/* 匹配结果 */}
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 快速重新分析按钮 */}
                <div className="flex justify-end">
                  <button
                    onClick={handleReanalyze}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新分析
                  </button>
                </div>

                {/* 匹配分数显示 */}
                <MatchScoreDisplay
                  score={matchResult.score}
                  matchedKeywords={matchResult.matchedKeywords}
                  missingKeywords={matchResult.missingKeywords}
                  categorizedMatched={matchResult.categorizedMatched}
                  categorizedMissing={matchResult.categorizedMissing}
                />

                {/* 优化建议 */}
                {matchResult.suggestions.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-base font-semibold text-gray-900">
                          {t.editor.jdMatcher.suggestions}
                        </h3>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          {matchResult.suggestions.length} 条
                        </span>
                      </div>
                      {onApplyAllSuggestions && matchResult.suggestions.length > 1 && (
                        <button
                          onClick={handleApplyAll}
                          className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-md"
                        >
                          {t.editor.jdMatcher.applyAll}
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchResult.suggestions.map((suggestion, index) => (
                        <EditableSuggestionCard
                          key={index}
                          suggestion={suggestion}
                          index={index}
                          onApply={onApplySuggestion ? handleApplySuggestion : undefined}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default JDMatcherModal
