
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { Code, GripVertical } from 'lucide-react'
import { AnimatePresence, Reorder } from 'framer-motion'
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

  // 预设颜色
  const PRESET_COLORS = [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#EF4444', // 红色
    '#F59E0B', // 黄色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#6B7280', // 灰色
    '#111827', // 黑色
  ]

  // 添加技能
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 50,
      category: 'Technical',
      color: '#3B82F6'
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

  // 处理拖拽排序
  const handleReorder = (newSkills: Skill[]) => {
    onChange(newSkills)
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.skills.title}
        description={t.editor.skills.description}
        count={skills.length}
        icon={<Code className="w-5 h-5" />}
      />

      <Reorder.Group axis="y" values={skills} onReorder={handleReorder} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {skills.map((skill) => (
            <Reorder.Item key={skill.id} value={skill}>
              <EditableCard
                title={skill.name || t.editor.skills.placeholders.name}
                subtitle={`${skill.category} - ${skill.level}%`}
                onDelete={() => deleteSkill(skill.id)}
                dragHandle={<GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing mr-2" />}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Tag Color
                       </label>
                       <div className="flex flex-wrap gap-2">
                         {PRESET_COLORS.map(color => (
                           <button
                             key={color}
                             type="button"
                             onClick={() => updateSkill(skill.id, 'color', color)}
                             className={`w-6 h-6 rounded-full border-2 transition-all ${
                               skill.color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                             }`}
                             style={{ backgroundColor: color }}
                             aria-label={`Select color ${color}`}
                           />
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </EditableCard>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AddCardButton onAdd={addSkill} text={t.editor.skills.add} />
    </div>
  )
}
