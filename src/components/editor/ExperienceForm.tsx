
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useMemo, useState } from 'react'
import { Briefcase, ChevronDown, ChevronUp, Copy, MoveDown, MoveUp } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Experience } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { RichTextEditor } from './RichTextEditor'
import { useLanguage } from '@/contexts/LanguageContext'
import { useListEditor } from '@/hooks/useListEditor'
import { formatLineItems, parseLineItems } from '@/utils/editorTextParsers'

interface ExperienceFormProps {
  experiences: Experience[]
  onChange: (data: Experience[]) => void
  showSectionHeader?: boolean
}

export function ExperienceForm({
  experiences,
  onChange,
  showSectionHeader = true
}: ExperienceFormProps) {
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'
  const [showSecondaryFields, setShowSecondaryFields] = useState<Record<string, boolean>>({})
  const {
    addItem,
    updateItem,
    updateItemField,
    deleteItem,
    duplicateItem,
    moveItem
  } = useListEditor<Experience>({
    items: experiences,
    onChange
  })

  /**
   * 工作经历快捷片段
   * 提供 STAR 与结果导向句式，降低高质量条目编写门槛。
   */
  const experienceSnippets = useMemo(() => {
    if (isZh) {
      return [
        {
          label: '结果导向句式',
          content: '负责核心模块重构，3 个月内将页面首屏加载时间从 3.2s 降至 1.9s，转化率提升 12%。'
        },
        {
          label: '协作推进句式',
          content: '推动产品、研发与测试协作闭环，建立迭代评审机制，线上缺陷率下降 30%。'
        },
        {
          label: '增长优化句式',
          content: '围绕关键漏斗指标开展 A/B 实验，连续 2 个季度实现新增用户成本下降 18%。'
        }
      ]
    }

    return [
      {
        label: 'Impact sentence',
        content: 'Led core module refactoring and reduced initial load time from 3.2s to 1.9s within 3 months, improving conversion by 12%.'
      },
      {
        label: 'Collaboration sentence',
        content: 'Aligned product, engineering, and QA execution with a shared release cadence, cutting production defects by 30%.'
      },
      {
        label: 'Growth sentence',
        content: 'Ran funnel-focused A/B experiments and reduced user acquisition cost by 18% across two consecutive quarters.'
      }
    ]
  }, [isZh])

  /**
   * 添加工作经历
   * 使用统一列表编辑 Hook，避免每个表单重复实现增删改。
   */
  const addExperience = () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
      location: ''
    }
    addItem(newExperience)
  }

  /**
   * 切换“至今”状态
   * 当状态切到“至今”时清空结束时间，避免时间冲突。
   */
  const toggleCurrent = (id: string, nextCurrent?: boolean) => {
    updateItem(id, (item) => {
      const current = nextCurrent ?? !item.current
      return {
        ...item,
        current,
        endDate: current ? '' : item.endDate
      }
    })
  }

  /**
   * 切换补充信息区
   * 将地点与排序等低频操作后撤，减少主录入区干扰。
   */
  const toggleSecondaryFields = (id: string) => {
    setShowSecondaryFields((current) => ({
      ...current,
      [id]: !(current[id] ?? false)
    }))
  }

  /**
   * 计算补充信息区的默认展开状态
   * 已填写地点时优先展开，避免用户误以为该信息不存在。
   */
  const isSecondaryFieldsVisible = (experience: Experience) =>
    showSecondaryFields[experience.id] ?? Boolean(experience.location)

  return (
    <div className={showSectionHeader ? 'space-y-6' : 'space-y-5'}>
      {showSectionHeader && (
        <SectionHeader 
          title={t.editor.experience.title}
          description={t.editor.experience.description}
          count={experiences.length}
          icon={<Briefcase className="w-5 h-5" />}
        />
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {experiences.map((exp, index) => (
            <EditableCard
              key={exp.id}
              title={exp.company || t.editor.experience.placeholders.company}
              subtitle={exp.position}
              onDelete={() => deleteItem(exp.id)}
            >
              <div className="space-y-4">
                <FormFieldGroup>
                  <FormField
                    label={t.editor.experience.company}
                    type="text"
                    value={exp.company}
                    onChange={(value) => updateItemField(exp.id, 'company', value)}
                    fieldKey="experience-company"
                    placeholder={t.editor.experience.placeholders.company}
                  />
                  <FormField
                    label={t.editor.experience.position}
                    type="text"
                    value={exp.position}
                    onChange={(value) => updateItemField(exp.id, 'position', value)}
                    placeholder={t.editor.experience.placeholders.position}
                  />
                </FormFieldGroup>

                <FormFieldGroup>
                  <FormField
                    label={t.editor.experience.startDate}
                    type="month"
                    value={exp.startDate}
                    onChange={(value) => updateItemField(exp.id, 'startDate', value)}
                  />
                  <FormField
                    label={t.editor.experience.endDate}
                    type="month"
                    value={exp.current ? '' : exp.endDate}
                    onChange={(value) => updateItemField(exp.id, 'endDate', value)}
                    disabled={exp.current}
                  />
                </FormFieldGroup>

                <button
                  type="button"
                  onClick={() => toggleSecondaryFields(exp.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {isZh ? '补充信息' : 'Optional details'}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {isZh ? '地点、复制、顺序调整' : 'Location, duplicate, and sorting'}
                    </p>
                  </div>
                  {isSecondaryFieldsVisible(exp) ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                <div className="flex items-center p-3 bg-white/50 rounded-xl border border-gray-200/50 hover:bg-white/80 transition-colors cursor-pointer" onClick={() => toggleCurrent(exp.id)}>
                  <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${exp.current ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${exp.current ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <label htmlFor={`current-${exp.id}`} className="ml-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
                    {t.editor.experience.current}
                  </label>
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => toggleCurrent(exp.id, e.target.checked)}
                    className="hidden"
                  />
                </div>

                {isSecondaryFieldsVisible(exp) && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <FormField
                      label={t.editor.experience.location}
                      type="text"
                      value={exp.location || ''}
                      onChange={(value) => updateItemField(exp.id, 'location', value)}
                      placeholder={t.editor.experience.placeholders.location}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          duplicateItem(exp.id, {
                            company: exp.company ? `${exp.company}${isZh ? '（复制）' : ' (Copy)'}` : exp.company
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {isZh ? '复制' : 'Duplicate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(exp.id, 'up')}
                        disabled={index === 0}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                        {isZh ? '上移' : 'Move Up'}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(exp.id, 'down')}
                        disabled={index === experiences.length - 1}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                        {isZh ? '下移' : 'Move Down'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 使用富文本编辑器替代普通文本框 */}
                <RichTextEditor
                  label={t.editor.experience.description_label}
                  value={formatLineItems(exp.description)}
                  onChange={(value) => updateItemField(exp.id, 'description', parseLineItems(value))}
                  fieldKey="experience-description"
                  placeholder={t.editor.experience.placeholders.description}
                  minRows={4}
                  maxRows={12}
                  showToolbar={true}
                  enableAI={false}
                  recommendedLength={{ min: 80, max: 260 }}
                  snippets={experienceSnippets}
                  enableQualityCheck={true}
                />
              </div>
            </EditableCard>
          ))}
        </AnimatePresence>
      </div>

      <AddCardButton onAdd={addExperience} text={t.editor.experience.add} />
    </div>
  )
}
