/**
 * Property Test: Stepwise Generator Service
 * 
 * Feature: ai-stepwise-generation
 * Property 1: Mode Selection Persistence
 * Property 2: Session Initialization Creates All Steps
 * 
 * **Validates: Requirements 1.1, 1.4, 2.1**
 */

import * as fc from 'fast-check'
import { StepwiseGeneratorService, STEP_CONFIG } from '../stepwiseGeneratorService'
import { GenerationMode, UserGenerationInfo, GenerationStepType } from '@/types/stepwise'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

/**
 * Generate arbitrary UserGenerationInfo
 */
const userInfoArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  targetPosition: fc.string({ minLength: 1, maxLength: 100 }),
  industry: fc.string({ minLength: 1, maxLength: 50 }),
  experienceLevel: fc.constantFrom('junior', 'mid', 'senior', 'lead', 'manager')
})

/**
 * Generate arbitrary GenerationMode
 */
const modeArb = fc.constantFrom<GenerationMode>('quick', 'stepByStep')

const EXPECTED_STEP_ORDER: GenerationStepType[] = ['summary', 'experience', 'education', 'skills', 'projects']

describe('Property 1: Mode Selection Persistence', () => {
  // Feature: ai-stepwise-generation, Property 1: Mode Selection Persistence
  // **Validates: Requirements 1.4**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: For any GenerationMode selected, saveModePreference followed by 
   * getSavedModePreference SHALL return the same mode
   */
  it('should persist and retrieve mode preference correctly', () => {
    fc.assert(
      fc.property(modeArb, (mode) => {
        const service = new StepwiseGeneratorService()
        service.saveModePreference(mode)
        const retrieved = service.getSavedModePreference()
        return retrieved === mode
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Multiple saves should only keep the last value
   */
  it('should only keep the last saved mode preference', () => {
    fc.assert(
      fc.property(
        fc.array(modeArb, { minLength: 2, maxLength: 10 }),
        (modes) => {
          const service = new StepwiseGeneratorService()
          modes.forEach(mode => service.saveModePreference(mode))
          const retrieved = service.getSavedModePreference()
          return retrieved === modes[modes.length - 1]
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Default mode should be 'stepByStep' when no preference is saved
   */
  it('should return stepByStep as default when no preference saved', () => {
    const service = new StepwiseGeneratorService()
    const defaultMode = service.getSavedModePreference()
    expect(defaultMode).toBe('stepByStep')
  })
})

describe('Property 2: Session Initialization Creates All Steps', () => {
  // Feature: ai-stepwise-generation, Property 2: Session Initialization Creates All Steps
  // **Validates: Requirements 1.1, 2.1**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: For any valid UserGenerationInfo and GenerationMode, initSession 
   * SHALL create exactly 5 steps in correct order
   */
  it('should create exactly 5 steps in correct order', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        // Should have exactly 5 steps
        if (session.steps.length !== 5) return false
        
        // Steps should be in correct order
        for (let i = 0; i < EXPECTED_STEP_ORDER.length; i++) {
          if (session.steps[i].type !== EXPECTED_STEP_ORDER[i]) return false
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: All steps should have status 'pending' initially
   */
  it('should initialize all steps with pending status', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.steps.every(step => step.status === 'pending')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: All steps should have null content initially
   */
  it('should initialize all steps with null content', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.steps.every(step => step.content === null)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: All steps should have isSelected set to true initially
   */
  it('should initialize all steps with isSelected true', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.steps.every(step => step.isSelected === true)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session should store the provided mode
   */
  it('should store the provided mode in session', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.mode === mode
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session should store the provided userInfo
   */
  it('should store the provided userInfo in session', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return (
          session.userInfo.name === userInfo.name &&
          session.userInfo.targetPosition === userInfo.targetPosition &&
          session.userInfo.industry === userInfo.industry &&
          session.userInfo.experienceLevel === userInfo.experienceLevel
        )
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session should start with currentStepIndex 0
   */
  it('should start with currentStepIndex 0', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.currentStepIndex === 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session should not be paused or complete initially
   */
  it('should not be paused or complete initially', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.isPaused === false && session.isComplete === false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Each step should have a unique id
   */
  it('should assign unique ids to each step', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        const ids = session.steps.map(s => s.id)
        const uniqueIds = new Set(ids)
        
        return uniqueIds.size === ids.length
      }),
      { numRuns: 100 }
    )
  })
})


describe('Property 3: Step Status Transitions', () => {
  // Feature: ai-stepwise-generation, Property 3: Step Status Transitions
  // **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: skipStep should transition pending step to skipped
   */
  it('should transition pending step to skipped when skipStep is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        const sessionBefore = service.getSession()
        if (!sessionBefore) return false
        
        const stepBefore = sessionBefore.steps[0]
        if (stepBefore.status !== 'pending') return false
        
        service.skipStep()
        
        const sessionAfter = service.getSession()
        if (!sessionAfter) return false
        
        return sessionAfter.steps[0].status === 'skipped'
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: skipStep should advance currentStepIndex
   */
  it('should advance currentStepIndex when skipStep is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        const indexBefore = service.getSession()?.currentStepIndex ?? -1
        service.skipStep()
        const indexAfter = service.getSession()?.currentStepIndex ?? -1
        
        return indexAfter === indexBefore + 1
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: confirmStep should advance currentStepIndex
   */
  it('should advance currentStepIndex when confirmStep is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        const indexBefore = service.getSession()?.currentStepIndex ?? -1
        service.confirmStep()
        const indexAfter = service.getSession()?.currentStepIndex ?? -1
        
        return indexAfter === indexBefore + 1
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: confirmStep with modifiedContent should update step content
   */
  it('should update step content when confirmStep is called with modifiedContent', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.string({ minLength: 1, maxLength: 500 }),
        (userInfo, mode, modifiedContent) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          service.confirmStep(modifiedContent)
          
          const session = service.getSession()
          if (!session) return false
          
          return session.steps[0].content === modifiedContent
        }
      ),
      { numRuns: 100 }
    )
  })
})


describe('Property 4: Mode-Specific Behavior', () => {
  // Feature: ai-stepwise-generation, Property 4: Mode-Specific Behavior
  // **Validates: Requirements 1.2, 1.3, 2.4, 2.5**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: switchToQuickMode should only work in stepByStep mode
   */
  it('should only allow switchToQuickMode when in stepByStep mode', () => {
    fc.assert(
      fc.property(userInfoArb, (userInfo) => {
        const service = new StepwiseGeneratorService()
        
        // Test switching from stepByStep mode
        service.initSession(userInfo, 'stepByStep')
        service.switchToQuickMode()
        const afterSwitch = service.getSession()?.mode
        
        // Should have switched to quick
        if (afterSwitch !== 'quick') return false
        
        // Test that switching from quick mode does nothing
        const service2 = new StepwiseGeneratorService()
        service2.initSession(userInfo, 'quick')
        service2.switchToQuickMode()
        const stillQuick = service2.getSession()?.mode
        
        return stillQuick === 'quick'
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session mode should match the initialized mode
   */
  it('should preserve the initialized mode in session', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        const session = service.initSession(userInfo, mode)
        
        return session.mode === mode
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: switchToQuickMode should save the new preference
   */
  it('should save quick mode preference after switching', () => {
    fc.assert(
      fc.property(userInfoArb, (userInfo) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, 'stepByStep')
        service.switchToQuickMode()
        
        const savedPref = service.getSavedModePreference()
        return savedPref === 'quick'
      }),
      { numRuns: 100 }
    )
  })
})


describe('Property 5: Progress Calculation Accuracy', () => {
  // Feature: ai-stepwise-generation, Property 5: Progress Calculation Accuracy
  // **Validates: Requirements 3.1**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: Progress percentage should equal ((completed + skipped) / total) * 100
   */
  it('should calculate progress as (completed + skipped) / total * 100', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.integer({ min: 0, max: 5 }),
        (userInfo, mode, skipsCount) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Skip some steps
          for (let i = 0; i < Math.min(skipsCount, 5); i++) {
            service.skipStep()
          }
          
          const progress = service.calculateProgress()
          const expectedPercentage = Math.round((skipsCount / 5) * 100)
          
          return (
            progress.percentage === expectedPercentage &&
            progress.completed === skipsCount &&
            progress.total === 5
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Progress should be 0 initially
   */
  it('should return 0 progress initially', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        const progress = service.calculateProgress()
        return progress.percentage === 0 && progress.completed === 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Progress should be 100 when all steps are skipped
   */
  it('should return 100 progress when all steps are skipped', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        // Skip all 5 steps
        for (let i = 0; i < 5; i++) {
          service.skipStep()
        }
        
        const progress = service.calculateProgress()
        return progress.percentage === 100 && progress.completed === 5
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 6: Session Completion Detection', () => {
  // Feature: ai-stepwise-generation, Property 6: Session Completion Detection
  // **Validates: Requirements 3.4**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: isComplete should be true iff all steps are completed or skipped
   */
  it('should set isComplete true when all steps are completed or skipped', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        // Initially not complete
        if (service.getSession()?.isComplete) return false
        
        // Skip all steps
        for (let i = 0; i < 5; i++) {
          service.skipStep()
        }
        
        return service.getSession()?.isComplete === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: isComplete should be false if any step is pending or generating
   */
  it('should not be complete if any step is pending', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.integer({ min: 0, max: 4 }),
        (userInfo, mode, skipsCount) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Skip some but not all steps
          for (let i = 0; i < skipsCount; i++) {
            service.skipStep()
          }
          
          const session = service.getSession()
          if (!session) return false
          
          const hasPending = session.steps.some(s => s.status === 'pending')
          return hasPending ? !session.isComplete : session.isComplete
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 9: Mode Switch Restriction', () => {
  // Feature: ai-stepwise-generation, Property 9: Mode Switch Restriction
  // **Validates: Requirements 1.5**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: switchToQuickMode should only be callable in stepByStep mode
   */
  it('should only switch mode when current mode is stepByStep', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, initialMode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, initialMode)
        
        service.switchToQuickMode()
        
        const finalMode = service.getSession()?.mode
        
        if (initialMode === 'stepByStep') {
          return finalMode === 'quick'
        } else {
          return finalMode === 'quick' // Already quick, stays quick
        }
      }),
      { numRuns: 100 }
    )
  })
})


describe('Property 8: Pause Preserves Completed Data', () => {
  // Feature: ai-stepwise-generation, Property 8: Pause Preserves Completed Data
  // **Validates: Requirements 4.4, 4.5, 4.6**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: pauseGeneration should set isPaused to true
   */
  it('should set isPaused to true when pauseGeneration is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        service.pauseGeneration()
        
        return service.getSession()?.isPaused === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: resumeGeneration should set isPaused to false
   */
  it('should set isPaused to false when resumeGeneration is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        service.pauseGeneration()
        service.resumeGeneration()
        
        return service.getSession()?.isPaused === false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Pause should not modify completed step content
   */
  it('should preserve completed step content when paused', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.string({ minLength: 1, maxLength: 200 }),
        (userInfo, mode, content) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Confirm first step with content
          service.confirmStep(content)
          
          // Pause
          service.pauseGeneration()
          
          const session = service.getSession()
          if (!session) return false
          
          // First step content should be preserved
          return session.steps[0].content === content
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Pause should preserve currentStepIndex
   */
  it('should preserve currentStepIndex when paused', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.integer({ min: 0, max: 4 }),
        (userInfo, mode, skips) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Skip some steps
          for (let i = 0; i < skips; i++) {
            service.skipStep()
          }
          
          const indexBefore = service.getSession()?.currentStepIndex
          service.pauseGeneration()
          const indexAfter = service.getSession()?.currentStepIndex
          
          return indexBefore === indexAfter
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 11: Error Handling Preserves Completed Data', () => {
  // Feature: ai-stepwise-generation, Property 11: Error Handling Preserves Completed Data
  // **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: Completed steps should retain content after session operations
   */
  it('should retain completed step content through various operations', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 3 }),
        (userInfo, mode, contents) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Confirm steps with content
          contents.forEach(content => {
            service.confirmStep(content)
          })
          
          // Perform various operations
          service.pauseGeneration()
          service.resumeGeneration()
          
          const session = service.getSession()
          if (!session) return false
          
          // All confirmed steps should retain their content
          for (let i = 0; i < contents.length; i++) {
            if (session.steps[i].content !== contents[i]) return false
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: cancelGeneration should clear the session
   */
  it('should clear session when cancelGeneration is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        service.cancelGeneration()
        
        return service.getSession() === null
      }),
      { numRuns: 100 }
    )
  })
})


describe('Property 10: Content Application Excludes Skipped and Unselected Steps', () => {
  // Feature: ai-stepwise-generation, Property 10: Content Application Excludes Skipped and Unselected Steps
  // **Validates: Requirements 6.1, 6.2, 6.4, 6.5**

  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property: applyToResume should only include completed AND selected steps
   */
  it('should only include completed and selected steps in applyToResume result', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.string({ minLength: 10, maxLength: 200 }),
        (userInfo, mode, content) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Confirm first step (summary) with content
          service.confirmStep(content)
          
          // Skip second step
          service.skipStep()
          
          const result = service.applyToResume()
          
          // Should have personalInfo (from summary)
          // Should NOT have experience (skipped)
          return result.personalInfo !== undefined && result.experience === undefined
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: toggleStepSelection should toggle isSelected
   */
  it('should toggle isSelected when toggleStepSelection is called', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.integer({ min: 0, max: 4 }),
        (userInfo, mode, stepIndex) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          const before = service.getSession()?.steps[stepIndex].isSelected
          service.toggleStepSelection(stepIndex)
          const after = service.getSession()?.steps[stepIndex].isSelected
          
          return before !== after
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: selectAllSteps should set all isSelected to true
   */
  it('should set all isSelected to true when selectAllSteps is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        // Deselect some
        service.toggleStepSelection(0)
        service.toggleStepSelection(2)
        
        // Select all
        service.selectAllSteps()
        
        const session = service.getSession()
        return session?.steps.every(s => s.isSelected === true) ?? false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: deselectAllSteps should set all isSelected to false
   */
  it('should set all isSelected to false when deselectAllSteps is called', () => {
    fc.assert(
      fc.property(userInfoArb, modeArb, (userInfo, mode) => {
        const service = new StepwiseGeneratorService()
        service.initSession(userInfo, mode)
        
        service.deselectAllSteps()
        
        const session = service.getSession()
        return session?.steps.every(s => s.isSelected === false) ?? false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Unselected completed steps should not be in applyToResume result
   */
  it('should exclude unselected completed steps from applyToResume result', () => {
    fc.assert(
      fc.property(
        userInfoArb,
        modeArb,
        fc.string({ minLength: 10, maxLength: 200 }),
        (userInfo, mode, content) => {
          const service = new StepwiseGeneratorService()
          service.initSession(userInfo, mode)
          
          // Confirm first step with content
          service.confirmStep(content)
          
          // Deselect it
          service.toggleStepSelection(0)
          
          const result = service.applyToResume()
          
          // Should NOT have personalInfo since it's unselected
          return result.personalInfo === undefined
        }
      ),
      { numRuns: 100 }
    )
  })
})


describe('Property 12: Translation Keys Completeness', () => {
  // Feature: ai-stepwise-generation, Property 12: Translation Keys Completeness
  // **Validates: Requirements 8.1, 8.2**

  /**
   * Property: All stepwise translation keys should exist in both zh and en locales
   */
  it('should have all stepwise translation keys in both zh and en locales', async () => {
    // Dynamic import to avoid issues with module resolution in tests
    const { zh, en } = await import('@/i18n/locales')
    
    // Check that stepwise section exists in both
    expect(zh.stepwise).toBeDefined()
    expect(en.stepwise).toBeDefined()
    
    // Check modeSelection keys
    expect(zh.stepwise?.modeSelection?.title).toBeTruthy()
    expect(en.stepwise?.modeSelection?.title).toBeTruthy()
    expect(zh.stepwise?.modeSelection?.quickMode).toBeTruthy()
    expect(en.stepwise?.modeSelection?.quickMode).toBeTruthy()
    expect(zh.stepwise?.modeSelection?.stepByStepMode).toBeTruthy()
    expect(en.stepwise?.modeSelection?.stepByStepMode).toBeTruthy()
    
    // Check steps keys
    const stepTypes = ['summary', 'experience', 'education', 'skills', 'projects']
    for (const stepType of stepTypes) {
      expect((zh.stepwise?.steps as Record<string, string>)?.[stepType]).toBeTruthy()
      expect((en.stepwise?.steps as Record<string, string>)?.[stepType]).toBeTruthy()
    }
    
    // Check controls keys
    const controlKeys = ['confirm', 'skip', 'regenerate', 'pause', 'resume', 'cancel', 'apply']
    for (const key of controlKeys) {
      expect((zh.stepwise?.controls as Record<string, string>)?.[key]).toBeTruthy()
      expect((en.stepwise?.controls as Record<string, string>)?.[key]).toBeTruthy()
    }
    
    // Check status keys
    const statusKeys = ['pending', 'generating', 'completed', 'error', 'skipped']
    for (const key of statusKeys) {
      expect((zh.stepwise?.status as Record<string, string>)?.[key]).toBeTruthy()
      expect((en.stepwise?.status as Record<string, string>)?.[key]).toBeTruthy()
    }
    
    // Check userInfo keys
    expect(zh.stepwise?.userInfo?.title).toBeTruthy()
    expect(en.stepwise?.userInfo?.title).toBeTruthy()
    expect(zh.stepwise?.userInfo?.name).toBeTruthy()
    expect(en.stepwise?.userInfo?.name).toBeTruthy()
  })
})
