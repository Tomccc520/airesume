/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * AI服务模块
 * 提供真实的AI API调用功能
 */

import { AIConfig } from '@/components/AIConfigModal'

const AI_CONFIG_STORAGE_KEY = 'ai-config'
const AI_CONFIG_VALIDATION_STORAGE_KEY = 'ai-config-validation'
const AI_CONFIG_GUIDANCE_STORAGE_KEY = 'ai-config-guidance'
export const AI_CONFIG_STATUS_EVENT = 'ai-config-status-updated'
export const AI_CONFIG_GUIDANCE_EVENT = 'ai-config-guidance-updated'

/**
 * AI 生成错误类型
 */
export type AIErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'CONFIG_ERROR'
  | 'TIMEOUT_ERROR'
  | 'FORMAT_ERROR'
  | 'CANCELLED'
  | 'UNKNOWN_ERROR'

export interface AIConfigStatus {
  isConfigured: boolean
  isEnabled: boolean
  provider: AIConfig['provider'] | null
  modelName: string | null
  hasApiKey: boolean
  needsApiKey: boolean
  lastValidation: AIValidationSnapshot | null
}

export interface AIValidationDiagnostics {
  provider?: AIConfig['provider'] | string
  providerLabel?: string
  targetHost?: string
  category?: string
  code?: string
  detail?: string
  suggestion?: string
}

interface AIValidationResponsePayload {
  success?: boolean
  error?: string
  diagnostics?: AIValidationDiagnostics
}

export interface AIValidationResult {
  isValid: boolean
  message: string
  diagnostics?: AIValidationDiagnostics
}

export interface AIValidationSnapshot {
  isValid: boolean
  message: string
  provider: AIConfig['provider']
  modelName: string
  customEndpoint?: string
  validatedAt: string
  diagnostics?: AIValidationDiagnostics
}

export type AIConfigGuidanceField = 'provider' | 'apiKey' | 'customEndpoint' | 'modelName'

export interface AIConfigGuidance {
  field: AIConfigGuidanceField
  title: string
  description: string
  provider?: AIConfig['provider'] | string
  targetHost?: string
  category?: string
  createdAt: string
}

/**
 * 获取服务商展示名称
 * 当前端本地请求 `/api/ai` 失败时，仍然可以在错误提示里指出是哪类服务商配置。
 */
function getAIProviderLabel(provider: AIConfig['provider']): string {
  switch (provider) {
    case 'free':
      return '免费模型'
    case 'siliconflow':
      return 'SiliconFlow'
    case 'deepseek':
      return 'DeepSeek'
    case 'custom':
      return '自定义接口'
    default:
      return 'AI服务'
  }
}

/**
 * 构建本地验证接口失败提示
 * 当浏览器连 `/api/ai` 都失败时，明确指出是本地开发服务或站点连接异常。
 */
function buildLocalValidationErrorMessage(config: AIConfig, error: unknown): string {
  const providerLabel = getAIProviderLabel(config.provider)
  const detail = error instanceof Error ? error.message : '未知错误'

  if (detail.toLowerCase().includes('failed to fetch')) {
    return `无法连接到站内 AI 验证接口 /api/ai，${providerLabel} 配置尚未提交验证。请确认本地站点可访问后重试。`
  }

  return `无法连接到站内 AI 验证接口 /api/ai。${providerLabel} 验证被中断，底层错误：${detail}`
}

/**
 * 构建本地验证接口失败诊断
 * 当浏览器连 `/api/ai` 都失败时，补充目标接口、错误类别和建议动作。
 */
function buildLocalValidationDiagnostics(config: AIConfig, error: unknown): AIValidationDiagnostics {
  const detail = error instanceof Error ? error.message : '未知错误'
  const normalizedDetail = detail.toLowerCase()
  const isFetchFailure = normalizedDetail.includes('failed to fetch')
  const isTimeout = normalizedDetail.includes('timeout')

  return {
    provider: config.provider,
    providerLabel: getAIProviderLabel(config.provider),
    targetHost: '/api/ai',
    category: isTimeout ? 'timeout' : isFetchFailure ? 'network' : 'unknown',
    detail,
    suggestion: isTimeout
      ? '请确认本地站点与代理服务正常运行后重试。'
      : '请确认当前站点可正常访问，并检查浏览器网络拦截、代理或本地开发服务状态。'
  }
}

/**
 * 规范化验证接口返回的错误文案
 * 优先展示服务端已分类的 provider、目标 host 和底层诊断信息。
 */
function normalizeValidationErrorMessage(
  payload: AIValidationResponsePayload | null | undefined,
  responseStatus?: number
): string {
  if (payload?.error) {
    const diagnosticSuffix = payload.diagnostics?.code
      ? `（错误码：${payload.diagnostics.code}）`
      : ''
    return `${payload.error}${diagnosticSuffix}`
  }

  if (typeof responseStatus === 'number') {
    return `验证失败：请求返回 ${responseStatus}`
  }

  return '验证失败'
}

/**
 * 规范化验证接口返回结果
 * 将服务端返回的错误文案和诊断结构统一整理成前端可直接消费的结果。
 */
function buildValidationFailureResult(
  payload: AIValidationResponsePayload | null | undefined,
  responseStatus?: number
): AIValidationResult {
  return {
    isValid: false,
    message: normalizeValidationErrorMessage(payload, responseStatus),
    diagnostics: payload?.diagnostics
  }
}

/**
 * 生成验证快照
 * 将最近一次配置验证结果持久化，供 AI 面板和配置入口读取最近失败原因。
 */
function createValidationSnapshot(config: AIConfig, result: AIValidationResult): AIValidationSnapshot {
  return {
    isValid: result.isValid,
    message: result.message,
    provider: config.provider,
    modelName: config.modelName,
    customEndpoint: config.customEndpoint,
    validatedAt: new Date().toISOString(),
    diagnostics: result.diagnostics
  }
}

/**
 * 派发 AI 配置状态更新事件
 * 让同标签页内的 AI 面板在验证结果变化后立刻刷新状态摘要。
 */
function dispatchAIConfigStatusUpdated(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AI_CONFIG_STATUS_EVENT))
}

/**
 * 派发 AI 配置引导更新事件
 * 让配置弹窗在被动打开时也能收到最新的聚焦意图和提示信息。
 */
function dispatchAIConfigGuidanceUpdated(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AI_CONFIG_GUIDANCE_EVENT))
}

/**
 * AI 生成错误类
 * 满足需求 5.5: 提供明确的错误信息和重试选项
 */
export class AIGenerationError extends Error {
  /** 错误代码 */
  code: AIErrorCode
  /** 是否可重试 */
  retryable: boolean
  /** 建议的解决方案 */
  suggestion?: string

  constructor(message: string, code: AIErrorCode, retryable: boolean, suggestion?: string) {
    super(message)
    this.name = 'AIGenerationError'
    this.code = code
    this.retryable = retryable
    this.suggestion = suggestion
  }
}

/**
 * AI服务类
 */
export class AIService {
  private config: AIConfig | null = null

  /**
   * 初始化AI服务
   */
  constructor() {
    this.loadConfig()
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig() {
    if (typeof window === 'undefined') return
    try {
      const savedConfig = localStorage.getItem(AI_CONFIG_STORAGE_KEY)
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
        return
      }
      this.config = null
    } catch (error) {
      console.error('加载AI配置失败:', error)
    }
  }

  /**
   * 读取最近一次配置验证快照
   * 仅返回与当前配置匹配的验证结果，避免旧 provider 的错误干扰当前面板状态。
   */
  private readValidationSnapshot(config: AIConfig | null): AIValidationSnapshot | null {
    if (typeof window === 'undefined' || !config) {
      return null
    }

    try {
      const rawValue = localStorage.getItem(AI_CONFIG_VALIDATION_STORAGE_KEY)
      if (!rawValue) {
        return null
      }

      const snapshot = JSON.parse(rawValue) as Partial<AIValidationSnapshot>
      if (snapshot.provider !== config.provider) {
        return null
      }

      if (config.provider === 'custom' && snapshot.customEndpoint !== config.customEndpoint) {
        return null
      }

      return {
        isValid: Boolean(snapshot.isValid),
        message: typeof snapshot.message === 'string' ? snapshot.message : '',
        provider: snapshot.provider as AIConfig['provider'],
        modelName: typeof snapshot.modelName === 'string' ? snapshot.modelName : '',
        customEndpoint: typeof snapshot.customEndpoint === 'string' ? snapshot.customEndpoint : undefined,
        validatedAt: typeof snapshot.validatedAt === 'string' ? snapshot.validatedAt : '',
        diagnostics: snapshot.diagnostics
      }
    } catch (error) {
      console.error('读取AI验证快照失败:', error)
      return null
    }
  }

  /**
   * 写入最近一次配置验证快照
   * 用于在 AI 面板中复用最近一次验证诊断，无需重新打开配置弹窗。
   */
  private writeValidationSnapshot(snapshot: AIValidationSnapshot): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(AI_CONFIG_VALIDATION_STORAGE_KEY, JSON.stringify(snapshot))
      dispatchAIConfigStatusUpdated()
    } catch (error) {
      console.error('写入AI验证快照失败:', error)
    }
  }

  /**
   * 清理最近一次配置验证快照
   * 在切换到免费模型或停用 AI 时，避免保留旧的失败诊断。
   */
  private clearValidationSnapshot(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(AI_CONFIG_VALIDATION_STORAGE_KEY)
      dispatchAIConfigStatusUpdated()
    } catch (error) {
      console.error('清理AI验证快照失败:', error)
    }
  }

  /**
   * 读取 AI 配置引导信息
   * 在 AI 面板跳转到配置弹窗时，恢复最近一次诊断对应的聚焦字段和说明文案。
   */
  readConfigGuidance(): AIConfigGuidance | null {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const rawValue = localStorage.getItem(AI_CONFIG_GUIDANCE_STORAGE_KEY)
      if (!rawValue) {
        return null
      }

      const guidance = JSON.parse(rawValue) as Partial<AIConfigGuidance>
      if (!guidance.field || !guidance.title || !guidance.description || !guidance.createdAt) {
        return null
      }

      return {
        field: guidance.field,
        title: guidance.title,
        description: guidance.description,
        provider: guidance.provider,
        targetHost: guidance.targetHost,
        category: guidance.category,
        createdAt: guidance.createdAt
      }
    } catch (error) {
      console.error('读取AI配置引导失败:', error)
      return null
    }
  }

  /**
   * 写入 AI 配置引导信息
   * 供 AI 面板和其他入口在打开配置弹窗前写入当前应聚焦的字段。
   */
  setConfigGuidance(guidance: AIConfigGuidance): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(AI_CONFIG_GUIDANCE_STORAGE_KEY, JSON.stringify(guidance))
      dispatchAIConfigGuidanceUpdated()
    } catch (error) {
      console.error('写入AI配置引导失败:', error)
    }
  }

  /**
   * 清理 AI 配置引导信息
   * 避免旧的聚焦意图在下一次普通打开配置弹窗时继续残留。
   */
  clearConfigGuidance(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(AI_CONFIG_GUIDANCE_STORAGE_KEY)
      dispatchAIConfigGuidanceUpdated()
    } catch (error) {
      console.error('清理AI配置引导失败:', error)
    }
  }

  /**
   * 更新配置
   * 满足需求 4.3: 验证 API 连接并显示验证结果
   * 满足需求 4.4: 自动保存配置到本地存储
   */
  updateConfig(config: AIConfig): { success: boolean; error?: string } {
    // 验证配置
    const validationResult = this.validateConfigSync(config)
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.message }
    }

    this.config = config
    // 持久化配置到本地存储
    if (typeof window === 'undefined') {
      return { success: true }
    }
    try {
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config))
      if (!config.enabled || config.provider === 'free') {
        this.clearValidationSnapshot()
      }
      dispatchAIConfigStatusUpdated()
      return { success: true }
    } catch (error) {
      console.error('保存AI配置到本地存储失败:', error)
      return { success: false, error: '保存配置失败，请检查浏览器存储权限' }
    }
  }

  /**
   * 同步验证配置（不进行网络请求）
   * 检查配置的基本有效性
   */
  private validateConfigSync(config: AIConfig): { isValid: boolean; message: string } {
    // 检查是否启用
    if (!config.enabled) {
      return { isValid: true, message: 'AI 服务已禁用' }
    }

    // 检查提供商
    const validProviders = ['free', 'siliconflow', 'deepseek', 'custom']
    if (!validProviders.includes(config.provider)) {
      return { isValid: false, message: '无效的 AI 提供商' }
    }

    // 免费模型不需要 API 密钥
    if (config.provider === 'free') {
      if (!config.modelName || config.modelName.trim().length === 0) {
        return { isValid: false, message: '请选择模型' }
      }
      return { isValid: true, message: '配置有效' }
    }

    // 其他提供商需要 API 密钥
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      return { isValid: false, message: '请输入 API 密钥' }
    }

    // 自定义提供商需要端点
    if (config.provider === 'custom') {
      if (!config.customEndpoint || config.customEndpoint.trim().length === 0) {
        return { isValid: false, message: '请输入自定义 API 端点' }
      }
      // 验证端点 URL 格式
      try {
        new URL(config.customEndpoint)
      } catch {
        return { isValid: false, message: '无效的 API 端点 URL' }
      }
    }

    // 检查模型名称
    if (!config.modelName || config.modelName.trim().length === 0) {
      return { isValid: false, message: '请选择或输入模型名称' }
    }

    return { isValid: true, message: '配置有效' }
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    this.loadConfig()
    // 免费模型不需要API密钥验证
    if (this.config?.provider === 'free') {
      return !!(this.config?.enabled)
    }
    return !!(this.config?.enabled && this.config?.apiKey)
  }

  /**
   * 获取 AI 配置状态摘要
   * 供界面展示当前提供商、模型和是否还缺少关键配置。
   */
  getConfigStatus(): AIConfigStatus {
    this.loadConfig()

    if (!this.config) {
      return {
        isConfigured: false,
        isEnabled: false,
        provider: null,
        modelName: null,
        hasApiKey: false,
        needsApiKey: false,
        lastValidation: null
      }
    }

    const needsApiKey = this.config.provider !== 'free'
    const hasApiKey = !needsApiKey || Boolean(this.config.apiKey?.trim())
    const lastValidation = this.readValidationSnapshot(this.config)

    return {
      isConfigured: Boolean(this.config.enabled && hasApiKey),
      isEnabled: Boolean(this.config.enabled),
      provider: this.config.provider,
      modelName: this.config.modelName || null,
      hasApiKey,
      needsApiKey,
      lastValidation
    }
  }

  /**
   * 获取当前 AI 配置快照
   * 供 AI 面板和配置弹窗外的轻量状态展示复用当前本地配置。
   */
  getConfigSnapshot(): AIConfig | null {
    this.loadConfig()

    if (!this.config) {
      return null
    }

    return {
      ...this.config
    }
  }

  /**
   * 获取API端点
   */
  private getEndpoint(): string {
    if (!this.config) throw new Error('AI配置未初始化')
    
    switch (this.config.provider) {
      case 'free':
      case 'siliconflow':
        return 'https://api.siliconflow.cn/v1/chat/completions'
      case 'deepseek':
        return 'https://api.deepseek.com/chat/completions'
      case 'custom':
        return `${this.config.customEndpoint}/chat/completions`
      default:
        throw new Error('不支持的AI提供商')
    }
  }

  /**
   * 生成AI建议（支持流式输出）
   * @param type 建议类型
   * @param userPrompt 用户提示
   * @param currentContent 当前内容
   * @param onStream 流式输出回调函数
   */
  async generateSuggestions(
    type: 'summary' | 'experience' | 'skills' | 'education' | 'projects',
    userPrompt: string,
    currentContent?: string,
    onStream?: (content: string) => void
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('请先配置AI服务')
    }

    const systemPrompts = {
      summary: `你是一个专业的简历顾问。请根据用户提供的信息，生成5个高质量的个人简介。

要求：
- 每个简介80-150字，简洁有力，突出个人价值
- 第一句话要抓住HR注意力，展现核心竞争力
- 使用具体数字和成果量化个人能力（如：X年经验、提升X%、管理X人团队等）
- 体现职业发展轨迹和未来目标
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同风格的版本（专业型、成果导向型、技术专家型、管理型、创新型）

示例：
1. 【专业型】资深前端工程师，拥有5年React开发经验，专注于用户体验优化和性能提升。曾主导多个大型项目，实现页面加载速度提升40%，用户满意度达95%以上。精通现代前端技术栈，具备良好的代码规范意识和团队协作能力。

2. 【成果导向型】具备全栈开发能力的前端专家，成功交付20+个企业级项目。通过技术创新将系统响应时间缩短60%，为公司节省30%的服务器成本。擅长React、Vue等主流框架，有丰富的项目实战经验和问题解决能力。

3. 【技术专家型】专注于前端技术创新的工程师，在性能优化和用户体验方面有深入研究。掌握前端工程化、微前端架构等前沿技术，多次在技术社区分享经验，影响力覆盖10万+开发者。

4. 【管理型】经验丰富的前端技术负责人，具备5年团队管理经验，成功带领15人团队完成多个千万级项目。擅长技术选型、架构设计和团队建设，注重代码质量和开发效率提升。

5. 【创新型】技术全面的前端工程师，热衷于探索新技术和最佳实践。参与多个开源项目，贡献代码被Star 5000+次。熟悉现代前端开发流程，善于将创新想法转化为实际产品价值。`,

      experience: `你是一个专业的简历顾问。请根据用户提供的工作经历信息，生成5个优化的工作经历描述。

要求：
- 使用STAR法则（情境Situation、任务Task、行动Action、结果Result）组织内容
- 每条描述包含3-5个要点，每个要点30-50字
- 使用强有力的动作词开头（如：主导、优化、设计、实现、提升等）
- 必须包含量化数据（如：提升X%、节省X小时、管理X人、完成X项目等）
- 突出技术难点、创新点和个人贡献
- 体现团队协作和领导力
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同风格的版本

示例：
1. 【技术主导型】主导前端架构升级，将传统MPA重构为React SPA，页面加载速度提升50%，用户留存率提高25%。设计并实现组件库，包含80+个可复用组件，开发效率提升40%。优化构建流程，打包时间从8分钟缩短至2分钟。指导5名初级开发者，团队整体代码质量显著提升，Bug率降低60%。

2. 【项目管理型】负责电商平台前端开发，协调3个团队共15人完成项目交付。制定开发规范和Code Review流程，代码质量提升35%。推动敏捷开发实践，迭代周期从3周缩短至1周。成功上线10+个核心功能模块，GMV增长200%。

3. 【性能优化型】专注于Web性能优化，通过代码分割、懒加载等技术将首屏时间从3.5s降至1.2s。实现虚拟滚动和图片懒加载，支持10万+数据流畅展示。优化网络请求，接口响应时间减少40%。建立性能监控体系，实时追踪核心指标。

4. 【全栈开发型】负责前后端全栈开发，使用React + Node.js + MongoDB技术栈。设计RESTful API，支持日均100万+请求。实现用户认证、权限管理等核心功能。优化数据库查询，响应速度提升3倍。

5. 【创新驱动型】引入微前端架构，解决多团队协作难题，部署效率提升50%。探索WebAssembly技术，将计算密集型任务性能提升10倍。推动技术分享文化，组织20+次技术讲座，提升团队整体技术水平。`,

      skills: `你是一个专业的简历顾问。请根据用户提供的技能信息，生成5个不同的技能展示方式。

要求：
- 按技能类别科学分组（编程语言、框架/库、工具/平台、软技能等）
- 突出核心技能和熟练程度，使用具体描述而非简单罗列
- 体现技能的深度和广度，包含具体应用场景
- 展示技术栈的完整性和系统性
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同风格的版本

示例：
1. 【分类详细型】编程语言：精通JavaScript/TypeScript（5年经验），熟练Python（数据处理、自动化脚本），了解Go（微服务开发）。前端框架：React（含Hooks、Redux、React Router）、Vue.js（含Vuex、Vue Router）、Next.js（SSR/SSG）。后端技术：Node.js、Express、Koa、NestJS。数据库：MySQL、MongoDB、Redis。工具链：Git、Webpack、Vite、Docker、Jenkins。软技能：敏捷开发、团队协作、技术文档编写、Code Review。

2. 【能力导向型】核心技能：前端架构设计、性能优化（首屏优化、懒加载、代码分割）、组件化开发、状态管理。技术栈：React生态（5年）、Vue生态（3年）、TypeScript（类型系统设计）、Node.js（RESTful API、GraphQL）。工程化：Webpack配置优化、CI/CD流程搭建、自动化测试（Jest、Cypress）。跨端开发：React Native、Electron、小程序。

3. 【项目经验型】Web开发：使用React+TypeScript构建大型SPA应用，日活10万+用户。性能优化：通过代码分割和懒加载将首屏时间从3s降至1s。全栈开发：Node.js+Express+MongoDB构建RESTful API，支持高并发访问。DevOps：Docker容器化部署，Jenkins自动化CI/CD，AWS云服务管理。

4. 【技术深度型】JavaScript/TypeScript：深入理解闭包、原型链、异步编程、模块化。React：精通Hooks原理、虚拟DOM、Fiber架构、性能优化策略。工程化：Webpack插件开发、Babel转译配置、ESLint规则定制。架构设计：微前端、组件库、设计系统、状态管理方案。

5. 【全栈综合型】前端：React、Vue、Angular、TypeScript、Sass/Less、Tailwind CSS。后端：Node.js、Python、Java、RESTful API、GraphQL。数据库：MySQL、PostgreSQL、MongoDB、Redis。云服务：AWS（EC2、S3、Lambda）、阿里云、腾讯云。DevOps：Docker、Kubernetes、Jenkins、GitLab CI。`,

      education: `你是一个专业的简历顾问。请根据用户提供的教育背景信息，生成5个优化的教育经历描述。

要求：
- 突出学术成就、相关课程、在校表现和实践经历
- 体现学习能力、专业素养和综合素质
- 包含具体的GPA、排名、奖项等量化信息
- 展示与目标职位相关的课程和项目
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同风格的版本

示例：
1. 【学术优秀型】计算机科学与技术本科，2018-2022年，985高校。GPA 3.8/4.0，专业排名前10%。核心课程：数据结构与算法（95分）、操作系统（92分）、计算机网络（94分）、软件工程（96分）、数据库系统（93分）。获得国家奖学金、校级优秀学生一等奖学金（连续3年）、ACM程序设计竞赛省级二等奖。

2. 【项目实践型】计算机专业本科毕业，在校期间完成10+个课程项目和3个企业级实训项目。毕业设计《基于React的在线教育平台》获评优秀（全年级前5%）。参与导师科研项目，发表SCI论文1篇。担任学院程序设计协会技术部长，组织20+次技术讲座和编程竞赛。

3. 【竞赛获奖型】就读于知名985高校计算机专业，学习成绩优异。获得ACM-ICPC亚洲区域赛银奖、中国大学生计算机设计大赛国家级二等奖、蓝桥杯程序设计大赛省级一等奖。多次参加Hackathon活动，获得最佳创意奖。具备扎实的算法基础和编程能力。

4. 【全面发展型】本科期间专业成绩优秀，连续3年获得奖学金。担任班级学习委员和学生会技术部副部长，组织策划多次大型活动，具备良好的组织协调能力。参加学校创新创业项目，团队作品获得校级一等奖。通过CET-6（580分）、计算机二级、软件设计师认证。

5. 【国际视野型】大学四年系统学习计算机相关课程，具备良好的理论基础和实践能力。大三期间参加学校交换生项目，赴美国加州大学学习一学期，修读人工智能、机器学习等前沿课程。参与国际开源项目，贡献代码被merge 50+次。英语流利，可作为工作语言。`,

      projects: `你是一个专业的简历顾问。请根据用户提供的项目信息，生成5个优化的项目描述。

要求：
- 使用"项目背景-技术方案-个人贡献-项目成果"的结构
- 突出技术难点、创新点和解决方案
- 必须包含量化的项目成果（用户量、性能提升、业务增长等）
- 体现个人在项目中的核心作用和技术深度
- 展示完整的技术栈和工程实践
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同风格的版本

示例：
1. 【技术深度型】电商管理系统（2023.06-2023.12）｜React + TypeScript + Node.js + MongoDB + Redis。项目背景：为中型电商企业开发全栈管理系统，支持商品、订单、用户、营销等核心业务。技术方案：前端采用React 18 + TypeScript构建，使用Zustand进行状态管理，Ant Design作为UI框架；后端使用Node.js + Express，MongoDB存储业务数据，Redis缓存热点数据。个人贡献：负责前端架构设计和核心功能开发（占比60%），实现复杂的权限管理系统（支持RBAC模型）、实时数据同步（WebSocket）、大数据量表格虚拟滚动（支持10万+数据）。项目成果：系统上线后用户转化率提升25%，订单处理效率提高40%，页面加载速度优化至1.5s以内，获得客户高度认可。

2. 【业务价值型】智能推荐平台（2023.01-2023.06）｜团队项目，担任前端负责人。项目背景：为内容平台开发个性化推荐系统，提升用户留存和活跃度。技术方案：前端使用Next.js实现SSR，提升SEO和首屏性能；后端使用Python + TensorFlow构建推荐算法。个人贡献：主导前端架构设计，实现推荐内容的流式加载和无限滚动，优化图片懒加载策略。项目成果：用户日均使用时长增加35%，内容点击率提升50%，页面跳出率降低28%，为公司带来月活增长20万+。

3. 【架构创新型】企业级微前端平台（2022.08-2023.03）｜React + qiankun + Webpack Module Federation。项目背景：解决多团队协作开发大型应用的痛点，实现应用的独立开发、部署和运行。技术方案：采用qiankun微前端框架，结合Webpack 5的Module Federation实现应用间通信。个人贡献：设计微前端架构方案，制定开发规范和最佳实践，实现主应用和子应用的生命周期管理、路由同步、状态共享。项目成果：支持5个子应用独立部署，部署效率提升60%，团队协作效率提高40%，代码冲突减少80%。

4. 【性能优化型】移动端H5应用性能优化（2022.03-2022.07）｜React + Vite + PWA。项目背景：原有H5应用首屏时间长达4s，用户体验差，跳出率高达45%。技术方案：使用Vite替代Webpack提升构建速度，实现代码分割和懒加载，引入PWA技术实现离线缓存。个人贡献：负责整体性能优化方案设计和实施，包括图片压缩和WebP格式转换、关键CSS内联、预加载关键资源、虚拟列表优化长列表渲染。项目成果：首屏时间从4s降至1.2s（提升70%），Lighthouse性能评分从45提升至92，用户跳出率降低至18%，转化率提升32%。

5. 【开源贡献型】开源组件库开发（2021.09-2022.12）｜React + TypeScript + Storybook + Jest。项目背景：为公司内部和开源社区开发高质量React组件库，提升开发效率和代码复用性。技术方案：使用TypeScript保证类型安全，Storybook进行组件文档和调试，Jest + React Testing Library实现单元测试（覆盖率95%+）。个人贡献：独立开发30+个常用组件（Button、Form、Table、Modal等），编写详细的API文档和使用示例，建立CI/CD流程实现自动化测试和发布。项目成果：组件库在GitHub获得2000+ Star，npm周下载量5000+，被10+个项目采用，显著提升团队开发效率。`,
    }

    const userMessage = currentContent 
      ? `当前内容：${currentContent}\n\n用户需求：${userPrompt}`
      : `用户需求：${userPrompt}`

    try {
      // 如果提供了流式回调，使用流式请求
      if (onStream) {
        return await this.generateStreamingSuggestions(type, systemPrompts[type], userMessage, onStream)
      }

      // 使用内部API代理路由，避免CORS问题
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: this.config!.provider,
          apiKey: this.config!.apiKey,
          customEndpoint: this.config!.customEndpoint,
          model: this.config!.modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompts[type]
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success || !data.content) {
        throw new Error('AI响应格式错误')
      }

      // 尝试解析AI返回的多个建议
      const suggestions = this.parseSuggestions(data.content)
      return suggestions.length > 0 ? suggestions : [data.content]

    } catch (error) {
      console.error('AI API调用失败:', error)
      
      // 提供更友好的错误信息
      if (error instanceof Error) {
        // 网络错误
        if (error.message.includes('网络') || error.message.includes('network') || error.message.includes('fetch')) {
          throw new AIGenerationError(
            '网络连接失败，请检查网络连接后重试',
            'NETWORK_ERROR',
            true // 可重试
          )
        }
        // API 错误
        if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
          throw new AIGenerationError(
            'AI服务暂时不可用，请稍后重试或检查 API 密钥',
            'API_ERROR',
            true
          )
        }
        // 配置错误
        if (error.message.includes('配置') || error.message.includes('config')) {
          throw new AIGenerationError(
            'AI配置有误，请检查配置后重试',
            'CONFIG_ERROR',
            false // 不可重试，需要修改配置
          )
        }
        // 超时错误
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          throw new AIGenerationError(
            '请求超时，请稍后重试',
            'TIMEOUT_ERROR',
            true
          )
        }
        // 响应格式错误
        if (error.message.includes('格式') || error.message.includes('format')) {
          throw new AIGenerationError(
            'AI响应格式异常，请重试',
            'FORMAT_ERROR',
            true
          )
        }
      }
      
      throw new AIGenerationError(
        'AI生成失败，请重试或检查网络连接',
        'UNKNOWN_ERROR',
        true
      )
    }
  }

  /**
   * 生成流式AI建议
   * 满足需求 5.1: 支持流式输出，实时显示生成内容
   * 满足需求 5.4: 显示生成进度指示器
   * @param type - 建议类型
   * @param systemPrompt - 系统提示
   * @param userMessage - 用户消息
   * @param onStream - 流式输出回调
   * @param onProgress - 进度回调（可选）
   * @param abortSignal - 取消信号（可选）
   */
  private async generateStreamingSuggestions(
    type: string,
    systemPrompt: string,
    userMessage: string,
    onStream: (content: string) => void,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    // 预估的最大内容长度（用于计算进度）
    const estimatedMaxLength = 2000
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: this.config!.provider,
        apiKey: this.config!.apiKey,
        customEndpoint: this.config!.customEndpoint,
        model: this.config!.modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true
      }),
      signal: abortSignal
    })

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    let fullContent = ''
    const decoder = new TextDecoder()

    try {
      // 初始进度
      onProgress?.(5)
      
      while (true) {
        // 检查是否被取消
        if (abortSignal?.aborted) {
          throw new Error('生成已取消')
        }
        
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              let content = ''
              
              // 根据不同提供商解析内容
              if (this.config!.provider === 'deepseek') {
                content = parsed.delta?.text || ''
              } else if (this.config!.provider === 'siliconflow' || this.config!.provider === 'free' || this.config!.provider === 'custom') {
                content = parsed.choices?.[0]?.delta?.content || ''
              }
              
              if (content) {
                fullContent += content
                onStream(fullContent)
                
                // 更新进度（基于内容长度估算）
                const progress = Math.min(95, 5 + (fullContent.length / estimatedMaxLength) * 90)
                onProgress?.(Math.round(progress))
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
      
      // 完成进度
      onProgress?.(100)
    } finally {
      reader.releaseLock()
    }

    return this.parseSuggestions(fullContent)
  }

  /**
   * 解析AI返回的建议内容
   * 满足需求 5.2: 生成至少 5 个不同风格的版本供用户选择
   * 支持多种格式的内容解析：
   * - 数字列表 (1. 2. 或 1、 2、)
   * - Markdown 列表 (- * •)
   * - 换行分隔
   * - 双换行分隔的段落
   */
  private parseSuggestions(content: string): string[] {
    // 清理内容，移除多余的空行
    const cleanContent = content.trim().replace(/\n\s*\n\s*\n/g, '\n\n')
    
    let suggestions: string[] = []
    
    // 方法1: 尝试按数字列表分割 (1. 2. 或 1、 2、 或 (1) (2))
    const numberPattern = /(?:^|\n)\s*(?:\(?\d+[.、)]\s*|\d+[)]\s*)/g
    const numberMatches = Array.from(cleanContent.matchAll(numberPattern))
    
    if (numberMatches.length >= 2) {
      for (let i = 0; i < numberMatches.length; i++) {
        const currentMatch = numberMatches[i]
        const nextMatch = numberMatches[i + 1]
        
        const startIndex = currentMatch.index! + currentMatch[0].length
        const endIndex = nextMatch ? nextMatch.index! : cleanContent.length
        
        const suggestion = cleanContent.slice(startIndex, endIndex).trim()
        if (suggestion && suggestion.length > 5) {
          suggestions.push(suggestion)
        }
      }
      
      if (suggestions.length >= 2) {
        return suggestions
      }
    }
    
    // 方法2: 尝试按 Markdown 列表分割 (- * •)
    const listPattern = /(?:^|\n)\s*[-*•]\s+/g
    const listMatches = Array.from(cleanContent.matchAll(listPattern))
    
    if (listMatches.length >= 2) {
      suggestions = []
      for (let i = 0; i < listMatches.length; i++) {
        const currentMatch = listMatches[i]
        const nextMatch = listMatches[i + 1]
        
        const startIndex = currentMatch.index! + currentMatch[0].length
        const endIndex = nextMatch ? nextMatch.index! : cleanContent.length
        
        const suggestion = cleanContent.slice(startIndex, endIndex).trim()
        if (suggestion && suggestion.length > 5) {
          suggestions.push(suggestion)
        }
      }
      
      if (suggestions.length >= 2) {
        return suggestions
      }
    }
    
    // 方法3: 尝试按双换行分割（段落）
    const paragraphs = cleanContent.split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p && p.length > 10)
    
    if (paragraphs.length >= 2) {
      return paragraphs.map(p => p.replace(/^[-*•\d.、)\s]+/, '').trim())
    }
    
    // 方法4: 尝试按单换行分割，过滤空行和短行
    const lines = cleanContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 10)
    
    if (lines.length >= 2) {
      return lines.map(line => line.replace(/^[-*•\d.、)\s]+/, '').trim())
    }

    // 如果无法分割，返回整个内容作为单个建议
    return cleanContent.length > 0 ? [cleanContent] : []
  }

  /**
   * 验证API配置
   */
  async validateConfig(config: AIConfig): Promise<AIValidationResult> {
    try {
      // 使用内部API代理路由进行验证
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          customEndpoint: config.customEndpoint,
          model: config.modelName,
          messages: [
            {
              role: 'user',
              content: '测试连接'
            }
          ],
          max_tokens: 10
        })
      })

      if (response.ok) {
        const data = await response.json() as AIValidationResponsePayload
        if (data.success) {
          const result = { isValid: true, message: 'API配置验证成功' } satisfies AIValidationResult
          this.writeValidationSnapshot(createValidationSnapshot(config, result))
          return result
        } else {
          const result = buildValidationFailureResult(data)
          this.writeValidationSnapshot(createValidationSnapshot(config, result))
          return result
        }
      } else {
        const errorData = await response.json().catch(() => null) as AIValidationResponsePayload | null
        const result = buildValidationFailureResult(errorData, response.status)
        this.writeValidationSnapshot(createValidationSnapshot(config, result))
        return result
      }
    } catch (error) {
      const diagnostics = buildLocalValidationDiagnostics(config, error)
      const result = { 
        isValid: false, 
        message: buildLocalValidationErrorMessage(config, error),
        diagnostics
      }
      this.writeValidationSnapshot(createValidationSnapshot(config, result))
      return result
    }
  }
}

// 导出单例实例
export const aiService = new AIService()
