/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { useState, useEffect, createContext, useContext } from 'react'

// 支持的语言类型
export type Language = 'zh' | 'en'

// 语言配置接口
interface LanguageConfig {
  code: Language
  name: string
  flag: string
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

// 翻译文本类型
export interface Translations {
  // 通用
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    confirm: string
    loading: string
    success: string
    error: string
  }
  
  // 导航
  nav: {
    home: string
    editor: string
    templates: string
    export: string
    login: string
    register: string
  }
  
  // 首页
  home: {
    title: string
    subtitle: string
    description: string
    startCreating: string
    viewExample: string
    features: {
      title: string
      subtitle: string
      aiAssistant: {
        title: string
        description: string
      }
      multilingual: {
        title: string
        description: string
      }
      realTimePreview: {
        title: string
        description: string
      }
      templates: {
        title: string
        description: string
      }
      responsive: {
        title: string
        description: string
      }
      pdfExport: {
        title: string
        description: string
      }
    }
    steps: {
    title: string
    step1: {
      title: string
      description: string
    }
    step2: {
      title: string
      description: string
    }
    step3: {
      title: string
      description: string
    }
  }
    cta: {
      title: string
      description: string
      button: string
    }
  }
  
  // 简历编辑器
  editor: {
    personalInfo: {
      title: string
      name: string
      title_field: string
      email: string
      phone: string
      location: string
      website: string
      summary: string
    }
    experience: {
      title: string
      company: string
      position: string
      startDate: string
      endDate: string
      current: string
      description: string
      location: string
    }
    education: {
      title: string
      school: string
      degree: string
      major: string
      startDate: string
      endDate: string
      gpa: string
      description: string
    }
    skills: {
      title: string
      name: string
      level: string
      category: string
      levels: {
        beginner: string
        intermediate: string
        advanced: string
        expert: string
      }
    }
    projects: {
      title: string
      name: string
      description: string
      technologies: string
      startDate: string
      endDate: string
      url: string
      highlights: string
    }
  }
  
  // AI助手
  ai: {
    title: string
    subtitle: string
    currentContent: string
    inputLabel: string
    inputPlaceholder: string
    generating: string
    suggestions: string
    apply: string
    copy: string
    copied: string
    quickOptimize: string
    optimizeLanguage: string
    highlightSkills: string
    addQuantification: string
    improveProfessionalism: string
  }
}

// 中文翻译
const zhTranslations: Translations = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    confirm: '确认',
    loading: '加载中...',
    success: '成功',
    error: '错误'
  },
  nav: {
    home: '首页',
    editor: '编辑器',
    templates: '模板',
    export: '导出',
    login: '登录',
    register: '注册'
  },
  home: {
    title: 'UIED简历',
    subtitle: '智能简历构建器',
    description: '基于AI技术的现代化简历制作平台，支持多语言、实时预览、智能优化，让您轻松创建专业的个人简历',
    startCreating: '🚀 立即开始创建',
    viewExample: '📖 查看示例',
    features: {
      title: '核心功能',
      subtitle: '为您提供最专业的简历制作体验',
      aiAssistant: {
        title: 'AI智能辅助',
        description: '基于AI技术，智能优化简历内容，提供专业建议和内容生成'
      },
      multilingual: {
        title: '多语言支持',
        description: '支持中文、英文等多种语言，满足国际化求职需求'
      },
      realTimePreview: {
        title: '实时预览',
        description: '所见即所得的编辑体验，实时查看简历效果'
      },
      templates: {
        title: '多种模板',
        description: '提供多种专业模板，适应不同行业和职位需求'
      },
      responsive: {
        title: '响应式设计',
        description: '完美适配各种设备，随时随地编辑您的简历'
      },
      pdfExport: {
        title: 'PDF导出',
        description: '一键导出高质量PDF文件，直接用于求职投递'
      }
    },
    steps: {
      title: '如何使用',
      step1: {
        title: '填写信息',
        description: '输入您的个人信息、工作经历、教育背景等基本内容'
      },
      step2: {
        title: 'AI优化',
        description: '使用AI助手优化简历内容，让您的简历更加专业和吸引人'
      },
      step3: {
        title: '导出简历',
        description: '选择合适的模板，导出为PDF格式的专业简历'
      }
    },
    cta: {
      title: '准备好创建您的专业简历了吗？',
      description: '加入数千名用户，使用UIED简历制作工具，开启您的职业新篇章',
      button: '免费开始制作 →'
    }
  },
  editor: {
    personalInfo: {
      title: '个人信息',
      name: '姓名',
      title_field: '职位',
      email: '邮箱',
      phone: '电话',
      location: '地址',
      website: '网站',
      summary: '个人简介'
    },
    experience: {
      title: '工作经历',
      company: '公司名称',
      position: '职位',
      startDate: '开始日期',
      endDate: '结束日期',
      current: '目前在职',
      description: '工作描述',
      location: '工作地点'
    },
    education: {
      title: '教育背景',
      school: '学校名称',
      degree: '学位',
      major: '专业',
      startDate: '开始日期',
      endDate: '结束日期',
      gpa: 'GPA',
      description: '描述'
    },
    skills: {
      title: '技能',
      name: '技能名称',
      level: '熟练程度',
      category: '分类',
      levels: {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级',
        expert: '专家'
      }
    },
    projects: {
      title: '项目经历',
      name: '项目名称',
      description: '项目描述',
      technologies: '技术栈',
      startDate: '开始日期',
      endDate: '结束日期',
      url: '项目链接',
      highlights: '项目亮点'
    }
  },
  ai: {
    title: 'AI智能助手',
    subtitle: '为您的{type}提供专业建议',
    currentContent: '当前内容：',
    inputLabel: '描述您的需求或提供更多信息：',
    inputPlaceholder: '例如：我是一名前端开发工程师，有3年工作经验...',
    generating: 'AI正在生成建议...',
    suggestions: 'AI建议：',
    apply: '应用',
    copy: '复制',
    copied: '已复制',
    quickOptimize: '快速优化：',
    optimizeLanguage: '优化语言表达',
    highlightSkills: '突出核心技能',
    addQuantification: '增加量化数据',
    improveProfessionalism: '提升专业性'
  }
}

// 英文翻译
const enTranslations: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error'
  },
  nav: {
    home: 'Home',
    editor: 'Editor',
    templates: 'Templates',
    export: 'Export',
    login: 'Login',
    register: 'Register'
  },
  home: {
    title: 'UIED Resume',
    subtitle: 'Smart Resume Builder',
    description: 'AI-powered modern resume creation platform with multi-language support, real-time preview, and intelligent optimization to help you create professional resumes effortlessly',
    startCreating: '🚀 Start Creating',
    viewExample: '📖 View Example',
    features: {
      title: 'Core Features',
      subtitle: 'Providing you with the most professional resume creation experience',
      aiAssistant: {
        title: 'AI Assistant',
        description: 'AI-powered content optimization with professional suggestions and content generation'
      },
      multilingual: {
        title: 'Multi-language Support',
        description: 'Support for Chinese, English and other languages to meet international job requirements'
      },
      realTimePreview: {
        title: 'Real-time Preview',
        description: 'WYSIWYG editing experience with instant resume preview'
      },
      templates: {
        title: 'Multiple Templates',
        description: 'Various professional templates for different industries and positions'
      },
      responsive: {
        title: 'Responsive Design',
        description: 'Perfect adaptation to all devices, edit your resume anytime, anywhere'
      },
      pdfExport: {
        title: 'PDF Export',
        description: 'One-click export of high-quality PDF files for direct job applications'
      }
    },
    steps: {
      title: 'How to Use',
      step1: {
        title: 'Fill Information',
        description: 'Enter your personal information, work experience, education background and other basic content'
      },
      step2: {
        title: 'AI Optimization',
        description: 'Use AI assistant to optimize resume content and make your resume more professional and attractive'
      },
      step3: {
        title: 'Export Resume',
        description: 'Choose the right template and export as a professional PDF resume'
      }
    },
    cta: {
      title: 'Ready to Create Your Professional Resume?',
      description: 'Join thousands of users using UIED resume builder to start your new career chapter',
      button: 'Start Creating for Free →'
    }
  },
  editor: {
    personalInfo: {
      title: 'Personal Information',
      name: 'Name',
      title_field: 'Title',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      website: 'Website',
      summary: 'Summary'
    },
    experience: {
      title: 'Work Experience',
      company: 'Company',
      position: 'Position',
      startDate: 'Start Date',
      endDate: 'End Date',
      current: 'Currently Working',
      description: 'Description',
      location: 'Location'
    },
    education: {
      title: 'Education',
      school: 'School',
      degree: 'Degree',
      major: 'Major',
      startDate: 'Start Date',
      endDate: 'End Date',
      gpa: 'GPA',
      description: 'Description'
    },
    skills: {
      title: 'Skills',
      name: 'Skill Name',
      level: 'Level',
      category: 'Category',
      levels: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        expert: 'Expert'
      }
    },
    projects: {
      title: 'Projects',
      name: 'Project Name',
      description: 'Description',
      technologies: 'Technologies',
      startDate: 'Start Date',
      endDate: 'End Date',
      url: 'URL',
      highlights: 'Highlights'
    }
  },
  ai: {
    title: 'AI Assistant',
    subtitle: 'Professional suggestions for your {type}',
    currentContent: 'Current Content:',
    inputLabel: 'Describe your needs or provide more information:',
    inputPlaceholder: 'e.g., I am a frontend developer with 3 years of experience...',
    generating: 'AI is generating suggestions...',
    suggestions: 'AI Suggestions:',
    apply: 'Apply',
    copy: 'Copy',
    copied: 'Copied',
    quickOptimize: 'Quick Optimize:',
    optimizeLanguage: 'Optimize Language',
    highlightSkills: 'Highlight Skills',
    addQuantification: 'Add Quantification',
    improveProfessionalism: 'Improve Professionalism'
  }
}

// 翻译映射
const translations: Record<Language, Translations> = {
  zh: zhTranslations,
  en: enTranslations
}

/**
 * 多语言Hook
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('zh')

  // 从localStorage加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('uied-resume-language') as Language
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  // 保存语言设置到localStorage
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem('uied-resume-language', language)
  }

  // 获取翻译文本
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[currentLanguage]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  // 获取当前语言配置
  const getCurrentLanguageConfig = (): LanguageConfig => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
  }

  return {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguageConfig,
    supportedLanguages: SUPPORTED_LANGUAGES
  }
}