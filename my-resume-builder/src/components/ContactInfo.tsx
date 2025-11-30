/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { useStyle } from '@/contexts/StyleContext'

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

  if (contactItems.length === 0) {
    return null
  }

  // 内联布局 - 水平排列
  if (layout === 'inline') {
    return (
      <div 
        className="flex flex-wrap justify-center gap-2 lg:gap-3 text-xs sm:text-sm text-gray-700"
        onClick={() => onElementClick('personal')}
        style={{ 
          lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)` 
        }}
      >
        {contactItems.map(item => (
          <div key={item.key} className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border border-gray-200 bg-white shadow-none hover:bg-gray-50 transition-colors">
            {item.content}
          </div>
        ))}
      </div>
    )
  }

  // 分组布局 - 分为两行显示
  if (layout === 'grouped') {
    const firstRow = contactItems.slice(0, 2)
    const secondRow = contactItems.slice(2)

    return (
      <div 
        className="space-y-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-3 -m-3"
        onClick={() => onElementClick('personal')}
        style={{ 
          lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)` 
        }}
      >
        <div className="flex justify-center gap-6 lg:gap-8 text-sm sm:text-base text-gray-600">
          {firstRow.map(item => (
            <div key={item.key}>
              {item.content}
            </div>
          ))}
        </div>
        {secondRow.length > 0 && (
          <div className="flex justify-center gap-6 lg:gap-8 text-sm sm:text-base text-gray-600">
            {secondRow.map(item => (
              <div key={item.key}>
                {item.content}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 侧边栏布局 - 垂直排列
  if (layout === 'sidebar') {
    return (
      <div 
        className="space-y-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-3 -m-3"
        onClick={() => onElementClick('personal')}
        style={{ 
          lineHeight: `var(--spacing-line, ${styleConfig.spacing.line}px)` 
        }}
      >
        {contactItems.map(item => (
          <div key={item.key} className="text-sm sm:text-base text-gray-600">
            {item.content}
          </div>
        ))}
      </div>
    )
  }

  // 卡片布局 - 每个联系信息独立卡片
  if (layout === 'cards') {
    return (
      <div 
        className="grid grid-cols-2 gap-3 cursor-pointer"
        onClick={() => onElementClick('personal')}
      >
        {contactItems.map((item, index) => (
          <div 
            key={item.key} 
            className="bg-gray-50 hover:bg-gray-100 transition-all duration-300 rounded-lg p-3 text-center border border-gray-200 hover:border-gray-300 hover:shadow-sm transform hover:scale-105"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="text-sm text-gray-600">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 网格布局 - 紧凑的网格排列
  if (layout === 'grid') {
    return (
      <div 
        className="grid grid-cols-2 gap-2 cursor-pointer hover:bg-gray-50 transition-all duration-300 rounded-lg p-3 -m-3"
        onClick={() => onElementClick('personal')}
      >
        {contactItems.map((item, index) => (
          <div 
            key={item.key} 
            className="text-xs sm:text-sm text-gray-600 flex items-center justify-center transition-all duration-200 hover:text-gray-800 transform hover:scale-105"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    )
  }

  return null
}