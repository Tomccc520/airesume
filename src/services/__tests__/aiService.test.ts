/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { AIService } from '@/services/aiService'

describe('AIService.configGuidance', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  /**
   * 验证 AI 配置引导读写
   * 从 AI 面板写入的聚焦字段应能被配置弹窗读取，并且在清理后不再残留。
   */
  it('支持写入、读取并清理配置引导信息', () => {
    const service = new AIService()

    service.setConfigGuidance({
      field: 'customEndpoint',
      title: '先检查自定义端点',
      description: '当前诊断显示自定义接口不可达，请先确认端点地址。',
      provider: 'custom',
      targetHost: 'api.example.com',
      category: 'network',
      createdAt: '2026-04-05T16:50:00.000Z'
    })

    expect(service.readConfigGuidance()).toEqual({
      field: 'customEndpoint',
      title: '先检查自定义端点',
      description: '当前诊断显示自定义接口不可达，请先确认端点地址。',
      provider: 'custom',
      targetHost: 'api.example.com',
      category: 'network',
      createdAt: '2026-04-05T16:50:00.000Z'
    })

    service.clearConfigGuidance()
    expect(service.readConfigGuidance()).toBeNull()
  })
})

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
      needsApiKey: false,
      lastValidation: null
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
      needsApiKey: true,
      lastValidation: null
    })
  })

  /**
   * 验证最近一次验证快照回填
   * 当当前 provider 对应的验证快照存在时，配置状态应能带回最近一次失败原因。
   */
  it('支持在配置状态中读取最近一次验证快照', () => {
    localStorage.setItem('ai-config', JSON.stringify({
      enabled: true,
      provider: 'deepseek',
      apiKey: 'test-key',
      modelName: 'deepseek-chat'
    }))
    localStorage.setItem('ai-config-validation', JSON.stringify({
      isValid: false,
      message: 'DeepSeek 连接失败：无法访问 api.deepseek.com（ECONNRESET）。请检查网络、代理或服务状态。',
      provider: 'deepseek',
      modelName: 'deepseek-chat',
      validatedAt: '2026-04-05T14:00:00.000Z',
      diagnostics: {
        provider: 'deepseek',
        providerLabel: 'DeepSeek',
        targetHost: 'api.deepseek.com',
        category: 'reset'
      }
    }))

    const service = new AIService()
    const status = service.getConfigStatus()

    expect(status.lastValidation?.provider).toBe('deepseek')
    expect(status.lastValidation?.diagnostics?.targetHost).toBe('api.deepseek.com')
  })
})

describe('AIService.validateConfig', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    jest.resetAllMocks()
    global.fetch = originalFetch
  })

  /**
   * 验证服务端诊断透传
   * 当代理路由已经给出具体 provider/host 错误时，前端应原样展示，不再退化成通用失败提示。
   */
  it('支持透传服务端返回的连接诊断信息', async () => {
    const service = new AIService()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({
        error: 'DeepSeek 连接失败：无法访问 api.deepseek.com（ECONNRESET）。请检查网络、代理或服务状态。',
        diagnostics: {
          provider: 'deepseek',
          providerLabel: 'DeepSeek',
          targetHost: 'api.deepseek.com',
          category: 'reset',
          code: 'ECONNRESET',
          detail: 'fetch failed | ECONNRESET',
          suggestion: '建议检查代理、VPN、公司网络策略，或稍后重试。'
        }
      })
    })

    const result = await service.validateConfig({
      enabled: true,
      provider: 'deepseek',
      apiKey: 'test-key',
      modelName: 'deepseek-chat'
    })

    expect(result.isValid).toBe(false)
    expect(result.message).toContain('DeepSeek 连接失败：无法访问 api.deepseek.com')
    expect(result.message).toContain('ECONNRESET')
    expect(result.diagnostics?.targetHost).toBe('api.deepseek.com')
  })

  /**
   * 验证本地验证接口断开提示
   * 当浏览器无法连接站内 `/api/ai` 时，应明确提示是本地验证接口不可达。
   */
  it('支持区分本地验证接口不可达的情况', async () => {
    const service = new AIService()
    ;(global.fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await service.validateConfig({
      enabled: true,
      provider: 'siliconflow',
      apiKey: 'test-key',
      modelName: 'Qwen/Qwen2.5-7B-Instruct'
    })

    expect(result.isValid).toBe(false)
    expect(result.message).toContain('/api/ai')
    expect(result.message).toContain('SiliconFlow')
    expect(result.diagnostics?.targetHost).toBe('/api/ai')
  })
})
