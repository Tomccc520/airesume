/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 *
 * @description 编辑器字段引导映射，负责把模块缺口映射到具体可编辑字段。
 */

import { ResumeSectionId } from '@/utils/resumeCompleteness'

export type EditorFieldKey =
  | 'personal-title'
  | 'personal-summary'
  | 'experience-company'
  | 'experience-description'
  | 'education-school'
  | 'education-description'
  | 'skills-batch-input'
  | 'skills-list'
  | 'project-description'
  | 'project-technologies'
  | 'project-highlights'

export interface EditorFieldGuidance {
  fieldKey: EditorFieldKey
  label: string
  description: string
}

/**
 * 获取模块字段引导
 * 将当前缺口翻译成“应该先去补哪个字段”的可执行提示。
 */
export function getPrimaryEditorFieldGuidance(
  section: ResumeSectionId,
  primaryGapLabel: string | null,
  locale: 'zh' | 'en'
): EditorFieldGuidance {
  switch (section) {
    case 'personal':
      return {
        fieldKey: primaryGapLabel === (locale === 'zh' ? '定位与价值表达' : 'positioning and value')
          ? 'personal-title'
          : 'personal-summary',
        label: locale === 'zh' ? '定位到个人简介' : 'Jump to summary',
        description: locale === 'zh'
          ? '先把个人定位、关键词和结果句写清楚。'
          : 'Clarify positioning, keywords, and impact lines first.'
      }
    case 'experience':
      return {
        fieldKey: primaryGapLabel === (locale === 'zh' ? '原始工作要点' : 'experience bullets')
          ? 'experience-company'
          : 'experience-description',
        label: locale === 'zh' ? '定位到工作经历描述' : 'Jump to experience',
        description: locale === 'zh'
          ? '优先补动作、结果和量化表达。'
          : 'Add actions, outcomes, and measurable impact first.'
      }
    case 'education':
      return {
        fieldKey: primaryGapLabel === (locale === 'zh' ? '教育经历' : 'education')
          ? 'education-school'
          : 'education-description',
        label: locale === 'zh' ? '定位到教育经历' : 'Jump to education',
        description: locale === 'zh'
          ? '先补学校、专业或课程亮点，再考虑优化表达。'
          : 'Add school, major, or coursework highlights first.'
      }
    case 'skills':
      return {
        fieldKey: primaryGapLabel === (locale === 'zh' ? '核心技能' : 'core skills')
          ? 'skills-batch-input'
          : 'skills-list',
        label: locale === 'zh' ? '定位到技能编辑区' : 'Jump to skills',
        description: locale === 'zh'
          ? '先补核心技能或整理分类，再做岗位导向重排。'
          : 'Add core skills or clean up grouping before rewriting.'
      }
    case 'projects':
      return {
        fieldKey: primaryGapLabel === (locale === 'zh' ? '项目亮点' : 'project highlights')
          ? 'project-description'
          : primaryGapLabel === (locale === 'zh' ? '亮点要点' : 'highlight bullets')
            ? 'project-highlights'
            : 'project-highlights',
        label: locale === 'zh' ? '定位到项目亮点' : 'Jump to project highlights',
        description: locale === 'zh'
          ? '先把背景、动作和结果句补实，再交给 AI 压缩。'
          : 'Ground the project in context, action, and outcome first.'
      }
    default:
      return {
        fieldKey: 'personal-summary',
        label: locale === 'zh' ? '定位到个人简介' : 'Jump to summary',
        description: locale === 'zh'
          ? '先补充基础内容。'
          : 'Add the missing source content first.'
      }
  }
}
