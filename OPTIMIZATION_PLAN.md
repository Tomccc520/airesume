# Optimization Plan

This document outlines the comprehensive refactoring and optimization plan for the Resume Builder application. The primary goals are to modernize the UI design (border-only style, no shadows), improve code maintainability, and enhance performance.

## 1. UI/UX Modernization (No Shadows, Border-Only)

**Goal:** Achieve a clean, flat, professional look by removing all drop shadows and using borders/strokes for depth and hierarchy.

- [ ] **Global Style Audit:** Scan all components for `shadow-`, `drop-shadow-` classes and replace them with `border` or `ring` utilities.
- [ ] **AIAssistant Component:**
    - Remove shadows from the modal and input areas.
    - Use borders for separation.
    - Modernize the "thinking" state visualization.
- [ ] **ExportPreviewDialog:**
    - Remove shadows from the dialog container and preview card.
    - Use a clean border for the preview area.
- [ ] **TemplateSelector:**
    - Ensure all template cards use the new border-only hover effect (already started, needs verification).
- [ ] **Form Controls:**
    - Verify `FormField` and `InlineStyleControl` follow the new design language.
- [ ] **Buttons & Inputs:**
    - Standardize button styles to use `border` instead of `shadow` for hover states.

## 2. Code Architecture & Refactoring

**Goal:** Reduce component size and improve readability by extracting logic into hooks and smaller components.

- [ ] **ResumeEditor Refactoring:**
    - Extract global keyboard shortcuts to a `useGlobalShortcuts` hook.
    - Extract AI assistant logic to a `useAIAssistant` hook.
    - Move `navigationItems` configuration to a separate constant file.
- [ ] **ResumePreview Optimization:**
    - Memoize the component to prevent unnecessary re-renders during editing.
    - Optimize the rendering of large lists (experience, projects).
- [ ] **Type Safety:**
    - Audit and fix `any` type usages (e.g., in `getShortcutHelp`).
    - Ensure strict typing for all props and state.

## 3. Feature Enhancements

- [ ] **Keyboard Accessibility:** Ensure all new interactive elements (sidebar buttons, template cards) are keyboard accessible.
- [ ] **Performance:**
    - Lazy load heavy components like `TemplateSelector` and `ExportPreviewDialog`.
    - Optimize image loading in `TemplateSelector`.

## 4. Step-by-Step Implementation Plan

1.  **Phase 1: Style Cleanup (The "No Shadow" Mandate)**
    - Update `AIAssistant.tsx`
    - Update `ExportPreviewDialog.tsx`
    - Update `TemplateSelector.tsx` (Verify)
    - Update `ConfirmDialog.tsx` & `SaveDialog.tsx`

2.  **Phase 2: Logic Extraction**
    - Create `src/hooks/useGlobalShortcuts.ts`
    - Create `src/hooks/useResumeData.ts` (if not already present)
    - Refactor `ResumeEditor.tsx` to use these hooks.

3.  **Phase 3: Component Optimization**
    - Memoize `ResumePreview`.
    - Optimize `TemplateSelector` rendering.

4.  **Phase 4: Final Polish**
    - Global type check.
    - Final UI review.
