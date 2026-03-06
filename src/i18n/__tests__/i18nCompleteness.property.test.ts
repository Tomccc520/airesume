/**
 * Property Test: i18n Translation Completeness
 * 
 * Feature: resume-editor-optimization
 * Property 4: i18n Translation Completeness
 * 
 * *For any* translation key used in the application, both Chinese (zh) and 
 * English (en) locales SHALL have a non-empty string value.
 * 
 * **Validates: Requirements 4.1, 4.3**
 */

import * as fc from 'fast-check';
import { zh, en } from '../locales';

type NestedObject = { [key: string]: string | NestedObject };

/**
 * Recursively extracts all translation keys from a translations object
 * Returns an array of dot-notation paths (e.g., 'editor.toolbar.save')
 */
function extractAllKeys(obj: NestedObject, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(newPrefix);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractAllKeys(value as NestedObject, newPrefix));
    }
  }
  
  return keys;
}

/**
 * Gets a value from a nested object using dot notation path
 */
function getValueByPath(obj: NestedObject, path: string): string | undefined {
  const parts = path.split('.');
  let current: string | NestedObject = obj;
  
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Checks if a string is non-empty (not null, undefined, or whitespace-only)
 */
function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Helper to get all unique keys from both locales
 */
function getAllUniqueKeys(zhKeys: string[], enKeys: string[]): string[] {
  const combined = zhKeys.concat(enKeys);
  return Array.from(new Set(combined));
}

// Extract keys once at module level
const zhKeys = extractAllKeys(zh as unknown as NestedObject);
const enKeys = extractAllKeys(en as unknown as NestedObject);

describe('Property 4: i18n Translation Completeness', () => {
  // Feature: resume-editor-optimization, Property 4: i18n Translation Completeness
  // **Validates: Requirements 4.1, 4.3**
  
  it('should have extracted translation keys', () => {
    // Sanity check that we have keys
    expect(zhKeys.length).toBeGreaterThan(0);
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it('should have the same number of translation keys in both locales', () => {
    expect(zhKeys.length).toBe(enKeys.length);
  });

  it('should have all Chinese keys present in English locale', () => {
    const missingInEn = zhKeys.filter(key => !enKeys.includes(key));
    
    if (missingInEn.length > 0) {
      throw new Error(`Missing keys in English locale:\n${missingInEn.join('\n')}`);
    }
    
    expect(missingInEn).toHaveLength(0);
  });

  it('should have all English keys present in Chinese locale', () => {
    const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
    
    if (missingInZh.length > 0) {
      throw new Error(`Missing keys in Chinese locale:\n${missingInZh.join('\n')}`);
    }
    
    expect(missingInZh).toHaveLength(0);
  });

  // Property-based test: For any translation key, both locales should have non-empty values
  it('should have non-empty string values for all keys in both locales (property-based)', () => {
    const allKeys = getAllUniqueKeys(zhKeys, enKeys);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...allKeys),
        (key) => {
          const zhValue = getValueByPath(zh as unknown as NestedObject, key);
          const enValue = getValueByPath(en as unknown as NestedObject, key);
          
          const zhValid = isNonEmptyString(zhValue);
          const enValid = isNonEmptyString(enValue);
          
          if (!zhValid) {
            throw new Error(`Chinese translation for '${key}' is empty or missing. Value: ${JSON.stringify(zhValue)}`);
          }
          
          if (!enValid) {
            throw new Error(`English translation for '${key}' is empty or missing. Value: ${JSON.stringify(enValue)}`);
          }
          
          return zhValid && enValid;
        }
      ),
      { numRuns: Math.min(allKeys.length * 2, 500) } // Run enough times to cover all keys
    );
  });

  // Property-based test: For any randomly selected subset of keys, translations should be complete
  it('should maintain translation completeness for random key subsets (property-based)', () => {
    const allKeys = getAllUniqueKeys(zhKeys, enKeys);
    
    fc.assert(
      fc.property(
        fc.shuffledSubarray(allKeys, { minLength: 1, maxLength: Math.min(50, allKeys.length) }),
        (keySubset) => {
          for (const key of keySubset) {
            const zhValue = getValueByPath(zh as unknown as NestedObject, key);
            const enValue = getValueByPath(en as unknown as NestedObject, key);
            
            if (!isNonEmptyString(zhValue) || !isNonEmptyString(enValue)) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Verify specific critical translation sections are complete
  describe('Critical sections completeness', () => {
    const criticalSections = [
      'common',
      'editor.toolbar',
      'editor.messages',
      'editor.jdMatcher',
      'editor.aiConfig',
      'editor.personalInfo',
      'editor.experience',
      'editor.education',
      'editor.skills',
      'editor.projects',
      'styles',
      'home.hero',
      'home.features'
    ];

    it.each(criticalSections)('should have complete translations for section: %s', (section) => {
      const sectionKeys = zhKeys.filter(key => key.startsWith(section));
      
      expect(sectionKeys.length).toBeGreaterThan(0);
      
      for (const key of sectionKeys) {
        const zhValue = getValueByPath(zh as unknown as NestedObject, key);
        const enValue = getValueByPath(en as unknown as NestedObject, key);
        
        expect(isNonEmptyString(zhValue)).toBe(true);
        expect(isNonEmptyString(enValue)).toBe(true);
      }
    });
  });

  // Property-based test: Translation values should not be placeholder text
  it('should not contain placeholder text in translations (property-based)', () => {
    const placeholderPatterns = [
      /^TODO$/i,
      /^FIXME$/i,
      /^XXX$/i,
      /^\[.*\]$/,  // [placeholder]
      /^<.*>$/,    // <placeholder>
    ];
    
    const allKeys = getAllUniqueKeys(zhKeys, enKeys);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...allKeys),
        (key) => {
          const zhValue = getValueByPath(zh as unknown as NestedObject, key);
          const enValue = getValueByPath(en as unknown as NestedObject, key);
          
          if (typeof zhValue === 'string') {
            for (const pattern of placeholderPatterns) {
              if (pattern.test(zhValue.trim())) {
                throw new Error(`Chinese translation for '${key}' contains placeholder: ${zhValue}`);
              }
            }
          }
          
          if (typeof enValue === 'string') {
            for (const pattern of placeholderPatterns) {
              if (pattern.test(enValue.trim())) {
                throw new Error(`English translation for '${key}' contains placeholder: ${enValue}`);
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: Math.min(allKeys.length, 300) }
    );
  });
});
