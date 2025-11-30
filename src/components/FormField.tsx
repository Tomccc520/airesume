/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * 通用表单字段组件
 * 包含验证、错误显示和各种输入类型支持
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react'
import { validateField, FieldValidation } from '../utils/validation'

interface FormFieldProps {
  label: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'textarea' | 'select' | 'month' | 'date' | 'range' | 'number'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  validation?: FieldValidation
  options?: { value: string; label: string }[]
  rows?: number
  className?: string
  showValidation?: boolean
  onValidationChange?: (isValid: boolean, message?: string) => void
  showAiButton?: boolean
  onAiOptimize?: () => void
  aiLoading?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
}

/**
 * 通用表单字段组件
 */
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  validation,
  options = [],
  rows = 3,
  className = '',
  showValidation = true,
  onValidationChange,
  showAiButton = false,
  onAiOptimize,
  aiLoading = false,
  min,
  max,
  step
}: FormFieldProps) {
  const [error, setError] = useState<string>('')
  const [touched, setTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isValid, setIsValid] = useState(false)

  /**
   * 验证字段值
   */
  const validateValue = useCallback((val: string | number) => {
    const stringVal = String(val)
    if (!validation && !required) {
      setIsValid(!!stringVal.trim())
      return
    }

    const rules = {
      required,
      ...validation
    }

    const result = validateField(stringVal, rules, label)
    const errorMessage = result.isValid ? '' : result.message || ''
    
    setError(errorMessage)
    setIsValid(result.isValid)
    
    if (onValidationChange) {
      onValidationChange(result.isValid, errorMessage)
    }
  }, [validation, required, label, onValidationChange])

  /**
   * 处理值变化
   */
  const handleChange = (newValue: string) => {
    setIsTyping(true)
    onChange(newValue)
    
    // 延迟验证，避免用户输入时频繁显示错误
    setTimeout(() => {
      setIsTyping(false)
      if (touched) {
        validateValue(newValue)
      }
    }, 500)
  }

  /**
   * 处理失去焦点
   */
  const handleBlur = () => {
    setTouched(true)
    setIsTyping(false)
    validateValue(value)
  }

  /**
   * 处理获得焦点
   */
  const handleFocus = () => {
    setIsTyping(true)
  }

  /**
   * 监听值变化进行验证
   */
  useEffect(() => {
    if (touched && !isTyping) {
      validateValue(value)
    }
  }, [value, touched, validation, required, isTyping, validateValue])

  /**
   * 获取输入框样式
   */
  const getInputClassName = () => {
    if (type === 'range') {
      return `w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 ${className}`
    }

    const baseClass = 'w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 min-h-[44px] text-base backdrop-blur-sm'
    
    let borderClass = 'border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/20 hover:bg-white/60'
    
    if (touched && !isTyping) {
      if (error) {
        borderClass = 'border-red-500/50 bg-red-50/50 text-gray-900 placeholder-red-300 focus:border-red-500/50 focus:ring-red-500/20'
      } else if (isValid && String(value).trim()) {
        borderClass = 'border-green-500/50 bg-green-50/50 text-gray-900 placeholder-green-300 focus:border-green-500/50 focus:ring-green-500/20'
      }
    }
    
    const disabledClass = disabled ? 'bg-gray-50/50 text-gray-500 cursor-not-allowed opacity-60' : 'hover:border-blue-300/50'
    
    return `${baseClass} ${borderClass} ${disabledClass} ${className}`
  }

  /**
   * 渲染输入框
   */
  const renderInput = () => {
    const inputClassName = getInputClassName()
    const commonProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleChange(e.target.value),
      onBlur: handleBlur,
      onFocus: handleFocus,
      placeholder,
      disabled,
      className: inputClassName,
      'aria-invalid': error ? true : false,
      'aria-describedby': error ? `${label}-error` : undefined
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={inputClassName}
          />
        )

      case 'select':
        return (
          <select {...commonProps} className={inputClassName}>
            <option value="">{placeholder || '请选择...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        )

      default:
        return (
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
            step={step}
            className={inputClassName}
          />
        )
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showAiButton && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(243, 232, 255, 1)" }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onAiOptimize}
            disabled={aiLoading || disabled}
            className="group flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md"
          >
            <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{aiLoading ? 'AI优化中...' : 'AI 优化'}</span>
          </motion.button>
        )}
      </div>

      {/* 输入框 */}
      <div className="relative">
        {renderInput()}
        
        {/* 验证图标 */}
        {showValidation && touched && !isTyping && (
          <AnimatePresence>
            {error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <AlertCircle className="h-5 w-5 text-red-500" />
              </motion.div>
            ) : isValid && String(value).trim() ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
        
        {/* 输入提示 */}
        {isTyping && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <div className="h-5 w-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          </motion.div>
        )}
      </div>

      {/* 错误信息和帮助文本 */}
      {showValidation && (
        <AnimatePresence>
          {error && touched && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
              id={`${label}-error`}
              role="alert"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">错误：</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          

        </AnimatePresence>
      )}
      
      {/* 字符计数器（对于有长度限制的字段） */}
      {validation?.maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            String(value).length > validation.maxLength * 0.8 
              ? String(value).length >= validation.maxLength 
                ? 'text-red-500' 
                : 'text-orange-500'
              : 'text-gray-400'
          }`}>
            {String(value).length}/{validation.maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * 表单字段组合组件
 */
interface FormFieldGroupProps {
  children: React.ReactNode
  className?: string
}

export function FormFieldGroup({ children, className = '' }: FormFieldGroupProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 ${className}`}>
      {children}
    </div>
  )
}

/**
 * 表单验证状态钩子
 */
export function useFormValidation() {
  const [validationState, setValidationState] = useState<{ [key: string]: { isValid: boolean; message?: string } }>({})

  const updateValidation = (fieldName: string, isValid: boolean, message?: string) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: { isValid, message }
    }))
  }

  const isFormValid = () => {
    return Object.values(validationState).every(state => state.isValid)
  }

  const getFieldError = (fieldName: string) => {
    return validationState[fieldName]?.message || ''
  }

  const hasErrors = () => {
    return Object.values(validationState).some(state => !state.isValid)
  }

  return {
    validationState,
    updateValidation,
    isFormValid,
    getFieldError,
    hasErrors
  }
}