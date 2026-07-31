/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-01
 */

import {
  getUtf8ByteLength,
  isPrivateOrReservedAddress,
  validateCustomAIEndpoint
} from '@/domain/ai/proxySecurity'

describe('AI 代理安全边界', () => {
  it('允许规范的公网 HTTPS 端点并移除尾部斜杠', () => {
    expect(validateCustomAIEndpoint('https://api.example.com/v1/')).toEqual({
      valid: true,
      endpoint: 'https://api.example.com/v1',
      hostname: 'api.example.com'
    })
  })

  it.each([
    'http://api.example.com/v1',
    'https://user:password@api.example.com/v1',
    'https://localhost:11434/v1',
    'https://127.0.0.1/v1',
    'https://10.0.0.8/v1',
    'https://169.254.169.254/latest'
  ])('生产环境拒绝不安全端点：%s', (endpoint) => {
    expect(validateCustomAIEndpoint(endpoint).valid).toBe(false)
  })

  it('开发环境显式开放时允许本地 HTTP 模型', () => {
    expect(validateCustomAIEndpoint('http://localhost:11434/v1', {
      allowPrivateNetworks: true
    }).valid).toBe(true)
  })

  it('启用域名允许列表后拒绝未登记服务', () => {
    expect(validateCustomAIEndpoint('https://other.example.com/v1', {
      allowedHosts: ['api.example.com']
    }).valid).toBe(false)
  })

  it.each(['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '::1', 'fd00::1'])(
    '识别内网或保留地址：%s',
    (address) => {
      expect(isPrivateOrReservedAddress(address)).toBe(true)
    }
  )

  it('按 UTF-8 字节统计中文请求体', () => {
    expect(getUtf8ByteLength('简历')).toBe(6)
  })
})
