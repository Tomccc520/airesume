# Requirements Document

## Introduction

This feature transforms the AI resume generation from a "one-click generate all" approach to a "stepwise generation" mode with two selectable modes: Quick Mode and Step-by-Step Mode. Users will be able to see each module's generation process, confirm or regenerate individual sections, and have clear progress visibility throughout the generation workflow.

## Glossary

- **Stepwise_Generator**: The service component that orchestrates sequential generation of resume modules
- **Generation_Step**: A single module generation unit (e.g., personal summary, work experience, skills)
- **Step_Status**: The current state of a generation step (pending, generating, completed, error, skipped)
- **Generation_Session**: A complete stepwise generation workflow from start to finish
- **Module_Preview**: The preview display of generated content for a specific module
- **Quick_Mode**: Generation mode where all steps run sequentially without pausing, with final confirmation at the end
- **StepByStep_Mode**: Generation mode where each step pauses for user confirmation before proceeding

## Requirements

### Requirement 1: Generation Mode Selection

**User Story:** As a user, I want to choose between quick generation and step-by-step generation, so that I can control the level of interaction during the generation process.

#### Acceptance Criteria

1. WHEN a user initiates AI generation, THE Stepwise_Generator SHALL display a mode selection dialog with two options: Quick Mode and Step-by-Step Mode
2. WHEN Quick Mode is selected, THE Stepwise_Generator SHALL generate all steps sequentially without pausing, displaying real-time progress and streaming content
3. WHEN Step-by-Step Mode is selected, THE Stepwise_Generator SHALL pause after each step completion for user confirmation
4. THE Stepwise_Generator SHALL remember the user's last selected mode preference in localStorage
5. THE Stepwise_Generator SHALL allow users to switch modes during generation (from Step-by-Step to Quick Mode only)

### Requirement 2: Stepwise Generation Workflow

**User Story:** As a user, I want to generate my resume content step by step, so that I can review and control each section's generation.

#### Acceptance Criteria

1. WHEN a user initiates stepwise generation, THE Stepwise_Generator SHALL display a list of all available generation steps (summary, experience, education, skills, projects)
2. WHEN a generation step begins, THE Stepwise_Generator SHALL show a loading state with streaming content output
3. WHEN a generation step completes, THE Stepwise_Generator SHALL display the generated content in a Module_Preview
4. IN Step-by-Step Mode, WHEN a user confirms a step, THE Stepwise_Generator SHALL mark the step as completed and proceed to the next step
5. IN Quick Mode, WHEN a step completes, THE Stepwise_Generator SHALL automatically proceed to the next step without user confirmation
6. WHEN a user requests regeneration, THE Stepwise_Generator SHALL regenerate the current step's content
7. WHEN a user skips a step, THE Stepwise_Generator SHALL mark the step as skipped and proceed to the next step

### Requirement 3: Progress Indication

**User Story:** As a user, I want to see clear progress of the generation process, so that I know how much has been completed and what remains.

#### Acceptance Criteria

1. THE Stepwise_Generator SHALL display overall progress as a percentage and step count (e.g., "3/5 steps completed")
2. WHEN a step is generating, THE Stepwise_Generator SHALL display a streaming progress indicator with real-time content
3. THE Stepwise_Generator SHALL visually distinguish between pending, generating, completed, error, and skipped steps using different colors and icons
4. WHEN all steps are completed or skipped, THE Stepwise_Generator SHALL display a completion summary
5. IN Quick Mode, THE Stepwise_Generator SHALL show a continuous progress bar across all steps

### Requirement 4: Step Navigation and Control

**User Story:** As a user, I want to navigate between steps and control the generation flow, so that I can manage the process flexibly.

#### Acceptance Criteria

1. WHEN viewing completed steps, THE Stepwise_Generator SHALL allow users to navigate back to review previous steps
2. WHEN viewing a completed step, THE Stepwise_Generator SHALL allow users to regenerate that step's content
3. IN Step-by-Step Mode, THE Stepwise_Generator SHALL allow users to edit generated content before confirming
4. THE Stepwise_Generator SHALL allow users to pause the generation workflow at any step
5. WHEN a user pauses generation, THE Stepwise_Generator SHALL preserve all completed step data
6. WHEN a user resumes generation, THE Stepwise_Generator SHALL continue from the last incomplete step
7. THE Stepwise_Generator SHALL allow users to cancel generation at any time with a confirmation dialog

### Requirement 5: Module-Specific Generation

**User Story:** As a user, I want each resume module to be generated with appropriate context, so that the content is relevant and coherent.

#### Acceptance Criteria

1. WHEN generating personal summary, THE Stepwise_Generator SHALL use user-provided name, target position, and experience level
2. WHEN generating work experience, THE Stepwise_Generator SHALL generate entries that align with the target position
3. WHEN generating skills, THE Stepwise_Generator SHALL generate skills relevant to the target position and industry
4. WHEN generating education, THE Stepwise_Generator SHALL generate appropriate educational background
5. WHEN generating projects, THE Stepwise_Generator SHALL generate project experiences that demonstrate relevant skills

### Requirement 6: Content Application

**User Story:** As a user, I want to apply generated content to my resume, so that I can build my resume from the generated sections.

#### Acceptance Criteria

1. IN Step-by-Step Mode, WHEN a user confirms a step, THE Stepwise_Generator SHALL immediately apply the generated content to the resume data
2. IN Quick Mode, WHEN all steps complete, THE Stepwise_Generator SHALL display a final review screen before applying content
3. WHEN a user modifies generated content before confirming, THE Stepwise_Generator SHALL apply the modified content
4. THE Stepwise_Generator SHALL provide an option to apply all content at once or select specific sections to apply
5. IF a step is skipped, THEN THE Stepwise_Generator SHALL not modify the corresponding resume section
6. THE Stepwise_Generator SHALL show a preview of how the generated content will appear in the resume

### Requirement 7: Error Handling

**User Story:** As a user, I want clear error feedback and recovery options, so that I can handle generation failures gracefully.

#### Acceptance Criteria

1. IF a generation step fails, THEN THE Stepwise_Generator SHALL display a clear error message
2. IF a generation step fails, THEN THE Stepwise_Generator SHALL provide a retry option
3. IF a generation step fails, THEN THE Stepwise_Generator SHALL allow users to skip the failed step
4. WHEN network errors occur, THE Stepwise_Generator SHALL preserve completed step data and allow retry

### Requirement 8: Internationalization

**User Story:** As a user, I want the stepwise generation interface to support multiple languages, so that I can use it in my preferred language.

#### Acceptance Criteria

1. THE Stepwise_Generator SHALL display all UI text using translation keys from the i18n system
2. THE Stepwise_Generator SHALL support both Chinese and English languages
3. WHEN the language changes, THE Stepwise_Generator SHALL update all displayed text accordingly
