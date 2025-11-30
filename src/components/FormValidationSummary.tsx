/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * 表单验证摘要组件
 * 显示表单整体验证状态和错误汇总
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

interface ValidationState {
  isValid: boolean
  message?: string
}

interface FormValidationSummaryProps {
  validationState: { [key: string]: ValidationState }
  className?: string
  showSuccessMessage?: boolean
}

/**
 * 表单验证摘要组件
 */
export default function FormValidationSummary({
  validationState,
  className = '',
  showSuccessMessage = true
}: FormValidationSummaryProps) {
  const errors = Object.entries(validationState).filter(([_, state]) => !state.isValid && state.message)
  const validFields = Object.entries(validationState).filter(([_, state]) => state.isValid)
  const totalFields = Object.keys(validationState).length
  const hasErrors = errors.length > 0
  const isFormValid = errors.length === 0 && totalFields > 0

  if (totalFields === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {/* 错误摘要 */}
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  请修正以下 {errors.length} 个错误：
                </h3>
                <ul className="space-y-1">
                  {errors.map(([field, state], index) => (
                    <li key={field} className="text-sm text-red-700 flex items-start space-x-2">
                      <span className="text-red-400 font-medium">{index + 1}.</span>
                      <span>{state.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* 成功消息 */}
        {isFormValid && showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  表单验证通过！所有必填信息已正确填写。
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 进度指示器 */}
        {totalFields > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">表单完成度</span>
              <span className="text-sm text-gray-600">
                {validFields.length}/{totalFields}
              </span>
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(validFields.length / totalFields) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-2 rounded-full transition-colors duration-300 ${
                  hasErrors 
                    ? 'bg-red-400' 
                    : validFields.length === totalFields 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                }`}
              />
            </div>
            
            {/* 状态文本 */}
            <div className="mt-2 flex items-center space-x-2">
              {hasErrors ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-orange-600">
                    还有 {errors.length} 个字段需要修正
                  </span>
                </>
              ) : validFields.length === totalFields ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">
                    所有字段验证通过
                  </span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-xs text-blue-600">
                    还有 {totalFields - validFields.length} 个字段待填写
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 简化版验证摘要组件
 */
interface SimpleValidationSummaryProps {
  hasErrors: boolean
  errorCount: number
  totalFields: number
  validFields: number
  className?: string
}

export function SimpleValidationSummary({
  hasErrors,
  errorCount,
  totalFields,
  validFields,
  className = ''
}: SimpleValidationSummaryProps) {
  if (totalFields === 0) return null

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {hasErrors ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-600">{errorCount} 个错误</span>
        </>
      ) : validFields === totalFields ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-600">验证通过</span>
        </>
      ) : (
        <>
          <div className="h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-blue-600">{validFields}/{totalFields} 已完成</span>
        </>
      )}
    </div>
  )
}