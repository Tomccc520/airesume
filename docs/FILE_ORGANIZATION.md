/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 文件整理说明
 */

# 文件整理说明

## 📁 文件夹结构

### 1. 模板系统文档
**位置**: `docs/template-system/`

包含所有模板系统相关的文档：
- ✅ TEMPLATE_COMPLETION_REPORT.md (完成报告)
- ✅ TEMPLATE_SYSTEM_SUMMARY.md (系统总结)
- ✅ TEMPLATE_SYSTEM_GUIDE.md (使用指南)
- ✅ TEMPLATE_QUICK_REFERENCE.md (快速参考)
- ✅ TEMPLATE_SYSTEM_OPTIMIZATION_REPORT.md (优化报告)
- ✅ TEMPLATE_DOCS_INDEX.md (文档索引)
- ✅ TEMPLATE_DONE.txt (完成标记)
- ✅ TEMPLATE_FEATURES_V3.md (功能说明)
- ✅ TEMPLATE_FIX_SUMMARY.md (修复总结)
- ✅ TEMPLATE_LAYOUTS_SUMMARY.md (布局总结)
- ✅ TEMPLATE_LAYOUT_TYPES.md (布局类型)
- ✅ TEMPLATE_LAYOUT_UPDATE_SUMMARY.md (布局更新)
- ✅ TEMPLATE_OPTIMIZATION_SUMMARY.md (优化总结)
- ✅ TEMPLATE_SELECTOR_OPTIMIZATION.md (选择器优化)

### 2. 脚本工具
**位置**: `docs/scripts/`

包含模板系统的工具脚本（备份）：
- ✅ templateValidator.ts (验证工具)
- ✅ testTemplateSystem.ts (测试脚本)

**注意**: 这些是备份文件，实际使用的文件在：
- `src/utils/templateValidator.ts`
- `src/utils/__tests__/testTemplateSystem.ts`

## 🔧 Next.js 404 错误解决方案

### 问题原因
Next.js 缓存问题导致静态资源无法加载。

### 解决步骤

#### 方法1：清理缓存并重启（推荐）
```bash
# 1. 停止开发服务器（Ctrl+C）

# 2. 清理缓存
rm -rf .next

# 3. 重新启动
npm run dev
```

#### 方法2：完全重置
```bash
# 1. 停止开发服务器

# 2. 清理所有缓存
rm -rf .next
rm -rf node_modules/.cache

# 3. 重新安装依赖（如果需要）
npm install

# 4. 重新启动
npm run dev
```

#### 方法3：更换端口
```bash
# 如果端口被占用，更换端口
PORT=3003 npm run dev
```

### 常见问题

#### Q: 为什么会出现404错误？
A: 通常是因为：
1. Next.js 缓存损坏
2. 开发服务器未正确启动
3. 端口被占用
4. 文件权限问题

#### Q: 如何确认服务器正常运行？
A: 查看终端输出，应该看到：
```
✓ Ready in Xms
○ Local: http://localhost:3002
```

#### Q: 清理缓存会影响数据吗？
A: 不会。`.next` 是构建缓存，清理后会自动重新生成。

## 📖 快速访问

### 查看文档
```bash
# 进入文档目录
cd docs/template-system

# 查看文档列表
ls -la

# 推荐阅读顺序
1. TEMPLATE_DOCS_INDEX.md (文档导航)
2. TEMPLATE_SYSTEM_SUMMARY.md (系统总结)
3. TEMPLATE_SYSTEM_GUIDE.md (详细指南)
```

### 使用脚本
```bash
# 查看脚本备份
cd docs/scripts
ls -la

# 实际使用的脚本位置
src/utils/templateValidator.ts
src/utils/__tests__/testTemplateSystem.ts
```

## 🎯 文件整理完成

✅ 所有模板相关的MD文档已移至 `docs/template-system/`
✅ 脚本工具已备份至 `docs/scripts/`
✅ 项目根目录更加整洁
✅ 文件分类清晰，便于查找

---

**整理时间**: 2026年1月30日
**维护团队**: UIED技术团队

