import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Download, Sparkles, Trash2, Plus } from 'lucide-react'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.3.6
 * 
 * Button 组件故事
 * 展示 Button 组件的各种用法和变体
 */

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '通用按钮组件，支持多种样式变体、尺寸和图标。基于 Radix UI 和 CVA 构建。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: '按钮样式变体',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: '按钮尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用按钮',
    },
    asChild: {
      control: 'boolean',
      description: '是否作为子组件渲染',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 默认按钮
export const Default: Story = {
  args: {
    children: '默认按钮',
    variant: 'default',
    size: 'default',
  },
}

// 所有变体
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">默认</Button>
      <Button variant="destructive">危险</Button>
      <Button variant="outline">轮廓</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="ghost">幽灵</Button>
      <Button variant="link">链接</Button>
    </div>
  ),
}

// 所有尺寸
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">小号</Button>
      <Button size="default">默认</Button>
      <Button size="lg">大号</Button>
    </div>
  ),
}

// 带图标
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Download className="h-4 w-4" />
        下载
      </Button>
      <Button variant="outline">
        <Sparkles className="h-4 w-4" />
        AI 优化
      </Button>
      <Button variant="destructive">
        <Trash2 className="h-4 w-4" />
        删除
      </Button>
      <Button variant="secondary">
        <Plus className="h-4 w-4" />
        添加
      </Button>
    </div>
  ),
}

// 图标按钮
export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="icon" variant="default">
        <Download className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Sparkles className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
}

// 禁用状态
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>默认禁用</Button>
      <Button variant="outline" disabled>
        轮廓禁用
      </Button>
      <Button variant="destructive" disabled>
        危险禁用
      </Button>
    </div>
  ),
}

// 加载状态
export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        加载中...
      </Button>
      <Button variant="outline" disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        处理中...
      </Button>
    </div>
  ),
}

// 完整宽度
export const FullWidth: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Button className="w-full">完整宽度按钮</Button>
      <Button variant="outline" className="w-full">
        完整宽度轮廓按钮
      </Button>
    </div>
  ),
}

// 响应式尺寸
export const Responsive: Story = {
  render: () => (
    <Button className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3">
      响应式按钮
    </Button>
  ),
}

// 组合示例 - 实际使用场景
export const RealWorldExample: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-3">简历操作</h3>
        <div className="flex gap-3">
          <Button>
            <Sparkles className="h-4 w-4" />
            AI 优化
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            导出 PDF
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">表单操作</h3>
        <div className="flex gap-3">
          <Button variant="default">保存</Button>
          <Button variant="outline">取消</Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">导航操作</h3>
        <div className="flex gap-3">
          <Button variant="link">了解更多</Button>
          <Button variant="ghost">返回</Button>
        </div>
      </div>
    </div>
  ),
}

