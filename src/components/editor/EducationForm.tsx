
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { GraduationCap } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Education } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { useLanguage } from '@/contexts/LanguageContext'

interface EducationFormProps {
  education: Education[]
  onChange: (data: Education[]) => void
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const { t } = useLanguage()

  // 添加教育经历
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    }
    onChange([...education, newEducation])
  }

  // 更新教育经历
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updatedEducation = education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    onChange(updatedEducation)
  }

  // 删除教育经历
  const deleteEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id))
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.education.title}
        description={t.editor.education.description}
        count={education.length}
        icon={<GraduationCap className="w-5 h-5" />}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {education.map((edu) => (
            <EditableCard
              key={edu.id}
              title={edu.school || t.editor.education.placeholders.school}
              subtitle={edu.major}
              onDelete={() => deleteEducation(edu.id)}
            >
              <div className="space-y-4">
                <FormFieldGroup>
                  <FormField
                    label={t.editor.education.school}
                    type="text"
                    value={edu.school}
                    onChange={(value) => updateEducation(edu.id, 'school', value)}
                    placeholder={t.editor.education.placeholders.school}
                  />
                  <FormField
                    label={t.editor.education.degree}
                    type="text"
                    value={edu.degree}
                    onChange={(value) => updateEducation(edu.id, 'degree', value)}
                    placeholder={t.editor.education.placeholders.degree}
                  />
                </FormFieldGroup>

                <FormFieldGroup>
                  <FormField
                    label={t.editor.education.major}
                    type="text"
                    value={edu.major}
                    onChange={(value) => updateEducation(edu.id, 'major', value)}
                    placeholder={t.editor.education.placeholders.major}
                  />
                  <FormField
                    label={t.editor.education.gpa}
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(value) => updateEducation(edu.id, 'gpa', value)}
                    placeholder={t.editor.education.placeholders.gpa}
                  />
                </FormFieldGroup>

                <FormFieldGroup>
                  <FormField
                    label={t.editor.education.startDate}
                    type="month"
                    value={edu.startDate}
                    onChange={(value) => updateEducation(edu.id, 'startDate', value)}
                  />
                  <FormField
                    label={t.editor.education.endDate}
                    type="month"
                    value={edu.endDate}
                    onChange={(value) => updateEducation(edu.id, 'endDate', value)}
                  />
                </FormFieldGroup>

                <FormField
                  label={t.editor.education.description_label}
                  type="textarea"
                  value={edu.description || ''}
                  onChange={(value) => updateEducation(edu.id, 'description', value)}
                  placeholder={t.editor.education.placeholders.description}
                  rows={3}
                />
              </div>
            </EditableCard>
          ))}
        </AnimatePresence>
      </div>

      <AddCardButton onAdd={addEducation} text={t.editor.education.add} />
    </div>
  )
}
