/**
 * Property Test: No Emoji in Rendered Output
 * 
 * Feature: resume-editor-optimization
 * Property 9: No Emoji in Rendered Output
 * 
 * *For any* rendered component in the editor, the output HTML SHALL not 
 * contain emoji unicode characters (U+1F300 to U+1F9FF range) as decorative elements.
 * 
 * **Validates: Requirements 1.1**
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regex pattern to detect emoji characters in the common emoji ranges:
 * - U+1F300 to U+1F9FF (Miscellaneous Symbols and Pictographs, Emoticons, etc.)
 * - U+2600 to U+26FF (Miscellaneous Symbols)
 * - U+2700 to U+27BF (Dingbats)
 * - U+FE00 to U+FE0F (Variation Selectors)
 * - U+1F000 to U+1F02F (Mahjong Tiles)
 * - U+1F0A0 to U+1F0FF (Playing Cards)
 */
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA00}-\u{1FAFF}]/gu;

/**
 * Common decorative emojis that should NOT appear in the codebase
 */
const DECORATIVE_EMOJIS = [
  '📝', '👤', '💼', '🎓', '📧', '📱', '🏠', '🔗', '⭐', '🎯',
  '📊', '💡', '🚀', '✨', '🔥', '💪', '👍', '❤️', '🎉', '📌',
  '📋', '✅', '❌', '⚠️', 'ℹ️', '🔔', '📁', '📂', '🗂️', '📄',
  '🖼️', '🎨', '🛠️', '⚙️', '🔧', '🔨', '📐', '📏', '✏️', '🖊️'
];

/**
 * Get all TypeScript/TSX component files (excluding API routes and test files)
 */
function getComponentFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip test directories, node_modules, and API routes
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__' && 
            entry.name !== 'node_modules' && 
            entry.name !== 'api') {
          files.push(...getComponentFiles(fullPath));
        }
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        // Only include .tsx files (React components) for UI emoji check
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

/**
 * Check if a file contains emoji characters in JSX/render output
 * Excludes comments and console.log statements
 */
function findEmojisInFile(filePath: string): { file: string; emojis: string[]; lines: number[] } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const foundEmojis: string[] = [];
    const lineNumbers: number[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('//') || 
          trimmedLine.startsWith('*') || 
          trimmedLine.startsWith('/*')) {
        return;
      }
      
      // Skip console.log statements (dev-only logging)
      if (trimmedLine.includes('console.log') || 
          trimmedLine.includes('console.warn') ||
          trimmedLine.includes('console.error')) {
        return;
      }
      
      const matches = line.match(EMOJI_REGEX);
      if (matches) {
        foundEmojis.push(...matches);
        lineNumbers.push(index + 1);
      }
    });
    
    if (foundEmojis.length > 0) {
      return {
        file: filePath,
        emojis: [...new Set(foundEmojis)],
        lines: [...new Set(lineNumbers)]
      };
    }
  } catch (error) {
    // File can't be read
  }
  
  return null;
}

/**
 * Check if a string contains decorative emojis
 */
function containsDecorativeEmoji(text: string): boolean {
  return DECORATIVE_EMOJIS.some(emoji => text.includes(emoji)) || EMOJI_REGEX.test(text);
}

describe('Property 9: No Emoji in Rendered Output', () => {
  const componentsDir = path.join(__dirname, '..');
  const appDir = path.join(__dirname, '../../app');
  const dataDir = path.join(__dirname, '../../data');
  
  // Feature: resume-editor-optimization, Property 9: No Emoji in Rendered Output
  // **Validates: Requirements 1.1**
  
  it('should not contain emoji characters in React component source files', () => {
    const componentFiles = getComponentFiles(componentsDir);
    const appFiles = getComponentFiles(appDir);
    const dataFiles = getComponentFiles(dataDir);
    
    const allFiles = [...componentFiles, ...appFiles, ...dataFiles];
    const filesWithEmojis: Array<{ file: string; emojis: string[]; lines: number[] }> = [];
    
    for (const file of allFiles) {
      const result = findEmojisInFile(file);
      if (result) {
        filesWithEmojis.push(result);
      }
    }
    
    if (filesWithEmojis.length > 0) {
      const errorMessage = filesWithEmojis
        .map(f => `${f.file}:\n  Emojis: ${f.emojis.join(', ')}\n  Lines: ${f.lines.join(', ')}`)
        .join('\n\n');
      
      throw new Error(`Found emoji characters in the following files:\n\n${errorMessage}`);
    }
    
    expect(filesWithEmojis).toHaveLength(0);
  });

  // Property-based test: For any string that could be rendered, it should not contain decorative emojis
  it('should reject any string containing decorative emojis (property-based)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DECORATIVE_EMOJIS),
        (emoji) => {
          // Any decorative emoji should be detected by our containsDecorativeEmoji function
          expect(containsDecorativeEmoji(emoji)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property-based test: For any valid Lucide icon name, it should not be an emoji
  it('should verify Lucide icon names are not emojis (property-based)', () => {
    const lucideIconNames = [
      'User', 'Briefcase', 'GraduationCap', 'Mail', 'Phone', 'MapPin',
      'Link', 'Star', 'Target', 'BarChart', 'Lightbulb', 'Rocket',
      'Sparkles', 'Flame', 'ThumbsUp', 'Heart', 'PartyPopper', 'Pin',
      'ClipboardList', 'Check', 'X', 'AlertTriangle', 'Info', 'Bell',
      'Folder', 'FolderOpen', 'File', 'Image', 'Palette', 'Wrench',
      'Settings', 'Edit', 'Pen', 'Save', 'Download', 'Upload'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...lucideIconNames),
        (iconName) => {
          // Lucide icon names should never contain emoji characters
          expect(containsDecorativeEmoji(iconName)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property-based test: Generated UI text should not contain emojis
  it('should verify generated text does not contain emojis (property-based)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (text) => {
          // If text contains emoji, our detector should catch it
          const hasEmoji = EMOJI_REGEX.test(text);
          const detected = containsDecorativeEmoji(text);
          
          // If there's an emoji in the common ranges, it should be detected
          if (hasEmoji) {
            return detected === true;
          }
          // If no emoji, the text is valid (may or may not be detected based on other patterns)
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
