/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * @updateDate 2026.1.30 - 增强筛选功能，添加风格、复杂度、排序等多维度筛选
 */

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { X, Zap, BookOpen, Palette, Check, Briefcase, Globe, Search, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateStyle, TemplateCategory } from '@/types/template'
import { templateCategories, getAvailableTemplates, popularTemplateIds } from '@/data/templates'
import { ResumeData } from '@/types/resume'
import { getCareerTemplateData, isCareerTemplate } from '@/data/careerTemplates'
import TemplatePreview from './TemplatePreview'
import TemplateCard from './templates/TemplateCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { getFavoriteTemplates } from '@/utils/templateFavorites'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: TemplateStyle) => void
  onUpdateResumeData?: (data: ResumeData) => void
  currentTemplate?: string
}

/**
 * 模板选择器组件 - 优化版
 * 提供模板分类浏览、搜索、筛选功能
 */
export default function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  onUpdateResumeData,
  currentTemplate 
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('popular')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateStyle | null>(null)
  const [showFullLibrary, setShowFullLibrary] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { locale } = useLanguage()

  // 获取所有可用模板
  const availableTemplates = useMemo(() => getAvailableTemplates(), [])

  // 获取热门模板
  const getPopularTemplates = () => {
    return availableTemplates.filter(template => popularTemplateIds.includes(template.id))
  }

  // 获取收藏的模板
  const getFavoriteTemplatesList = () => {
    const favoriteIds = getFavoriteTemplates()
    return availableTemplates.filter(template => favoriteIds.includes(template.id))
  }

  // 简单搜索算法
  const simpleSearch = (text: string, query: string): boolean => {
    if (!text || !query) return false
    return text.toLowerCase().includes(query.toLowerCase())
  }
  
  // 获取当前分类的模板（带搜索）- 简化版
  const getCurrentCategoryTemplates = () => {
    let templates: TemplateStyle[] = []
    
    if (selectedCategory === 'popular') {
      templates = getPopularTemplates()
    } else if (selectedCategory === 'favorites') {
      templates = getFavoriteTemplatesList()
    } else if (showFullLibrary) {
      templates = availableTemplates
    } else {
      const category = templateCategories.find(c => c.id === selectedCategory)
      templates = category?.templates || []
    }
    
    // 搜索筛选
    if (searchQuery.trim()) {
      templates = templates.filter(t => 
        simpleSearch(t.name, searchQuery) ||
        simpleSearch(t.nameEn || '', searchQuery) ||
        simpleSearch(t.description, searchQuery) ||
        simpleSearch(t.descriptionEn || '', searchQuery) ||
        (t.tags && t.tags.some(tag => simpleSearch(tag, searchQuery)))
      )
    }
    
    return templates
  }

  // 获取本地化的模板名称
  const getTemplateName = (template: TemplateStyle) => {
    return locale === 'en' && template.nameEn ? template.nameEn : template.name
  }

  // 获取本地化的模板描述
  const getTemplateDescription = (template: TemplateStyle) => {
    return locale === 'en' && template.descriptionEn ? template.descriptionEn : template.description
  }

  // 获取本地化的分类名称
  const getCategoryName = (category: TemplateCategory) => {
    return locale === 'en' && category.nameEn ? category.nameEn : category.name
  }

  // 获取本地化的分类描述
  const getCategoryDescription = (category: TemplateCategory) => {
    return locale === 'en' && category.descriptionEn ? category.descriptionEn : category.description
  }
  
  // 获取图标组件
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Zap,
      BookOpen,
      Palette,
      Briefcase,
      Globe
    }
    return icons[iconName] || Zap
  }

  // 处理职业模板应用
  const handleApplyCareerTemplate = (templateId: string) => {
    const careerTemplateData = getCareerTemplateData(templateId)
    
    if (careerTemplateData && onUpdateResumeData) {
      onUpdateResumeData(careerTemplateData)
      onClose()
    }
  }

  // 处理模板选择
  const handleTemplateSelect = (template: TemplateStyle) => {
    if (isCareerTemplate(template.id)) {
      handleApplyCareerTemplate(template.id)
    } else {
      onSelectTemplate(template)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="bg-white border-2 border-gray-200 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* 头部 - Nuxt 风格：简洁优雅 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-emerald-500" />
              {locale === 'en' ? 'Choose Template' : '选择模板'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {locale === 'en' ? 'Select a professional template for your resume' : '为您的简历选择专业模板'}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(95vh-120px)]">
          {/* 左侧分类导航 - Nuxt 风格 */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 p-3 sm:p-4 lg:overflow-y-auto">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 sm:mb-4 px-2">
              {locale === 'en' ? 'Categories' : '分类'}
            </h3>
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
              {/* 热门模板选项 - Nuxt 风格 */}
              <button
                onClick={() => {
                  setSelectedCategory('popular')
                  setShowFullLibrary(false)
                }}
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                  selectedCategory === 'popular'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">{locale === 'en' ? 'Popular' : '热门'}</span>
              </button>

              {/* 我的收藏选项 - Nuxt 风格 */}
              <button
                onClick={() => {
                  setSelectedCategory('favorites')
                  setShowFullLibrary(false)
                }}
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                  selectedCategory === 'favorites'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${selectedCategory === 'favorites' ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{locale === 'en' ? 'Favorites' : '收藏'}</span>
              </button>
              
              {templateCategories.map((category) => {
                const IconComponent = getIcon(category.icon)
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowFullLibrary(false)
                    }}
                    className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{getCategoryName(category)}</span>
                  </button>
                )
              })}
              
              {/* 浏览全部模板选项 - Nuxt 风格 */}
              <button
                onClick={() => {
                  setShowFullLibrary(true)
                  setSelectedCategory('all')
                }}
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                  showFullLibrary
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">{locale === 'en' ? 'All' : '全部'}</span>
              </button>
            </div>
          </div>

          {/* 右侧模板网格 - Nuxt 风格 */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* 搜索栏 - 简化版 */}
            <div className="p-3 sm:p-6 pb-3 border-b border-gray-200 bg-white">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'en' ? 'Search templates by name or tag...' : '搜索模板名称或标签...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* 模板列表区域 */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {/* 标题和描述 */}
              <div className="mb-4 sm:mb-6">
                {selectedCategory === 'popular' ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        {locale === 'en' ? 'Popular Templates' : '热门模板'}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {getCurrentCategoryTemplates().length} {locale === 'en' ? 'templates' : '个模板'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                      {locale === 'en' ? 'Curated popular resume templates for various career scenarios' : '精选推荐的热门简历模板，适合各种职业场景'}
                    </p>
                  </>
                ) : selectedCategory === 'favorites' ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-500 fill-current" />
                        {locale === 'en' ? 'My Favorites' : '我的收藏'}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {getCurrentCategoryTemplates().length} {locale === 'en' ? 'templates' : '个模板'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                      {locale === 'en' ? 'Your favorite resume templates' : '您收藏的简历模板'}
                    </p>
                  </>
                ) : showFullLibrary ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">{locale === 'en' ? 'All Templates' : '全部模板'}</h2>
                      <span className="text-sm text-gray-500">
                        {getCurrentCategoryTemplates().length} {locale === 'en' ? 'templates' : '个模板'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                      {locale === 'en' ? 'Browse all available resume templates' : '浏览所有可用的简历模板'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {(() => {
                          const cat = templateCategories.find(cat => cat.id === selectedCategory)
                          if (!cat) return locale === 'en' ? 'Template Selection' : '模板选择'
                          return getCategoryName(cat)
                        })()}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {getCurrentCategoryTemplates().length} {locale === 'en' ? 'templates' : '个模板'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                      {(() => {
                        const cat = templateCategories.find(cat => cat.id === selectedCategory)
                        if (!cat) return locale === 'en' ? 'Choose a suitable resume template' : '选择适合的简历模板'
                        return getCategoryDescription(cat)
                      })()}
                    </p>
                  </>
                )}
              </div>
              
              <div 
                key={selectedCategory + (showFullLibrary ? '-full' : '-cat')}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {getCurrentCategoryTemplates().map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={currentTemplate === template.id}
                    onClick={() => handleTemplateSelect(template)}
                    onPreview={() => setPreviewTemplate(template)}
                  />
                ))}
              </div>

              {/* 空状态 */}
              {getCurrentCategoryTemplates().length === 0 && (
                <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-dashed border-gray-300 mx-auto max-w-lg mt-8">
                  <div className="text-gray-400 mb-4 bg-gray-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center">
                    <Palette className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    {locale === 'en' ? 'No Templates Found' : '未找到模板'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 max-w-xs mx-auto">
                    {locale === 'en' ? 'Try adjusting your filters or search terms' : '尝试调整筛选条件或搜索关键词'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 模板预览弹窗 */}
        {previewTemplate && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 sm:p-8 z-[60]"
            onClick={() => setPreviewTemplate(null)}
          >
            <div
              className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-5xl w-full h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{getTemplateName(previewTemplate)}</h3>
                  <p className="text-sm text-gray-500 mt-1">{getTemplateDescription(previewTemplate)}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 bg-gray-50 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8">
                  <div className="bg-white border border-gray-200 rounded-lg max-w-3xl mx-auto min-h-full">
                    <TemplatePreview template={previewTemplate} fullSize={true} />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t bg-white flex justify-between items-center z-10">
                <div className="flex space-x-2">
                  {Object.values(previewTemplate.colors).map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-6 h-6 rounded-full border border-gray-200" 
                      style={{ backgroundColor: color }} 
                    />
                  ))}
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setPreviewTemplate(null)}
                    variant="ghost"
                  >
                    {locale === 'en' ? 'Cancel' : '取消'}
                  </Button>
                  <Button
                    onClick={() => {
                      handleTemplateSelect(previewTemplate)
                      setPreviewTemplate(null)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                    {locale === 'en' ? 'Use Template' : '使用此模板'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

