/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { TemplateStyle, TemplateCategory } from '@/types/template'

/**
 * 预定义简历模板
 */
export const resumeTemplates: TemplateStyle[] = [
  // 现代风格模板
  {
    id: 'modern-blue',
    name: '现代蓝调',
    description: '简洁现代的设计，适合技术和商务岗位',
    preview: '/templates/modern-blue.svg',
    category: 'modern',
    isPremium: false,
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#0ea5e9',
      text: '#1e293b',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
        personalInfo: {
          layout: 'horizontal',
          showAvatar: true,
          avatarPosition: 'center',
          defaultAvatar: '/avatars/img2.png'
        },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'modern-green',
    name: '现代绿意',
    description: '清新的绿色主题，适合创意和环保行业',
    preview: '/templates/modern-green.svg',
    category: 'modern',
    isPremium: false,
    hidden: true,
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#10b981',
      text: '#111827',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
        personalInfo: {
          layout: 'horizontal',
          showAvatar: true,
          avatarPosition: 'center',
          defaultAvatar: '/avatars/img1.png'
        },
      sectionTitle: {
        style: 'background',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // 经典风格模板
  {
    id: 'classic-elegant',
    name: '经典优雅',
    description: '传统优雅的设计，适合正式场合和传统行业',
    preview: '/templates/classic-elegant.svg',
    category: 'classic',
    isPremium: false,
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#374151',
      text: '#111827',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif',
      size: {
        heading: '1.6rem',
        body: '0.9rem',
        small: '0.8rem'
      }
    },
    layout: {
      margins: {
        top: '2.5rem',
        right: '2.5rem',
        bottom: '2.5rem',
        left: '2.5rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2.5rem',
        item: '1.2rem',
        line: '0.6rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img1.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'center'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1.5rem'
      },
      dateFormat: {
        format: 'YYYY年MM月',
        position: 'right'
      }
    }
  },
  // 创意风格模板
  {
    id: 'creative-purple',
    name: '创意紫韵',
    description: '富有创意的紫色主题，适合设计和创意行业',
    preview: '/templates/creative-purple.svg',
    category: 'creative',
    isPremium: false,
    hidden: true,
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#8b5cf6',
      text: '#1f2937',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.6rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '2rem',
        leftWidth: '35%',
        rightWidth: '65%'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img3.png'
      },
      sectionTitle: {
        style: 'background',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'MM/YYYY',
        position: 'right'
      }
    }
  },
  // 极简风格模板
  {
    id: 'minimal-clean',
    name: '极简清洁',
    description: '极简主义设计，突出内容本身',
    preview: '/templates/minimal-clean.svg',
    category: 'minimal',
    isPremium: false,
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#6b7280',
      text: '#111827',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif',
      size: {
        heading: '1.4rem',
        body: '0.85rem',
        small: '0.7rem'
      }
    },
    layout: {
      margins: {
        top: '3rem',
        right: '3rem',
        bottom: '3rem',
        left: '3rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '3rem',
        item: '1.5rem',
        line: '0.8rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img4.png'
      },
      sectionTitle: {
        style: 'plain',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'none',
        indentation: '0'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // GitHub 风格
  {
    id: 'github-markdown',
    name: 'GitHub 风格',
    description: '程序员最爱的 Markdown 风格，展现技术极客范儿',
    preview: '/templates/github-markdown.svg',
    category: 'modern',
    isPremium: false,
    colors: {
      primary: '#24292e',
      secondary: '#586069',
      accent: '#0366d6',
      text: '#24292e',
      background: '#ffffff'
    },
    fonts: {
      heading: '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.9rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '1.5rem',
        item: '0.8rem',
        line: '0.4rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'left',
        defaultAvatar: '/avatars/img2.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1.2rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // 瑞士设计风格
  {
    id: 'swiss-design',
    name: '瑞士设计',
    description: '受瑞士国际主义设计风格启发，强调网格和排版',
    preview: '/templates/swiss-design.svg',
    category: 'creative',
    isPremium: false,
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#ff0000',
      text: '#000000',
      background: '#f5f5f5'
    },
    fonts: {
      heading: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      body: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      size: {
        heading: '2.5rem',
        body: '0.9rem',
        small: '0.8rem'
      }
    },
    layout: {
      margins: {
        top: '2.5rem',
        right: '2.5rem',
        bottom: '2.5rem',
        left: '2.5rem'
      },
      columns: {
        count: 2,
        gap: '3rem',
        leftWidth: '30%',
        rightWidth: '70%'
      },
      spacing: {
        section: '3rem',
        item: '1.2rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: false,
        avatarPosition: 'left',
        defaultAvatar: ''
      },
      sectionTitle: {
        style: 'plain',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'none',
        indentation: '0'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'left'
      }
    }
  },
  // 职业模板
  {
    id: 'career-ui-designer',
    name: 'UI设计师',
    description: '专为UI设计师定制的简历模板，突出设计技能和作品',
    preview: '/templates/career-ui-designer.svg',
    category: 'career',
    isPremium: false,
    hidden: true,
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#be185d',
      text: '#1f2937',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '1.5rem',
        leftWidth: '30%',
        rightWidth: '70%'
      },
      spacing: {
        section: '1.8rem',
        item: '0.9rem',
        line: '0.45rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img3.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'career-frontend-developer',
    name: '前端开发工程师',
    description: '专为前端开发工程师定制的简历模板，突出技术技能和项目经验',
    preview: '/templates/career-frontend-developer.svg',
    category: 'career',
    isPremium: false,
    hidden: true,
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#0ea5e9',
      text: '#1e293b',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img2.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'nordic-minimal',
    name: '北欧极简',
    description: '清新自然的北欧风格，简约而不失格调',
    preview: '/templates/nordic-minimal.svg',
    category: 'minimal',
    isPremium: false,
    colors: {
      primary: '#334155',
      secondary: '#64748b',
      accent: '#94a3b8',
      text: '#0f172a',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.9rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2.5rem',
        right: '2.5rem',
        bottom: '2.5rem',
        left: '2.5rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2.5rem',
        item: '1.2rem',
        line: '0.6rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'right',
        defaultAvatar: '/avatars/img4.png'
      },
      sectionTitle: {
        style: 'plain',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'career-product-manager',
    name: '产品经理',
    description: '专为产品经理定制的简历模板，突出产品思维和项目管理能力',
    preview: '/templates/career-product-manager.svg',
    category: 'career',
    isPremium: false,
    colors: {
      primary: '#0d9488',
      secondary: '#64748b',
      accent: '#14b8a6',
      text: '#0f172a',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '1.5rem',
        leftWidth: '30%',
        rightWidth: '70%'
      },
      spacing: {
        section: '1.8rem',
        item: '0.9rem',
        line: '0.45rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img3.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // 科技极简模板
  {
    id: 'tech-minimal',
    name: '科技极简',
    description: '面向技术人才的极简设计，强调技能和项目经验',
    preview: '/templates/tech-minimal.svg',
    category: 'modern',
    isPremium: false,
    colors: {
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#3b82f6',
      text: '#334155',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Space Mono, monospace',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.4rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2.5rem',
        item: '1.2rem',
        line: '0.6rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: false,
        avatarPosition: 'left',
        defaultAvatar: ''
      },
      sectionTitle: {
        style: 'border',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // 金融专业模板
  {
    id: 'finance-pro',
    name: '金融精英',
    description: '严谨专业的排版，适合金融、咨询及法律行业',
    preview: '/templates/finance-pro.svg',
    category: 'classic',
    isPremium: false,
    colors: {
      primary: '#1a202c',
      secondary: '#4a5568',
      accent: '#2d3748',
      text: '#1a202c',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif',
      size: {
        heading: '1.5rem',
        body: '0.9rem',
        small: '0.8rem'
      }
    },
    layout: {
      margins: {
        top: '2.5rem',
        right: '2.5rem',
        bottom: '2.5rem',
        left: '2.5rem'
      },
      columns: {
        count: 1,
        gap: '1.5rem'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: false,
        avatarPosition: 'center',
        defaultAvatar: ''
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'center'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1.5rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  // 高级模板
  {
    id: 'elegant-rose',
    name: '优雅玫瑰',
    description: '优雅的玫瑰金配色，适合时尚和奢侈品行业',
    preview: '/templates/elegant-rose.svg',
    category: 'modern',
    isPremium: true,
    hidden: true,
    colors: {
      primary: '#e11d48',
      secondary: '#9f1239',
      accent: '#f43f5e',
      text: '#1f2937',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, sans-serif',
      size: {
        heading: '1.6rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '1.8rem',
        leftWidth: '35%',
        rightWidth: '65%'
      },
      spacing: {
        section: '1.8rem',
        item: '0.9rem',
        line: '0.45rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img3.png'
      },
      sectionTitle: {
        style: 'background',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'tech-orange',
    name: '科技橙光',
    description: '现代科技感橙色主题，适合科技和创新行业',
    preview: '/templates/tech-orange.svg',
    category: 'modern',
    isPremium: false,
    hidden: true,
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      text: '#1f2937',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif',
      size: {
        heading: '1.5rem',
        body: '0.875rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img2.png'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'arrow',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'creative-designer',
    name: '设计大师',
    description: '大胆的版式设计，专为展现创意能力而生',
    preview: '/templates/creative-designer.svg',
    category: 'creative',
    isPremium: false,
    colors: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#e11d48',
      text: '#1f2937',
      background: '#fff1f2'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif',
      size: {
        heading: '1.8rem',
        body: '0.9rem',
        small: '0.8rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '2rem',
        leftWidth: '40%',
        rightWidth: '60%'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: true,
        avatarPosition: 'center',
        defaultAvatar: '/avatars/img1.png'
      },
      sectionTitle: {
        style: 'background',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'circle',
        indentation: '1rem'
      },
      dateFormat: {
        format: 'YYYY',
        position: 'left'
      }
    }
  },
  {
    id: 'business-elite',
    name: '商务精英',
    description: '沉稳大气的商务风格，适合管理层和高端职位',
    preview: '/templates/business-elite.svg',
    category: 'classic',
    isPremium: false,
    colors: {
      primary: '#1e3a8a',
      secondary: '#93c5fd',
      accent: '#2563eb',
      text: '#0f172a',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'Lato, sans-serif',
      size: {
        heading: '1.6rem',
        body: '0.9rem',
        small: '0.8rem'
      }
    },
    layout: {
      margins: {
        top: '2.5rem',
        right: '2.5rem',
        bottom: '2.5rem',
        left: '2.5rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '2.2rem',
        item: '1.1rem',
        line: '0.55rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: true,
        avatarPosition: 'right',
        defaultAvatar: '/avatars/img4.png'
      },
      sectionTitle: {
        style: 'border',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1.2rem'
      },
      dateFormat: {
        format: 'YYYY-MM',
        position: 'right'
      }
    }
  },
  {
    id: 'minimal-pro',
    name: '专业极简',
    description: '极致简约，无多余装饰，让内容成为主角',
    preview: '/templates/minimal-pro.svg',
    category: 'minimal',
    isPremium: false,
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#333333',
      text: '#111111',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif',
      size: {
        heading: '1.4rem',
        body: '0.85rem',
        small: '0.75rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 2,
        gap: '3rem',
        leftWidth: '25%',
        rightWidth: '75%'
      },
      spacing: {
        section: '2rem',
        item: '1rem',
        line: '0.5rem'
      }
    },
    components: {
      personalInfo: {
        layout: 'vertical',
        showAvatar: false,
        avatarPosition: 'left',
        defaultAvatar: ''
      },
      sectionTitle: {
        style: 'plain',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'none',
        indentation: '0'
      },
      dateFormat: {
        format: 'YYYY',
        position: 'left'
      }
    }
  },
  {
    id: 'english-standard',
    name: 'Standard English',
    description: 'Professional layout for international applications',
    preview: '/templates/classic-elegant.svg',
    category: 'english',
    isPremium: false,
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#000000',
      text: '#000000',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
      size: {
        heading: '1.4rem',
        body: '1rem',
        small: '0.875rem'
      }
    },
    layout: {
      margins: {
        top: '2rem',
        right: '2rem',
        bottom: '2rem',
        left: '2rem'
      },
      columns: {
        count: 1,
        gap: '2rem'
      },
      spacing: {
        section: '1.5rem',
        item: '1rem',
        line: '1.4'
      }
    },
    components: {
      personalInfo: {
        layout: 'horizontal',
        showAvatar: false,
        avatarPosition: 'center'
      },
      sectionTitle: {
        style: 'underline',
        alignment: 'left'
      },
      listItem: {
        bulletStyle: 'dot',
        indentation: '1.5rem'
      },
      dateFormat: {
        format: 'MM/YYYY',
        position: 'right'
      }
    }
  }
]

/**
 * 模板分类
 */
export const templateCategories: TemplateCategory[] = [
  {
    id: 'modern',
    name: '现代风格',
    description: '简洁现代的设计，适合大多数行业',
    icon: 'Zap',
    templates: resumeTemplates.filter(t => t.category === 'modern' && !t.hidden)
  },
  {
    id: 'classic',
    name: '经典风格',
    description: '传统优雅的设计，适合正式场合',
    icon: 'BookOpen',
    templates: resumeTemplates.filter(t => t.category === 'classic' && !t.hidden)
  },
  {
    id: 'creative',
    name: '创意风格',
    description: '富有创意的设计，展现个人特色',
    icon: 'Palette',
    templates: resumeTemplates.filter(t => t.category === 'creative' && !t.hidden)
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '极简主义设计，突出内容本身',
    icon: 'Minus',
    templates: resumeTemplates.filter(t => t.category === 'minimal' && !t.hidden)
  },
  {
    id: 'career',
    name: '职业模板',
    description: '针对不同职业定制的简历模板，包含行业特色内容',
    icon: 'Briefcase',
    templates: resumeTemplates.filter(t => t.category === 'career' && !t.hidden)
  },
  {
    id: 'english',
    name: 'English Resume',
    description: 'Professional templates for international job market',
    icon: 'Globe',
    templates: resumeTemplates.filter(t => t.category === 'english' && !t.hidden)
  }
]

/**
 * 获取默认模板
 */
export const getDefaultTemplate = (): TemplateStyle => {
  return resumeTemplates.find(t => t.id === 'minimal-clean') || resumeTemplates[0]
}

/**
 * 根据ID获取模板
 */
export const getTemplateById = (id: string): TemplateStyle | undefined => {
  return resumeTemplates.find(t => t.id === id)
}

/**
 * 获取免费模板（排除隐藏）
 */
export const getFreeTemplates = (): TemplateStyle[] => {
  return resumeTemplates.filter(t => !t.isPremium && !t.hidden)
}

/**
 * 获取高级模板（排除隐藏）
 */
export const getPremiumTemplates = (): TemplateStyle[] => {
  return resumeTemplates.filter(t => t.isPremium && !t.hidden)
}

/**
 * 流行模板ID列表
 */
export const popularTemplateIds = [
  'modern-blue',
  'creative-purple',
  'career-ui-designer',
  'minimal-clean',
  'classic-elegant'
]