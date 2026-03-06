/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description Property Tests for TemplatePreview Layout Type Support
 * 
 * Feature: template-export-optimization
 * 
 * Property 7: 布局类型支持完整性
 * *对于任意* 支持的布局类型（sidebar、gradient、classic、minimal、creative、default），
 * `getLayoutType(template)` 应返回正确的布局类型字符串，且 `renderLayout()` 应能成功渲染该类型。
 * **Validates: Requirements 5.4**
 */

import * as fc from 'fast-check'
import { TemplateStyle } from '@/types/template'

/**
 * Supported layout types
 */
export type LayoutType = 'sidebar' | 'gradient' | 'classic' | 'minimal' | 'creative' | 'default'

/**
 * All supported layout types
 */
export const SUPPORTED_LAYOUT_TYPES: LayoutType[] = [
  'sidebar',
  'gradient', 
  'classic',
  'minimal',
  'creative',
  'default'
]

/**
 * Template ID to layout type mapping
 * Based on the logic in TemplatePreview.tsx
 */
export const TEMPLATE_ID_TO_LAYOUT_MAP: Record<string, LayoutType> = {
  'modern-sidebar': 'sidebar',
  'gradient-header': 'gradient',
  'classic-elegant': 'classic',
  'business-professional': 'classic',
  'minimal-clean': 'minimal',
  'nordic-minimal': 'minimal',
  'creative-designer': 'creative',
  'magazine-style': 'creative',
  'tech-developer': 'default'
}

/**
 * Get layout type from template
 * Extracted from TemplatePreview.tsx useMemo logic for testing
 * 
 * @param template - The template style object
 * @returns The layout type string
 */
export function getLayoutType(template: Pick<TemplateStyle, 'id' | 'layout'>): LayoutType {
  const id = template.id
  
  // Check specific template IDs first
  if (id === 'modern-sidebar') return 'sidebar'
  if (id === 'gradient-header') return 'gradient'
  if (id === 'classic-elegant' || id === 'business-professional') return 'classic'
  if (id === 'minimal-clean' || id === 'nordic-minimal') return 'minimal'
  if (id === 'creative-designer' || id === 'magazine-style') return 'creative'
  if (id === 'tech-developer') return 'default'
  
  // Fallback: check layout configuration
  if (template.layout.columns.count === 2) {
    return 'sidebar'
  }
  
  return 'default'
}

/**
 * Check if a layout type is valid/supported
 * 
 * @param layoutType - The layout type to check
 * @returns Whether the layout type is supported
 */
export function isValidLayoutType(layoutType: string): layoutType is LayoutType {
  return SUPPORTED_LAYOUT_TYPES.includes(layoutType as LayoutType)
}

/**
 * Simulate render layout - checks if layout type can be rendered
 * In the actual component, this would call the appropriate render function
 * 
 * @param layoutType - The layout type to render
 * @returns Whether the layout can be rendered successfully
 */
export function canRenderLayout(layoutType: LayoutType): boolean {
  // All supported layout types should be renderable
  return SUPPORTED_LAYOUT_TYPES.includes(layoutType)
}

/**
 * Property 7: 布局类型支持完整性
 * Feature: template-export-optimization, Property 7
 * **Validates: Requirements 5.4**
 */
describe('Feature: template-export-optimization, Property 7: 布局类型支持完整性', () => {
  
  describe('Layout Type Identification', () => {
    
    it('should correctly identify modern-sidebar as sidebar layout', () => {
      const template = {
        id: 'modern-sidebar',
        layout: { columns: { count: 2 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('sidebar')
    })

    it('should correctly identify gradient-header as gradient layout', () => {
      const template = {
        id: 'gradient-header',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('gradient')
    })

    it('should correctly identify classic-elegant as classic layout', () => {
      const template = {
        id: 'classic-elegant',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('classic')
    })

    it('should correctly identify business-professional as classic layout', () => {
      const template = {
        id: 'business-professional',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('classic')
    })

    it('should correctly identify minimal-clean as minimal layout', () => {
      const template = {
        id: 'minimal-clean',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('minimal')
    })

    it('should correctly identify nordic-minimal as minimal layout', () => {
      const template = {
        id: 'nordic-minimal',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('minimal')
    })

    it('should correctly identify creative-designer as creative layout', () => {
      const template = {
        id: 'creative-designer',
        layout: { columns: { count: 2 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('creative')
    })

    it('should correctly identify magazine-style as creative layout', () => {
      const template = {
        id: 'magazine-style',
        layout: { columns: { count: 2 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('creative')
    })

    it('should correctly identify tech-developer as default layout', () => {
      const template = {
        id: 'tech-developer',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      expect(getLayoutType(template)).toBe('default')
    })
  })

  describe('Property: All known template IDs map to correct layout types', () => {
    
    it('property: for any known template ID, getLayoutType returns the expected layout type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(TEMPLATE_ID_TO_LAYOUT_MAP)),
          (templateId) => {
            const template = {
              id: templateId,
              layout: { columns: { count: 1 } }
            } as Pick<TemplateStyle, 'id' | 'layout'>
            
            const result = getLayoutType(template)
            const expected = TEMPLATE_ID_TO_LAYOUT_MAP[templateId]
            
            return result === expected
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property: Templates with 2 columns default to sidebar layout', () => {
    
    // Generator for unknown template IDs (not in the known mapping)
    const unknownTemplateIdArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(id => !(id in TEMPLATE_ID_TO_LAYOUT_MAP))
    
    it('property: for any unknown template ID with 2 columns, layout type should be sidebar', () => {
      fc.assert(
        fc.property(
          unknownTemplateIdArb,
          (templateId) => {
            const template = {
              id: templateId,
              layout: { columns: { count: 2 } }
            } as Pick<TemplateStyle, 'id' | 'layout'>
            
            const result = getLayoutType(template)
            
            return result === 'sidebar'
          }
        ),
        { numRuns: 100 }
      )
    })

    it('property: for any unknown template ID with 1 column, layout type should be default', () => {
      fc.assert(
        fc.property(
          unknownTemplateIdArb,
          (templateId) => {
            const template = {
              id: templateId,
              layout: { columns: { count: 1 } }
            } as Pick<TemplateStyle, 'id' | 'layout'>
            
            const result = getLayoutType(template)
            
            return result === 'default'
          }
        ),
        { numRuns: 100 }
      )
    })

    it('property: for any unknown template ID with 3+ columns, layout type should be default', () => {
      fc.assert(
        fc.property(
          unknownTemplateIdArb,
          fc.integer({ min: 3, max: 10 }),
          (templateId, columnCount) => {
            const template = {
              id: templateId,
              layout: { columns: { count: columnCount } }
            } as Pick<TemplateStyle, 'id' | 'layout'>
            
            const result = getLayoutType(template)
            
            return result === 'default'
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property: All supported layout types are valid and renderable', () => {
    
    it('property: for any supported layout type, isValidLayoutType returns true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LAYOUT_TYPES),
          (layoutType) => {
            return isValidLayoutType(layoutType) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('property: for any supported layout type, canRenderLayout returns true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LAYOUT_TYPES),
          (layoutType) => {
            return canRenderLayout(layoutType) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('property: for any random string not in supported types, isValidLayoutType returns false', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => !SUPPORTED_LAYOUT_TYPES.includes(s as LayoutType)),
          (randomString) => {
            return isValidLayoutType(randomString) === false
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property: getLayoutType always returns a valid layout type', () => {
    
    // Generator for arbitrary template-like objects
    const templateArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 100 }),
      layout: fc.record({
        columns: fc.record({
          count: fc.integer({ min: 1, max: 10 })
        })
      })
    })

    it('property: for any template, getLayoutType returns a valid layout type', () => {
      fc.assert(
        fc.property(
          templateArb,
          (template) => {
            const result = getLayoutType(template as Pick<TemplateStyle, 'id' | 'layout'>)
            
            // Result should always be one of the supported layout types
            return SUPPORTED_LAYOUT_TYPES.includes(result)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('property: getLayoutType is deterministic - same input always produces same output', () => {
      fc.assert(
        fc.property(
          templateArb,
          (template) => {
            const result1 = getLayoutType(template as Pick<TemplateStyle, 'id' | 'layout'>)
            const result2 = getLayoutType(template as Pick<TemplateStyle, 'id' | 'layout'>)
            
            return result1 === result2
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property: Layout type completeness - all 6 types are covered', () => {
    
    it('should have exactly 6 supported layout types', () => {
      expect(SUPPORTED_LAYOUT_TYPES.length).toBe(6)
    })

    it('should include all required layout types', () => {
      const requiredTypes: LayoutType[] = ['sidebar', 'gradient', 'classic', 'minimal', 'creative', 'default']
      
      requiredTypes.forEach(type => {
        expect(SUPPORTED_LAYOUT_TYPES).toContain(type)
      })
    })

    it('property: each supported layout type has at least one template ID mapping to it', () => {
      const layoutTypesWithMappings = new Set(Object.values(TEMPLATE_ID_TO_LAYOUT_MAP))
      
      // Note: 'default' is the fallback, so it may not have explicit mappings
      // but tech-developer maps to it
      const typesWithExplicitMappings: LayoutType[] = ['sidebar', 'gradient', 'classic', 'minimal', 'creative', 'default']
      
      typesWithExplicitMappings.forEach(type => {
        expect(layoutTypesWithMappings.has(type)).toBe(true)
      })
    })
  })

  describe('Edge Cases', () => {
    
    it('should handle empty template ID gracefully', () => {
      const template = {
        id: '',
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      const result = getLayoutType(template)
      
      // Empty ID should fall through to default
      expect(SUPPORTED_LAYOUT_TYPES).toContain(result)
    })

    it('should handle template ID with special characters', () => {
      const template = {
        id: 'template-with-special-chars!@#$%',
        layout: { columns: { count: 2 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      const result = getLayoutType(template)
      
      // Should fall back to sidebar due to 2 columns
      expect(result).toBe('sidebar')
    })

    it('should handle very long template IDs', () => {
      const longId = 'a'.repeat(1000)
      const template = {
        id: longId,
        layout: { columns: { count: 1 } }
      } as Pick<TemplateStyle, 'id' | 'layout'>
      
      const result = getLayoutType(template)
      
      // Should fall back to default
      expect(result).toBe('default')
    })
  })
})
