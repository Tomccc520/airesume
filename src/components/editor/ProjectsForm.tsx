
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { FolderOpen } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Project } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { RichTextEditor } from './RichTextEditor'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectsFormProps {
  projects: Project[]
  onChange: (data: Project[]) => void
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const { t } = useLanguage()

  // 添加项目
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      highlights: ['']
    }
    onChange([...projects, newProject])
  }

  // 更新项目
  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    )
    onChange(updatedProjects)
  }

  // 删除项目
  const deleteProject = (id: string) => {
    onChange(projects.filter(project => project.id !== id))
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.projects.title}
        description={t.editor.projects.description}
        count={projects.length}
        icon={<FolderOpen className="w-5 h-5" />}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <EditableCard
              key={project.id}
              title={project.name || t.editor.projects.placeholders.name}
              subtitle={project.description?.slice(0, 30)}
              onDelete={() => deleteProject(project.id)}
            >
              <div className="space-y-4">
                <FormField
                  label={t.editor.projects.name}
                  type="text"
                  value={project.name}
                  onChange={(value) => updateProject(project.id, 'name', value)}
                  placeholder={t.editor.projects.placeholders.name}
                />

                {/* 使用富文本编辑器 */}
                <RichTextEditor
                  label={t.editor.projects.description_label}
                  value={project.description}
                  onChange={(value) => updateProject(project.id, 'description', value)}
                  placeholder={t.editor.projects.placeholders.description}
                  minRows={3}
                  maxRows={10}
                  showToolbar={true}
                  enableAI={false}
                />

                <FormFieldGroup>
                  <FormField
                    label={t.editor.projects.startDate}
                    type="month"
                    value={project.startDate}
                    onChange={(value) => updateProject(project.id, 'startDate', value)}
                  />
                  <FormField
                    label={t.editor.projects.endDate}
                    type="month"
                    value={project.endDate}
                    onChange={(value) => updateProject(project.id, 'endDate', value)}
                  />
                </FormFieldGroup>

                <FormField
                  label={t.editor.projects.link}
                  type="url"
                  value={project.url || ''}
                  onChange={(value) => updateProject(project.id, 'url', value)}
                  placeholder={t.editor.projects.placeholders.link}
                />

                <FormField
                  label={t.editor.projects.technologies}
                  type="text"
                  value={project.technologies.join(', ')}
                  onChange={(value) => updateProject(project.id, 'technologies', value.split(',').map(t => t.trim()))}
                  placeholder={t.editor.projects.placeholders.technologies}
                />

                {/* 使用富文本编辑器 */}
                <RichTextEditor
                  label={t.editor.projects.highlights}
                  value={project.highlights.join('\n')}
                  onChange={(value) => updateProject(project.id, 'highlights', value.split('\n').filter(line => line.trim()))}
                  placeholder={t.editor.projects.placeholders.highlights}
                  minRows={3}
                  maxRows={10}
                  showToolbar={true}
                  enableAI={false}
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
