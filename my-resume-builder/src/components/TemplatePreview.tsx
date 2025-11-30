/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import React from 'react'
import { TemplateStyle } from '@/types/template'
import { ResumeData } from '@/types/resume'

interface TemplatePreviewProps {
  template: TemplateStyle
  fullSize?: boolean
}

/**
 * 模板预览组件
 * 生成模板的真实预览效果，用于模板选择器
 */
const TemplatePreview = ({ 
  template, 
  fullSize = false
}: TemplatePreviewProps) => {
  // 使用示例数据
  const sampleData: ResumeData = {
    personalInfo: {
      name: '张三',
      title: '前端开发工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市',
      summary: '具有3年前端开发经验，熟练掌握React、Vue等主流框架，有丰富的项目开发经验。'
    },
    experience: [
      {
        id: '1',
        company: 'ABC科技有限公司',
        position: '前端开发工程师',
        startDate: '2022-03',
        endDate: '至今',
        current: true,
        description: ['负责公司主要产品的前端开发工作，参与多个重要项目的开发和维护。', '完成了公司官网的重构，提升页面加载速度30%'],
        location: '北京市'
      }
    ],
    education: [
      {
        id: '1',
        school: '北京大学',
        degree: '学士',
        major: '计算机科学与技术',
        startDate: '2018-09',
        endDate: '2022-06',
        gpa: '3.8/4.0',
        description: '主修计算机科学与技术专业'
      }
    ],
    skills: [
      { id: '1', name: 'JavaScript', level: 90, category: '编程语言' },
      { id: '2', name: 'React', level: 80, category: '前端框架' },
      { id: '3', name: 'Vue.js', level: 80, category: '前端框架' }
    ],
    projects: [
      {
        id: '1',
        name: '企业管理系统',
        description: '基于React开发的企业内部管理系统',
        technologies: ['React', 'TypeScript', 'Ant Design'],
        startDate: '2023-01',
        endDate: '2023-06',
        highlights: ['实现了完整的用户权限管理', '优化了系统性能，响应速度提升50%']
      }
    ]
  }

  const scale = fullSize ? 1 : 0.3
  const previewStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: `${100 / scale}%`,
    height: `${100 / scale}%`,
    backgroundColor: template.colors.background,
    color: template.colors.text,
    fontFamily: template.fonts.body
  }

  // 个人信息渲染
  const renderPersonalInfo = () => {
    const isVertical = template.components.personalInfo.layout === 'vertical'
    const showAvatar = template.components.personalInfo.showAvatar
    
    return (
      <div className={`${isVertical ? 'text-center' : 'flex items-center space-x-4'} mb-6 pb-4 border-b-2`} 
           style={{ borderColor: template.colors.primary }}>
        {showAvatar && (
          <div 
            className={`w-16 h-16 rounded-full ${isVertical ? 'mx-auto mb-3' : 'flex-shrink-0'}`}
            style={{ backgroundColor: template.colors.primary }}
          />
        )}
        
        <div className={isVertical ? '' : 'flex-1'}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: template.colors.primary, fontSize: `${template.fonts.size.heading}px` }}>
            {sampleData.personalInfo.name}
          </h1>
          <p className="text-lg mb-2" style={{ color: template.colors.secondary }}>
            {sampleData.personalInfo.title}
          </p>
          <div className={`text-sm space-y-1 ${isVertical ? 'text-center' : ''}`}>
            <p>{sampleData.personalInfo.email}</p>
            <p>{sampleData.personalInfo.phone}</p>
            <p>{sampleData.personalInfo.location}</p>
          </div>
        </div>
      </div>
    )
  }

  // 章节标题渲染
  const renderSectionTitle = (title: string) => {
    const style = template.components.sectionTitle.style
    const alignment = template.components.sectionTitle.alignment
    
    const baseClasses = `text-lg font-semibold mb-3 ${
      alignment === 'center' ? 'text-center' : 
      alignment === 'right' ? 'text-right' : 'text-left'
    }`
    
    const titleStyle = {
      color: template.colors.primary,
      fontSize: template.fonts.size.heading
    }

    switch (style) {
      case 'background':
        return (
          <h2 className={`${baseClasses} px-3 py-1 rounded`} 
              style={{ ...titleStyle, backgroundColor: template.colors.primary, color: 'white' }}>
            {title}
          </h2>
        )
      case 'underline':
        return (
          <h2 className={`${baseClasses} border-b-2 pb-1`} 
              style={{ ...titleStyle, borderColor: template.colors.primary }}>
            {title}
          </h2>
        )
      case 'border':
        return (
          <h2 className={`${baseClasses} border-l-4 pl-3`} 
              style={{ ...titleStyle, borderColor: template.colors.primary }}>
            {title}
          </h2>
        )
      default:
        return (
          <h2 className={baseClasses} style={titleStyle}>
            {title}
          </h2>
        )
    }
  }

  // 通用章节渲染
  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="mb-6">
      {renderSectionTitle(title)}
      {content}
    </div>
  )

  // 工作经历渲染
  const renderExperience = () => (
    <div className="space-y-4">
      {sampleData.experience.map((exp) => (
        <div key={exp.id} className="relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold" style={{ color: template.colors.text }}>
                {exp.position}
              </h3>
              <p className="text-sm" style={{ color: template.colors.secondary }}>
                {exp.company}
              </p>
            </div>
            <span className="text-sm" style={{ color: template.colors.secondary }}>
              {exp.startDate} - {exp.endDate}
            </span>
          </div>
          <div className="text-sm space-y-1">
            {exp.description.map((desc, index) => (
              <p key={index} style={{ color: template.colors.text }}>
                • {desc}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // 教育背景渲染
  const renderEducation = () => (
    <div className="space-y-4">
      {sampleData.education.map((edu) => (
        <div key={edu.id}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold" style={{ color: template.colors.text }}>
                {edu.major}
              </h3>
              <p className="text-sm" style={{ color: template.colors.secondary }}>
                {edu.school} • {edu.degree}
              </p>
            </div>
            <span className="text-sm" style={{ color: template.colors.secondary }}>
              {edu.startDate} - {edu.endDate}
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  // 技能渲染
  const renderSkills = () => {
    const levelMap = {
      'beginner': 25,
      'intermediate': 50,
      'advanced': 75,
      'expert': 90
    }

    return (
      <div className="space-y-3">
        {sampleData.skills.map((skill) => (
          <div key={skill.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium" style={{ color: template.colors.text }}>
                {skill.name}
              </span>
              <span className="text-xs" style={{ color: template.colors.secondary }}>
                {skill.level}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  backgroundColor: template.colors.primary,
                  width: `${skill.level}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 项目经验渲染
  const renderProjects = () => (
    <div className="space-y-4">
      {sampleData.projects.map((project) => (
        <div key={project.id}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold" style={{ color: template.colors.text }}>
              {project.name}
            </h3>
            <span className="text-sm" style={{ color: template.colors.secondary }}>
              {project.startDate} - {project.endDate}
            </span>
          </div>
          <p className="text-sm mb-2" style={{ color: template.colors.text }}>
            {project.description}
          </p>
          <div className="text-sm space-y-1">
            {project.highlights.map((highlight, index) => (
              <p key={index} style={{ color: template.colors.text }}>
                • {highlight}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // 根据模板布局配置渲染不同的布局
  const renderLayout = () => {
    const isDoubleColumn = template.layout.columns.count === 2
    const isLeftSidebar = template.id.includes('sidebar-left')
    const isRightSidebar = template.id.includes('sidebar-right')
    const isTimeline = template.id.includes('timeline')
    const isCompact = template.id.includes('compact')

    if (isDoubleColumn && (isLeftSidebar || isRightSidebar)) {
      return renderSidebarLayout()
    } else if (isTimeline) {
      return renderTimelineLayout()
    } else if (isCompact) {
      return renderCompactLayout()
    } else {
      return renderSingleColumnLayout()
    }
  }

  // 单栏布局
  const renderSingleColumnLayout = () => (
    <div className="space-y-6">
      {renderPersonalInfo()}
      {renderSection('工作经历', renderExperience())}
      {renderSection('教育背景', renderEducation())}
      {renderSection('技能', renderSkills())}
      {renderSection('项目经验', renderProjects())}
    </div>
  )

  // 侧边栏布局
  const renderSidebarLayout = () => {
    const isLeftSidebar = template.id.includes('sidebar-left')
    const leftContent = isLeftSidebar ? (
      <div className="space-y-4">
        {renderPersonalInfo()}
        {renderSection('技能', renderSkills())}
      </div>
    ) : (
      <div className="space-y-4">
        {renderSection('工作经历', renderExperience())}
        {renderSection('项目经验', renderProjects())}
      </div>
    )

    const rightContent = isLeftSidebar ? (
      <div className="space-y-4">
        {renderSection('工作经历', renderExperience())}
        {renderSection('教育背景', renderEducation())}
        {renderSection('项目经验', renderProjects())}
      </div>
    ) : (
      <div className="space-y-4">
        {renderPersonalInfo()}
        {renderSection('教育背景', renderEducation())}
        {renderSection('技能', renderSkills())}
      </div>
    )

    return (
      <div className="grid grid-cols-5 gap-6">
        <div className={isLeftSidebar ? 'col-span-2' : 'col-span-3'}>
          {leftContent}
        </div>
        <div className={isLeftSidebar ? 'col-span-3' : 'col-span-2'}>
          {rightContent}
        </div>
      </div>
    )
  }

  // 时间轴布局
  const renderTimelineLayout = () => (
    <div className="space-y-6">
      {renderPersonalInfo()}
      <div className="relative">
        {/* 时间轴线 */}
        <div 
          className="absolute left-4 top-0 bottom-0 w-0.5" 
          style={{ backgroundColor: template.colors.primary }}
        />
        <div className="space-y-6 pl-12">
          {renderSection('工作经历', renderExperience())}
          {renderSection('教育背景', renderEducation())}
          {renderSection('项目经验', renderProjects())}
        </div>
      </div>
      {renderSection('技能', renderSkills())}
    </div>
  )

  // 紧凑布局
  const renderCompactLayout = () => (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-2 space-y-3">
        {renderPersonalInfo()}
        {renderSection('技能', renderSkills())}
      </div>
      <div className="col-span-3 space-y-3">
        {renderSection('工作经历', renderExperience())}
        {renderSection('教育背景', renderEducation())}
        {renderSection('项目经验', renderProjects())}
      </div>
    </div>
  )

  return (
    <div className={`overflow-hidden ${fullSize ? 'w-full h-full' : 'w-full h-full'}`} style={{ aspectRatio: '3/4' }}>
      <div style={previewStyle} className="p-8 bg-white">
        {renderLayout()}
      </div>
    </div>
  )
}

export default React.memo(TemplatePreview)