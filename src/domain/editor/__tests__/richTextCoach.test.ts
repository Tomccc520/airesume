/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

import {
  analyzeWritingSignals,
  applyWritingQuickAction,
  evaluateContentQuality,
  inferRecommendedLength,
  resolveLengthState,
  resolveWritingQuickActions
} from '@/domain/editor/richTextCoach'

describe('richTextCoach', () => {
  /**
   * 验证推荐长度推断
   * 简介类字段应自动拿到更适合自我介绍的默认区间。
   */
  it('会为简介字段推断更长的推荐字数区间', () => {
    expect(inferRecommendedLength('个人简介', '请输入你的介绍')).toEqual({ min: 80, max: 240 })
  })

  /**
   * 验证写作信号统计
   * 应能识别量化结果、要点数与句子数。
   */
  it('会正确分析量化结果与要点结构', () => {
    const signals = analyzeWritingSignals('• 完成组件库重构，交付 32 个组件。\n• 页面性能提升 18%。')

    expect(signals.metricCount).toBe(2)
    expect(signals.bulletCount).toBe(2)
    expect(signals.lineCount).toBe(2)
    expect(signals.sentenceCount).toBe(2)
  })

  /**
   * 验证快捷动作推荐
   * 长段且无量化结果的内容应优先推荐拆点和补充结果。
   */
  it('会为长段无量化结果内容生成高优先级快捷动作', () => {
    const text = '负责后台系统改造和前端工作台优化，推动设计、研发和测试协作闭环，保证项目按时上线并持续迭代。'
    const actions = resolveWritingQuickActions(text, 'zh', resolveLengthState(text.length, { min: 60, max: 240 }))

    expect(actions.map((item) => item.key)).toEqual(
      expect.arrayContaining(['splitBullets', 'addMetric'])
    )
  })

  /**
   * 验证拆点动作
   * 一整段内容执行后应变成可读性更高的多条要点。
   */
  it('会将长段描述拆成多条要点', () => {
    const next = applyWritingQuickAction(
      '负责平台架构升级。推动组件复用与流程标准化。提升了团队协作效率。',
      'splitBullets',
      'zh'
    )

    expect(next).toBe(
      ['• 负责平台架构升级。', '• 推动组件复用与流程标准化。', '• 提升了团队协作效率。'].join('\n')
    )
  })

  /**
   * 验证质量检查
   * 偏短且没有量化结果的内容应拿到对应建议。
   */
  it('会为偏短且无量化结果内容给出质量建议', () => {
    const result = evaluateContentQuality('负责核心功能开发和项目推进。', 'short', 'zh')

    expect(result.score).toBeLessThan(100)
    expect(result.suggestions.join(' ')).toContain('量化结果')
    expect(result.suggestions.join(' ')).toContain('内容偏短')
  })
})
