/**
 * AI建议质量评估服务
 * 评估AI生成内容的质量，确保建议的有效性和专业性
 * 
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-01-27
 */

/**
 * 质量评分接口
 */
export interface QualityScore {
  overall: number // 总体评分 0-100
  clarity: number // 清晰度 0-100
  specificity: number // 具体性 0-100
  professionalism: number // 专业性 0-100
  actionOriented: number // 行动导向性 0-100
  quantifiable: number // 可量化性 0-100
  issues: string[] // 发现的问题
  suggestions: string[] // 改进建议
}

/**
 * AI建议质量检查器
 */
export class AIQualityChecker {
  /**
   * 评估内容质量
   */
  evaluateContent(content: string, type: 'summary' | 'experience' | 'skills' | 'education' | 'projects'): QualityScore {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // 评估各项指标
    const clarity = this.evaluateClarity(content, issues, suggestions)
    const specificity = this.evaluateSpecificity(content, issues, suggestions)
    const professionalism = this.evaluateProfessionalism(content, issues, suggestions)
    const actionOriented = this.evaluateActionOriented(content, type, issues, suggestions)
    const quantifiable = this.evaluateQuantifiable(content, issues, suggestions)
    
    // 计算总体评分
    const overall = Math.round(
      (clarity * 0.2 + specificity * 0.25 + professionalism * 0.2 + 
       actionOriented * 0.2 + quantifiable * 0.15)
    )
    
    return {
      overall,
      clarity,
      specificity,
      professionalism,
      actionOriented,
      quantifiable,
      issues,
      suggestions
    }
  }

  /**
   * 评估清晰度
   * 检查内容是否清晰易懂，没有歧义
   */
  private evaluateClarity(content: string, issues: string[], suggestions: string[]): number {
    let score = 100
    
    // 检查句子长度
    const sentences = content.split(/[。.!！?？]/).filter(s => s.trim())
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    
    if (avgLength > 100) {
      score -= 15
      issues.push('句子过长，可能影响阅读理解')
      suggestions.push('将长句拆分为多个短句，提高可读性')
    }
    
    // 检查是否有模糊表达
    const vagueWords = ['一些', '很多', '大量', '若干', '相关', '等等', 'some', 'many', 'various', 'etc']
    const vagueCount = vagueWords.filter(word => content.includes(word)).length
    
    if (vagueCount > 2) {
      score -= 10
      issues.push('包含较多模糊表达')
      suggestions.push('使用更具体的描述替代模糊词汇')
    }
    
    // 检查是否有重复内容
    const words = content.split(/\s+/)
    const uniqueWords = new Set(words)
    const repetitionRate = 1 - (uniqueWords.size / words.length)
    
    if (repetitionRate > 0.3) {
      score -= 10
      issues.push('内容重复度较高')
      suggestions.push('删除重复内容，使表达更简洁')
    }
    
    return Math.max(0, score)
  }

  /**
   * 评估具体性
   * 检查内容是否具体，有细节支撑
   */
  private evaluateSpecificity(content: string, issues: string[], suggestions: string[]): number {
    let score = 100
    
    // 检查是否包含数字
    const numberPattern = /\d+[%万千百十亿+\-]?/g
    const numbers = content.match(numberPattern)
    
    if (!numbers || numbers.length === 0) {
      score -= 30
      issues.push('缺少具体的数字和数据')
      suggestions.push('添加量化数据，如：提升30%、管理15人团队等')
    } else if (numbers.length < 2) {
      score -= 15
      issues.push('量化数据较少')
      suggestions.push('增加更多具体的数字来支撑描述')
    }
    
    // 检查是否包含具体的技术或工具名称
    const techPattern = /[A-Z][a-z]+(?:[A-Z][a-z]+)*|[a-z]+\.[a-z]+/g
    const techTerms = content.match(techPattern)
    
    if (!techTerms || techTerms.length < 2) {
      score -= 20
      issues.push('缺少具体的技术栈或工具名称')
      suggestions.push('明确列出使用的技术、框架和工具')
    }
    
    // 检查是否有具体的项目或产品名称
    const hasProjectName = /项目|系统|平台|产品|应用|project|system|platform|product|application/i.test(content)
    if (!hasProjectName) {
      score -= 10
      issues.push('建议添加具体的项目或产品名称')
      suggestions.push('说明具体负责的项目或产品')
    }
    
    return Math.max(0, score)
  }

  /**
   * 评估专业性
   * 检查内容是否专业，使用行业术语
   */
  private evaluateProfessionalism(content: string, issues: string[], suggestions: string[]): number {
    let score = 100
    
    // 检查是否有口语化表达
    const colloquialWords = ['很好', '非常好', '挺好', '还行', '不错', '很棒', 'very good', 'great', 'awesome']
    const colloquialCount = colloquialWords.filter(word => content.includes(word)).length
    
    if (colloquialCount > 0) {
      score -= 20
      issues.push('包含口语化表达')
      suggestions.push('使用更专业的术语和表达方式')
    }
    
    // 检查是否有第一人称
    const firstPersonPattern = /我|我们|我的|我们的|I|we|my|our/g
    const firstPersonCount = (content.match(firstPersonPattern) || []).length
    
    if (firstPersonCount > 3) {
      score -= 15
      issues.push('过多使用第一人称')
      suggestions.push('减少第一人称使用，采用客观描述')
    }
    
    // 检查是否有拼写错误（简单检查）
    const hasConsecutiveSpaces = /\s{2,}/.test(content)
    if (hasConsecutiveSpaces) {
      score -= 5
      issues.push('存在格式问题')
      suggestions.push('检查并修正格式错误')
    }
    
    return Math.max(0, score)
  }

  /**
   * 评估行动导向性
   * 检查是否使用强有力的动作词
   */
  private evaluateActionOriented(
    content: string, 
    type: string,
    issues: string[], 
    suggestions: string[]
  ): number {
    let score = 100
    
    // 对于经验和项目，检查动作词
    if (type === 'experience' || type === 'projects') {
      const actionWords = [
        '主导', '负责', '设计', '开发', '实现', '优化', '提升', '建立', '推动', '完成',
        'led', 'managed', 'designed', 'developed', 'implemented', 'optimized', 'improved', 
        'established', 'drove', 'completed', 'achieved', 'delivered'
      ]
      
      const hasActionWord = actionWords.some(word => content.includes(word))
      
      if (!hasActionWord) {
        score -= 30
        issues.push('缺少强有力的动作词')
        suggestions.push('使用动作词开头，如：主导、负责、设计、实现等')
      }
      
      // 检查是否有被动语态
      const passivePattern = /被|由|was|were|been/g
      const passiveCount = (content.match(passivePattern) || []).length
      
      if (passiveCount > 2) {
        score -= 15
        issues.push('过多使用被动语态')
        suggestions.push('改用主动语态，突出个人主导性')
      }
    }
    
    return Math.max(0, score)
  }

  /**
   * 评估可量化性
   * 检查是否包含可量化的成果
   */
  private evaluateQuantifiable(content: string, issues: string[], suggestions: string[]): number {
    let score = 100
    
    // 检查百分比
    const percentPattern = /\d+%/g
    const percentCount = (content.match(percentPattern) || []).length
    
    // 检查数量词
    const quantityPattern = /\d+[万千百十亿]?[人个项次]/g
    const quantityCount = (content.match(quantityPattern) || []).length
    
    // 检查时间相关
    const timePattern = /\d+[年月周天日小时分钟秒]/g
    const timeCount = (content.match(timePattern) || []).length
    
    const totalQuantifiable = percentCount + quantityCount + timeCount
    
    if (totalQuantifiable === 0) {
      score -= 40
      issues.push('完全缺少量化数据')
      suggestions.push('添加具体的数字、百分比、时间等量化指标')
    } else if (totalQuantifiable === 1) {
      score -= 20
      issues.push('量化数据不足')
      suggestions.push('增加更多量化指标来支撑成果')
    } else if (totalQuantifiable === 2) {
      score -= 10
      suggestions.push('可以添加更多量化数据使内容更有说服力')
    }
    
    // 检查是否有成果描述
    const resultWords = ['提升', '增长', '降低', '节省', '优化', '改进', 'improved', 'increased', 'reduced', 'saved']
    const hasResult = resultWords.some(word => content.includes(word))
    
    if (!hasResult) {
      score -= 20
      issues.push('缺少成果描述')
      suggestions.push('说明工作带来的具体成果和影响')
    }
    
    return Math.max(0, score)
  }

  /**
   * 批量评估多个建议
   */
  evaluateMultiple(suggestions: string[], type: 'summary' | 'experience' | 'skills' | 'education' | 'projects'): {
    scores: QualityScore[]
    bestIndex: number
    averageScore: number
  } {
    const scores = suggestions.map(s => this.evaluateContent(s, type))
    const bestIndex = scores.reduce((maxIdx, score, idx, arr) => 
      score.overall > arr[maxIdx].overall ? idx : maxIdx, 0
    )
    const averageScore = Math.round(
      scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
    )
    
    return { scores, bestIndex, averageScore }
  }

  /**
   * 获取质量等级
   */
  getQualityLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 90) {
      return {
        level: '优秀',
        color: 'green',
        description: '内容质量优秀，专业性强，建议直接使用'
      }
    } else if (score >= 75) {
      return {
        level: '良好',
        color: 'blue',
        description: '内容质量良好，可以使用，建议微调优化'
      }
    } else if (score >= 60) {
      return {
        level: '中等',
        color: 'yellow',
        description: '内容基本可用，建议根据提示进行优化'
      }
    } else {
      return {
        level: '待改进',
        color: 'red',
        description: '内容需要较大改进，建议重新生成或大幅修改'
      }
    }
  }

  /**
   * 生成改进建议摘要
   */
  generateImprovementSummary(score: QualityScore): string {
    const weakPoints: string[] = []
    
    if (score.clarity < 70) weakPoints.push('清晰度')
    if (score.specificity < 70) weakPoints.push('具体性')
    if (score.professionalism < 70) weakPoints.push('专业性')
    if (score.actionOriented < 70) weakPoints.push('行动导向性')
    if (score.quantifiable < 70) weakPoints.push('可量化性')
    
    if (weakPoints.length === 0) {
      return '内容质量优秀，无需改进'
    }
    
    return `建议重点改进：${weakPoints.join('、')}。${score.suggestions.slice(0, 3).join('；')}`
  }
}

// 导出单例
export const aiQualityChecker = new AIQualityChecker()

