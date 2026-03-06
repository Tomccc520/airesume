# Implementation Tasks

## Task 1: StepPreview AI 优化功能
- [x] 1.1 添加 AI 优化按钮和输入区域
- [x] 1.2 实现快速优化选项（更专业、更简洁、更详细、突出成果）
- [x] 1.3 支持自定义优化提示词输入
- [x] 1.4 添加 onOptimize 回调接口

## Task 2: StepControls 增强
- [x] 2.1 添加 AI 优化按钮
- [x] 2.2 添加 onOpenOptimize 回调接口

## Task 3: FinalReviewPanel 重新生成功能
- [x] 3.1 添加"重新生成全部"按钮
- [x] 3.2 为每个步骤添加 AI 优化功能
- [x] 3.3 实现快速优化选项
- [x] 3.4 支持自定义优化提示词

## Task 4: StepwiseGeneratorService 扩展
- [x] 4.1 添加 regenerateStepWithPrompt 方法
- [x] 4.2 添加 buildOptimizePrompt 方法
- [x] 4.3 添加 resetAllSteps 方法

## Task 5: StepwiseGeneratorModal 集成
- [x] 5.1 添加 handleOptimizeStep 回调
- [x] 5.2 添加 handleRegenerateAll 回调
- [x] 5.3 传递新 props 给子组件

## 已完成功能总结

### 1. 逐步模式 AI 再次优化
- 在 StepPreview 组件中添加了"AI优化"按钮
- 支持快速优化选项：更专业、更简洁、更详细、突出成果
- 支持自定义优化提示词输入
- 优化后内容会替换当前步骤内容

### 2. 最终审核面板增强
- 添加"重新生成全部"按钮，可重新生成所有内容
- 每个步骤都有独立的 AI 优化功能
- 支持快速优化和自定义优化

### 3. 服务层扩展
- regenerateStepWithPrompt: 使用自定义提示词重新生成指定步骤
- resetAllSteps: 重置所有步骤状态，用于重新生成全部
- buildOptimizePrompt: 构建包含当前内容和优化要求的提示词
