# Requirements Document

## Introduction

本文档定义了 AI 简历编辑器中两个核心 AI 功能的优化需求：
1. **模式选择优化**：在逐步模式（stepByStep）生成完成后，允许用户重新触发 AI 生成
2. **内容编辑 AI 功能优化**：优化 AIAssistant 组件的用户体验，提升内容编辑时的 AI 辅助功能

## Glossary

- **ModeSelectionDialog**: AI 生成模式选择对话框组件
- **StepwiseGeneratorModal**: AI 分步生成主模态框组件
- **AIAssistant**: AI 辅助组件，用于内容优化和生成建议
- **GenerationSession**: 生成会话对象，包含步骤状态和用户信息
- **StepwiseGeneratorService**: 分步生成服务，协调简历各模块的顺序生成
- **Quick_Mode**: 快速模式，连续生成所有内容后统一确认
- **StepByStep_Mode**: 逐步模式，每步生成后可编辑确认

## Requirements

### Requirement 1: 逐步模式重新生成功能

**User Story:** As a user, I want to regenerate AI content after completing the stepByStep mode, so that I can refine my resume with different AI suggestions.

#### Acceptance Criteria

1. WHEN the StepByStep_Mode generation is complete AND the user is in the FinalReviewPanel, THE StepwiseGeneratorModal SHALL display a "Regenerate All" button
2. WHEN the user clicks the "Regenerate All" button, THE StepwiseGeneratorService SHALL reset all steps to pending status and restart generation
3. WHEN the user clicks on a specific completed step in FinalReviewPanel, THE System SHALL allow regenerating that individual step
4. WHEN regeneration is triggered, THE System SHALL preserve the user's previous selections and edited content until new content is generated
5. IF regeneration fails for any step, THEN THE System SHALL display an error message and allow retry

### Requirement 2: 模式切换增强

**User Story:** As a user, I want to switch between generation modes after completion, so that I can try different generation approaches.

#### Acceptance Criteria

1. WHEN the generation session is complete, THE ModeSelectionDialog SHALL be accessible from the FinalReviewPanel
2. WHEN the user selects a different mode after completion, THE System SHALL start a new generation session with the same user info
3. THE System SHALL preserve the user's basic information (name, targetPosition, industry, experienceLevel) when switching modes

### Requirement 3: AIAssistant 历史记录功能

**User Story:** As a user, I want to see my previous AI suggestions, so that I can compare and choose the best content.

#### Acceptance Criteria

1. WHEN the AIAssistant generates suggestions, THE System SHALL store the suggestions in session history
2. WHEN the user has previous suggestions, THE AIAssistant SHALL display a history panel showing past suggestions
3. WHEN the user clicks on a historical suggestion, THE System SHALL allow applying or copying that suggestion
4. THE System SHALL limit history to the last 5 generation sessions per content type
5. WHEN the user closes the AIAssistant, THE System SHALL preserve the history for the current editing session

### Requirement 4: AIAssistant 快速操作优化

**User Story:** As a user, I want faster access to common AI operations, so that I can efficiently optimize my resume content.

#### Acceptance Criteria

1. THE AIAssistant SHALL display quick action buttons for common operations (optimize, expand, condense, professional tone)
2. WHEN the user clicks a quick action button, THE System SHALL immediately generate suggestions without requiring additional input
3. WHEN generating suggestions, THE AIAssistant SHALL show a progress indicator with estimated time
4. THE AIAssistant SHALL support keyboard shortcuts for quick actions (Ctrl+1 through Ctrl+4)

### Requirement 5: 生成结果对比功能

**User Story:** As a user, I want to compare AI-generated content with my original content, so that I can make informed decisions about which version to use.

#### Acceptance Criteria

1. WHEN AI suggestions are generated, THE AIAssistant SHALL display a side-by-side comparison view option
2. WHEN in comparison view, THE System SHALL highlight differences between original and suggested content
3. WHEN the user hovers over highlighted differences, THE System SHALL show a tooltip explaining the change
4. THE User SHALL be able to toggle between comparison view and list view

### Requirement 6: 生成状态持久化

**User Story:** As a user, I want my generation progress to be saved, so that I can resume if I accidentally close the modal.

#### Acceptance Criteria

1. WHEN a generation session is in progress, THE StepwiseGeneratorService SHALL auto-save session state every 30 seconds
2. WHEN the user reopens the StepwiseGeneratorModal with an incomplete session, THE System SHALL offer to resume the previous session
3. WHEN the user chooses to resume, THE System SHALL restore all completed steps and continue from the last incomplete step
4. IF the saved session is older than 30 minutes, THEN THE System SHALL discard it and start fresh
5. WHEN the user explicitly cancels or completes a session, THE System SHALL clear the saved state

### Requirement 7: 错误恢复增强

**User Story:** As a user, I want better error handling during AI generation, so that I can recover from failures without losing progress.

#### Acceptance Criteria

1. IF an AI generation request fails, THEN THE System SHALL display a clear error message with retry option
2. WHEN retrying a failed step, THE System SHALL preserve all previously completed steps
3. THE System SHALL implement exponential backoff for retry attempts (1s, 2s, 4s delays)
4. IF three consecutive retries fail, THEN THE System SHALL offer to skip the step or cancel the session
5. WHEN a network error occurs, THE System SHALL detect reconnection and offer automatic retry
