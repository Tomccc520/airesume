
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
      </div>

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

      <FormField
        label={t.editor.personalInfo.summary}
        type="textarea"
        value={personalInfo.summary}
        onChange={(value) => updateField('summary', value)}
        placeholder={t.editor.personalInfo.placeholders.summary}
        rows={4}
        showAiButton={true}
        onAiOptimize={onAiOptimize}
      />
    </div>
  )
}
