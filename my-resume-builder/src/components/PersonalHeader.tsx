/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import { ResumeData } from '@/types/resume'
import { useStyle } from '@/contexts/StyleContext'
import { TemplateStyle } from '@/types/template'
import ContactInfo from './ContactInfo'
import OptimizedAvatar from './OptimizedAvatar'

interface PersonalHeaderProps {
  personalInfo: ResumeData['personalInfo']
  currentTemplate?: TemplateStyle
  onElementClick: (elementType: string) => void
  style?: React.CSSProperties
}

/**
 * 个人头部组件
 * 支持三种不同的布局方式：内联、分组、侧边栏
 */
export default function PersonalHeader({ personalInfo, currentTemplate, onElementClick, style }: PersonalHeaderProps) {
  const { styleConfig } = useStyle()

  /**
   * 获取合并后的样式配置
   */
  const getMergedStyleConfig = () => {
    if (!currentTemplate) return styleConfig
    
    // 辅助函数：将CSS尺寸字符串转换为像素值
    const parseSize = (sizeStr: string, defaultValue: number): number => {
      if (!sizeStr) return defaultValue
      
      // 处理rem单位
      if (sizeStr.includes('rem')) {
        const remValue = parseFloat(sizeStr.replace('rem', ''))
        return Math.round(remValue * 16) // 1rem = 16px
      }
      
      // 处理px单位
      if (sizeStr.includes('px')) {
        return parseInt(sizeStr.replace('px', ''))
      }
      
      // 处理em单位
      if (sizeStr.includes('em')) {
        const emValue = parseFloat(sizeStr.replace('em', ''))
        return Math.round(emValue * 16) // 1em = 16px
      }
      
      // 尝试直接解析数字
      const numValue = parseFloat(sizeStr)
      return isNaN(numValue) ? defaultValue : Math.round(numValue)
    }
    
    return {
      ...styleConfig,
      colors: {
        ...styleConfig.colors,
        primary: currentTemplate.colors?.primary || styleConfig.colors.primary,
        secondary: currentTemplate.colors?.secondary || styleConfig.colors.secondary,
        accent: currentTemplate.colors?.accent || styleConfig.colors.accent,
        text: currentTemplate.colors?.text || styleConfig.colors.text,
        background: currentTemplate.colors?.background || styleConfig.colors.background
      },
      fontSize: {
        ...styleConfig.fontSize,
        name: parseSize(currentTemplate.fonts?.size?.heading || '', styleConfig.fontSize.name),
        title: parseSize(currentTemplate.fonts?.size?.heading || '', styleConfig.fontSize.title),
        content: parseSize(currentTemplate.fonts?.size?.body || '', styleConfig.fontSize.content),
        small: parseSize(currentTemplate.fonts?.size?.small || '', styleConfig.fontSize.small)
      }
    }
  }

  const mergedStyleConfig = getMergedStyleConfig()

  /**
   * 获取头像显示URL
   * 优先级：用户上传的头像 > 样式配置中的头像 > 模板默认头像
   */
  const getAvatarUrl = (): string | undefined => {
    if (personalInfo.avatar) {
      return personalInfo.avatar
    }
    if (mergedStyleConfig.avatar.url) {
      return mergedStyleConfig.avatar.url
    }
    if (currentTemplate?.components.personalInfo.defaultAvatar) {
      return currentTemplate.components.personalInfo.defaultAvatar
    }
    return undefined
  }

  /**
   * 获取头像位置样式
   */
  const getAvatarPositionClass = () => {
    const position = currentTemplate?.components.personalInfo.avatarPosition || 'center'
    switch (position) {
      case 'left':
        return 'justify-start'
      case 'right':
        return 'justify-end'
      case 'center':
      default:
        return 'justify-center'
    }
  }

  /**
   * 渲染头像
   */
  const renderAvatar = () => {
    const avatarUrl = getAvatarUrl()
    const forcedByUser = Boolean(personalInfo?.avatar)
    const showAvatar = forcedByUser || (currentTemplate?.components.personalInfo.showAvatar !== false)
    
    if (!avatarUrl || !showAvatar) return null

    return (
      <div className={`flex mb-4 ${getAvatarPositionClass()}`}>
        <OptimizedAvatar
          src={avatarUrl}
          alt="头像"
          size={mergedStyleConfig.avatar.size}
          shape={mergedStyleConfig.avatar.shape}
          border={mergedStyleConfig.avatar.border}
          borderColor={mergedStyleConfig.avatar.borderColor}
          borderWidth={mergedStyleConfig.avatar.borderWidth}
          priority
        />
      </div>
    )
  }

  /**
   * 渲染姓名和职位
   */
  const renderNameAndTitle = () => (
    <div className="text-center mb-6">
      <h1 
        className="font-bold text-gray-900 mb-2"
        style={{ 
          fontSize: `var(--font-size-name, ${mergedStyleConfig.fontSize.name}px)`,
          color: mergedStyleConfig.colors.text
        }}
      >
        {personalInfo.name || '您的姓名'}
      </h1>
      <p 
        className="font-medium"
        style={{ 
          fontSize: `var(--font-size-title, ${mergedStyleConfig.fontSize.title}px)`,
          color: mergedStyleConfig.colors.primary
        }}
      >
        {personalInfo.title || '您的职位'}
      </p>
    </div>
  )

  // 根据样式设置优先、模板次之，决定个人信息头部布局
  const layoutType = mergedStyleConfig.layout.headerLayout || currentTemplate?.components.personalInfo.layout || 'centered'
  const selectedContactLayout = mergedStyleConfig.layout.contactLayout

  // 垂直布局 - 头像在上，姓名职位在下，联系信息在最下方
  if (layoutType === 'vertical') {
    return (
      <header 
        className="mb-8"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="text-center">
          {renderAvatar()}
          {renderNameAndTitle()}
          <ContactInfo 
            personalInfo={personalInfo}
            layout={selectedContactLayout}
            onElementClick={onElementClick}
          />
        </div>
      </header>
    )
  }

  // 水平布局 - 头像和基本信息在左侧，联系信息在右侧
  if (layoutType === 'horizontal') {
    const avatarUrl = getAvatarUrl()
    const forcedByUser = Boolean(personalInfo?.avatar)
    const showAvatar = forcedByUser || (currentTemplate?.components.personalInfo.showAvatar !== false)
    
    return (
      <header 
        className="mb-8"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
          {/* 左侧：头像和基本信息 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0">
            {avatarUrl && showAvatar && (
              <div className="flex-shrink-0">
                <OptimizedAvatar
                  src={avatarUrl}
                  alt="头像"
                  size={mergedStyleConfig.avatar.size}
                  shape={mergedStyleConfig.avatar.shape}
                  border={mergedStyleConfig.avatar.border}
                  borderColor={mergedStyleConfig.avatar.borderColor}
                  borderWidth={mergedStyleConfig.avatar.borderWidth}
                  priority
                />
              </div>
            )}
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h1 
                className="font-bold text-gray-900 mb-1 break-words"
                style={{ 
                  fontSize: `var(--font-size-name, ${mergedStyleConfig.fontSize.name}px)`,
                  color: mergedStyleConfig.colors.text
                }}
              >
                {personalInfo.name || '您的姓名'}
              </h1>
              <p 
                className="font-medium break-words"
                style={{ 
                  fontSize: `var(--font-size-title, ${mergedStyleConfig.fontSize.title}px)`,
                  color: mergedStyleConfig.colors.primary
                }}
              >
                {personalInfo.title || '您的职位'}
              </p>
            </div>
          </div>
          
          {/* 右侧：联系信息 */}
          <div className="flex-1 w-full lg:w-auto min-w-0">
            <ContactInfo 
              personalInfo={personalInfo}
              layout={selectedContactLayout}
              onElementClick={onElementClick}
            />
          </div>
        </div>
      </header>
    )
  }

  const contactLayout = mergedStyleConfig.layout.contactLayout

  // 居中布局（兼容内联）
  if (contactLayout === 'inline' || layoutType === 'centered') {
    return (
      <header 
        className="mb-8"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="text-center">
          {renderAvatar()}
          {renderNameAndTitle()}
          <ContactInfo 
            personalInfo={personalInfo}
            layout={selectedContactLayout}
            onElementClick={onElementClick}
          />
        </div>
      </header>
    )
  }

  // 分组布局 - 头像和姓名在上，联系信息分组显示
  if (contactLayout === 'grouped') {
    return (
      <header 
        className="mb-8"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="text-center">
          {renderAvatar()}
          {renderNameAndTitle()}
          <ContactInfo 
            personalInfo={personalInfo}
            layout="grouped"
            onElementClick={onElementClick}
          />
        </div>
      </header>
    )
  }

  // 卡片布局 - 头像和姓名在上，联系信息以卡片形式显示
  if (contactLayout === 'cards') {
    return (
      <header 
        className="mb-8"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="text-center">
          {renderAvatar()}
          {renderNameAndTitle()}
          <ContactInfo 
            personalInfo={personalInfo}
            layout="cards"
            onElementClick={onElementClick}
          />
        </div>
      </header>
    )
  }

  // 网格布局 - 头像和姓名在上，联系信息以网格形式显示
  if (contactLayout === 'grid') {
    return (
      <header 
        className="mb-8 pb-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4 -m-4"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="text-center">
          {renderAvatar()}
          {renderNameAndTitle()}
          <ContactInfo 
            personalInfo={personalInfo}
            layout="grid"
            onElementClick={onElementClick}
          />
        </div>
      </header>
    )
  }

  // 侧边栏布局 - 头像和基本信息在左侧，联系信息在右侧
  if (contactLayout === 'sidebar') {
    const avatarUrl = getAvatarUrl()
    
    return (
      <header 
        className="mb-8 pb-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4 -m-4"
        style={style}
        onClick={() => onElementClick('personal')}
      >
        <div className="flex items-start gap-8">
          {/* 左侧：头像和基本信息 */}
          <div className="flex-shrink-0">
            {avatarUrl && (
              <div className="mb-4">
                <OptimizedAvatar
                  src={avatarUrl}
                  alt="头像"
                  size={mergedStyleConfig.avatar.size}
                  shape={mergedStyleConfig.avatar.shape}
                  border={mergedStyleConfig.avatar.border}
                  borderColor={mergedStyleConfig.avatar.borderColor}
                  borderWidth={mergedStyleConfig.avatar.borderWidth}
                  priority
                />
              </div>
            )}
          </div>
          
          {/* 右侧：姓名、职位和联系信息 */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 
                className="font-bold text-gray-900 mb-2"
                style={{ 
                  fontSize: `var(--font-size-name, ${mergedStyleConfig.fontSize.name}px)`,
                  color: mergedStyleConfig.colors.text
                }}
              >
                {personalInfo.name || '您的姓名'}
              </h1>
              <p 
                className="font-medium"
                style={{ 
                  fontSize: `var(--font-size-title, ${mergedStyleConfig.fontSize.title}px)`,
                  color: mergedStyleConfig.colors.primary
                }}
              >
                {personalInfo.title || '您的职位'}
              </p>
            </div>
            
            <ContactInfo 
              personalInfo={personalInfo}
              layout="sidebar"
              onElementClick={onElementClick}
            />
          </div>
        </div>
      </header>
    )
  }

  // 默认返回内联布局
  return (
    <header 
      className="mb-8"
      style={style}
      onClick={() => onElementClick('personal')}
    >
      <div className="text-center">
        {renderAvatar()}
        {renderNameAndTitle()}
        <ContactInfo 
          personalInfo={personalInfo}
          layout="inline"
          onElementClick={onElementClick}
        />
      </div>
    </header>
  )
}