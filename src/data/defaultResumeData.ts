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
    name: '张晨曦',
    title: '高级前端开发工程师',
    email: 'chenxi.zhang@example.com',
    phone: '138-1024-2048',
    location: '北京市 · 海淀区',
    website: 'https://portfolio.example.com/chenxi',
    avatar: '/avatars/img1.png',
    summary:
      '6年前端开发经验，聚焦中后台系统、数据可视化与前端工程化建设，熟悉 React、TypeScript、Next.js 与 Node.js 协作开发。曾主导企业级工作台重构、搭建组件库与发布流程，推动首屏加载时间降低 43%、核心页面缺陷率下降 35%、团队交付效率提升约 30%，期望继续深耕高级前端/前端架构方向。'
  },
  experience: [
    {
      id: '1',
      company: '云迹科技（北京）有限公司',
      position: '高级前端开发工程师',
      startDate: '2021-03',
      endDate: '至今',
      current: true,
      description: [
        '主导公司 B 端运营工作台重构，基于 React + TypeScript 建立统一页面框架与组件规范，覆盖 12 个业务模块，上线后新页面平均交付周期缩短约 30%。',
        '推动性能治理专项，结合路由级拆包、接口缓存与图片懒加载策略，将核心系统首屏加载时间从 4.2 秒优化至 2.4 秒，关键页面性能投诉减少 40%+。',
        '负责前端工程质量体系建设，落地 ESLint、单元测试与发布前检查流程，季度线上缺陷率下降 35%，并持续为 6 人前端团队提供代码评审与技术指导。'
      ],
      location: '北京'
    },
    {
      id: '2',
      company: '星帆互动网络',
      position: '前端开发工程师',
      startDate: '2019-07',
      endDate: '2021-02',
      current: false,
      description: [
        '参与电商营销平台前端开发，负责活动搭建、商品投放与数据看板模块，支撑双 11、618 等高峰节点的活动配置与实时监控。',
        '将历史 jQuery 页面逐步迁移至 Vue + TypeScript 方案，沉淀 20+ 复用组件，日常需求平均开发效率提升约 25%。',
        '与后端、测试和产品协作推进埋点体系重构，完善转化漏斗分析能力，为活动投放优化提供数据支持，重点活动点击转化率提升 12%。'
      ],
      location: '上海'
    }
  ],
  education: [
    {
      id: '1',
      school: '华东理工大学',
      degree: '本科',
      major: '软件工程',
      startDate: '2015-09',
      endDate: '2019-06',
      gpa: '3.7/4.0',
      description: '主修软件工程、数据结构、计算机网络、操作系统、数据库系统；连续两年获得校级奖学金。'
    }
  ],
  skills: [
    { id: '1', name: 'TypeScript', level: 92, category: '编程语言' },
    { id: '2', name: 'React', level: 90, category: '前端框架' },
    { id: '3', name: 'Next.js', level: 84, category: '前端框架' },
    { id: '4', name: 'Vue.js', level: 82, category: '前端框架' },
    { id: '5', name: 'Node.js', level: 76, category: '服务端协作' },
    { id: '6', name: '性能优化', level: 88, category: '工程能力' },
    { id: '7', name: '组件库建设', level: 85, category: '工程能力' },
    { id: '8', name: 'ECharts / 数据可视化', level: 83, category: '业务能力' }
  ],
  projects: [
    {
      id: '1',
      name: '企业经营分析工作台',
      description: '面向管理层与运营团队的统一数据分析平台，覆盖经营指标追踪、异常告警与多维度钻取分析。',
      technologies: ['React', 'TypeScript', 'ECharts', 'Ant Design', 'React Query'],
      startDate: '2022-01',
      endDate: '2022-08',
      highlights: [
        '负责前端总体方案设计与核心页面开发，构建图表组件与指标卡片体系，支持 40+ 经营指标统一展示。',
        '通过图表渲染优化与接口并发治理，将大屏首屏渲染时间缩短 38%，显著提升高管周会场景的展示稳定性。',
        '推动异常告警链路上线，帮助运营团队将问题发现时效从小时级缩短到分钟级。'
      ],
      url: 'https://example.com/ops-dashboard'
    },
    {
      id: '2',
      name: '低代码营销活动搭建平台',
      description: '为运营人员提供可视化活动页面搭建、组件配置与发布能力的营销中台项目。',
      technologies: ['Vue.js', 'TypeScript', 'Vite', 'Pinia'],
      startDate: '2020-05',
      endDate: '2021-01',
      highlights: [
        '设计并实现组件配置面板、模板复用与发布校验流程，支持运营同学独立完成专题页搭建，减少 70% 重复开发需求。',
        '接入埋点与实验配置能力，帮助产品团队快速验证活动方案，重点活动页面转化率提升 15%。',
        '建立模板资产沉淀机制，累计复用 30+ 页面模块，显著降低大型促销活动的上线成本。'
      ]
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'PMP 项目管理专业人士认证',
      issuer: 'PMI',
      date: '2022-05',
      description: '具备跨团队项目推进与协同管理能力。'
    }
  ],
  languages: [
    { id: '1', name: '中文', level: '母语' },
    { id: '2', name: '英语', level: 'CET-6 / 可进行技术文档阅读与邮件沟通' }
  ],
  awards: [
    {
      id: '1',
      title: '年度技术影响力奖',
      issuer: '云迹科技（北京）有限公司',
      date: '2023-12',
      description: '因推动前端工程化与性能治理专项落地获得年度表彰。'
    }
  ]
}

/**
 * 默认简历数据 - 英文版
 */
export const defaultResumeDataEn: ResumeData = {
  personalInfo: {
    name: 'Ethan Zhang',
    title: 'Senior Frontend Engineer',
    email: 'ethan.zhang@example.com',
    phone: '+86-138-1024-2048',
    location: 'Beijing, China',
    website: 'https://portfolio.example.com/ethan',
    avatar: '/avatars/img1.png',
    summary:
      'Frontend engineer with 6 years of experience building SaaS dashboards, data-heavy web applications, and scalable engineering workflows. Strong in React, TypeScript, Next.js, and cross-functional delivery. Led platform revamps, component system adoption, and performance initiatives that reduced initial load time by 43%, lowered production defects by 35%, and improved team delivery efficiency by around 30%.'
  },
  experience: [
    {
      id: '1',
      company: 'Yunji Technology Co., Ltd.',
      position: 'Senior Frontend Engineer',
      startDate: '2021-03',
      endDate: 'Present',
      current: true,
      description: [
        'Led the revamp of a B2B operations workspace with React and TypeScript, standardizing page scaffolding and shared components across 12 business modules and shortening average delivery time by about 30%.',
        'Drove a performance improvement program with route-level code splitting, request caching, and lazy loading, reducing initial page load time from 4.2s to 2.4s and cutting performance-related complaints by over 40%.',
        'Built frontend quality workflows including linting, test coverage, and release checks, which reduced quarterly production defects by 35% while mentoring a team of 6 frontend engineers.'
      ],
      location: 'Beijing, China'
    },
    {
      id: '2',
      company: 'StarSail Interactive',
      position: 'Frontend Engineer',
      startDate: '2019-07',
      endDate: '2021-02',
      current: false,
      description: [
        'Developed core modules for an e-commerce marketing platform, including campaign builders, product placement tools, and analytics dashboards for peak-season operations.',
        'Migrated legacy jQuery pages to Vue and TypeScript, delivered 20+ reusable components, and improved day-to-day feature delivery efficiency by roughly 25%.',
        'Worked with backend, QA, and product teams to rebuild tracking and funnel analytics, helping improve click-to-conversion rate by 12% on major campaigns.'
      ],
      location: 'Shanghai, China'
    }
  ],
  education: [
    {
      id: '1',
      school: 'East China University of Science and Technology',
      degree: 'Bachelor of Engineering',
      major: 'Software Engineering',
      startDate: '2015-09',
      endDate: '2019-06',
      gpa: '3.7/4.0',
      description: 'Coursework in software engineering, data structures, computer networks, operating systems, and database systems; won university scholarship for two consecutive years.'
    }
  ],
  skills: [
    { id: '1', name: 'TypeScript', level: 92, category: 'Programming Languages' },
    { id: '2', name: 'React', level: 90, category: 'Frontend Frameworks' },
    { id: '3', name: 'Next.js', level: 84, category: 'Frontend Frameworks' },
    { id: '4', name: 'Vue.js', level: 82, category: 'Frontend Frameworks' },
    { id: '5', name: 'Node.js', level: 76, category: 'Backend Collaboration' },
    { id: '6', name: 'Performance Optimization', level: 88, category: 'Engineering Excellence' },
    { id: '7', name: 'Design Systems / Component Libraries', level: 85, category: 'Engineering Excellence' },
    { id: '8', name: 'ECharts / Data Visualization', level: 83, category: 'Business Delivery' }
  ],
  projects: [
    {
      id: '1',
      name: 'Business Analytics Workspace',
      description: 'A management dashboard for executive and operations teams with KPI tracking, anomaly alerts, and multidimensional drill-down analysis.',
      technologies: ['React', 'TypeScript', 'ECharts', 'Ant Design', 'React Query'],
      startDate: '2022-01',
      endDate: '2022-08',
      highlights: [
        'Owned frontend solution design and core delivery, building chart modules and KPI cards that supported 40+ business indicators in one workspace.',
        'Optimized chart rendering and API concurrency, reducing dashboard first render time by 38% and improving stability for leadership review scenarios.',
        'Launched anomaly alert workflows that helped operations teams shorten issue discovery time from hours to minutes.'
      ],
      url: 'https://example.com/ops-dashboard'
    },
    {
      id: '2',
      name: 'Low-Code Campaign Builder',
      description: 'A marketing platform enabling operations teams to visually assemble landing pages, configure modules, and publish campaigns with minimal engineering support.',
      technologies: ['Vue.js', 'TypeScript', 'Vite', 'Pinia'],
      startDate: '2020-05',
      endDate: '2021-01',
      highlights: [
        'Built configuration panels, reusable templates, and release validation flows, allowing non-technical operators to launch campaign pages independently and cutting repetitive frontend requests by 70%.',
        'Integrated tracking and experimentation capabilities to speed up campaign validation and improve conversion rate by 15% on key initiatives.',
        'Established a reusable page asset library with 30+ modules, significantly reducing delivery cost for major promotional events.'
      ]
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'PMP - Project Management Professional',
      issuer: 'PMI',
      date: '2022-05',
      description: 'Demonstrates structured project coordination and cross-functional execution capability.'
    }
  ],
  languages: [
    { id: '1', name: 'Chinese', level: 'Native' },
    { id: '2', name: 'English', level: 'Professional working proficiency' }
  ],
  awards: [
    {
      id: '1',
      title: 'Annual Technical Impact Award',
      issuer: 'Yunji Technology Co., Ltd.',
      date: '2023-12',
      description: 'Recognized for leading engineering standards and performance optimization initiatives.'
    }
  ]
}

/**
 * 获取默认简历数据
 */
export const getDefaultResumeData = (locale: 'zh' | 'en' = 'zh'): ResumeData => {
  return locale === 'en' ? defaultResumeDataEn : defaultResumeDataZh
}
