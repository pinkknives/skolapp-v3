// Spec Kit Integration Component
// This component will integrate with the actual Spec Kit when available
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'

interface SpecKitProps {
  type: 'plan' | 'tasks'
  className?: string
}

export function SpecKitIntegration({ type, className }: SpecKitProps) {
  // Placeholder for actual Spec Kit integration
  const handleSpecKitAction = () => {
    console.log(`Spec Kit ${type} action triggered`)
    // This will be replaced with actual Spec Kit integration
  }

  return (
    <div className={className}>
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg 
              className="h-5 w-5 text-primary-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
            <span>Spec Kit Integration - {type}</span>
          </CardTitle>
          <CardDescription>
            {type === 'plan' 
              ? 'Plan management powered by Spec Kit specifications'
              : 'Task management with Spec Kit integration'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Typography variant="body2" className="text-neutral-600">
              This section will integrate with Spec Kit to provide:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-600">
              {type === 'plan' ? (
                <>
                  <li>Curriculum planning and management</li>
                  <li>Learning objective tracking</li>
                  <li>Progress monitoring and reporting</li>
                  <li>Standards alignment</li>
                </>
              ) : (
                <>
                  <li>Assignment creation and distribution</li>
                  <li>Due date management and reminders</li>
                  <li>Progress tracking and analytics</li>
                  <li>Collaboration tools</li>
                </>
              )}
            </ul>
            <div className="pt-4">
              <Button onClick={handleSpecKitAction} variant="outline">
                Connect to Spec Kit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock data for demonstration
export const mockPlanData = {
  plans: [
    {
      id: '1',
      title: 'Mathematics Curriculum Q1',
      description: 'First quarter mathematics planning for grade 8',
      status: 'active',
      progress: 65,
      dueDate: '2024-03-15',
      subjects: ['Algebra', 'Geometry'],
    },
    {
      id: '2',
      title: 'Science Lab Planning',
      description: 'Laboratory activities and experiments schedule',
      status: 'draft',
      progress: 30,
      dueDate: '2024-02-28',
      subjects: ['Chemistry', 'Physics'],
    },
  ],
}

export const mockTaskData = {
  tasks: [
    {
      id: '1',
      title: 'Grade Math Assignments',
      description: 'Review and grade week 3 mathematics assignments',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-20',
      assignedTo: 'Teacher A',
    },
    {
      id: '2',
      title: 'Prepare Science Quiz',
      description: 'Create quiz questions for next week\'s science test',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2024-01-22',
      assignedTo: 'Teacher B',
    },
    {
      id: '3',
      title: 'Parent-Teacher Meetings',
      description: 'Schedule and conduct quarterly parent meetings',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-15',
      assignedTo: 'Coordinator',
    },
  ],
}