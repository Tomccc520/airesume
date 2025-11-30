
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { Briefcase } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Experience } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { useLanguage } from '@/contexts/LanguageContext'

interface ExperienceFormProps {
  experiences: Experience[]
  onChange: (data: Experience[]) => void
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const { t } = useLanguage()

  // 添加工作经历
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
      location: ''
    }
    onChange([...experiences, newExperience])
  }

  // 更新工作经历
  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updatedExperiences = experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    onChange(updatedExperiences)
  }

  // 删除工作经历
  const deleteExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id))
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.experience.title}
        description={t.editor.experience.description}
        count={experiences.length}
        icon={<Briefcase className="w-5 h-5" />}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {experiences.map((exp) => (
            <EditableCard
              key={exp.id}
              title={exp.company || t.editor.experience.placeholders.company}
              subtitle={exp.position}
              onDelete={() => deleteExperience(exp.id)}
            >
              <div className="space-y-4">
                <FormFieldGroup>
                  <FormField
                    label={t.editor.experience.company}
                    type="text"
                    value={exp.company}
                    onChange={(value) => updateExperience(exp.id, 'company', value)}
                    placeholder={t.editor.experience.placeholders.company}
                  />
                  <FormField
                    label={t.editor.experience.position}
                    type="text"
                    value={exp.position}
                    onChange={(value) => updateExperience(exp.id, 'position', value)}
                    placeholder={t.editor.experience.placeholders.position}
                  />
                </FormFieldGroup>

                <FormFieldGroup>
                  <FormField
                    label={t.editor.experience.startDate}
                    type="month"
                    value={exp.startDate}
                    onChange={(value) => updateExperience(exp.id, 'startDate', value)}
                  />
                  <FormField
                    label={t.editor.experience.endDate}
                    type="month"
                    value={exp.current ? '' : exp.endDate}
                    onChange={(value) => updateExperience(exp.id, 'endDate', value)}
                    disabled={exp.current}
                  />
                </FormFieldGroup>

                <div className="flex items-center p-3 bg-white/50 rounded-xl border border-gray-200/50 hover:bg-white/80 transition-colors cursor-pointer" onClick={() => updateExperience(exp.id, 'current', !exp.current)}>
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
                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                    className="hidden"
                  />
                </div>

                <FormField
                  label={t.editor.experience.location}
                  type="text"
                  value={exp.location || ''}
                  onChange={(value) => updateExperience(exp.id, 'location', value)}
                  placeholder={t.editor.experience.placeholders.location}
                />

                <FormField
                  label={t.editor.experience.description_label}
                  type="textarea"
                  value={exp.description.join('\n')}
                  onChange={(value) => updateExperience(exp.id, 'description', value.split('\n'))}
                  placeholder={t.editor.experience.placeholders.description}
                  rows={4}
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
