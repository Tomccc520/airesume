
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

import React, { useMemo } from 'react'
import Image from 'next/image'
import { Link2, QrCode, Trash2, User } from 'lucide-react'
import { PersonalInfo } from '@/types/resume'
import { OptimizedImageUpload } from '../OptimizedImageUpload'
import FormField, { FormFieldGroup } from '@/components/FormField'
import { RichTextEditor } from './RichTextEditor'
import { SectionHeader } from './SectionHeader'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createContactQRCodeImageUrl,
  normalizeContactQRCodePayload,
  resolveContactQRCodePayload
} from '@/utils/contactQRCode'

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo
  onChange: (data: PersonalInfo) => void
  onAiOptimize?: () => void
  showSectionHeader?: boolean
}

export function PersonalInfoForm({
  personalInfo,
  onChange,
  onAiOptimize,
  showSectionHeader = true
}: PersonalInfoFormProps) {
  const { t, locale } = useLanguage()
  const personalInfoI18n = t.editor.personalInfo as Record<string, string | Record<string, string>>
  const isZh = locale === 'zh'

  /**
   * 更新字段值
   * 对外保持不可变更新，避免出现局部状态不同步。
   */
  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...personalInfo,
      [field]: value
    })
  }

  /**
   * 更新个人网站字段
   * 自动补全协议头，减少链接导出后不可点击的问题。
   */
  const updateWebsite = (value: string) => {
    const next = value.trim()
    if (!next) {
      updateField('website', '')
      return
    }

    if (/^https?:\/\//i.test(next)) {
      updateField('website', next)
      return
    }

    if (/^www\./i.test(next)) {
      updateField('website', `https://${next}`)
      return
    }

    updateField('website', next)
  }

  /**
   * 更新联系方式二维码字段
   * 录入时做轻量规范化，确保后续模板展示可直接扫码。
   */
  const updateContactQRCode = (value: string) => {
    const next = value.trim()
    if (!next) {
      updateField('contactQRCode', '')
      return
    }
    updateField('contactQRCode', normalizeContactQRCodePayload(next))
  }

  // 更新头像圆角半径
  const updateAvatarBorderRadius = (value: number) => {
    onChange({
      ...personalInfo,
      avatarBorderRadius: value
    })
  }

  /**
   * 职位快捷建议
   * 为常见岗位提供一键填充，降低首次录入成本。
   */
  const titleSuggestions = useMemo(() => {
    if (isZh) {
      return ['前端工程师', '产品经理', '运营经理', 'UI 设计师', '全栈工程师']
    }
    return ['Frontend Engineer', 'Product Manager', 'Operations Manager', 'UI Designer', 'Full-stack Engineer']
  }, [isZh])

  /**
   * 个人简介快捷片段
   * 直接传给富文本编辑器作为默认可选片段。
   */
  const summarySnippets = useMemo(() => {
    if (isZh) {
      return [
        {
          label: '技术岗投递版',
          content:
            '具备 5 年以上互联网项目经验，擅长将复杂业务拆解为可落地方案，持续优化性能与稳定性，能够在高迭代节奏下稳定交付。'
        },
        {
          label: '产品/运营投递版',
          content:
            '围绕业务目标推进从需求分析到上线复盘的完整闭环，关注数据指标与用户反馈，能够跨团队协同推动项目高质量落地。'
        },
        {
          label: '管理协作版',
          content:
            '善于协调多角色协作，具备流程梳理与项目推进经验，能够在资源受限场景下保证关键目标按期完成。'
        }
      ]
    }

    return [
      {
        label: 'Engineering profile',
        content:
          'Experienced in turning complex requirements into scalable implementations, with strong ownership in performance, reliability, and on-time delivery.'
      },
      {
        label: 'Product/operations profile',
        content:
          'Drive projects from requirement analysis to launch and review, with clear focus on metrics, user feedback, and cross-team collaboration.'
      },
      {
        label: 'Leadership profile',
        content:
          'Strong coordination and execution mindset, able to align stakeholders and deliver critical outcomes under tight constraints.'
      }
    ]
  }, [isZh])

  const emailLooksValid = !personalInfo.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)
  const phoneLooksValid = !personalInfo.phone || /^[+\d\s\-()]{6,}$/.test(personalInfo.phone)
  const resolvedQRCodePayload = resolveContactQRCodePayload(personalInfo)
  const contactQRCodePreviewUrl = useMemo(() => {
    if (!resolvedQRCodePayload) {
      return null
    }
    return createContactQRCodeImageUrl(resolvedQRCodePayload, 168)
  }, [resolvedQRCodePayload])

  return (
    <div className={showSectionHeader ? 'space-y-6' : 'space-y-5'}>
      {showSectionHeader && (
        <SectionHeader 
          title={t.editor.personalInfo.title}
          description={t.editor.personalInfo.description}
          icon={<User className="w-5 h-5" />}
        />
      )}
      
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
              {(personalInfoI18n.avatarBorderRadius as string) || '头像圆角'}
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

      <div className="flex flex-wrap gap-2">
        {titleSuggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => updateField('title', item)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              personalInfo.title === item
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

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

      {(!emailLooksValid || !phoneLooksValid) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {!emailLooksValid && (
            <div>{isZh ? '邮箱格式看起来不正确，建议检查后缀是否完整。' : 'Email format looks invalid. Please check the domain suffix.'}</div>
          )}
          {!phoneLooksValid && (
            <div>{isZh ? '电话格式建议仅使用数字、+、空格或短横线。' : 'Phone should contain only digits, +, spaces, or hyphens.'}</div>
          )}
        </div>
      )}

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
          onChange={updateWebsite}
          placeholder={t.editor.personalInfo.placeholders.website}
        />
      </FormFieldGroup>

      {/* 联系方式二维码设置 */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            {isZh ? '联系方式二维码' : 'Contact QR Code'}
          </h3>
        </div>

        <FormField
          label={isZh ? '二维码内容（链接/邮箱/手机号）' : 'QR Content (URL/Email/Phone)'}
          type="text"
          value={personalInfo.contactQRCode || ''}
          onChange={updateContactQRCode}
          placeholder={
            isZh
              ? '例如：https://github.com/yourname 或 weixin://dl/chat?username=...'
              : 'e.g. https://github.com/yourname or mail@example.com'
          }
        />

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateContactQRCode(personalInfo.website || personalInfo.email || personalInfo.phone || '')}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Link2 className="h-3.5 w-3.5" />
            {isZh ? '使用已有联系方式' : 'Use Existing Contact'}
          </button>
          {personalInfo.contactQRCode && (
            <button
              type="button"
              onClick={() => updateContactQRCode('')}
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isZh ? '清空二维码' : 'Clear QR'}
            </button>
          )}
        </div>

        {contactQRCodePreviewUrl && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Image
                src={contactQRCodePreviewUrl}
                alt={isZh ? '联系方式二维码预览' : 'Contact QR Preview'}
                width={84}
                height={84}
                unoptimized
                className="rounded border border-slate-200"
              />
              <div className="min-w-0 text-xs text-slate-600">
                <div className="font-medium text-slate-800">{isZh ? '扫码内容预览' : 'QR Payload Preview'}</div>
                <p className="mt-1 break-all">{resolvedQRCodePayload}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
        recommendedLength={{ min: 80, max: 240 }}
        snippets={summarySnippets}
        enableQualityCheck={true}
      />
    </div>
  )
}
