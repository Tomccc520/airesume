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
    try {
      const savedConfig = localStorage.getItem('ai-config')
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
      }
    } catch (error) {
      console.error('加载AI配置失败:', error)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: AIConfig) {
    this.config = config
    // 持久化配置到本地存储
    try {
      localStorage.setItem('ai-config', JSON.stringify(config))
    } catch (error) {
      console.error('保存AI配置到本地存储失败:', error)
    }
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    // 免费模型不需要API密钥验证
    if (this.config?.provider === 'free') {
      return !!(this.config?.enabled)
    }
    return !!(this.config?.enabled && this.config?.apiKey)
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
- 每个简介80-120字，简洁有力
- 突出核心竞争力和职业亮点
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同的版本

示例：
1. 资深前端工程师，拥有5年React开发经验，专注于用户体验优化和性能提升。曾主导多个大型项目，实现页面加载速度提升40%，用户满意度达95%以上。

2. 具备全栈开发能力的前端专家，精通React、Vue等主流框架，有丰富的项目实战经验。

3. 专注于前端技术创新的工程师，在性能优化和用户体验方面有深入研究。

4. 经验丰富的前端开发者，具备良好的团队协作能力和项目管理经验。

5. 技术全面的前端工程师，熟悉现代前端开发流程和最佳实践。`,

      experience: `你是一个专业的简历顾问。请根据用户提供的工作经历信息，生成5个优化的工作经历描述。

要求：
- 突出具体成就和量化结果
- 使用动作词开头，体现主动性
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同的版本

示例：
1. 负责前端架构设计，主导团队完成电商平台重构项目。优化页面性能，加载速度提升40%，建立组件库，开发效率提升30%，指导5名初级开发者，团队整体技术水平显著提升。

2. 主导产品功能开发，参与用户体验优化，负责核心模块的设计与实现。

3. 承担技术选型和架构设计工作，推动团队技术升级和流程优化。

4. 参与项目全生命周期管理，从需求分析到上线部署全程跟进。

5. 负责代码审查和技术培训，提升团队整体开发质量和效率。`,

      skills: `你是一个专业的简历顾问。请根据用户提供的技能信息，生成5个不同的技能展示方式。

要求：
- 按技能类别分组展示
- 突出核心技能和熟练程度
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同的版本

示例：
1. 前端技术精通React、Vue.js、TypeScript，熟练Node.js、Express、MongoDB，了解Python、Docker、AWS

2. 核心技能包括JavaScript/TypeScript、React生态、前端工程化、性能优化、团队协作

3. 编程语言JavaScript、TypeScript、Python，框架React、Vue、Express，工具Git、Webpack、Docker

4. 专业技能前端开发、全栈开发、性能优化、项目管理、团队协作

5. 技术栈现代前端框架、后端开发、数据库设计、云服务部署、敏捷开发`,

      education: `你是一个专业的简历顾问。请根据用户提供的教育背景信息，生成5个优化的教育经历描述。

要求：
- 突出学术成就、相关课程或在校表现
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同的版本

示例：
1. 计算机科学与技术本科，2018-2022年。GPA 3.8/4.0，专业排名前10%。核心课程包括数据结构、算法设计、软件工程。获得校级优秀学生奖学金、ACM程序设计竞赛二等奖。

2. 就读于知名985高校计算机专业，学习成绩优异，具备扎实的计算机理论基础和编程能力。

3. 本科期间专业成绩优秀，多次获得奖学金，积极参与各类技术竞赛和项目实践。

4. 大学四年系统学习计算机相关课程，具备良好的理论基础和实践能力。

5. 在校期间担任学生干部，具备良好的组织协调能力和团队合作精神。`,

      projects: `你是一个专业的简历顾问。请根据用户提供的项目信息，生成5个优化的项目描述。

要求：
- 突出技术难点、个人贡献和具体成果
- 输出纯文本，不要使用任何格式符号
- 必须输出5个不同的版本

示例：
1. 电商管理系统（2023.06-2023.12）使用React + TypeScript + Node.js + MongoDB技术栈，负责前端架构设计和核心功能开发。项目成果用户转化率提升25%，系统响应速度提升40%。技术亮点实现了复杂的权限管理系统和实时数据同步。

2. 智能推荐平台团队项目，2023年完成。负责推荐算法的前端展示和用户交互设计。

3. 企业级管理系统开发，采用微服务架构，负责前端模块化设计和性能优化。

4. 移动端应用开发项目，使用React Native技术栈，实现跨平台兼容。

5. 开源项目贡献者，参与多个知名开源项目的开发和维护工作。`
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
        if (error.message.includes('网络')) {
          throw new Error('网络连接失败，请检查网络连接后重试')
        } else if (error.message.includes('API')) {
          throw new Error('AI服务暂时不可用，请稍后重试')
        } else if (error.message.includes('配置')) {
          throw new Error('AI配置有误，请检查配置后重试')
        }
      }
      
      throw new Error('AI生成失败，请重试或检查网络连接')
    }
  }

  /**
   * 生成流式AI建议
   */
  private async generateStreamingSuggestions(
    type: string,
    systemPrompt: string,
    userMessage: string,
    onStream: (content: string) => void
  ): Promise<string[]> {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: this.config!.provider,
        apiKey: this.config!.apiKey,
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
      })
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
      while (true) {
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
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return this.parseSuggestions(fullContent)
  }

  /**
   * 解析AI返回的建议
   */
  /**
   * 解析AI返回的建议内容
   * 支持markdown格式的内容解析
   */
  private parseSuggestions(content: string): string[] {
    // 清理内容，移除多余的空行
    const cleanContent = content.trim().replace(/\n\s*\n/g, '\n')
    
    // 尝试按数字列表分割 (1. 2. 或 1、 2、)
    const numberPattern = /(?:^|\n)(\d+)[.、]\s*/g
    const matches = Array.from(cleanContent.matchAll(numberPattern))
    
    if (matches.length >= 2) {
      const suggestions: string[] = []
      
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i]
        const nextMatch = matches[i + 1]
        
        const startIndex = currentMatch.index! + currentMatch[0].length
        const endIndex = nextMatch ? nextMatch.index! : cleanContent.length
        
        const suggestion = cleanContent.slice(startIndex, endIndex).trim()
        if (suggestion) {
          suggestions.push(suggestion)
        }
      }
      
      return suggestions.filter(s => s.length > 0)
    }

    // 尝试按换行分割，过滤空行和短行
    const lines = cleanContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 10) // 过滤掉太短的行
    
    if (lines.length >= 2) {
      return lines.map(line => line.replace(/^[-*•]\s*/, '').trim())
    }

    // 如果无法分割，返回整个内容
    return [cleanContent]
  }

  /**
   * 验证API配置
   */
  async validateConfig(config: AIConfig): Promise<{ isValid: boolean; message: string }> {
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
        const data = await response.json()
        if (data.success) {
          return { isValid: true, message: 'API配置验证成功' }
        } else {
          return { isValid: false, message: data.error || '验证失败' }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          isValid: false, 
          message: errorData.error || `验证失败: ${response.status}` 
        }
      }
    } catch (error) {
      return { 
        isValid: false, 
        message: error instanceof Error ? error.message : '网络连接失败' 
      }
    }
  }
}

// 导出单例实例
export const aiService = new AIService()