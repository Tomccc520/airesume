/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-01
 */

export interface ParseAISuggestionsOptions {
  originalContent?: string
  maxSuggestions?: number
}

const NUMBERED_ITEM_PATTERN = /(?:^|\n)\s*(?:\(?\d+[.、)]\s*|\d+\)\s*)/g
const VERSION_HEADING_PATTERN = /(?:^|\n)\s*(?:(?:候选)?版本|方案|variant|version)\s*(?:\d+|[一二三四五六七八九十]+)\s*[:：.、-]\s*/gi
const MARKDOWN_ITEM_PATTERN = /(?:^|\n)\s*[-*•]\s+/g

/**
 * 规范化 AI 返回文本
 * 清理代码围栏、换行符和异常空行，避免格式噪音影响候选拆分。
 */
function normalizeResponseContent(content: string): string {
  return content
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*```(?:text|markdown|md)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
}

/**
 * 按列表标记拆分候选
 * 同时支持数字编号、中文版本标题和 Markdown 列表格式。
 */
function splitByMarker(content: string, pattern: RegExp): string[] {
  const matches = Array.from(content.matchAll(pattern))
  if (matches.length === 0) {
    return []
  }

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1]
    const startIndex = (match.index ?? 0) + match[0].length
    const endIndex = nextMatch?.index ?? content.length
    return content.slice(startIndex, endIndex).trim()
  })
}

/**
 * 清理单条候选的外层格式
 * 仅移除列表符号和多余引号，不改写候选正文。
 */
function cleanSuggestion(value: string): string {
  return value
    .replace(/^\s*```(?:text|markdown|md)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .replace(/^\s*[-*•]+\s*/, '')
    .replace(/^\s*[“”"']+|[“”"']+\s*$/g, '')
    .trim()
}

/**
 * 规范化候选比较文本
 * 用于识别重复候选和模型原样回显的原始内容。
 */
function normalizeComparableContent(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * 判断候选是否包含提示词或对话角色回显
 * 阻止 system/user/assistant 残片和生成指令被写回简历。
 */
function isPromptEcho(value: string): boolean {
  const promptEchoPatterns = [
    /(?:^|[\n"'`])\s*(?:system|user|assistant)\b\s*[:：-]?/i,
    /(?:当前内容|用户需求)\s*[:：]/,
    /(?:current content|user request)\s*[:：]/i,
    /请.{0,24}(?:生成|优化|重写).{0,24}(?:版本|建议|简历)/,
    /(?:generate|rewrite|optimize).{0,32}\b(?:variants?|versions?|suggestions?|resume)\b/i,
    /^(?:以下|下面).{0,24}(?:版本|建议)\s*[:：]?$/,
    /^(?:here are|below are).{0,24}(?:variants?|versions?|suggestions?)\s*:?$/i
  ]

  return promptEchoPatterns.some((pattern) => pattern.test(value))
}

/**
 * 选择最可靠的候选拆分结果
 * 优先使用带编号或版本标题的结构，最后才按段落和单行兜底。
 */
function extractSuggestionCandidates(content: string): string[] {
  const numberedItems = splitByMarker(content, NUMBERED_ITEM_PATTERN)
  if (numberedItems.length > 0) {
    return numberedItems
  }

  const versionItems = splitByMarker(content, VERSION_HEADING_PATTERN)
  if (versionItems.length > 0) {
    return versionItems
  }

  const markdownItems = splitByMarker(content, MARKDOWN_ITEM_PATTERN)
  if (markdownItems.length >= 2) {
    return markdownItems
  }

  const paragraphs = content.split(/\n\n+/).map((item) => item.trim()).filter(Boolean)
  if (paragraphs.length >= 2) {
    return paragraphs
  }

  const lines = content.split('\n').map((item) => item.trim()).filter(Boolean)
  return lines.length >= 2 ? lines : [content]
}

/**
 * 解析并校验 AI 优化候选
 * 过滤提示词回显、原文重复、过短文本和重复结果，保证写回简历的内容可用。
 */
export function parseAISuggestions(
  content: string,
  options: ParseAISuggestionsOptions = {}
): string[] {
  const cleanContent = normalizeResponseContent(content)
  if (!cleanContent) {
    return []
  }

  const originalContent = normalizeComparableContent(options.originalContent ?? '')
  const maxSuggestions = Math.max(1, options.maxSuggestions ?? 5)
  const seen = new Set<string>()
  const suggestions: string[] = []

  for (const candidate of extractSuggestionCandidates(cleanContent)) {
    const suggestion = cleanSuggestion(candidate)
    const comparable = normalizeComparableContent(suggestion)

    if (
      suggestion.length < 8 ||
      isPromptEcho(suggestion) ||
      (originalContent && comparable === originalContent) ||
      seen.has(comparable)
    ) {
      continue
    }

    seen.add(comparable)
    suggestions.push(suggestion)

    if (suggestions.length >= maxSuggestions) {
      break
    }
  }

  return suggestions
}
