/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

'use client'

import React, { useCallback, useMemo } from 'react'
import { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { navigationItems } from '@/data/navigation'
import { ResumeSectionId, SectionCompleteness } from '@/utils/resumeCompleteness'

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
}

interface SectionNavigationProps {
  /**
   * 当前激活模块
   */
  activeSection: string
  /**
   * 切换模块
   */
  onSectionChange: (section: string) => void
  /**
   * 模块完成度
   */
  sectionCompleteness?: Partial<Record<ResumeSectionId, SectionCompleteness>>
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 左侧模块导航
 * 仅保留模块切换、完成度和当前激活态，避免继续承载模板、AI 和提示文案。
 */
export function SectionNavigation({
  activeSection,
  onSectionChange,
  sectionCompleteness,
  className = ''
}: SectionNavigationProps) {
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'

  /**
   * 获取本地化后的导航项
   * 统一模块名称显示，避免侧栏保留多余描述文案。
   */
  const translatedItems: NavigationItem[] = useMemo(() => {
    return navigationItems.map((item) => {
      switch (item.id) {
        case 'personal':
          return { ...item, label: t.editor.personalInfo.title }
        case 'experience':
          return { ...item, label: t.editor.experience.title }
        case 'education':
          return { ...item, label: t.editor.education.title }
        case 'skills':
          return { ...item, label: t.editor.skills.title }
        case 'projects':
          return { ...item, label: t.editor.projects.title }
        default:
          return { ...item, label: item.label }
      }
    })
  }, [t])

  /**
   * 统计整体完成度
   * 在侧栏底部保留一条简洁的整体进度反馈。
   */
  const completionOverview = useMemo(() => {
    const sectionList = translatedItems
      .map((item) => sectionCompleteness?.[item.id as ResumeSectionId])
      .filter((item): item is SectionCompleteness => Boolean(item))

    if (sectionList.length === 0) {
      return 0
    }

    return Math.round(sectionList.reduce((sum, item) => sum + item.score, 0) / sectionList.length)
  }, [sectionCompleteness, translatedItems])

  /**
   * 处理模块切换
   * 保持编辑器滚动联动，但不再附带额外提示状态。
   */
  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionChange(sectionId)

    const event = new CustomEvent('scrollToSection', {
      detail: { section: sectionId }
    })
    window.dispatchEvent(event)
  }, [onSectionChange])

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{t.editor.content}</h3>
        <p className="mt-1 text-xs text-slate-500">{t.common.edit}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
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
                type="button"
                onClick={() => handleSectionClick(item.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`rounded-xl border p-2 ${
                  isActive
                    ? 'border-white/15 bg-white/10 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{item.label}</span>
                    <span className={`text-[11px] font-semibold ${
                      isActive ? 'text-white/80' : 'text-slate-500'
                    }`}>
                      {sectionScore}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        sectionCompleted ? 'bg-emerald-500' : isActive ? 'bg-white/70' : 'bg-amber-500'
                      }`}
                    />
                    <span className={`text-[11px] ${
                      isActive ? 'text-white/75' : 'text-slate-500'
                    }`}>
                      {sectionCompleted
                        ? (isZh ? '已完成' : 'Completed')
                        : (isZh ? '编辑中' : 'In Progress')}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{isZh ? '整体完成度' : 'Completion'}</span>
          <span className="font-semibold text-slate-700">{completionOverview}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              completionOverview >= 80
                ? 'bg-emerald-500'
                : completionOverview >= 60
                  ? 'bg-amber-500'
                  : 'bg-slate-900'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, completionOverview))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default SectionNavigation
