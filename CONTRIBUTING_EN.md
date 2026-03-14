# Contributing Guide

Thank you for your interest in contributing to AI Resume! We welcome all forms of contributions.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone. Please follow these guidelines:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🎯 How to Contribute

### Reporting Bugs

If you find a bug, please:

1. Check [Issues](https://github.com/Tomccc520/airesume/issues) to ensure it hasn't been reported
2. Create a new Issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment information (browser, OS, etc.)

### Suggesting Features

1. Discuss your idea in Issues first
2. Wait for maintainer feedback
3. Start development after approval

### Submitting Code

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛠 Development Setup

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Tomccc520/airesume.git
cd airesume

# Use the dev tools script to initialize
./scripts/dev-tools.sh setup

# Or install manually
npm install
```

### Start Development Server

```bash
npm run dev
# Visit http://localhost:3002
```

---

## 📁 Project Structure

```
resume/
├── .husky/                 # Git hooks
├── .storybook/             # Storybook configuration
├── docs/                   # Documentation
├── public/                 # Static assets
├── scripts/                # Development scripts
├── src/
│   ├── app/                # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── editor/         # Editor page
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ai/             # AI-related components
│   │   ├── editor/         # Editor components
│   │   ├── templates/      # Resume templates
│   │   └── ui/             # UI base components
│   ├── contexts/           # React contexts
│   ├── data/               # Static data
│   ├── hooks/              # Custom hooks
│   ├── i18n/               # Internationalization
│   ├── lib/                # Utility libraries
│   ├── services/           # Business logic
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── CONTRIBUTING.md         # Contributing guide
├── package.json            # Project configuration
└── tsconfig.json           # TypeScript configuration
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all code
- Add type annotations for all functions and components
- Avoid using `any` type
- Use interfaces for object types

```typescript
// ✅ Good
interface UserProps {
  name: string
  age: number
  email?: string
}

const User: React.FC<UserProps> = ({ name, age, email }) => {
  return <div>{name}</div>
}

// ❌ Avoid
const User = (props: any) => {
  return <div>{props.name}</div>
}
```

### React Components

- Use functional components and Hooks
- Component names use PascalCase
- File names match component names
- Add copyright information and comments to each component

```typescript
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED Tech Team (https://fsuied.com)
 * @author UIED Tech Team
 * @createDate 2026.3.6
 * 
 * User Card Component
 * Displays user basic information
 */
export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Component logic
}
```

### CSS/Tailwind

- Prefer Tailwind CSS
- Use CSS Modules for complex styles
- Keep class names concise and ordered
- Mobile-first responsive design

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  <span className="text-lg font-semibold text-gray-900">Title</span>
</div>
```

### Naming Conventions

- **Components**: PascalCase (`UserCard.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)
- **Folders**: kebab-case (`user-profile`)

### Comment Guidelines

```typescript
/**
 * Get user data
 * @param userId - User ID
 * @returns User data object
 * @throws {Error} Throws error when user doesn't exist
 */
async function getUserData(userId: string): Promise<UserData> {
  // Implementation
}
```

## 📦 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (doesn't affect code execution)
- `refactor`: Refactoring (neither new feature nor bug fix)
- `perf`: Performance optimization
- `test`: Test-related
- `chore`: Build process or auxiliary tool changes

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
# New feature
git commit -m "feat(editor): add auto-save functionality"

# Bug fix
git commit -m "fix(export): fix PDF export blank issue"

# Documentation update
git commit -m "docs: update README installation instructions"

# Refactoring
git commit -m "refactor(components): optimize Button component structure"
```

## 🧪 Testing

### Writing Tests

- Write unit tests for new features
- Place test files in `__tests__` directory
- Use Jest and React Testing Library

```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('should render username correctly', () => {
    render(<UserCard user={{ name: 'Test User' }} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 Documentation

### Component Documentation

Each component should include:

1. **Function Description**: Component purpose
2. **Props Description**: All property types and descriptions
3. **Usage Examples**: Basic usage examples
4. **Notes**: Special case descriptions

```typescript
/**
 * Button Component
 * 
 * Universal button component supporting multiple styles and sizes
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** Button text */
  children: React.ReactNode
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Click event handler */
  onClick?: () => void
}
```

## 🎨 UI/UX Guidelines

### Design Principles

- **Consistency**: Maintain unified overall style
- **Simplicity**: Interface should be clean and intuitive
- **Responsiveness**: Adapt to various screen sizes
- **Accessibility**: Follow WCAG standards

### Color Usage

- Primary: Blue series (`blue-600`, `cyan-600`)
- Secondary: Gray series
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)

### Spacing Standards

- Use Tailwind's spacing system
- Common: `gap-4`, `p-6`, `mb-4`
- Maintain consistent spacing ratios

## 🔍 Code Review

Pull Requests will undergo the following checks:

- ✅ Code style complies with standards
- ✅ All tests pass
- ✅ Type checking has no errors
- ✅ Appropriate comments and documentation
- ✅ Commit messages comply with standards
- ✅ No obvious performance issues

## 💡 Best Practices

### Performance Optimization

- Use `React.memo` to avoid unnecessary re-renders
- Use `useMemo` and `useCallback` to cache computation results
- Use Next.js Image component for images
- Use dynamic imports for large components (`dynamic`)

### Security

- Don't hardcode sensitive information in code
- Use environment variables to store configuration
- Validate all user input
- Prevent XSS attacks

### Accessibility

- Use semantic HTML
- Add appropriate ARIA attributes
- Ensure keyboard accessibility
- Provide sufficient color contrast

## 📞 Getting Help

If you have any questions:

1. Check [Documentation](./docs)
2. Search [Issues](https://github.com/Tomccc520/airesume/issues)
3. Ask in [Discussions](https://github.com/Tomccc520/airesume/discussions)
4. Contact maintainers

## 📄 License

By contributing code, you agree that your contributions will be released under the [MIT License](./LICENSE).

---

Thank you again for your contribution! 🎉

**UIED Tech Team**
- Website: https://fsuied.com
- Author: https://www.tomda.top

