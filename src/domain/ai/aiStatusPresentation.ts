/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

import type { AIConfig } from '@/components/AIConfigModal'

interface AIValidationLike {
  isValid: boolean
}

export interface AIConfigStatusLike {
  isConfigured: boolean
  isEnabled: boolean
  provider: AIConfig['provider'] | null
  modelName: string | null
  hasApiKey?: boolean
  needsApiKey?: boolean
  lastValidation?: AIValidationLike | null
}

export type AIWorkbenchStatusKey = 'ready' | 'needsValidation' | 'needsConfig' | 'disabled'
export type AIWorkbenchAction = 'assistant' | 'config'

interface AIWorkbenchToneMeta {
  toneClass: string
  badgeClass: string
}

/**
 * 获取 AI 工作台状态键
 * 将配置摘要统一收敛为 4 种稳定状态，供编辑器多个入口复用。
 */
export function getAIWorkbenchStatusKey(status: AIConfigStatusLike): AIWorkbenchStatusKey {
  const isReady = Boolean(status.isConfigured && status.lastValidation?.isValid)
  const needsValidation = Boolean(status.isConfigured && !status.lastValidation?.isValid)
  const needsConfig = Boolean(status.isEnabled && !status.isConfigured)

  if (isReady) {
    return 'ready'
  }

  if (needsValidation) {
    return 'needsValidation'
  }

  if (needsConfig) {
    return 'needsConfig'
  }

  return 'disabled'
}

/**
 * 获取 AI 状态默认动作
 * 就绪或待验证时优先引导回 AI 助手，其余状态优先打开配置。
 */
export function getAIWorkbenchAction(statusKey: AIWorkbenchStatusKey): AIWorkbenchAction {
  if (statusKey === 'ready' || statusKey === 'needsValidation') {
    return 'assistant'
  }

  return 'config'
}

/**
 * 获取 AI 状态通用徽标文案
 * 统一工具栏、侧栏、弹层和导出入口里的状态标签。
 */
export function getAIWorkbenchBadgeLabel(
  statusKey: AIWorkbenchStatusKey,
  locale: 'zh' | 'en'
): string {
  if (locale === 'en') {
    const labelMap: Record<AIWorkbenchStatusKey, string> = {
      ready: 'AI Ready',
      needsValidation: 'Needs Validation',
      needsConfig: 'Needs Setup',
      disabled: 'AI Disabled'
    }

    return labelMap[statusKey]
  }

  const labelMap: Record<AIWorkbenchStatusKey, string> = {
    ready: 'AI 已可用',
    needsValidation: 'AI 待验证',
    needsConfig: 'AI 待配置',
    disabled: 'AI 已停用'
  }

  return labelMap[statusKey]
}

/**
 * 获取 AI 状态标题
 * 用于较大信息卡或工作台主状态区，统一主要标题文案。
 */
export function getAIWorkbenchTitle(
  statusKey: AIWorkbenchStatusKey,
  locale: 'zh' | 'en'
): string {
  return getAIWorkbenchBadgeLabel(statusKey, locale)
}

/**
 * 获取 AI 状态页脚标签
 * 用于面板底部或配置摘要的短状态说明，保持与主标题同源。
 */
export function getAIWorkbenchFooterLabel(
  statusKey: AIWorkbenchStatusKey,
  locale: 'zh' | 'en'
): string {
  if (locale === 'en') {
    const labelMap: Record<AIWorkbenchStatusKey, string> = {
      ready: 'AI service ready',
      needsValidation: 'AI needs validation',
      needsConfig: 'AI needs setup',
      disabled: 'AI disabled'
    }

    return labelMap[statusKey]
  }

  const labelMap: Record<AIWorkbenchStatusKey, string> = {
    ready: 'AI 服务就绪',
    needsValidation: 'AI 待验证',
    needsConfig: 'AI 待配置',
    disabled: 'AI 已停用'
  }

  return labelMap[statusKey]
}

/**
 * 获取 AI 状态默认动作文案
 * 统一不同工作台入口按钮的基础动作命名，页面层只补充具体语境。
 */
export function getAIWorkbenchActionLabel(
  statusKey: AIWorkbenchStatusKey,
  locale: 'zh' | 'en'
): string {
  if (locale === 'en') {
    const labelMap: Record<AIWorkbenchStatusKey, string> = {
      ready: 'Open AI',
      needsValidation: 'Validate',
      needsConfig: 'Setup',
      disabled: 'Enable AI'
    }

    return labelMap[statusKey]
  }

  const labelMap: Record<AIWorkbenchStatusKey, string> = {
    ready: '打开 AI',
    needsValidation: '去验证',
    needsConfig: '去配置',
    disabled: '启用 AI'
  }

  return labelMap[statusKey]
}

/**
 * 获取 AI 状态配色
 * 将常用的边框、背景和文字色收敛成共享映射，避免多处手写类名漂移。
 */
export function getAIWorkbenchToneMeta(statusKey: AIWorkbenchStatusKey): AIWorkbenchToneMeta {
  const toneMap: Record<AIWorkbenchStatusKey, AIWorkbenchToneMeta> = {
    ready: {
      toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      badgeClass: 'border-emerald-200 bg-white text-emerald-700'
    },
    needsValidation: {
      toneClass: 'border-sky-200 bg-sky-50 text-sky-700',
      badgeClass: 'border-sky-200 bg-white text-sky-700'
    },
    needsConfig: {
      toneClass: 'border-amber-200 bg-amber-50 text-amber-700',
      badgeClass: 'border-amber-200 bg-white text-amber-700'
    },
    disabled: {
      toneClass: 'border-slate-200 bg-slate-100 text-slate-600',
      badgeClass: 'border-slate-200 bg-white text-slate-600'
    }
  }

  return toneMap[statusKey]
}

/**
 * 获取 AI 服务商名称
 * 将 provider 内部值转换成界面友好的展示名称。
 */
export function getAIProviderLabel(
  provider: AIConfigStatusLike['provider'],
  locale: 'zh' | 'en'
): string {
  if (!provider) {
    return locale === 'zh' ? '未选择服务商' : 'No provider'
  }

  const providerLabelMap: Record<NonNullable<AIConfigStatusLike['provider']>, string> = {
    free: locale === 'zh' ? '免费模型' : 'Free Model',
    siliconflow: 'SiliconFlow',
    deepseek: 'DeepSeek',
    custom: locale === 'zh' ? '自定义接口' : 'Custom Endpoint'
  }

  return providerLabelMap[provider]
}

/**
 * 获取 AI 服务商与模型摘要
 * 用于在模板弹层、导出弹层等位置显示紧凑的当前模型信息。
 */
export function getAIProviderSummary(
  status: AIConfigStatusLike,
  locale: 'zh' | 'en'
): string {
  if (!status.modelName) {
    return getAIProviderLabel(status.provider, locale)
  }

  return `${getAIProviderLabel(status.provider, locale)} · ${status.modelName}`
}

/**
 * 获取 AI 模型摘要
 * 压缩模型路径并提供统一兜底文案，避免不同组件重复手写“未选择模型”。
 */
export function getAIModelSummary(
  modelName: string | null,
  locale: 'zh' | 'en',
  fallback?: string
): string {
  if (!modelName) {
    return fallback ?? (locale === 'zh' ? '未选择模型' : 'No model selected')
  }

  const segments = modelName.split('/')
  return segments[segments.length - 1] || modelName
}

/**
 * 获取 AI 验证错误分类标签
 * 将网络与配置验证错误转换成统一的界面短标签。
 */
export function getAIValidationCategoryLabel(
  category: string | undefined,
  locale: 'zh' | 'en'
): string {
  const isZh = locale === 'zh'

  switch (category) {
    case 'timeout':
      return isZh ? '连接超时' : 'Timeout'
    case 'ssl':
      return isZh ? '证书验证失败' : 'SSL Error'
    case 'dns':
      return isZh ? '域名解析失败' : 'DNS Error'
    case 'refused':
      return isZh ? '连接被拒绝' : 'Connection Refused'
    case 'reset':
      return isZh ? '连接被重置' : 'Connection Reset'
    case 'network':
      return isZh ? '网络错误' : 'Network Error'
    default:
      return isZh ? '未知错误' : 'Unknown Error'
  }
}
