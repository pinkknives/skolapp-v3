'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AssignmentCard as AssignmentCardType } from '@/types/quiz'
import { Clock, Calendar, CheckCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface AssignmentCardProps {
  assignment: AssignmentCardType
  onUpdate?: () => void
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(assignment.timeRemaining)

  // Update countdown every minute
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      const now = new Date()
      const remaining = Math.floor((assignment.dueAt.getTime() - now.getTime()) / 1000)
      setTimeRemaining(Math.max(0, remaining))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [assignment.dueAt, timeRemaining])

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Deadline passerad'
    
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h kvar`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m kvar`
    } else {
      return `${minutes}m kvar`
    }
  }

  const getStatusColor = () => {
    switch (assignment.status) {
      case 'submitted':
        return 'text-success-600 bg-success-100'
      case 'late':
        return 'text-error-600 bg-error-100'
      case 'in_progress':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-neutral-600 bg-neutral-100'
    }
  }

  const getStatusText = () => {
    switch (assignment.status) {
      case 'submitted':
        return 'Inskickad'
      case 'late':
        return 'Försenad'
      case 'in_progress':
        return 'Pågående'
      default:
        return 'Ej påbörjad'
    }
  }

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />
      case 'late':
        return <AlertTriangle className="w-4 h-4" />
      case 'in_progress':
        return <RotateCcw className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getActionButton = () => {
    if (assignment.status === 'submitted') {
      return (
        <Button disabled size="sm" className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          Inskickad
        </Button>
      )
    }

    if (!assignment.canStart) {
      if (assignment.openAt && assignment.openAt > new Date()) {
        return (
          <Button disabled size="sm" className="w-full">
            Öppnar {formatDate(assignment.openAt)}
          </Button>
        )
      }
      
      if (timeRemaining <= 0) {
        return (
          <Button disabled size="sm" className="w-full">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Deadline passerad
          </Button>
        )
      }

      if (assignment.attemptsUsed >= assignment.maxAttempts) {
        return (
          <Button disabled size="sm" className="w-full">
            Alla försök använda
          </Button>
        )
      }
    }

    const buttonText = assignment.status === 'in_progress' ? 'Fortsätt' : 'Börja'
    const buttonIcon = assignment.status === 'in_progress' ? <RotateCcw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />

    return (
      <Button asChild size="sm" className="w-full">
        <Link href={`/student/assignment/${assignment.sessionId}`}>
          {buttonIcon}
          {buttonText}
        </Link>
      </Button>
    )
  }

  return (
    <Card className={`transition-all hover:shadow-md ${
      assignment.status === 'late' ? 'border-error-200' : 
      assignment.status === 'submitted' ? 'border-success-200' :
      timeRemaining <= 3600 ? 'border-warning-200' : // 1 hour warning
      'border-neutral-200'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            {assignment.quizTitle}
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </div>
        </div>
        
        {assignment.className && (
          <Typography variant="body2" className="text-neutral-600">
            {assignment.className}
          </Typography>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Due Date and Time Remaining */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {formatDate(assignment.dueAt)}</span>
          </div>
          
          <div className={`flex items-center gap-2 text-sm font-medium ${
            timeRemaining <= 3600 ? 'text-error-600' : // 1 hour warning
            timeRemaining <= 24 * 3600 ? 'text-warning-600' : // 24 hour warning
            'text-neutral-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Typography variant="caption" className="text-neutral-500">
              Försök
            </Typography>
            <Typography variant="body2" className="font-medium">
              {assignment.attemptsUsed} / {assignment.maxAttempts}
            </Typography>
          </div>
          
          {assignment.timeLimitSeconds && (
            <div>
              <Typography variant="caption" className="text-neutral-500">
                Tidsgräns
              </Typography>
              <Typography variant="body2" className="font-medium">
                {Math.floor(assignment.timeLimitSeconds / 60)} min
              </Typography>
            </div>
          )}
        </div>

        {/* Action Button */}
        {getActionButton()}
      </CardContent>
    </Card>
  )
}