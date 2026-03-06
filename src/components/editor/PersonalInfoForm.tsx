
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React from 'react'
import { User } from 'lucide-react'
import { PersonalInfo } from '@/types/resume'
import { OptimizedImageUpload } from '../OptimizedImageUpload'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { RichTextEditor } from './RichTextEditor'
import { SectionHeader } from './SectionHeader'
import { useLanguage } from '@/contexts/LanguageContext'

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo
  onChange: (data: PersonalInfo) => void
  onAiOptimize?: () => void
}

export function PersonalInfoForm({ personalInfo, onChange, onAiOptimize }: PersonalInfoFormProps) {
  const { t } = useLanguage()

  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...personalInfo,
      [field]: value
    })
  }

  // 更新头像圆角半径
  const updateAvatarBorderRadius = (value: number) => {
    onChange({
      ...personalInfo,
      avatarBorderRadius: value
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t.editor.personalInfo.title}
        description={t.editor.personalInfo.description}
        icon={<User className="w-5 h-5" />}
      />
      
      {/* 头像上传区域 */}
      <div className="text-center mb-6">
        <OptimizedImageUpload
          currentImage={personalInfo.avatar}
          onUpload={(imageUrl) => updateField('avatar', imageUrl)}
          className="mx-auto"
          maxWidth={2000}
          maxHeight={2000}
          quality={1}
          showOptimizationInfo={false}
          showProgress={false}
        />
        
        {/* 头像圆角设置 - 简化版本 */}
        {personalInfo.avatar && (
          <div className="mt-4 max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.editor.personalInfo.avatarBorderRadius || '头像圆角'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="50"
                value={personalInfo.avatarBorderRadius ?? 8}
                onChange={(e) => updateAvatarBorderRadius(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-right">
                {personalInfo.avatarBorderRadius ?? 8}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 基本信息分组 */}
      <FormFieldGroup>
        <FormField
          label={t.editor.personalInfo.name}
          type="text"
          value={personalInfo.name}
          onChange={(value) => updateField('name', value)}
          placeholder={t.editor.personalInfo.placeholders.name}
        />
        <FormField
          label={t.editor.personalInfo.jobTitle}
          type="text"
          value={personalInfo.title}
          onChange={(value) => updateField('title', value)}
          placeholder={t.editor.personalInfo.placeholders.jobTitle}
        />
      </FormFieldGroup>

      <FormFieldGroup>
        <FormField
          label={t.editor.personalInfo.email}
          type="email"
          value={personalInfo.email}
          onChange={(value) => updateField('email', value)}
          placeholder={t.editor.personalInfo.placeholders.email}
        />
        <FormField
          label={t.editor.personalInfo.phone}
          type="tel"
          value={personalInfo.phone}
          onChange={(value) => updateField('phone', value)}
          placeholder={t.editor.personalInfo.placeholders.phone}
        />
      </FormFieldGroup>

      <FormFieldGroup>
        <FormField
          label={t.editor.personalInfo.location}
          type="text"
          value={personalInfo.location}
          onChange={(value) => updateField('location', value)}
          placeholder={t.editor.personalInfo.placeholders.location}
        />
        <FormField
          label={t.editor.personalInfo.website}
          type="url"
          value={personalInfo.website || ''}
          onChange={(value) => updateField('website', value)}
          placeholder={t.editor.personalInfo.placeholders.website}
        />
      </FormFieldGroup>

      {/* 使用富文本编辑器 */}
      <RichTextEditor
        label={t.editor.personalInfo.summary}
        value={personalInfo.summary}
        onChange={(value) => updateField('summary', value)}
        placeholder={t.editor.personalInfo.placeholders.summary}
        minRows={4}
        maxRows={12}
        showToolbar={true}
        enableAI={true}
        onAIOptimize={onAiOptimize}
      />
    </div>
  )
}
