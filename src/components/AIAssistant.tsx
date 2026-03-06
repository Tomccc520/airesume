/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, Copy, Check, AlertCircle, RefreshCw, Wand2, Keyboard, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { aiService } from '@/services/aiService'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useLanguage } from '@/contexts/LanguageContext'

interface AIAssistantProps {
  type: 'summary' | 'experience' | 'skills' | 'education' | 'projects'
  currentContent?: string
  onClose: () => void
  onApply: (suggestion: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

/**
 * AI辅助组件
 * 提供智能简历内容优化和生成建议，支持Markdown格式显示
 * 支持快捷键操作和键盘导航
 */
export default function AIAssistant({ type, currentContent, onClose, onApply }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasUnappliedSuggestions, setHasUnappliedSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showKeyboardHints, setShowKeyboardHints] = useState(false)
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null)
  const [thinkingText, setThinkingText] = useState('AI 正在思考中...')
  const { t, locale } = useLanguage()
  
  // 批量操作状态
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())
  
  // 引用
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [streamingContent, isStreaming])

  // 思考状态文字轮播
  useEffect(() => {
    if (!isStreaming && !isLoading) return
    
    const texts = locale === 'zh' 
      ? ['AI 正在思考中...', '正在组织语言...', '正在优化表达...', '即将完成...']
      : ['AI is thinking...', 'Organizing content...', 'Refining expressions...', 'Almost done...']
    let index = 0
    
    const interval = setInterval(() => {
      index = (index + 1) % texts.length
      setThinkingText(texts[index])
    }, 2000)
    
    return () => clearInterval(interval)
  }, [isStreaming, isLoading, locale])

  /**
   * 获取内容类型的中文名称
   */
  const getContentTypeName = (type: string) => {
    const typeMap = locale === 'zh' ? {
      summary: '个人简介',
      experience: '工作经历',
      skills: '技能专长',
      education: '教育背景',
      projects: '项目经验'
    } : {
      summary: 'Summary',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects'
    }
    return typeMap[type as keyof typeof typeMap] || (locale === 'zh' ? '内容' : 'Content')
  }

  /**
   * 根据内容类型获取智能建议
   */
  const getQuickSuggestions = (type: string): string[] => {
    const suggestionMap = locale === 'zh' ? {
      summary: [
        '突出核心优势',
        '增加量化成果',
        '优化职业定位',
        '提升专业表达'
      ],
      experience: [
        '量化工作成果',
        '突出核心技能',
        '优化职责描述',
        '增加项目亮点'
      ],
      skills: [
        '分类整理技能',
        '突出核心技术',
        '增加熟练程度',
        '补充相关工具'
      ],
      education: [
        '突出学术成就',
        '增加相关课程',
        '补充实践经历',
        '优化表达方式'
      ],
      projects: [
        '突出技术栈',
        '量化项目成果',
        '优化项目描述',
        '增加核心亮点'
      ]
    } : {
      summary: [
        'Highlight core strengths',
        'Quantify achievements',
        'Refine career goals',
        'Improve expression'
      ],
      experience: [
        'Quantify results',
        'Highlight skills',
        'Refine duties',
        'Add highlights'
      ],
      skills: [
        'Categorize skills',
        'Highlight tech',
        'Add proficiency',
        'Add tools'
      ],
      education: [
        'Academic achievements',
        'Relevant courses',
        'Practical experience',
        'Improve expression'
      ],
      projects: [
        'Tech stack',
        'Project scale',
        'Refine description',
        'Core contributions'
      ]
    }
    return suggestionMap[type as keyof typeof suggestionMap] || (locale === 'zh' ? [
      '优化语言表达',
      '突出核心技能',
      '增加量化数据',
      '提升专业性'
    ] : [
      'Optimize language',
      'Highlight skills',
      'Quantify data',
      'Professionalism'
    ])
  }

  /**
   * 根据内容类型获取智能提示
   */
  const getSmartTip = (type: string): string => {
    const tipMap = locale === 'zh' ? {
      summary: '描述您的核心优势和职业目标，让HR快速了解您的价值',
      experience: '用数据说话，突出您的工作成果和核心技能',
      skills: '按重要性和熟练程度分类展示，突出与目标职位相关的技能',
      education: '突出学术成就、相关课程和实践经历',
      projects: '展示技术栈、项目规模和您的核心贡献'
    } : {
      summary: 'Describe your core strengths and career goals for HR.',
      experience: 'Use data to highlight your achievements and skills.',
      skills: 'Categorize by importance and proficiency.',
      education: 'Highlight achievements, courses and experience.',
      projects: 'Show tech stack, scale and contributions.'
    }
    return tipMap[type as keyof typeof tipMap] || (locale === 'zh' ? '让AI帮您优化内容，提升简历质量' : 'Let AI optimize your content.')
  }

  /**
   * 生成AI建议
   * 优化：增加更详细的错误处理和用户反馈
   */
  const generateSuggestions = async (userPrompt?: string, isRegenerate = false) => {
    const finalPrompt = userPrompt || prompt
    if (!finalPrompt.trim()) return

    if (isRegenerate) {
      setIsRegenerating(true)
      // 重新生成时清空之前的建议
      setSuggestions([])
    } else {
      setIsLoading(true)
      setSuggestions([])
    }
    
    setError(null)
    setIsStreaming(true)
    setStreamingContent('')
    setSelectedSuggestionIndex(-1) // 重置选中状态

    try {
      // 检查AI服务是否已配置
      if (!aiService.isConfigured()) {
        throw new Error(locale === 'zh' ? '请先在设置中配置AI服务' : 'Please configure AI service in settings first')
      }

      // 使用流式输出
      const newSuggestions = await aiService.generateSuggestions(
        type,
        finalPrompt,
        currentContent,
        (content) => {
          // 流式更新内容
          setStreamingContent(content)
        }
      )
      
      // 流式完成后，解析并设置最终建议
      if (newSuggestions.length === 0) {
        throw new Error(locale === 'zh' ? 'AI未能生成有效建议，请尝试调整您的需求描述' : 'AI failed to generate valid suggestions, please try adjusting your requirements')
      }
      
      setSuggestions(newSuggestions)
      // 标记有未应用的建议
      setHasUnappliedSuggestions(newSuggestions.length > 0)
      if (!userPrompt) {
        setPrompt('')
      }
    } catch (error) {
      console.error('生成建议失败:', error)
      
      // 提供更友好的错误信息
      let errorMessage = locale === 'zh' ? '生成建议失败，请稍后重试' : 'Failed to generate suggestions, please try again later'
      
      if (error instanceof Error) {
        if (error.message.includes('配置') || error.message.includes('configure')) {
          errorMessage = error.message
        } else if (error.message.includes('网络') || error.message.includes('network')) {
          errorMessage = locale === 'zh' ? '网络连接失败，请检查网络后重试' : 'Network connection failed, please check your network'
        } else if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
          errorMessage = locale === 'zh' ? 'AI服务认证失败，请检查API密钥配置' : 'AI service authentication failed, please check API key'
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMessage = locale === 'zh' ? '请求超时，请稍后重试' : 'Request timeout, please try again later'
        } else if (error.message.includes('未能生成') || error.message.includes('failed to generate')) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setIsRegenerating(false)
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // ESC 键关闭弹窗
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCloseClick()
      return
    }

    // Ctrl/Cmd + Enter 发送请求
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (prompt.trim()) {
        handleSendPrompt()
      }
      return
    }

    // Ctrl/Cmd + R 重新生成
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && suggestions.length > 0) {
      e.preventDefault()
      generateSuggestions(undefined, true)
      return
    }

    // 显示/隐藏键盘提示
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      setShowKeyboardHints(!showKeyboardHints)
      return
    }

    // 建议导航
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault()
        handleApplySuggestion(suggestions[selectedSuggestionIndex], selectedSuggestionIndex)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedSuggestionIndex >= 0) {
        e.preventDefault()
        handleCopySuggestion(suggestions[selectedSuggestionIndex], selectedSuggestionIndex)
      }
    }

    // 数字键快速选择建议
    if (suggestions.length > 0 && e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1
      if (index < suggestions.length) {
        e.preventDefault()
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + 数字键：复制建议
          handleCopySuggestion(suggestions[index], index)
        } else {
          // 数字键：应用建议
          handleApplySuggestion(suggestions[index], index)
        }
      }
    }
  }

  // 键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [prompt, suggestions, selectedSuggestionIndex, showKeyboardHints])

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 添加页面关闭提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading || isStreaming || isRegenerating || hasUnappliedSuggestions) {
        e.preventDefault()
        e.returnValue = '正在生成AI内容或有未应用的建议，确定要离开吗？'
        return '正在生成AI内容或有未应用的建议，确定要离开吗？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isLoading, isStreaming, isRegenerating, hasUnappliedSuggestions])

  /**
   * 处理弹窗背景点击事件
   */
  const handleBackdropClick = () => {
    // 如果正在生成内容或有未应用的建议，显示确认对话框
    if (isLoading || isStreaming || isRegenerating || hasUnappliedSuggestions) {
      setShowConfirmDialog(true)
    } else {
      onClose()
    }
  }

  /**
   * 处理关闭按钮点击事件
   */
  const handleCloseClick = () => {
    // 如果正在生成内容或有未应用的建议，显示确认对话框
    if (isLoading || isStreaming || isRegenerating || hasUnappliedSuggestions) {
      setShowConfirmDialog(true)
    } else {
      onClose()
    }
  }

  /**
   * 确认关闭对话框
   */
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  /**
   * 取消关闭对话框
   */
  const handleCancelClose = () => {
    setShowConfirmDialog(false)
  }

  /**
   * 处理发送请求
   */
  const handleSendPrompt = () => {
    if (!prompt.trim()) return
    generateSuggestions(prompt)
  }

  /**
   * 复制建议到剪贴板
   */
  const handleCopySuggestion = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 应用建议
   */
  const handleApplySuggestion = async (suggestion: string, index: number) => {
    setApplyingIndex(index)
    // 模拟应用延迟，展示成功动画
    await new Promise(resolve => setTimeout(resolve, 600))
    
    onApply(suggestion)
    // 应用建议后清除未应用标记
    setHasUnappliedSuggestions(false)
    setApplyingIndex(null)
    onClose()
  }

  /**
   * 切换建议选择状态
   */
  const toggleSuggestionSelection = (index: number) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSuggestions(newSelected)
  }

  /**
   * 全选/取消全选建议
   */
  const handleSelectAll = () => {
    if (selectedSuggestions.size === suggestions.length) {
      // 如果已全选，则取消全选
      setSelectedSuggestions(new Set())
    } else {
      // 否则全选
      const allIndices = new Set(suggestions.map((_, index) => index))
      setSelectedSuggestions(allIndices)
    }
  }

  /**
   * 批量复制选中的建议
   */
  const handleBatchCopy = async () => {
    if (selectedSuggestions.size === 0) return
    
    const selectedTexts = Array.from(selectedSuggestions)
      .sort((a, b) => a - b)
      .map(index => `${index + 1}. ${suggestions[index]}`)
      .join('\n\n')
    
    try {
      await navigator.clipboard.writeText(selectedTexts)
      // 显示复制成功提示
      setCopiedIndex(-1) // 使用特殊值表示批量复制
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('批量复制失败:', err)
    }
  }

  /**
   * 批量应用选中的建议
   */
  const handleBatchApply = () => {
    if (selectedSuggestions.size === 0) return
    
    const selectedTexts = Array.from(selectedSuggestions)
      .sort((a, b) => a - b)
      .map(index => suggestions[index])
      .join('\n\n')
    
    onApply(selectedTexts)
    setHasUnappliedSuggestions(false)
    onClose()
  }

  // 重置选择状态当建议更新时
  useEffect(() => {
    setSelectedSuggestions(new Set())
  }, [suggestions])

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI智能助手</h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                为您的{getContentTypeName(type)}提供专业建议和智能优化
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 键盘提示按钮 */}
            <button
              onClick={() => setShowKeyboardHints(!showKeyboardHints)}
              className={`p-2 rounded-lg transition-colors ${
                showKeyboardHints 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } hidden sm:block border border-transparent hover:border-gray-200`}
              title="键盘快捷键 (Ctrl/Cmd + /)"
            >
              <Keyboard className="h-5 w-5" />
            </button>
            <button
              onClick={handleCloseClick}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 键盘快捷键提示 */}
        {showKeyboardHints && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 hidden sm:block">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Keyboard className="w-4 h-4 mr-2 text-blue-500" />
              键盘快捷键
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-gray-500">关闭助手</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">Esc</kbd></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">发送请求</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">Ctrl+Enter</kbd></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">重新生成</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">Ctrl+R</kbd></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-gray-500">选择建议</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">↑↓</kbd></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">应用建议</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">1-9</kbd></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">复制建议</span> <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700">Ctrl+1-9</kbd></div>
              </div>
            </div>
          </div>
        )}
        
        {/* 智能提示 */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <p className="text-xs sm:text-sm text-blue-700 flex items-center font-medium">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-600" />
            </span>
            <span className="leading-relaxed">{getSmartTip(type)}</span>
          </p>
        </div>

        {/* 内容区域 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-gray-50">
          <div className="p-4 sm:p-6 space-y-6">
            {/* 当前内容显示 */}
            {currentContent && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 group hover:shadow-sm transition-all">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  当前内容
                </h3>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words pl-3.5 border-l-2 border-blue-100 group-hover:border-blue-300 transition-colors">
                  {currentContent}
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Wand2 className="w-4 h-4 mr-2 text-blue-500" />
                描述您的需求
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1 group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：优化这段经历，突出团队协作和领导力..."
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-4 group-hover:bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-400">↵</kbd>
                  </div>
                </div>
                <button
                  onClick={handleSendPrompt}
                  disabled={isLoading || isStreaming || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md"
                  title="发送请求 (Ctrl+Enter)"
                >
                  {isLoading || isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isLoading || isStreaming ? '生成中' : '开始生成'}</span>
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4">
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* 加载状态 */}
              {(isLoading || isRegenerating) && !streamingContent && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="inline-block mb-6 relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                      <Loader2 className="h-12 w-12 text-blue-600 relative z-10 animate-spin" />
                    </div>
                    <p className="text-gray-900 font-medium mb-4 text-lg">
                      {isRegenerating ? '正在重新生成建议...' : 'AI正在为您生成专业建议...'}
                    </p>
                    <div className="flex justify-center space-x-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI建议列表 / 流式输出 */}
              {(streamingContent || (suggestions.length > 0 && !isLoading && !isRegenerating)) && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      </div>
                      AI建议
                      {suggestions.length > 0 && (
                        <span className="ml-3 text-xs font-normal text-gray-500 hidden lg:inline-flex items-center bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                          <Keyboard className="w-3 h-3 mr-1" />
                          使用 ↑↓ 键导航，数字键快速选择
                        </span>
                      )}
                      {selectedSuggestions.size > 0 && (
                        <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                          已选择 {selectedSuggestions.size} 项
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => generateSuggestions(undefined, true)}
                        disabled={isRegenerating || isStreaming}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 bg-white hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="重新生成 (Ctrl+R)"
                      >
                        {isRegenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline font-medium">{isRegenerating ? '重新生成中...' : '重新生成'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 批量操作工具栏 */}
                  {suggestions.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 p-3 bg-white border border-gray-200 rounded-xl space-y-2 sm:space-y-0 shadow-sm">
                      <div className="flex items-center space-x-3 pl-1">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            selectedSuggestions.size === suggestions.length && suggestions.length > 0 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'bg-white border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {selectedSuggestions.size === suggestions.length && suggestions.length > 0 && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                            <input
                              type="checkbox"
                              checked={selectedSuggestions.size === suggestions.length && suggestions.length > 0}
                              onChange={handleSelectAll}
                              className="hidden"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {selectedSuggestions.size === suggestions.length && suggestions.length > 0 ? '取消全选' : '全选'}
                          </span>
                        </label>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div>
                        <span className="text-xs font-medium text-gray-500">
                          共 {suggestions.length} 项建议
                        </span>
                      </div>
                      
                      {selectedSuggestions.size > 0 && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleBatchCopy}
                            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            title="批量复制选中建议"
                          >
                            {copiedIndex === -1 ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-600 font-medium">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>批量复制</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleBatchApply}
                            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
                            title="批量应用选中建议"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>批量应用</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* 流式输出内容显示 */}
                    {isStreaming && streamingContent && (
                      <div className="bg-white/80 backdrop-blur-md border border-indigo-200/60 rounded-xl p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse"></div>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100/80 pb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                            <span className="ml-2 text-sm text-gray-600 font-medium">{thinkingText}</span>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-sm text-gray-700">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5 text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 text-sm">{children}</ol>,
                              li: ({ children }) => <li className="text-gray-700 text-sm pl-1 marker:text-indigo-400">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">{children}</strong>,
                              em: ({ children }) => <em className="italic text-purple-600">{children}</em>,
                              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 border border-gray-200">{children}</code>,
                            }}
                          >
                            {streamingContent}
                          </ReactMarkdown>
                          <span className="inline-block w-2 h-5 bg-indigo-600 ml-1 align-middle rounded-full animate-pulse" />
                        </div>
                      </div>
                    )}
                    
                    {/* 最终建议显示 */}
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`bg-white/70 backdrop-blur-sm border rounded-xl p-4 sm:p-5 transition-colors group ${
                          selectedSuggestionIndex === index 
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20' 
                            : selectedSuggestions.has(index)
                            ? 'border-indigo-300 bg-indigo-50/30'
                            : 'border-gray-200/60 hover:border-indigo-300 hover:bg-white/90'
                        }`}
                      >
                        <div className="flex items-start space-x-4 mb-3">
                          {/* 复选框 */}
                          <label className="flex items-center cursor-pointer mt-1 group/checkbox">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              selectedSuggestions.has(index)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'bg-white border-gray-300 group-hover/checkbox:border-indigo-400'
                            }`}>
                              {selectedSuggestions.has(index) && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                              <input
                                type="checkbox"
                                checked={selectedSuggestions.has(index)}
                                onChange={() => toggleSuggestionSelection(index)}
                                className="hidden"
                              />
                            </div>
                          </label>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-700 leading-relaxed break-words font-medium">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                  code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 border border-gray-200">{children}</code>,
                                  strong: ({ children }) => <strong className="font-bold text-indigo-700">{children}</strong>
                                }}
                              >
                                {suggestion}
                              </ReactMarkdown>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <span className="text-xs font-mono text-gray-400 bg-gray-100/80 px-2 py-1 rounded-md border border-gray-200/50">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 ml-9 pt-2 border-t border-gray-100/80">
                          <button
                            onClick={() => handleApplySuggestion(suggestion, index)}
                            disabled={applyingIndex !== null}
                            className={`flex items-center justify-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-colors flex-1 sm:flex-none ${
                              applyingIndex === index 
                                ? 'bg-indigo-500 text-white cursor-wait' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                            }`}
                            title={`应用建议 (${index + 1})`}
                          >
                            {applyingIndex === index ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Wand2 className="w-3.5 h-3.5" />
                            )}
                            <span className="font-medium">{applyingIndex === index ? '应用中...' : '应用'}</span>
                          </button>
                          <button
                            onClick={() => handleCopySuggestion(suggestion, index)}
                            className="flex items-center justify-center space-x-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex-1 sm:flex-none bg-white"
                            title={`复制建议 (Ctrl+${index + 1})`}
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-600 font-medium">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="font-medium">复制</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 快速建议按钮 */}
              {suggestions.length === 0 && !isLoading && !isRegenerating && !isStreaming && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mr-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    </div>
                    智能建议
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getQuickSuggestions(type).map((quickPrompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPrompt(quickPrompt)
                          generateSuggestions(quickPrompt)
                        }}
                        className="p-4 text-left border border-gray-200/60 rounded-xl hover:border-indigo-300 hover:bg-white/90 transition-colors group bg-white/60 backdrop-blur-sm relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 leading-relaxed block relative z-10">
                          {quickPrompt}
                        </span>
                        <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-indigo-500 font-medium">点击立即生成</span>
                          <Wand2 className="w-3 h-3 ml-1 text-indigo-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>


      {/* 确认关闭对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="确认关闭"
        message={
          isLoading || isStreaming || isRegenerating
            ? "AI正在生成内容，确定要关闭吗？关闭后生成的内容将会丢失。"
            : hasUnappliedSuggestions
            ? "您有未应用的AI建议，确定要关闭吗？关闭后建议将会丢失。"
            : "确定要关闭AI助手吗？"
        }
        confirmText="确定关闭"
        cancelText={
          isLoading || isStreaming || isRegenerating
            ? "继续生成"
            : hasUnappliedSuggestions
            ? "继续编辑"
            : "取消"
        }
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        type="warning"
      />
    </div>
  )
}