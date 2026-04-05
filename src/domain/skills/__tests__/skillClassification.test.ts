/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import {
  buildSkillReclassificationPlan,
  getDefaultSkillCategory,
  inferSkillCategory,
  parseQuickSkillTokens
} from '@/domain/skills/skillClassification'
import { Skill } from '@/types/resume'

describe('skillClassification', () => {
  /**
   * 验证批量输入解析
   * 保证中英文分隔符混用时仍能稳定去重。
   */
  it('支持混合分隔符并自动去重', () => {
    expect(parseQuickSkillTokens('React, TypeScript；React\nNode.js，Figma')).toEqual([
      'React',
      'TypeScript',
      'Node.js',
      'Figma'
    ])
  })

  /**
   * 验证默认分类和基础推断
   * 未命中关键词时回退通用能力，命中时输出对应系统分类。
   */
  it('能输出默认分类和基础推断结果', () => {
    expect(getDefaultSkillCategory('zh')).toBe('通用能力')
    expect(inferSkillCategory('Figma', 'zh')).toBe('设计能力')
    expect(inferSkillCategory('沟通协调', 'zh')).toBe('通用能力')
    expect(inferSkillCategory('未知技能', 'zh')).toBe('通用能力')
  })

  /**
   * 验证一键重整计划
   * 只修正明显错位的系统分类，不覆盖已有细分分类体系。
   */
  it('仅调整明显错位的技能分类', () => {
    const skills: Skill[] = [
      { id: '1', name: '数据分析', category: '前端开发', level: 70 },
      { id: '2', name: '沟通协调', category: '前端开发', level: 70 },
      { id: '3', name: 'Figma', category: '前端开发', level: 70 },
      { id: '4', name: 'React', category: '前端框架', level: 90 },
      { id: '5', name: 'Node.js', category: '后端技术', level: 85 }
    ]

    const plan = buildSkillReclassificationPlan(skills, 'zh')

    expect(plan.changes).toEqual([
      {
        skillId: '1',
        skillName: '数据分析',
        previousCategory: '前端开发',
        nextCategory: '数据分析'
      },
      {
        skillId: '2',
        skillName: '沟通协调',
        previousCategory: '前端开发',
        nextCategory: '通用能力'
      },
      {
        skillId: '3',
        skillName: 'Figma',
        previousCategory: '前端开发',
        nextCategory: '设计能力'
      }
    ])

    expect(plan.nextSkills.find((skill) => skill.id === '4')?.category).toBe('前端框架')
    expect(plan.nextSkills.find((skill) => skill.id === '5')?.category).toBe('后端技术')
  })

  /**
   * 验证锁定分类保护
   * 已手动锁定的技能即使明显错位，也不应再被智能重整覆盖。
   */
  it('会跳过已锁定分类的技能', () => {
    const skills: Skill[] = [
      { id: '1', name: 'Node.js', category: '前端开发', categoryLocked: true, level: 80 },
      { id: '2', name: 'Figma', category: '前端开发', level: 80 }
    ]

    const plan = buildSkillReclassificationPlan(skills, 'zh')

    expect(plan.changes).toEqual([
      {
        skillId: '2',
        skillName: 'Figma',
        previousCategory: '前端开发',
        nextCategory: '设计能力'
      }
    ])
    expect(plan.nextSkills.find((skill) => skill.id === '1')?.category).toBe('前端开发')
    expect(plan.nextSkills.find((skill) => skill.id === '1')?.categoryLocked).toBe(true)
  })
})
