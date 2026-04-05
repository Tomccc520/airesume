/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { AIService } from '@/services/aiService'

describe('AIService.getConfigStatus', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  /**
   * 验证免费模型状态
   * 免费模型启用后，即使没有前端 API Key，也应被视为已配置。
   */
  it('支持将免费模型识别为已配置状态', () => {
    const service = new AIService()

    service.updateConfig({
      enabled: true,
      provider: 'free',
      apiKey: '',
      modelName: 'Qwen/Qwen2.5-7B-Instruct'
    })

    expect(service.getConfigStatus()).toEqual({
      isConfigured: true,
      isEnabled: true,
      provider: 'free',
      modelName: 'Qwen/Qwen2.5-7B-Instruct',
      hasApiKey: true,
      needsApiKey: false
    })
  })

  /**
   * 验证付费模型缺少密钥时的状态
   * 启用但缺少 API Key 的配置，应进入“待配置”而不是“已就绪”。
   */
  it('支持识别缺少 API Key 的待配置状态', () => {
    localStorage.setItem('ai-config', JSON.stringify({
      enabled: true,
      provider: 'deepseek',
      apiKey: '',
      modelName: 'deepseek-chat'
    }))

    const service = new AIService()

    expect(service.getConfigStatus()).toEqual({
      isConfigured: false,
      isEnabled: true,
      provider: 'deepseek',
      modelName: 'deepseek-chat',
      hasApiKey: false,
      needsApiKey: true
    })
  })
})
