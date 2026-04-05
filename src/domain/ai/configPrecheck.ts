/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

export type AIConfigPrecheckActionId =
  | 'enableAI'
  | 'switchToFree'
  | 'clearApiKey'
  | 'trimApiKey'
  | 'restoreCustomEndpoint'
  | 'normalizeCustomEndpoint'
  | 'restoreModel'

export type AIConfigPrecheckStatus = 'ready' | 'warning' | 'error' | 'info'

export const DEFAULT_FREE_AI_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
export const DEFAULT_HOSTED_AI_ENDPOINT = 'https://api.siliconflow.cn/v1'

export interface AIConfigLike {
  provider: 'free' | 'siliconflow' | 'deepseek' | 'custom'
  apiKey: string
  customEndpoint?: string
  modelName: string
  enabled: boolean
}

export interface AIConfigPrecheckItem {
  id: 'enabled' | 'apiKey' | 'endpoint' | 'model'
  title: string
  status: AIConfigPrecheckStatus
  detail: string
  actionId?: AIConfigPrecheckActionId
}

/**
 * 获取当前服务商的推荐模型
 * 为面板内轻量修复动作提供稳定的默认模型，避免依赖组件内硬编码列表。
 */
export function getRecommendedAIModelForProvider(
  provider: AIConfigLike['provider']
): string {
  switch (provider) {
    case 'deepseek':
      return 'deepseek-chat'
    case 'free':
    case 'siliconflow':
    case 'custom':
    default:
      return DEFAULT_FREE_AI_MODEL
  }
}

interface AIConfigPrecheckOptions {
  locale: 'zh' | 'en'
  providerName?: string
  providerModels?: string[]
}

/**
 * 规范化自定义端点输入
 * 统一移除尾部斜杠和误填的 `/chat/completions` 后缀，避免验证请求被拼错。
 */
export function normalizeCustomEndpointInput(endpoint?: string): string {
  return (endpoint || '')
    .trim()
    .replace(/\/chat\/completions\/?$/i, '')
    .replace(/\/+$/, '')
}

/**
 * 获取预检查状态标签
 * 将本地预检查结果映射成统一的状态文案，便于在不同界面中保持一致。
 */
export function getAIConfigPrecheckStatusLabel(
  status: AIConfigPrecheckStatus,
  locale: 'zh' | 'en'
): string {
  const labelMap: Record<AIConfigPrecheckStatus, { zh: string; en: string }> = {
    ready: { zh: '正常', en: 'Ready' },
    warning: { zh: '注意', en: 'Check' },
    error: { zh: '缺失', en: 'Missing' },
    info: { zh: '说明', en: 'Info' }
  }

  return labelMap[status][locale]
}

/**
 * 获取预检查状态样式
 * 统一不同预检查结果在界面中的颜色和边框反馈。
 */
export function getAIConfigPrecheckStatusClass(status: AIConfigPrecheckStatus): string {
  switch (status) {
    case 'ready':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'error':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700'
  }
}

/**
 * 生成 AI 配置本地预检查结果
 * 在真正发起网络验证前，先提示最可能导致失败的本地配置问题。
 */
export function buildAIConfigPrecheck(
  config: AIConfigLike,
  options: AIConfigPrecheckOptions
): AIConfigPrecheckItem[] {
  const { locale, providerModels = [], providerName = locale === 'zh' ? '当前服务商' : 'Current provider' } = options
  const normalizedApiKey = config.apiKey.trim()
  const normalizedCustomEndpoint = normalizeCustomEndpointInput(config.customEndpoint)
  const items: AIConfigPrecheckItem[] = [
    {
      id: 'enabled',
      title: locale === 'zh' ? 'AI 开关' : 'AI toggle',
      status: config.enabled ? 'ready' : 'warning',
      detail: config.enabled
        ? (locale === 'zh' ? '当前已启用，可继续验证和保存。' : 'AI is enabled and ready for validation.')
        : (locale === 'zh' ? '当前处于停用状态，需要先重新启用。' : 'AI is currently disabled. Enable it first.'),
      actionId: config.enabled ? undefined : 'enableAI'
    }
  ]

  if (config.provider === 'free') {
    items.push({
      id: 'apiKey',
      title: locale === 'zh' ? 'API 密钥' : 'API key',
      status: 'info',
      detail: locale === 'zh'
        ? '免费模型由服务端托管，无需在浏览器中填写密钥。'
        : 'Free mode is service-hosted and does not require a browser-side key.'
    })
  } else if (!normalizedApiKey) {
    items.push({
      id: 'apiKey',
      title: locale === 'zh' ? 'API 密钥' : 'API key',
      status: 'error',
      detail: locale === 'zh'
        ? '当前未填写 API 密钥，验证会直接失败。'
        : 'The API key is empty, so validation will fail immediately.',
      actionId: 'clearApiKey'
    })
  } else if (normalizedApiKey !== config.apiKey || /\s/.test(config.apiKey)) {
    items.push({
      id: 'apiKey',
      title: locale === 'zh' ? 'API 密钥' : 'API key',
      status: 'warning',
      detail: locale === 'zh'
        ? '检测到空格或换行，建议先清理后再验证。'
        : 'Whitespace or line breaks were detected. Clean them before validating.',
      actionId: 'trimApiKey'
    })
  } else if (normalizedApiKey.length < 16) {
    items.push({
      id: 'apiKey',
      title: locale === 'zh' ? 'API 密钥' : 'API key',
      status: 'warning',
      detail: locale === 'zh'
        ? '密钥长度偏短，可能是测试值或复制不完整。'
        : 'The key looks unusually short and may be incomplete.'
    })
  } else {
    items.push({
      id: 'apiKey',
      title: locale === 'zh' ? 'API 密钥' : 'API key',
      status: 'ready',
      detail: locale === 'zh'
        ? '已填写，格式看起来正常。'
        : 'The key is present and looks structurally valid.'
    })
  }

  if (config.provider === 'custom') {
    if (!normalizedCustomEndpoint) {
      items.push({
        id: 'endpoint',
        title: locale === 'zh' ? '自定义端点' : 'Custom endpoint',
        status: 'error',
        detail: locale === 'zh'
          ? '当前未填写自定义端点地址。'
          : 'The custom endpoint is empty.',
        actionId: 'restoreCustomEndpoint'
      })
    } else {
      let endpointStatus: AIConfigPrecheckStatus = 'ready'
      let endpointDetail = locale === 'zh'
        ? '地址结构正常，可以继续进行网络验证。'
        : 'The endpoint structure looks valid for network validation.'
      let endpointActionId: AIConfigPrecheckActionId | undefined

      try {
        const endpointUrl = new URL(normalizedCustomEndpoint)
        if (endpointUrl.protocol !== 'https:') {
          endpointStatus = 'warning'
          endpointDetail = locale === 'zh'
            ? '当前端点不是 HTTPS，部分网络环境下可能失败。'
            : 'The endpoint is not HTTPS and may fail in some environments.'
        }

        if (/\/chat\/completions\/?$/i.test((config.customEndpoint || '').trim())) {
          endpointStatus = 'warning'
          endpointDetail = locale === 'zh'
            ? '端点中包含 `/chat/completions` 后缀，系统会自动拼接一次，建议移除。'
            : 'The endpoint already includes `/chat/completions`, which the system appends automatically.'
          endpointActionId = 'normalizeCustomEndpoint'
        }
      } catch {
        endpointStatus = 'error'
        endpointDetail = locale === 'zh'
          ? '当前端点不是合法 URL，建议回退到推荐地址后再改。'
          : 'The endpoint is not a valid URL. Restore a recommended address first.'
        endpointActionId = 'restoreCustomEndpoint'
      }

      items.push({
        id: 'endpoint',
        title: locale === 'zh' ? '自定义端点' : 'Custom endpoint',
        status: endpointStatus,
        detail: endpointDetail,
        actionId: endpointActionId
      })
    }
  } else {
    items.push({
      id: 'endpoint',
      title: locale === 'zh' ? '服务端点' : 'Service endpoint',
      status: 'info',
      detail: locale === 'zh'
        ? `当前使用 ${providerName} 官方或托管端点。`
        : `The ${providerName} official or hosted endpoint will be used.`
    })
  }

  if (!config.modelName.trim()) {
    items.push({
      id: 'model',
      title: locale === 'zh' ? '模型选择' : 'Model selection',
      status: 'error',
      detail: locale === 'zh'
        ? '当前未选择模型，保存前需要先补齐。'
        : 'No model is selected yet.',
      actionId: 'restoreModel'
    })
  } else if (providerModels.length > 0 && !providerModels.some((model) => model === config.modelName)) {
    items.push({
      id: 'model',
      title: locale === 'zh' ? '模型选择' : 'Model selection',
      status: 'warning',
      detail: locale === 'zh'
        ? '当前模型不在服务商推荐列表中，建议确认名称是否填写正确。'
        : 'The current model is not in the provider recommended list.'
    })
  } else {
    items.push({
      id: 'model',
      title: locale === 'zh' ? '模型选择' : 'Model selection',
      status: 'ready',
      detail: locale === 'zh'
        ? '已选择模型，可以直接验证当前配置。'
        : 'A model is selected and ready for validation.'
    })
  }

  return items
}

/**
 * 获取当前最值得先处理的预检查项
 * 优先返回 error，其次返回 warning，用于在面板顶部快速告诉用户“当前卡在哪一项”。
 */
export function getPrimaryAIConfigPrecheckItem(
  items: AIConfigPrecheckItem[]
): AIConfigPrecheckItem | null {
  return items.find((item) => item.status === 'error')
    || items.find((item) => item.status === 'warning')
    || null
}
