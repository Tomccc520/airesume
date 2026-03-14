# 开发者文档

## 📚 文档索引

### 快速开始
- [贡献指南](../CONTRIBUTING.md)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)

### 组件开发
- [组件开发指南](#组件开发指南)
- [Storybook 使用](#storybook-使用)
- [测试指南](#测试指南)

### 工具和脚本
- [开发工具脚本](#开发工具脚本)
- [代码规范](#代码规范)

---

## 🛠 开发环境设置

### 前置要求

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-repo/resume.git
cd resume

# 使用开发工具脚本初始化
./scripts/dev-tools.sh setup

# 或手动安装
npm install
```

### 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3002
```

---

## 📁 项目结构

```
resume/
├── .husky/                 # Git hooks
├── .storybook/             # Storybook 配置
├── docs/                   # 文档
├── public/                 # 静态资源
├── scripts/                # 开发脚本
├── src/
│   ├── app/                # Next.js 应用路由
│   │   ├── api/            # API 路由
│   │   ├── editor/         # 编辑器页面
│   │   └── page.tsx        # 首页
│   ├── components/         # React 组件
│   │   ├── ai/             # AI 相关组件
│   │   ├── editor/         # 编辑器组件
│   │   ├── templates/      # 简历模板
│   │   └── ui/             # UI 基础组件
│   ├── contexts/           # React Context
│   ├── data/               # 静态数据
│   ├── hooks/              # 自定义 Hooks
│   ├── i18n/               # 国际化
│   ├── lib/                # 工具库
│   ├── services/           # 业务逻辑
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型
│   └── utils/              # 工具函数
├── .eslintrc.json          # ESLint 配置
├── .prettierrc             # Prettier 配置
├── CONTRIBUTING.md         # 贡献指南
├── package.json            # 项目配置
└── tsconfig.json           # TypeScript 配置
```

---

## 🎨 组件开发指南

### 创建新组件

使用开发工具脚本快速创建组件：

```bash
./scripts/dev-tools.sh component MyComponent
```

这会自动创建：
- `MyComponent.tsx` - 组件文件
- `MyComponent.test.tsx` - 测试文件
- `MyComponent.stories.tsx` - Storybook 文件
- `index.ts` - 导出文件

### 组件模板

```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.3.6
 * 
 * MyComponent 组件
 * 组件功能描述
 */

import React from 'react'

export interface MyComponentProps {
  /** 属性描述 */
  title: string
  /** 可选属性 */
  description?: string
  /** 回调函数 */
  onAction?: () => void
}

/**
 * MyComponent 组件
 * 
 * @example
 * ```tsx
 * <MyComponent title="标题" description="描述" />
 * ```
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  onAction,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && <button onClick={onAction}>操作</button>}
    </div>
  )
}

MyComponent.displayName = 'MyComponent'
```

### 组件最佳实践

1. **类型安全**：为所有 props 定义 TypeScript 接口
2. **文档注释**：使用 JSDoc 注释说明组件用途
3. **默认值**：为可选 props 提供合理的默认值
4. **可访问性**：添加适当的 ARIA 属性
5. **性能优化**：使用 React.memo、useMemo、useCallback

---

## 📖 Storybook 使用

### 启动 Storybook

```bash
npm run storybook
# 访问 http://localhost:6006
```

### 编写 Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '组件描述',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '标题文本',
    },
  },
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

// 默认示例
export const Default: Story = {
  args: {
    title: '默认标题',
    description: '默认描述',
  },
}

// 多个变体
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <MyComponent title="变体 1" />
      <MyComponent title="变体 2" description="带描述" />
    </div>
  ),
}
```

---

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 编写测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('应该正确渲染标题', () => {
    render(<MyComponent title="测试标题" />)
    expect(screen.getByText('测试标题')).toBeInTheDocument()
  })

  it('应该在点击时调用回调', () => {
    const handleAction = jest.fn()
    render(<MyComponent title="测试" onAction={handleAction} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('应该正确渲染可选描述', () => {
    const { rerender } = render(<MyComponent title="测试" />)
    expect(screen.queryByText('描述')).not.toBeInTheDocument()
    
    rerender(<MyComponent title="测试" description="描述" />)
    expect(screen.getByText('描述')).toBeInTheDocument()
  })
})
```

---

## 🔧 开发工具脚本

### 可用命令

```bash
# 初始化开发环境
./scripts/dev-tools.sh setup

# 运行所有验证（类型检查、Lint、格式化、测试）
./scripts/dev-tools.sh validate

# 清理构建产物
./scripts/dev-tools.sh clean

# 创建新组件
./scripts/dev-tools.sh component ComponentName

# 检查依赖更新
./scripts/dev-tools.sh check-deps

# 分析打包体积
./scripts/dev-tools.sh analyze

# 启动 Storybook
./scripts/dev-tools.sh storybook

# 显示帮助
./scripts/dev-tools.sh help
```

---

## 📝 代码规范

### ESLint

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### Prettier

```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check
```

### TypeScript

```bash
# 类型检查
npm run type-check
```

### 提交前验证

```bash
# 运行所有验证
npm run validate
```

---

## 🎯 Git 工作流

### 分支命名

- `feature/功能名` - 新功能
- `fix/问题描述` - Bug 修复
- `docs/文档更新` - 文档更新
- `refactor/重构描述` - 代码重构
- `perf/性能优化` - 性能优化

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat(editor): 添加自动保存功能
fix(export): 修复 PDF 导出空白问题
docs: 更新 README 安装说明
refactor(components): 优化 Button 组件结构
perf(preview): 优化预览渲染性能
test(utils): 添加工具函数测试
chore(deps): 更新依赖版本
```

### Pull Request 流程

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 推送到 Fork 仓库
5. 创建 Pull Request
6. 等待代码审查
7. 根据反馈修改
8. 合并到主分支

---

## 🚀 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t resume-app .

# 运行容器
docker run -p 3000:3000 resume-app
```

---

## 📚 相关资源

### 技术栈文档

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### 工具文档

- [Storybook](https://storybook.js.org/docs)
- [Jest](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [ESLint](https://eslint.org/docs/latest/)
- [Prettier](https://prettier.io/docs/en/)

---

## 💬 获取帮助

- 📖 查看 [文档](./docs)
- 🐛 提交 [Issue](https://github.com/your-repo/issues)
- 💬 参与 [讨论](https://github.com/your-repo/discussions)
- 📧 联系维护者

---

**UIED技术团队**
- 网站: https://fsuied.com
- 作者: https://www.tomda.top

