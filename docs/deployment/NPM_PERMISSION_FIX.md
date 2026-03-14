/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.31
 */

# ⚠️ npm 权限问题解决方案

## 问题描述

您的系统遇到了 npm 权限问题：
```
Error: EPERM: operation not permitted
/opt/homebrew/lib/node_modules/npm/node_modules/@sigstore/verify/dist/key/index.js
```

## 🔧 解决方案

### 方案 1：修复 npm 权限（推荐）

在**终端**中运行以下命令：

```bash
# 修复 npm 缓存权限
sudo chown -R $(whoami) ~/.npm

# 修复 Homebrew npm 权限
sudo chown -R $(whoami) /opt/homebrew/lib/node_modules

# 清理 npm 缓存
npm cache clean --force
```

然后重新安装：

```bash
cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"
rm -rf node_modules package-lock.json
npm install
```

### 方案 2：使用 yarn（替代方案）

如果 npm 一直有问题，可以改用 yarn：

```bash
# 安装 yarn
brew install yarn

# 删除旧依赖
cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"
rm -rf node_modules package-lock.json

# 使用 yarn 安装
yarn install

# 启动开发服务器
yarn dev
```

### 方案 3：重新安装 npm

```bash
# 卸载并重新安装 npm
brew uninstall node
brew install node

# 验证安装
npm --version
node --version
```

## 📝 安装完成后

安装成功后，运行：

```bash
cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"
npm run dev
```

然后测试 Shadcn/ui 组件是否正常工作。

## 🎯 已准备好的文件

即使现在无法安装依赖，我已经为您准备好了：

✅ **配置文件**
- `components.json` - Shadcn/ui 配置
- `src/lib/utils.ts` - 工具函数
- `src/app/globals.css` - CSS 变量

✅ **组件文件**
- `src/components/ui/button.tsx` - Button 组件

✅ **package.json**
- 已更新依赖列表
- 删除了无用的依赖
- 添加了 Shadcn/ui 需要的依赖

## 💡 临时解决方案

如果您现在就想看效果，可以：

1. **先不安装新依赖**
2. **直接启动开发服务器**（使用现有依赖）
3. **等权限问题解决后再安装 Shadcn/ui**

```bash
npm run dev
```

项目应该还能正常运行，只是暂时无法使用 Shadcn/ui 组件。

## 🆘 需要帮助？

如果以上方案都不行，请：

1. 在终端运行：`ls -la /opt/homebrew/lib/node_modules`
2. 检查权限设置
3. 或者考虑使用 nvm 管理 Node.js 版本

---

**建议：** 先修复 npm 权限问题，这是最根本的解决方案。

