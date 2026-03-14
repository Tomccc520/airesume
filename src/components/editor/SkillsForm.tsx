
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useState } from 'react'
import { Code, GripVertical, Palette } from 'lucide-react'
import { AnimatePresence, Reorder } from 'framer-motion'
import { Skill } from '@/types/resume'
import { EditableCard } from './EditableCard'
import { AddCardButton } from './AddCardButton'
import { SectionHeader } from './SectionHeader'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStyle } from '@/contexts/StyleContext'

interface SkillsFormProps {
  skills: Skill[]
  onChange: (data: Skill[]) => void
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const { t, locale } = useLanguage()
  const { styleConfig, updateStyleConfig } = useStyle()
  const [showStyleSelector, setShowStyleSelector] = useState(false)

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

  // 技能展示样式选项
  const skillStyles = [
    { value: 'progress', label: locale === 'zh' ? '进度条' : 'Progress Bar', icon: '━' },
    { value: 'tags', label: locale === 'zh' ? '标签云' : 'Tag Cloud', icon: 'TAG' },
    { value: 'list', label: locale === 'zh' ? '列表' : 'List', icon: '•' },
    { value: 'cards', label: locale === 'zh' ? '卡片' : 'Cards', icon: '[]' },
    { value: 'minimal', label: locale === 'zh' ? '极简' : 'Minimal', icon: '─' },
    { value: 'grid', label: locale === 'zh' ? '网格' : 'Grid', icon: '##' },
    { value: 'circular', label: locale === 'zh' ? '圆形进度' : 'Circular', icon: 'O' },
    { value: 'radar', label: locale === 'zh' ? '雷达图' : 'Radar', icon: '<>' },
    { value: 'star-rating', label: locale === 'zh' ? '星级评分' : 'Star Rating', icon: '***' },
    { value: 'badge', label: locale === 'zh' ? '徽章' : 'Badge', icon: 'BDG' },
    { value: 'wave-progress', label: locale === 'zh' ? '波浪进度' : 'Wave Progress', icon: '~~~' },
    { value: 'gradient-card', label: locale === 'zh' ? '渐变卡片' : 'Gradient Card', icon: 'GRD' },
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

      {/* 技能展示样式选择器 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <button
          onClick={() => setShowStyleSelector(!showStyleSelector)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {locale === 'zh' ? '技能展示样式' : 'Skills Display Style'}
            </span>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {skillStyles.find(s => s.value === styleConfig.skills.displayStyle)?.label || '进度条'}
          </span>
        </button>

        {showStyleSelector && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => {
              updateStyleConfig({
                    skills: {
                      ...styleConfig.skills,
                      displayStyle: style.value as typeof styleConfig.skills.displayStyle
                    }
                  })
                  setShowStyleSelector(false)
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  styleConfig.skills.displayStyle === style.value
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl mb-1">{style.icon}</div>
                <div className={`text-sm font-medium ${
                  styleConfig.skills.displayStyle === style.value
                    ? 'text-blue-700'
                    : 'text-gray-700'
                }`}>
                  {style.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

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
