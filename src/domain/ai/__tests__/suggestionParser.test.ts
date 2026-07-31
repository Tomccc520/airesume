/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-01
 */

import { parseAISuggestions } from '@/domain/ai/suggestionParser'

describe('parseAISuggestions', () => {
  /**
   * 验证常规编号候选解析
   * 保留候选正文并移除编号标记。
   */
  it('解析编号候选并保持正文完整', () => {
    const result = parseAISuggestions([
      '以下是优化版本：',
      '1. 负责核心平台架构升级，使首屏加载时间降低 42%。',
      '2. 主导组件库建设，推动 6 个业务团队统一交付规范。'
    ].join('\n'))

    expect(result).toEqual([
      '负责核心平台架构升级，使首屏加载时间降低 42%。',
      '主导组件库建设，推动 6 个业务团队统一交付规范。'
    ])
  })

  /**
   * 验证异常角色和提示词残片过滤
   * 模型回显的 user 消息与生成指令不能进入可应用候选。
   */
  it('过滤角色回显与原始生成指令', () => {
    const result = parseAISuggestions([
      '1. 5 年前端经验，主导性能治理并将核心页面加载耗时降低 40%。',
      '2. user pérdida de "user 当前内容：张三，前端工程师',
      '3. 请生成4种风格的优化版本。'
    ].join('\n'))

    expect(result).toEqual([
      '5 年前端经验，主导性能治理并将核心页面加载耗时降低 40%。'
    ])
  })

  /**
   * 验证重复与原文回显过滤
   * 同一建议只保留一次，完全未改写的原文不作为候选展示。
   */
  it('过滤重复候选和未改写原文', () => {
    const originalContent = '负责产品需求分析和项目推进。'
    const result = parseAISuggestions([
      `1. ${originalContent}`,
      '2. 主导需求拆解与跨团队推进，将版本准时交付率提升至 96%。',
      '3. 主导需求拆解与跨团队推进，将版本准时交付率提升至 96%。'
    ].join('\n'), { originalContent })

    expect(result).toEqual([
      '主导需求拆解与跨团队推进，将版本准时交付率提升至 96%。'
    ])
  })

  /**
   * 验证无有效结果时安全返回
   * 只有提示词回显的响应不能回退成可写入简历的正文。
   */
  it('仅包含提示词回显时返回空数组', () => {
    expect(parseAISuggestions('user 当前内容：测试\n请生成4种风格的优化版本。')).toEqual([])
  })
})
