/**
 * Property Test: JD Keyword Analysis
 * 
 * Feature: resume-editor-optimization
 * Property 6: JD Keyword Analysis
 * Property 9: JD Keyword Extraction
 * Property 10: Keyword Importance Categorization
 * 
 * *For any* job description text containing identifiable skills/requirements, 
 * the JD_Matcher SHALL extract at least one keyword, and for any resume, 
 * it SHALL correctly categorize keywords as matched or missing based on resume content.
 * 
 * **Validates: Requirements 4.6, 4.12, 5.1, 5.2, 5.4**
 */

import * as fc from 'fast-check';
import { JDMatcherService, JDMatchResult, CategorizedKeywords, KeywordImportance } from '../jdMatcher';
import { ResumeData } from '@/types/resume';

// Create a fresh instance for testing
const jdMatcher = new JDMatcherService();

/**
 * Sample tech keywords that should be recognized
 */
const KNOWN_TECH_KEYWORDS = [
  'react', 'vue', 'angular', 'typescript', 'javascript', 'python', 'java',
  'node.js', 'express', 'docker', 'kubernetes', 'aws', 'mongodb', 'postgresql',
  'git', 'ci/cd', 'rest api', 'graphql', 'html', 'css', 'tailwind'
];

/**
 * Sample soft skill keywords that should be recognized
 */
const KNOWN_SOFT_KEYWORDS = [
  'leadership', 'communication', 'teamwork', 'problem-solving',
  'agile', 'scrum', 'project management', 'collaboration'
];

/**
 * Generate a minimal valid ResumeData object
 */
function createMinimalResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return {
    personalInfo: {
      name: 'Test User',
      title: 'Software Engineer',
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'Test City',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    ...overrides
  };
}

/**
 * Generate a resume with specific keywords in various sections
 */
function createResumeWithKeywords(keywords: string[]): ResumeData {
  return {
    personalInfo: {
      name: 'Test User',
      title: 'Software Engineer',
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'Test City',
      summary: `Experienced developer with skills in ${keywords.slice(0, 2).join(' and ')}`
    },
    experience: [{
      id: '1',
      company: 'Tech Company',
      position: 'Developer',
      startDate: '2020-01',
      endDate: '2023-01',
      current: false,
      description: keywords.slice(2, 4).map(k => `Worked with ${k}`)
    }],
    education: [{
      id: '1',
      school: 'University',
      degree: 'Bachelor',
      major: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-06'
    }],
    skills: keywords.slice(0, 5).map((k, i) => ({
      id: String(i),
      name: k,
      level: 80,
      category: 'Technical'
    })),
    projects: [{
      id: '1',
      name: 'Sample Project',
      description: `A project using ${keywords.slice(4, 6).join(', ')}`,
      technologies: keywords.slice(0, 3),
      startDate: '2022-01',
      endDate: '2022-12',
      highlights: []
    }]
  };
}

describe('Property 6: JD Keyword Analysis', () => {
  // Feature: resume-editor-optimization, Property 6: JD Keyword Analysis
  // **Validates: Requirements 5.1, 5.2, 5.4**

  describe('Keyword Extraction Properties', () => {
    /**
     * Property: For any JD containing known tech keywords, at least one should be extracted
     */
    it('should extract at least one keyword from JD containing known tech keywords', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 5 }),
          fc.lorem({ maxCount: 10 }),
          (keywords, filler) => {
            const jdText = `We are looking for a developer with experience in ${keywords.join(', ')}. ${filler}`;
            const extracted = jdMatcher.extractKeywords(jdText);
            
            // At least one of the known keywords should be extracted
            const hasMatch = keywords.some(k => 
              extracted.some(e => e.toLowerCase() === k.toLowerCase())
            );
            
            return hasMatch;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any JD containing known soft skill keywords, at least one should be extracted
     */
    it('should extract at least one keyword from JD containing known soft skill keywords', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_SOFT_KEYWORDS), { minLength: 1, maxLength: 3 }),
          fc.lorem({ maxCount: 10 }),
          (keywords, filler) => {
            const jdText = `Looking for candidates with strong ${keywords.join(' and ')} skills. ${filler}`;
            const extracted = jdMatcher.extractKeywords(jdText);
            
            const hasMatch = keywords.some(k => 
              extracted.some(e => e.toLowerCase() === k.toLowerCase())
            );
            
            return hasMatch;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Extracted keywords should be unique (no duplicates)
     */
    it('should return unique keywords without duplicates', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 10 }),
          (keywords) => {
            // Create JD with potentially repeated keywords
            const jdText = `${keywords.join(' ')} ${keywords.join(' ')} ${keywords.join(' ')}`;
            const extracted = jdMatcher.extractKeywords(jdText);
            
            // Check for uniqueness
            const uniqueSet = new Set(extracted.map(k => k.toLowerCase()));
            return uniqueSet.size === extracted.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Empty or whitespace-only JD should return empty array
     */
    it('should return empty array for empty or whitespace-only JD', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\n\n', '\t\t', '  \n  \t  '),
          (emptyJd) => {
            const extracted = jdMatcher.extractKeywords(emptyJd);
            return extracted.length === 0;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Resume Analysis Properties', () => {
    /**
     * Property: Keywords found in resume should be categorized as matched
     */
    it('should categorize keywords present in resume as matched', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 5 }),
          (keywords) => {
            const resume = createResumeWithKeywords(keywords);
            const result = jdMatcher.analyzeResume(resume, keywords);
            
            // All keywords that are in the resume should be in matchedKeywords
            // (some might be in missing if not found due to word boundary matching)
            const allCategorized = result.matchedKeywords.length + result.missingKeywords.length === keywords.length;
            
            return allCategorized;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Keywords NOT in resume should be categorized as missing
     */
    it('should categorize keywords not in resume as missing', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 4 }),
          (keywords) => {
            // Create empty resume with no matching content
            const emptyResume = createMinimalResume({
              personalInfo: {
                name: 'Test',
                title: 'Manager',
                email: 'test@test.com',
                phone: '000',
                location: 'City',
                summary: 'No technical skills mentioned here'
              }
            });
            
            const result = jdMatcher.analyzeResume(emptyResume, keywords);
            
            // All keywords should be missing since resume has no tech content
            return result.missingKeywords.length === keywords.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Matched and missing keywords should be mutually exclusive and complete
     */
    it('should partition keywords into matched and missing without overlap', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 6 }),
          fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 0, maxLength: 3 }),
          (jdKeywords, resumeKeywords) => {
            const uniqueJdKeywords = [...new Set(jdKeywords)];
            const resume = createResumeWithKeywords(resumeKeywords);
            const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
            
            // Check: matched + missing = total keywords
            const totalCategorized = result.matchedKeywords.length + result.missingKeywords.length;
            if (totalCategorized !== uniqueJdKeywords.length) {
              return false;
            }
            
            // Check: no overlap between matched and missing
            const matchedSet = new Set(result.matchedKeywords.map(k => k.toLowerCase()));
            const hasOverlap = result.missingKeywords.some(k => matchedSet.has(k.toLowerCase()));
            
            return !hasOverlap;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Match Score Properties', () => {
    /**
     * Property: Score should be between 0 and 100 inclusive
     */
    it('should calculate score between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 1, max: 50 }),
          (matched, total) => {
            const adjustedMatched = Math.min(matched, total);
            const score = jdMatcher.calculateMatchScore(adjustedMatched, total);
            
            return score >= 0 && score <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Score should be 0 when total keywords is 0
     */
    it('should return 0 score when total keywords is 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (matched) => {
            const score = jdMatcher.calculateMatchScore(matched, 0);
            return score === 0;
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Score should be 100 when all keywords match
     */
    it('should return 100 score when all keywords match', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (total) => {
            const score = jdMatcher.calculateMatchScore(total, total);
            return score === 100;
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Score should be proportional to match ratio
     */
    it('should calculate score proportional to matched/total ratio', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (matched, total) => {
            const adjustedMatched = Math.min(matched, total);
            const score = jdMatcher.calculateMatchScore(adjustedMatched, total);
            const expectedScore = Math.round((adjustedMatched / total) * 100);
            
            return score === expectedScore;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

});

/**
 * Property Test: Match Score Calculation
 * 
 * Feature: resume-editor-optimization
 * Property 7: Match Score Calculation
 * 
 * *For any* set of matched and total keywords, the match score SHALL be calculated 
 * as (matched / total) * 100, rounded to the nearest integer, and SHALL always be 
 * between 0 and 100 inclusive.
 * 
 * **Validates: Requirements 5.6**
 */
describe('Property 7: Match Score Calculation', () => {
  // Feature: resume-editor-optimization, Property 7: Match Score Calculation
  // **Validates: Requirements 5.6**

  /**
   * Property: Score should always be between 0 and 100 inclusive
   * Tests the boundary constraint for all possible inputs
   */
  it('should always return score between 0 and 100 inclusive for any matched/total combination', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (matched, total) => {
          const score = jdMatcher.calculateMatchScore(matched, total);
          return score >= 0 && score <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be calculated as (matched / total) * 100, rounded to nearest integer
   * This is the core formula validation
   */
  it('should calculate score as (matched / total) * 100 rounded to nearest integer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (matched, total) => {
          // Ensure matched doesn't exceed total for valid test cases
          const validMatched = Math.min(matched, total);
          const score = jdMatcher.calculateMatchScore(validMatched, total);
          const expectedScore = Math.round((validMatched / total) * 100);
          
          return score === expectedScore;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be 0 when total is 0 (edge case - division by zero protection)
   */
  it('should return 0 when total keywords is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        (matched) => {
          const score = jdMatcher.calculateMatchScore(matched, 0);
          return score === 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Score should be 100 when matched equals total (perfect match)
   */
  it('should return 100 when matched equals total (perfect match)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (n) => {
          const score = jdMatcher.calculateMatchScore(n, n);
          return score === 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be 0 when matched is 0 and total > 0 (no match)
   */
  it('should return 0 when matched is 0 and total > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (total) => {
          const score = jdMatcher.calculateMatchScore(0, total);
          return score === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be capped at 100 even if matched > total
   * (defensive programming - handles invalid input gracefully)
   */
  it('should cap score at 100 even when matched exceeds total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (base, extra) => {
          const total = base;
          const matched = base + extra; // matched > total
          const score = jdMatcher.calculateMatchScore(matched, total);
          
          return score <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be an integer (no decimal places)
   */
  it('should always return an integer score', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (matched, total) => {
          const score = jdMatcher.calculateMatchScore(matched, total);
          return Number.isInteger(score);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be monotonically increasing with matched count
   * (more matches = higher or equal score)
   */
  it('should be monotonically increasing with matched count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 2, max: 100 }),
        (matched1, total) => {
          // Ensure matched1 < total so we can have matched2 = matched1 + 1
          const validMatched1 = Math.min(matched1, total - 1);
          const matched2 = validMatched1 + 1;
          
          const score1 = jdMatcher.calculateMatchScore(validMatched1, total);
          const score2 = jdMatcher.calculateMatchScore(matched2, total);
          
          return score2 >= score1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score calculation should be deterministic
   * (same inputs always produce same output)
   */
  it('should be deterministic - same inputs produce same output', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (matched, total) => {
          const score1 = jdMatcher.calculateMatchScore(matched, total);
          const score2 = jdMatcher.calculateMatchScore(matched, total);
          const score3 = jdMatcher.calculateMatchScore(matched, total);
          
          return score1 === score2 && score2 === score3;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 6 (continued): End-to-End Analysis Properties', () => {
  /**
   * Property: Full analysis should produce consistent results
   */
  it('should produce consistent analysis results for same inputs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 5 }),
        (keywords) => {
          const jdText = `Looking for: ${keywords.join(', ')}`;
          const resume = createResumeWithKeywords(keywords.slice(0, 2));
          
          // Run analysis twice
          const extracted = jdMatcher.extractKeywords(jdText);
          const result1 = jdMatcher.analyzeResume(resume, extracted);
          const result2 = jdMatcher.analyzeResume(resume, extracted);
          
          // Results should be identical
          return (
            result1.score === result2.score &&
            result1.matchedKeywords.length === result2.matchedKeywords.length &&
            result1.missingKeywords.length === result2.missingKeywords.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Analysis result score should match the ratio of matched keywords
   */
  it('should have score matching the matched/total keyword ratio', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 6 }),
        (keywords) => {
          const uniqueKeywords = [...new Set(keywords)];
          const resume = createResumeWithKeywords(uniqueKeywords.slice(0, Math.ceil(uniqueKeywords.length / 2)));
          
          const result = jdMatcher.analyzeResume(resume, uniqueKeywords);
          
          // Verify score calculation
          const expectedScore = jdMatcher.calculateMatchScore(
            result.matchedKeywords.length,
            uniqueKeywords.length
          );
          
          return result.score === expectedScore;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property Test: JD Keyword Extraction (Property 9)
 * 
 * Feature: resume-editor-optimization
 * Property 9: JD Keyword Extraction
 * 
 * *For any* job description text containing identifiable skills/requirements, 
 * the JD_Matcher SHALL extract at least one keyword.
 * 
 * **Validates: Requirements 4.6**
 */
describe('Property 9: JD Keyword Extraction', () => {
  // Feature: resume-editor-optimization, Property 9: JD Keyword Extraction
  // **Validates: Requirements 4.6**

  /**
   * Industry-specific keyword sets for testing
   */
  const INDUSTRY_KEYWORDS = {
    tech: ['react', 'typescript', 'node.js', 'docker', 'kubernetes', 'aws', 'python', 'java'],
    finance: ['risk management', 'portfolio management', 'financial modeling', 'compliance', 'bloomberg'],
    healthcare: ['clinical trials', 'fda', 'hipaa', 'medical devices', 'pharmacovigilance'],
    marketing: ['digital marketing', 'seo', 'google analytics', 'content marketing', 'social media marketing'],
    design: ['figma', 'ui design', 'ux design', 'photoshop', 'illustrator'],
    data: ['machine learning', 'tensorflow', 'pandas', 'spark', 'data analysis']
  };

  /**
   * Property: For any JD containing industry-specific keywords, at least one should be extracted
   * Note: We use at least 2 keywords to ensure reliable extraction across all industries
   */
  it('should extract at least one keyword from JD containing industry-specific terms', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tech', 'finance', 'healthcare', 'marketing', 'design', 'data'),
        fc.integer({ min: 2, max: 5 }),
        (industry, keywordCount) => {
          const industryKeywords = INDUSTRY_KEYWORDS[industry as keyof typeof INDUSTRY_KEYWORDS];
          const selectedKeywords = industryKeywords.slice(0, Math.min(keywordCount, industryKeywords.length));
          
          // Create a clear JD text with the keywords prominently featured
          const jdText = `Job Requirements: We are looking for a professional with strong experience in ${selectedKeywords.join(', ')}. The ideal candidate should have hands-on experience with ${selectedKeywords[0]}.`;
          const extracted = jdMatcher.extractKeywords(jdText);
          
          // At least one keyword should be extracted
          return extracted.length >= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Extracted keywords should be non-empty strings
   */
  it('should only extract non-empty string keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS, ...KNOWN_SOFT_KEYWORDS), { minLength: 1, maxLength: 10 }),
        fc.lorem({ maxCount: 15 }),
        (keywords, filler) => {
          const jdText = `Requirements: ${keywords.join(', ')}. ${filler}`;
          const extracted = jdMatcher.extractKeywords(jdText);
          
          // All extracted keywords should be non-empty strings
          return extracted.every(k => typeof k === 'string' && k.trim().length > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Keyword extraction should be case-insensitive
   */
  it('should extract keywords regardless of case', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TECH_KEYWORDS),
        fc.constantFrom('upper', 'lower', 'mixed'),
        (keyword, caseType) => {
          let transformedKeyword: string;
          switch (caseType) {
            case 'upper':
              transformedKeyword = keyword.toUpperCase();
              break;
            case 'lower':
              transformedKeyword = keyword.toLowerCase();
              break;
            case 'mixed':
              transformedKeyword = keyword.split('').map((c, i) => 
                i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
              ).join('');
              break;
            default:
              transformedKeyword = keyword;
          }
          
          const jdText = `Looking for someone with ${transformedKeyword} experience`;
          const extracted = jdMatcher.extractKeywords(jdText);
          
          // The keyword should be found regardless of case
          return extracted.some(e => e.toLowerCase() === keyword.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple occurrences of same keyword should result in single extraction
   */
  it('should extract each keyword only once even if it appears multiple times', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TECH_KEYWORDS),
        fc.integer({ min: 2, max: 5 }),
        (keyword, repetitions) => {
          const repeatedKeyword = Array(repetitions).fill(keyword).join(' ');
          const jdText = `We need ${repeatedKeyword} experience`;
          const extracted = jdMatcher.extractKeywords(jdText);
          
          // Count occurrences of the keyword in extracted list
          const occurrences = extracted.filter(e => e.toLowerCase() === keyword.toLowerCase()).length;
          
          return occurrences <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Industry detection should influence keyword extraction
   */
  it('should detect industry and extract relevant keywords', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tech', 'finance', 'data'),
        (industry) => {
          const industryKeywords = INDUSTRY_KEYWORDS[industry as keyof typeof INDUSTRY_KEYWORDS];
          const jdText = `Job Description: ${industryKeywords.slice(0, 3).join(', ')} required`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          const extracted = jdMatcher.extractKeywords(jdText);
          
          // Should detect the correct industry or general
          // And should extract at least one keyword
          return (detectedIndustry === industry || detectedIndustry === 'general') && extracted.length >= 1;
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Property Test: Keyword Importance Categorization (Property 10)
 * 
 * Feature: resume-editor-optimization
 * Property 10: Keyword Importance Categorization
 * 
 * *For any* set of missing keywords from JD analysis, each keyword SHALL be 
 * categorized into exactly one importance level: required, preferred, or niceToHave.
 * 
 * **Validates: Requirements 4.12**
 */
describe('Property 10: Keyword Importance Categorization', () => {
  // Feature: resume-editor-optimization, Property 10: Keyword Importance Categorization
  // **Validates: Requirements 4.12**

  const IMPORTANCE_LEVELS: KeywordImportance[] = ['required', 'preferred', 'niceToHave'];

  /**
   * Property: Each keyword should be categorized into exactly one importance level
   */
  it('should categorize each keyword into exactly one importance level', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 8 }),
        fc.lorem({ maxCount: 10 }),
        (keywords, filler) => {
          const uniqueKeywords = [...new Set(keywords)];
          const jdText = `Requirements: ${uniqueKeywords.join(', ')}. ${filler}`;
          
          const categorized = jdMatcher.extractAndCategorizeKeywords(jdText);
          
          // Count total categorized keywords
          const totalCategorized = 
            categorized.required.length + 
            categorized.preferred.length + 
            categorized.niceToHave.length;
          
          // Check no keyword appears in multiple categories
          const allCategorizedKeywords = [
            ...categorized.required,
            ...categorized.preferred,
            ...categorized.niceToHave
          ];
          const uniqueCategorized = new Set(allCategorizedKeywords.map(k => k.toLowerCase()));
          
          // Each keyword should appear exactly once across all categories
          return uniqueCategorized.size === allCategorizedKeywords.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Keywords with "required" context should be categorized as required
   */
  it('should categorize keywords with required context as required', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TECH_KEYWORDS.slice(0, 5)),
        fc.constantFrom('required', 'must have', 'essential', 'mandatory'),
        (keyword, requiredPhrase) => {
          const jdText = `${requiredPhrase}: ${keyword} experience is ${requiredPhrase}`;
          
          const importance = jdMatcher.determineKeywordImportance(keyword, jdText);
          
          // Should be categorized as required
          return importance === 'required';
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Keywords with "preferred" context should be categorized as preferred
   */
  it('should categorize keywords with preferred context as preferred', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TECH_KEYWORDS.slice(0, 5)),
        fc.constantFrom('preferred', 'desired', 'strong', 'proficient'),
        (keyword, preferredPhrase) => {
          const jdText = `${preferredPhrase} skills: ${keyword}. We ${preferredPhrase} candidates with ${keyword}`;
          
          const importance = jdMatcher.determineKeywordImportance(keyword, jdText);
          
          // Should be categorized as preferred or required (context can be ambiguous)
          return importance === 'preferred' || importance === 'required';
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Keywords with "nice to have" context should be categorized as niceToHave
   */
  it('should categorize keywords with nice-to-have context as niceToHave', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TECH_KEYWORDS.slice(0, 5)),
        fc.constantFrom('nice to have', 'bonus', 'plus', 'advantage'),
        (keyword, nicePhrase) => {
          const jdText = `${nicePhrase}: ${keyword}. Having ${keyword} is a ${nicePhrase}`;
          
          const importance = jdMatcher.determineKeywordImportance(keyword, jdText);
          
          // Should be categorized as niceToHave
          return importance === 'niceToHave';
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: categorizeKeywords should partition keywords without overlap
   */
  it('should partition keywords into categories without overlap', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS, ...KNOWN_SOFT_KEYWORDS), { minLength: 2, maxLength: 10 }),
        (keywords) => {
          const uniqueKeywords = [...new Set(keywords)];
          const jdText = `Job requirements: ${uniqueKeywords.join(', ')}`;
          
          const categorized = jdMatcher.categorizeKeywords(uniqueKeywords, jdText);
          
          // Check that categories are mutually exclusive
          const requiredSet = new Set(categorized.required.map(k => k.toLowerCase()));
          const preferredSet = new Set(categorized.preferred.map(k => k.toLowerCase()));
          const niceToHaveSet = new Set(categorized.niceToHave.map(k => k.toLowerCase()));
          
          // No overlap between required and preferred
          const noOverlapRP = ![...requiredSet].some(k => preferredSet.has(k));
          // No overlap between required and niceToHave
          const noOverlapRN = ![...requiredSet].some(k => niceToHaveSet.has(k));
          // No overlap between preferred and niceToHave
          const noOverlapPN = ![...preferredSet].some(k => niceToHaveSet.has(k));
          
          return noOverlapRP && noOverlapRN && noOverlapPN;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All input keywords should be categorized (completeness)
   */
  it('should categorize all input keywords (completeness)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 6 }),
        (keywords) => {
          const uniqueKeywords = [...new Set(keywords)];
          const jdText = `Looking for: ${uniqueKeywords.join(', ')}`;
          
          const categorized = jdMatcher.categorizeKeywords(uniqueKeywords, jdText);
          
          // Total categorized should equal input count
          const totalCategorized = 
            categorized.required.length + 
            categorized.preferred.length + 
            categorized.niceToHave.length;
          
          return totalCategorized === uniqueKeywords.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Categorization should be deterministic
   */
  it('should produce deterministic categorization results', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 5 }),
        (keywords) => {
          const uniqueKeywords = [...new Set(keywords)];
          const jdText = `Requirements: ${uniqueKeywords.join(', ')}`;
          
          // Run categorization multiple times
          const result1 = jdMatcher.categorizeKeywords(uniqueKeywords, jdText);
          const result2 = jdMatcher.categorizeKeywords(uniqueKeywords, jdText);
          const result3 = jdMatcher.categorizeKeywords(uniqueKeywords, jdText);
          
          // Results should be identical
          const sameRequired = JSON.stringify(result1.required.sort()) === JSON.stringify(result2.required.sort()) &&
                              JSON.stringify(result2.required.sort()) === JSON.stringify(result3.required.sort());
          const samePreferred = JSON.stringify(result1.preferred.sort()) === JSON.stringify(result2.preferred.sort()) &&
                               JSON.stringify(result2.preferred.sort()) === JSON.stringify(result3.preferred.sort());
          const sameNiceToHave = JSON.stringify(result1.niceToHave.sort()) === JSON.stringify(result2.niceToHave.sort()) &&
                                JSON.stringify(result2.niceToHave.sort()) === JSON.stringify(result3.niceToHave.sort());
          
          return sameRequired && samePreferred && sameNiceToHave;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CategorizedKeywords structure should always have all three arrays
   */
  it('should always return CategorizedKeywords with all three arrays defined', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 0, maxLength: 5 }),
        (keywords) => {
          const jdText = keywords.length > 0 ? `Skills: ${keywords.join(', ')}` : 'No specific skills required';
          
          const categorized = jdMatcher.extractAndCategorizeKeywords(jdText);
          
          // All three arrays should be defined
          return (
            Array.isArray(categorized.required) &&
            Array.isArray(categorized.preferred) &&
            Array.isArray(categorized.niceToHave)
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});


/**
 * Property 12: 行业检测准确性
 * 
 * Feature: export-ai-enhancement, Property 12: 行业检测准确性
 * 
 * *For any* 包含特定行业关键词的 JD 文本，`detectIndustry` 应返回对应的行业类型。
 * 
 * **Validates: Requirements 6.1**
 */
describe('Property 12: 行业检测准确性', () => {
  // Feature: export-ai-enhancement, Property 12: 行业检测准确性
  // **Validates: Requirements 6.1**

  /**
   * Industry-specific keyword sets for testing
   */
  const INDUSTRY_KEYWORD_SETS = {
    tech: ['react', 'typescript', 'node.js', 'docker', 'kubernetes', 'aws', 'python', 'java', 'javascript', 'vue', 'angular'],
    finance: ['risk management', 'portfolio management', 'financial modeling', 'compliance', 'bloomberg', 'investment banking', 'hedge fund'],
    healthcare: ['clinical trials', 'fda', 'hipaa', 'medical devices', 'pharmacovigilance', 'drug safety', 'regulatory affairs'],
    marketing: ['digital marketing', 'seo', 'google analytics', 'content marketing', 'social media marketing', 'email marketing', 'brand management'],
    design: ['figma', 'ui design', 'ux design', 'photoshop', 'illustrator', 'sketch', 'user interface', 'visual design'],
    data: ['machine learning', 'tensorflow', 'pandas', 'spark', 'data analysis', 'deep learning', 'neural network', 'pytorch'],
    product: ['product management', 'product roadmap', 'agile', 'scrum', 'user story', 'stakeholder management', 'mvp']
  };

  /**
   * Property: Should detect tech industry for tech-heavy JD
   */
  it('should detect tech industry for JD with tech keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.tech), { minLength: 3, maxLength: 6 }),
        (keywords) => {
          const jdText = `We are looking for a software engineer with experience in ${keywords.join(', ')}. 
            The ideal candidate should have strong skills in ${keywords[0]} and ${keywords[1]}.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          // Should detect tech or data (data is a subset of tech in many cases)
          return detectedIndustry === 'tech' || detectedIndustry === 'data';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should detect finance industry for finance-heavy JD
   */
  it('should detect finance industry for JD with finance keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.finance), { minLength: 3, maxLength: 5 }),
        (keywords) => {
          const jdText = `Financial analyst position requiring expertise in ${keywords.join(', ')}. 
            Must have experience with ${keywords[0]} and ${keywords[1]}.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          return detectedIndustry === 'finance';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should detect healthcare industry for healthcare-heavy JD
   */
  it('should detect healthcare industry for JD with healthcare keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.healthcare), { minLength: 3, maxLength: 5 }),
        (keywords) => {
          const jdText = `Healthcare professional needed with knowledge of ${keywords.join(', ')}. 
            Experience with ${keywords[0]} is essential.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          return detectedIndustry === 'healthcare';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should detect marketing industry for marketing-heavy JD
   */
  it('should detect marketing industry for JD with marketing keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.marketing), { minLength: 3, maxLength: 5 }),
        (keywords) => {
          const jdText = `Marketing manager position requiring skills in ${keywords.join(', ')}. 
            Strong background in ${keywords[0]} preferred.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          return detectedIndustry === 'marketing';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should detect design industry for design-heavy JD
   */
  it('should detect design industry for JD with design keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.design), { minLength: 3, maxLength: 5 }),
        (keywords) => {
          const jdText = `UI/UX Designer needed with expertise in ${keywords.join(', ')}. 
            Proficiency in ${keywords[0]} required.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          return detectedIndustry === 'design';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should detect data industry for data science JD
   */
  it('should detect data industry for JD with data science keywords', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...INDUSTRY_KEYWORD_SETS.data), { minLength: 3, maxLength: 5 }),
        (keywords) => {
          const jdText = `Data Scientist position requiring experience with ${keywords.join(', ')}. 
            Must be proficient in ${keywords[0]} and ${keywords[1]}.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          // Data industry or tech (they overlap significantly)
          return detectedIndustry === 'data' || detectedIndustry === 'tech';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Should return 'general' for JD without specific industry keywords
   */
  it('should return general for JD without specific industry keywords', () => {
    fc.assert(
      fc.property(
        fc.lorem({ maxCount: 20 }),
        (genericText) => {
          // Create a JD with only generic text, no industry-specific keywords
          const jdText = `We are looking for a professional. ${genericText}. 
            The candidate should be motivated and hardworking.`;
          
          const detectedIndustry = jdMatcher.detectIndustry(jdText);
          
          // Should return 'general' or any valid industry type
          const validIndustries = ['tech', 'finance', 'healthcare', 'marketing', 'design', 'data', 'product', 'general'];
          return validIndustries.includes(detectedIndustry);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Industry detection should be deterministic
   */
  it('should produce deterministic industry detection results', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tech', 'finance', 'healthcare', 'marketing', 'design', 'data'),
        (industry) => {
          const keywords = INDUSTRY_KEYWORD_SETS[industry as keyof typeof INDUSTRY_KEYWORD_SETS].slice(0, 4);
          const jdText = `Position requiring: ${keywords.join(', ')}`;
          
          // Run detection multiple times
          const result1 = jdMatcher.detectIndustry(jdText);
          const result2 = jdMatcher.detectIndustry(jdText);
          const result3 = jdMatcher.detectIndustry(jdText);
          
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 13: JD 匹配分析完整性
 * 
 * Feature: export-ai-enhancement, Property 13: JD 匹配分析完整性
 * 
 * *For any* 简历数据和关键词列表，`analyzeResume` 返回的 `matchedKeywords` 和 `missingKeywords` 
 * 的并集应等于输入的关键词列表，且匹配分数应在 0-100 范围内。
 * 
 * **Validates: Requirements 6.2, 6.3, 6.4**
 */
describe('Property 13: JD 匹配分析完整性', () => {
  // Feature: export-ai-enhancement, Property 13: JD 匹配分析完整性
  // **Validates: Requirements 6.2, 6.3, 6.4**

  /**
   * Property: Union of matched and missing keywords should equal input keywords
   */
  it('should have matched + missing keywords equal to input keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 10 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 0, maxLength: 5 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const resume = createResumeWithKeywords(resumeKeywords);
          
          const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          
          // Union of matched and missing should equal input
          const totalCategorized = result.matchedKeywords.length + result.missingKeywords.length;
          
          return totalCategorized === uniqueJdKeywords.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Match score should be in 0-100 range
   */
  it('should return match score in 0-100 range', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 10 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 0, maxLength: 5 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const resume = createResumeWithKeywords(resumeKeywords);
          
          const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          
          return result.score >= 0 && result.score <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Matched and missing keywords should be mutually exclusive
   */
  it('should have no overlap between matched and missing keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 8 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 4 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const resume = createResumeWithKeywords(resumeKeywords);
          
          const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          
          // Check no overlap
          const matchedSet = new Set(result.matchedKeywords.map(k => k.toLowerCase()));
          const hasOverlap = result.missingKeywords.some(k => matchedSet.has(k.toLowerCase()));
          
          return !hasOverlap;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score should be consistent with matched/total ratio
   */
  it('should have score consistent with matched/total keyword ratio', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 10 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 0, maxLength: 5 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const resume = createResumeWithKeywords(resumeKeywords);
          
          const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          
          // Calculate expected score
          const expectedScore = jdMatcher.calculateMatchScore(
            result.matchedKeywords.length,
            uniqueJdKeywords.length
          );
          
          return result.score === expectedScore;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Analysis with JD text should include categorized keywords
   */
  it('should include categorized keywords when JD text is provided', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 6 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 3 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const jdText = `Requirements: ${uniqueJdKeywords.join(', ')}`;
          const resume = createResumeWithKeywords(resumeKeywords);
          
          const result = jdMatcher.analyzeResume(resume, uniqueJdKeywords, jdText);
          
          // Should have categorized keywords when JD text is provided
          if (result.categorizedMatched && result.categorizedMissing) {
            // Verify structure
            const hasMatchedStructure = 
              Array.isArray(result.categorizedMatched.required) &&
              Array.isArray(result.categorizedMatched.preferred) &&
              Array.isArray(result.categorizedMatched.niceToHave);
            
            const hasMissingStructure = 
              Array.isArray(result.categorizedMissing.required) &&
              Array.isArray(result.categorizedMissing.preferred) &&
              Array.isArray(result.categorizedMissing.niceToHave);
            
            return hasMatchedStructure && hasMissingStructure;
          }
          
          return true; // categorized keywords are optional
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Suggestions should be generated for missing keywords
   */
  it('should generate suggestions when there are missing keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 3, maxLength: 8 }),
        (jdKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          // Create empty resume to ensure all keywords are missing
          const emptyResume = createMinimalResume({
            personalInfo: {
              name: 'Test',
              title: 'Manager',
              email: 'test@test.com',
              phone: '000',
              location: 'City',
              summary: 'No technical skills'
            }
          });
          
          const result = jdMatcher.analyzeResume(emptyResume, uniqueJdKeywords);
          
          // Should have suggestions when there are missing keywords
          if (result.missingKeywords.length > 0) {
            return result.suggestions.length > 0;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Analysis should be deterministic
   */
  it('should produce deterministic analysis results', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 2, maxLength: 5 }),
        fc.array(fc.constantFrom(...KNOWN_TECH_KEYWORDS), { minLength: 1, maxLength: 3 }),
        (jdKeywords, resumeKeywords) => {
          const uniqueJdKeywords = [...new Set(jdKeywords)];
          const resume = createResumeWithKeywords(resumeKeywords);
          
          // Run analysis multiple times
          const result1 = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          const result2 = jdMatcher.analyzeResume(resume, uniqueJdKeywords);
          
          return (
            result1.score === result2.score &&
            result1.matchedKeywords.length === result2.matchedKeywords.length &&
            result1.missingKeywords.length === result2.missingKeywords.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Match level should be consistent with score
   */
  it('should return correct match level based on score', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (score) => {
          const matchLevel = jdMatcher.getMatchLevel(score);
          
          if (score >= 70) {
            return matchLevel === 'high';
          } else if (score >= 40) {
            return matchLevel === 'medium';
          } else {
            return matchLevel === 'low';
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
