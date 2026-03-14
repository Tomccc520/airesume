/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * @updateDate 2026.1.30 - 增强筛选功能，添加风格、复杂度、排序等多维度筛选
 */

'use client'

import React, { useState, useMemo } from 'react'
import { X, Zap, BookOpen, Palette, Check, Briefcase, Globe, Search, Heart, LucideIcon, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateStyle, TemplateCategory, TemplateRecommendedRole, TemplateExperienceLevel } from '@/types/template'
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
  const [roleFilter, setRoleFilter] = useState<'all' | TemplateRecommendedRole>('all')
  const [experienceFilter, setExperienceFilter] = useState<'all' | TemplateExperienceLevel>('all')
  const { locale } = useLanguage()

  // 获取所有可用模板
  const availableTemplates = useMemo(() => getAvailableTemplates(), [])
  const roleFilterOptions = useMemo(
    () => ['all', 'tech', 'product', 'operations', 'design', 'general'] as const,
    []
  )
  const experienceFilterOptions = useMemo(
    () => ['all', 'campus', '1-3', '3-5', '5+'] as const,
    []
  )

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

  /**
   * 获取模板岗位推荐
   * 优先读取模板自带配置，未配置时回退“通用岗位”。
   */
  const getTemplateRoles = (template: TemplateStyle): TemplateRecommendedRole[] => {
    if (template.recommendedRoles && template.recommendedRoles.length > 0) {
      return template.recommendedRoles
    }
    return ['general']
  }

  /**
   * 获取模板经验段位推荐
   * 优先读取模板配置，未配置时回退“1-3年”。
   */
  const getTemplateExperienceLevels = (template: TemplateStyle): TemplateExperienceLevel[] => {
    if (template.recommendedExperienceLevels && template.recommendedExperienceLevels.length > 0) {
      return template.recommendedExperienceLevels
    }
    return ['1-3']
  }

  /**
   * 获取岗位筛选项文案
   * 统一岗位标签在中英文界面下的显示文本。
   */
  const getRoleFilterLabel = (role: 'all' | TemplateRecommendedRole) => {
    if (role === 'all') {
      return locale === 'en' ? 'All Roles' : '全部岗位'
    }
    if (locale === 'en') {
      const roleMap: Record<TemplateRecommendedRole, string> = {
        tech: 'Tech',
        product: 'Product',
        operations: 'Operations',
        design: 'Design',
        general: 'General'
      }
      return roleMap[role]
    }
    const roleMap: Record<TemplateRecommendedRole, string> = {
      tech: '技术',
      product: '产品',
      operations: '运营',
      design: '设计',
      general: '通用'
    }
    return roleMap[role]
  }

  /**
   * 获取经验筛选项文案
   * 统一经验段位在中英文界面下的显示文本。
   */
  const getExperienceFilterLabel = (level: 'all' | TemplateExperienceLevel) => {
    if (level === 'all') {
      return locale === 'en' ? 'All Levels' : '全部段位'
    }
    if (locale === 'en') {
      const levelMap: Record<TemplateExperienceLevel, string> = {
        campus: 'Campus',
        '1-3': '1-3 Years',
        '3-5': '3-5 Years',
        '5+': '5+ Years'
      }
      return levelMap[level]
    }
    const levelMap: Record<TemplateExperienceLevel, string> = {
      campus: '校招',
      '1-3': '1-3年',
      '3-5': '3-5年',
      '5+': '5年+'
    }
    return levelMap[level]
  }

  /**
   * 判断模板是否匹配岗位与经验筛选
   * 统一筛选逻辑，避免模板列表与数量显示不一致。
   */
  const matchMarketFilters = (template: TemplateStyle) => {
    const roleMatched =
      roleFilter === 'all' || getTemplateRoles(template).includes(roleFilter)
    const experienceMatched =
      experienceFilter === 'all' || getTemplateExperienceLevels(template).includes(experienceFilter)
    return roleMatched && experienceMatched
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

    // 市场化岗位/经验筛选
    templates = templates.filter(matchMarketFilters)
    
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

  /**
   * 获取当前分类标题
   * 用于模板列表头部的统一展示文案。
   */
  const getCurrentCategoryTitle = () => {
    if (selectedCategory === 'popular') {
      return locale === 'en' ? 'Popular Templates' : '热门模板'
    }
    if (selectedCategory === 'favorites') {
      return locale === 'en' ? 'My Favorites' : '我的收藏'
    }
    if (showFullLibrary) {
      return locale === 'en' ? 'All Templates' : '全部模板'
    }
    const currentCategory = templateCategories.find((category) => category.id === selectedCategory)
    if (!currentCategory) {
      return locale === 'en' ? 'Template Selection' : '模板选择'
    }
    return getCategoryName(currentCategory)
  }

  /**
   * 获取当前分类描述
   * 用于模板列表头部说明。
   */
  const getCurrentCategoryDescription = () => {
    if (selectedCategory === 'popular') {
      return locale === 'en'
        ? 'Mainstream hiring templates with clear structure and ATS readability.'
        : '主流招聘常见模板，结构清晰且更利于 ATS 识别。'
    }
    if (selectedCategory === 'favorites') {
      return locale === 'en' ? 'Your saved templates.' : '你已收藏的模板。'
    }
    if (showFullLibrary) {
      return locale === 'en' ? 'Browse all available templates.' : '浏览全部可用模板。'
    }
    const currentCategory = templateCategories.find((category) => category.id === selectedCategory)
    if (!currentCategory) {
      return locale === 'en' ? 'Choose a suitable resume template.' : '选择适合你的简历模板。'
    }
    return getCategoryDescription(currentCategory)
  }
  
  // 获取图标组件
  const getIcon = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
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

  const currentCategoryTemplates = getCurrentCategoryTemplates()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="bg-white border border-slate-200 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* 头部 - Nuxt 风格：简洁优雅 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-700" />
              {locale === 'en' ? 'Resume Templates' : '简历模板库'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {locale === 'en' ? 'Select by layout and hiring scenario' : '按版式结构与投递场景快速选择'}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(95vh-120px)]">
          {/* 左侧分类导航 - Nuxt 风格 */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white p-3 sm:p-4 lg:overflow-y-auto">
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
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center space-x-2 ${
                  selectedCategory === 'popular'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-transparent text-gray-700 hover:border-slate-200'
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
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center space-x-2 ${
                  selectedCategory === 'favorites'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-transparent text-gray-700 hover:border-slate-200'
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
                    className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'border-slate-300 bg-slate-100 text-slate-900'
                        : 'border-transparent text-gray-700 hover:border-slate-200'
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
                className={`flex-shrink-0 lg:w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center space-x-2 ${
                  showFullLibrary
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-transparent text-gray-700 hover:border-slate-200'
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
            <div className="p-4 sm:p-5 pb-4 border-b border-gray-200 bg-white">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={locale === 'en' ? 'Search templates by name or tag...' : '搜索模板名称或标签...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-500 outline-none transition-colors text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* 市场化筛选 */}
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <label className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Briefcase className="h-3.5 w-3.5" />
                    {locale === 'en' ? 'Role Filter' : '岗位筛选'}
                  </span>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as 'all' | TemplateRecommendedRole)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition-colors focus:border-slate-500"
                  >
                    {roleFilterOptions.map((role) => (
                      <option key={role} value={role}>
                        {getRoleFilterLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {locale === 'en' ? 'Experience Filter' : '经验筛选'}
                  </span>
                  <select
                    value={experienceFilter}
                    onChange={(event) => setExperienceFilter(event.target.value as 'all' | TemplateExperienceLevel)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition-colors focus:border-slate-500"
                  >
                    {experienceFilterOptions.map((level) => (
                      <option key={level} value={level}>
                        {getExperienceFilterLabel(level)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            
            {/* 模板列表区域 */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {/* 标题和描述 */}
              <div className="mb-4 sm:mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{getCurrentCategoryTitle()}</h2>
                  <span className="text-sm text-slate-500">
                    {currentCategoryTemplates.length} {locale === 'en' ? 'templates' : '个模板'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{getCurrentCategoryDescription()}</p>
              </div>
              
              <div 
                key={selectedCategory + (showFullLibrary ? '-full' : '-cat')}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {currentCategoryTemplates.map((template) => (
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
              {currentCategoryTemplates.length === 0 && (
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
              className="bg-white border border-gray-200 rounded-2xl max-w-5xl w-full h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col"
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
                    className="bg-slate-900 text-white hover:bg-slate-800"
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
