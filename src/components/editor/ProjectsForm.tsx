
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useMemo } from 'react'
import { Copy, FolderOpen, MoveDown, MoveUp } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Project } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { RichTextEditor } from './RichTextEditor'
import { useLanguage } from '@/contexts/LanguageContext'
import { useListEditor } from '@/hooks/useListEditor'
import { formatLineItems, formatTagItems, parseLineItems, parseTagItems } from '@/utils/editorTextParsers'

interface ProjectsFormProps {
  projects: Project[]
  onChange: (data: Project[]) => void
  showSectionHeader?: boolean
}

export function ProjectsForm({
  projects,
  onChange,
  showSectionHeader = true
}: ProjectsFormProps) {
  const { t, locale } = useLanguage()
  const isZh = locale === 'zh'
  const {
    addItem,
    updateItemField,
    deleteItem,
    duplicateItem,
    moveItem
  } = useListEditor<Project>({
    items: projects,
    onChange
  })

  /**
   * 项目描述快捷片段
   * 强调“业务目标 + 技术方案 + 结果”结构，提升投递可读性。
   */
  const projectDescriptionSnippets = useMemo(() => {
    if (isZh) {
      return [
        {
          label: '业务闭环模板',
          content: '面向核心业务流程搭建统一平台，完成从需求梳理到上线复盘的全链路交付，显著提升团队协作效率。'
        },
        {
          label: '技术改造模板',
          content: '主导旧系统现代化改造，引入标准化工程体系与自动化流程，稳定性和迭代效率同步提升。'
        }
      ]
    }

    return [
      {
        label: 'Business delivery',
        content: 'Built an end-to-end platform for key workflows and delivered from requirement alignment to launch review with measurable execution gains.'
      },
      {
        label: 'Technical revamp',
        content: 'Led legacy modernization with standardized engineering workflows and automation, improving both stability and delivery speed.'
      }
    ]
  }, [isZh])

  /**
   * 项目亮点快捷片段
   * 提供可直接替换数字和指标的成果句式。
   */
  const projectHighlightSnippets = useMemo(() => {
    if (isZh) {
      return [
        {
          label: '性能成果句式',
          content: '将关键页面渲染耗时从 2.8s 降至 1.4s，首屏性能指标提升 45%。'
        },
        {
          label: '效率成果句式',
          content: '沉淀标准化组件与流程，使功能交付周期缩短约 30%。'
        },
        {
          label: '业务成果句式',
          content: '上线后 2 个月内核心转化率提升 11%，并保持稳定增长。'
        }
      ]
    }

    return [
      {
        label: 'Performance impact',
        content: 'Reduced key page render time from 2.8s to 1.4s, improving first-screen performance metrics by 45%.'
      },
      {
        label: 'Efficiency impact',
        content: 'Standardized reusable components and workflows, shortening feature delivery cycle by around 30%.'
      },
      {
        label: 'Business impact',
        content: 'Improved core conversion rate by 11% within two months after launch with sustained growth.'
      }
    ]
  }, [isZh])

  /**
   * 添加项目
   * 统一通过列表编辑 Hook 维护列表状态。
   */
  const addProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      highlights: ['']
    }
    addItem(newProject)
  }

  return (
    <div className={showSectionHeader ? 'space-y-6' : 'space-y-5'}>
      {showSectionHeader && (
        <SectionHeader 
          title={t.editor.projects.title}
          description={t.editor.projects.description}
          count={projects.length}
          icon={<FolderOpen className="w-5 h-5" />}
        />
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <EditableCard
              key={project.id}
              title={project.name || t.editor.projects.placeholders.name}
              subtitle={project.description?.slice(0, 30)}
              onDelete={() => deleteItem(project.id)}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      duplicateItem(project.id, {
                        name: project.name ? `${project.name}${isZh ? '（复制）' : ' (Copy)'}` : project.name
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {isZh ? '复制' : 'Duplicate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(project.id, 'up')}
                    disabled={index === 0}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                    {isZh ? '上移' : 'Move Up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(project.id, 'down')}
                    disabled={index === projects.length - 1}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                    {isZh ? '下移' : 'Move Down'}
                  </button>
                </div>

                <FormField
                  label={t.editor.projects.name}
                  type="text"
                  value={project.name}
                  onChange={(value) => updateItemField(project.id, 'name', value)}
                  placeholder={t.editor.projects.placeholders.name}
                />

                {/* 使用富文本编辑器 */}
                <RichTextEditor
                  label={t.editor.projects.description_label}
                  value={project.description}
                  onChange={(value) => updateItemField(project.id, 'description', value)}
                  fieldKey="project-description"
                  placeholder={t.editor.projects.placeholders.description}
                  minRows={3}
                  maxRows={10}
                  showToolbar={true}
                  enableAI={false}
                  recommendedLength={{ min: 70, max: 220 }}
                  snippets={projectDescriptionSnippets}
                  enableQualityCheck={true}
                />

                <FormFieldGroup>
                  <FormField
                    label={t.editor.projects.startDate}
                    type="month"
                    value={project.startDate}
                    onChange={(value) => updateItemField(project.id, 'startDate', value)}
                  />
                  <FormField
                    label={t.editor.projects.endDate}
                    type="month"
                    value={project.endDate}
                    onChange={(value) => updateItemField(project.id, 'endDate', value)}
                  />
                </FormFieldGroup>

                <FormField
                  label={t.editor.projects.link}
                  type="url"
                  value={project.url || ''}
                  onChange={(value) => updateItemField(project.id, 'url', value)}
                  placeholder={t.editor.projects.placeholders.link}
                />

                <FormField
                  label={t.editor.projects.technologies}
                  type="text"
                  value={formatTagItems(project.technologies)}
                  onChange={(value) => updateItemField(project.id, 'technologies', parseTagItems(value))}
                  fieldKey="project-technologies"
                  placeholder={t.editor.projects.placeholders.technologies}
                />

                {/* 使用富文本编辑器 */}
                <RichTextEditor
                  label={t.editor.projects.highlights}
                  value={formatLineItems(project.highlights)}
                  onChange={(value) => updateItemField(project.id, 'highlights', parseLineItems(value))}
                  fieldKey="project-highlights"
                  placeholder={t.editor.projects.placeholders.highlights}
                  minRows={3}
                  maxRows={10}
                  showToolbar={true}
                  enableAI={false}
                  recommendedLength={{ min: 60, max: 260 }}
                  snippets={projectHighlightSnippets}
                  enableQualityCheck={true}
                />
              </div>
            </EditableCard>
          ))}
        </AnimatePresence>
      </div>

      <AddCardButton onAdd={addProject} text={t.editor.projects.add} />
    </div>
  )
}
