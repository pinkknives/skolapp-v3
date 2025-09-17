// Mock API client that simulates real API responses
import {
  SpecKitResponse,
  SpecKitListResponse,
  CurriculumPlan,
  Assignment,
  LearningStandard,
  StudentProgress,
  PlanFilters,
  AssignmentFilters,
  SpecKitRequestOptions,
} from './types'
import {
  mockPlans,
  mockAssignments,
  mockStandards,
  mockStudentProgress,
  createMockResponse,
  createMockListResponse,
} from './mock-data'

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

export class MockSpecKitClient {
  async healthCheck(): Promise<SpecKitResponse<{ status: string; version: string }>> {
    await delay(200)
    return createMockResponse({
      status: 'healthy',
      version: '1.0.0-demo'
    })
  }

  async getPlans(
    filters?: PlanFilters,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<CurriculumPlan>> {
    await delay()
    
    let filteredPlans = [...mockPlans]
    
    if (filters?.status) {
      filteredPlans = filteredPlans.filter(plan => plan.status === filters.status)
    }
    
    if (filters?.gradeLevel) {
      filteredPlans = filteredPlans.filter(plan => plan.gradeLevel === filters.gradeLevel)
    }
    
    if (filters?.subject) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      )
    }

    return createMockListResponse(filteredPlans)
  }

  async getPlan(id: string): Promise<SpecKitResponse<CurriculumPlan>> {
    await delay()
    
    const plan = mockPlans.find(p => p.id === id)
    if (!plan) {
      throw new Error(`Plan with id ${id} not found`)
    }
    
    return createMockResponse(plan)
  }

  async createPlan(plan: Partial<CurriculumPlan>): Promise<SpecKitResponse<CurriculumPlan>> {
    await delay(800)
    
    const newPlan: CurriculumPlan = {
      id: `plan-${Date.now()}`,
      title: plan.title || 'New Plan',
      description: plan.description || '',
      gradeLevel: plan.gradeLevel || '8',
      subject: plan.subject || 'General',
      standards: plan.standards || [],
      objectives: plan.objectives || [],
      status: plan.status || 'draft',
      progress: 0,
      startDate: plan.startDate || new Date().toISOString(),
      endDate: plan.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
    }
    
    mockPlans.push(newPlan)
    return createMockResponse(newPlan)
  }

  async updatePlan(id: string, updates: Partial<CurriculumPlan>): Promise<SpecKitResponse<CurriculumPlan>> {
    await delay(600)
    
    const planIndex = mockPlans.findIndex(p => p.id === id)
    if (planIndex === -1) {
      throw new Error(`Plan with id ${id} not found`)
    }
    
    const updatedPlan = {
      ...mockPlans[planIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    mockPlans[planIndex] = updatedPlan
    return createMockResponse(updatedPlan)
  }

  async deletePlan(id: string): Promise<SpecKitResponse<void>> {
    await delay(400)
    
    const planIndex = mockPlans.findIndex(p => p.id === id)
    if (planIndex === -1) {
      throw new Error(`Plan with id ${id} not found`)
    }
    
    mockPlans.splice(planIndex, 1)
    return createMockResponse(undefined as any)
  }

  async getAssignments(
    filters?: AssignmentFilters,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<Assignment>> {
    await delay()
    
    let filteredAssignments = [...mockAssignments]
    
    if (filters?.status) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.status === filters.status)
    }
    
    if (filters?.type) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.type === filters.type)
    }
    
    if (filters?.priority) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.priority === filters.priority)
    }
    
    if (filters?.planId) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.planId === filters.planId)
    }

    return createMockListResponse(filteredAssignments)
  }

  async getAssignment(id: string): Promise<SpecKitResponse<Assignment>> {
    await delay()
    
    const assignment = mockAssignments.find(a => a.id === id)
    if (!assignment) {
      throw new Error(`Assignment with id ${id} not found`)
    }
    
    return createMockResponse(assignment)
  }

  async createAssignment(assignment: Partial<Assignment>): Promise<SpecKitResponse<Assignment>> {
    await delay(800)
    
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: assignment.title || 'New Assignment',
      description: assignment.description || '',
      type: assignment.type || 'homework',
      priority: assignment.priority || 'medium',
      status: assignment.status || 'draft',
      dueDate: assignment.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: assignment.estimatedDuration || 30,
      instructions: assignment.instructions || '',
      resources: assignment.resources || [],
      assignedTo: assignment.assignedTo || [],
      createdBy: 'current-user',
      objectives: assignment.objectives || [],
      planId: assignment.planId,
    }
    
    mockAssignments.push(newAssignment)
    return createMockResponse(newAssignment)
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<SpecKitResponse<Assignment>> {
    await delay(600)
    
    const assignmentIndex = mockAssignments.findIndex(a => a.id === id)
    if (assignmentIndex === -1) {
      throw new Error(`Assignment with id ${id} not found`)
    }
    
    const updatedAssignment = {
      ...mockAssignments[assignmentIndex],
      ...updates,
    }
    
    mockAssignments[assignmentIndex] = updatedAssignment
    return createMockResponse(updatedAssignment)
  }

  async deleteAssignment(id: string): Promise<SpecKitResponse<void>> {
    await delay(400)
    
    const assignmentIndex = mockAssignments.findIndex(a => a.id === id)
    if (assignmentIndex === -1) {
      throw new Error(`Assignment with id ${id} not found`)
    }
    
    mockAssignments.splice(assignmentIndex, 1)
    return createMockResponse(undefined as any)
  }

  async getStandards(
    filters?: { gradeLevel?: string; subject?: string },
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<LearningStandard>> {
    await delay()
    
    let filteredStandards = [...mockStandards]
    
    if (filters?.gradeLevel) {
      filteredStandards = filteredStandards.filter(standard => 
        standard.gradeLevel.includes(filters.gradeLevel!)
      )
    }
    
    if (filters?.subject) {
      filteredStandards = filteredStandards.filter(standard => 
        standard.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      )
    }

    return createMockListResponse(filteredStandards)
  }

  async getStudentProgress(
    studentId: string,
    planId?: string,
    options?: SpecKitRequestOptions
  ): Promise<SpecKitListResponse<StudentProgress>> {
    await delay()
    
    let filteredProgress = mockStudentProgress.filter(progress => progress.studentId === studentId)
    
    if (planId) {
      filteredProgress = filteredProgress.filter(progress => progress.planId === planId)
    }

    return createMockListResponse(filteredProgress)
  }

  async getPlanAnalytics(id: string): Promise<SpecKitResponse<{
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
    await delay(1000)
    
    const plan = mockPlans.find(p => p.id === id)
    if (!plan) {
      throw new Error(`Plan with id ${id} not found`)
    }
    
    // Generate mock analytics data
    const analytics = {
      completionRate: Math.round(plan.progress),
      averageScore: Math.round(75 + Math.random() * 20),
      studentEngagement: Math.round(80 + Math.random() * 15),
      timeSpent: Math.round(120 + Math.random() * 60), // minutes
      objectives: plan.objectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        masteryRate: Math.round(60 + Math.random() * 35)
      }))
    }
    
    return createMockResponse(analytics)
  }
}