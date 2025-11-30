
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { Code } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Skill } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { useLanguage } from '@/contexts/LanguageContext'

interface SkillsFormProps {
  skills: Skill[]
  onChange: (data: Skill[]) => void
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const { t } = useLanguage()

  // 添加技能
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 50,
      category: 'Technical'
    }
    onChange([...skills, newSkill])
  }

  // 更新技能
  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    const updatedSkills = skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    )
    onChange(updatedSkills)
  }

  // 删除技能
  const deleteSkill = (id: string) => {
    onChange(skills.filter(skill => skill.id !== id))
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.skills.title}
        description={t.editor.skills.description}
        count={skills.length}
        icon={<Code className="w-5 h-5" />}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {skills.map((skill) => (
            <EditableCard
              key={skill.id}
              title={skill.name || t.editor.skills.placeholders.name}
              subtitle={`${skill.category} - ${skill.level}%`}
              onDelete={() => deleteSkill(skill.id)}
            >
              <div className="space-y-4">
                <FormFieldGroup>
                  <FormField
                    label={t.editor.skills.name}
                    type="text"
                    value={skill.name}
                    onChange={(value) => updateSkill(skill.id, 'name', value)}
                    placeholder={t.editor.skills.placeholders.name}
                  />
                  <FormField
                    label="Category"
                    type="text"
                    value={skill.category}
                    onChange={(value) => updateSkill(skill.id, 'category', value)}
                    placeholder="Category"
                  />
                </FormFieldGroup>

                <div>
                  <FormField
                    label={`${t.editor.skills.level}: ${skill.level}%`}
                    type="range"
                    min={0}
                    max={100}
                    value={skill.level}
                    onChange={(value) => updateSkill(skill.id, 'level', parseInt(value))}
                    className="mb-0"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                    <span className="text-gray-400">0%</span>
                    <span className="text-green-600">100%</span>
                  </div>
                </div>
              </div>
            </EditableCard>
          ))}
        </AnimatePresence>
      </div>

      <AddCardButton onAdd={addSkill} text={t.editor.skills.add} />
    </div>
  )
}
