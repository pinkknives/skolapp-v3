// Main entry point for Spec Kit integration
export * from './types'
export * from './client'
export * from './hooks'
export * from './mock-data'
export * from './mock-client'
export * from './config'

// Version and metadata
export const SPEC_KIT_VERSION = '1.0.0'
export const SPEC_KIT_API_VERSION = 'v1'

// Re-export commonly used types for convenience
export type {
  CurriculumPlan,
  Assignment,
  LearningStandard,
  StudentProgress,
  PlanFilters,
  AssignmentFilters,
} from './types'