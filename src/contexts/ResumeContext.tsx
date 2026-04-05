/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

/**
 * ResumeContext - 简历数据上下文
 * 提供简历数据的全局状态管理和操作方法
 * 集成本地存储功能，自动保存和恢复数据
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { ResumeData, Experience, Education, Skill, Project } from '@/types/resume'
import { useLocalStorage, useAutoSave } from '@/hooks/useLocalStorage'

// 默认简历数据
const defaultResumeData: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    contactQRCode: '',
    summary: '',
    avatar: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: []
}

// 上下文类型定义
interface ResumeContextType {
  resumeData: ResumeData
  updatePersonalInfo: (field: keyof ResumeData['personalInfo'], value: string) => void
  addExperience: () => void
  updateExperience: <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => void
  removeExperience: (id: string) => void
  addEducation: () => void
  updateEducation: <K extends keyof Education>(id: string, field: K, value: Education[K]) => void
  removeEducation: (id: string) => void
  addSkill: () => void
  updateSkill: <K extends keyof Skill>(id: string, field: K, value: Skill[K]) => void
  removeSkill: (id: string) => void
  addProject: () => void
  updateProject: <K extends keyof Project>(id: string, field: K, value: Project[K]) => void
  removeProject: (id: string) => void
  setResumeData: (data: ResumeData) => void
  // 本地存储相关
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  clearData: () => void
}

// 创建上下文
const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

// 生成唯一ID的工具函数
const generateId = () => Math.random().toString(36).substr(2, 9)

/**
 * 更新列表项字段
 * 统一处理 experience/education/skills/projects 的字段更新，避免重复逻辑。
 */
function updateListItem<T extends { id: string }, K extends keyof T>(
  list: T[],
  id: string,
  field: K,
  value: T[K]
): T[] {
  return list.map((item) => (item.id === id ? { ...item, [field]: value } : item))
}

// 上下文提供者组件
export function ResumeProvider({ children }: { children: ReactNode }) {
  // 使用本地存储Hook
  const [resumeData, setResumeData, isLoading] = useLocalStorage<ResumeData>('resume-data', defaultResumeData)
  
  // 自动保存功能
  const { isSaving, lastSaved } = useAutoSave('resume-data', resumeData, 2000)

  // 清除数据
  const clearData = () => {
    setResumeData(defaultResumeData)
  }

  // 更新个人信息
  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  // 添加工作经历
  const addExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: []
    }
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  // 更新工作经历
  const updateExperience = <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => {
    setResumeData(prev => ({
      ...prev,
      experience: updateListItem(prev.experience, id, field, value)
    }))
  }

  // 删除工作经历
  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  // 添加教育经历
  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      gpa: ''
    }
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  // 更新教育经历
  const updateEducation = <K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    setResumeData(prev => ({
      ...prev,
      education: updateListItem(prev.education, id, field, value)
    }))
  }

  // 删除教育经历
  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  // 添加技能
  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId(),
      name: '',
      level: 70,
      category: 'technical'
    }
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  // 更新技能
  const updateSkill = <K extends keyof Skill>(id: string, field: K, value: Skill[K]) => {
    setResumeData(prev => ({
      ...prev,
      skills: updateListItem(prev.skills, id, field, value)
    }))
  }

  // 删除技能
  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }))
  }

  // 添加项目
  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      highlights: []
    }
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  // 更新项目
  const updateProject = <K extends keyof Project>(id: string, field: K, value: Project[K]) => {
    setResumeData(prev => ({
      ...prev,
      projects: updateListItem(prev.projects, id, field, value)
    }))
  }

  // 删除项目
  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }))
  }

  const value: ResumeContextType = {
    resumeData,
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    setResumeData,
    // 本地存储相关
    isLoading,
    isSaving,
    lastSaved,
    clearData
  }

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}

// 自定义Hook用于使用简历上下文
export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}
