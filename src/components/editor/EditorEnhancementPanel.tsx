/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

'use client'

import React, { useMemo } from 'react'
import { Sparkles, Palette, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { TemplateStyle } from '@/types/template'
import { getTemplateById } from '@/data/templates'
import { ResumeScorer } from '@/utils/resumeScorer'
import { useLanguage } from '@/contexts/LanguageContext'

interface EditorEnhancementPanelProps {
  resumeData: ResumeData
  currentTemplateId: string
  onSelectTemplate: (template: TemplateStyle) => void
  onOpenTemplateSelector: () => void
  onOpenAIAssistant: () => void
}

/**
 * 编辑器增强面板
 * 展示质量评分、待优化项和模板快切入口，减少用户来回切换成本
 */
export default function EditorEnhancementPanel({
  resumeData,
  currentTemplateId,
  onSelectTemplate,
  onOpenTemplateSelector,
  onOpenAIAssistant
}: EditorEnhancementPanelProps) {
  const { locale } = useLanguage()

  /**
   * 计算简历质量分与关键建议
   * 仅取优先级最高的建议，避免信息过载
   */
  const qualitySnapshot = useMemo(() => {
    const scoreResult = ResumeScorer.calculateScore(resumeData)
    return {
      score: scoreResult.totalScore,
      completeness: scoreResult.completeness,
      topSuggestions: scoreResult.suggestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 2)
    }
  }, [resumeData])

  /**
   * 获取编辑器快速模板列表
   * 只展示高频模板，复杂筛选交给完整模板弹窗
   */
  const quickTemplates = useMemo(() => {
    const quickTemplateIds = ['two-column-standard', 'banner-layout', 'card-layout', 'minimal-text']
    return quickTemplateIds
      .map((templateId) => getTemplateById(templateId))
      .filter((template): template is TemplateStyle => Boolean(template))
  }, [])

  /**
   * 读取模板展示名称
   * 默认根据当前语言返回对应文案
   */
  const getTemplateName = (template: TemplateStyle) => {
    return locale === 'en' && template.nameEn ? template.nameEn : template.name
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span>{locale === 'en' ? 'Resume Health Score' : '简历健康评分'}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold leading-none">{qualitySnapshot.score}</div>
              <div className="mt-1 text-xs text-slate-300">
                {locale === 'en' ? 'Completeness' : '完整度'} {qualitySnapshot.completeness}%
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all"
              style={{ width: `${Math.max(qualitySnapshot.completeness, 8)}%` }}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {qualitySnapshot.topSuggestions.length > 0 ? (
              qualitySnapshot.topSuggestions.map((suggestion, index) => (
                <div key={`${suggestion.title}-${index}`} className="flex items-start gap-2 text-xs text-slate-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
                  <span>{suggestion.title}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-emerald-200">
                {locale === 'en' ? 'Great structure. Keep polishing details.' : '结构很完整，继续打磨细节即可。'}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Palette className="h-4 w-4 text-cyan-600" />
              <span>{locale === 'en' ? 'Quick Template Switch' : '模板快捷切换'}</span>
            </div>
            <button
              type="button"
              onClick={onOpenTemplateSelector}
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800"
            >
              {locale === 'en' ? 'More' : '更多'}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickTemplates.map((template) => {
              const isActive = template.id === currentTemplateId
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                  className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                    isActive
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium leading-snug">{getTemplateName(template)}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {template.layout.columns.count === 2
                      ? locale === 'en'
                        ? 'Two Column'
                        : '双栏布局'
                      : locale === 'en'
                        ? 'Single Column'
                        : '单栏布局'}
                  </div>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={onOpenAIAssistant}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            <Sparkles className="h-4 w-4" />
            {locale === 'en' ? 'Run AI Optimization' : '启动 AI 优化'}
          </button>
        </div>
      </div>
    </section>
  )
}
