import { useState, useCallback } from 'react'
import { ResumeData, Experience, Skill, Education, Project } from '@/types/resume'
import { AISuggestion } from '@/components/AISuggestionsModal'

interface UseAIAssistantProps {
  resumeData: ResumeData
  onUpdateResumeData: (data: ResumeData) => void
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
}

export function useAIAssistant({
  resumeData,
  onUpdateResumeData,
  showToast
}: UseAIAssistantProps) {
  const [suggestionsTitle, setSuggestionsTitle] = useState('')
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [currentSuggestions, setCurrentSuggestions] = useState<AISuggestion[]>([])
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)

  // AI优化功能 - 打开建议弹窗
  const handleAIOptimize = useCallback(async (type: string) => {
    setSuggestionsLoading(true)
    const sectionNames = {
      experience: '工作经历',
      skills: '技能',
      summary: '个人总结',
      education: '教育经历',
      projects: '项目经历'
    }
    type OptimizationSection = keyof typeof sectionNames
    
    const sectionName = sectionNames[type as keyof typeof sectionNames] || '内容'
    setSuggestionsTitle(`${sectionName}优化建议`)
    setShowSuggestionsModal(true)
    
    showToast(`正在生成${sectionName}优化建议...`, 'info')
    
    // 模拟AI优化生成建议
    setTimeout(() => {
      const optimizationSuggestions: Record<OptimizationSection, AISuggestion[]> = {
        experience: [
          {
            id: 'exp-1',
            content: '使用具体数字量化工作成果，如"提升系统性能30%"、"管理团队15人"等',
            type: 'improvement' as const,
            category: '量化成果'
          },
          {
            id: 'exp-2',
            content: '突出关键技能和成就，重点描述与目标职位相关的核心能力',
            type: 'optimization' as const,
            category: '技能匹配'
          },
          {
            id: 'exp-3',
            content: '使用行动词开头描述工作内容，如"负责"、"主导"、"优化"等',
            type: 'improvement' as const,
            category: '表达优化'
          }
        ],
        skills: [
          {
            id: 'skill-1',
            content: '添加当前热门技术栈，如TypeScript、React 18、Next.js等',
            type: 'addition' as const,
            category: '技术更新'
          },
          {
            id: 'skill-2',
            content: '按熟练程度重新排序，将核心技能放在前面',
            type: 'optimization' as const,
            category: '排序优化'
          },
          {
            id: 'skill-3',
            content: '补充相关认证信息，如AWS认证、PMP证书等',
            type: 'addition' as const,
            category: '资质证明'
          }
        ],
        summary: [
          {
            id: 'summary-1',
            content: '突出核心竞争力，明确表达你的专业优势和独特价值',
            type: 'improvement' as const,
            category: '价值定位'
          },
          {
            id: 'summary-2',
            content: '明确职业目标，让招聘者了解你的发展方向',
            type: 'optimization' as const,
            category: '目标导向'
          },
          {
            id: 'summary-3',
            content: '体现个人价值主张，说明你能为公司带来什么价值',
            type: 'improvement' as const,
            category: '价值体现'
          }
        ],
        education: [
          {
            id: 'edu-1',
            content: '突出相关课程和项目经历，展示学习成果',
            type: 'improvement' as const,
            category: '学习成果'
          },
          {
            id: 'edu-2',
            content: '添加学术成就，如奖学金、优秀毕业生等荣誉',
            type: 'addition' as const,
            category: '学术荣誉'
          }
        ],
        projects: [
          {
            id: 'proj-1',
            content: '详细描述项目背景和解决的问题',
            type: 'improvement' as const,
            category: '项目背景'
          },
          {
            id: 'proj-2',
            content: '突出个人贡献和技术难点的解决方案',
            type: 'optimization' as const,
            category: '个人贡献'
          }
        ]
      }
      
      const sectionType: OptimizationSection = type in optimizationSuggestions
        ? (type as OptimizationSection)
        : 'summary'
      setCurrentSuggestions(optimizationSuggestions[sectionType])
      setSuggestionsLoading(false)
      showToast('优化建议已生成', 'success')
    }, 1500)
  }, [showToast])

  // 应用单个AI建议
  const handleApplySuggestion = useCallback((suggestion: AISuggestion, silent = false) => {
    // 根据建议ID和类型应用到对应字段
    switch (suggestion.id) {
      case 'exp-1': // 量化工作成果
        if (resumeData.experience.length > 0) {
          onUpdateResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp: Experience, index: number) => 
              index === 0 ? {
                ...exp,
                description: [...exp.description, '负责项目开发，提升系统性能30%，用户满意度达95%']
              } : exp
            )
          })
        }
        break
      
      case 'skill-1': // 添加热门技术栈
        onUpdateResumeData({
          ...resumeData,
          skills: [
            ...resumeData.skills,
            { id: Date.now().toString() + '1', name: 'TypeScript', level: 85, category: '前端开发' },
            { id: Date.now().toString() + '2', name: 'Next.js', level: 80, category: '前端开发' },
            { id: Date.now().toString() + '3', name: 'Tailwind CSS', level: 90, category: '前端开发' }
          ]
        })
        break
      
      case 'summary-1': // 突出核心竞争力
        onUpdateResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            summary: resumeData.personalInfo.summary + '\n• 具备丰富的项目经验，精通主流技术栈\n• 擅长性能优化和用户体验设计，曾将页面加载速度提升40%'
          }
        })
        break
      
      case 'exp-2': // 突出关键技能
        if (resumeData.experience.length > 0) {
          onUpdateResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp: Experience, index: number) => 
              index === 0 ? {
                ...exp,
                description: [...exp.description, '运用React、Node.js等核心技术，成功交付多个大型项目']
              } : exp
            )
          })
        }
        break
      
      case 'skill-2': // 技能排序优化
        const sortedSkills = [...resumeData.skills].sort((a, b) => b.level - a.level)
        onUpdateResumeData({
          ...resumeData,
          skills: sortedSkills
        })
        break
      
      default:
        // 通用处理：默认仅提示，不改数据结构
        break
    }
    
    if (!silent) {
      showToast(`已应用建议：${suggestion.category}`, 'success')
    }
  }, [resumeData, onUpdateResumeData, showToast])

  // 批量应用AI建议
  const handleApplyAllSuggestions = useCallback((suggestions: AISuggestion[]) => {
    suggestions.forEach(suggestion => {
      handleApplySuggestion(suggestion, true)
    })
    showToast(`已应用 ${suggestions.length} 条建议`, 'success')
  }, [handleApplySuggestion, showToast])

  return {
    suggestionsTitle,
    suggestionsLoading,
    currentSuggestions,
    showSuggestionsModal,
    setShowSuggestionsModal,
    handleAIOptimize,
    handleApplySuggestion,
    handleApplyAllSuggestions
  }
}
