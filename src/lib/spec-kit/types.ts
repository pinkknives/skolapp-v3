// Spec Kit API Types and Interfaces
export interface SpecKitConfig {
  apiKey: string
  baseUrl: string
  version: string
}

export interface LearningStandard {
  id: string
  code: string
  title: string
  description: string
  gradeLevel: string[]
  subject: string
  category: string
}

export interface CurriculumPlan {
  id: string
  title: string
  description: string
  gradeLevel: string
  subject: string
  standards: LearningStandard[]
  objectives: LearningObjective[]
  status: 'draft' | 'active' | 'completed' | 'archived'
  progress: number
  startDate: string
  endDate: string
  createdBy: string
  updatedAt: string
}

export interface LearningObjective {
  id: string
  title: string
  description: string
  standardId: string
  measurable: boolean
  assessmentCriteria: string[]
  skills: string[]
}

export interface Assignment {
  id: string
  title: string
  description: string
  type: 'homework' | 'quiz' | 'test' | 'project' | 'discussion'
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'overdue'
  dueDate: string
  estimatedDuration: number // in minutes
  instructions: string
  resources: AssignmentResource[]
  rubric?: Rubric
  assignedTo: string[]
  createdBy: string
  planId?: string
  objectives: string[] // objective IDs
}

export interface AssignmentResource {
  id: string
  type: 'document' | 'video' | 'website' | 'image' | 'audio'
  title: string
  url: string
  description?: string
}

export interface Rubric {
  id: string
  title: string
  criteria: RubricCriteria[]
  maxPoints: number
}

export interface RubricCriteria {
  id: string
  name: string
  description: string
  levels: RubricLevel[]
}

export interface RubricLevel {
  id: string
  name: string
  description: string
  points: number
}

export interface StudentProgress {
  studentId: string
  planId: string
  objectiveId: string
  completionRate: number
  lastActivity: string
  mastery: 'not-started' | 'developing' | 'proficient' | 'advanced'
}

export interface SpecKitResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: string
}

export interface SpecKitListResponse<T> extends SpecKitResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API Error types
export class SpecKitError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
    this.name = 'SpecKitError'
  }
}

export interface SpecKitRequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
}

// Filters for API requests
export interface PlanFilters {
  gradeLevel?: string
  subject?: string
  status?: CurriculumPlan['status']
  createdBy?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface AssignmentFilters {
  type?: Assignment['type']
  status?: Assignment['status']
  priority?: Assignment['priority']
  assignedTo?: string
  planId?: string
  dueDate?: {
    start: string
    end: string
  }
}