/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { StyleProvider } from '@/contexts/StyleContext'
import { ToastProvider } from '@/components/Toast'
import { Skill } from '@/types/resume'
import { SkillsForm } from '../SkillsForm'

jest.mock('framer-motion', () => {
  const ReactLib = jest.requireActual<typeof import('react')>('react')

  /**
   * 创建无动画包装组件
   * 在测试环境中保留 DOM 结构，避免动画和 ref 干扰交互断言。
   */
  const createPassthroughComponent = (tag: keyof JSX.IntrinsicElements = 'div') =>
    ReactLib.forwardRef(({ children, ...props }: React.ComponentPropsWithoutRef<'div'>, ref: React.Ref<HTMLDivElement>) =>
      ReactLib.createElement(tag, { ...props, ref }, children)
    )

  /**
   * 创建 Reorder 包装组件
   * 过滤测试环境不认识的拖拽属性，避免控制台出现无关告警。
   */
  const createReorderComponent = () =>
    ReactLib.forwardRef(({
      children,
      axis: _axis,
      onReorder: _onReorder,
      values: _values,
      value: _value,
      layoutScroll: _layoutScroll,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & {
      axis?: string
      onReorder?: unknown
      values?: unknown
      value?: unknown
      layoutScroll?: boolean
    }, ref: React.Ref<HTMLDivElement>) =>
      ReactLib.createElement('div', { ...props, ref }, children)
    )

  const motion = new Proxy({}, {
    get: (_target, key: string) => createPassthroughComponent(key as keyof JSX.IntrinsicElements)
  })

  return {
    __esModule: true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion,
    Reorder: {
      Group: createReorderComponent(),
      Item: createReorderComponent()
    }
  }
})

interface SkillsHarnessProps {
  initialSkills: Skill[]
}

/**
 * 技能表单测试容器
 * 使用真实状态承接 onChange，验证一键重整后的写回结果。
 */
function SkillsHarness({ initialSkills }: SkillsHarnessProps) {
  const [skills, setSkills] = useState(initialSkills)

  return (
    <LanguageProvider>
      <ToastProvider>
        <StyleProvider>
          <div data-testid="skill-categories">
            {skills.map((skill) => `${skill.name}:${skill.category}`).join('|')}
          </div>
          <SkillsForm
            skills={skills}
            onChange={setSkills}
            showSectionHeader={false}
          />
        </StyleProvider>
      </ToastProvider>
    </LanguageProvider>
  )
}

describe('SkillsForm', () => {
  /**
   * 验证智能重整写回
   * 当存在明显错位分类时，应用建议后应真正更新技能分类，并支持一次撤销。
   */
  it('可以应用并撤销已有技能的一键重整分类', async () => {
    const initialSkills: Skill[] = [
      {
        id: 'skill-1',
        name: '沟通协调',
        level: 75,
        category: '前端开发',
        color: '#2563EB'
      },
      {
        id: 'skill-2',
        name: '数据分析',
        level: 80,
        category: '前端开发',
        color: '#2563EB'
      },
      {
        id: 'skill-3',
        name: 'React',
        level: 90,
        category: '前端框架',
        color: '#2563EB'
      }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.click(screen.getByRole('button', { name: '智能重整分类' }))

    expect(screen.getByText('智能分类建议')).toBeInTheDocument()
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('沟通协调:前端开发')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('数据分析:前端开发')

    fireEvent.click(screen.getByRole('button', { name: '应用调整' }))

    expect(screen.getByText('分类重整已应用')).toBeInTheDocument()
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('沟通协调:通用能力')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('数据分析:数据分析')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('React:前端框架')

    fireEvent.click(screen.getByRole('button', { name: '撤销本次调整' }))

    expect(screen.getByTestId('skill-categories')).toHaveTextContent('沟通协调:前端开发')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('数据分析:前端开发')
  })

  /**
   * 验证手动锁定分类
   * 用户手动修改分类后应自动锁定，该技能不再参与智能重整。
   */
  it('手动修改分类后会自动锁定并跳过智能重整', () => {
    const initialSkills: Skill[] = [
      {
        id: 'skill-1',
        name: 'Node.js',
        level: 80,
        category: '后端技术',
        color: '#2563EB'
      }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '前端开发' }
    })

    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Node.js:前端开发')
    expect(screen.getByRole('button', { name: '已锁定分类' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '智能重整分类' }))

    expect(screen.getByText('没有发现需要自动重整的分类')).toBeInTheDocument()
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Node.js:前端开发')
  })

  /**
   * 验证批量锁定与筛选
   * 锁定全部后应支持仅查看锁定项，再解锁全部时显示锁定空态。
   */
  it('支持锁定全部、解锁全部和仅看锁定项', () => {
    const initialSkills: Skill[] = [
      { id: 'skill-1', name: 'React', level: 90, category: '前端框架', color: '#2563EB' },
      { id: 'skill-2', name: 'Node.js', level: 80, category: '后端技术', color: '#10B981' }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.click(screen.getByRole('button', { name: '锁定全部' }))
    fireEvent.click(screen.getByRole('button', { name: '仅看锁定项' }))

    expect(screen.getByText('当前仅显示锁定项')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '解锁全部' }))

    expect(screen.getByText('当前没有锁定的技能项，可先手动改分类或点击“锁定全部”。')).toBeInTheDocument()
  })

  /**
   * 验证重复技能清理
   * 点击清理建议后应合并重复项并规范同义技能名称。
   */
  it('可以应用重复技能清理', () => {
    const initialSkills: Skill[] = [
      { id: 'skill-1', name: 'ReactJS', level: 80, category: '前端开发', color: '#2563EB' },
      { id: 'skill-2', name: 'React.js', level: 90, category: '前端开发', color: '#2563EB' },
      { id: 'skill-3', name: 'Nodejs', level: 75, category: '后端技术', color: '#10B981' }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.click(screen.getByRole('button', { name: '清理重复技能' }))

    expect(screen.getByText('技能清理建议')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '应用清理' }))

    expect(screen.getByTestId('skill-categories')).toHaveTextContent('React:前端开发')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Node.js:后端技术')
    expect(screen.getByTestId('skill-categories').textContent).not.toContain('ReactJS')
    expect(screen.getByTestId('skill-categories').textContent).not.toContain('React.js')
  })

  /**
   * 验证批量输入即时提示
   * 输入同义技能时，应展示自动成组和合并预判，并按预判结果控制新增按钮文案。
   */
  it('支持展示批量输入的自动成组与合并提示', () => {
    const initialSkills: Skill[] = [
      { id: 'skill-1', name: 'Node.js', level: 85, category: '后端技术', color: '#10B981' }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.change(screen.getByPlaceholderText('例如：React, TypeScript, Node.js, 产品设计'), {
      target: { value: 'Nodejs, Type Script' }
    })

    expect(screen.getByText('将按分类自动成组加入')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Nodejs')).toBeInTheDocument()
    expect(screen.getByText('并入现有项')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加 1 项' })).toBeInTheDocument()
  })

  /**
   * 验证技能清理后的撤销
   * 应用重复技能清理后，应支持恢复到清理前的原始技能列表。
   */
  it('可以撤销重复技能清理', () => {
    const initialSkills: Skill[] = [
      { id: 'skill-1', name: 'Node.js', level: 85, category: '后端技术', color: '#10B981' },
      { id: 'skill-2', name: 'Nodejs', level: 70, category: '后端开发', color: '#10B981' },
      { id: 'skill-3', name: 'TypeScript', level: 90, category: '编程语言', color: '#2563EB' },
      { id: 'skill-4', name: 'Type Script', level: 70, category: '通用能力', color: '#2563EB' }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.click(screen.getByRole('button', { name: '清理重复技能' }))
    fireEvent.click(screen.getByRole('button', { name: '应用清理' }))

    expect(screen.getByTestId('skill-categories').textContent).not.toContain('Nodejs')
    expect(screen.getByTestId('skill-categories').textContent).not.toContain('Type Script')
    expect(screen.getByText('技能清理已应用')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '撤销本次调整' }))

    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Nodejs:后端开发')
    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Type Script:通用能力')
  })

  /**
   * 验证锁定筛选后的批量录入
   * 先走一遍锁定与筛选链路，再确认批量输入仍会按预判结果新增并跳过同义重复项。
   */
  it('在锁定筛选链路后仍可按预判结果新增技能', () => {
    const initialSkills: Skill[] = [
      { id: 'skill-1', name: 'React / Next.js', level: 95, category: '前端框架', color: '#2563EB' },
      { id: 'skill-2', name: 'TypeScript', level: 90, category: '编程语言', color: '#2563EB' },
      { id: 'skill-3', name: 'Node.js', level: 85, category: '后端技术', color: '#10B981' },
      { id: 'skill-4', name: '性能优化', level: 85, category: '核心能力', color: '#F59E0B' },
      { id: 'skill-5', name: 'CI/CD', level: 80, category: '工程化', color: '#4B5563' }
    ]

    render(<SkillsHarness initialSkills={initialSkills} />)

    fireEvent.click(screen.getByRole('button', { name: '锁定全部' }))
    fireEvent.click(screen.getByRole('button', { name: '仅看锁定项' }))
    fireEvent.click(screen.getByRole('button', { name: '解锁全部' }))
    fireEvent.click(screen.getByRole('button', { name: '仅看锁定项' }))

    fireEvent.change(screen.getByPlaceholderText('例如：React, TypeScript, Node.js, 产品设计'), {
      target: { value: 'Nodejs, Figma' }
    })
    fireEvent.click(screen.getByRole('button', { name: '添加 1 项' }))

    expect(screen.getByTestId('skill-categories')).toHaveTextContent('Figma:设计能力')
    expect(screen.getByTestId('skill-categories').textContent).not.toContain('Nodejs:')
  })
})
