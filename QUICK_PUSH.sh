#!/bin/bash

###############################################################################
# 快速推送脚本
# 请在终端中运行此脚本: ./QUICK_PUSH.sh
###############################################################################

echo "🚀 开始推送到新仓库..."
echo ""

# 进入项目目录
cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"

# 1. 添加所有更改
echo "📦 添加所有更改..."
git add -A

# 2. 提交更改
echo "💾 提交更改..."
git commit -m "feat: 完善开发者体验

- 添加 Storybook 组件文档系统
- 配置 ESLint 和 Prettier 代码规范
- 创建开发工具脚本 (dev-tools.sh)
- 添加 Git Hooks (Husky + lint-staged)
- 完善项目文档 (CONTRIBUTING.md, DEVELOPER_GUIDE.md 等)
- 添加 Button 组件 Stories 示例
- 优化 package.json 脚本"

# 3. 添加远程仓库
echo "🔗 配置远程仓库..."
git remote add gitee-new https://gitee.com/tomdac/airesume.git 2>/dev/null || git remote set-url gitee-new https://gitee.com/tomdac/airesume.git
git remote add github-new git@github.com:Tomccc520/airesume.git 2>/dev/null || git remote set-url github-new git@github.com:Tomccc520/airesume.git

# 4. 显示远程仓库
echo ""
echo "📋 当前远程仓库："
git remote -v
echo ""

# 5. 推送到 Gitee
echo "⬆️  推送到 Gitee..."
git push -u gitee-new main --force

# 6. 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push -u github-new main --force

echo ""
echo "✅ 完成！"
echo ""
echo "🔗 仓库地址："
echo "   Gitee:  https://gitee.com/tomdac/airesume"
echo "   GitHub: https://github.com/Tomccc520/airesume"
echo ""

