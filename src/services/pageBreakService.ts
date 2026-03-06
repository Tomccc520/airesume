/**
 * @file services/pageBreakService.ts
 * @description 分页检测服务，负责检测内容块和计算最佳分页位置，避免在段落、列表项、标题与内容之间分页
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

/**
 * 分页配置接口
 */
export interface PageBreakConfig {
  /** 页面高度（像素） */
  pageHeight: number
  /** 页边距（像素） */
  margin: number
  /** 最小孤行高度 - 避免页面底部只有很少内容 */
  minOrphanHeight: number
  /** 是否启用智能分页 */
  smartBreak?: boolean
  /** 标题保护高度（确保标题后有足够内容） */
  titleProtectionHeight?: number
  /** 列表项最小保留数量 */
  minListItemsPerPage?: number
}

/**
 * 内容块类型
 */
export type ContentBlockType = 'section-header' | 'section-content' | 'list-item' | 'paragraph'

/**
 * 内容块接口
 */
export interface ContentBlock {
  /** 元素 */
  element: HTMLElement
  /** 块类型 */
  type: ContentBlockType
  /** 高度 */
  height: number
  /** 是否可分割 */
  splittable: boolean
  /** 元素顶部位置（相对于容器） */
  top: number
  /** 元素底部位置（相对于容器） */
  bottom: number
  /** 所属模块标题（用于标题重复） */
  sectionTitle?: string
}

/**
 * 分页结果接口
 */
export interface PageBreakResult {
  /** 分页位置（像素） */
  breakPositions: number[]
  /** 总页数 */
  totalPages: number
  /** 被分割的内容块 */
  splitBlocks: ContentBlock[]
  /** 每页的内容高度 */
  pageHeights: number[]
}

/**
 * 默认分页配置
 */
export const DEFAULT_PAGE_BREAK_CONFIG: PageBreakConfig = {
  pageHeight: 1123, // A4 高度 (297mm at 96 DPI)
  margin: 40,       // 40px 页边距
  minOrphanHeight: 80, // 最小孤行高度
  smartBreak: true,    // 启用智能分页
  titleProtectionHeight: 100, // 标题保护高度
  minListItemsPerPage: 2 // 每页最少保留 2 个列表项
}

/**
 * 分页检测服务类
 * 
 * 负责检测内容块和计算最佳分页位置，确保：
 * - 不在段落中间分页
 * - 不在列表项中间分页
 * - 不在标题与其内容之间分页
 * - 优先在模块边界分页
 */
export class PageBreakService {
  /**
   * 检测最佳分页位置
   * 满足需求 2.1: 自动检测最佳分页位置
   * 满足需求 2.2: 避免在段落中间、列表项中间、标题与内容之间分页
   * @param container - 包含简历内容的容器元素
   * @param config - 分页配置
   * @returns 分页结果
   */
  detectBreakPositions(container: HTMLElement, config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG): PageBreakResult {
    // 获取所有内容块
    const blocks = this.detectContentBlocks(container)
    
    // 计算可用页面高度（减去上下边距）
    const availableHeight = config.pageHeight - (config.margin * 2)
    
    // 计算分页位置
    const breakPositions: number[] = []
    const splitBlocks: ContentBlock[] = []
    const pageHeights: number[] = []
    
    let currentPageStart = 0
    let currentPageHeight = 0
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const blockRelativeTop = block.top - currentPageStart
      const blockRelativeBottom = block.bottom - currentPageStart
      
      // 检查当前块是否会超出当前页面
      if (blockRelativeBottom > availableHeight) {
        // 需要分页
        let suggestedBreakPosition: number
        
        if (config.smartBreak !== false) {
          // 使用智能分页算法
          suggestedBreakPosition = this.getSmartBreakPosition(
            currentPageStart + availableHeight,
            blocks,
            config,
            i
          )
        } else {
          suggestedBreakPosition = this.getSuggestedBreakPosition(
            currentPageStart + availableHeight,
            blocks,
            config
          )
        }
        
        // 应用标题保护逻辑
        suggestedBreakPosition = this.applyTitleProtection(
          suggestedBreakPosition,
          blocks,
          config
        )
        
        // 检查是否有块被分割
        const splitBlock = this.findSplitBlock(blocks, suggestedBreakPosition)
        if (splitBlock) {
          splitBlocks.push(splitBlock)
        }
        
        // 记录分页位置
        breakPositions.push(suggestedBreakPosition)
        pageHeights.push(suggestedBreakPosition - currentPageStart)
        
        // 更新当前页面起始位置
        currentPageStart = suggestedBreakPosition
        currentPageHeight = 0
      }
      
      currentPageHeight = block.bottom - currentPageStart
    }
    
    // 记录最后一页的高度
    if (blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1]
      pageHeights.push(lastBlock.bottom - currentPageStart)
    }
    
    return {
      breakPositions,
      totalPages: breakPositions.length + 1,
      splitBlocks,
      pageHeights
    }
  }

  /**
   * 智能分页位置检测
   * 综合考虑多种因素选择最佳分页位置
   * @param targetPosition - 目标分页位置
   * @param blocks - 所有内容块
   * @param config - 分页配置
   * @param currentBlockIndex - 当前处理的块索引
   * @returns 最佳分页位置
   */
  private getSmartBreakPosition(
    targetPosition: number,
    blocks: ContentBlock[],
    config: PageBreakConfig,
    currentBlockIndex: number
  ): number {
    const candidates: Array<{ position: number; score: number; reason: string }> = []
    const searchRange = config.minOrphanHeight * 3 // 搜索范围
    
    // 收集候选分页位置
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      
      // 检查块顶部是否在搜索范围内
      if (Math.abs(block.top - targetPosition) <= searchRange) {
        const score = this.calculateBreakScore(block.top, block, blocks, config, 'top')
        candidates.push({
          position: block.top,
          score,
          reason: `${block.type} 顶部`
        })
      }
      
      // 检查块底部是否在搜索范围内（仅对可分割块）
      if (block.splittable && Math.abs(block.bottom - targetPosition) <= searchRange) {
        const score = this.calculateBreakScore(block.bottom, block, blocks, config, 'bottom')
        candidates.push({
          position: block.bottom,
          score,
          reason: `${block.type} 底部`
        })
      }
    }
    
    // 如果没有候选位置，返回目标位置
    if (candidates.length === 0) {
      return targetPosition
    }
    
    // 选择得分最高的位置
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].position
  }

  /**
   * 计算分页位置的得分
   * 得分越高表示该位置越适合分页
   * @param position - 候选分页位置
   * @param block - 相关的内容块
   * @param allBlocks - 所有内容块
   * @param config - 分页配置
   * @param boundary - 边界类型（top 或 bottom）
   * @returns 得分
   */
  private calculateBreakScore(
    position: number,
    block: ContentBlock,
    allBlocks: ContentBlock[],
    config: PageBreakConfig,
    boundary: 'top' | 'bottom'
  ): number {
    let score = 100 // 基础分
    
    // 1. 块类型权重
    switch (block.type) {
      case 'section-header':
        // 在标题前分页得分高（标题应该在新页面开始）
        if (boundary === 'top') {
          score += 50
        } else {
          // 不应该在标题后立即分页
          score -= 100
        }
        break
      case 'section-content':
        // 在章节内容边界分页得分中等
        score += 20
        break
      case 'list-item':
        // 在列表项边界分页得分较低（尽量保持列表完整）
        score += 10
        break
      case 'paragraph':
        // 在段落边界分页得分中等
        score += 15
        break
    }
    
    // 2. 检查是否会分割不可分割的块
    const wouldSplitUnsplittable = allBlocks.some(b => 
      !b.splittable && position > b.top && position < b.bottom
    )
    if (wouldSplitUnsplittable) {
      score -= 200 // 严重惩罚
    }
    
    // 3. 检查标题保护
    const titleProtectionHeight = config.titleProtectionHeight || 100
    const nearbyHeader = allBlocks.find(b => 
      b.type === 'section-header' && 
      position > b.bottom && 
      position - b.bottom < titleProtectionHeight
    )
    if (nearbyHeader) {
      // 标题后内容太少，不适合分页
      score -= 80
    }
    
    // 4. 检查列表项保留
    const minListItems = config.minListItemsPerPage || 2
    const listItemsBeforeBreak = allBlocks.filter(b => 
      b.type === 'list-item' && b.bottom <= position
    ).length
    const listItemsAfterBreak = allBlocks.filter(b => 
      b.type === 'list-item' && b.top >= position
    ).length
    
    if (listItemsBeforeBreak > 0 && listItemsBeforeBreak < minListItems) {
      score -= 30 // 页面底部列表项太少
    }
    if (listItemsAfterBreak > 0 && listItemsAfterBreak < minListItems) {
      score -= 30 // 下一页列表项太少
    }
    
    return score
  }

  /**
   * 应用标题保护逻辑
   * 确保标题后有足够的内容，避免标题孤立在页面底部
   * @param breakPosition - 原始分页位置
   * @param blocks - 所有内容块
   * @param config - 分页配置
   * @returns 调整后的分页位置
   */
  private applyTitleProtection(
    breakPosition: number,
    blocks: ContentBlock[],
    config: PageBreakConfig
  ): number {
    const titleProtectionHeight = config.titleProtectionHeight || 100
    
    // 查找分页位置之前最近的标题
    const headersBeforeBreak = blocks.filter(b => 
      b.type === 'section-header' && b.bottom <= breakPosition
    )
    
    if (headersBeforeBreak.length === 0) {
      return breakPosition
    }
    
    const lastHeader = headersBeforeBreak[headersBeforeBreak.length - 1]
    const contentAfterHeader = breakPosition - lastHeader.bottom
    
    // 如果标题后的内容太少，将分页位置移到标题之前
    if (contentAfterHeader < titleProtectionHeight) {
      return lastHeader.top
    }
    
    return breakPosition
  }

  /**
   * 检测容器中的所有内容块
   * @param container - 容器元素
   * @returns 内容块数组
   */
  detectContentBlocks(container: HTMLElement): ContentBlock[] {
    const blocks: ContentBlock[] = []
    const containerRect = container.getBoundingClientRect()
    const containerTop = containerRect.top + window.scrollY
    
    // 查找所有可能的内容块
    const sectionHeaders = container.querySelectorAll('[data-section-header], .section-header, h2, h3')
    const sectionContents = container.querySelectorAll('[data-section-content], .section-content')
    const listItems = container.querySelectorAll('[data-list-item], .list-item, li')
    const paragraphs = container.querySelectorAll('[data-paragraph], .paragraph, p')
    
    // 处理章节标题
    sectionHeaders.forEach(element => {
      if (element instanceof HTMLElement) {
        const block = this.createContentBlock(element, 'section-header', containerTop)
        if (block) blocks.push(block)
      }
    })
    
    // 处理章节内容
    sectionContents.forEach(element => {
      if (element instanceof HTMLElement) {
        const block = this.createContentBlock(element, 'section-content', containerTop)
        if (block) blocks.push(block)
      }
    })
    
    // 处理列表项
    listItems.forEach(element => {
      if (element instanceof HTMLElement) {
        const block = this.createContentBlock(element, 'list-item', containerTop)
        if (block) blocks.push(block)
      }
    })
    
    // 处理段落
    paragraphs.forEach(element => {
      if (element instanceof HTMLElement) {
        const block = this.createContentBlock(element, 'paragraph', containerTop)
        if (block) blocks.push(block)
      }
    })
    
    // 如果没有找到特定的内容块，使用直接子元素
    if (blocks.length === 0) {
      const children = container.children
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child instanceof HTMLElement) {
          const type = this.inferBlockType(child)
          const block = this.createContentBlock(child, type, containerTop)
          if (block) blocks.push(block)
        }
      }
    }
    
    // 按位置排序
    blocks.sort((a, b) => a.top - b.top)
    
    // 去重（同一元素可能被多次匹配）
    return this.deduplicateBlocks(blocks)
  }

  /**
   * 创建内容块对象
   * @param element - HTML 元素
   * @param type - 块类型
   * @param containerTop - 容器顶部位置
   * @returns 内容块对象或 null
   */
  private createContentBlock(
    element: HTMLElement,
    type: ContentBlockType,
    containerTop: number
  ): ContentBlock | null {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + window.scrollY - containerTop
    const elementBottom = rect.bottom + window.scrollY - containerTop
    const height = rect.height
    
    // 忽略高度为 0 的元素
    if (height <= 0) return null
    
    // 获取所属模块标题
    const sectionTitle = this.findSectionTitle(element)
    
    return {
      element,
      type,
      height,
      splittable: this.isBlockSplittable(type),
      top: elementTop,
      bottom: elementBottom,
      sectionTitle
    }
  }

  /**
   * 推断元素的块类型
   * @param element - HTML 元素
   * @returns 块类型
   */
  private inferBlockType(element: HTMLElement): ContentBlockType {
    const tagName = element.tagName.toLowerCase()
    const className = element.className.toLowerCase()
    
    // 根据标签名推断
    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      return 'section-header'
    }
    if (tagName === 'li') {
      return 'list-item'
    }
    if (tagName === 'p') {
      return 'paragraph'
    }
    
    // 根据类名推断
    if (className.includes('header') || className.includes('title')) {
      return 'section-header'
    }
    if (className.includes('item') || className.includes('entry')) {
      return 'list-item'
    }
    
    // 默认为章节内容
    return 'section-content'
  }

  /**
   * 判断块是否可分割
   * @param type - 块类型
   * @returns 是否可分割
   */
  private isBlockSplittable(type: ContentBlockType): boolean {
    // 标题和列表项不可分割
    // 段落和章节内容在必要时可以分割（但应尽量避免）
    switch (type) {
      case 'section-header':
        return false
      case 'list-item':
        return false
      case 'paragraph':
        return true // 段落可以分割，但会被标记
      case 'section-content':
        return true
      default:
        return false
    }
  }

  /**
   * 查找元素所属的模块标题
   * @param element - HTML 元素
   * @returns 模块标题文本或 undefined
   */
  private findSectionTitle(element: HTMLElement): string | undefined {
    // 使用递归辅助函数来避免 TypeScript 循环引用问题
    return this.searchForSectionTitle(element)
  }

  /**
   * 递归搜索模块标题
   * @param el - 当前元素
   * @returns 模块标题文本或 undefined
   */
  private searchForSectionTitle(el: HTMLElement | null): string | undefined {
    if (el === null) {
      return undefined
    }

    // 检查前一个兄弟元素是否是标题
    const prevSibling = el.previousElementSibling
    if (prevSibling instanceof HTMLElement) {
      const siblingTagName = prevSibling.tagName.toLowerCase()
      if (siblingTagName === 'h1' || siblingTagName === 'h2' || siblingTagName === 'h3') {
        return prevSibling.textContent?.trim()
      }
      if (prevSibling.classList.contains('section-header') || 
          prevSibling.hasAttribute('data-section-header')) {
        return prevSibling.textContent?.trim()
      }
    }
    
    // 检查父元素的第一个子元素是否是标题
    const parent = el.parentElement
    if (parent !== null) {
      const firstChild = parent.firstElementChild
      if (firstChild instanceof HTMLElement && firstChild !== el) {
        const childTagName = firstChild.tagName.toLowerCase()
        if (childTagName === 'h1' || childTagName === 'h2' || childTagName === 'h3') {
          return firstChild.textContent?.trim()
        }
      }
    }
    
    // 继续向上搜索
    return this.searchForSectionTitle(el.parentElement)
  }

  /**
   * 去重内容块（基于元素引用）
   * @param blocks - 内容块数组
   * @returns 去重后的内容块数组
   */
  private deduplicateBlocks(blocks: ContentBlock[]): ContentBlock[] {
    const seen = new Set<HTMLElement>()
    return blocks.filter(block => {
      if (seen.has(block.element)) {
        return false
      }
      seen.add(block.element)
      return true
    })
  }

  /**
   * 检查内容块是否会被分割
   * @param block - 内容块
   * @param breakPosition - 分页位置（像素）
   * @returns 是否会被分割
   */
  checkBlockIntegrity(block: ContentBlock, breakPosition: number): boolean {
    // 如果分页位置在块的范围内，则块会被分割
    return breakPosition > block.top && breakPosition < block.bottom
  }

  /**
   * 获取建议的分页位置
   * @param currentPosition - 当前位置（理想分页位置）
   * @param blocks - 所有内容块
   * @param config - 分页配置
   * @returns 建议的分页位置
   */
  getSuggestedBreakPosition(
    currentPosition: number,
    blocks: ContentBlock[],
    config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG
  ): number {
    // 查找当前位置附近的块
    const nearbyBlocks = blocks.filter(block => 
      Math.abs(block.top - currentPosition) < config.pageHeight / 2 ||
      Math.abs(block.bottom - currentPosition) < config.pageHeight / 2
    )
    
    // 优先级 1: 在模块边界分页（章节之间）
    const sectionBoundary = this.findSectionBoundary(nearbyBlocks, currentPosition, config)
    if (sectionBoundary !== null) {
      return sectionBoundary
    }
    
    // 优先级 2: 在列表项之间分页
    const listItemBoundary = this.findListItemBoundary(nearbyBlocks, currentPosition, config)
    if (listItemBoundary !== null) {
      return listItemBoundary
    }
    
    // 优先级 3: 在段落之间分页
    const paragraphBoundary = this.findParagraphBoundary(nearbyBlocks, currentPosition, config)
    if (paragraphBoundary !== null) {
      return paragraphBoundary
    }
    
    // 优先级 4: 在任意块边界分页
    const anyBoundary = this.findAnyBlockBoundary(nearbyBlocks, currentPosition, config)
    if (anyBoundary !== null) {
      return anyBoundary
    }
    
    // 如果没有找到合适的边界，返回当前位置
    return currentPosition
  }

  /**
   * 查找章节边界
   * @param blocks - 内容块数组
   * @param targetPosition - 目标位置
   * @param config - 分页配置
   * @returns 章节边界位置或 null
   */
  private findSectionBoundary(
    blocks: ContentBlock[],
    targetPosition: number,
    config: PageBreakConfig
  ): number | null {
    // 查找章节标题
    const sectionHeaders = blocks.filter(b => b.type === 'section-header')
    
    for (const header of sectionHeaders) {
      // 在标题之前分页（不要把标题留在页面底部）
      if (header.top > targetPosition - config.minOrphanHeight && 
          header.top < targetPosition + config.minOrphanHeight) {
        return header.top
      }
    }
    
    return null
  }

  /**
   * 查找列表项边界
   * @param blocks - 内容块数组
   * @param targetPosition - 目标位置
   * @param config - 分页配置
   * @returns 列表项边界位置或 null
   */
  private findListItemBoundary(
    blocks: ContentBlock[],
    targetPosition: number,
    config: PageBreakConfig
  ): number | null {
    // 查找列表项
    const listItems = blocks.filter(b => b.type === 'list-item')
    
    // 找到最接近目标位置的列表项边界
    let bestBoundary: number | null = null
    let bestDistance = Infinity
    
    for (const item of listItems) {
      // 检查列表项顶部
      const topDistance = Math.abs(item.top - targetPosition)
      if (topDistance < bestDistance && item.top <= targetPosition) {
        bestDistance = topDistance
        bestBoundary = item.top
      }
      
      // 检查列表项底部
      const bottomDistance = Math.abs(item.bottom - targetPosition)
      if (bottomDistance < bestDistance && item.bottom <= targetPosition) {
        bestDistance = bottomDistance
        bestBoundary = item.bottom
      }
    }
    
    // 只有当边界在合理范围内时才返回
    if (bestBoundary !== null && bestDistance < config.minOrphanHeight) {
      return bestBoundary
    }
    
    return null
  }

  /**
   * 查找段落边界
   * @param blocks - 内容块数组
   * @param targetPosition - 目标位置
   * @param config - 分页配置
   * @returns 段落边界位置或 null
   */
  private findParagraphBoundary(
    blocks: ContentBlock[],
    targetPosition: number,
    config: PageBreakConfig
  ): number | null {
    // 查找段落
    const paragraphs = blocks.filter(b => b.type === 'paragraph')
    
    // 找到最接近目标位置的段落边界
    let bestBoundary: number | null = null
    let bestDistance = Infinity
    
    for (const para of paragraphs) {
      // 优先在段落之间分页，而不是段落中间
      const topDistance = Math.abs(para.top - targetPosition)
      if (topDistance < bestDistance && para.top <= targetPosition) {
        bestDistance = topDistance
        bestBoundary = para.top
      }
    }
    
    if (bestBoundary !== null && bestDistance < config.minOrphanHeight * 2) {
      return bestBoundary
    }
    
    return null
  }

  /**
   * 查找任意块边界
   * @param blocks - 内容块数组
   * @param targetPosition - 目标位置
   * @param config - 分页配置
   * @returns 块边界位置或 null
   */
  private findAnyBlockBoundary(
    blocks: ContentBlock[],
    targetPosition: number,
    config: PageBreakConfig
  ): number | null {
    // 找到最接近目标位置且不会分割不可分割块的边界
    let bestBoundary: number | null = null
    let bestDistance = Infinity
    
    for (const block of blocks) {
      // 跳过不可分割的块
      if (!block.splittable) {
        // 对于不可分割的块，只能在其边界分页
        if (block.top <= targetPosition && block.bottom > targetPosition) {
          // 当前位置会分割这个块，需要调整
          const topDistance = targetPosition - block.top
          const bottomDistance = block.bottom - targetPosition
          
          if (topDistance < bottomDistance && topDistance < bestDistance) {
            bestDistance = topDistance
            bestBoundary = block.top
          } else if (bottomDistance < bestDistance) {
            bestDistance = bottomDistance
            bestBoundary = block.bottom
          }
        }
      } else {
        // 对于可分割的块，优先在边界分页
        const topDistance = Math.abs(block.top - targetPosition)
        if (topDistance < bestDistance && block.top <= targetPosition) {
          bestDistance = topDistance
          bestBoundary = block.top
        }
      }
    }
    
    return bestBoundary
  }

  /**
   * 查找被分页位置分割的块
   * @param blocks - 内容块数组
   * @param breakPosition - 分页位置
   * @returns 被分割的块或 undefined
   */
  private findSplitBlock(blocks: ContentBlock[], breakPosition: number): ContentBlock | undefined {
    return blocks.find(block => this.checkBlockIntegrity(block, breakPosition))
  }

  /**
   * 计算内容的总高度
   * @param container - 容器元素
   * @returns 总高度（像素）
   */
  calculateTotalHeight(container: HTMLElement): number {
    return container.scrollHeight
  }

  /**
   * 判断内容是否需要分页
   * @param container - 容器元素
   * @param config - 分页配置
   * @returns 是否需要分页
   */
  needsPageBreak(container: HTMLElement, config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG): boolean {
    const totalHeight = this.calculateTotalHeight(container)
    const availableHeight = config.pageHeight - (config.margin * 2)
    return totalHeight > availableHeight
  }

  /**
   * 获取分页预览信息
   * @param container - 容器元素
   * @param config - 分页配置
   * @returns 分页预览信息
   */
  getPageBreakPreview(container: HTMLElement, config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG): {
    totalHeight: number
    pageCount: number
    breakPositions: number[]
    warnings: string[]
  } {
    const totalHeight = this.calculateTotalHeight(container)
    const result = this.detectBreakPositions(container, config)
    
    const warnings: string[] = []
    
    // 检查是否有被分割的块
    if (result.splitBlocks.length > 0) {
      result.splitBlocks.forEach(block => {
        if (!block.splittable) {
          warnings.push(`警告：${block.type} 类型的内容块可能被分割`)
        }
      })
    }
    
    return {
      totalHeight,
      pageCount: result.totalPages,
      breakPositions: result.breakPositions,
      warnings
    }
  }
}

// 导出单例实例
export const pageBreakService = new PageBreakService()

export default PageBreakService
