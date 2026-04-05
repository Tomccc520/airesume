/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-16
 */

'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Bot, ChevronDown, LucideIcon, Palette, Settings2, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { navigationItems } from '@/data/navigation'
import { StyleSettingsPanel } from './StyleSettingsPanel'
import { ResumeSectionId, SectionCompleteness } from '@/utils/resumeCompleteness'
import {
  getAIWorkbenchAction,
  getAIWorkbenchActionLabel,
  getAIWorkbenchBadgeLabel,
  getAIWorkbenchStatusKey,
  getAIWorkbenchToneMeta
} from '@/domain/ai/aiStatusPresentation'
import { useAIConfigStatus } from '@/hooks/useAIConfigStatus'

/**
 * Navigation item structure
 */
interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

/**
 * SectionNavigation component props
 */
interface SectionNavigationProps {
  /** Currently active section ID */
  activeSection: string
  /** Callback when section changes */
  onSectionChange: (section: string) => void
  /** Callback to show template selector */
  onShowTemplateSelector?: () => void
  /** 打开 AI 助手 */
  onShowAIAssistant?: () => void
  /** 打开 AI 配置 */
  onShowAIConfig?: () => void
  /** 模块完成度 */
  sectionCompleteness?: Partial<Record<ResumeSectionId, SectionCompleteness>>
  /** 跳转到下一个待完善模块 */
  onJumpToNextIncomplete?: () => void
  /** Custom class name */
  className?: string
}

/**
 * SectionNavigation - Left sidebar navigation for resume sections
 * 
 * Features:
 * - Displays all resume sections with icons
 * - Highlights active section
 * - Supports click to navigate/scroll to section
 * - Includes template selector button
 * - Inline style settings panel (no popup)
 * - Fully internationalized
 */
export function SectionNavigation({
  activeSection,
  onSectionChange,
  onShowTemplateSelector,
  onShowAIAssistant,
  onShowAIConfig,
  sectionCompleteness,
  onJumpToNextIncomplete,
  className = ''
}: SectionNavigationProps) {
  const { t, locale } = useLanguage()
  const [showStyleSettings, setShowStyleSettings] = useState(false) // 样式设置折叠状态
  const aiConfigStatus = useAIConfigStatus()

  // Get translated navigation items with enhanced descriptions
  const translatedItems: NavigationItem[] = navigationItems.map(item => {
    let label = item.label
    let description = item.description

    switch (item.id) {
      case 'personal':
        label = t.editor.personalInfo.title
        description = locale === 'zh' ? '完善您的基本信息，让招聘者了解您' : 'Complete your basic info for recruiters'
        break
      case 'experience':
        label = t.editor.experience.title
        description = locale === 'zh' ? '展示工作经验和职业发展历程' : 'Showcase your work experience'
        break
      case 'education':
        label = t.editor.education.title
        description = locale === 'zh' ? '填写学历和教育背景信息' : 'Add your education background'
        break
      case 'skills':
        label = t.editor.skills.title
        description = locale === 'zh' ? '突出专业技能和核心能力' : 'Highlight your key skills'
        break
      case 'projects':
        label = t.editor.projects.title
        description = locale === 'zh' ? '展示项目作品和实践成果' : 'Display your project achievements'
        break
    }

    return {
      ...item,
      label,
      description
    }
  })

  /**
   * 计算侧栏总完成度
   * 用于底部进度条和“继续完善”入口，减少用户在模块间来回查找。
   */
  const completionOverview = useMemo(() => {
    const sectionList = translatedItems
      .map((item) => sectionCompleteness?.[item.id as ResumeSectionId])
      .filter((item): item is SectionCompleteness => Boolean(item))

    if (sectionList.length === 0) {
      return {
        totalScore: 0,
        incompleteCount: translatedItems.length
      }
    }

    const totalScore = Math.round(
      sectionList.reduce((sum, item) => sum + item.score, 0) / sectionList.length
    )

    return {
      totalScore,
      incompleteCount: sectionList.filter((item) => !item.completed).length
    }
  }, [sectionCompleteness, translatedItems])

  /**
   * 获取侧栏里的 AI 工作台摘要
   * 统一模板入口、AI 卡片和导出前提示所使用的状态语义。
   */
  const aiSidebarMeta = useMemo(() => {
    const statusKey = getAIWorkbenchStatusKey(aiConfigStatus)
    const { toneClass } = getAIWorkbenchToneMeta(statusKey)
    const badgeLabel = getAIWorkbenchBadgeLabel(statusKey, locale)
    const actionLabel = getAIWorkbenchActionLabel(statusKey, locale)
    const action = getAIWorkbenchAction(statusKey)

    if (statusKey === 'ready') {
      return {
        toneClass,
        badgeLabel,
        templateHint: locale === 'zh' ? '模板已就绪，可继续配合 AI 打磨后导出。' : 'Templates are ready to pair with AI before export.',
        title: locale === 'zh' ? 'AI 工作台已可直接使用' : 'AI workspace is ready',
        description: locale === 'zh' ? '当前已经验证通过，可直接继续智能优化或从零生成。' : 'Validation passed. Continue with optimize or start-fresh directly.',
        actionLabel,
        action
      }
    }

    if (statusKey === 'needsValidation') {
      return {
        toneClass,
        badgeLabel,
        templateHint: locale === 'zh' ? '模板可先切换，完成验证后再继续智能优化。' : 'Templates can be switched now. Validate AI before optimization.',
        title: locale === 'zh' ? 'AI 工作台待验证' : 'AI workspace needs validation',
        description: locale === 'zh' ? '当前配置已补齐，建议先打开 AI 助手完成一次验证。' : 'The setup is filled in. Open AI once to complete validation.',
        actionLabel,
        action
      }
    }

    if (statusKey === 'needsConfig') {
      return {
        toneClass,
        badgeLabel,
        templateHint: locale === 'zh' ? '模板可先选择，补齐 AI 配置后再继续智能优化。' : 'Choose templates first, then finish AI setup for optimization.',
        title: locale === 'zh' ? 'AI 工作台待配置' : 'AI workspace needs setup',
        description: locale === 'zh' ? '当前还缺少配置项，继续补齐后即可解锁智能优化与生成。' : 'Some settings are still missing before optimize and generate are unlocked.',
        actionLabel,
        action
      }
    }

    return {
      toneClass,
      badgeLabel,
      templateHint: locale === 'zh' ? '模板和样式可继续调整，AI 功能当前处于停用状态。' : 'Templates and styles still work while AI stays disabled.',
      title: locale === 'zh' ? 'AI 工作台已停用' : 'AI workspace is disabled',
      description: locale === 'zh' ? '当前 AI 已停用，打开配置即可重新启用。' : 'AI is disabled. Open configuration to enable it again.',
      actionLabel,
      action
    }
  }, [aiConfigStatus, locale])

  // Handle section click - scroll to section in editor
  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionChange(sectionId)
    
    // Dispatch custom event to scroll to section in editor
    const event = new CustomEvent('scrollToSection', { 
      detail: { section: sectionId } 
    })
    window.dispatchEvent(event)
  }, [onSectionChange])

  return (
    <div className={`flex flex-col bg-white/50 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-100 px-3 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{t.editor.content}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{t.common.edit}</p>
      </div>

      {/* Navigation Items */}
      <div className="px-2 py-3">
        <nav className="space-y-1.5">
          {translatedItems.map((item) => {
            const IconComponent = item.icon
            const isActive = item.id === activeSection
            const sectionState = sectionCompleteness?.[item.id as ResumeSectionId]
            const sectionScore = sectionState?.score ?? 0
            const sectionCompleted = Boolean(sectionState?.completed)

            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`relative w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-colors group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-600 ring-1 ring-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"
                  />
                )}

                {/* Icon with background */}
                <div className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* Label and description */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="text-sm font-semibold mb-0.5">{item.label}</div>
                  <div className={`text-xs leading-relaxed transition-colors ${
                    isActive ? 'text-blue-500/80' : 'text-gray-500 group-hover:text-gray-600'
                  } line-clamp-2`}>
                    {item.description}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        sectionCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-[11px] text-gray-500">
                      {sectionCompleted
                        ? (locale === 'zh' ? '已完善' : 'Completed')
                        : (locale === 'zh' ? '待完善' : 'Needs work')}
                    </span>
                    <span className="ml-auto text-[11px] font-semibold text-gray-600">
                      {sectionScore}%
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Template & Style Section */}
      <div className="border-t border-gray-100 px-2 pb-3 pt-3 space-y-2">
        {/* Template Selector Button */}
        {onShowTemplateSelector && (
          <button
            onClick={onShowTemplateSelector}
            className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-left text-gray-700 transition-colors group hover:bg-slate-50 hover:text-slate-900"
          >
            <div className="flex-shrink-0 rounded-lg bg-slate-100 p-2 text-slate-700 transition-all group-hover:bg-slate-200">
              <Palette className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">{t.editor.template}</div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${aiSidebarMeta.toneClass}`}>
                  {aiSidebarMeta.badgeLabel}
                </span>
              </div>
              <div className="text-xs text-gray-500 transition-colors group-hover:text-gray-700">
                {aiSidebarMeta.templateHint}
              </div>
            </div>
          </button>
        )}

        {(onShowAIAssistant || onShowAIConfig) && (
          <div className={`rounded-xl border px-2.5 py-2.5 ${aiSidebarMeta.toneClass}`}>
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 rounded-lg bg-white/70 p-2 text-current">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">{aiSidebarMeta.title}</div>
                  <span className="rounded-full border border-current/15 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-current">
                    {aiSidebarMeta.badgeLabel}
                  </span>
                </div>
                <div className="mt-1 text-xs leading-5 opacity-85">
                  {aiSidebarMeta.description}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (aiSidebarMeta.action === 'assistant' && onShowAIAssistant) {
                      onShowAIAssistant()
                      return
                    }

                    onShowAIConfig?.()
                  }}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg border border-current/15 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-current transition-colors hover:bg-white"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>{aiSidebarMeta.actionLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Style Settings Toggle Button */}
        <button
          onClick={() => setShowStyleSettings(!showStyleSettings)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-colors group border ${
            showStyleSettings
              ? 'bg-slate-50 text-slate-900 ring-1 ring-slate-200 border-slate-200'
              : 'text-gray-700 bg-white hover:bg-slate-50 hover:text-slate-900 border-gray-200'
          }`}
        >
          <div className={`flex-shrink-0 p-2 rounded-lg transition-all ${
            showStyleSettings 
              ? 'bg-slate-200 text-slate-800' 
              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
          }`}>
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{t.editor.styleSettings || '样式设置'}</div>
            <div className={`text-xs transition-colors ${
              showStyleSettings ? 'text-slate-600' : 'text-gray-500 group-hover:text-gray-700'
            }`}>
              {locale === 'zh' ? '自定义样式' : 'Customize styles'}
            </div>
          </div>
          <div className={`flex-shrink-0 transition-all ${
            showStyleSettings ? 'text-slate-700 rotate-180' : 'text-gray-400 group-hover:text-slate-700'
          }`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Inline Style Settings Panel */}
      <AnimatePresence>
        {showStyleSettings && (
          <div className="border-t border-gray-100 overflow-hidden bg-gray-50/50">
              <StyleSettingsPanel />
            </div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{locale === 'zh' ? '简历完成度' : 'Resume completion'}</span>
          <span className="font-medium text-gray-700">
            {completionOverview.totalScore}%
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completionOverview.totalScore >= 80
                ? 'bg-emerald-500'
                : completionOverview.totalScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
            }`}
            style={{ 
              width: `${Math.max(0, Math.min(100, completionOverview.totalScore))}%` 
            }}
          />
        </div>
        {onJumpToNextIncomplete && completionOverview.incompleteCount > 0 && (
          <button
            type="button"
            onClick={onJumpToNextIncomplete}
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            {locale === 'zh'
              ? `继续完善（剩余 ${completionOverview.incompleteCount} 项）`
              : `Continue (${completionOverview.incompleteCount} pending)`}
          </button>
        )}
      </div>
    </div>
  )
}

export default SectionNavigation
