/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-01
 */

export const MAX_AI_PROXY_BODY_BYTES = 512 * 1024

export interface CustomEndpointValidationOptions {
  allowPrivateNetworks?: boolean
  allowedHosts?: string[]
}

export interface CustomEndpointValidationResult {
  valid: boolean
  endpoint?: string
  hostname?: string
  error?: string
}

/**
 * 判断 IPv4 地址是否属于本机、内网或保留网段
 * 防止公开部署的 AI 代理被用于访问云元数据和内部服务。
 */
function isPrivateIPv4Address(address: string): boolean {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false
  }

  const [first, second] = parts
  return first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
}

/**
 * 判断 IPv6 地址是否属于本机、链路本地或唯一本地网段
 * 同时兼容 IPv4 映射形式，避免通过地址写法绕过检查。
 */
function isPrivateIPv6Address(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '')

  if (normalized.startsWith('::ffff:')) {
    return isPrivateIPv4Address(normalized.slice('::ffff:'.length))
  }

  return normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized)
}

/**
 * 判断地址是否不可由公开 AI 代理访问
 * 供 URL 字面量检查和 DNS 解析结果检查共同使用。
 */
export function isPrivateOrReservedAddress(address: string): boolean {
  return address.includes(':')
    ? isPrivateIPv6Address(address)
    : isPrivateIPv4Address(address)
}

/**
 * 判断主机名是否明确指向本机或内部网络
 * 阻止 localhost、局域网域名和常见内部域名后缀。
 */
function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal') ||
    isPrivateOrReservedAddress(normalized)
}

/**
 * 校验自定义 AI 端点
 * 生产环境默认仅允许无凭据的公网 HTTPS 地址，开发环境可显式开放本地模型。
 */
export function validateCustomAIEndpoint(
  endpoint: string | undefined,
  options: CustomEndpointValidationOptions = {}
): CustomEndpointValidationResult {
  const normalizedEndpoint = (endpoint || '')
    .trim()
    .replace(/\/chat\/completions\/?$/i, '')
    .replace(/\/+$/, '')
  if (!normalizedEndpoint) {
    return { valid: false, error: '自定义服务地址不能为空。' }
  }

  if (normalizedEndpoint.length > 2048) {
    return { valid: false, error: '自定义服务地址过长。' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizedEndpoint)
  } catch {
    return { valid: false, error: '自定义服务地址格式无效。' }
  }

  if (parsedUrl.username || parsedUrl.password) {
    return { valid: false, error: '自定义服务地址不能包含用户名或密码。' }
  }

  if (parsedUrl.search || parsedUrl.hash) {
    return { valid: false, error: '自定义服务地址不能包含查询参数或锚点。' }
  }

  const allowPrivateNetworks = options.allowPrivateNetworks === true
  if (parsedUrl.protocol !== 'https:' && !(allowPrivateNetworks && parsedUrl.protocol === 'http:')) {
    return { valid: false, error: '自定义服务地址必须使用 HTTPS；本地开发可显式开放 HTTP。' }
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (!allowPrivateNetworks && isLocalHostname(hostname)) {
    return { valid: false, error: '生产环境不能访问本机、内网或保留网络地址。' }
  }

  const allowedHosts = (options.allowedHosts || []).map((host) => host.trim().toLowerCase()).filter(Boolean)
  if (allowedHosts.length > 0 && !allowedHosts.includes(hostname)) {
    return { valid: false, error: '该自定义服务域名不在允许列表中。' }
  }

  return {
    valid: true,
    endpoint: parsedUrl.toString().replace(/\/+$/, ''),
    hostname
  }
}

/**
 * 计算字符串的 UTF-8 字节长度
 * 避免中文内容按字符数估算时低估实际请求体大小。
 */
export function getUtf8ByteLength(value: string): number {
  let byteLength = 0

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit < 0x80) {
      byteLength += 1
    } else if (codeUnit < 0x800) {
      byteLength += 2
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff && index + 1 < value.length) {
      const nextCodeUnit = value.charCodeAt(index + 1)
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        byteLength += 4
        index += 1
      } else {
        byteLength += 3
      }
    } else {
      byteLength += 3
    }
  }

  return byteLength
}
