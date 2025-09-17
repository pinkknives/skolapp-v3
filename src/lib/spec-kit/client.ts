import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import {
  SpecKitConfig,
  SpecKitResponse,
  SpecKitListResponse,
  SpecKitError,
  SpecKitRequestOptions,
  CurriculumPlan,
  Assignment,
  LearningStandard,
  StudentProgress,
  PlanFilters,
  AssignmentFilters,
} from './types'
import { SPEC_KIT_CONFIG, shouldUseMockData } from './config'
import { MockSpecKitClient } from './mock-client'

export class SpecKitClient {
  private client: AxiosInstance
  private config: SpecKitConfig

  constructor(config: SpecKitConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Version': config.version,
      },
      timeout: 10000,
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new SpecKitError(
            error.response.data?.message || 'API Error',
            error.response.status,
            error.response.data?.code || 'UNKNOWN_ERROR'
          )
        }
        throw new SpecKitError(
          'Network Error',
          0,
          'NETWORK_ERROR'
        )
      }
    )
  }

  // Plans API
  async getPlans(
    filters?: PlanFilters,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<CurriculumPlan>> {
    const config: AxiosRequestConfig = {
      params: filters,
      ...this.buildRequestConfig(options),
    }

    const response = await this.client.get<SpecKitListResponse<CurriculumPlan>>(
      '/plans',
      config
    )
    return response.data
  }

  async getPlan(
    id: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<CurriculumPlan>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.get<SpecKitResponse<CurriculumPlan>>(
      `/plans/${id}`,
      config
    )
    return response.data
  }

  async createPlan(
    plan: Partial<CurriculumPlan>,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<CurriculumPlan>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.post<SpecKitResponse<CurriculumPlan>>(
      '/plans',
      plan,
      config
    )
    return response.data
  }

  async updatePlan(
    id: string,
    updates: Partial<CurriculumPlan>,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<CurriculumPlan>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.put<SpecKitResponse<CurriculumPlan>>(
      `/plans/${id}`,
      updates,
      config
    )
    return response.data
  }

  async deletePlan(
    id: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<void>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.delete<SpecKitResponse<void>>(
      `/plans/${id}`,
      config
    )
    return response.data
  }

  // Assignments API
  async getAssignments(
    filters?: AssignmentFilters,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<Assignment>> {
    const config: AxiosRequestConfig = {
      params: filters,
      ...this.buildRequestConfig(options),
    }

    const response = await this.client.get<SpecKitListResponse<Assignment>>(
      '/assignments',
      config
    )
    return response.data
  }

  async getAssignment(
    id: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<Assignment>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.get<SpecKitResponse<Assignment>>(
      `/assignments/${id}`,
      config
    )
    return response.data
  }

  async createAssignment(
    assignment: Partial<Assignment>,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<Assignment>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.post<SpecKitResponse<Assignment>>(
      '/assignments',
      assignment,
      config
    )
    return response.data
  }

  async updateAssignment(
    id: string,
    updates: Partial<Assignment>,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<Assignment>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.put<SpecKitResponse<Assignment>>(
      `/assignments/${id}`,
      updates,
      config
    )
    return response.data
  }

  async deleteAssignment(
    id: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<void>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.delete<SpecKitResponse<void>>(
      `/assignments/${id}`,
      config
    )
    return response.data
  }

  // Standards API
  async getStandards(
    filters?: { gradeLevel?: string; subject?: string },
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<LearningStandard>> {
    const config: AxiosRequestConfig = {
      params: filters,
      ...this.buildRequestConfig(options),
    }

    const response = await this.client.get<SpecKitListResponse<LearningStandard>>(
      '/standards',
      config
    )
    return response.data
  }

  // Progress API
  async getStudentProgress(
    studentId: string,
    planId?: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<StudentProgress>> {
    const config: AxiosRequestConfig = {
      params: planId ? { planId } : {},
      ...this.buildRequestConfig(options),
    }

    const response = await this.client.get<SpecKitListResponse<StudentProgress>>(
      `/students/${studentId}/progress`,
      config
    )
    return response.data
  }

  // Analytics API
  async getPlanAnalytics(
    planId: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitResponse<{
    completionRate: number
    averageScore: number
    studentEngagement: number
    timeSpent: number
    objectives: Array<{
      id: string
      title: string
      masteryRate: number
    }>
  }>> {
    const config = this.buildRequestConfig(options)
    const response = await this.client.get(
      `/plans/${planId}/analytics`,
      config
    )
    return response.data
  }

  // Utility methods
  private buildRequestConfig(options?: SpecKitRequestOptions): AxiosRequestConfig {
    return {
      timeout: options?.timeout || 10000,
      // Add retry logic if needed
      // Add cache headers if needed
    }
  }

  // Health check
  async healthCheck(): Promise<SpecKitResponse<{ status: string; version: string }>> {
    const response = await this.client.get<SpecKitResponse<{ status: string; version: string }>>(
      '/health'
    )
    return response.data
  }
}

// Singleton instance
let specKitClient: SpecKitClient | MockSpecKitClient | null = null

export const getSpecKitClient = (): SpecKitClient | MockSpecKitClient => {
  if (!specKitClient) {
    if (shouldUseMockData()) {
      console.info('🔧 Spec Kit: Using mock data for development/demo')
      specKitClient = new MockSpecKitClient()
    } else {
      const config: SpecKitConfig = {
        apiKey: SPEC_KIT_CONFIG.apiKey,
        baseUrl: SPEC_KIT_CONFIG.baseUrl,
        version: SPEC_KIT_CONFIG.version,
      }
      specKitClient = new SpecKitClient(config)
    }
  }
  return specKitClient
}

// For testing/demo purposes, create a mock client
export const createMockSpecKitClient = (): MockSpecKitClient => {
  return new MockSpecKitClient()
}