/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import {
  applyImportedResumeData,
  getImportConflictSummary,
  getImportImpactSummary,
  ImportSelection
} from '@/domain/editor/importExport'
import { ResumeData } from '@/types/resume'

/**
 * 创建基础简历数据
 * 为导入测试提供稳定的当前简历状态，减少样板数据重复。
 */
function createBaseResumeData(): ResumeData {
  return {
    personalInfo: {
      name: '张三',
      title: '前端工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '北京',
      website: 'https://example.com',
      contactQRCode: '',
      summary: '熟悉前端开发'
    },
    experience: [
      {
        id: 'exp-1',
        company: '未来科技',
        position: '前端工程师',
        startDate: '2022-01',
        endDate: '至今',
        current: true,
        description: ['负责核心工作台开发']
      }
    ],
    education: [
      {
        id: 'edu-1',
        school: '某大学',
        degree: '本科',
        major: '计算机科学',
        startDate: '2018-09',
        endDate: '2022-06'
      }
    ],
    skills: [
      {
        id: 'skill-1',
        name: 'React',
        level: 80,
        category: '前端框架'
      },
      {
        id: 'skill-2',
        name: 'Node.js',
        level: 70,
        category: '后端开发'
      }
    ],
    projects: [
      {
        id: 'project-1',
        name: 'AI简历系统',
        description: '负责项目主链开发',
        technologies: ['React', 'Next.js'],
        startDate: '2024-01',
        endDate: '2024-12',
        url: 'https://example.com/resume',
        highlights: ['完成简历导出功能']
      }
    ]
  }
}

describe('importExport', () => {
  /**
   * 验证技能合并导入去重
   * 合并模式下同名技能不应重复追加，而应保留更高等级并补充新增技能。
   */
  it('在合并导入时会按技能名称自动去重', () => {
    const currentResumeData = createBaseResumeData()
    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['skills'],
      experienceConflictActions: {},
      projectConflictActions: {},
      experienceMergeFields: {},
      projectMergeFields: {}
    }

    const nextResumeData = applyImportedResumeData(
      currentResumeData,
      {
        skills: [
          { id: 'import-skill-1', name: 'ReactJS', level: 92, category: '前端开发' },
          { id: 'import-skill-2', name: 'Type Script', level: 85, category: '前端开发' }
        ]
      },
      'merge',
      importSelection
    )

    expect(nextResumeData.skills).toHaveLength(3)
    expect(nextResumeData.skills.find((skill) => skill.name === 'React')).toMatchObject({
      level: 92,
      category: '前端框架'
    })
    expect(nextResumeData.skills.find((skill) => skill.name === 'TypeScript')).toMatchObject({
      level: 85,
      category: '前端开发'
    })
  })

  /**
   * 验证导入影响摘要
   * 合并模式下应提示技能自动去重、同名项目冲突和重复岗位提醒。
   */
  it('会生成包含去重和冲突提醒的导入影响摘要', () => {
    const currentResumeData = createBaseResumeData()
    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['experience', 'skills', 'projects'],
      experienceConflictActions: {},
      projectConflictActions: {},
      experienceMergeFields: {},
      projectMergeFields: {}
    }

    const summary = getImportImpactSummary({
      currentResumeData,
      importedResumeData: {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            description: '负责老项目维护'
          }
        ],
        skills: [
          { id: 'import-skill-1', name: 'React.js', level: 88, category: '前端开发' }
        ],
        projects: [
          {
            id: 'import-project-1',
            name: 'AI简历系统',
            description: '导入项目',
            technologies: 'Next.js, TypeScript',
            link: 'https://example.com/new-project'
          }
        ]
      },
      currentCustomSchemeCount: 0,
      importedColorSchemes: [],
      mode: 'merge',
      selection: importSelection
    })

    const skillItem = summary.find((item) => item.key === 'skills')
    const experienceItem = summary.find((item) => item.key === 'experience')
    const projectItem = summary.find((item) => item.key === 'projects')

    expect(skillItem?.description).toContain('自动去重')
    expect(skillItem?.details).toEqual(expect.arrayContaining(['自动去重：React']))

    expect(experienceItem?.description).toContain('合并 1 条重复岗位')
    expect(experienceItem?.details).toEqual(expect.arrayContaining([
      '重复岗位提醒：未来科技 · 前端工程师',
      '合并重复岗位：未来科技 · 前端工程师'
    ]))

    expect(projectItem?.description).toContain('合并 1 个同名项目')
    expect(projectItem?.details).toEqual(expect.arrayContaining([
      '同名项目提醒：AI简历系统',
      '合并同名项目：AI简历系统'
    ]))
  })

  /**
   * 验证重复项字段级差异
   * 冲突摘要应直接给出重复岗位和同名项目的关键变更点，便于导入前判断是否跳过。
   */
  it('会为重复岗位和同名项目生成字段级差异摘要', () => {
    const currentResumeData = createBaseResumeData()
    const summary = getImportConflictSummary(currentResumeData, {
      experience: [
        {
          id: 'import-exp-1',
          company: '未来科技',
          position: '前端工程师',
          startDate: '2021-01',
          endDate: '2021-12',
          location: '上海',
          description: ['负责老项目维护', '推动组件库重构']
        }
      ],
      projects: [
        {
          id: 'import-project-1',
          name: 'AI简历系统',
          description: '导入项目',
          technologies: 'Next.js, TypeScript, Playwright',
          startDate: '2024-01',
          endDate: '2025-01',
          url: 'https://example.com/new-project',
          highlights: ['新增智能导入工作流', '补齐导出回归测试']
        }
      ]
    })

    expect(summary.experience.duplicateEntries[0]?.diffDetails).toEqual(expect.arrayContaining([
      '时间调整：2021-01 - 2021-12',
      '地点变更：上海'
    ]))
    expect(summary.experience.duplicateEntries[0]?.diffDetails.some((detail) => detail.includes('新增职责'))).toBe(true)
    expect(summary.experience.duplicateEntries[0]?.detailSections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: '新增职责明细',
        items: expect.arrayContaining(['负责老项目维护', '推动组件库重构'])
      })
    ]))
    expect(summary.experience.duplicateEntries[0]?.comparisonSections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: '职责内容',
        currentItems: expect.arrayContaining(['负责核心工作台开发']),
        importedItems: expect.arrayContaining(['负责老项目维护', '推动组件库重构'])
      })
    ]))

    expect(summary.projects.duplicateEntries[0]?.diffDetails).toEqual(expect.arrayContaining([
      '时间调整：2024-01 - 2025-01',
      '项目链接已更新'
    ]))
    expect(summary.projects.duplicateEntries[0]?.diffDetails.some((detail) => detail.includes('新增技术栈'))).toBe(true)
    expect(summary.projects.duplicateEntries[0]?.diffDetails.some((detail) => detail.includes('新增亮点'))).toBe(true)
    expect(summary.projects.duplicateEntries[0]?.detailSections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: '新增技术栈明细',
        items: expect.arrayContaining(['TypeScript', 'Playwright'])
      }),
      expect.objectContaining({
        title: '新增亮点明细',
        items: expect.arrayContaining(['新增智能导入工作流', '补齐导出回归测试'])
      })
    ]))
    expect(summary.projects.duplicateEntries[0]?.comparisonSections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: '技术栈',
        currentItems: expect.arrayContaining(['React', 'Next.js']),
        importedItems: expect.arrayContaining(['Next.js', 'TypeScript', 'Playwright'])
      }),
      expect.objectContaining({
        title: '项目亮点',
        currentItems: expect.arrayContaining(['完成简历导出功能']),
        importedItems: expect.arrayContaining(['新增智能导入工作流', '补齐导出回归测试'])
      })
    ]))
  })

  /**
   * 验证重复项跳过
   * 当用户开启跳过重复项时，重复岗位和同名项目不应继续被追加到当前简历。
   */
  it('在合并导入时支持跳过重复岗位和同名项目', () => {
    const currentResumeData = createBaseResumeData()
    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['experience', 'projects'],
      experienceConflictActions: {
        'import-exp-1': 'skip'
      },
      projectConflictActions: {
        'import-project-1': 'skip'
      },
      experienceMergeFields: {},
      projectMergeFields: {}
    }

    const nextResumeData = applyImportedResumeData(
      currentResumeData,
      {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            description: '重复岗位'
          },
          {
            id: 'import-exp-2',
            company: '新公司',
            position: '高级前端工程师',
            startDate: '2023-01',
            endDate: '2024-01',
            description: '新增岗位'
          }
        ],
        projects: [
          {
            id: 'import-project-1',
            name: 'AI简历系统',
            description: '重复项目',
            technologies: 'Next.js'
          },
          {
            id: 'import-project-2',
            name: '招聘系统重构',
            description: '新增项目',
            technologies: 'React, TypeScript'
          }
        ]
      },
      'merge',
      importSelection
    )

    expect(nextResumeData.experience).toHaveLength(2)
    expect(nextResumeData.experience.map((item) => `${item.company}-${item.position}`)).toEqual(
      expect.arrayContaining(['未来科技-前端工程师', '新公司-高级前端工程师'])
    )

    expect(nextResumeData.projects).toHaveLength(2)
    expect(nextResumeData.projects.map((item) => item.name)).toEqual(
      expect.arrayContaining(['AI简历系统', '招聘系统重构'])
    )
  })

  /**
   * 验证逐条跳过重复项
   * 只勾选某一条重复记录时，应仅跳过对应条目，其他重复项仍可继续导入。
   */
  it('在合并导入时支持逐条控制重复岗位导入', () => {
    const currentResumeData = createBaseResumeData()
    currentResumeData.experience.push({
      id: 'exp-2',
      company: '星云科技',
      position: '前端负责人',
      startDate: '2020-01',
      endDate: '2021-12',
      current: false,
      description: ['负责中台团队管理']
    })

    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['experience'],
      experienceConflictActions: {
        'import-exp-1': 'skip',
        'import-exp-2': 'append'
      },
      projectConflictActions: {},
      experienceMergeFields: {},
      projectMergeFields: {}
    }

    const nextResumeData = applyImportedResumeData(
      currentResumeData,
      {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            description: '重复岗位'
          },
          {
            id: 'import-exp-2',
            company: '星云科技',
            position: '前端负责人',
            startDate: '2019-01',
            endDate: '2019-12',
            description: '保留导入的重复岗位'
          },
          {
            id: 'import-exp-3',
            company: '新公司',
            position: '高级前端工程师',
            startDate: '2023-01',
            endDate: '2024-01',
            description: '新增岗位'
          }
        ]
      },
      'merge',
      importSelection
    )

    expect(nextResumeData.experience).toHaveLength(4)
    expect(nextResumeData.experience.filter((item) => item.company === '未来科技')).toHaveLength(1)
    expect(nextResumeData.experience.filter((item) => item.company === '星云科技')).toHaveLength(2)
    expect(nextResumeData.experience.map((item) => `${item.company}-${item.position}`)).toEqual(
      expect.arrayContaining(['新公司-高级前端工程师'])
    )
  })

  /**
   * 验证条目级合并
   * 当重复项选择“合并新增”时，应只吸收新增职责、技术栈和亮点，而不是追加整条重复记录。
   */
  it('在合并导入时支持对重复岗位和同名项目做条目级合并', () => {
    const currentResumeData = createBaseResumeData()
    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['experience', 'projects'],
      experienceConflictActions: {
        'import-exp-1': 'merge'
      },
      projectConflictActions: {
        'import-project-1': 'merge'
      },
      experienceMergeFields: {},
      projectMergeFields: {}
    }

    const nextResumeData = applyImportedResumeData(
      currentResumeData,
      {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            location: '上海',
            description: ['负责老项目维护', '推动组件库重构']
          }
        ],
        projects: [
          {
            id: 'import-project-1',
            name: 'AI简历系统',
            description: '导入项目简介',
            technologies: 'Next.js, TypeScript, Playwright',
            startDate: '2024-01',
            endDate: '2025-01',
            url: 'https://example.com/new-project',
            highlights: ['新增智能导入工作流', '补齐导出回归测试']
          }
        ]
      },
      'merge',
      importSelection
    )

    expect(nextResumeData.experience).toHaveLength(1)
    expect(nextResumeData.experience[0]).toMatchObject({
      company: '未来科技',
      position: '前端工程师',
      location: '上海'
    })
    expect(nextResumeData.experience[0]?.description).toEqual(expect.arrayContaining([
      '负责核心工作台开发',
      '负责老项目维护',
      '推动组件库重构'
    ]))

    expect(nextResumeData.projects).toHaveLength(1)
    expect(nextResumeData.projects[0]?.technologies).toEqual(expect.arrayContaining([
      'React',
      'Next.js',
      'TypeScript',
      'Playwright'
    ]))
    expect(nextResumeData.projects[0]?.highlights).toEqual(expect.arrayContaining([
      '完成简历导出功能',
      '新增智能导入工作流',
      '补齐导出回归测试'
    ]))
    expect(nextResumeData.projects[0]?.url).toBe('https://example.com/resume')
  })

  /**
   * 验证字段级合并控制
   * 当用户关闭某些字段的合并开关时，这些字段不应被导入内容补充到当前简历。
   */
  it('在合并导入时支持按字段控制重复项合并范围', () => {
    const currentResumeData = createBaseResumeData()
    const importSelection: ImportSelection = {
      includeResumeData: true,
      includeStyleConfig: false,
      includeColorSchemes: false,
      resumeSections: ['experience', 'projects'],
      experienceConflictActions: {
        'import-exp-1': 'merge'
      },
      projectConflictActions: {
        'import-project-1': 'merge'
      },
      experienceMergeFields: {
        'import-exp-1': {
          dates: false,
          location: true,
          description: false
        }
      },
      projectMergeFields: {
        'import-project-1': {
          dates: false,
          description: false,
          technologies: true,
          highlights: false,
          url: false
        }
      }
    }

    const nextResumeData = applyImportedResumeData(
      currentResumeData,
      {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            location: '上海',
            description: ['负责老项目维护', '推动组件库重构']
          }
        ],
        projects: [
          {
            id: 'import-project-1',
            name: 'AI简历系统',
            description: '导入项目简介',
            technologies: 'Next.js, TypeScript, Playwright',
            startDate: '2024-01',
            endDate: '2025-01',
            url: 'https://example.com/new-project',
            highlights: ['新增智能导入工作流', '补齐导出回归测试']
          }
        ]
      },
      'merge',
      importSelection
    )

    const summary = getImportImpactSummary({
      currentResumeData,
      importedResumeData: {
        experience: [
          {
            id: 'import-exp-1',
            company: '未来科技',
            position: '前端工程师',
            startDate: '2021-01',
            endDate: '2021-12',
            location: '上海',
            description: ['负责老项目维护', '推动组件库重构']
          }
        ],
        projects: [
          {
            id: 'import-project-1',
            name: 'AI简历系统',
            description: '导入项目简介',
            technologies: 'Next.js, TypeScript, Playwright',
            startDate: '2024-01',
            endDate: '2025-01',
            url: 'https://example.com/new-project',
            highlights: ['新增智能导入工作流', '补齐导出回归测试']
          }
        ]
      },
      currentCustomSchemeCount: 0,
      importedColorSchemes: [],
      mode: 'merge',
      selection: importSelection
    })

    expect(nextResumeData.experience[0]).toMatchObject({
      startDate: '2022-01',
      endDate: '至今',
      location: '上海'
    })
    expect(nextResumeData.experience[0]?.description).toEqual(['负责核心工作台开发'])

    expect(nextResumeData.projects[0]?.description).toBe('负责项目主链开发')
    expect(nextResumeData.projects[0]?.technologies).toEqual(expect.arrayContaining([
      'React',
      'Next.js',
      'TypeScript',
      'Playwright'
    ]))
    expect(nextResumeData.projects[0]?.highlights).toEqual(['完成简历导出功能'])
    expect(nextResumeData.projects[0]?.url).toBe('https://example.com/resume')
    expect(summary.find((item) => item.key === 'experience')?.details).toEqual(expect.arrayContaining([
      '字段合并：未来科技 · 前端工程师（地点）'
    ]))
    expect(summary.find((item) => item.key === 'projects')?.details).toEqual(expect.arrayContaining([
      '字段合并：AI简历系统（技术栈）'
    ]))
  })
})
