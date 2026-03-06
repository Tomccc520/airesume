#!/bin/bash

###############################################################################
# 开发辅助脚本集合
# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026.3.6
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# 显示帮助信息
show_help() {
    cat << EOF
UIED Resume 开发辅助工具

用法: ./scripts/dev-tools.sh [命令]

命令:
  setup           初始化开发环境
  validate        运行所有验证（类型检查、Lint、格式化、测试）
  clean           清理构建产物和缓存
  component       创建新组件（带模板）
  check-deps      检查依赖更新
  analyze         分析打包体积
  storybook       启动 Storybook
  help            显示此帮助信息

示例:
  ./scripts/dev-tools.sh setup
  ./scripts/dev-tools.sh validate
  ./scripts/dev-tools.sh component MyComponent

EOF
}

# 初始化开发环境
setup_dev() {
    print_info "初始化开发环境..."
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "需要 Node.js 18 或更高版本，当前版本: $(node -v)"
        exit 1
    fi
    print_success "Node.js 版本检查通过: $(node -v)"
    
    # 安装依赖
    print_info "安装依赖..."
    npm install
    print_success "依赖安装完成"
    
    # 设置 Git hooks
    if [ -d ".git" ]; then
        print_info "设置 Git hooks..."
        npx husky install
        print_success "Git hooks 设置完成"
    fi
    
    print_success "开发环境初始化完成！"
    print_info "运行 'npm run dev' 启动开发服务器"
}

# 运行所有验证
validate_all() {
    print_info "开始运行验证..."
    
    # 类型检查
    print_info "1/4 运行类型检查..."
    npm run type-check
    print_success "类型检查通过"
    
    # Lint 检查
    print_info "2/4 运行 Lint 检查..."
    npm run lint
    print_success "Lint 检查通过"
    
    # 格式化检查
    print_info "3/4 运行格式化检查..."
    npm run format:check
    print_success "格式化检查通过"
    
    # 运行测试
    print_info "4/4 运行测试..."
    npm run test
    print_success "测试通过"
    
    print_success "所有验证通过！✨"
}

# 清理构建产物
clean_build() {
    print_info "清理构建产物和缓存..."
    
    rm -rf .next
    rm -rf out
    rm -rf dist
    rm -rf coverage
    rm -rf node_modules/.cache
    rm -rf storybook-static
    
    print_success "清理完成"
}

# 创建新组件
create_component() {
    if [ -z "$1" ]; then
        print_error "请提供组件名称"
        echo "用法: ./scripts/dev-tools.sh component ComponentName"
        exit 1
    fi
    
    COMPONENT_NAME=$1
    COMPONENT_DIR="src/components/${COMPONENT_NAME}"
    
    if [ -d "$COMPONENT_DIR" ]; then
        print_error "组件 ${COMPONENT_NAME} 已存在"
        exit 1
    fi
    
    print_info "创建组件: ${COMPONENT_NAME}"
    
    mkdir -p "$COMPONENT_DIR"
    
    # 创建组件文件
    cat > "${COMPONENT_DIR}/${COMPONENT_NAME}.tsx" << EOF
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate $(date +%Y.%-m.%-d)
 * 
 * ${COMPONENT_NAME} 组件
 */

import React from 'react'

export interface ${COMPONENT_NAME}Props {
  /** 组件类名 */
  className?: string
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * ${COMPONENT_NAME} 组件
 */
export const ${COMPONENT_NAME}: React.FC<${COMPONENT_NAME}Props> = ({
  className,
  children,
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

${COMPONENT_NAME}.displayName = '${COMPONENT_NAME}'
EOF
    
    # 创建测试文件
    cat > "${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx" << EOF
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate $(date +%Y.%-m.%-d)
 */

import { render, screen } from '@testing-library/react'
import { ${COMPONENT_NAME} } from './${COMPONENT_NAME}'

describe('${COMPONENT_NAME}', () => {
  it('应该正确渲染', () => {
    render(<${COMPONENT_NAME}>测试内容</${COMPONENT_NAME}>)
    expect(screen.getByText('测试内容')).toBeInTheDocument()
  })
})
EOF
    
    # 创建 Storybook 文件
    cat > "${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx" << EOF
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate $(date +%Y.%-m.%-d)
 */

import type { Meta, StoryObj } from '@storybook/react'
import { ${COMPONENT_NAME} } from './${COMPONENT_NAME}'

const meta = {
  title: 'Components/${COMPONENT_NAME}',
  component: ${COMPONENT_NAME},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ${COMPONENT_NAME}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '${COMPONENT_NAME} 示例',
  },
}
EOF
    
    # 创建 index 文件
    cat > "${COMPONENT_DIR}/index.ts" << EOF
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate $(date +%Y.%-m.%-d)
 */

export * from './${COMPONENT_NAME}'
EOF
    
    print_success "组件创建完成: ${COMPONENT_DIR}"
    print_info "文件列表:"
    echo "  - ${COMPONENT_NAME}.tsx"
    echo "  - ${COMPONENT_NAME}.test.tsx"
    echo "  - ${COMPONENT_NAME}.stories.tsx"
    echo "  - index.ts"
}

# 检查依赖更新
check_dependencies() {
    print_info "检查依赖更新..."
    npx npm-check-updates
    print_info "运行 'npx npm-check-updates -u' 更新 package.json"
}

# 分析打包体积
analyze_bundle() {
    print_info "分析打包体积..."
    ANALYZE=true npm run build
}

# 启动 Storybook
start_storybook() {
    print_info "启动 Storybook..."
    npm run storybook
}

# 主函数
main() {
    case "${1:-help}" in
        setup)
            setup_dev
            ;;
        validate)
            validate_all
            ;;
        clean)
            clean_build
            ;;
        component)
            create_component "$2"
            ;;
        check-deps)
            check_dependencies
            ;;
        analyze)
            analyze_bundle
            ;;
        storybook)
            start_storybook
            ;;
        help|*)
            show_help
            ;;
    esac
}

main "$@"

