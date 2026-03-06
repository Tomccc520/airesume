/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description AI 分步生成功能的类型定义
 */

import { ResumeData } from './resume'

/**
 * 生成模式类型
 * - quick: 快速模式，所有步骤连续执行，最后统一确认
 * - stepByStep: 逐步模式，每步完成后暂停等待用户确认
 */
export type GenerationMode = 'quick' | 'stepByStep'

/**
 * 生成步骤类型，对应简历的各个模块
 */
export type GenerationStepType = 'summary' | 'experience' | 'education' | 'skills' | 'projects'

/**
 * 步骤状态
 * - pending: 等待中
 * - generating: 生成中
 * - completed: 已完成
 * - error: 出错
 * - skipped: 已跳过
 */
export type StepStatus = 'pending' | 'generating' | 'completed' | 'error' | 'skipped'

/**
 * 单个生成步骤的状态
 */
export interface GenerationStep {
  /** 步骤唯一标识 */
  id: string
  /** 步骤类型 */
  type: GenerationStepType
  /** 当前状态 */
  status: StepStatus
  /** 生成的内容 */
  content: string | null
  /** 错误信息 */
  error: string | null
  /** 开始时间戳 */
  startedAt: number | null
  /** 完成时间戳 */
  completedAt: number | null
  /** 是否被选中用于最终应用（用于快速模式的最终审核） */
  isSelected: boolean
}

/**
 * 完整的生成会话状态
 */
export interface GenerationSession {
  /** 会话唯一标识 */
  id: string
  /** 当前生成模式 */
  mode: GenerationMode
  /** 所有步骤列表 */
  steps: GenerationStep[]
  /** 当前步骤索引 */
  currentStepIndex: number
  /** 是否已暂停 */
  isPaused: boolean
  /** 是否已完成 */
  isComplete: boolean
  /** 用户输入的生成上下文信息 */
  userInfo: UserGenerationInfo
  /** 会话开始时间戳 */
  startedAt: number
  /** 会话完成时间戳 */
  completedAt: number | null
}

/**
 * 用户输入的生成上下文信息
 */
export interface UserGenerationInfo {
  /** 姓名 */
  name: string
  /** 目标职位 */
  targetPosition: string
  /** 行业 */
  industry: string
  /** 经验水平 */
  experienceLevel: string
}

/**
 * 步骤事件回调接口
 */
export interface StepCallbacks {
  /** 步骤开始时触发 */
  onStepStart: (step: GenerationStep) => void
  /** 步骤生成进度更新时触发（流式输出） */
  onStepProgress: (step: GenerationStep, content: string) => void
  /** 步骤完成时触发 */
  onStepComplete: (step: GenerationStep) => void
  /** 步骤出错时触发 */
  onStepError: (step: GenerationStep, error: string) => void
  /** 整个会话完成时触发 */
  onSessionComplete: (session: GenerationSession) => void
  /** 模式切换时触发 */
  onModeChange: (mode: GenerationMode) => void
}

/**
 * 错误代码类型
 */
export type StepwiseErrorCode = 
  | 'NETWORK_ERROR'      // 网络连接问题
  | 'API_ERROR'          // AI 服务错误
  | 'TIMEOUT_ERROR'      // 生成超时
  | 'CANCELLED'          // 用户取消
  | 'SESSION_EXPIRED'    // 会话恢复失败
  | 'UNKNOWN_ERROR'      // 未知错误

/**
 * 分步生成错误接口
 */
export interface StepwiseError {
  /** 错误代码 */
  code: StepwiseErrorCode
  /** 错误消息 */
  message: string
  /** 是否可重试 */
  retryable: boolean
  /** 出错的步骤类型 */
  stepType?: GenerationStepType
}

/**
 * 步骤配置接口
 */
export interface StepConfig {
  /** 标题的 i18n 键 */
  titleKey: string
  /** 描述的 i18n 键 */
  descriptionKey: string
  /** 图标名称（Lucide React） */
  icon: string
  /** 排序顺序 */
  order: number
}

/**
 * 存储的会话接口（用于 localStorage 恢复）
 */
export interface StoredSession {
  /** 会话数据 */
  session: GenerationSession
  /** 存储时间戳 */
  timestamp: number
}

/**
 * 应用到简历的结果类型
 */
export type ApplyToResumeResult = Partial<ResumeData>
