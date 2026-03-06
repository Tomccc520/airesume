#!/bin/bash

###############################################################################
# 推送到新的 Git 仓库
# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026.3.6
###############################################################################

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  推送项目到新的 Git 仓库${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 添加所有更改
echo -e "${YELLOW}步骤 1/5: 添加所有更改到暂存区...${NC}"
git add -A
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 2. 提交更改
echo -e "${YELLOW}步骤 2/5: 提交更改...${NC}"
git commit -m "feat: 完善开发者体验

- 添加 Storybook 组件文档系统
- 配置 ESLint 和 Prettier 代码规范
- 创建开发工具脚本 (dev-tools.sh)
- 添加 Git Hooks (Husky + lint-staged)
- 完善项目文档 (CONTRIBUTING.md, DEVELOPER_GUIDE.md 等)
- 添加 Button 组件 Stories 示例
- 优化 package.json 脚本"
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 3. 添加新的远程仓库
echo -e "${YELLOW}步骤 3/5: 配置远程仓库...${NC}"

# 添加 Gitee 新仓库
if git remote | grep -q "gitee-new"; then
    echo "gitee-new 已存在，更新 URL..."
    git remote set-url gitee-new https://gitee.com/tomdac/airesume.git
else
    echo "添加 gitee-new..."
    git remote add gitee-new https://gitee.com/tomdac/airesume.git
fi

# 添加 GitHub 新仓库
if git remote | grep -q "github-new"; then
    echo "github-new 已存在，更新 URL..."
    git remote set-url github-new git@github.com:Tomccc520/airesume.git
else
    echo "添加 github-new..."
    git remote add github-new git@github.com:Tomccc520/airesume.git
fi

echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 显示所有远程仓库
echo "当前远程仓库："
git remote -v
echo ""

# 4. 推送到 Gitee
echo -e "${YELLOW}步骤 4/5: 推送到 Gitee (gitee-new)...${NC}"
git push -u gitee-new main --force
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 5. 推送到 GitHub
echo -e "${YELLOW}步骤 5/5: 推送到 GitHub (github-new)...${NC}"
git push -u github-new main --force
echo -e "${GREEN}✓ 完成${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ 所有操作完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "仓库地址："
echo "  Gitee:  https://gitee.com/tomdac/airesume"
echo "  GitHub: https://github.com/Tomccc520/airesume"
echo ""
echo "后续推送可以使用："
echo "  git push gitee-new main"
echo "  git push github-new main"
echo ""

