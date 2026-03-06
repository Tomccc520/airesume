/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.2.2
 * @description 默认简历数据 - 用于模板预览和初始化
 */

import { ResumeData } from '@/types/resume'

/**
 * 默认简历数据 - 中文版
 */
export const defaultResumeDataZh: ResumeData = {
  personalInfo: {
    name: '张三',
    title: '前端开发工程师',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '北京市',
    avatar: '/avatars/img1.png',
    summary: '5年前端开发经验，精通React/Vue等主流框架，有丰富的大型项目开发经验。'
  },
  experience: [
    {
      id: '1',
      company: '某科技有限公司',
      position: '高级前端工程师',
      startDate: '2021-03',
      endDate: '至今',
      current: true,
      description: [
        '负责公司核心产品的前端架构设计与开发，使用React+TypeScript技术栈',
        '优化页面性能，首屏加载时间减少40%，用户体验显著提升',
        '带领5人前端团队，制定开发规范，提升团队整体效率'
      ],
      location: '北京'
    },
    {
      id: '2',
      company: '某互联网公司',
      position: '前端开发工程师',
      startDate: '2019-07',
      endDate: '2021-02',
      current: false,
      description: [
        '参与多个Web应用的开发，使用Vue.js构建响应式界面',
        '与后端团队协作，完成RESTful API对接和数据交互'
      ],
      location: '上海'
    }
  ],
  education: [
    {
      id: '1',
      school: '某某大学',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2015-09',
      endDate: '2019-06',
      gpa: '3.8/4.0',
      description: '主修课程：数据结构、算法、操作系统、计算机网络等'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript/TypeScript', level: 90, category: '编程语言' },
    { id: '2', name: 'React', level: 85, category: '前端框架' },
    { id: '3', name: 'Vue.js', level: 85, category: '前端框架' },
    { id: '4', name: 'Node.js', level: 75, category: '后端技术' },
    { id: '5', name: 'Webpack/Vite', level: 80, category: '构建工具' },
    { id: '6', name: 'Git', level: 85, category: '版本控制' }
  ],
  projects: [
    {
      id: '1',
      name: '企业管理系统',
      description: '基于React+Ant Design的企业级管理系统，包含权限管理、数据可视化等功能',
      technologies: ['React', 'TypeScript', 'Ant Design', 'ECharts'],
      startDate: '2022-01',
      endDate: '2022-06',
      highlights: [
        '设计并实现了灵活的权限管理系统，支持角色和资源级别的权限控制',
        '使用ECharts实现数据可视化大屏，支持实时数据更新'
      ],
      url: 'https://example.com'
    },
    {
      id: '2',
      name: '电商小程序',
      description: '基于微信小程序的电商平台，包含商品展示、购物车、订单管理等功能',
      technologies: ['微信小程序', 'Vue.js', 'Vant'],
      startDate: '2021-06',
      endDate: '2021-12',
      highlights: [
        '实现了商品搜索、筛选、排序等功能，提升用户购物体验',
        '优化小程序性能，页面加载速度提升50%'
      ]
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'PMP项目管理专业人士',
      issuer: 'PMI',
      date: '2022-05',
      description: '项目管理专业认证'
    }
  ],
  languages: [
    { id: '1', name: '中文', level: '母语' },
    { id: '2', name: '英语', level: 'CET-6' }
  ],
  awards: [
    {
      id: '1',
      title: '优秀员工',
      issuer: '某科技有限公司',
      date: '2022-12',
      description: '年度优秀员工奖'
    }
  ]
}

/**
 * 默认简历数据 - 英文版
 */
export const defaultResumeDataEn: ResumeData = {
  personalInfo: {
    name: 'John Smith',
    title: 'Frontend Developer',
    email: 'john.smith@example.com',
    phone: '+1-234-567-8900',
    location: 'San Francisco, CA',
    avatar: '/avatars/img1.png',
    summary: '5+ years of frontend development experience, proficient in React/Vue and other mainstream frameworks, with rich experience in large-scale project development.'
  },
  experience: [
    {
      id: '1',
      company: 'Tech Company Inc.',
      position: 'Senior Frontend Engineer',
      startDate: '2021-03',
      endDate: 'Present',
      current: true,
      description: [
        'Led frontend architecture design and development for core products using React+TypeScript',
        'Optimized page performance, reducing initial load time by 40% and significantly improving UX',
        'Managed a team of 5 frontend engineers, established coding standards, and improved team efficiency'
      ],
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      company: 'Internet Company Ltd.',
      position: 'Frontend Developer',
      startDate: '2019-07',
      endDate: '2021-02',
      current: false,
      description: [
        'Developed multiple web applications using Vue.js to build responsive interfaces',
        'Collaborated with backend team to integrate RESTful APIs and handle data interactions'
      ],
      location: 'New York, NY'
    }
  ],
  education: [
    {
      id: '1',
      school: 'University of Technology',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      startDate: '2015-09',
      endDate: '2019-06',
      gpa: '3.8/4.0',
      description: 'Core courses: Data Structures, Algorithms, Operating Systems, Computer Networks'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript/TypeScript', level: 90, category: 'Programming Languages' },
    { id: '2', name: 'React', level: 85, category: 'Frontend Frameworks' },
    { id: '3', name: 'Vue.js', level: 85, category: 'Frontend Frameworks' },
    { id: '4', name: 'Node.js', level: 75, category: 'Backend Technologies' },
    { id: '5', name: 'Webpack/Vite', level: 80, category: 'Build Tools' },
    { id: '6', name: 'Git', level: 85, category: 'Version Control' }
  ],
  projects: [
    {
      id: '1',
      name: 'Enterprise Management System',
      description: 'Enterprise-level management system based on React+Ant Design, including permission management and data visualization',
      technologies: ['React', 'TypeScript', 'Ant Design', 'ECharts'],
      startDate: '2022-01',
      endDate: '2022-06',
      highlights: [
        'Designed and implemented flexible permission management system with role and resource-level access control',
        'Built data visualization dashboard using ECharts with real-time data updates'
      ],
      url: 'https://example.com'
    },
    {
      id: '2',
      name: 'E-commerce Mini Program',
      description: 'WeChat mini program for e-commerce platform with product display, shopping cart, and order management',
      technologies: ['WeChat Mini Program', 'Vue.js', 'Vant'],
      startDate: '2021-06',
      endDate: '2021-12',
      highlights: [
        'Implemented product search, filtering, and sorting features to enhance shopping experience',
        'Optimized mini program performance, improving page load speed by 50%'
      ]
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'PMP - Project Management Professional',
      issuer: 'PMI',
      date: '2022-05',
      description: 'Project Management Professional Certification'
    }
  ],
  languages: [
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Chinese', level: 'Professional' }
  ],
  awards: [
    {
      id: '1',
      title: 'Employee of the Year',
      issuer: 'Tech Company Inc.',
      date: '2022-12',
      description: 'Annual Outstanding Employee Award'
    }
  ]
}

/**
 * 获取默认简历数据
 */
export const getDefaultResumeData = (locale: 'zh' | 'en' = 'zh'): ResumeData => {
  return locale === 'en' ? defaultResumeDataEn : defaultResumeDataZh
}

