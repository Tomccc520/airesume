/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * @updateDate 2026.2.2 - Nuxt 风格：简洁、优雅、现代，移除预览功能
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Check, Heart, Columns, FileText } from 'lucide-react'
import { TemplateStyle } from '@/types/template'
import TemplatePreview from '../TemplatePreview'
import { useLanguage } from '@/contexts/LanguageContext'
import { isFavoriteTemplate, toggleFavoriteTemplate } from '@/utils/templateFavorites'

interface TemplateCardProps {
  template: TemplateStyle
  isSelected: boolean
  onClick: () => void
  onPreview?: () => void
}

/**
 * 模板卡片组件 - Nuxt 风格
 * 简洁、优雅、现代
 */
export default function TemplateCard({
  template,
  isSelected,
  onClick
}: TemplateCardProps) {
  const { locale } = useLanguage()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setIsFavorite(isFavoriteTemplate(template.id))
  }, [template.id])

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = toggleFavoriteTemplate(template.id)
    setIsFavorite(newState)
  }

  const getTemplateName = () => {
    return locale === 'en' && template.nameEn ? template.nameEn : template.name
  }

  const getTemplateDescription = () => {
    return locale === 'en' && template.descriptionEn ? template.descriptionEn : template.description
  }

  // 获取布局类型
  const getLayoutType = () => {
    if (template.layoutType === 'left-right' || template.layout.columns.count === 2) {
      return {
        icon: Columns,
        label: locale === 'en' ? 'Two Columns' : '双栏布局',
        color: 'text-purple-600 bg-purple-50'
      }
    }
    return {
      icon: FileText,
      label: locale === 'en' ? 'Single Column' : '单栏布局',
      color: 'text-blue-600 bg-blue-50'
    }
  }

  const layoutInfo = getLayoutType()
  const LayoutIcon = layoutInfo.icon

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 选中标识 - Nuxt 风格 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
      )}

      {/* 收藏按钮 - Nuxt 风格 */}
        <button
          onClick={handleToggleFavorite}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-md transition-all ${
            isFavorite 
            ? 'bg-red-50 text-red-500' 
            : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50'
        } ${isHovered || isFavorite ? 'opacity-100' : 'opacity-0'}`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

      {/* 布局类型标签 - 优化设计 */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${layoutInfo.color} shadow-sm`}>
          <LayoutIcon className="h-3 w-3" />
          <span>{layoutInfo.label}</span>
        </div>
      </div>

      {/* 预览图 */}
      <div className="aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden relative">
        <TemplatePreview template={template} />
      </div>

      {/* 信息区 - Nuxt 风格 */}
      <div className="p-3">
        <h3 className={`font-medium text-sm mb-1 ${
          isSelected ? 'text-emerald-600' : 'text-gray-900'
        }`}>
            {getTemplateName()}
          </h3>
        
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {getTemplateDescription()}
        </p>

        {/* 标签 - 新增 */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 底部 */}
        <div className="flex items-center justify-between">
          {/* 颜色 */}
          <div className="flex gap-1">
            {Object.values(template.colors).slice(0, 3).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          {/* 按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
              isSelected
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? (
              locale === 'en' ? 'Selected' : '已选'
            ) : (
              locale === 'en' ? 'Use' : '使用'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
