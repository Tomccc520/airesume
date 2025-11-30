/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, BookOpen, Palette, Minus, Crown, Check, Briefcase, Eye, Globe } from 'lucide-react'
import { TemplateStyle } from '@/types/template'
import { templateCategories, resumeTemplates } from '@/data/templates'
import { ResumeData } from '@/types/resume'
import TemplatePreview from './TemplatePreview'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: TemplateStyle) => void
  onUpdateResumeData?: (data: ResumeData) => void
  currentTemplate?: string
}

/**
 * 模板选择器组件
 * 提供模板分类浏览和选择功能，包含职业模板
 */
export default function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  onUpdateResumeData,
  currentTemplate 
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('career')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateStyle | null>(null)
  const [showFullLibrary, setShowFullLibrary] = useState(false)

  // 热门模板ID列表
  const popularTemplateIds = ['modern-blue', 'modern-green', 'creative-purple', 'elegant-rose', 'tech-orange']
  
  // 获取热门模板
  const getPopularTemplates = () => {
    return resumeTemplates.filter(template => popularTemplateIds.includes(template.id) && !template.hidden)
  }

  // 获取图标组件
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Zap,
      BookOpen,
      Palette,
      Minus,
      Briefcase,
      Globe
    }
    return icons[iconName] || Zap
  }

  // 处理职业模板应用
  const handleApplyCareerTemplate = (templateId: string) => {
    console.log('=== 开始应用职业模板 ===')
    console.log('模板ID:', templateId)
    
    // 根据模板ID获取对应的职业简历数据
    const careerTemplateData = getCareerTemplateData(templateId)
    console.log('职业模板数据:', careerTemplateData)
    console.log('模板数据中的个人信息:', careerTemplateData?.personalInfo)
    console.log('模板数据中的工作经历:', careerTemplateData?.experience)
    console.log('onUpdateResumeData 回调:', onUpdateResumeData)
    
    if (careerTemplateData && onUpdateResumeData) {
      console.log('正在更新简历数据...')
      console.log('即将传递的完整数据:', JSON.stringify(careerTemplateData, null, 2))
      onUpdateResumeData(careerTemplateData)
      console.log('数据更新完成，关闭模板选择器')
      onClose()
    } else {
      console.error('无法更新简历数据:', { careerTemplateData, onUpdateResumeData })
    }
    console.log('=== 职业模板应用结束 ===')
  }

  // 获取职业模板数据
  const getCareerTemplateData = (templateId: string): ResumeData | null => {
    const baseTemplate: ResumeData = {
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: []
    }

    switch (templateId) {
      case 'career-ui-designer':
        return {
          ...baseTemplate,
          personalInfo: {
            name: '张小美',
            title: 'UI设计师',
            email: 'zhangxiaomei@example.com',
            phone: '138-0000-0000',
            location: '北京市朝阳区',
            website: 'https://portfolio.zhangxiaomei.com',
            summary: '拥有5年UI设计经验，专注于移动端和Web端产品设计。熟练掌握Figma、Sketch、Adobe Creative Suite等设计工具，具备良好的用户体验思维和视觉设计能力。擅长从用户需求出发，设计简洁美观且易用的界面，曾参与多个千万级用户产品的设计工作。'
          },
          experience: [
            {
              id: '1',
              company: '字节跳动',
              position: '高级UI设计师',
              startDate: '2021-03',
              endDate: '至今',
              current: true,
              description: [
                '负责抖音App核心功能的UI设计，参与用户体验优化项目，设计的界面获得用户好评率95%以上',
                '主导抖音创作者中心界面重设计，通过优化信息架构和视觉层级，提升创作效率30%',
                '设计并实施设计系统，建立统一的视觉语言和组件库，提高团队协作效率50%',
                '协助产品团队完成A/B测试，通过数据驱动的设计优化，提升用户转化率15%'
              ],
              location: '北京'
            },
            {
              id: '2',
              company: '美团',
              position: 'UI设计师',
              startDate: '2019-06',
              endDate: '2021-02',
              current: false,
              description: [
                '负责美团外卖商家端产品设计，从需求分析到最终交付的全流程参与',
                '重新设计商家管理后台，优化操作流程和界面布局，提升操作效率25%',
                '建立移动端设计规范，制定交互标准和视觉规范，提高团队设计一致性',
                '参与用户调研和可用性测试，深入了解商家需求痛点，为产品迭代提供设计依据'
              ],
              location: '北京'
            }
          ],
          education: [
            {
              id: '1',
              school: '中央美术学院',
              degree: '学士',
              major: '视觉传达设计',
              startDate: '2015-09',
              endDate: '2019-06',
              gpa: '3.8/4.0'
            }
          ],
          skills: [
            {
              id: '1',
              name: 'Figma',
              level: 90,
              category: 'design'
            },
            {
              id: '2',
              name: 'Sketch',
              level: 90,
              category: 'design'
            },
            {
              id: '3',
              name: 'Adobe Creative Suite',
              level: 80,
              category: 'design'
            },
            {
              id: '4',
              name: 'Principle',
              level: 80,
              category: 'design'
            },
            {
              id: '5',
              name: 'HTML/CSS',
              level: 70,
              category: 'technical'
            }
          ],
          projects: [
            {
              id: '1',
              name: '智能家居控制App',
              description: '为智能家居公司设计的移动端控制应用，支持多设备管理和场景控制。采用卡片式设计语言，通过直观的可视化界面让用户轻松管理家中的智能设备。',
              technologies: ['Figma', 'Principle', 'Zeplin', 'Sketch'],
              startDate: '2022-01',
              endDate: '2022-04',
              url: 'https://dribbble.com/shots/smart-home-app',
              highlights: [
                '获得2022年UI设计大赛金奖，在300+参赛作品中脱颖而出',
                '用户满意度达到4.8/5.0，获得用户高度认可',
                'App上线后下载量突破10万次，月活跃用户超过8万'
              ]
            },
            {
              id: '2',
              name: '在线教育平台重设计',
              description: '对现有在线教育平台进行全面的UI/UX重设计，优化学习体验和课程展示。通过用户研究和数据分析，重新设计信息架构和交互流程。',
              technologies: ['Figma', 'Adobe XD', 'Miro', 'Hotjar'],
              startDate: '2021-08',
              endDate: '2021-12',
              highlights: [
                '课程完成率提升40%，用户学习时长增加35%',
                '新用户注册转化率提升28%',
                '获得公司年度最佳设计项目奖'
              ]
            }
          ]
        }
      case 'career-frontend-developer':
        return {
          ...baseTemplate,
          personalInfo: {
            name: '李小码',
            title: '前端开发工程师',
            email: 'lixiaoma@example.com',
            phone: '138-1111-1111',
            location: '上海市浦东新区',
            website: 'https://github.com/lixiaoma',
            summary: '5年前端开发经验，精通React、Vue等主流框架，熟悉现代前端工程化工具链。具备良好的代码规范意识和团队协作能力，热爱技术分享。擅长构建高性能、可维护的前端应用，对用户体验和代码质量有着严格的要求。'
          },
          experience: [
            {
              id: '1',
              company: '阿里巴巴',
              position: '高级前端工程师',
              startDate: '2021-07',
              endDate: '至今',
              current: true,
              description: [
                '负责淘宝商家工作台前端开发，参与大型项目架构设计和技术选型',
                '主导商家工作台重构项目，采用微前端架构，页面加载速度提升40%，用户体验显著改善',
                '建立前端监控体系，接入性能监控和错误追踪，线上问题发现率提升60%，故障响应时间缩短50%',
                '指导3名初级工程师成长，负责团队技术分享和代码Review，提升团队整体技术水平'
              ],
              location: '杭州'
            },
            {
              id: '2',
              company: '滴滴出行',
              position: '前端工程师',
              startDate: '2019-03',
              endDate: '2021-06',
              current: false,
              description: [
                '负责滴滴司机端App内H5页面开发，参与移动端性能优化和用户体验提升项目',
                '开发司机注册流程优化项目，通过表单优化和流程简化，注册转化率提升20%',
                '主导H5页面性能优化，通过代码分割、懒加载等技术手段，首屏加载时间减少50%',
                '参与技术分享和最佳实践推广，获得团队技术创新奖'
              ],
              location: '北京'
            }
          ],
          education: [
            {
              id: '1',
              school: '华东理工大学',
              degree: '学士',
              major: '计算机科学与技术',
              startDate: '2015-09',
              endDate: '2019-06',
              gpa: '3.7/4.0'
            }
          ],
          skills: [
            {
              id: '1',
              name: 'React',
              level: 90,
              category: 'frontend'
            },
            {
              id: '2',
              name: 'Vue.js',
              level: 90,
              category: 'frontend'
            },
            {
              id: '3',
              name: 'TypeScript',
              level: 90,
              category: 'frontend'
            },
            {
              id: '4',
              name: 'Next.js',
              level: 80,
              category: 'frontend'
            },
            {
              id: '5',
              name: 'Webpack',
              level: 80,
              category: 'tools'
            },
            {
              id: '6',
              name: 'Node.js',
              level: 70,
              category: 'backend'
            }
          ],
          projects: [
            {
              id: '1',
              name: '电商管理后台系统',
              description: '基于React + TypeScript + Ant Design开发的现代化电商管理后台，支持商品管理、订单处理、数据统计等核心功能。采用微服务架构，支持多租户模式。',
              technologies: ['React', 'TypeScript', 'Ant Design', 'Echarts', 'Redux Toolkit'],
              startDate: '2022-03',
              endDate: '2022-08',
              url: 'https://github.com/lixiaoma/ecommerce-admin',
              highlights: [
                '支持10万+商品数据管理，通过虚拟滚动和分页优化，保证流畅的用户体验',
                '页面响应时间控制在200ms内，通过缓存策略和接口优化实现',
                '获得公司技术创新奖，被作为最佳实践在团队内推广'
              ]
            },
            {
              id: '2',
              name: '实时数据可视化大屏',
              description: '为企业打造的实时数据监控大屏，支持多种图表类型和实时数据更新。采用WebSocket技术实现数据实时推送，支持自定义配置和主题切换。',
              technologies: ['Vue 3', 'TypeScript', 'Echarts', 'WebSocket', 'Vite'],
              startDate: '2021-10',
              endDate: '2022-01',
              highlights: [
                '支持同时展示50+实时数据指标，刷新频率达到秒级',
                '自适应不同屏幕尺寸，支持4K大屏显示',
                '获得客户高度认可，后续签约3个类似项目'
              ]
            }
          ]
        }
      case 'career-backend-developer':
        return {
          ...baseTemplate,
          personalInfo: {
            name: '王小服',
            title: '后端开发工程师',
            email: 'wangxiaofu@example.com',
            phone: '138-2222-2222',
            location: '深圳市南山区',
            website: 'https://github.com/wangxiaofu',
            summary: '6年后端开发经验，精通Java、Python等编程语言，熟悉微服务架构和分布式系统设计。具备丰富的高并发系统开发经验，擅长系统性能优化和架构设计。对技术有着深度的理解和持续的学习热情。'
          },
          experience: [
            {
              id: '1',
              company: '腾讯',
              position: '高级后端工程师',
              startDate: '2020-08',
              endDate: '至今',
              current: true,
              description: [
                '负责微信支付核心系统开发，参与大型分布式系统架构设计和性能优化',
                '设计并实现支付系统重构，采用微服务架构，系统处理能力提升3倍，支持日均千万级交易',
                '优化数据库查询性能，通过索引优化和查询重构，响应时间减少70%',
                '建立完善的监控告警体系，实现全链路监控，系统可用性达99.99%'
              ],
              location: '深圳'
            },
            {
              id: '2',
              company: '京东',
              position: '后端工程师',
              startDate: '2018-06',
              endDate: '2020-07',
              current: false,
              description: [
                '负责京东商城订单系统开发，参与双11大促技术保障工作',
                '开发高并发订单处理系统，支持日均千万级订单处理，峰值QPS达到10万+',
                '参与双11技术保障，通过容量规划和性能优化，确保系统零故障运行',
                '设计并实现多级缓存策略，系统响应速度提升50%，用户体验显著改善'
              ],
              location: '北京'
            }
          ],
          education: [
            {
              id: '1',
              school: '北京理工大学',
              degree: '硕士',
              major: '软件工程',
              startDate: '2016-09',
              endDate: '2018-06',
              gpa: '3.9/4.0'
            },
            {
              id: '2',
              school: '华中科技大学',
              degree: '学士',
              major: '计算机科学与技术',
              startDate: '2012-09',
              endDate: '2016-06',
              gpa: '3.8/4.0'
            }
          ],
          skills: [
            {
              id: '1',
              name: 'Java',
              level: 90,
              category: 'backend'
            },
            {
              id: '2',
              name: 'Spring Boot',
              level: 90,
              category: 'backend'
            },
            {
              id: '3',
              name: 'MySQL',
              level: 90,
              category: 'database'
            },
            {
              id: '4',
              name: 'Redis',
              level: 90,
              category: 'database'
            },
            {
              id: '5',
              name: 'Docker',
              level: 80,
              category: 'tools'
            },
            {
              id: '6',
              name: 'Kubernetes',
              level: 70,
              category: 'tools'
            }
          ],
          projects: [
            {
              id: '1',
              name: '分布式消息队列系统',
              description: '基于Kafka设计的高性能分布式消息队列系统，支持百万级消息处理。具备消息持久化、故障恢复、负载均衡等核心功能。',
              technologies: ['Java', 'Kafka', 'Zookeeper', 'Docker', 'Spring Boot'],
              startDate: '2021-09',
              endDate: '2022-02',
              url: 'https://github.com/wangxiaofu/distributed-mq',
              highlights: [
                '支持每秒10万条消息处理，延迟控制在10ms以内',
                '消息投递成功率达99.9%，具备完善的容错机制',
                '获得公司技术突破奖，被多个业务线采用'
              ]
            },
            {
              id: '2',
              name: '微服务架构改造',
              description: '将传统单体应用改造为微服务架构，提升系统的可扩展性和可维护性。采用Spring Cloud技术栈，实现服务注册发现、配置管理、熔断降级等功能。',
              technologies: ['Spring Cloud', 'Docker', 'Jenkins', 'MySQL', 'Redis'],
              startDate: '2020-03',
              endDate: '2020-10',
              highlights: [
                '系统部署效率提升80%，发布周期从周级缩短到天级',
                '服务可用性提升到99.95%，故障影响范围大幅缩小',
                '团队开发效率提升50%，支持多团队并行开发'
              ]
            }
          ]
        }
      case 'career-operations':
        return {
          ...baseTemplate,
          personalInfo: {
            name: '刘小运',
            title: '运营专员',
            email: 'liuxiaoyun@example.com',
            phone: '138-3333-3333',
            location: '广州市天河区',
            website: 'https://linkedin.com/in/liuxiaoyun',
            summary: '4年互联网运营经验，擅长用户增长、内容运营和数据分析。具备敏锐的市场洞察力和优秀的沟通协调能力。熟悉各类运营工具和数据分析方法，能够通过数据驱动运营决策，实现业务目标。'
          },
          experience: [
            {
              id: '1',
              company: '网易',
              position: '高级运营专员',
              startDate: '2021-01',
              endDate: '至今',
              current: true,
              description: [
                '负责网易云音乐用户增长运营，制定并执行用户获取和留存策略',
                '策划多场用户增长活动，通过精准投放和创意营销，新用户注册量提升35%',
                '优化用户留存策略，建立用户生命周期管理体系，月活跃用户增长25%',
                '建立用户分层运营体系，针对不同用户群体制定个性化运营策略，转化率提升40%'
              ],
              location: '广州'
            },
            {
              id: '2',
              company: '小红书',
              position: '内容运营',
              startDate: '2019-07',
              endDate: '2020-12',
              current: false,
              description: [
                '负责小红书美妆频道内容运营，管理KOL合作和内容质量控制',
                '管理100+美妆KOL资源，制定内容合作策略，频道内容曝光量提升60%',
                '策划多个爆款内容营销活动，单篇笔记最高获得50万点赞，10万转发',
                '建立内容质量评估体系，优化内容审核流程，优质内容占比提升30%'
              ],
              location: '上海'
            }
          ],
          education: [
            {
              id: '1',
              school: '中山大学',
              degree: '学士',
              major: '市场营销',
              startDate: '2015-09',
              endDate: '2019-06',
              gpa: '3.6/4.0'
            }
          ],
          skills: [
            {
              id: '1',
              name: '数据分析',
              level: 80,
              category: 'analysis'
            },
            {
              id: '2',
              name: '内容运营',
              level: 90,
              category: 'operations'
            },
            {
              id: '3',
              name: '用户增长',
              level: 90,
              category: 'operations'
            },
            {
              id: '4',
              name: 'SEM/SEO',
              level: 80,
              category: 'marketing'
            },
            {
              id: '5',
              name: '社群运营',
              level: 80,
              category: 'operations'
            }
          ],
          projects: [
            {
              id: '1',
              name: '双11购物节营销活动',
              description: '策划并执行双11购物节全链路营销活动，涵盖预热、爆发、收尾三个阶段。通过多渠道整合营销，实现品牌曝光和销售转化的双重目标。',
              technologies: ['数据分析', '用户调研', '活动策划', '效果监测'],
              startDate: '2022-09',
              endDate: '2022-11',
              highlights: [
                '活动期间GMV增长150%，超额完成销售目标',
                '新用户获取成本降低30%，ROI达到1:4.5',
                '用户参与度达到历史最高，活动页面PV突破500万'
              ]
            },
            {
              id: '2',
              name: '品牌社群运营体系搭建',
              description: '从0到1搭建品牌社群运营体系，包括社群定位、用户画像、内容策略、活动规划等。通过精细化运营提升用户粘性和品牌忠诚度。',
              technologies: ['社群运营', '内容策划', '用户研究', '数据分析'],
              startDate: '2021-06',
              endDate: '2021-12',
              highlights: [
                '社群用户数量从0增长到5万+，月活跃率达到70%',
                '用户复购率提升45%，客单价提升25%',
                '获得公司年度最佳运营项目奖'
              ]
            }
          ]
        }
      case 'career-product-manager':
        return {
          ...baseTemplate,
          personalInfo: {
            name: '陈小产',
            title: '产品经理',
            email: 'chenxiaochan@example.com',
            phone: '138-4444-4444',
            location: '杭州市西湖区',
            website: 'https://linkedin.com/in/chenxiaochan',
            summary: '5年产品经验，擅长B端和C端产品设计，具备敏锐的用户洞察力和优秀的跨部门协作能力。成功主导多个千万级用户产品的设计和优化。熟悉敏捷开发流程，具备数据驱动的产品思维和商业敏感度。'
          },
          experience: [
            {
              id: '1',
              company: '蚂蚁集团',
              position: '高级产品经理',
              startDate: '2020-09',
              endDate: '至今',
              current: true,
              description: [
                '负责支付宝商家服务产品线，从0到1设计商家数字化解决方案',
                '主导商家服务平台产品设计，通过深度用户调研和需求分析，服务商家数量突破100万',
                '设计智能推荐系统，基于机器学习算法优化商家服务匹配，商家转化率提升45%',
                '建立完善的产品数据体系，通过A/B测试和数据分析驱动产品迭代，决策效率提升60%'
              ],
              location: '杭州'
            },
            {
              id: '2',
              company: '美团',
              position: '产品经理',
              startDate: '2018-03',
              endDate: '2020-08',
              current: false,
              description: [
                '负责美团外卖C端产品优化，专注用户体验提升和转化率优化',
                '重设计订单流程，通过用户行为分析和交互优化，下单转化率提升25%',
                '推出个性化推荐功能，基于用户画像和行为数据，用户复购率提升30%',
                '优化配送体验产品功能，通过实时追踪和智能预估，用户满意度提升至4.8分'
              ],
              location: '北京'
            }
          ],
          education: [
            {
              id: '1',
              school: '浙江大学',
              degree: '硕士',
              major: '工商管理',
              startDate: '2016-09',
              endDate: '2018-06',
              gpa: '3.8/4.0'
            },
            {
              id: '2',
              school: '华南理工大学',
              degree: '学士',
              major: '软件工程',
              startDate: '2012-09',
              endDate: '2016-06',
              gpa: '3.7/4.0'
            }
          ],
          skills: [
            {
              id: '1',
              name: '产品设计',
              level: 90,
              category: 'product'
            },
            {
              id: '2',
              name: '用户研究',
              level: 90,
              category: 'research'
            },
            {
              id: '3',
              name: '数据分析',
              level: 80,
              category: 'analysis'
            },
            {
              id: '4',
              name: '项目管理',
              level: 80,
              category: 'management'
            },
            {
              id: '5',
              name: 'Axure/Figma',
              level: 80,
              category: 'tools'
            }
          ],
          projects: [
            {
              id: '1',
              name: '智能客服系统',
              description: '设计基于AI的智能客服系统，提升客户服务效率和用户满意度。通过自然语言处理和机器学习技术，实现智能问答和工单自动分类。',
              technologies: ['产品设计', '用户研究', 'AI技术', '数据分析'],
              startDate: '2021-06',
              endDate: '2022-01',
              highlights: [
                '客服效率提升70%，人工客服工作量减少50%',
                '用户问题解决率达到85%，用户满意度提升至4.6分',
                '获得公司产品创新奖，节省人力成本200万/年'
              ]
            },
            {
              id: '2',
              name: '移动支付产品优化',
              description: '针对移动支付产品进行全面的用户体验优化，包括支付流程简化、安全性提升、界面重设计等。通过数据分析和用户反馈持续迭代。',
              technologies: ['用户体验设计', 'A/B测试', '数据分析', '原型设计'],
              startDate: '2020-01',
              endDate: '2020-08',
              highlights: [
                '支付成功率提升15%，支付时长缩短30%',
                '用户投诉率下降40%，NPS评分提升至8.5',
                '日活跃用户增长20%，交易额增长35%'
              ]
            }
          ]
        }
      default:
        return null
    }
  }

  /**
   * 处理模板选择
   */
  const handleTemplateSelect = (template: TemplateStyle) => {
    if (template.category === 'career') {
      handleApplyCareerTemplate(template.id)
    } else {
      onSelectTemplate(template)
      onClose()
    }
  }

  /**
   * 获取当前分类的模板
   */
  const getCurrentCategoryTemplates = () => {
    if (selectedCategory === 'popular') {
      return getPopularTemplates()
    } else if (showFullLibrary) {
      return resumeTemplates.filter(t => !t.hidden)
    } else {
      const category = templateCategories.find(c => c.id === selectedCategory)
      return category?.templates || []
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg max-w-7xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100/50 bg-white/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              选择简历模板
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">选择一个适合你的专业模板，快速开始简历制作</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(95vh-120px)]">
          {/* 左侧分类导航 */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100/50 bg-gray-50/50 backdrop-blur-sm p-3 sm:p-4 lg:overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 px-2">模板分类</h3>
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
              {/* 热门模板选项 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCategory('popular')
                  setShowFullLibrary(false)
                }}
                className={`flex-shrink-0 lg:w-full text-left p-2 sm:p-3 rounded-xl transition-all flex items-start space-x-2 sm:space-x-3 ${
                  selectedCategory === 'popular'
                    ? 'bg-white shadow-sm ring-1 ring-red-100 text-red-600'
                    : 'hover:bg-white/60 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${selectedCategory === 'popular' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">热门模板</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">精选推荐模板</div>
                </div>
              </motion.button>
              
              {templateCategories.map((category) => {
                const IconComponent = getIcon(category.icon)
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowFullLibrary(false)
                    }}
                    className={`flex-shrink-0 lg:w-full text-left p-2 sm:p-3 rounded-xl transition-all flex items-start space-x-2 sm:space-x-3 ${
                      selectedCategory === category.id
                        ? 'bg-white shadow-sm ring-1 ring-blue-100 text-blue-600'
                        : 'hover:bg-white/60 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors border ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-gray-100 text-gray-500 border-transparent'
                    }`}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{category.name}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">{category.description}</div>
                    </div>
                  </motion.button>
                )
              })}
              
              {/* 浏览全部模板选项 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowFullLibrary(true)
                  setSelectedCategory('all')
                }}
                className={`flex-shrink-0 lg:w-full text-left p-2 sm:p-3 rounded-xl transition-all flex items-start space-x-2 sm:space-x-3 ${
                  showFullLibrary
                    ? 'bg-white shadow-sm ring-1 ring-green-100 text-green-600'
                    : 'hover:bg-white/60 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${showFullLibrary ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">浏览全部</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">查看所有模板</div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* 右侧模板网格 */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-white/30">
            {/* 标题和描述 */}
            <div className="mb-4 sm:mb-6">
              {selectedCategory === 'popular' ? (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">热门模板</h2>
                  <p className="text-sm sm:text-base text-gray-600">精选推荐的热门简历模板，适合各种职业场景</p>
                </>
              ) : showFullLibrary ? (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">全部模板</h2>
                  <p className="text-sm sm:text-base text-gray-600">浏览所有可用的简历模板</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {templateCategories.find(cat => cat.id === selectedCategory)?.name || '模板选择'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    {templateCategories.find(cat => cat.id === selectedCategory)?.description || '选择适合的简历模板'}
                  </p>
                </>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory + (showFullLibrary ? '-full' : '-cat')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6"
              >
                {getCurrentCategoryTemplates().map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      currentTemplate === template.id
                        ? 'bg-white ring-2 ring-blue-500 border-transparent'
                        : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      if (template.category === 'career') {
                        handleApplyCareerTemplate(template.id)
                      } else {
                        onSelectTemplate(template)
                        // onClose() - 不自动关闭，允许用户预览
                      }
                    }}
                  >
                    {/* 选中状态指示器 */}
                    {currentTemplate === template.id && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 z-10 bg-blue-500 text-white rounded-full p-1.5"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      </motion.div>
                    )}

                    {/* 高级模板标识 */}
                    {template.isPremium && (
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1.5">
                        <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}

                    {/* 模板预览图 */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-white/50 to-gray-100/50 relative overflow-hidden">
                      <TemplatePreview template={template} />
                      
                      {/* 悬停时显示预览按钮 */}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 backdrop-blur-[0px] group-hover:backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(template)
                          }}
                          className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-full font-medium border border-gray-200 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                          预览模板
                        </motion.button>
                      </div>
                    </div>

                    {/* 模板信息 */}
                    <div className="p-4 border-t border-white/40">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">{template.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed h-8">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5 hover:space-x-1 transition-all duration-300">
                          {Object.values(template.colors).slice(0, 4).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-black/5"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {template.isPremium && (
                          <span className="text-[10px] sm:text-xs bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                            高级版
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* 空状态 */}
            {getCurrentCategoryTemplates().length === 0 && (
              <div className="text-center py-12 sm:py-20 bg-white/30 rounded-xl border border-dashed border-gray-300/50 mx-auto max-w-lg mt-8 backdrop-blur-sm">
                <div className="text-gray-400 mb-4 bg-white/50 w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm">
                  <Palette className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">暂无模板</h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-xs mx-auto">该分类下暂时没有可用的模板，请尝试其他分类或浏览全部模板</p>
              </div>
            )}
          </div>
        </div>

              {/* 模板预览弹窗 */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 z-[60]"
              onClick={() => setPreviewTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg max-w-5xl w-full h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100/50 bg-white/80 backdrop-blur-md z-10">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{previewTemplate.description}</p>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 hover:bg-gray-100/80 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </motion.button>
                </div>
                
                <div className="flex-1 bg-gray-50/30 overflow-hidden relative">
                   <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-gray-200 rounded-lg max-w-3xl mx-auto min-h-full transform transition-transform origin-top"
                      >
                        <TemplatePreview template={previewTemplate} fullSize={true} />
                      </motion.div>
                   </div>
                </div>

                <div className="p-4 sm:p-6 border-t bg-white flex justify-between items-center z-10">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex space-x-2"
                  >
                     {Object.values(previewTemplate.colors).map((color, idx) => (
                       <motion.div 
                         key={idx} 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ delay: 0.5 + idx * 0.05 }}
                         className="w-6 h-6 rounded-full border border-gray-200" 
                         style={{ backgroundColor: color }} 
                       />
                     ))}
                  </motion.div>
                  <div className="flex space-x-4">
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPreviewTemplate(null)}
                      className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleTemplateSelect(previewTemplate)
                        setPreviewTemplate(null)
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all"
                    >
                      <Check className="w-5 h-5" />
                      使用此模板
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}