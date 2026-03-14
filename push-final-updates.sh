#!/bin/bash

###############################################################################
# 最终推送脚本 - 包含英文文档
# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026.3.6
###############################################################################

set -e

echo "🚀 推送最终更新（包含英文文档）..."
echo ""

cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"

# 1. 添加所有更改
echo "📦 添加所有更改..."
git add -A

# 2. 提交更改
echo "💾 提交更改..."
git commit -m "docs: 添加英文文档和完善开源基础设施

✨ 新增内容：
- 添加 README_EN.md（英文版 README）
- 添加 CONTRIBUTING_EN.md（英文版贡献指南）
- 更新 README.md 添加语言切换链接
- 增强 README（演示、路线图、Star History）
- 添加 SECURITY.md（安全政策）
- 添加 CODE_OF_CONDUCT.md（行为准则）
- 添加 CHANGELOG.md（变更日志）
- 添加 GitHub Issue/PR 模板
- 添加 GitHub Actions CI/CD 配置
- 完善 .gitignore

📚 文档完善：
- 开发者指南
- 组件文档
- 代码风格指南
- 开源项目清单

🛠 开发工具：
- Storybook 组件文档系统
- ESLint + Prettier 代码规范
- Git Hooks (Husky + lint-staged)
- 开发辅助脚本

🌍 国际化：
- 完整的英文文档支持
- 中英文语言切换"

# 3. 推送到所有远程仓库
echo ""
echo "⬆️  推送到 Gitee..."
git push gitee-new main

echo ""
echo "⬆️  推送到 GitHub..."
git push github-new main

echo ""
echo "✅ 完成！"
echo ""
echo "🎉 开源项目已完全准备就绪！"
echo ""
echo "📊 项目完成度: 95%"
echo ""
echo "✅ 已完成："
echo "   ✅ 核心功能开发"
echo "   ✅ 完整的中文文档"
echo "   ✅ 完整的英文文档"
echo "   ✅ 开发者工具和规范"
echo "   ✅ CI/CD 自动化"
echo "   ✅ Issue/PR 模板"
echo "   ✅ 安全政策和行为准则"
echo ""
echo "⏳ 待完成（5%）："
echo "   - 添加项目截图"
echo "   - 创建第一个 Release (v1.0.0)"
echo ""
echo "🔗 仓库地址："
echo "   Gitee:  https://gitee.com/tomdac/airesume"
echo "   GitHub: https://github.com/Tomccc520/airesume"
echo ""
echo "📝 下一步建议："
echo "   1. 添加项目截图到 docs/screenshots/"
echo "   2. 创建 v1.0.0 Release"
echo "   3. 在 GitHub 启用 Discussions"
echo "   4. 配置仓库 About 信息"
echo "   5. 开始推广项目！"
echo ""

