/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

import { getOptimizeSectionInsight } from '@/domain/editor/optimizeSectionInsights'
import { ResumeData } from '@/types/resume'

/**
 * 创建测试简历数据
 * 为 AI 模块洞察测试提供稳定基线。
 */
function createResumeData(): ResumeData {
  return {
    personalInfo: {
      name: '张三',
      title: '前端工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '杭州',
      summary: '负责前端开发和项目推进。'
    },
    experience: [
      {
        id: 'exp-1',
        company: '未来科技',
        position: '前端工程师',
        startDate: '2023-01',
        endDate: '至今',
        current: true,
        description: ['负责工作台重构', '交付多业务模块'],
        location: '杭州'
      }
    ],
    education: [],
    skills: [
      { id: 'skill-1', name: 'React', level: 88, category: '前端开发' },
      { id: 'skill-2', name: 'TypeScript', level: 82, category: '前端开发' },
      { id: 'skill-3', name: 'Next.js', level: 78, category: '前端开发' },
      { id: 'skill-4', name: 'Playwright', level: 65, category: '前端开发' }
    ],
    projects: [
      {
        id: 'project-1',
        name: 'AI 简历系统',
        description: '负责编辑器与模板链路升级',
        technologies: ['React', 'Next.js'],
        startDate: '2025-01',
        endDate: '2025-12',
        url: '',
        highlights: ['上线模板优化']
      }
    ]
  }
}

describe('optimizeSectionInsights', () => {
  /**
   * 验证简介洞察
   * 无量化结果的简介应提示先补量化表达。
   */
  it('会为缺少量化结果的简介给出先编辑提示', () => {
    const insight = getOptimizeSectionInsight('summary', createResumeData(), 'zh')

    expect(insight.shouldEditFirst).toBe(true)
    expect(insight.primaryGapLabel).toBe('量化结果')
    expect(insight.editorActionLabel).toBe('去补量化结果')
    expect(insight.checklist.find((item) => item.key === 'metrics')?.completed).toBe(false)
  })

  /**
   * 验证技能洞察
   * 技能分类过于单一时应提示先整理分类结构。
   */
  it('会为分类单一的技能模块提示先整理技能分类', () => {
    const insight = getOptimizeSectionInsight('skills', createResumeData(), 'zh')

    expect(insight.shouldEditFirst).toBe(true)
    expect(insight.primaryGapLabel).toBe('技能分类')
    expect(insight.signalBadges.find((badge) => badge.key === 'categories')?.value).toBe('1')
  })

  /**
   * 验证项目洞察
   * 无量化结果的项目模块应提示先补结果表达。
   */
  it('会为项目模块提示先补量化结果', () => {
    const insight = getOptimizeSectionInsight('projects', createResumeData(), 'zh')

    expect(insight.shouldEditFirst).toBe(true)
    expect(insight.primaryGapLabel).toBe('量化结果')
    expect(insight.checklist.find((item) => item.key === 'entries')?.completed).toBe(true)
  })
})
