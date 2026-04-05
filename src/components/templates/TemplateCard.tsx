/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

'use client'

import React from 'react'
import { Check, Eye } from 'lucide-react'
import { TemplateStyle, TemplateRecommendedRole, TemplateExperienceLevel } from '@/types/template'
import TemplatePreview from '../TemplatePreview'
import { useLanguage } from '@/contexts/LanguageContext'

interface TemplateCardProps {
  template: TemplateStyle
  isSelected: boolean
  onClick: () => void
  onPreview?: () => void
}

/**
 * 模板卡片组件
 * 使用招聘工具风信息结构：缩略图 + 模板定位 + 一键使用。
 */
export default function TemplateCard({
  template,
  isSelected,
  onClick,
  onPreview
}: TemplateCardProps) {
  const { locale } = useLanguage()

  /**
   * 键盘触发卡片选中
   * 保持 Enter/Space 可访问性。
   */
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  /**
   * 获取模板名称
   * 根据当前语言环境切换中英文文案。
   */
  const getTemplateName = () => {
    return locale === 'en' && template.nameEn ? template.nameEn : template.name
  }

  /**
   * 获取模板描述
   * 根据当前语言环境切换中英文文案。
   */
  const getTemplateDescription = () => {
    return locale === 'en' && template.descriptionEn ? template.descriptionEn : template.description
  }

  /**
   * 获取推荐岗位列表
   * 未配置时回退为“通用”。
   */
  const getRecommendedRoles = (): TemplateRecommendedRole[] => {
    if (template.recommendedRoles && template.recommendedRoles.length > 0) {
      return template.recommendedRoles
    }
    return ['general']
  }

  /**
   * 获取推荐经验段位列表
   * 未配置时回退为“1-3年”。
   */
  const getRecommendedExperienceLevels = (): TemplateExperienceLevel[] => {
    if (template.recommendedExperienceLevels && template.recommendedExperienceLevels.length > 0) {
      return template.recommendedExperienceLevels
    }
    return ['1-3']
  }

  /**
   * 获取岗位文案
   * 统一岗位在中英文环境下的展示。
   */
  const getRoleLabel = (role: TemplateRecommendedRole) => {
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
   * 获取经验段位文案
   * 统一经验段位在中英文环境下的展示。
   */
  const getExperienceLabel = (level: TemplateExperienceLevel) => {
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
   * 获取结构标签
   * 输出单栏/双栏结构，帮助用户快速判断版式。
   */
  const getStructureLabel = () => {
    const isTimeline = ['timeline-layout', 'timeline-layout-classic'].includes(template.id)
    const isTwoColumn =
      ['card-layout', 'card-layout-executive'].includes(template.id) ||
      template.layout.columns.count === 2 ||
      template.layoutType === 'left-right'

    if (locale === 'en') {
      if (isTimeline) {
        return 'Timeline'
      }
      return isTwoColumn ? 'Two-column' : 'Single-column'
    }
    if (isTimeline) {
      return '时间线'
    }
    return isTwoColumn ? '双栏' : '单栏'
  }

  /**
   * 获取 ATS 标签
   * 输出简化版本的 ATS 适配等级。
   */
  const getATSLabel = () => {
    const isAtsFriendly =
      template.layout.columns.count === 1 &&
      !template.components.cardStyle &&
      !template.components.tableStyle &&
      template.components.listItem.bulletStyle !== 'timeline'

    if (isAtsFriendly) {
      return locale === 'en' ? 'ATS Friendly' : 'ATS 友好'
    }
    return locale === 'en' ? 'ATS Balanced' : 'ATS 均衡'
  }

  /**
   * 获取推荐摘要
   * 仅保留首要岗位与经验，降低模板卡片信息噪音。
   */
  const getRecommendationSummary = () => {
    const roleSummary = getRoleLabel(getRecommendedRoles()[0] || 'general')
    const experienceSummary = getExperienceLabel(getRecommendedExperienceLevels()[0] || '1-3')
    if (locale === 'en') {
      return `${roleSummary} · ${experienceSummary}`
    }
    return `${roleSummary} · ${experienceSummary}`
  }

  /**
   * 获取模板风格短标签
   * 用于缩略图角标，帮助用户一眼识别模板方向。
   */
  const getTemplateToneLabel = () => {
    const toneMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'Single Column',
          'banner-layout-compact': 'Single Compact',
          'card-layout': 'Dual Column',
          'card-layout-executive': 'Dual Pro',
          'timeline-layout': 'Timeline Compact',
          'timeline-layout-classic': 'Timeline Pro'
        }
      : {
          'banner-layout': '单栏标准',
          'banner-layout-compact': '单栏紧凑',
          'card-layout': '双栏标准',
          'card-layout-executive': '双栏专业',
          'timeline-layout': '时间线紧凑',
          'timeline-layout-classic': '时间线专业'
        }
    return toneMap[template.id] || (locale === 'en' ? 'General' : '通用')
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      onClick={onClick}
      className="relative overflow-hidden rounded-lg border bg-white"
      style={{
        borderColor: isSelected ? '#1f2937' : '#d5dde7'
      }}
      aria-label={`${locale === 'en' ? 'Choose template' : '选择模板'}: ${getTemplateName()}`}
    >
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden border-b bg-slate-50 px-3 py-3"
        style={{ borderColor: '#e5e7eb' }}
      >
        <div className="relative h-full aspect-[3/4] overflow-hidden rounded-md border border-slate-200 bg-white">
          <TemplatePreview template={template} />
        </div>
        <div className="absolute left-3 top-3 rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
          {getTemplateToneLabel()}
        </div>
        {isSelected && (
          <div className="absolute right-2 top-2 rounded-full bg-slate-700 p-1 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="p-3">
        <div>
          <h3 className="text-sm font-semibold leading-5 text-slate-900">{getTemplateName()}</h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">{getTemplateDescription()}</p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {locale === 'en' ? 'Structure' : '结构'}
            </p>
            <p className="mt-0.5 font-medium text-slate-700">{getStructureLabel()}</p>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {locale === 'en' ? 'ATS' : 'ATS'}
            </p>
            <p className="mt-0.5 font-medium text-slate-700">{getATSLabel()}</p>
          </div>
        </div>

        <div className="mt-2 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
          <span className="font-medium text-slate-500">{locale === 'en' ? 'Recommend' : '推荐场景'}: </span>
          {getRecommendationSummary()}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {onPreview ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onPreview()
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"
            >
              <Eye className="h-3.5 w-3.5" />
              {locale === 'en' ? 'Preview' : '预览'}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClick()
            }}
            className={`rounded px-3 py-1 text-xs font-semibold ${
              isSelected ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {isSelected ? (locale === 'en' ? 'Selected' : '已选') : (locale === 'en' ? 'Use' : '使用')}
          </button>
        </div>
      </div>
    </div>
  )
}
