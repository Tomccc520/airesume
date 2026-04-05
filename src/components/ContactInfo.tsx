/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import Image from 'next/image'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { useStyle } from '@/contexts/StyleContext'
import { createContactQRCodeImageUrl, resolveContactQRCodePayload } from '@/utils/contactQRCode'

interface ContactInfoProps {
  personalInfo: ResumeData['personalInfo']
  layout: 'inline' | 'grouped' | 'sidebar' | 'cards' | 'grid'
  onElementClick: (elementType: string) => void
}

/**
 * 联系信息组件
 * 支持五种不同的布局方式：内联、分组、侧边栏、卡片、网格
 */
export default function ContactInfo({ personalInfo, layout, onElementClick }: ContactInfoProps) {
  const { styleConfig } = useStyle()
  const qrPayload = resolveContactQRCodePayload(personalInfo)
  const qrImageUrl = qrPayload ? createContactQRCodeImageUrl(qrPayload, 164) : null

  /**
   * 渲染联系信息项
   */
  const renderContactItem = (icon: React.ReactNode, text: string) => {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
        {icon}
        <span className="truncate max-w-[14rem] sm:max-w-[20rem]">{text}</span>
      </div>
    )
  }

  /**
   * 获取联系信息数组
   */
  const getContactItems = () => {
    const items = []
    
    if (personalInfo.email) {
      items.push({
        key: 'email',
        content: renderContactItem(
          <Mail className="h-4 w-4" />, 
          personalInfo.email
        )
      })
    }
    
    if (personalInfo.phone) {
      items.push({
        key: 'phone',
        content: renderContactItem(
          <Phone className="h-4 w-4" />, 
          personalInfo.phone
        )
      })
    }
    
    if (personalInfo.location) {
      items.push({
        key: 'location',
        content: renderContactItem(
          <MapPin className="h-4 w-4" />, 
          personalInfo.location
        )
      })
    }
    
    if (personalInfo.website) {
      items.push({
        key: 'website',
        content: renderContactItem(
          <Globe className="h-4 w-4" />, 
          personalInfo.website
        )
      })
    }

    return items
  }

  const contactItems = getContactItems()

  /**
   * 渲染二维码卡片
   * 在已配置二维码时展示，便于招聘方扫码直达联系方式。
   */
  const renderQRCodeCard = () => {
    if (!qrImageUrl) {
      return null
    }

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2 text-center">
        <Image
          src={qrImageUrl}
          alt="联系方式二维码"
          width={72}
          height={72}
          unoptimized
          className="mx-auto h-[72px] w-[72px]"
        />
        <p className="mt-1 text-[10px] text-gray-500">联系二维码</p>
      </div>
    )
  }

  if (contactItems.length === 0) {
    return null
  }

  // 内联布局 - 水平排列
  if (layout === 'inline') {
    return (
      <div className="space-y-2">
        <div
          className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-700"
          onClick={() => onElementClick('personal')}
          style={{
            lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)`
          }}
        >
          {contactItems.map((item) => (
            <div key={item.key} className="rounded-full border border-gray-200 bg-white px-2 py-1 sm:px-2.5 sm:py-1">
              {item.content}
            </div>
          ))}
        </div>
        {qrImageUrl && <div className="flex justify-center">{renderQRCodeCard()}</div>}
      </div>
    )
  }

  // 分组布局 - 分为两行显示
  if (layout === 'grouped') {
    const firstRow = contactItems.slice(0, 2)
    const secondRow = contactItems.slice(2)

    return (
      <div
        className="space-y-3 rounded-lg p-3"
        onClick={() => onElementClick('personal')}
        style={{
          lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)`
        }}
      >
        <div className="flex justify-center gap-6 text-sm sm:text-base text-gray-600">
          {firstRow.map((item) => (
            <div key={item.key}>{item.content}</div>
          ))}
        </div>
        {secondRow.length > 0 && (
          <div className="flex justify-center gap-6 text-sm sm:text-base text-gray-600">
            {secondRow.map((item) => (
              <div key={item.key}>{item.content}</div>
            ))}
          </div>
        )}
        {qrImageUrl && <div className="flex justify-center">{renderQRCodeCard()}</div>}
      </div>
    )
  }

  // 侧边栏布局 - 垂直排列
  if (layout === 'sidebar') {
    return (
      <div
        className="space-y-3 rounded-lg p-3"
        onClick={() => onElementClick('personal')}
        style={{
          lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)`
        }}
      >
        {contactItems.map((item) => (
          <div key={item.key} className="text-sm sm:text-base text-gray-600">
            {item.content}
          </div>
        ))}
        {qrImageUrl && <div className="pt-1">{renderQRCodeCard()}</div>}
      </div>
    )
  }

  // 卡片布局 - 每个联系信息独立卡片
  if (layout === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-3" onClick={() => onElementClick('personal')}>
        {contactItems.map((item) => (
          <div key={item.key} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
            <div className="text-sm text-gray-600">{item.content}</div>
          </div>
        ))}
        {qrImageUrl && (
          <div className="col-span-2 flex justify-center">
            {renderQRCodeCard()}
          </div>
        )}
      </div>
    )
  }

  // 网格布局 - 紧凑的网格排列
  if (layout === 'grid') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 rounded-lg p-3" onClick={() => onElementClick('personal')}>
          {contactItems.map((item) => (
            <div key={item.key} className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
              {item.content}
            </div>
          ))}
        </div>
        {qrImageUrl && <div className="flex justify-center">{renderQRCodeCard()}</div>}
      </div>
    )
  }

  return null
}
