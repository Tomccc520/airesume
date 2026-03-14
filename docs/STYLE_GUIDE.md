# 代码风格指南

本文档定义了 UIED Resume 项目的代码风格规范。

## 📋 目录

- [TypeScript 规范](#typescript-规范)
- [React 规范](#react-规范)
- [CSS/Tailwind 规范](#csstailwind-规范)
- [命名规范](#命名规范)
- [注释规范](#注释规范)
- [文件组织](#文件组织)

---

## TypeScript 规范

### 类型定义

✅ **推荐**:
```typescript
// 使用 interface 定义对象类型
interface UserData {
  id: string
  name: string
  email: string
  age?: number
}

// 使用 type 定义联合类型或复杂类型
type Status = 'pending' | 'success' | 'error'
type ApiResponse<T> = {
  data: T
  status: Status
}
```

❌ **避免**:
```typescript
// 避免使用 any
function processData(data: any) { }

// 避免使用空接口
interface EmptyInterface { }
```

### 函数类型

✅ **推荐**:
```typescript
// 明确的参数和返回值类型
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// 使用箭头函数和类型推断
const formatDate = (date: Date): string => {
  return date.toISOString()
}
```

### 泛型使用

✅ **推荐**:
```typescript
// 泛型函数
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value)
}

// 泛型接口
interface ApiResponse<T> {
  data: T
  message: string
}
```

---

## React 规范

### 组件定义

✅ **推荐**:
```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.3.6
 * 
 * UserCard 组件
 * 用于展示用户信息卡片
 */

import React from 'react'

export interface UserCardProps {
  /** 用户数据 */
  user: User
  /** 是否显示详细信息 */
  showDetails?: boolean
  /** 点击事件 */
  onClick?: (userId: string) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showDetails = false,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(user.id)
  }

  return (
    <div onClick={handleClick}>
      <h3>{user.name}</h3>
      {showDetails && <p>{user.email}</p>}
    </div>
  )
}

UserCard.displayName = 'UserCard'
```

### Hooks 使用

✅ **推荐**:
```typescript
// 自定义 Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

// 组件中使用
const MyComponent: React.FC = () => {
  const [count, setCount] = useLocalStorage('count', 0)
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [setCount])
  
  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue(count)
  }, [count])
  
  return <div>{expensiveValue}</div>
}
```

### 性能优化

✅ **推荐**:
```typescript
// 使用 React.memo 避免不必要的重渲染
export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data }) => {
    return <div>{/* 复杂渲染逻辑 */}</div>
  }
)

// 使用 useCallback 缓存函数
const handleSubmit = useCallback((data: FormData) => {
  // 处理逻辑
}, [/* 依赖项 */])

// 使用 useMemo 缓存计算结果
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value)
}, [data])
```

---

## CSS/Tailwind 规范

### Tailwind 类名顺序

✅ **推荐**:
```tsx
// 按照以下顺序组织类名：
// 1. 布局 (flex, grid, block)
// 2. 定位 (relative, absolute)
// 3. 尺寸 (w-, h-)
// 4. 间距 (p-, m-, gap-)
// 5. 排版 (text-, font-)
// 6. 视觉 (bg-, border-, shadow-)
// 7. 交互 (hover:, focus:)
// 8. 响应式 (sm:, md:, lg:)

<div className="flex items-center justify-between w-full p-4 text-lg font-semibold bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow sm:p-6 md:text-xl">
  内容
</div>
```

### 自定义样式

✅ **推荐**:
```tsx
// 使用 CSS Modules 处理复杂样式
import styles from './Component.module.css'

export const Component: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>标题</div>
    </div>
  )
}
```

### 响应式设计

✅ **推荐**:
```tsx
// 移动优先的响应式设计
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-2 sm:p-4 md:p-6 lg:p-8
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
">
  内容
</div>
```

---

## 命名规范

### 文件命名

```
组件文件:     UserCard.tsx
测试文件:     UserCard.test.tsx
Story 文件:   UserCard.stories.tsx
样式文件:     UserCard.module.css
类型文件:     types.ts
工具文件:     utils.ts
Hook 文件:    useLocalStorage.ts
```

### 变量命名

```typescript
// 组件: PascalCase
const UserCard: React.FC = () => { }

// 函数: camelCase
function getUserData() { }
const handleClick = () => { }

// 常量: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// 接口/类型: PascalCase
interface UserData { }
type ApiResponse = { }

// 私有变量: _camelCase (可选)
const _internalState = {}

// 布尔值: is/has/should 前缀
const isLoading = true
const hasError = false
const shouldUpdate = true
```

---

## 注释规范

### 文件头注释

```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.3.6
 * 
 * 文件功能描述
 * 详细说明（可选）
 */
```

### 函数注释

```typescript
/**
 * 获取用户数据
 * 
 * @param userId - 用户ID
 * @param options - 可选配置
 * @returns 用户数据对象
 * @throws {Error} 当用户不存在时抛出错误
 * 
 * @example
 * ```typescript
 * const user = await getUserData('123')
 * console.log(user.name)
 * ```
 */
async function getUserData(
  userId: string,
  options?: FetchOptions
): Promise<UserData> {
  // 实现逻辑
}
```

### 组件注释

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
  variant?: 'primary' | 'secondary'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
}
```

### 行内注释

```typescript
// ✅ 好的注释：解释为什么这样做
// 使用 setTimeout 避免状态更新冲突
setTimeout(() => {
  setState(newValue)
}, 0)

// ❌ 不好的注释：重复代码内容
// 设置 count 为 0
setCount(0)
```

---

## 文件组织

### 组件文件结构

```typescript
/**
 * 文件头注释
 */

// 1. 导入依赖
import React, { useState, useEffect } from 'react'
import { ExternalLib } from 'external-lib'

// 2. 导入类型
import type { UserData } from '@/types'

// 3. 导入组件
import { Button } from '@/components/ui/button'

// 4. 导入样式
import styles from './Component.module.css'

// 5. 类型定义
export interface ComponentProps {
  // props 定义
}

// 6. 常量定义
const DEFAULT_VALUE = 'default'

// 7. 辅助函数
function helperFunction() {
  // 实现
}

// 8. 主组件
export const Component: React.FC<ComponentProps> = (props) => {
  // Hooks
  const [state, setState] = useState()
  
  // 副作用
  useEffect(() => {
    // 逻辑
  }, [])
  
  // 事件处理
  const handleClick = () => {
    // 逻辑
  }
  
  // 渲染
  return <div>内容</div>
}

// 9. 显示名称
Component.displayName = 'Component'
```

### 目录结构

```
src/components/MyComponent/
├── MyComponent.tsx           # 主组件
├── MyComponent.test.tsx      # 测试文件
├── MyComponent.stories.tsx   # Storybook
├── MyComponent.module.css    # 样式文件（如需要）
├── index.ts                  # 导出文件
├── types.ts                  # 类型定义（如复杂）
└── utils.ts                  # 工具函数（如需要）
```

---

## 最佳实践

### 1. 保持简洁

```typescript
// ✅ 好
const isValid = value > 0 && value < 100

// ❌ 不好
let isValid = false
if (value > 0) {
  if (value < 100) {
    isValid = true
  }
}
```

### 2. 使用解构

```typescript
// ✅ 好
const { name, email } = user

// ❌ 不好
const name = user.name
const email = user.email
```

### 3. 避免嵌套

```typescript
// ✅ 好
if (!user) return null
if (!user.isActive) return null
return <UserProfile user={user} />

// ❌ 不好
if (user) {
  if (user.isActive) {
    return <UserProfile user={user} />
  }
}
return null
```

### 4. 使用可选链

```typescript
// ✅ 好
const userName = user?.profile?.name ?? 'Guest'

// ❌ 不好
const userName = user && user.profile && user.profile.name || 'Guest'
```

### 5. 提取常量

```typescript
// ✅ 好
const MAX_ITEMS = 10
const items = data.slice(0, MAX_ITEMS)

// ❌ 不好
const items = data.slice(0, 10)
```

---

## 工具配置

### ESLint

项目已配置 ESLint，运行：
```bash
npm run lint
npm run lint:fix
```

### Prettier

项目已配置 Prettier，运行：
```bash
npm run format
npm run format:check
```

### TypeScript

项目已配置 TypeScript，运行：
```bash
npm run type-check
```

---

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

**UIED技术团队**
- 网站: https://fsuied.com
- 作者: https://www.tomda.top

