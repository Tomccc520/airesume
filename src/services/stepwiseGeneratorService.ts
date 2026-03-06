/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description AI 分步生成服务，协调简历各模块的顺序生成
 */

import {
  GenerationMode,
  GenerationStepType,
  StepStatus,
  GenerationStep,
  GenerationSession,
  UserGenerationInfo,
  StepCallbacks,
  StepConfig,
  StoredSession,
  ApplyToResumeResult
} from '@/types/stepwise'
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project } from '@/types/resume'
import { aiService } from './aiService'

/** localStorage 存储键 */
const MODE_PREFERENCE_KEY = 'ai-stepwise-mode-preference'
const SESSION_STORAGE_KEY = 'ai-stepwise-session'
const SESSION_EXPIRY_MS = 30 * 60 * 1000 // 30 分钟

/** 步骤配置 */
export const STEP_CONFIG: Record<GenerationStepType, StepConfig> = {
  summary: {
    titleKey: 'stepwise.steps.summary',
    descriptionKey: 'stepwise.steps.summaryDesc',
    icon: 'User',
    order: 1
  },
  experience: {
    titleKey: 'stepwise.steps.experience',
    descriptionKey: 'stepwise.steps.experienceDesc',
    icon: 'Briefcase',
    order: 2
  },
  education: {
    titleKey: 'stepwise.steps.education',
    descriptionKey: 'stepwise.steps.educationDesc',
    icon: 'GraduationCap',
    order: 3
  },
  skills: {
    titleKey: 'stepwise.steps.skills',
    descriptionKey: 'stepwise.steps.skillsDesc',
    icon: 'Wrench',
    order: 4
  },
  projects: {
    titleKey: 'stepwise.steps.projects',
    descriptionKey: 'stepwise.steps.projectsDesc',
    icon: 'FolderOpen',
    order: 5
  }
}

/** 步骤顺序 */
const STEP_ORDER: GenerationStepType[] = ['summary', 'experience', 'education', 'skills', 'projects']

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建初始步骤
 */
function createInitialSteps(): GenerationStep[] {
  return STEP_ORDER.map((type, index) => ({
    id: `step-${type}-${generateId()}`,
    type,
    status: 'pending' as StepStatus,
    content: null,
    error: null,
    startedAt: null,
    completedAt: null,
    isSelected: true
  }))
}

/**
 * AI 分步生成服务类
 */
export class StepwiseGeneratorService {
  private session: GenerationSession | null = null
  private abortController: AbortController | null = null
  private callbacks: StepCallbacks | null = null

  /**
   * 初始化新的生成会话
   */
  initSession(userInfo: UserGenerationInfo, mode: GenerationMode): GenerationSession {
    this.session = {
      id: generateId(),
      mode,
      steps: createInitialSteps(),
      currentStepIndex: 0,
      isPaused: false,
      isComplete: false,
      userInfo,
      startedAt: Date.now(),
      completedAt: null
    }
    this.saveModePreference(mode)
    return this.session
  }

  /**
   * 获取保存的模式偏好
   */
  getSavedModePreference(): GenerationMode {
    if (typeof window === 'undefined') return 'stepByStep'
    try {
      const saved = localStorage.getItem(MODE_PREFERENCE_KEY)
      if (saved === 'quick' || saved === 'stepByStep') {
        return saved
      }
    } catch (e) {
      console.error('Failed to load mode preference:', e)
    }
    return 'stepByStep'
  }

  /**
   * 保存模式偏好
   */
  saveModePreference(mode: GenerationMode): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(MODE_PREFERENCE_KEY, mode)
    } catch (e) {
      console.error('Failed to save mode preference:', e)
    }
  }

  /**
   * 从逐步模式切换到快速模式
   */
  switchToQuickMode(): void {
    if (!this.session || this.session.mode !== 'stepByStep') return
    this.session.mode = 'quick'
    this.saveModePreference('quick')
    this.callbacks?.onModeChange('quick')
  }

  /**
   * 获取当前会话
   */
  getSession(): GenerationSession | null {
    return this.session
  }

  /**
   * 更新步骤状态
   */
  private updateStep(index: number, updates: Partial<GenerationStep>): void {
    if (!this.session || index < 0 || index >= this.session.steps.length) return
    this.session.steps[index] = { ...this.session.steps[index], ...updates }
  }

  /**
   * 计算进度百分比
   */
  calculateProgress(): { percentage: number; completed: number; total: number } {
    if (!this.session) return { percentage: 0, completed: 0, total: 5 }
    const total = this.session.steps.length
    const completed = this.session.steps.filter(
      s => s.status === 'completed' || s.status === 'skipped'
    ).length
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total
    }
  }

  /**
   * 检查会话是否完成
   */
  private checkSessionComplete(): boolean {
    if (!this.session) return false
    const allDone = this.session.steps.every(
      s => s.status === 'completed' || s.status === 'skipped'
    )
    if (allDone && !this.session.isComplete) {
      this.session.isComplete = true
      this.session.completedAt = Date.now()
      this.callbacks?.onSessionComplete(this.session)
    }
    return allDone
  }

  /**
   * 生成单个步骤的内容
   */
  async generateStep(
    step: GenerationStep,
    onStream: (content: string) => void
  ): Promise<string> {
    const { userInfo } = this.session!
    const prompt = this.buildPromptForStep(step.type, userInfo)
    
    this.abortController = new AbortController()
    
    const suggestions = await aiService.generateSuggestions(
      step.type,
      prompt,
      undefined,
      onStream
    )
    
    return suggestions[0] || ''
  }

  /**
   * 构建步骤的提示词
   */
  private buildPromptForStep(type: GenerationStepType, userInfo: UserGenerationInfo): string {
    const { name, targetPosition, industry, experienceLevel } = userInfo
    const base = `姓名: ${name}, 目标职位: ${targetPosition}, 行业: ${industry}, 经验水平: ${experienceLevel}`
    
    switch (type) {
      case 'summary':
        return `请为以下求职者生成个人简介：${base}`
      case 'experience':
        return `请为以下求职者生成工作经历：${base}`
      case 'education':
        return `请为以下求职者生成教育背景：${base}`
      case 'skills':
        return `请为以下求职者生成技能列表：${base}`
      case 'projects':
        return `请为以下求职者生成项目经历：${base}`
      default:
        return base
    }
  }

  /**
   * 开始或恢复生成
   */
  async startGeneration(callbacks: StepCallbacks): Promise<void> {
    if (!this.session) throw new Error('No session initialized')
    this.callbacks = callbacks
    
    while (this.session.currentStepIndex < this.session.steps.length) {
      if (this.session.isPaused) break
      
      const step = this.session.steps[this.session.currentStepIndex]
      if (step.status === 'completed' || step.status === 'skipped') {
        this.session.currentStepIndex++
        continue
      }
      
      // 开始生成
      this.updateStep(this.session.currentStepIndex, {
        status: 'generating',
        startedAt: Date.now()
      })
      callbacks.onStepStart(this.session.steps[this.session.currentStepIndex])
      
      try {
        const content = await this.generateStep(step, (streamContent) => {
          callbacks.onStepProgress(this.session!.steps[this.session!.currentStepIndex], streamContent)
        })
        
        this.updateStep(this.session.currentStepIndex, {
          status: 'completed',
          content,
          completedAt: Date.now()
        })
        callbacks.onStepComplete(this.session.steps[this.session.currentStepIndex])
        
        // 快速模式自动前进
        if (this.session.mode === 'quick') {
          this.session.currentStepIndex++
        } else {
          // 逐步模式等待用户确认
          break
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '生成失败'
        this.updateStep(this.session.currentStepIndex, {
          status: 'error',
          error: errorMessage
        })
        callbacks.onStepError(this.session.steps[this.session.currentStepIndex], errorMessage)
        break
      }
    }
    
    this.checkSessionComplete()
  }

  /**
   * 确认当前步骤并前进
   */
  confirmStep(modifiedContent?: string): void {
    if (!this.session) return
    const idx = this.session.currentStepIndex
    const updates: Partial<GenerationStep> = {
      status: 'completed',
      completedAt: Date.now()
    }
    if (modifiedContent !== undefined) {
      updates.content = modifiedContent
    }
    this.updateStep(idx, updates)
    this.session.currentStepIndex++
    this.checkSessionComplete()
  }

  /**
   * 跳过当前步骤
   */
  skipStep(): void {
    if (!this.session) return
    this.updateStep(this.session.currentStepIndex, {
      status: 'skipped',
      completedAt: Date.now()
    })
    this.session.currentStepIndex++
    this.checkSessionComplete()
  }

  /**
   * 重新生成指定步骤
   */
  async regenerateStep(stepIndex?: number): Promise<void> {
    if (!this.session || !this.callbacks) return
    const idx = stepIndex ?? this.session.currentStepIndex
    
    this.updateStep(idx, {
      status: 'generating',
      content: null,
      error: null,
      startedAt: Date.now(),
      completedAt: null
    })
    this.callbacks.onStepStart(this.session.steps[idx])
    
    try {
      const content = await this.generateStep(this.session.steps[idx], (streamContent) => {
        this.callbacks!.onStepProgress(this.session!.steps[idx], streamContent)
      })
      
      this.updateStep(idx, {
        status: 'completed',
        content,
        completedAt: Date.now()
      })
      this.callbacks.onStepComplete(this.session.steps[idx])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败'
      this.updateStep(idx, { status: 'error', error: errorMessage })
      this.callbacks.onStepError(this.session.steps[idx], errorMessage)
    }
  }

  /**
   * 使用自定义提示词重新生成指定步骤（AI优化功能）
   */
  async regenerateStepWithPrompt(stepIndex: number, customPrompt: string): Promise<void> {
    if (!this.session || !this.callbacks) return
    const idx = stepIndex
    const step = this.session.steps[idx]
    const currentContent = step.content || ''
    
    this.updateStep(idx, {
      status: 'generating',
      error: null,
      startedAt: Date.now(),
      completedAt: null
    })
    this.callbacks.onStepStart(this.session.steps[idx])
    
    try {
      // 构建包含当前内容和优化要求的提示词
      const optimizePrompt = this.buildOptimizePrompt(step.type, currentContent, customPrompt)
      
      this.abortController = new AbortController()
      
      const suggestions = await aiService.generateSuggestions(
        step.type,
        optimizePrompt,
        currentContent,
        (streamContent) => {
          this.callbacks!.onStepProgress(this.session!.steps[idx], streamContent)
        }
      )
      
      const content = suggestions[0] || currentContent
      
      this.updateStep(idx, {
        status: 'completed',
        content,
        completedAt: Date.now()
      })
      this.callbacks.onStepComplete(this.session.steps[idx])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '优化失败'
      this.updateStep(idx, { status: 'error', error: errorMessage })
      this.callbacks.onStepError(this.session.steps[idx], errorMessage)
    }
  }

  /**
   * 构建优化提示词
   */
  private buildOptimizePrompt(type: GenerationStepType, currentContent: string, customPrompt: string): string {
    const { userInfo } = this.session!
    const base = `姓名: ${userInfo.name}, 目标职位: ${userInfo.targetPosition}, 行业: ${userInfo.industry}`
    
    return `请根据以下要求优化内容：
用户信息：${base}
当前内容：${currentContent}
优化要求：${customPrompt}

请直接输出优化后的内容，不要包含任何解释或说明。`
  }

  /**
   * 暂停生成
   */
  pauseGeneration(): void {
    if (!this.session) return
    this.session.isPaused = true
    this.abortController?.abort()
  }

  /**
   * 恢复生成
   */
  resumeGeneration(): void {
    if (!this.session) return
    this.session.isPaused = false
  }

  /**
   * 取消生成
   */
  cancelGeneration(): void {
    this.abortController?.abort()
    this.clearStoredSession()
    this.session = null
    this.callbacks = null
  }

  /**
   * 重置所有步骤（用于重新生成全部）
   */
  resetAllSteps(): void {
    if (!this.session) return
    this.session.steps.forEach((_, idx) => {
      this.updateStep(idx, {
        status: 'pending',
        content: null,
        error: null,
        startedAt: null,
        completedAt: null
      })
    })
    this.session.currentStepIndex = 0
    this.session.isComplete = false
    this.session.completedAt = null
  }

  /**
   * 切换步骤选择状态（用于最终审核）
   */
  toggleStepSelection(stepIndex: number): void {
    if (!this.session || stepIndex < 0 || stepIndex >= this.session.steps.length) return
    const step = this.session.steps[stepIndex]
    this.updateStep(stepIndex, { isSelected: !step.isSelected })
  }

  /**
   * 全选步骤
   */
  selectAllSteps(): void {
    if (!this.session) return
    this.session.steps.forEach((_, idx) => {
      this.updateStep(idx, { isSelected: true })
    })
  }

  /**
   * 取消全选
   */
  deselectAllSteps(): void {
    if (!this.session) return
    this.session.steps.forEach((_, idx) => {
      this.updateStep(idx, { isSelected: false })
    })
  }

  /**
   * 应用生成的内容到简历数据
   */
  applyToResume(): ApplyToResumeResult {
    if (!this.session) return {}
    
    const result: ApplyToResumeResult = {}
    
    for (const step of this.session.steps) {
      if (step.status !== 'completed' || !step.isSelected || !step.content) continue
      
      switch (step.type) {
        case 'summary':
          result.personalInfo = {
            name: this.session.userInfo.name,
            title: this.session.userInfo.targetPosition,
            email: '',
            phone: '',
            location: '',
            summary: step.content
          } as PersonalInfo
          break
        case 'experience':
          result.experience = this.parseExperience(step.content)
          break
        case 'education':
          result.education = this.parseEducation(step.content)
          break
        case 'skills':
          result.skills = this.parseSkills(step.content)
          break
        case 'projects':
          result.projects = this.parseProjects(step.content)
          break
      }
    }
    
    return result
  }

  /**
   * 解析工作经历内容
   */
  private parseExperience(content: string): Experience[] {
    return [{
      id: generateId(),
      company: '公司名称',
      position: this.session?.userInfo.targetPosition || '职位',
      startDate: '2020-01',
      endDate: '至今',
      current: true,
      description: content.split('\n').filter(line => line.trim()),
      location: ''
    }]
  }

  /**
   * 解析教育背景内容
   */
  private parseEducation(content: string): Education[] {
    return [{
      id: generateId(),
      school: '学校名称',
      degree: '本科',
      major: '专业',
      startDate: '2016-09',
      endDate: '2020-06',
      description: content
    }]
  }

  /**
   * 解析技能内容
   */
  private parseSkills(content: string): Skill[] {
    const skills = content.split(/[,，、\n]/).filter(s => s.trim())
    return skills.slice(0, 10).map((name, idx) => ({
      id: generateId(),
      name: name.trim(),
      level: 80 - idx * 5,
      category: '技术技能'
    }))
  }

  /**
   * 解析项目经历内容
   */
  private parseProjects(content: string): Project[] {
    return [{
      id: generateId(),
      name: '项目名称',
      description: content,
      technologies: [],
      startDate: '2023-01',
      endDate: '2023-12',
      highlights: content.split('\n').filter(line => line.trim()).slice(0, 3)
    }]
  }

  /**
   * 保存会话到 localStorage
   */
  saveSession(): void {
    if (!this.session || typeof window === 'undefined') return
    try {
      const stored: StoredSession = {
        session: this.session,
        timestamp: Date.now()
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored))
    } catch (e) {
      console.error('Failed to save session:', e)
    }
  }

  /**
   * 从 localStorage 恢复会话
   */
  recoverSession(): GenerationSession | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!stored) return null
      
      const { session, timestamp } = JSON.parse(stored) as StoredSession
      const isExpired = Date.now() - timestamp > SESSION_EXPIRY_MS
      
      if (isExpired) {
        this.clearStoredSession()
        return null
      }
      
      this.session = session
      return session
    } catch (e) {
      console.error('Failed to recover session:', e)
      this.clearStoredSession()
      return null
    }
  }

  /**
   * 清除存储的会话
   */
  clearStoredSession(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear stored session:', e)
    }
  }

  /**
   * 导航到指定步骤（仅用于查看已完成的步骤）
   */
  navigateToStep(stepIndex: number): GenerationStep | null {
    if (!this.session || stepIndex < 0 || stepIndex >= this.session.steps.length) return null
    return this.session.steps[stepIndex]
  }
}

// 导出单例实例
export const stepwiseGeneratorService = new StepwiseGeneratorService()
