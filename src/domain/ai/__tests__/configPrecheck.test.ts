/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import {
  buildAIConfigPrecheck,
  getPrimaryAIConfigPrecheckItem,
  normalizeCustomEndpointInput
} from '@/domain/ai/configPrecheck'

describe('configPrecheck', () => {
  /**
   * 验证密钥空格预检查
   * 当 API Key 前后带有空格或换行时，应给出 warning 和清理动作，而不是直接视为正常。
   */
  it('支持识别 API Key 的空格问题', () => {
    const items = buildAIConfigPrecheck(
      {
        enabled: true,
        provider: 'deepseek',
        apiKey: '  sk-demo-key-with-space  ',
        modelName: 'deepseek-chat'
      },
      {
        locale: 'zh',
        providerName: 'DeepSeek'
      }
    )

    const apiKeyItem = items.find((item) => item.id === 'apiKey')
    expect(apiKeyItem?.status).toBe('warning')
    expect(apiKeyItem?.actionId).toBe('trimApiKey')
    expect(getPrimaryAIConfigPrecheckItem(items)?.id).toBe('apiKey')
  })

  /**
   * 验证自定义端点规范化
   * 当用户把完整 `/chat/completions` 地址填进端点输入时，应能识别并提供规范化动作。
   */
  it('支持识别并规范化自定义端点后缀', () => {
    expect(normalizeCustomEndpointInput('https://api.example.com/v1/chat/completions/')).toBe('https://api.example.com/v1')

    const items = buildAIConfigPrecheck(
      {
        enabled: true,
        provider: 'custom',
        apiKey: 'custom-demo-key-123456',
        customEndpoint: 'https://api.example.com/v1/chat/completions',
        modelName: 'custom-model'
      },
      {
        locale: 'zh',
        providerName: '自定义接口'
      }
    )

    const endpointItem = items.find((item) => item.id === 'endpoint')
    expect(endpointItem?.status).toBe('warning')
    expect(endpointItem?.actionId).toBe('normalizeCustomEndpoint')
  })
})
