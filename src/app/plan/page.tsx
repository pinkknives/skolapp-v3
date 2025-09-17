'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { SpecKitIntegration } from '@/components/spec-kit/SpecKitIntegration'
import { usePlans } from '@/lib/spec-kit/hooks'
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

export default function PlanPage() {
  const { plans, isLoading, error, refresh } = usePlans()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600'
      case 'draft':
        return 'text-warning-600'
      case 'completed':
        return 'text-neutral-600'
      default:
        return 'text-neutral-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800'
      case 'draft':
        return 'bg-warning-100 text-warning-800'
      case 'completed':
        return 'bg-neutral-100 text-neutral-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

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
                    Plan Management
                  </Heading>
                  <Typography variant="subtitle1" className="text-neutral-600">
                    Create, manage, and track your educational plans and curriculum.
                  </Typography>
                </div>
                <Button>
                  Create New Plan
                </Button>
              </div>
            </motion.div>

            {/* Spec Kit Integration */}
            <motion.div variants={itemVariants} className="mb-8">
              <SpecKitIntegration type="plan" />
            </motion.div>

            {/* Plans Grid */}
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Heading level={2} className="mb-2">
                  Current Plans
                </Heading>
                <Typography variant="body2" className="text-neutral-600">
                  Overview of your active and draft plans
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="h-full animate-pulse">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-neutral-200 rounded w-16"></div>
                            <div className="h-3 bg-neutral-200 rounded w-20"></div>
                          </div>
                          <div className="h-6 bg-neutral-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="h-3 bg-neutral-200 rounded w-16 mb-1"></div>
                              <div className="h-2 bg-neutral-200 rounded w-full"></div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 bg-neutral-200 rounded flex-1"></div>
                              <div className="h-8 bg-neutral-200 rounded flex-1"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : error ? (
                  // Error state
                  <motion.div variants={itemVariants} className="col-span-full">
                    <Card variant="outlined" className="border-error-200 bg-error-50">
                      <CardContent className="p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-error-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <Typography variant="subtitle2" className="text-error-700 mb-2">
                          Failed to load plans
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
                ) : plans.length === 0 ? (
                  // Empty state
                  <motion.div variants={itemVariants} className="col-span-full">
                    <Card variant="outlined" className="border-dashed">
                      <CardContent className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <Typography variant="subtitle1" className="text-neutral-700 mb-2">
                          No plans found
                        </Typography>
                        <Typography variant="body2" className="text-neutral-500 mb-4">
                          Get started by creating your first curriculum plan
                        </Typography>
                        <Button>Create New Plan</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  // Plans data
                  <>
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card variant="interactive" className="h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                  plan.status
                                )}`}
                              >
                                {plan.status}
                              </span>
                              <Typography variant="caption" className="text-neutral-500">
                                Due: {new Date(plan.endDate).toLocaleDateString()}
                              </Typography>
                            </div>
                            <CardTitle className="mt-2">{plan.title}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Progress Bar */}
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-neutral-600">Progress</span>
                                  <span className="text-neutral-900 font-medium">
                                    {plan.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${plan.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Subject and Grade */}
                              <div>
                                <Typography variant="caption" className="text-neutral-600 mb-2 block">
                                  {plan.subject} - Grade {plan.gradeLevel}
                                </Typography>
                                {plan.standards && plan.standards.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {plan.standards.slice(0, 2).map((standard) => (
                                      <span
                                        key={standard.id}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                                        title={standard.title}
                                      >
                                        {standard.code}
                                      </span>
                                    ))}
                                    {plan.standards.length > 2 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                                        +{plan.standards.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" fullWidth>
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" fullWidth>
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </>
                )}

                {/* Add New Plan Card - only show if there are existing plans */}
                {!isLoading && !error && plans.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <Card 
                      variant="outlined" 
                      className="h-full flex items-center justify-center min-h-[300px] border-dashed hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-neutral-400 mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <Typography variant="subtitle2" className="text-neutral-600 mb-2">
                          Create New Plan
                        </Typography>
                        <Typography variant="caption" className="text-neutral-500">
                          Start planning your next curriculum
                        </Typography>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}