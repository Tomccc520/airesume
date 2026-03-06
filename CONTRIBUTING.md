# 贡献指南 | Contributing Guide

感谢你对 UIED Resume 项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试](#测试)
- [文档](#文档)

## 🤝 行为准则

我们致力于为每个人提供友好、安全和热情的环境。请遵守以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 🎯 如何贡献

### 报告 Bug

如果你发现了 Bug，请：

1. 检查 [Issues](https://github.com/your-repo/issues) 确保问题未被报告
2. 创建新 Issue，包含：
   - 清晰的标题和描述
   - 复现步骤
   - 预期行为和实际行为
   - 截图（如果适用）
   - 环境信息（浏览器、操作系统等）

### 提出新功能

1. 先在 Issues 中讨论你的想法
2. 等待维护者反馈
3. 获得批准后再开始开发

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 🛠 开发环境设置

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 或 pnpm
- Git

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/resume.git
cd resume

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开
# http://localhost:3002
```

### 开发工具

```bash
# 代码检查
npm run lint

# 类型检查
npm run type-check

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

## 📁 项目结构

```
src/
├── app/              # Next.js 应用路由
│   ├── api/          # API 路由
│   ├── editor/       # 编辑器页面
│   └── page.tsx      # 首页
├── components/       # React 组件
│   ├── ai/           # AI 相关组件
│   ├── editor/       # 编辑器组件
│   ├── templates/    # 简历模板
│   └── ui/           # UI 基础组件
├── contexts/         # React Context
├── data/             # 静态数据
├── hooks/            # 自定义 Hooks
├── i18n/             # 国际化
├── lib/              # 工具库
├── services/         # 业务逻辑
├── styles/           # 全局样式
├── types/            # TypeScript 类型
└── utils/            # 工具函数
```

## 📝 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 为所有函数和组件添加类型注解
- 避免使用 `any` 类型
- 使用接口（interface）定义对象类型

```typescript
// ✅ 好的示例
interface UserProps {
  name: string
  age: number
  email?: string
}

const User: React.FC<UserProps> = ({ name, age, email }) => {
  return <div>{name}</div>
}

// ❌ 避免
const User = (props: any) => {
  return <div>{props.name}</div>
}
```

### React 组件

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- 文件名与组件名保持一致
- 每个组件添加版权信息和注释

```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.3.6
 * 
 * 用户卡片组件
 * 用于展示用户基本信息
 */
export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // 组件逻辑
}
```

### CSS/Tailwind

- 优先使用 Tailwind CSS
- 复杂样式使用 CSS Modules
- 保持类名简洁有序
- 响应式优先

```tsx
// ✅ 好的示例
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  <span className="text-lg font-semibold text-gray-900">Title</span>
</div>
```

### 命名规范

- **组件**: PascalCase (`UserCard.tsx`)
- **函数**: camelCase (`getUserData`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **类型/接口**: PascalCase (`UserData`, `ApiResponse`)
- **文件夹**: kebab-case (`user-profile`)

### 注释规范

```typescript
/**
 * 获取用户数据
 * @param userId - 用户ID
 * @returns 用户数据对象
 * @throws {Error} 当用户不存在时抛出错误
 */
async function getUserData(userId: string): Promise<UserData> {
  // 实现逻辑
}
```

## 📦 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```bash
# 新功能
git commit -m "feat(editor): 添加自动保存功能"

# 修复 Bug
git commit -m "fix(export): 修复 PDF 导出空白问题"

# 文档更新
git commit -m "docs: 更新 README 安装说明"

# 重构
git commit -m "refactor(components): 优化 Button 组件结构"
```

## 🧪 测试

### 编写测试

- 为新功能编写单元测试
- 测试文件放在 `__tests__` 目录
- 使用 Jest 和 React Testing Library

```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('应该正确渲染用户名', () => {
    render(<UserCard user={{ name: 'Test User' }} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 📚 文档

### 组件文档

每个组件应包含：

1. **功能描述**: 组件的用途
2. **Props 说明**: 所有属性的类型和说明
3. **使用示例**: 基本用法示例
4. **注意事项**: 特殊情况说明

```typescript
/**
 * Button 组件
 * 
 * 通用按钮组件，支持多种样式和尺寸
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   点击我
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'outline'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 点击事件处理函数 */
  onClick?: () => void
}
```

### API 文档

为所有公共 API 编写文档，包括：

- 端点路径
- 请求方法
- 请求参数
- 响应格式
- 错误处理

## 🎨 UI/UX 指南

### 设计原则

- **一致性**: 保持整体风格统一
- **简洁性**: 界面简洁直观
- **响应式**: 适配各种屏幕尺寸
- **可访问性**: 遵循 WCAG 标准

### 颜色使用

- 主色调: 蓝色系 (`blue-600`, `cyan-600`)
- 辅助色: 灰色系
- 成功: 绿色 (`green-600`)
- 警告: 黄色 (`yellow-600`)
- 错误: 红色 (`red-600`)

### 间距规范

- 使用 Tailwind 的间距系统
- 常用: `gap-4`, `p-6`, `mb-4`
- 保持一致的间距比例

## 🔍 代码审查

Pull Request 会经过以下检查：

- ✅ 代码风格符合规范
- ✅ 通过所有测试
- ✅ 类型检查无错误
- ✅ 有适当的注释和文档
- ✅ 提交信息符合规范
- ✅ 无明显的性能问题

## 💡 最佳实践

### 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 缓存计算结果
- 图片使用 Next.js Image 组件
- 大组件使用动态导入 (`dynamic`)

### 安全性

- 不在代码中硬编码敏感信息
- 使用环境变量存储配置
- 验证所有用户输入
- 防止 XSS 攻击

### 可访问性

- 使用语义化 HTML
- 添加适当的 ARIA 属性
- 确保键盘可访问
- 提供足够的颜色对比度

## 📞 获取帮助

如果你有任何问题：

1. 查看 [文档](./docs)
2. 搜索 [Issues](https://github.com/your-repo/issues)
3. 在 [Discussions](https://github.com/your-repo/discussions) 提问
4. 联系维护者

## 📄 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](./LICENSE) 下发布。

---

再次感谢你的贡献！🎉

**UIED技术团队**
- 网站: https://fsuied.com
- 作者: https://www.tomda.top

