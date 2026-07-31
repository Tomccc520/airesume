/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

/**
 * AI API 代理路由
 * 解决前端直接调用第三方AI API时的CORS跨域问题
 */

import { NextRequest, NextResponse } from 'next/server'
import { lookup } from 'node:dns/promises'
import { HOSTED_FREE_AI_MODELS } from '@/domain/ai/configPrecheck'
import {
  getUtf8ByteLength,
  isPrivateOrReservedAddress,
  MAX_AI_PROXY_BODY_BYTES,
  validateCustomAIEndpoint
} from '@/domain/ai/proxySecurity'

type AIProvider = 'openai' | 'claude' | 'free' | 'siliconflow' | 'deepseek' | 'custom'
type ProxyFetchErrorCategory = 'timeout' | 'ssl' | 'dns' | 'refused' | 'reset' | 'network' | 'unknown'

interface AIProxyRequestBody {
  provider: AIProvider
  apiKey?: string
  model: string
  messages: unknown[]
  stream?: boolean
  customEndpoint?: string
  temperature?: number
  max_tokens?: number
}

interface FreeRateLimitEntry {
  count: number
  resetAt: number
}

const FREE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const FREE_RATE_LIMIT_MAX_REQUESTS = 20
const globalRateLimitStore = globalThis as typeof globalThis & {
  __uiedResumeFreeAIRateLimits?: Map<string, FreeRateLimitEntry>
}
const freeRateLimitStore = globalRateLimitStore.__uiedResumeFreeAIRateLimits || new Map<string, FreeRateLimitEntry>()
globalRateLimitStore.__uiedResumeFreeAIRateLimits = freeRateLimitStore

/**
 * 解析并限制 AI 代理请求体
 * 同时检查声明大小和真实 UTF-8 大小，避免超大简历内容占用服务端资源。
 */
async function parseAIProxyRequest(request: NextRequest): Promise<
  { body: AIProxyRequestBody; error?: never } | { body?: never; error: NextResponse }
> {
  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_AI_PROXY_BODY_BYTES) {
    return {
      error: NextResponse.json({ error: 'AI 请求内容过大，请缩短输入后重试。' }, { status: 413 })
    }
  }

  const rawBody = await request.text()
  if (getUtf8ByteLength(rawBody) > MAX_AI_PROXY_BODY_BYTES) {
    return {
      error: NextResponse.json({ error: 'AI 请求内容过大，请缩短输入后重试。' }, { status: 413 })
    }
  }

  try {
    return { body: JSON.parse(rawBody) as AIProxyRequestBody }
  } catch {
    return {
      error: NextResponse.json({ error: 'AI 请求不是有效的 JSON 数据。' }, { status: 400 })
    }
  }
}

/**
 * 获取限流使用的客户端标识
 * 优先读取常见反向代理注入的真实 IP，请求头缺失时回退到统一匿名标识。
 */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwardedFor ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'anonymous'
}

/**
 * 消耗一次免费服务额度
 * 仅保护使用服务端共享密钥的请求，自带密钥的用户不占用该额度。
 */
function consumeFreeAIRateLimit(clientId: string, now = Date.now()): {
  allowed: boolean
  retryAfterSeconds: number
} {
  freeRateLimitStore.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      freeRateLimitStore.delete(key)
    }
  })

  const current = freeRateLimitStore.get(clientId)
  if (!current) {
    freeRateLimitStore.set(clientId, { count: 1, resetAt: now + FREE_RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (current.count >= FREE_RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    }
  }

  current.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/**
 * 获取生产环境允许的自定义 AI 域名
 * 未配置时依然允许公网 HTTPS 服务，但始终阻止本机和内网地址。
 */
function getCustomEndpointAllowedHosts(): string[] {
  return (process.env.AI_CUSTOM_ENDPOINT_ALLOWLIST || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * 校验自定义端点的 DNS 解析结果
 * 防止公网域名解析到内网地址后绕过 URL 字面量检查。
 */
async function validateResolvedCustomEndpoint(hostname: string, allowPrivateNetworks: boolean): Promise<string | null> {
  if (allowPrivateNetworks) {
    return null
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true })
    if (addresses.length === 0) {
      return '自定义服务域名没有可用的解析地址。'
    }

    if (addresses.some(({ address }) => isPrivateOrReservedAddress(address))) {
      return '自定义服务域名解析到了本机、内网或保留网络地址。'
    }
  } catch {
    return '无法解析自定义服务域名，请检查地址是否正确。'
  }

  return null
}

/**
 * 获取服务端免费模式允许调用的模型
 * 部署方可通过环境变量覆盖，避免共享密钥被用于未授权的高成本模型。
 */
function getHostedFreeModelAllowlist(): Set<string> {
  const configuredModels = (process.env.AI_FREE_MODEL_ALLOWLIST || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)

  return new Set(configuredModels.length > 0 ? configuredModels : HOSTED_FREE_AI_MODELS)
}

/**
 * 获取服务商展示名称
 * 用于在代理报错时返回更容易理解的连接目标说明。
 */
function getProviderLabel(provider: AIProvider): string {
  switch (provider) {
    case 'free':
      return '免费模型'
    case 'siliconflow':
      return 'SiliconFlow'
    case 'deepseek':
      return 'DeepSeek'
    case 'openai':
      return 'OpenAI'
    case 'claude':
      return 'Claude'
    case 'custom':
      return '自定义接口'
    default:
      return 'AI服务'
  }
}

/**
 * 获取请求目标主机名
 * 统一从完整 URL 中提取 host，便于在错误提示中直接说明连接目标。
 */
function getTargetHost(apiUrl: string): string {
  try {
    return new URL(apiUrl).host
  } catch {
    return apiUrl
  }
}

/**
 * 提取底层请求错误详情
 * Node fetch 常见会把真实错误挂在 cause 上，这里统一展开 message 和 code 方便分类。
 */
function extractFetchErrorDetails(error: unknown): { code?: string; detail: string } {
  const messages = new Set<string>()
  let code: string | undefined
  let current: unknown = error
  let depth = 0

  while (current && typeof current === 'object' && depth < 5) {
    const currentError = current as { message?: unknown; code?: unknown; cause?: unknown }
    if (typeof currentError.message === 'string' && currentError.message.trim()) {
      messages.add(currentError.message.trim())
    }
    if (!code && typeof currentError.code === 'string' && currentError.code.trim()) {
      code = currentError.code.trim()
    }
    if (!currentError.cause || currentError.cause === current) {
      break
    }
    current = currentError.cause
    depth += 1
  }

  return {
    code,
    detail: Array.from(messages).join(' | ')
  }
}

/**
 * 分类代理请求失败原因
 * 将底层网络错误归一为更明确的超时、DNS、证书或连接类问题。
 */
function classifyProxyFetchError(error: unknown): { category: ProxyFetchErrorCategory; code?: string; detail: string } {
  const { code, detail } = extractFetchErrorDetails(error)
  const normalizedDetail = detail.toLowerCase()
  const normalizedCode = (code || '').toUpperCase()

  if ((error instanceof Error && error.name === 'AbortError') || normalizedCode === 'ETIMEDOUT' || normalizedDetail.includes('timeout')) {
    return { category: 'timeout', code, detail }
  }

  if (
    normalizedDetail.includes('unable_to_get_issuer_cert_locally') ||
    normalizedDetail.includes('self signed certificate') ||
    normalizedDetail.includes('certificate') ||
    normalizedCode.includes('CERT')
  ) {
    return { category: 'ssl', code, detail }
  }

  if (normalizedCode === 'ENOTFOUND' || normalizedCode === 'EAI_AGAIN' || normalizedDetail.includes('enotfound')) {
    return { category: 'dns', code, detail }
  }

  if (normalizedCode === 'ECONNREFUSED' || normalizedDetail.includes('econnrefused')) {
    return { category: 'refused', code, detail }
  }

  if (normalizedCode === 'ECONNRESET' || normalizedDetail.includes('econnreset')) {
    return { category: 'reset', code, detail }
  }

  if (normalizedDetail.includes('fetch failed') || normalizedDetail.includes('network')) {
    return { category: 'network', code, detail }
  }

  return { category: 'unknown', code, detail }
}

/**
 * 构建代理请求失败提示
 * 在配置验证时直接返回“服务商 + 目标 host + 错误类别 + 处理建议”。
 */
function buildProxyFetchErrorResponse(provider: AIProvider, apiUrl: string, error: unknown): {
  error: string
  status: number
  diagnostics: {
    provider: AIProvider
    providerLabel: string
    targetHost: string
    category: ProxyFetchErrorCategory
    code?: string
    detail: string
    suggestion: string
  }
} {
  const providerLabel = getProviderLabel(provider)
  const targetHost = getTargetHost(apiUrl)
  const { category, code, detail } = classifyProxyFetchError(error)
  const codeSuffix = code ? `（${code}）` : ''

  if (category === 'timeout') {
    return {
      error: `${providerLabel} 连接超时：请求 ${targetHost} 超过 60 秒未返回，请稍后重试或更换网络环境。`,
      status: 504,
      diagnostics: {
        provider,
        providerLabel,
        targetHost,
        category,
        code,
        detail,
        suggestion: '建议稍后重试，或切换网络/VPN 后再次验证。'
      }
    }
  }

  if (category === 'ssl') {
    return {
      error: `${providerLabel} 证书验证失败：无法安全连接到 ${targetHost}${codeSuffix}，请检查系统证书、代理或网络环境。`,
      status: 502,
      diagnostics: {
        provider,
        providerLabel,
        targetHost,
        category,
        code,
        detail,
        suggestion: '建议检查系统时间、代理证书、公司网络中间人证书或切换到无代理网络。'
      }
    }
  }

  if (category === 'dns') {
    return {
      error: `${providerLabel} 域名解析失败：无法解析 ${targetHost}${codeSuffix}，请检查 DNS、代理或自定义端点配置。`,
      status: 502,
      diagnostics: {
        provider,
        providerLabel,
        targetHost,
        category,
        code,
        detail,
        suggestion: '建议检查 DNS、VPN、代理设置，以及自定义端点域名是否填写正确。'
      }
    }
  }

  if (category === 'refused') {
    return {
      error: `${providerLabel} 连接被拒绝：${targetHost}${codeSuffix} 未接受连接，请检查端点地址或服务状态。`,
      status: 502,
      diagnostics: {
        provider,
        providerLabel,
        targetHost,
        category,
        code,
        detail,
        suggestion: '建议检查目标服务是否已启动，或自定义端点是否填写到了基础地址而不是错误端口。'
      }
    }
  }

  if (category === 'reset') {
    return {
      error: `${providerLabel} 连接被重置：与 ${targetHost} 的连接中断${codeSuffix}，请检查代理、VPN 或稍后重试。`,
      status: 502,
      diagnostics: {
        provider,
        providerLabel,
        targetHost,
        category,
        code,
        detail,
        suggestion: '建议检查代理、VPN、公司网络策略，或稍后重试。'
      }
    }
  }

  return {
    error: `${providerLabel} 连接失败：无法访问 ${targetHost}${codeSuffix}。请检查网络、代理或服务状态。底层错误：${detail || '未知错误'}`,
    status: 502,
    diagnostics: {
      provider,
      providerLabel,
      targetHost,
      category,
      code,
      detail,
      suggestion: '建议确认网络可访问该服务商域名，并检查代理、自定义端点和服务状态。'
    }
  }
}

export async function POST(request: NextRequest) {
  let providerForError: AIProvider = 'custom'
  let apiUrlForError = 'unknown'

  try {
    const parsedRequest = await parseAIProxyRequest(request)
    if (parsedRequest.error) {
      return parsedRequest.error
    }

    const { provider, apiKey, model, messages, stream = false, ...otherParams } = parsedRequest.body
    providerForError = provider

    if (!provider || !model || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 对于免费模型，不需要验证apiKey
    if (provider !== 'free' && !apiKey) {
      return NextResponse.json(
        { error: '缺少API密钥' },
        { status: 400 }
      )
    }

    const usesHostedFreeKey = provider === 'free' && !apiKey?.trim()
    if (usesHostedFreeKey) {
      if (!getHostedFreeModelAllowlist().has(model)) {
        return NextResponse.json(
          { error: '当前免费模式不允许使用该模型，请从免费模型列表中重新选择。' },
          { status: 400 }
        )
      }
    }

    let apiUrl = ''
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    let requestBody: Record<string, unknown> = {}

    // 根据不同的AI提供商配置请求
    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'claude':
        apiUrl = 'https://api.anthropic.com/v1/messages'
        headers['x-api-key'] = apiKey || ''
        headers['anthropic-version'] = '2023-06-01'
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'free':
      case 'siliconflow':
        apiUrl = 'https://api.siliconflow.cn/v1/chat/completions'
        // 免费模式优先使用传入密钥，其次使用服务端环境变量
        if (provider === 'free') {
          const freeApiKey = (apiKey || process.env.SILICONFLOW_API_KEY || '').trim()
          if (!freeApiKey) {
            return NextResponse.json(
              { error: '免费模型未配置服务端密钥，请设置 SILICONFLOW_API_KEY 或切换到自定义密钥模式。' },
              { status: 400 }
            )
          }

          if (!apiKey?.trim()) {
            const rateLimit = consumeFreeAIRateLimit(getClientIdentifier(request))
            if (!rateLimit.allowed) {
              return NextResponse.json(
                { error: '免费 AI 调用过于频繁，请稍后再试或配置自己的 API 密钥。' },
                {
                  status: 429,
                  headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
                }
              )
            }
          }

          headers['Authorization'] = `Bearer ${freeApiKey}`
        } else {
          headers['Authorization'] = `Bearer ${apiKey || ''}`
        }
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'deepseek':
        apiUrl = 'https://api.deepseek.com/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey || ''}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'custom':
        {
          const allowPrivateNetworks = process.env.NODE_ENV !== 'production' || process.env.ALLOW_PRIVATE_AI_ENDPOINTS === 'true'
          const endpointValidation = validateCustomAIEndpoint(otherParams.customEndpoint, {
            allowPrivateNetworks,
            allowedHosts: getCustomEndpointAllowedHosts()
          })

          if (!endpointValidation.valid || !endpointValidation.endpoint || !endpointValidation.hostname) {
            return NextResponse.json(
              { error: endpointValidation.error || '自定义服务地址未通过安全检查。' },
              { status: 400 }
            )
          }

          const resolutionError = await validateResolvedCustomEndpoint(endpointValidation.hostname, allowPrivateNetworks)
          if (resolutionError) {
            return NextResponse.json({ error: resolutionError }, { status: 400 })
          }

          apiUrl = `${endpointValidation.endpoint}/chat/completions`
        }
        headers['Authorization'] = `Bearer ${apiKey || ''}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      default:
        return NextResponse.json(
          { error: '不支持的AI提供商' },
          { status: 400 }
        )
    }
    apiUrlForError = apiUrl

    // 发送请求到AI API
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), 60000)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: timeoutController.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AI API错误 (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `AI API调用失败: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // 如果是流式请求，直接返回流
    if (stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        },
      })
    }

    // 非流式请求的处理
    const data = await response.json()

    // 统一响应格式
    let content = ''
    if (provider === 'claude') {
      content = data.content?.[0]?.text || ''
    } else {
      content = data.choices?.[0]?.message?.content || ''
    }

    return NextResponse.json({
      success: true,
      content,
      usage: data.usage || null
    })

  } catch (error) {
    console.error('AI API代理错误:', error)
    const fallbackResponse = buildProxyFetchErrorResponse(providerForError, apiUrlForError, error)

    return NextResponse.json(
      {
        error: fallbackResponse.error,
        diagnostics: fallbackResponse.diagnostics
      },
      { status: fallbackResponse.status }
    )
  }
}
