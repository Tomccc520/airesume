# Implementation Plan: AI Stepwise Generation

## Overview

This implementation plan breaks down the AI Stepwise Generation feature into discrete coding tasks. The feature transforms the current "one-click generate all" approach into a controlled, step-by-step generation workflow with two selectable modes:

1. **Quick Mode (快速模式)**: All steps run sequentially without pausing, with real-time progress display and final confirmation at the end
2. **Step-by-Step Mode (逐步模式)**: Each step pauses for user confirmation before proceeding, allowing editing and regeneration

## Tasks

- [x] 1. Create core types and service foundation
  - [x] 1.1 Create stepwise generation types in `src/types/stepwise.ts`
    - Define GenerationMode type ('quick' | 'stepByStep')
    - Define GenerationStepType, StepStatus, GenerationStep, GenerationSession, UserGenerationInfo, StepCallbacks interfaces
    - Define StepwiseErrorCode and StepwiseError types
    - Add isSelected field to GenerationStep for final review selection
    - _Requirements: 1.1, 2.1, 7.1_
  
  - [x] 1.2 Create StepwiseGeneratorService in `src/services/stepwiseGeneratorService.ts`
    - Implement initSession method to create session with 5 steps and specified mode
    - Implement session state management (getSession, updateStep)
    - Implement step configuration with i18n keys and icons
    - Implement mode preference storage (getSavedModePreference, saveModePreference)
    - _Requirements: 1.1, 1.4, 5.1, 5.2, 5.3_
  
  - [x] 1.3 Write property tests for mode persistence and session initialization (Properties 1, 2)
    - **Property 1: Mode Selection Persistence**
    - **Property 2: Session Initialization Creates All Steps**
    - **Validates: Requirements 1.1, 1.4, 2.1**

- [x] 2. Implement step generation and streaming
  - [x] 2.1 Implement generateStep method with streaming support
    - Integrate with existing aiService.generateSuggestions
    - Support AbortController for cancellation
    - Handle streaming callbacks for real-time content display
    - _Requirements: 2.2, 3.2_
  
  - [x] 2.2 Implement step control methods (confirmStep, skipStep, regenerateStep)
    - confirmStep: mark completed, advance to next step (Step-by-Step mode), optionally apply modified content
    - skipStep: mark skipped, advance to next step
    - regenerateStep: reset step status, generate new content
    - _Requirements: 2.4, 2.6, 2.7, 4.2_
  
  - [x] 2.3 Implement mode-specific auto-advance logic
    - In Quick Mode: automatically proceed to next step after completion
    - In Step-by-Step Mode: wait for user confirmation
    - Implement switchToQuickMode method for mode switching during generation
    - _Requirements: 1.2, 1.3, 1.5, 2.5_
  
  - [x] 2.4 Write property tests for step transitions and mode behavior (Properties 3, 4)
    - **Property 3: Step Status Transitions**
    - **Property 4: Mode-Specific Behavior**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [x] 3. Implement workflow control and progress tracking
  - [x] 3.1 Implement pause/resume functionality
    - pauseGeneration: set isPaused, abort current generation
    - resumeGeneration: clear isPaused, continue from currentStepIndex
    - Preserve completed step data on pause
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [x] 3.2 Implement progress calculation
    - Calculate percentage: (completed + skipped) / total * 100
    - Track step count display: "X/5 steps completed"
    - Detect session completion when all steps are completed or skipped
    - _Requirements: 3.1, 3.4_
  
  - [x] 3.3 Write property tests for progress, completion, and mode switch (Properties 5, 6, 9)
    - **Property 5: Progress Calculation Accuracy**
    - **Property 6: Session Completion Detection**
    - **Property 9: Mode Switch Restriction**
    - **Validates: Requirements 1.5, 3.1, 3.4**

- [x] 4. Checkpoint - Ensure service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement session persistence and error handling
  - [x] 5.1 Implement session storage for recovery
    - Save session to localStorage on state changes
    - Recover session on modal open (30 min expiry)
    - Clear session on completion or cancellation
    - _Requirements: 4.5, 7.4_
  
  - [x] 5.2 Implement error handling in generateStep
    - Catch network/API errors, set step status to 'error'
    - Preserve completed step data on error
    - Support retry (regenerateStep) and skip on error
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 5.3 Write property tests for pause and error handling (Properties 8, 11)
    - **Property 8: Pause Preserves Completed Data**
    - **Property 11: Error Handling Preserves Completed Data**
    - **Validates: Requirements 4.4, 4.5, 4.6, 7.1, 7.2, 7.3, 7.4**

- [x] 6. Implement content application
  - [x] 6.1 Implement step selection for final review
    - toggleStepSelection: toggle isSelected for a step
    - selectAllSteps / deselectAllSteps: batch selection
    - _Requirements: 6.4_
  
  - [x] 6.2 Implement applyToResume method
    - Parse generated content for each step type
    - Build Partial<ResumeData> from completed AND selected steps only
    - Exclude skipped and unselected steps from output
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 6.3 Implement modified content handling
    - Accept modifiedContent parameter in confirmStep
    - Store modified content instead of generated content
    - _Requirements: 6.3_
  
  - [x] 6.4 Write property test for content application (Property 10)
    - **Property 10: Content Application Excludes Skipped and Unselected Steps**
    - **Validates: Requirements 6.1, 6.2, 6.4, 6.5**

- [x] 7. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create mode selection UI
  - [x] 8.1 Create ModeSelectionDialog component in `src/components/ai/ModeSelectionDialog.tsx`
    - Display two mode cards: Quick Mode and Step-by-Step Mode
    - Show mode descriptions and icons
    - Highlight recommended mode or last used mode
    - Use Framer Motion for card hover animations
    - _Requirements: 1.1, 1.4_
  
  - [x] 8.2 Add mode selection translations to `src/i18n/locales.ts`
    - Add Chinese translations for mode names and descriptions
    - Add English translations for mode names and descriptions
    - _Requirements: 8.1, 8.2_

- [x] 9. Create step list and preview UI
  - [x] 9.1 Create StepList component in `src/components/ai/StepList.tsx`
    - Display 5 steps with icons from Lucide React
    - Show status indicators (pending, generating, completed, error, skipped)
    - Support click to navigate to completed steps
    - Use Framer Motion for status transition animations
    - _Requirements: 2.1, 3.3, 4.1_
  
  - [x] 9.2 Create StepPreview component in `src/components/ai/StepPreview.tsx`
    - Display streaming content during generation
    - Show editable textarea for completed steps (Step-by-Step mode)
    - Display error message with retry/skip options for error state
    - Use Framer Motion for content fade-in animation
    - _Requirements: 2.2, 2.3, 4.3, 7.1_
  
  - [x] 9.3 Create StepControls component in `src/components/ai/StepControls.tsx`
    - Confirm button (enabled when step completed, Step-by-Step mode only)
    - Skip button (always enabled during generation)
    - Regenerate button (enabled when step completed or error)
    - Pause/Resume button
    - Switch to Quick Mode button (Step-by-Step mode only)
    - Use Lucide React icons for buttons
    - _Requirements: 1.5, 2.4, 2.6, 2.7, 4.4_

- [x] 10. Create final review and main modal
  - [x] 10.1 Create FinalReviewPanel component in `src/components/ai/FinalReviewPanel.tsx`
    - Display all completed steps with content preview
    - Checkbox for each step to select/deselect for application
    - Select All / Deselect All buttons
    - Regenerate button for each step
    - Apply Selected button
    - _Requirements: 6.2, 6.4, 6.6_
  
  - [x] 10.2 Create StepwiseGeneratorModal in `src/components/ai/StepwiseGeneratorModal.tsx`
    - Modal layout with header, body (StepList + StepPreview), footer (StepControls)
    - Show ModeSelectionDialog on initial open
    - Initialize service and session on mode selection
    - Handle all step callbacks and state updates
    - Show overall progress indicator
    - Show FinalReviewPanel when all steps complete (Quick mode)
    - Apply generated content to ResumeContext on complete
    - _Requirements: 1.1, 3.1, 6.1, 6.2_
  
  - [x] 10.3 Add user info input form
    - Input fields for name, targetPosition, industry, experienceLevel
    - Pre-fill from existing resumeData.personalInfo if available
    - Validate required fields before starting generation
    - _Requirements: 5.1_

- [x] 11. Add internationalization support
  - [x] 11.1 Add stepwise generation translations to `src/i18n/locales.ts`
    - Add Chinese (zh) translations for all stepwise UI text
    - Add English (en) translations for all stepwise UI text
    - Include step titles, descriptions, button labels, error messages
    - Include mode selection dialog text
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.2 Write property test for translation completeness (Property 12)
    - **Property 12: Translation Keys Completeness**
    - **Validates: Requirements 8.1, 8.2**

- [x] 12. Integrate with editor page
  - [x] 12.1 Add stepwise generation button to editor toolbar
    - Add button in `src/app/editor/page.tsx` toolbar section
    - Open StepwiseGeneratorModal on click
    - Handle onComplete callback to update resumeData
    - _Requirements: 6.1, 6.2_
  
  - [x] 12.2 Update AIAssistant component integration
    - Add option to use stepwise generation from AI assistant panel
    - Maintain backward compatibility with existing AI generate button
    - _Requirements: 2.1_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All UI text must use i18n translation keys
- Use Lucide React icons only (no emoji)
- Follow existing code patterns from aiService.ts and ProgressIndicator.tsx
- Quick Mode shows final review before applying; Step-by-Step Mode applies immediately on confirm
