/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

import { getPrimaryEditorFieldGuidance } from '@/domain/editor/editorFieldGuidance'

describe('editorFieldGuidance', () => {
  /**
   * 验证个人信息字段引导
   * 量化结果缺口应优先回到个人简介字段。
   */
  it('会将个人信息量化缺口映射到个人简介字段', () => {
    expect(getPrimaryEditorFieldGuidance('personal', '量化结果', 'zh').fieldKey).toBe('personal-summary')
  })

  /**
   * 验证技能字段引导
   * 核心技能不足时应优先回到批量输入区。
   */
  it('会将核心技能缺口映射到技能批量输入区', () => {
    expect(getPrimaryEditorFieldGuidance('skills', '核心技能', 'zh').fieldKey).toBe('skills-batch-input')
  })
})
