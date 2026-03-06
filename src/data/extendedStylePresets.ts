/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 扩展的样式预设方案 - 按行业、风格、场景分类
 */

import { StyleConfig } from '@/contexts/StyleContext'

export interface ExtendedStylePreset {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: 'industry' | 'style' | 'scenario'
  subCategory: string
  preview: string
  config: Partial<StyleConfig>
  tags: string[]
  popularity: number
}

/**
 * 行业预设 - 针对不同行业优化的样式
 */
export const industryPresets: ExtendedStylePreset[] = [
  {
    id: 'tech-startup',
    name: '科技创业',
    nameEn: 'Tech Startup',
    description: '现代科技感，适合互联网、软件开发行业',
    descriptionEn: 'Modern tech style for internet and software development',
    category: 'industry',
    subCategory: 'technology',
    preview: '/presets/tech-startup.svg',
    tags: ['科技', '互联网', '创业', 'modern'],
    popularity: 95,
    config: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#64748b',
        accent: '#06b6d4',
        text: '#0f172a',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 32,
        title: 20,
        content: 15,
        small: 13
      },
      spacing: {
        section: 32,
        item: 20,
        line: 22
      },
      layout: {
        columns: 1,
        headerLayout: 'horizontal',
        contactLayout: 'inline'
      }
    }
  },
  {
    id: 'finance-banking',
    name: '金融银行',
    nameEn: 'Finance & Banking',
    description: '专业稳重，适合金融、银行、投资行业',
    descriptionEn: 'Professional and stable for finance, banking, and investment',
    category: 'industry',
    subCategory: 'finance',
    preview: '/presets/finance-banking.svg',
    tags: ['金融', '银行', '专业', 'professional'],
    popularity: 88,
    config: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#475569',
        accent: '#2563eb',
        text: '#0f172a',
        background: '#ffffff'
      },
      fontFamily: 'Georgia, serif',
      fontSize: {
        name: 28,
        title: 18,
        content: 14,
        small: 12
      },
      spacing: {
        section: 36,
        item: 22,
        line: 20
      },
      layout: {
        columns: 1,
        headerLayout: 'centered',
        contactLayout: 'grouped'
      }
    }
  },
  {
    id: 'creative-design',
    name: '创意设计',
    nameEn: 'Creative Design',
    description: '大胆创新，适合设计、广告、创意行业',
    descriptionEn: 'Bold and innovative for design, advertising, and creative industries',
    category: 'industry',
    subCategory: 'creative',
    preview: '/presets/creative-design.svg',
    tags: ['设计', '创意', '广告', 'creative'],
    popularity: 92,
    config: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#8b5cf6',
        text: '#1f2937',
        background: '#faf5ff'
      },
      fontFamily: 'Playfair Display, serif',
      fontSize: {
        name: 36,
        title: 22,
        content: 15,
        small: 13
      },
      spacing: {
        section: 40,
        item: 24,
        line: 24
      },
      layout: {
        columns: 2,
        leftColumnWidth: 35,
        rightColumnWidth: 65,
        headerLayout: 'vertical',
        contactLayout: 'sidebar'
      }
    }
  },
  {
    id: 'healthcare-medical',
    name: '医疗健康',
    nameEn: 'Healthcare & Medical',
    description: '清新专业，适合医疗、健康、护理行业',
    descriptionEn: 'Fresh and professional for healthcare, medical, and nursing',
    category: 'industry',
    subCategory: 'healthcare',
    preview: '/presets/healthcare-medical.svg',
    tags: ['医疗', '健康', '护理', 'healthcare'],
    popularity: 78,
    config: {
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#10b981',
        text: '#111827',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 28,
        title: 18,
        content: 14,
        small: 12
      },
      spacing: {
        section: 32,
        item: 20,
        line: 20
      },
      layout: {
        columns: 1,
        headerLayout: 'horizontal',
        contactLayout: 'inline'
      }
    }
  },
  {
    id: 'education-academic',
    name: '教育学术',
    nameEn: 'Education & Academic',
    description: '严谨学术，适合教育、科研、学术行业',
    descriptionEn: 'Rigorous and academic for education, research, and academia',
    category: 'industry',
    subCategory: 'education',
    preview: '/presets/education-academic.svg',
    tags: ['教育', '学术', '科研', 'academic'],
    popularity: 82,
    config: {
      colors: {
        primary: '#374151',
        secondary: '#6b7280',
        accent: '#4b5563',
        text: '#111827',
        background: '#ffffff'
      },
      fontFamily: 'Georgia, serif',
      fontSize: {
        name: 26,
        title: 17,
        content: 14,
        small: 12
      },
      spacing: {
        section: 38,
        item: 24,
        line: 21
      },
      layout: {
        columns: 1,
        headerLayout: 'centered',
        contactLayout: 'grouped'
      }
    }
  }
]

/**
 * 风格预设 - 不同视觉风格
 */
export const stylePresets: ExtendedStylePreset[] = [
  {
    id: 'ultra-minimal',
    name: '超级极简',
    nameEn: 'Ultra Minimal',
    description: '极致简约，大量留白，突出内容',
    descriptionEn: 'Ultimate simplicity with ample whitespace, content-focused',
    category: 'style',
    subCategory: 'minimal',
    preview: '/presets/ultra-minimal.svg',
    tags: ['极简', '留白', '简约', 'minimal'],
    popularity: 90,
    config: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#999999',
        text: '#000000',
        background: '#ffffff'
      },
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: {
        name: 24,
        title: 14,
        content: 12,
        small: 10
      },
      spacing: {
        section: 48,
        item: 28,
        line: 18
      },
      layout: {
        columns: 1,
        padding: 40,
        headerLayout: 'horizontal',
        contactLayout: 'inline'
      }
    }
  },
  {
    id: 'bold-modern',
    name: '大胆现代',
    nameEn: 'Bold Modern',
    description: '大胆配色，现代设计，视觉冲击',
    descriptionEn: 'Bold colors, modern design, strong visual impact',
    category: 'style',
    subCategory: 'modern',
    preview: '/presets/bold-modern.svg',
    tags: ['现代', '大胆', '视觉', 'bold'],
    popularity: 85,
    config: {
      colors: {
        primary: '#dc2626',
        secondary: '#1f2937',
        accent: '#ef4444',
        text: '#111827',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 36,
        title: 22,
        content: 15,
        small: 13
      },
      spacing: {
        section: 36,
        item: 22,
        line: 23
      },
      layout: {
        columns: 1,
        headerLayout: 'horizontal',
        contactLayout: 'cards'
      }
    }
  },
  {
    id: 'elegant-classic',
    name: '优雅经典',
    nameEn: 'Elegant Classic',
    description: '经典优雅，衬线字体，传统美感',
    descriptionEn: 'Classic elegance with serif fonts and traditional aesthetics',
    category: 'style',
    subCategory: 'classic',
    preview: '/presets/elegant-classic.svg',
    tags: ['经典', '优雅', '传统', 'elegant'],
    popularity: 87,
    config: {
      colors: {
        primary: '#92400e',
        secondary: '#78350f',
        accent: '#b45309',
        text: '#1c1917',
        background: '#fefce8'
      },
      fontFamily: 'Merriweather, Georgia, serif',
      fontSize: {
        name: 30,
        title: 19,
        content: 14,
        small: 12
      },
      spacing: {
        section: 40,
        item: 24,
        line: 21
      },
      layout: {
        columns: 1,
        headerLayout: 'centered',
        contactLayout: 'grouped'
      }
    }
  }
]

/**
 * 场景预设 - 针对不同求职场景
 */
export const scenarioPresets: ExtendedStylePreset[] = [
  {
    id: 'fresh-graduate',
    name: '应届毕业生',
    nameEn: 'Fresh Graduate',
    description: '清新活力，适合应届生求职',
    descriptionEn: 'Fresh and energetic, suitable for fresh graduates',
    category: 'scenario',
    subCategory: 'entry-level',
    preview: '/presets/fresh-graduate.svg',
    tags: ['应届生', '毕业生', '清新', 'graduate'],
    popularity: 93,
    config: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#60a5fa',
        text: '#1e293b',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 30,
        title: 19,
        content: 14,
        small: 12
      },
      spacing: {
        section: 32,
        item: 20,
        line: 20
      },
      layout: {
        columns: 1,
        headerLayout: 'horizontal',
        contactLayout: 'inline'
      }
    }
  },
  {
    id: 'career-change',
    name: '转行跳槽',
    nameEn: 'Career Change',
    description: '突出技能，适合转行或跳槽',
    descriptionEn: 'Skill-focused, suitable for career change or job hopping',
    category: 'scenario',
    subCategory: 'mid-level',
    preview: '/presets/career-change.svg',
    tags: ['转行', '跳槽', '技能', 'career-change'],
    popularity: 88,
    config: {
      colors: {
        primary: '#0891b2',
        secondary: '#475569',
        accent: '#06b6d4',
        text: '#0f172a',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 28,
        title: 18,
        content: 14,
        small: 12
      },
      spacing: {
        section: 30,
        item: 18,
        line: 20
      },
      layout: {
        columns: 2,
        leftColumnWidth: 35,
        rightColumnWidth: 65,
        headerLayout: 'horizontal',
        contactLayout: 'sidebar'
      }
    }
  },
  {
    id: 'senior-executive',
    name: '高管精英',
    nameEn: 'Senior Executive',
    description: '高端大气，适合高管和资深人士',
    descriptionEn: 'Premium and sophisticated for executives and senior professionals',
    category: 'scenario',
    subCategory: 'executive',
    preview: '/presets/senior-executive.svg',
    tags: ['高管', '精英', '高端', 'executive'],
    popularity: 80,
    config: {
      colors: {
        primary: '#1e293b',
        secondary: '#475569',
        accent: '#334155',
        text: '#0f172a',
        background: '#ffffff'
      },
      fontFamily: 'Georgia, serif',
      fontSize: {
        name: 32,
        title: 20,
        content: 15,
        small: 13
      },
      spacing: {
        section: 42,
        item: 26,
        line: 23
      },
      layout: {
        columns: 1,
        headerLayout: 'centered',
        contactLayout: 'grouped'
      }
    }
  },
  {
    id: 'internship',
    name: '实习申请',
    nameEn: 'Internship',
    description: '简洁明了，适合实习申请',
    descriptionEn: 'Clear and concise for internship applications',
    category: 'scenario',
    subCategory: 'internship',
    preview: '/presets/internship.svg',
    tags: ['实习', '学生', '简洁', 'internship'],
    popularity: 86,
    config: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#6b7280',
        accent: '#a78bfa',
        text: '#1f2937',
        background: '#ffffff'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        name: 28,
        title: 18,
        content: 14,
        small: 12
      },
      spacing: {
        section: 28,
        item: 18,
        line: 20
      },
      layout: {
        columns: 1,
        headerLayout: 'horizontal',
        contactLayout: 'inline'
      }
    }
  }
]

/**
 * 获取所有扩展预设
 */
export function getAllExtendedPresets(): ExtendedStylePreset[] {
  return [...industryPresets, ...stylePresets, ...scenarioPresets]
}

/**
 * 按分类获取预设
 */
export function getPresetsByCategory(category: 'industry' | 'style' | 'scenario'): ExtendedStylePreset[] {
  switch (category) {
    case 'industry':
      return industryPresets
    case 'style':
      return stylePresets
    case 'scenario':
      return scenarioPresets
    default:
      return []
  }
}

/**
 * 按标签搜索预设
 */
export function searchPresetsByTag(tag: string): ExtendedStylePreset[] {
  const allPresets = getAllExtendedPresets()
  return allPresets.filter(preset => 
    preset.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  )
}

/**
 * 获取热门预设
 */
export function getPopularPresets(limit: number = 5): ExtendedStylePreset[] {
  const allPresets = getAllExtendedPresets()
  return allPresets
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

/**
 * 根据ID获取预设
 */
export function getPresetById(id: string): ExtendedStylePreset | undefined {
  const allPresets = getAllExtendedPresets()
  return allPresets.find(preset => preset.id === id)
}

