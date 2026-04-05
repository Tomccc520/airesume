/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { buildQuickAddSkillPlan, buildSkillCleanupPlan, getCanonicalSkillName } from '@/domain/skills/skillCleanup'
import { Skill } from '@/types/resume'

describe('skillCleanup', () => {
  /**
   * 验证技能名称规范化
   * 常见别名应统一成更适合简历展示的标准名称。
   */
  it('支持将常见别名规范为标准技能名', () => {
    expect(getCanonicalSkillName('ReactJS')).toBe('React')
    expect(getCanonicalSkillName('nodejs')).toBe('Node.js')
    expect(getCanonicalSkillName('Next js')).toBe('Next.js')
    expect(getCanonicalSkillName('未知技能')).toBe('未知技能')
  })

  /**
   * 验证重复技能清理
   * 同义项应被合并，并保留更稳定的等级与分类信息。
   */
  it('支持合并重复技能并保留更优先的分类信息', () => {
    const skills: Skill[] = [
      { id: '1', name: 'ReactJS', category: '前端开发', level: 80 },
      { id: '2', name: 'React.js', category: '设计能力', categoryLocked: true, level: 90 },
      { id: '3', name: 'Nodejs', category: '后端技术', level: 75 }
    ]

    const plan = buildSkillCleanupPlan(skills)

    expect(plan.changes).toEqual([
      {
        type: 'merge',
        skillId: '1',
        skillName: 'ReactJS',
        nextName: 'React',
        removedSkillIds: ['2'],
        removedSkillNames: ['React.js']
      },
      {
        type: 'rename',
        skillId: '3',
        skillName: 'Nodejs',
        nextName: 'Node.js'
      }
    ])

    expect(plan.nextSkills).toHaveLength(2)
    expect(plan.nextSkills[0]).toMatchObject({
      id: '1',
      name: 'React',
      category: '设计能力',
      categoryLocked: true,
      level: 90
    })
    expect(plan.nextSkills[1]).toMatchObject({
      id: '3',
      name: 'Node.js',
      category: '后端技术',
      level: 75
    })
  })

  /**
   * 验证批量输入预判
   * 在批量录入前，应识别新增项、现有合并项和同批输入中的同义项。
   */
  it('支持生成批量添加技能的即时预判结果', () => {
    const skills: Skill[] = [
      { id: '1', name: 'Node.js', category: '后端技术', level: 85 },
      { id: '2', name: 'React', category: '前端框架', level: 90 }
    ]

    const plan = buildQuickAddSkillPlan(skills, 'Nodejs, Type Script, Figma, typescript', 'zh')

    expect(plan.entries).toEqual([
      {
        inputName: 'Nodejs',
        nextName: 'Node.js',
        category: '后端开发',
        status: 'merge-existing',
        mergeTargetName: 'Node.js'
      },
      {
        inputName: 'Type Script',
        nextName: 'TypeScript',
        category: '前端开发',
        status: 'new'
      },
      {
        inputName: 'Figma',
        nextName: 'Figma',
        category: '设计能力',
        status: 'new'
      },
      {
        inputName: 'typescript',
        nextName: 'TypeScript',
        category: '前端开发',
        status: 'merge-input',
        mergeTargetName: 'TypeScript'
      }
    ])

    expect(plan.groups).toEqual([
      {
        category: '前端开发',
        skillNames: ['TypeScript']
      },
      {
        category: '设计能力',
        skillNames: ['Figma']
      }
    ])

    expect(plan.additions).toEqual([
      {
        name: 'TypeScript',
        category: '前端开发'
      },
      {
        name: 'Figma',
        category: '设计能力'
      }
    ])
  })
})
