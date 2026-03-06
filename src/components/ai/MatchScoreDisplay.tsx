/**
 * Match Score Display Component
 * 匹配分数显示组件 - 显示 JD 匹配分数和关键词（带圆形进度指示器和分类显示）
 * 
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-15
 * @updateDate 2026-01-16 - 添加圆形进度指示器和关键词分类显示
 */

'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle, Star, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { jdMatcherService, CategorizedKeywords } from '@/services/jdMatcher'

interface MatchScoreDisplayProps {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  /** 分类后的匹配关键词 */
  categorizedMatched?: CategorizedKeywords
  /** 分类后的缺失关键词 */
  categorizedMissing?: CategorizedKeywords
  className?: string
}

/**
 * 关键词标签组件
 */
function KeywordTag({ 
  keyword, 
  importance, 
  isMatched,
  delay = 0 
}: { 
  keyword: string
  importance?: 'required' | 'preferred' | 'niceToHave'
  isMatched: boolean
  delay?: number 
}) {
  const importanceConfig = useMemo(() => {
    if (!importance) return null
    
    switch (importance) {
      case 'required':
        return {
          icon: AlertTriangle,
          bgColor: isMatched ? 'bg-green-100' : 'bg-red-100',
          textColor: isMatched ? 'text-green-700' : 'text-red-700',
          borderColor: isMatched ? 'border-green-300' : 'border-red-300',
          label: '必需'
        }
      case 'preferred':
        return {
          icon: Star,
          bgColor: isMatched ? 'bg-green-50' : 'bg-orange-50',
          textColor: isMatched ? 'text-green-600' : 'text-orange-600',
          borderColor: isMatched ? 'border-green-200' : 'border-orange-200',
          label: '优先'
        }
      case 'niceToHave':
        return {
          icon: Sparkles,
          bgColor: isMatched ? 'bg-green-50' : 'bg-gray-50',
          textColor: isMatched ? 'text-green-600' : 'text-gray-600',
          borderColor: isMatched ? 'border-green-200' : 'border-gray-200',
          label: '加分'
        }
    }
  }, [importance, isMatched])

  const baseStyle = isMatched 
    ? 'bg-green-100 text-green-700' 
    : 'bg-red-100 text-red-700'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
        importanceConfig 
          ? `${importanceConfig.bgColor} ${importanceConfig.textColor} ${importanceConfig.borderColor}` 
          : baseStyle
      }`}
    >
      {importanceConfig && (
        <importanceConfig.icon className="w-3 h-3" />
      )}
      {keyword}
    </motion.span>
  )
}

/**
 * 圆形进度指示器组件
 */
function CircularProgress({ 
  score, 
  size = 120, 
  strokeWidth = 8 
}: { 
  score: number
  size?: number
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  // 根据分数获取颜色
  const getColor = (score: number) => {
    if (score >= 70) return '#22c55e' // green-500
    if (score >= 40) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  const color = getColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆环 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {/* 中心分数 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-3xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-500">分</span>
      </div>
    </div>
  )
}

/**
 * 分类关键词展示组件
 */
function CategorizedKeywordsDisplay({
  title,
  icon: Icon,
  categorized,
  isMatched,
  defaultExpanded = true
}: {
  title: string
  icon: React.ElementType
  categorized: CategorizedKeywords
  isMatched: boolean
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  
  const totalCount = categorized.required.length + categorized.preferred.length + categorized.niceToHave.length
  
  if (totalCount === 0) return null

  const baseColor = isMatched ? 'green' : 'red'

  return (
    <div className={`p-4 bg-${baseColor}-50 rounded-xl border border-${baseColor}-100`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${baseColor}-600`} />
          <span className={`text-sm font-medium text-${baseColor}-700`}>
            {title}
          </span>
          <span className={`text-xs bg-${baseColor}-100 text-${baseColor}-700 px-2 py-0.5 rounded-full font-medium`}>
            {totalCount}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className={`w-4 h-4 text-${baseColor}-600`} />
        ) : (
          <ChevronDown className={`w-4 h-4 text-${baseColor}-600`} />
        )}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {/* 必需关键词 */}
              {categorized.required.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs font-medium text-gray-600">必需</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorized.required.map((keyword, index) => (
                      <KeywordTag
                        key={keyword}
                        keyword={keyword}
                        importance="required"
                        isMatched={isMatched}
                        delay={index * 0.03}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* 优先关键词 */}
              {categorized.preferred.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-gray-600">优先</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorized.preferred.map((keyword, index) => (
                      <KeywordTag
                        key={keyword}
                        keyword={keyword}
                        importance="preferred"
                        isMatched={isMatched}
                        delay={index * 0.03}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* 加分项关键词 */}
              {categorized.niceToHave.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">加分项</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorized.niceToHave.map((keyword, index) => (
                      <KeywordTag
                        key={keyword}
                        keyword={keyword}
                        importance="niceToHave"
                        isMatched={isMatched}
                        delay={index * 0.03}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MatchScoreDisplay({
  score,
  matchedKeywords,
  missingKeywords,
  categorizedMatched,
  categorizedMissing,
  className = ''
}: MatchScoreDisplayProps) {
  const { t } = useLanguage()

  // 获取匹配等级
  const matchLevel = useMemo(() => jdMatcherService.getMatchLevel(score), [score])

  // 根据分数获取颜色配置
  const scoreConfig = useMemo(() => {
    if (score >= 70) {
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
        progressColor: 'bg-green-500',
        icon: TrendingUp,
        message: t.editor.jdMatcher.highMatch
      }
    } else if (score >= 40) {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-600',
        progressColor: 'bg-yellow-500',
        icon: Minus,
        message: t.editor.jdMatcher.mediumMatch
      }
    } else {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-600',
        progressColor: 'bg-red-500',
        icon: TrendingDown,
        message: t.editor.jdMatcher.lowMatch
      }
    }
  }, [score, t])

  const IconComponent = scoreConfig.icon

  // 是否有分类数据
  const hasCategorizedData = categorizedMatched && categorizedMissing

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 分数显示 - 使用圆形进度指示器 */}
      <div className={`p-6 rounded-xl ${scoreConfig.bgColor} ${scoreConfig.borderColor} border`}>
        <div className="flex items-center gap-6">
          {/* 圆形进度 */}
          <CircularProgress score={score} />
          
          {/* 分数信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className={`w-5 h-5 ${scoreConfig.textColor}`} />
              <span className="text-lg font-semibold text-gray-900">
                {t.editor.jdMatcher.matchScore}
              </span>
            </div>
            
            <p className={`text-sm ${scoreConfig.textColor} mb-3`}>
              {scoreConfig.message}
            </p>
            
            {/* 统计信息 */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">匹配: </span>
                <span className="font-medium text-green-600">{matchedKeywords.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">缺失: </span>
                <span className="font-medium text-red-600">{missingKeywords.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 关键词展示 */}
      {hasCategorizedData ? (
        // 分类显示模式
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategorizedKeywordsDisplay
            title={t.editor.jdMatcher.matchedKeywords}
            icon={CheckCircle}
            categorized={categorizedMatched}
            isMatched={true}
          />
          <CategorizedKeywordsDisplay
            title={t.editor.jdMatcher.missingKeywords}
            icon={XCircle}
            categorized={categorizedMissing}
            isMatched={false}
          />
        </div>
      ) : (
        // 简单显示模式（向后兼容）
        <div className="grid grid-cols-2 gap-4">
          {/* 匹配的关键词 */}
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {t.editor.jdMatcher.matchedKeywords}
              </span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {matchedKeywords.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {matchedKeywords.length > 0 ? (
                matchedKeywords.map((keyword, index) => (
                  <KeywordTag
                    key={index}
                    keyword={keyword}
                    isMatched={true}
                    delay={index * 0.03}
                  />
                ))
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          </div>

          {/* 缺失的关键词 */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {t.editor.jdMatcher.missingKeywords}
              </span>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {missingKeywords.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {missingKeywords.length > 0 ? (
                missingKeywords.map((keyword, index) => (
                  <KeywordTag
                    key={index}
                    keyword={keyword}
                    isMatched={false}
                    delay={index * 0.03}
                  />
                ))
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchScoreDisplay
