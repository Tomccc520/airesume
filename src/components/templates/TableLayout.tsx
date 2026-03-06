/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.2.2
 */

'use client'

import React from 'react'
import { ResumeData } from '@/types/resume'
import { StyleConfig } from '@/contexts/StyleContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'

interface TemplateProps {
  resumeData: ResumeData
  styleConfig: StyleConfig
  onSectionClick?: (section: string) => void
}

/**
 * 表格式布局 - 信息密集
 * 表格式展示基本信息，灰色背景分隔章节
 */
export const TableLayout: React.FC<TemplateProps> = ({
  resumeData,
  styleConfig,
  onSectionClick
}) => {
  const { personalInfo, experience, education, projects, skills } = resumeData
  const { colors, fontSize, spacing, fontFamily } = styleConfig
  const { locale, t } = useLanguage()

  const formatDateStr = (date?: string) => formatDate(date, locale)

  const fontFamilyStyle = fontFamily || '"Microsoft YaHei", "PingFang SC", sans-serif'
  const pagePadding = styleConfig.layout?.padding || 32
  const tableBg = '#f8f9fa'
  const borderColor = '#dee2e6'
  const headerBg = '#e9ecef'

  return (
    <div 
      className="w-full min-h-full bg-white"
      style={{ 
        fontFamily: fontFamilyStyle,
        color: colors.text || '#000000',
        padding: `${pagePadding}px`,
        fontSize: `${fontSize?.content || 14}px`
      }}
    >
      {/* 基本信息表格 - 优化版 */}
      <div 
        className="cursor-pointer"
        onClick={() => onSectionClick?.('personal')}
        style={{ marginBottom: `${spacing?.section || 28}px` }}
      >
        <table 
          className="w-full border-collapse"
          style={{ 
            border: `1.5px solid ${borderColor}`,
            fontSize: `${fontSize?.small || 13}px`,
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <tbody>
            {/* 姓名和照片行 */}
            <tr>
              <td 
                className="font-semibold p-3"
                style={{ 
                  backgroundColor: headerBg,
                  border: `1px solid ${borderColor}`,
                  width: '18%',
                  fontWeight: 600
                }}
              >
                姓名
              </td>
              <td 
                className="p-3"
                style={{ border: `1px solid ${borderColor}`, width: '32%' }}
              >
                {personalInfo.name}
              </td>
              <td 
                className="font-bold p-2"
                style={{ 
                  backgroundColor: tableBg,
                  border: `1px solid ${borderColor}`,
                  width: '20%'
                }}
              >
                职位
              </td>
              <td 
                className="p-2"
                style={{ border: `1px solid ${borderColor}`, width: '30%' }}
              >
                {personalInfo.title}
              </td>
            </tr>
            <tr>
              <td 
                className="font-bold p-2"
                style={{ 
                  backgroundColor: tableBg,
                  border: `1px solid ${borderColor}`
                }}
              >
                电话
              </td>
              <td 
                className="p-2"
                style={{ border: `1px solid ${borderColor}` }}
              >
                {personalInfo.phone}
              </td>
              <td 
                className="font-bold p-2"
                style={{ 
                  backgroundColor: tableBg,
                  border: `1px solid ${borderColor}`
                }}
              >
                邮箱
              </td>
              <td 
                className="p-2"
                style={{ border: `1px solid ${borderColor}` }}
              >
                {personalInfo.email}
              </td>
            </tr>
            {personalInfo.location && (
              <tr>
                <td 
                  className="font-bold p-2"
                  style={{ 
                    backgroundColor: tableBg,
                    border: `1px solid ${borderColor}`
                  }}
                >
                  地址
                </td>
                <td 
                  className="p-2"
                  colSpan={3}
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  {personalInfo.location}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 个人简介 */}
      {personalInfo.summary && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('personal')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <div 
            className="font-bold p-2"
            style={{ 
              backgroundColor: tableBg,
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: '8px'
            }}
          >
            {t.editor.templatePreview.personalSummary}
          </div>
          <p className="px-2" style={{ color: colors.text || '#000000', lineHeight: 1.6 }}>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* 工作经历 */}
      {experience && experience.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('experience')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <div 
            className="font-bold p-2"
            style={{ 
              backgroundColor: tableBg,
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: '8px'
            }}
          >
            {t.editor.experience.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {experience.map(exp => (
              <div key={exp.id} className="px-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {exp.position} | {exp.company}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(exp.startDate)} - {exp.current ? t.editor.experience.current : formatDateStr(exp.endDate)}
                  </span>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-none pl-0" style={{ marginTop: '4px' }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={{ marginBottom: '4px', color: colors.text || '#000000' }}>
                        • {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 项目经历 */}
      {projects && projects.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('projects')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <div 
            className="font-bold p-2"
            style={{ 
              backgroundColor: tableBg,
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: '8px'
            }}
          >
            {t.editor.projects.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {projects.map(project => (
              <div key={project.id} className="px-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {project.name}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(project.startDate)} - {formatDateStr(project.endDate)}
                  </span>
                </div>
                <p style={{ color: colors.text || '#000000', marginBottom: '4px' }}>
                  {project.description}
                </p>
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-none pl-0">
                    {project.highlights.map((h, i) => (
                      <li key={i} style={{ marginBottom: '4px', color: colors.text || '#000000' }}>
                        • {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教育背景 */}
      {education && education.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('education')}
          style={{ marginBottom: `${spacing?.section || 24}px` }}
        >
          <div 
            className="font-bold p-2"
            style={{ 
              backgroundColor: tableBg,
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: '8px'
            }}
          >
            {t.editor.education.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing?.item || 12}px` }}>
            {education.map(edu => (
              <div key={edu.id} className="px-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ color: colors.text || '#000000' }}>
                    {edu.school} | {edu.degree} | {edu.major}
                  </span>
                  <span style={{ fontSize: `${fontSize?.small || 12}px`, color: colors.secondary || '#666666' }}>
                    {formatDateStr(edu.startDate)} - {formatDateStr(edu.endDate)}
                  </span>
                </div>
                {edu.gpa && (
                  <div style={{ color: colors.secondary || '#666666', marginTop: '4px' }}>
                    GPA: {edu.gpa}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技能 */}
      {skills && skills.length > 0 && (
        <div 
          className="cursor-pointer"
          onClick={() => onSectionClick?.('skills')}
        >
          <div 
            className="font-bold p-2"
            style={{ 
              backgroundColor: tableBg,
              fontSize: `${fontSize?.title || 16}px`,
              color: colors.primary || '#000000',
              marginBottom: '8px'
            }}
          >
            {t.editor.skills.title}
          </div>
          <div className="px-2" style={{ color: colors.text || '#000000' }}>
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

