/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description Property Tests for Career Template Data
 * 
 * Feature: template-export-optimization
 * 
 * Property 1: 职业模板数据获取一致性
 * *对于任意* 有效的职业模板 ID（career-ui-designer、career-frontend-developer、
 * career-backend-developer、career-operations、career-product-manager），
 * 调用 `getCareerTemplateData(templateId)` 应返回一个包含完整 personalInfo、
 * experience、education、skills 和 projects 字段的有效 ResumeData 对象。
 * 
 * **Validates: Requirements 1.3**
 */

import * as fc from 'fast-check';
import {
  getCareerTemplateData,
  isCareerTemplate,
  CareerTemplateId,
  careerTemplateDataMap
} from '../careerTemplates';
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project } from '../../types/resume';

/**
 * Valid career template IDs
 */
const VALID_CAREER_TEMPLATE_IDS: CareerTemplateId[] = [
  'career-ui-designer',
  'career-frontend-developer',
  'career-backend-developer',
  'career-operations',
  'career-product-manager'
];

/**
 * Property 1: 职业模板数据获取一致性
 * Feature: template-export-optimization, Property 1: 职业模板数据获取一致性
 * **Validates: Requirements 1.3**
 */
describe('Feature: template-export-optimization, Property 1: 职业模板数据获取一致性', () => {
  
  /**
   * Helper function to validate PersonalInfo structure
   */
  function isValidPersonalInfo(info: PersonalInfo): boolean {
    return (
      typeof info.name === 'string' && info.name.length > 0 &&
      typeof info.title === 'string' && info.title.length > 0 &&
      typeof info.email === 'string' && info.email.length > 0 &&
      typeof info.phone === 'string' && info.phone.length > 0 &&
      typeof info.location === 'string' && info.location.length > 0 &&
      typeof info.summary === 'string' && info.summary.length > 0 &&
      (info.website === undefined || typeof info.website === 'string') &&
      (info.avatar === undefined || typeof info.avatar === 'string')
    );
  }

  /**
   * Helper function to validate Experience structure
   */
  function isValidExperience(exp: Experience): boolean {
    return (
      typeof exp.id === 'string' && exp.id.length > 0 &&
      typeof exp.company === 'string' && exp.company.length > 0 &&
      typeof exp.position === 'string' && exp.position.length > 0 &&
      typeof exp.startDate === 'string' && exp.startDate.length > 0 &&
      typeof exp.endDate === 'string' && exp.endDate.length > 0 &&
      typeof exp.current === 'boolean' &&
      Array.isArray(exp.description) && exp.description.length > 0 &&
      exp.description.every(d => typeof d === 'string') &&
      (exp.location === undefined || typeof exp.location === 'string')
    );
  }

  /**
   * Helper function to validate Education structure
   */
  function isValidEducation(edu: Education): boolean {
    return (
      typeof edu.id === 'string' && edu.id.length > 0 &&
      typeof edu.school === 'string' && edu.school.length > 0 &&
      typeof edu.degree === 'string' && edu.degree.length > 0 &&
      typeof edu.major === 'string' && edu.major.length > 0 &&
      typeof edu.startDate === 'string' && edu.startDate.length > 0 &&
      typeof edu.endDate === 'string' && edu.endDate.length > 0 &&
      (edu.gpa === undefined || typeof edu.gpa === 'string') &&
      (edu.description === undefined || typeof edu.description === 'string')
    );
  }

  /**
   * Helper function to validate Skill structure
   */
  function isValidSkill(skill: Skill): boolean {
    return (
      typeof skill.id === 'string' && skill.id.length > 0 &&
      typeof skill.name === 'string' && skill.name.length > 0 &&
      typeof skill.level === 'number' && skill.level >= 0 && skill.level <= 100 &&
      (skill.category === undefined || typeof skill.category === 'string') &&
      (skill.color === undefined || typeof skill.color === 'string')
    );
  }

  /**
   * Helper function to validate Project structure
   */
  function isValidProject(project: Project): boolean {
    return (
      typeof project.id === 'string' && project.id.length > 0 &&
      typeof project.name === 'string' && project.name.length > 0 &&
      typeof project.description === 'string' && project.description.length > 0 &&
      Array.isArray(project.technologies) &&
      project.technologies.every(t => typeof t === 'string') &&
      (project.startDate === undefined || typeof project.startDate === 'string') &&
      (project.endDate === undefined || typeof project.endDate === 'string') &&
      (project.url === undefined || typeof project.url === 'string') &&
      (project.highlights === undefined || 
        (Array.isArray(project.highlights) && project.highlights.every(h => typeof h === 'string')))
    );
  }

  /**
   * Helper function to validate complete ResumeData structure
   */
  function isValidResumeData(data: ResumeData): boolean {
    return (
      data !== null &&
      typeof data === 'object' &&
      'personalInfo' in data && isValidPersonalInfo(data.personalInfo) &&
      'experience' in data && Array.isArray(data.experience) && data.experience.length > 0 &&
      data.experience.every(isValidExperience) &&
      'education' in data && Array.isArray(data.education) && data.education.length > 0 &&
      data.education.every(isValidEducation) &&
      'skills' in data && Array.isArray(data.skills) && data.skills.length > 0 &&
      data.skills.every(isValidSkill) &&
      'projects' in data && Array.isArray(data.projects) && data.projects.length > 0 &&
      data.projects.every(isValidProject)
    );
  }

  it('should return valid ResumeData for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          // Property: result should not be null for valid IDs
          if (result === null) return false;
          
          // Property: result should be a valid ResumeData object
          return isValidResumeData(result);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ResumeData with complete personalInfo for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: personalInfo should have all required fields
          const info = result.personalInfo;
          return (
            typeof info.name === 'string' && info.name.length > 0 &&
            typeof info.title === 'string' && info.title.length > 0 &&
            typeof info.email === 'string' && info.email.length > 0 &&
            typeof info.phone === 'string' && info.phone.length > 0 &&
            typeof info.location === 'string' && info.location.length > 0 &&
            typeof info.summary === 'string' && info.summary.length > 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ResumeData with non-empty experience array for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: experience should be a non-empty array with valid entries
          return (
            Array.isArray(result.experience) &&
            result.experience.length > 0 &&
            result.experience.every(isValidExperience)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ResumeData with non-empty education array for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: education should be a non-empty array with valid entries
          return (
            Array.isArray(result.education) &&
            result.education.length > 0 &&
            result.education.every(isValidEducation)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ResumeData with non-empty skills array for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: skills should be a non-empty array with valid entries
          return (
            Array.isArray(result.skills) &&
            result.skills.length > 0 &&
            result.skills.every(isValidSkill)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ResumeData with non-empty projects array for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: projects should be a non-empty array with valid entries
          return (
            Array.isArray(result.projects) &&
            result.projects.length > 0 &&
            result.projects.every(isValidProject)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isCareerTemplate should return true for all valid career template IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          // Property: isCareerTemplate should return true for valid IDs
          return isCareerTemplate(templateId) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isCareerTemplate should return false for invalid template IDs', () => {
    // Generator for invalid template IDs
    // Exclude Object prototype properties like 'constructor', 'toString', etc.
    const objectPrototypeProps = Object.getOwnPropertyNames(Object.prototype);
    const invalidIdArbitrary = fc.string({ minLength: 1, maxLength: 50 })
      .filter(id => 
        !VALID_CAREER_TEMPLATE_IDS.includes(id as CareerTemplateId) &&
        !objectPrototypeProps.includes(id)
      );

    fc.assert(
      fc.property(
        invalidIdArbitrary,
        (invalidId) => {
          // Property: isCareerTemplate should return false for invalid IDs
          return isCareerTemplate(invalidId) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getCareerTemplateData should return null for invalid template IDs', () => {
    // Generator for invalid template IDs
    // Exclude Object prototype properties like 'constructor', 'toString', etc.
    const objectPrototypeProps = Object.getOwnPropertyNames(Object.prototype);
    const invalidIdArbitrary = fc.string({ minLength: 1, maxLength: 50 })
      .filter(id => 
        !VALID_CAREER_TEMPLATE_IDS.includes(id as CareerTemplateId) &&
        !objectPrototypeProps.includes(id)
      );

    fc.assert(
      fc.property(
        invalidIdArbitrary,
        (invalidId) => {
          // Property: getCareerTemplateData should return null for invalid IDs
          return getCareerTemplateData(invalidId) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('careerTemplateDataMap should contain exactly 5 career templates', () => {
    const templateIds = Object.keys(careerTemplateDataMap);
    expect(templateIds.length).toBe(5);
    expect(templateIds.sort()).toEqual(VALID_CAREER_TEMPLATE_IDS.sort());
  });

  it('each career template should have unique IDs for experience, education, skills, and projects', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Check unique IDs in experience
          const expIds = result.experience.map(e => e.id);
          const uniqueExpIds = new Set(expIds);
          if (uniqueExpIds.size !== expIds.length) return false;
          
          // Check unique IDs in education
          const eduIds = result.education.map(e => e.id);
          const uniqueEduIds = new Set(eduIds);
          if (uniqueEduIds.size !== eduIds.length) return false;
          
          // Check unique IDs in skills
          const skillIds = result.skills.map(s => s.id);
          const uniqueSkillIds = new Set(skillIds);
          if (uniqueSkillIds.size !== skillIds.length) return false;
          
          // Check unique IDs in projects
          const projectIds = result.projects.map(p => p.id);
          const uniqueProjectIds = new Set(projectIds);
          if (uniqueProjectIds.size !== projectIds.length) return false;
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('skill levels should be within valid range (0-100) for all career templates', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_CAREER_TEMPLATE_IDS),
        (templateId) => {
          const result = getCareerTemplateData(templateId);
          
          if (result === null) return false;
          
          // Property: all skill levels should be between 0 and 100
          return result.skills.every(skill => 
            skill.level >= 0 && skill.level <= 100
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
