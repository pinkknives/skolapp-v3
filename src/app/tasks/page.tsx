'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { SpecKitIntegration } from '@/components/spec-kit/SpecKitIntegration'
import { useAssignments } from '@/lib/spec-kit/hooks'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as [number, number, number, number],
    },
  },
}

export default function TasksPage() {
  const { assignments, isLoading, error, refresh } = useAssignments()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-100 text-error-800'
      case 'medium':
        return 'bg-warning-100 text-warning-800'
      case 'low':
        return 'bg-success-100 text-success-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800'
      case 'in-progress':
        return 'bg-primary-100 text-primary-800'
      case 'pending':
        return 'bg-warning-100 text-warning-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'medium':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'low':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  // Group assignments by status
  const assignmentsByStatus = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.status]) {
      acc[assignment.status] = []
    }
    acc[assignment.status].push(assignment)
    return acc
  }, {} as Record<string, typeof assignments>)

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Heading level={1} className="mb-2">
                    Task Management
                  </Heading>
                  <Typography variant="subtitle1" className="text-neutral-600">
                    Organize, track, and complete your educational tasks efficiently.
                  </Typography>
                </div>
                <Button>
                  Create New Task
                </Button>
              </div>
            </motion.div>

            {/* Task Stats */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Typography variant="small" className="text-neutral-600">
                          Pending Tasks
                        </Typography>
                        <Typography variant="h4" className="text-neutral-900">
                          {assignmentsByStatus['draft']?.length || assignmentsByStatus['published']?.length || 0}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Typography variant="small" className="text-neutral-600">
                          In Progress
                        </Typography>
                        <Typography variant="h4" className="text-neutral-900">
                          {assignmentsByStatus['in-progress']?.length || 0}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Typography variant="small" className="text-neutral-600">
                          Completed
                        </Typography>
                        <Typography variant="h4" className="text-neutral-900">
                          {assignmentsByStatus.completed?.length || 0}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Spec Kit Integration */}
            <motion.div variants={itemVariants} className="mb-8">
              <SpecKitIntegration type="tasks" />
            </motion.div>

            {/* Tasks List */}
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Heading level={2} className="mb-2">
                  All Tasks
                </Heading>
                <Typography variant="body2" className="text-neutral-600">
                  Manage and track your tasks across all projects
                </Typography>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-5 bg-neutral-200 rounded w-12"></div>
                                <div className="h-5 bg-neutral-200 rounded w-16"></div>
                                <div className="h-3 bg-neutral-200 rounded w-20"></div>
                              </div>
                              <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                              <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 bg-neutral-200 rounded w-16"></div>
                              <div className="h-8 bg-neutral-200 rounded w-20"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : error ? (
                  // Error state
                  <motion.div variants={itemVariants}>
                    <Card variant="outlined" className="border-error-200 bg-error-50">
                      <CardContent className="p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-error-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <Typography variant="subtitle2" className="text-error-700 mb-2">
                          Failed to load assignments
                        </Typography>
                        <Typography variant="body2" className="text-error-600 mb-4">
                          {error.message}
                        </Typography>
                        <Button onClick={() => refresh()} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : assignments.length === 0 ? (
                  // Empty state
                  <motion.div variants={itemVariants}>
                    <Card variant="outlined" className="border-dashed">
                      <CardContent className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <Typography variant="subtitle1" className="text-neutral-700 mb-2">
                          No assignments found
                        </Typography>
                        <Typography variant="body2" className="text-neutral-500 mb-4">
                          Create your first assignment to get started
                        </Typography>
                        <Button>Create New Assignment</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  // Assignments data
                  assignments.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card variant="interactive">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                                    {getPriorityIcon(assignment.priority)}
                                    {assignment.priority}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                    {assignment.status}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                    {assignment.type}
                                  </span>
                                </div>
                                <Typography variant="caption" className="text-neutral-500">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </Typography>
                              </div>
                              <Typography variant="subtitle2" className="font-semibold mb-1">
                                {assignment.title}
                              </Typography>
                              <Typography variant="body2" className="text-neutral-600 mb-2">
                                {assignment.description}
                              </Typography>
                              <div className="flex items-center gap-4 text-xs text-neutral-500">
                                <span>Duration: {assignment.estimatedDuration}min</span>
                                <span>Assigned to: {assignment.assignedTo.length} students</span>
                                {assignment.planId && <span>Plan: {assignment.planId}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 sm:flex-col">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm">
                                {assignment.status === 'completed' ? 'View' : 'Complete'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}