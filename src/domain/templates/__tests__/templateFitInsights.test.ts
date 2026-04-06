/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

import { ResumeData } from '@/types/resume'
import { getTemplateFitInsight } from '@/domain/templates/templateFitInsights'

/**
 * 创建基础简历数据
 * 让模板适配测试只关注内容体量差异，不重复维护完整对象。
 */
function createResumeData(overrides?: Partial<ResumeData>): ResumeData {
  return {
    personalInfo: {
      name: '张三',
      title: '前端工程师',
      email: 'a@b.com',
      phone: '13800000000',
      location: '北京',
      summary: '负责 Web 应用开发与维护。',
      ...(overrides?.personalInfo ?? {})
    },
    experience: overrides?.experience ?? [],
    education: overrides?.education ?? [],
    skills: overrides?.skills ?? [],
    projects: overrides?.projects ?? []
  }
}

describe('templateFitInsights', () => {
  /**
   * 校验轻量内容模板推荐
   * 一页式轻内容应优先建议经典单栏。
   */
  it('会为轻量内容推荐经典单栏模板', () => {
    const insight = getTemplateFitInsight(createResumeData(), 'zh', 'banner-layout')

    expect(insight.recommendedTemplateId).toBe('minimal-text')
    expect(insight.shouldSuggestSwitch).toBe(true)
  })

  /**
   * 校验高密度内容模板推荐
   * 当经历和项目要点较多时，应优先建议紧凑单栏。
   */
  it('会为高密度内容推荐紧凑单栏模板', () => {
    const insight = getTemplateFitInsight(createResumeData({
      personalInfo: {
        name: '张三',
        title: '高级前端工程师',
        email: 'a@b.com',
        phone: '13800000000',
        location: '北京',
        summary: '负责多个企业级平台的架构升级、性能优化、跨团队协作与交付质量提升，长期主导中后台与增长项目。'
      },
      experience: [
        { id: '1', company: 'A', position: '前端', startDate: '2021-01', endDate: '至今', current: true, description: ['1', '2', '3', '4'], location: '北京' },
        { id: '2', company: 'B', position: '前端', startDate: '2019-01', endDate: '2020-12', current: false, description: ['1', '2', '3', '4'], location: '上海' }
      ],
      skills: Array.from({ length: 10 }).map((_, index) => ({
        id: `${index}`,
        name: `技能${index}`,
        level: 80,
        category: '前端'
      })),
      projects: [
        { id: '1', name: '项目A', description: '描述', technologies: ['React', 'TS', 'Node', 'GraphQL'], startDate: '2023-01', endDate: '2023-06', highlights: ['1', '2', '3'] }
      ]
    }), 'zh', 'banner-layout')

    expect(insight.recommendedTemplateId).toBe('compact-layout')
  })

  /**
   * 校验长履历模板推荐
   * 当经历条目明显偏多时，应优先建议时间线模板。
   */
  it('会为长履历推荐时间线模板', () => {
    const insight = getTemplateFitInsight(createResumeData({
      experience: [
        { id: '1', company: 'A', position: '前端', startDate: '2023-01', endDate: '至今', current: true, description: ['1', '2', '3'], location: '北京' },
        { id: '2', company: 'B', position: '前端', startDate: '2021-01', endDate: '2022-12', current: false, description: ['1', '2', '3'], location: '上海' },
        { id: '3', company: 'C', position: '前端', startDate: '2019-01', endDate: '2020-12', current: false, description: ['1', '2', '3'], location: '深圳' },
        { id: '4', company: 'D', position: '前端', startDate: '2017-01', endDate: '2018-12', current: false, description: ['1', '2', '3'], location: '广州' }
      ]
    }), 'zh', 'compact-layout')

    expect(insight.recommendedTemplateId).toBe('timeline-layout-classic')
  })
})
