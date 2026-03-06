# Git 推送指南

由于权限限制，请手动执行以下步骤将项目推送到新仓库。

## 方法一：使用脚本（推荐）

我已经为你创建了一个自动化脚本，直接运行：

```bash
cd /Users/tangxiaoda/Desktop/网站备份/简历/resume
./push-to-new-repos.sh
```

## 方法二：手动执行命令

如果脚本无法运行，请手动执行以下命令：

### 1. 添加并提交更改

```bash
cd /Users/tangxiaoda/Desktop/网站备份/简历/resume

# 添加所有更改
git add -A

# 提交更改
git commit -m "feat: 完善开发者体验

- 添加 Storybook 组件文档系统
- 配置 ESLint 和 Prettier 代码规范
- 创建开发工具脚本 (dev-tools.sh)
- 添加 Git Hooks (Husky + lint-staged)
- 完善项目文档 (CONTRIBUTING.md, DEVELOPER_GUIDE.md 等)
- 添加 Button 组件 Stories 示例
- 优化 package.json 脚本"
```

### 2. 添加新的远程仓库

```bash
# 添加 Gitee 新仓库
git remote add gitee-new https://gitee.com/tomdac/airesume.git

# 添加 GitHub 新仓库
git remote add github-new git@github.com:Tomccc520/airesume.git

# 查看所有远程仓库
git remote -v
```

### 3. 推送到新仓库

```bash
# 推送到 Gitee
git push -u gitee-new main

# 推送到 GitHub
git push -u github-new main
```

## 如果遇到分支名称问题

如果你的默认分支是 `master` 而不是 `main`，使用：

```bash
# 推送到 Gitee
git push -u gitee-new master

# 推送到 GitHub  
git push -u github-new master
```

或者重命名分支为 main：

```bash
git branch -M main
git push -u gitee-new main
git push -u github-new main
```

## 后续推送

完成初始推送后，以后可以简单地使用：

```bash
# 推送到 Gitee
git push gitee-new main

# 推送到 GitHub
git push github-new main

# 同时推送到两个仓库
git push gitee-new main && git push github-new main
```

## 仓库地址

- **Gitee**: https://gitee.com/tomdac/airesume
- **GitHub**: https://github.com/Tomccc520/airesume

## 注意事项

1. 如果是首次推送到空仓库，可能需要使用 `--force` 参数
2. 确保你有推送权限（SSH 密钥或访问令牌已配置）
3. 推送前建议先运行 `npm run validate` 确保代码质量

---

**UIED技术团队**

