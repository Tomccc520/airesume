/**
 * @file utils/__tests__/animationUtils.property.test.ts
 * @description 动画时长范围属性测试
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

import * as fc from 'fast-check'
import {
  ANIMATION_DURATION,
  DEFAULT_ANIMATION_CONFIG,
  ANIMATION_PRESETS,
  AnimationConfig,
  AnimationPresetName,
  getEffectiveDuration,
  getAnimationPreset,
  getSimplifiedAnimationConfig,
  getDisabledAnimationConfig,
  isValidAnimationDuration,
  clampAnimationDuration
} from '../animationUtils'

// 动画预设名称
const presetNames: AnimationPresetName[] = [
  'fade', 'slideDown', 'slideUp', 'slideRight', 'slideLeft', 'scale', 'pop', 'expand'
]

// 生成动画配置
const animationConfigArb = fc.record({
  enabled: fc.boolean(),
  respectReducedMotion: fc.boolean(),
  durationMultiplier: fc.float({ min: Math.fround(0.1), max: Math.fround(3), noNaN: true })
})

describe('animationUtils Property Tests', () => {
  // Mock window.matchMedia
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })
  /**
   * Property 33: 动画时长范围
   * For any 动画配置，时长值 SHALL 在 150-300ms 范围内。
   * **Validates: Requirements 15.4**
   */
  describe('Property 33: 动画时长范围', () => {
    it('getEffectiveDuration 应返回有效范围内的时长', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          animationConfigArb,
          (baseDuration, config) => {
            // 只测试启用动画的情况
            const enabledConfig: AnimationConfig = { ...config, enabled: true, respectReducedMotion: false }
            const duration = getEffectiveDuration(baseDuration, enabledConfig)
            
            // 时长应在有效范围内
            expect(duration).toBeGreaterThanOrEqual(ANIMATION_DURATION.MIN)
            expect(duration).toBeLessThanOrEqual(ANIMATION_DURATION.MAX)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('clampAnimationDuration 应将时长钳制到有效范围', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 2000 }),
          (duration) => {
            const clamped = clampAnimationDuration(duration)
            
            expect(clamped).toBeGreaterThanOrEqual(ANIMATION_DURATION.MIN)
            expect(clamped).toBeLessThanOrEqual(ANIMATION_DURATION.MAX)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('isValidAnimationDuration 应正确验证时长', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 2000 }),
          (duration) => {
            const isValid = isValidAnimationDuration(duration)
            const expectedValid = duration >= ANIMATION_DURATION.MIN && duration <= ANIMATION_DURATION.MAX
            
            expect(isValid).toBe(expectedValid)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('所有预设动画时长应在有效范围内', () => {
      for (const presetName of presetNames) {
        const preset = ANIMATION_PRESETS[presetName]
        const durationMs = preset.transition.duration * 1000
        
        expect(durationMs).toBeGreaterThanOrEqual(ANIMATION_DURATION.MIN)
        expect(durationMs).toBeLessThanOrEqual(ANIMATION_DURATION.MAX)
      }
    })
  })

  /**
   * Property 34: 动画禁用功能
   * For any 禁用动画的设置，所有动画 SHALL 被跳过或使用 0ms 时长。
   * **Validates: Requirements 15.5**
   */
  describe('Property 34: 动画禁用功能', () => {
    it('禁用动画时 getEffectiveDuration 应返回 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (baseDuration) => {
            const disabledConfig = getDisabledAnimationConfig()
            const duration = getEffectiveDuration(baseDuration, disabledConfig)
            
            expect(duration).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('禁用动画时 getAnimationPreset 应返回 0 时长', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...presetNames),
          (presetName) => {
            const disabledConfig = getDisabledAnimationConfig()
            const preset = getAnimationPreset(presetName, disabledConfig)
            
            expect(preset.transition.duration).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getDisabledAnimationConfig 应返回禁用配置', () => {
      const config = getDisabledAnimationConfig()
      
      expect(config.enabled).toBe(false)
      expect(config.durationMultiplier).toBe(0)
    })
  })

  /**
   * Property 36: 低性能设备动画适配
   * For any 检测为低性能的设备，动画 SHALL 被自动简化或禁用。
   * **Validates: Requirements 15.8**
   */
  describe('Property 36: 低性能设备动画适配', () => {
    it('getSimplifiedAnimationConfig 应返回简化配置', () => {
      const config = getSimplifiedAnimationConfig()
      
      expect(config.enabled).toBe(true)
      expect(config.durationMultiplier).toBeLessThan(1)
      expect(config.respectReducedMotion).toBe(true)
    })

    it('简化配置应产生更短的动画时长', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 500 }),
          (baseDuration) => {
            const normalConfig = DEFAULT_ANIMATION_CONFIG
            const simplifiedConfig = getSimplifiedAnimationConfig()
            
            const normalDuration = getEffectiveDuration(baseDuration, normalConfig)
            const simplifiedDuration = getEffectiveDuration(baseDuration, simplifiedConfig)
            
            // 简化配置的时长应该更短或相等
            expect(simplifiedDuration).toBeLessThanOrEqual(normalDuration)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('动画预设', () => {
    it('所有预设应有完整的动画属性', () => {
      for (const presetName of presetNames) {
        const preset = ANIMATION_PRESETS[presetName]
        
        expect(preset.initial).toBeDefined()
        expect(preset.animate).toBeDefined()
        expect(preset.exit).toBeDefined()
        expect(preset.transition).toBeDefined()
        expect(preset.transition.duration).toBeDefined()
      }
    })

    it('getAnimationPreset 应返回有效的预设', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...presetNames),
          animationConfigArb,
          (presetName, config) => {
            const preset = getAnimationPreset(presetName, config)
            
            expect(preset.initial).toBeDefined()
            expect(preset.animate).toBeDefined()
            expect(preset.exit).toBeDefined()
            expect(preset.transition).toBeDefined()
            expect(typeof preset.transition.duration).toBe('number')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('默认配置', () => {
    it('DEFAULT_ANIMATION_CONFIG 应有有效值', () => {
      expect(DEFAULT_ANIMATION_CONFIG.enabled).toBe(true)
      expect(DEFAULT_ANIMATION_CONFIG.respectReducedMotion).toBe(true)
      expect(DEFAULT_ANIMATION_CONFIG.durationMultiplier).toBe(1)
    })

    it('ANIMATION_DURATION 常量应有效', () => {
      expect(ANIMATION_DURATION.MIN).toBe(150)
      expect(ANIMATION_DURATION.MAX).toBe(300)
      expect(ANIMATION_DURATION.DEFAULT).toBe(200)
      expect(ANIMATION_DURATION.MIN).toBeLessThan(ANIMATION_DURATION.MAX)
    })
  })
})
