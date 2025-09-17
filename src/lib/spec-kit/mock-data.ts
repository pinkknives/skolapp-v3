// Mock data for development and testing
import {
  CurriculumPlan,
  Assignment,
  LearningStandard,
  StudentProgress,
  SpecKitResponse,
  SpecKitListResponse,
} from './types'

// Mock learning standards
export const mockStandards: LearningStandard[] = [
  {
    id: 'std-001',
    code: 'CCSS.MATH.8.A.1',
    title: 'Understand and apply properties of integer exponents',
    description: 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.',
    gradeLevel: ['8'],
    subject: 'Mathematics',
    category: 'Algebra',
  },
  {
    id: 'std-002',
    code: 'CCSS.MATH.8.G.1',
    title: 'Verify properties of rotations, reflections, and translations',
    description: 'Verify experimentally the properties of rotations, reflections, and translations.',
    gradeLevel: ['8'],
    subject: 'Mathematics',
    category: 'Geometry',
  },
  {
    id: 'std-003',
    code: 'NGSS.MS-LS1-3',
    title: 'Body Systems and Environmental Conditions',
    description: 'Use argument supported by evidence for how the body is a system of interacting subsystems.',
    gradeLevel: ['6', '7', '8'],
    subject: 'Science',
    category: 'Life Science',
  },
]

// Mock curriculum plans
export const mockPlans: CurriculumPlan[] = [
  {
    id: 'plan-001',
    title: 'Mathematics Fundamentals Q1',
    description: 'First quarter mathematics curriculum focusing on algebraic thinking and geometric reasoning',
    gradeLevel: '8',
    subject: 'Mathematics',
    standards: [mockStandards[0], mockStandards[1]],
    objectives: [
      {
        id: 'obj-001',
        title: 'Master integer exponent properties',
        description: 'Students will demonstrate understanding of integer exponents through problem solving',
        standardId: 'std-001',
        measurable: true,
        assessmentCriteria: [
          'Correctly applies exponent rules in 90% of problems',
          'Can explain reasoning verbally or in writing',
        ],
        skills: ['Problem solving', 'Mathematical reasoning', 'Communication'],
      },
      {
        id: 'obj-002',
        title: 'Analyze geometric transformations',
        description: 'Students will identify and apply rotations, reflections, and translations',
        standardId: 'std-002',
        measurable: true,
        assessmentCriteria: [
          'Accurately performs transformations on coordinate plane',
          'Explains properties of each transformation type',
        ],
        skills: ['Spatial reasoning', 'Critical thinking', 'Visualization'],
      },
    ],
    status: 'active',
    progress: 65,
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    createdBy: 'teacher-001',
    updatedAt: '2024-09-15T10:30:00Z',
  },
  {
    id: 'plan-002',
    title: 'Science Lab Investigations',
    description: 'Hands-on laboratory investigations exploring life science concepts',
    gradeLevel: '7',
    subject: 'Science',
    standards: [mockStandards[2]],
    objectives: [
      {
        id: 'obj-003',
        title: 'Understand body systems interactions',
        description: 'Students will model how body systems work together to maintain homeostasis',
        standardId: 'std-003',
        measurable: true,
        assessmentCriteria: [
          'Creates accurate system interaction diagrams',
          'Provides evidence-based explanations',
        ],
        skills: ['Scientific modeling', 'Evidence-based reasoning', 'Systems thinking'],
      },
    ],
    status: 'draft',
    progress: 30,
    startDate: '2024-10-01',
    endDate: '2024-01-15',
    createdBy: 'teacher-002',
    updatedAt: '2024-09-10T14:20:00Z',
  },
  {
    id: 'plan-003',
    title: 'Advanced Mathematics Q2',
    description: 'Second quarter advanced mathematics for accelerated students',
    gradeLevel: '8',
    subject: 'Mathematics',
    standards: [mockStandards[0]],
    objectives: [
      {
        id: 'obj-004',
        title: 'Apply advanced algebraic concepts',
        description: 'Students will solve complex problems using multiple algebraic strategies',
        standardId: 'std-001',
        measurable: true,
        assessmentCriteria: [
          'Solves multi-step problems accurately',
          'Justifies solution methods',
        ],
        skills: ['Advanced problem solving', 'Mathematical communication', 'Strategic thinking'],
      },
    ],
    status: 'completed',
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-05-30',
    createdBy: 'teacher-003',
    updatedAt: '2024-06-01T09:15:00Z',
  },
]

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-001',
    title: 'Exponent Properties Practice',
    description: 'Complete practice problems demonstrating mastery of integer exponent rules',
    type: 'homework',
    priority: 'high',
    status: 'published',
    dueDate: '2024-09-25T23:59:00Z',
    estimatedDuration: 45,
    instructions: 'Complete all problems in section 3.2. Show all work and explain your reasoning for problems 15-20.',
    resources: [
      {
        id: 'res-001',
        type: 'document',
        title: 'Exponent Rules Reference Sheet',
        url: '/resources/exponent-rules.pdf',
        description: 'Quick reference guide for integer exponent properties',
      },
      {
        id: 'res-002',
        type: 'video',
        title: 'Exponent Properties Explained',
        url: 'https://education.example.com/videos/exponents',
        description: '15-minute video explaining exponent rules with examples',
      },
    ],
    rubric: {
      id: 'rubric-001',
      title: 'Mathematics Problem Solving Rubric',
      maxPoints: 100,
      criteria: [
        {
          id: 'crit-001',
          name: 'Mathematical Accuracy',
          description: 'Correct application of mathematical concepts and procedures',
          levels: [
            { id: 'level-1', name: 'Novice', description: 'Minimal accuracy', points: 1 },
            { id: 'level-2', name: 'Developing', description: 'Some accuracy with errors', points: 2 },
            { id: 'level-3', name: 'Proficient', description: 'Mostly accurate work', points: 3 },
            { id: 'level-4', name: 'Advanced', description: 'Highly accurate work', points: 4 },
          ],
        },
        {
          id: 'crit-002',
          name: 'Mathematical Reasoning',
          description: 'Clear explanation of mathematical thinking and problem-solving approach',
          levels: [
            { id: 'level-5', name: 'Novice', description: 'Limited reasoning shown', points: 1 },
            { id: 'level-6', name: 'Developing', description: 'Some reasoning with gaps', points: 2 },
            { id: 'level-7', name: 'Proficient', description: 'Clear reasoning for most problems', points: 3 },
            { id: 'level-8', name: 'Advanced', description: 'Sophisticated reasoning throughout', points: 4 },
          ],
        },
      ],
    },
    assignedTo: ['student-001', 'student-002', 'student-003'],
    createdBy: 'teacher-001',
    planId: 'plan-001',
    objectives: ['obj-001'],
  },
  {
    id: 'assign-002',
    title: 'Geometry Transformation Lab',
    description: 'Interactive lab exploring rotations, reflections, and translations using coordinate geometry',
    type: 'project',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2024-10-05T23:59:00Z',
    estimatedDuration: 90,
    instructions: 'Work in pairs to complete the transformation lab. Document your findings and create a presentation.',
    resources: [
      {
        id: 'res-003',
        type: 'website',
        title: 'Interactive Transformation Tool',
        url: 'https://geogebra.org/transformations',
        description: 'Online tool for exploring geometric transformations',
      },
    ],
    assignedTo: ['student-001', 'student-004'],
    createdBy: 'teacher-001',
    planId: 'plan-001',
    objectives: ['obj-002'],
  },
  {
    id: 'assign-003',
    title: 'Body Systems Research Project',
    description: 'Research and present on how different body systems interact to maintain health',
    type: 'project',
    priority: 'low',
    status: 'completed',
    dueDate: '2024-09-20T23:59:00Z',
    estimatedDuration: 120,
    instructions: 'Choose two body systems and research their interactions. Create a visual presentation explaining your findings.',
    resources: [
      {
        id: 'res-004',
        type: 'document',
        title: 'Body Systems Overview',
        url: '/resources/body-systems.pdf',
      },
    ],
    assignedTo: ['student-005', 'student-006'],
    createdBy: 'teacher-002',
    planId: 'plan-002',
    objectives: ['obj-003'],
  },
]

// Mock student progress
export const mockStudentProgress: StudentProgress[] = [
  {
    studentId: 'student-001',
    planId: 'plan-001',
    objectiveId: 'obj-001',
    completionRate: 85,
    lastActivity: '2024-09-15T14:30:00Z',
    mastery: 'proficient',
  },
  {
    studentId: 'student-001',
    planId: 'plan-001',
    objectiveId: 'obj-002',
    completionRate: 60,
    lastActivity: '2024-09-14T16:45:00Z',
    mastery: 'developing',
  },
  {
    studentId: 'student-002',
    planId: 'plan-001',
    objectiveId: 'obj-001',
    completionRate: 95,
    lastActivity: '2024-09-16T10:15:00Z',
    mastery: 'advanced',
  },
]

// Mock API responses
export const createMockResponse = <T>(data: T): SpecKitResponse<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
})

export const createMockListResponse = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): SpecKitListResponse<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
  pagination: {
    page,
    limit,
    total: data.length,
    hasNext: data.length > page * limit,
    hasPrev: page > 1,
  },
})

// Export all mock data for easy access
export const mockData = {
  standards: mockStandards,
  plans: mockPlans,
  assignments: mockAssignments,
  studentProgress: mockStudentProgress,
}