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
  fitVariant?: 'recommended' | 'alternate' | 'current' | null
  fitSummary?: string | null
  fitReasons?: string[]
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
  fitVariant = null,
  fitSummary = null,
  fitReasons = [],
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
   * 获取模板定位文案
   * 用更接近招聘工具的短句说明该模板最适合的投递场景。
   */
  const getPositioningLabel = () => {
    const labelMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'Best for ATS-first online applications',
          'minimal-text': 'Best for classic one-page delivery with lower visual risk',
          'compact-layout': 'Best for content-heavy resumes that still need single-column ATS readability',
          'card-layout-executive': 'Best for social hiring and side info emphasis',
          'timeline-layout-classic': 'Best for experienced candidates with long histories'
        }
      : {
          'banner-layout': '适合在线投递和 ATS 优先场景',
          'minimal-text': '适合稳妥的一页式经典投递简历',
          'compact-layout': '适合内容较多、仍需保持单栏 ATS 可读性的简历',
          'card-layout-executive': '适合社招与突出侧栏信息的简历',
          'timeline-layout-classic': '适合经历较多、强调履历顺序的简历'
        }

    return labelMap[template.id] || getTemplateDescription()
  }

  /**
   * 获取模板主标签
   * 仅保留一个主标签，避免卡片顶部出现过多噪音信息。
   */
  const getPrimaryBadge = () => {
    const badgeMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'ATS First',
          'minimal-text': 'Classic',
          'compact-layout': 'Compact',
          'card-layout-executive': 'Business',
          'timeline-layout-classic': 'Timeline'
        }
      : {
          'banner-layout': 'ATS优先',
          'minimal-text': '经典投递',
          'compact-layout': '高效紧凑',
          'card-layout-executive': '商务投递',
          'timeline-layout-classic': '时间线履历'
        }

    return badgeMap[template.id] || getStructureLabel()
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
          'minimal-text': 'Classic Single',
          'compact-layout': 'Compact Single',
          'card-layout': 'Dual Column',
          'card-layout-executive': 'Business Dual',
          'timeline-layout': 'Timeline Compact',
          'timeline-layout-classic': 'Senior Timeline'
        }
      : {
          'banner-layout': '单栏标准',
          'banner-layout-compact': '单栏紧凑',
          'minimal-text': '经典单栏',
          'compact-layout': '紧凑单栏',
          'card-layout': '双栏标准',
          'card-layout-executive': '商务双栏',
          'timeline-layout': '时间线紧凑',
          'timeline-layout-classic': '时间线资深'
    }
    return toneMap[template.id] || (locale === 'en' ? 'General' : '通用')
  }

  /**
   * 获取模板匹配状态样式
   * 将“推荐 / 备选 / 当前使用”统一成稳定的卡片提示语义。
   */
  const getTemplateFitMeta = () => {
    if (fitVariant === 'recommended') {
      return {
        cardClass: 'border-sky-200 bg-sky-50/70',
        badgeClass: 'border-sky-200 bg-white text-sky-700',
        titleClass: 'text-sky-800',
        bodyClass: 'text-sky-700',
        label: locale === 'en' ? 'Best Match' : '最匹配'
      }
    }

    if (fitVariant === 'alternate') {
      return {
        cardClass: 'border-amber-200 bg-amber-50/80',
        badgeClass: 'border-amber-200 bg-white text-amber-700',
        titleClass: 'text-amber-800',
        bodyClass: 'text-amber-700',
        label: locale === 'en' ? 'Fallback' : '备选'
      }
    }

    return {
      cardClass: 'border-slate-200 bg-slate-50',
      badgeClass: 'border-slate-200 bg-white text-slate-600',
      titleClass: 'text-slate-700',
      bodyClass: 'text-slate-500',
      label: locale === 'en' ? 'Current' : '当前'
    }
  }

  const templateFitMeta = getTemplateFitMeta()

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-white transition-colors ${
        isSelected ? 'ring-1 ring-slate-300' : ''
      }`}
      style={{
        borderColor: isSelected ? '#1f2937' : '#d5dde7'
      }}
      aria-label={`${locale === 'en' ? 'Choose template' : '选择模板'}: ${getTemplateName()}`}
    >
      <div
        className="relative flex h-48 items-center justify-center overflow-hidden border-b bg-slate-50 px-4 py-4"
        style={{ borderColor: '#e5e7eb' }}
      >
        <div className="relative h-full w-full max-w-[228px] overflow-hidden rounded-md border border-slate-200 bg-white">
          <TemplatePreview template={template} />
        </div>
        <div className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
          {getPrimaryBadge()}
        </div>
        {isSelected && (
          <div className="absolute right-3 top-3 rounded-full bg-slate-700 p-1 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold leading-5 text-slate-900">{getTemplateName()}</h3>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{getTemplateToneLabel()}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700">
              {getRecommendationSummary()}
            </div>
          </div>
          <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-xs leading-5 text-slate-500">
            {getPositioningLabel()}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {locale === 'en' ? 'Structure' : '结构'}
            </p>
            <p className="mt-0.5 font-medium text-slate-700">{getStructureLabel()}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {locale === 'en' ? 'ATS' : 'ATS'}
            </p>
            <p className="mt-0.5 font-medium text-slate-700">{getATSLabel()}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
          <span className="font-medium text-slate-500">{locale === 'en' ? 'Fit' : '适合人群'}: </span>
          {getTemplateDescription()}
        </div>

        {fitSummary && (
          <div className={`mt-3 rounded-lg border px-3 py-2.5 ${templateFitMeta.cardClass}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${templateFitMeta.badgeClass}`}>
                {templateFitMeta.label}
              </span>
              {fitReasons.slice(0, 2).map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {reason}
                </span>
              ))}
            </div>
            <p className={`mt-2 text-xs font-medium leading-5 ${templateFitMeta.titleClass}`}>
              {fitSummary}
            </p>
          </div>
        )}

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
