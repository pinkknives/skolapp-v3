import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { getSpecKitClient } from './client'
import {
  CurriculumPlan,
  Assignment,
  LearningStandard,
  StudentProgress,
  PlanFilters,
  AssignmentFilters,
  SpecKitError,
} from './types'

// Custom hook for plans
export function usePlans(filters?: PlanFilters) {
  const { data, error, mutate, isLoading } = useSWR(
    ['plans', filters],
    async () => {
      const client = getSpecKitClient()
      const response = await client.getPlans(filters)
      return response
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    plans: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for single plan
export function usePlan(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? ['plan', id] : null,
    async () => {
      if (!id) return null
      const client = getSpecKitClient()
      const response = await client.getPlan(id)
      return response.data
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    plan: data,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for assignments
export function useAssignments(filters?: AssignmentFilters) {
  const { data, error, mutate, isLoading } = useSWR(
    ['assignments', filters],
    async () => {
      const client = getSpecKitClient()
      const response = await client.getAssignments(filters)
      return response
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    assignments: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for single assignment
export function useAssignment(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? ['assignment', id] : null,
    async () => {
      if (!id) return null
      const client = getSpecKitClient()
      const response = await client.getAssignment(id)
      return response.data
    }
  )

  return {
    assignment: data,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for learning standards
export function useStandards(filters?: { gradeLevel?: string; subject?: string }) {
  const { data, error, mutate, isLoading } = useSWR(
    ['standards', filters],
    async () => {
      const client = getSpecKitClient()
      const response = await client.getStandards(filters)
      return response
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes - standards don't change often
    }
  )

  return {
    standards: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for student progress
export function useStudentProgress(studentId: string | null, planId?: string) {
  const { data, error, mutate, isLoading } = useSWR(
    studentId ? ['student-progress', studentId, planId] : null,
    async () => {
      if (!studentId) return null
      const client = getSpecKitClient()
      const response = await client.getStudentProgress(studentId, planId)
      return response
    }
  )

  return {
    progress: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Custom hook for plan analytics
export function usePlanAnalytics(planId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    planId ? ['plan-analytics', planId] : null,
    async () => {
      if (!planId) return null
      const client = getSpecKitClient()
      const response = await client.getPlanAnalytics(planId)
      return response.data
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    analytics: data,
    isLoading,
    error: error as SpecKitError | undefined,
    refresh: mutate,
  }
}

// Mutation hooks for creating/updating/deleting

// Hook for plan mutations
export function usePlanMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<SpecKitError | null>(null)

  const createPlan = useCallback(async (plan: Partial<CurriculumPlan>) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      const response = await client.createPlan(plan)
      return response.data
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePlan = useCallback(async (id: string, updates: Partial<CurriculumPlan>) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      const response = await client.updatePlan(id, updates)
      return response.data
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deletePlan = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      await client.deletePlan(id)
      return true
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createPlan,
    updatePlan,
    deletePlan,
    isLoading,
    error,
  }
}

// Hook for assignment mutations
export function useAssignmentMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<SpecKitError | null>(null)

  const createAssignment = useCallback(async (assignment: Partial<Assignment>) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      const response = await client.createAssignment(assignment)
      return response.data
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAssignment = useCallback(async (id: string, updates: Partial<Assignment>) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      const response = await client.updateAssignment(id, updates)
      return response.data
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteAssignment = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const client = getSpecKitClient()
      await client.deleteAssignment(id)
      return true
    } catch (err) {
      setError(err as SpecKitError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    isLoading,
    error,
  }
}

// Hook for connection status
export function useSpecKitConnection() {
  const { data, error, mutate } = useSWR(
    'spec-kit-health',
    async () => {
      const client = getSpecKitClient()
      const response = await client.healthCheck()
      return response.data
    },
    {
      refreshInterval: 30000, // Check every 30 seconds
      revalidateOnFocus: false,
    }
  )

  return {
    isConnected: !!data && !error,
    status: data?.status,
    version: data?.version,
    error: error as SpecKitError | undefined,
    checkConnection: mutate,
  }
}