/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-10-04
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ResumeData } from '@/types/resume'
import { ResumeScorer, ScoreResult } from '@/utils/resumeScorer'
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  XCircle,
  Award,
  Target,
  Zap
} from 'lucide-react'

interface ResumeScoreCardProps {
  resumeData: ResumeData
  className?: string
  showDetails?: boolean
}

/**
 * 简历评分卡片组件
 * 显示简历质量评分和改进建议
 */
export default function ResumeScoreCard({ 
  resumeData, 
  className = '',
  showDetails = true 
}: ResumeScoreCardProps) {
  // 计算评分
  const scoreResult: ScoreResult = useMemo(() => {
    return ResumeScorer.calculateScore(resumeData)
  }, [resumeData])

  const { totalScore, scores, suggestions, completeness, grade } = scoreResult

  /**
   * 获取分数颜色
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  /**
   * 获取分数背景色
   */
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50'
    if (score >= 80) return 'bg-blue-50'
    if (score >= 70) return 'bg-yellow-50'
    if (score >= 60) return 'bg-orange-50'
    return 'bg-red-50'
  }

  /**
   * 获取建议图标
   */
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  /**
   * 获取优先级建议（前3条）
   */
  const topSuggestions = suggestions.slice(0, 3)

  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg shadow-blue-900/5 ${className}`}>
      {/* 头部 - 总分 */}
      <div className={`p-6 ${getScoreBgColor(totalScore)}/50 border-b border-gray-200/50 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${getScoreBgColor(totalScore)}/80 shadow-sm`}>
              <Award className={`w-6 h-6 ${getScoreColor(totalScore)}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">简历质量评分</h3>
              <p className="text-sm text-gray-600 font-medium">
                {ResumeScorer.getGradeDescription(grade)}
              </p>
            </div>
          </div>
          
          {/* 总分显示 */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`text-4xl font-bold ${getScoreColor(totalScore)} drop-shadow-sm`}
            >
              {totalScore}
            </motion.div>
            <div className="text-sm text-gray-600 mt-1 font-medium">
              等级: <span className={`font-bold ${getScoreColor(totalScore)}`}>{grade}</span>
            </div>
          </div>
        </div>

        {/* 完成度进度条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2 font-medium">
            <span>完成度</span>
            <span className="font-bold">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-2 rounded-full ${
                completeness >= 80 ? 'bg-green-500' :
                completeness >= 60 ? 'bg-blue-500' :
                completeness >= 40 ? 'bg-yellow-500' :
                'bg-red-500'
              } shadow-sm`}
            />
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* 各部分得分 */}
          <div className="p-6 border-b border-gray-200/50">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-500" />
              各部分得分
            </h4>
            <div className="space-y-3">
              {Object.entries(scores).map(([key, score]) => {
                const labels: Record<string, string> = {
                  personalInfo: '个人信息',
                  experience: '工作经历',
                  education: '教育背景',
                  skills: '技能专长',
                  projects: '项目经验'
                }
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1 font-medium">
                      <span className="text-gray-700">{labels[key]}</span>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`h-1.5 rounded-full ${
                          score >= 80 ? 'bg-green-500' :
                          score >= 60 ? 'bg-blue-500' :
                          score >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        } shadow-sm`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 改进建议 */}
          {topSuggestions.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                优先改进建议
              </h4>
              <div className="space-y-3">
                {topSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-gray-100/50 hover:border-blue-100 transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-bold text-gray-900">
                          {suggestion.title}
                        </h5>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          +{suggestion.impact}分
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {suggestions.length > 3 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline decoration-blue-200 underline-offset-4 transition-all">
                    查看全部 {suggestions.length} 条建议
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 无建议时的提示 */}
          {suggestions.length === 0 && (
            <div className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                太棒了！您的简历已经很完善了 🎉
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
