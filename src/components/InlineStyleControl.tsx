/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Palette } from 'lucide-react'

interface InlineStyleControlProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ReactNode
}

/**
 * 内联样式控制组件
 * 用于在各个功能区域直接显示相关的样式设置
 */
export default function InlineStyleControl({ 
  title, 
  children, 
  defaultExpanded = false,
  icon = <Palette className="w-4 h-4" />
}: InlineStyleControlProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-white/40 rounded-xl bg-white/40 backdrop-blur-md">
      {/* 标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/50 transition-all rounded-xl"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? '收起' : '展开'} ${title}设置`}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* 内容区域 */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100/50">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 颜色选择器组件
 */
export function ColorPicker({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: string
  onChange: (color: string) => void 
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600" htmlFor={`color-${label}`}>{label}</label>
      <div className="flex items-center space-x-2">
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-gray-200/60 cursor-pointer hover:scale-110 transition-transform"
          aria-label={`${label}颜色选择器`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-200/60 bg-white/50 rounded-lg focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80 transition-all backdrop-blur-sm"
          placeholder="#000000"
          aria-label={`${label}颜色代码`}
        />
      </div>
    </div>
  )
}

/**
 * 滑块控制组件
 */
export function SliderControl({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  unit = ''
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600" htmlFor={`slider-${label}`}>{label}</label>
        <span className="text-xs text-gray-500">{value}{unit}</span>
      </div>
      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200/60 rounded-lg appearance-none cursor-pointer slider accent-blue-500 hover:accent-blue-600 transition-all"
        aria-label={`${label}调节滑块`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  )
}

/**
 * 间距控制组件
 * 提供多种间距调整选项
 */
export function SpacingControl({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 50, 
  step = 1,
  unit = 'px'
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600" htmlFor={`spacing-${label}`}>{label}</label>
        <span className="text-xs text-gray-500">{value}{unit}</span>
      </div>
      <input
        id={`spacing-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200/60 rounded-lg appearance-none cursor-pointer slider accent-blue-500 hover:accent-blue-600 transition-all"
        aria-label={`${label}间距调节`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

/**
 * 字体大小控制组件
 */
export function FontSizeControl({ 
  label, 
  value, 
  onChange, 
  min = 10, 
  max = 32, 
  step = 1,
  unit = 'px'
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600" htmlFor={`fontsize-${label}`}>{label}</label>
        <span className="text-xs text-gray-500">{value}{unit}</span>
      </div>
      <input
        id={`fontsize-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200/60 rounded-lg appearance-none cursor-pointer slider accent-blue-500 hover:accent-blue-600 transition-all"
        aria-label={`${label}字号调节`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

/**
 * 选择器组件
 */
export function SelectorControl({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center space-x-1 px-3 py-2 text-xs rounded-xl border transition-all duration-200 transform hover:scale-105 ${
              value === option.value
                ? 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm scale-105 font-medium'
                : 'bg-white/50 border-gray-200/60 text-gray-600 hover:bg-white/80 hover:border-gray-300/60 hover:shadow-sm'
            }`}
            role="radio"
            aria-checked={value === option.value}
            aria-label={option.label}
          >
            {option.icon && (
              <div className={`transition-colors duration-200 ${
                value === option.value ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {option.icon}
              </div>
            )}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}