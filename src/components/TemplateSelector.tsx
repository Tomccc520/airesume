/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * @updateDate 2026-03-26
 */

'use client'

import React, { useMemo, useState } from 'react'
import { Bot, Check, LayoutTemplate, Palette, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateStyle } from '@/types/template'
import { CORE_TEMPLATE_IDS, getAvailableTemplates } from '@/data/templates'
import { ResumeData } from '@/types/resume'
import { getCareerTemplateData, isCareerTemplate } from '@/data/careerTemplates'
import TemplatePreview from './TemplatePreview'
import TemplateCard from './templates/TemplateCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { TemplateExperienceLevel, TemplateRecommendedRole } from '@/types/template'
import {
  getAIProviderSummary,
  getAIWorkbenchAction,
  getAIWorkbenchActionLabel,
  getAIWorkbenchBadgeLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { useAIConfigStatus } from '@/hooks/useAIConfigStatus'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: TemplateStyle) => void
  onUpdateResumeData?: (data: ResumeData) => void
  currentTemplate?: string
  onShowAIAssistant?: () => void
  onShowAIConfig?: () => void
}

/**
 * 获取核心模板的固定排序
 * 通过 CORE_TEMPLATE_IDS 保证展示顺序稳定，避免因为数组顺序变化导致 UI 抖动。
 */
function getOrderedCoreTemplates(): TemplateStyle[] {
  const availableTemplates = getAvailableTemplates()
  return CORE_TEMPLATE_IDS
    .map((id) => availableTemplates.find((template) => template.id === id))
    .filter((template): template is TemplateStyle => Boolean(template))
}

/**
 * 模板选择器组件
 * 仅展示核心模板集，专注招聘投递场景，不再展示复杂分类筛选。
 */
export default function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  onUpdateResumeData,
  currentTemplate,
  onShowAIAssistant,
  onShowAIConfig
}: TemplateSelectorProps) {
  const { locale } = useLanguage()
  const [previewTemplate, setPreviewTemplate] = useState<TemplateStyle | null>(null)
  const aiConfigStatus = useAIConfigStatus()

  /**
   * 缓存核心模板列表
   * 仅在组件初始化时读取，避免弹窗内重复计算。
   */
  const coreTemplates = useMemo(() => getOrderedCoreTemplates(), [])
  const currentTemplateData = useMemo(
    () => coreTemplates.find((template) => template.id === currentTemplate) || null,
    [coreTemplates, currentTemplate]
  )

  /**
   * 获取模板使用场景文案
   * 用固定短句解释当前主模板集的主要差异，降低用户选择成本。
   */
  const getTemplateUseCase = (template: TemplateStyle) => {
    const copyMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'For most online applications and ATS-first delivery.',
          'minimal-text': 'For classic one-page resumes in campus hiring or general delivery.',
          'compact-layout': 'For experienced candidates who need to fit more content in a single page.',
          'card-layout-executive': 'For social hiring resumes that need stronger side information.',
          'timeline-layout-classic': 'For experienced candidates who need a clearer timeline.'
        }
      : {
          'banner-layout': '适合大多数在线投递与 ATS 优先场景。',
          'minimal-text': '适合校招、通用岗位和偏稳妥的一页式投递简历。',
          'compact-layout': '适合经验较多、希望尽量压缩到一页的单栏简历。',
          'card-layout-executive': '适合社招简历，侧栏信息更突出。',
          'timeline-layout-classic': '适合经历较多、需要清晰展示时间顺序的简历。'
        }

    return copyMap[template.id] || (locale === 'en'
      ? 'Choose one style first, then fine-tune content and spacing in editor.'
      : '先选风格，再在编辑器里微调内容与间距，适合直接导出投递。')
  }

  /**
   * 获取模板推荐原因
   * 在预览侧栏和顶部导引中展示“为什么要选这套”。
   */
  const getTemplateReason = (template: TemplateStyle) => {
    const reasonMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'Stable structure, less risk, easy to parse.',
          'minimal-text': 'Centered header and classic typography feel safer for broad delivery.',
          'compact-layout': 'Higher density keeps more highlights on one page without switching to double columns.',
          'card-layout-executive': 'Information hierarchy is clearer for recruiter scanning.',
          'timeline-layout-classic': 'Date column is clearer for longer career histories.'
        }
      : {
          'banner-layout': '结构最稳，风险最低，最适合直接投递。',
          'minimal-text': '居中页眉和经典排版更稳，适合大多数招聘场景。',
          'compact-layout': '信息密度更高，方便在一页内保留更多核心内容。',
          'card-layout-executive': '信息层级更明显，方便招聘方快速扫读。',
          'timeline-layout-classic': '日期列更清晰，适合年限较长的履历展示。'
        }

    return reasonMap[template.id] || (locale === 'en'
      ? 'Choose one style first, then fine-tune content and spacing in editor.'
      : '先选风格，再在编辑器里微调内容与间距，适合直接导出投递。')
  }

  /**
   * 获取选择器说明文案
   * 用于头部简短说明当前模板集的定位。
   */
  const getSelectorHint = () => {
    return locale === 'en'
      ? 'Choose one style first, then fine-tune content and spacing in editor.'
      : '先选风格，再在编辑器里微调内容与间距，适合直接导出投递。'
  }

  /**
   * 获取推荐岗位文案
   * 统一模板详情面板中的岗位标签显示。
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
   * 统一模板详情面板中的经验推荐显示。
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
   * 获取模板结构文案
   * 通过模板 ID 和布局配置输出更贴近投递场景的结构描述。
   */
  const getStructureLabel = (template: TemplateStyle) => {
    if (template.id === 'timeline-layout' || template.id === 'timeline-layout-classic') {
      return locale === 'en' ? 'Timeline' : '时间线'
    }

    const isTwoColumn =
      template.id === 'card-layout' ||
      template.id === 'card-layout-executive' ||
      template.layout.columns.count === 2 ||
      template.layoutType === 'left-right'

    if (locale === 'en') {
      return isTwoColumn ? 'Two-column' : 'Single-column'
    }
    return isTwoColumn ? '双栏' : '单栏'
  }

  /**
   * 获取 ATS 适配文案
   * 与模板卡片保持一致，便于用户在预览弹窗中快速判断。
   */
  const getATSLabel = (template: TemplateStyle) => {
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
   * 获取模板说明标签
   * 用于预览弹窗顶部快速识别模板风格。
   */
  const getToneLabel = (template: TemplateStyle) => {
    const toneMap: Record<string, string> = locale === 'en'
      ? {
          'banner-layout': 'Single Column Standard',
          'banner-layout-compact': 'Single Column Compact',
          'minimal-text': 'Classic Single Column',
          'compact-layout': 'Compact Single Column',
          'card-layout': 'Business Dual Column',
          'card-layout-executive': 'Business Dual Column',
          'timeline-layout': 'Timeline Compact',
          'timeline-layout-classic': 'Senior Timeline'
        }
      : {
          'banner-layout': '单栏标准',
          'banner-layout-compact': '单栏紧凑',
          'minimal-text': '经典单栏',
          'compact-layout': '紧凑单栏',
          'card-layout': '商务双栏',
          'card-layout-executive': '商务双栏',
          'timeline-layout': '时间线紧凑',
          'timeline-layout-classic': '时间线资深'
        }
    return toneMap[template.id] || (locale === 'en' ? 'General' : '通用')
  }

  /**
   * 获取当前模板对比提示
   * 让用户在预览弹窗里快速理解“切换后会有什么变化”。
   */
  const getCompareTips = (targetTemplate: TemplateStyle, sourceTemplate?: TemplateStyle | null) => {
    if (!sourceTemplate || sourceTemplate.id === targetTemplate.id) {
      return []
    }

    const tips: string[] = []
    const sourceStructure = getStructureLabel(sourceTemplate)
    const targetStructure = getStructureLabel(targetTemplate)

    if (sourceStructure !== targetStructure) {
      tips.push(
        locale === 'en'
          ? `Layout changes from ${sourceStructure} to ${targetStructure}.`
          : `版式将从${sourceStructure}切换为${targetStructure}。`
      )
    }

    if (getATSLabel(sourceTemplate) !== getATSLabel(targetTemplate)) {
      tips.push(
        locale === 'en'
          ? `${getATSLabel(targetTemplate)} with different screening focus.`
          : `${getATSLabel(targetTemplate)}，筛选侧重点会不同。`
      )
    }

    const targetLevels = targetTemplate.recommendedExperienceLevels?.slice(0, 1) || []
    if (targetLevels.length > 0) {
      tips.push(
        locale === 'en'
          ? `Better fit for ${getExperienceLabel(targetLevels[0])}.`
          : `更适合 ${getExperienceLabel(targetLevels[0])} 候选人。`
      )
    }

    return tips.slice(0, 3)
  }

  /**
   * 获取模板顶部导引信息
   * 将模板列表顶部改成更像招聘工具库的“选型建议”。
   */
  const templateGuides = coreTemplates.map((template) => ({
    id: template.id,
    name: locale === 'en' && template.nameEn ? template.nameEn : template.name,
    structure: getStructureLabel(template),
    reason: getTemplateReason(template)
  }))

  /**
   * 获取模板弹窗顶部的 AI 工作台摘要
   * 在选模板时同步提示“现在能不能继续用 AI 打磨”，并给出直达动作。
   */
  const templateAIStatusMeta = useMemo(() => {
    const statusKey = getAIWorkbenchStatusKey(aiConfigStatus)
    const { toneClass, badgeClass } = getAIWorkbenchToneMeta(statusKey)
    const badgeLabel = getAIWorkbenchBadgeLabel(statusKey, locale)
    const actionLabel = getAIWorkbenchActionLabel(statusKey, locale)
    const action = getAIWorkbenchAction(statusKey)
    const providerSummary = getAIProviderSummary(aiConfigStatus, locale)

    if (statusKey === 'ready') {
      return {
        toneClass,
        badgeClass,
        badgeLabel,
        title: locale === 'zh' ? '模板切换后可直接继续 AI 打磨' : 'Continue with AI right after template switching',
        description: locale === 'zh'
          ? '当前 AI 已验证通过，切换模板后可以直接回到智能优化或 JD 匹配继续打磨。'
          : 'AI validation has passed. Switch the template and continue with optimize or JD matching directly.',
        actionLabel,
        action,
        providerSummary
      }
    }

    if (statusKey === 'needsValidation') {
      return {
        toneClass,
        badgeClass,
        badgeLabel,
        title: locale === 'zh' ? '模板可先切换，AI 建议先完成验证' : 'Template can be changed now, but AI should be validated first',
        description: locale === 'zh'
          ? '当前配置已补齐，建议切换模板后直接去 AI 助手完成一次验证，再继续生成优化结果。'
          : 'The setup is complete. After switching template, open AI once to finish validation before generating results.',
        actionLabel: locale === 'zh' ? '去验证 AI' : actionLabel,
        action,
        providerSummary
      }
    }

    if (statusKey === 'needsConfig') {
      return {
        toneClass,
        badgeClass,
        badgeLabel,
        title: locale === 'zh' ? '模板已可先选择，AI 仍待配置' : 'Templates are ready, AI still needs setup',
        description: locale === 'zh'
          ? '当前可先完成模板选型，补齐 AI 配置后再继续智能优化和生成。'
          : 'Choose the template first, then finish AI setup before optimize and generate.',
        actionLabel: locale === 'zh' ? '去配置 AI' : 'Setup AI',
        action,
        providerSummary
      }
    }

    return {
      toneClass,
      badgeClass,
      badgeLabel,
      title: locale === 'zh' ? '模板库可继续使用，AI 当前处于停用状态' : 'Templates are available while AI stays disabled',
      description: locale === 'zh'
        ? '当前可以继续切换模板并导出，若需要 AI 打磨，可先重新启用 AI。'
        : 'You can still switch templates and export. Re-enable AI when you want further optimization.',
      actionLabel,
      action,
      providerSummary
    }
  }, [aiConfigStatus, locale])

  /**
   * 处理职业模板应用
   * 保留兼容逻辑，防止后续恢复职业模板时需要再次改动接入链路。
   */
  const handleApplyCareerTemplate = (templateId: string) => {
    const careerTemplateData = getCareerTemplateData(templateId)
    if (careerTemplateData && onUpdateResumeData) {
      onUpdateResumeData(careerTemplateData)
      onClose()
    }
  }

  /**
   * 处理模板选择
   * 统一选择入口，确保选择后立刻关闭弹窗并应用模板。
   */
  const handleTemplateSelect = (template: TemplateStyle) => {
    if (isCareerTemplate(template.id)) {
      handleApplyCareerTemplate(template.id)
      return
    }
    onSelectTemplate(template)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              <Palette className="h-5 w-5 text-slate-700" />
              {locale === 'en' ? 'Template Versions' : '模板版本选择'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {locale === 'en'
                ? `Selected ${coreTemplates.length} mainstream apply-ready versions.`
                : `精选 ${coreTemplates.length} 套主流投递版本，直接用于求职投递。`}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="no-scrollbar max-h-[calc(95vh-92px)] overflow-y-auto p-4 sm:p-6">
          <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {locale === 'en' ? 'Recruiting-ready template library' : '招聘投递模板库'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{getSelectorHint()}</p>
                </div>
                <div className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
                  {locale === 'en' ? `${coreTemplates.length} templates` : `${coreTemplates.length} 套模板`}
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {templateGuides.map((guide) => (
                  <div key={guide.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{guide.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {guide.structure}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{guide.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border px-4 py-3 ${templateAIStatusMeta.toneClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {locale === 'en' ? 'AI Workspace Status' : 'AI 工作台状态'}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-6">
                    {templateAIStatusMeta.title}
                  </h3>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${templateAIStatusMeta.badgeClass}`}>
                  {templateAIStatusMeta.badgeLabel}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-current/90">
                {templateAIStatusMeta.description}
              </p>
              <div className="mt-3 rounded-lg border border-current/15 bg-white/80 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-current/70">
                  {locale === 'en' ? 'Current Provider' : '当前模型'}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {templateAIStatusMeta.providerSummary}
                </p>
              </div>
              {(onShowAIAssistant || onShowAIConfig) && (
                <button
                  type="button"
                  onClick={() => {
                    if (templateAIStatusMeta.action === 'assistant') {
                      onShowAIAssistant?.()
                      return
                    }
                    onShowAIConfig?.()
                  }}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  <Bot className="h-4 w-4" />
                  {templateAIStatusMeta.actionLabel}
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900">
              {locale === 'en' ? 'Choose one baseline template' : '选择一套基础模板'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {locale === 'en'
                ? 'Keep the template count low and focus on recruiter readability.'
                : '保留少量模板，优先保证招聘方阅读效率。'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {coreTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={currentTemplate === template.id}
                onClick={() => handleTemplateSelect(template)}
                onPreview={() => setPreviewTemplate(template)}
              />
            ))}
          </div>

          {coreTemplates.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center">
              <p className="text-sm text-slate-500">
                {locale === 'en' ? 'No templates available currently.' : '当前没有可用模板，请稍后重试。'}
              </p>
            </div>
          )}
        </div>
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-6xl rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {locale === 'en' ? 'Application Template Preview' : '投递模板预览'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === 'en'
                    ? 'Compare structure and decide before switching.'
                    : '先看版式与投递参数，再决定是否切换。'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setPreviewTemplate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="no-scrollbar max-h-[72vh] overflow-auto p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_320px]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                        <LayoutTemplate className="h-3.5 w-3.5" />
                        {getToneLabel(previewTemplate)}
                      </div>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">
                        {locale === 'en' && previewTemplate.nameEn ? previewTemplate.nameEn : previewTemplate.name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {locale === 'en' && previewTemplate.descriptionEn ? previewTemplate.descriptionEn : previewTemplate.description}
                      </p>
                    </div>
                    {currentTemplate === previewTemplate.id && (
                      <div className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                        {locale === 'en' ? 'Current' : '当前使用'}
                      </div>
                    )}
                  </div>

                  <div className="mx-auto w-full max-w-[820px] overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <TemplatePreview template={previewTemplate} fullSize />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-700" />
                      <h4 className="text-sm font-semibold text-slate-900">
                        {locale === 'en' ? 'Application Parameters' : '投递参数'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-slate-400">{locale === 'en' ? 'Structure' : '结构'}</p>
                        <p className="mt-1 font-semibold text-slate-800">{getStructureLabel(previewTemplate)}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-slate-400">ATS</p>
                        <p className="mt-1 font-semibold text-slate-800">{getATSLabel(previewTemplate)}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-500">
                        {locale === 'en' ? 'Recommended roles: ' : '推荐岗位：'}
                      </span>
                      {(previewTemplate.recommendedRoles || ['general']).map(getRoleLabel).join(' / ')}
                    </div>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-500">
                        {locale === 'en' ? 'Experience: ' : '适配经验：'}
                      </span>
                      {(previewTemplate.recommendedExperienceLevels || ['1-3']).map(getExperienceLabel).join(' / ')}
                    </div>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-500">
                        {locale === 'en' ? 'Best use: ' : '推荐理由：'}
                      </span>
                      {getTemplateReason(previewTemplate)}
                    </div>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-500">
                        {locale === 'en' ? 'Use case: ' : '适用场景：'}
                      </span>
                      {getTemplateUseCase(previewTemplate)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {locale === 'en' ? 'Compare With Current' : '与当前模板对比'}
                    </h4>
                    {currentTemplateData ? (
                      <>
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-500">
                            {locale === 'en' ? 'Current: ' : '当前：'}
                          </span>
                          {locale === 'en' && currentTemplateData.nameEn ? currentTemplateData.nameEn : currentTemplateData.name}
                        </p>
                        <div className="mt-3 space-y-2">
                          {getCompareTips(previewTemplate, currentTemplateData).map((tip) => (
                            <div
                              key={tip}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                            >
                              {tip}
                            </div>
                          ))}
                          {getCompareTips(previewTemplate, currentTemplateData).length === 0 && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              {locale === 'en'
                                ? 'This preview matches your current template.'
                                : '当前预览与正在使用的模板一致。'}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {locale === 'en'
                          ? 'Choose a template to start comparison.'
                          : '选择模板后，这里会展示与当前模板的差异。'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <Button type="button" variant="outline" onClick={() => setPreviewTemplate(null)}>
                {locale === 'en' ? 'Close' : '关闭'}
              </Button>
              <Button
                type="button"
                onClick={() => handleTemplateSelect(previewTemplate)}
                className="inline-flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Use This Template' : '使用此模板'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
