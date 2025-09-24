'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { RubricDisplay } from './RubricDisplay'
import { EditRubricModal } from './EditRubricModal'
import { AIAssessment, TeacherDecision, Question, QuizResult, Rubric } from '@/types/quiz'
import { createAIGradingClient } from '@/lib/ai-grading'
import { aiGradingAuditService } from '@/lib/ai-grading-audit'
import { type User } from '@/types/auth'
import { toast } from '@/components/ui/Toast'

interface AISuggestionsPanel {
  quiz: { id: string; questions: Question[] }
  results: QuizResult[]
  currentQuestionIndex: number
  user?: User
  onClose: () => void
  onQuizUpdate?: (questionId: string, rubric: Rubric | undefined) => void
  className?: string
}

interface StudentAnswerWithAssessment {
  studentId: string
  studentName: string
  answer: string | string[]
  assessment?: AIAssessment
  decision?: TeacherDecision
  isProcessing: boolean
}

export function AISuggestionsPanel({
  quiz,
  results,
  currentQuestionIndex,
  user,
  onClose,
  onQuizUpdate,
  className = ''
}: AISuggestionsPanel) {
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswerWithAssessment[]>([])
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false)
  const [selectedBatchThreshold, setSelectedBatchThreshold] = useState(0.8)
  const [showWarning, setShowWarning] = useState(true)
  const [showEditRubric, setShowEditRubric] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const aiClient = createAIGradingClient(user, user?.dataRetentionMode || 'korttid')
  const sessionId = `grading_session_${quiz.id}_${Date.now()}`

  const loadStudentAnswers = useCallback(() => {
    const answersForQuestion = results.map((result, index) => {
      const answer = result.answers.find(a => a.questionId === currentQuestion.id)
      return {
        studentId: result.studentId,
        studentName: `Elev ${index + 1}`, // Anonymized names
        answer: answer?.answer || '',
        isProcessing: false
      }
    }).filter(item => item.answer !== '')

    setStudentAnswers(answersForQuestion)
  }, [results, currentQuestion.id])

  useEffect(() => {
    loadStudentAnswers()
  }, [loadStudentAnswers, currentQuestionIndex])

  const generateAIAssessments = async () => {
    if (currentQuestion.type === 'multiple-choice') {
      // Multiple choice is auto-graded
      return
    }

    setIsLoadingAssessments(true)

    try {
      const updatedAnswers = [...studentAnswers]

      for (let i = 0; i < updatedAnswers.length; i++) {
        const studentAnswer = updatedAnswers[i]
        
        // Skip if already has assessment
        if (studentAnswer.assessment) continue

        // Mark as processing
        updatedAnswers[i] = { ...studentAnswer, isProcessing: true }
        setStudentAnswers([...updatedAnswers])

        try {
          const assessment = await aiClient.gradeAnswer(
            studentAnswer.answer,
            currentQuestion
          )

          // Update assessment ID with actual answer reference
          const finalAssessment = {
            ...assessment,
            answerId: `${studentAnswer.studentId}_${currentQuestion.id}`
          }

          updatedAnswers[i] = {
            ...studentAnswer,
            assessment: finalAssessment,
            isProcessing: false
          }

          // Log the AI assessment
          aiGradingAuditService.logAIAssessment(
            finalAssessment,
            sessionId,
            user?.id || 'anonymous_teacher',
            false, // hadPII - false because we anonymize
            true   // wasAnonymized
          )

        } catch {
          // Error generating AI assessment - silently fail for now
          updatedAnswers[i] = { ...studentAnswer, isProcessing: false }
        }

        setStudentAnswers([...updatedAnswers])
        
        // Small delay between assessments to avoid overwhelming the UI
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } finally {
      setIsLoadingAssessments(false)
    }
  }

  const handleRubricUpdate = (questionId: string, rubric: Rubric | undefined) => {
    // Update the local quiz state
    quiz.questions[currentQuestionIndex] = {
      ...currentQuestion,
      rubric
    }

    // Clear existing assessments so they can be regenerated with new rubric
    setStudentAnswers(prev => prev.map(sa => ({
      ...sa,
      assessment: undefined,
      decision: undefined
    })))

    // Notify parent component if provided
    if (onQuizUpdate) {
      onQuizUpdate(questionId, rubric)
    }
  }

  const regenerateWithNewRubric = async () => {
    // Clear existing assessments and regenerate
    setStudentAnswers(prev => prev.map(sa => ({
      ...sa,
      assessment: undefined,
      decision: undefined
    })))
    
    // Start fresh generation
    await generateAIAssessments()
  }

  const handleTeacherDecision = (
    studentAnswer: StudentAnswerWithAssessment,
    decision: 'approve' | 'edit' | 'reject',
    finalScore?: number,
    note?: string
  ) => {
    if (!studentAnswer.assessment) return

    const teacherDecision: TeacherDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assessmentId: studentAnswer.assessment.id,
      answerId: studentAnswer.assessment.answerId,
      decision,
      finalScore: finalScore ?? (decision === 'approve' ? studentAnswer.assessment.suggestedScore : 0),
      finalRationale: decision === 'edit' ? note : undefined,
      teacherNote: note,
      timestamp: new Date(),
      teacherId: user?.id || 'anonymous_teacher'
    }

    // Update local state
    const updatedAnswers = studentAnswers.map(sa => 
      sa.studentId === studentAnswer.studentId 
        ? { ...sa, decision: teacherDecision }
        : sa
    )
    setStudentAnswers(updatedAnswers)

    // Toast feedback
    const decisionText = {
      'approve': 'Godkänd',
      'edit': 'Redigerad',
      'reject': 'Avvisad'
    }[decision]
    toast.success(`Bedömning ${decisionText.toLowerCase()} för ${studentAnswer.studentName}`)

    // Log the teacher decision
    aiGradingAuditService.logTeacherDecision(
      teacherDecision,
      studentAnswer.assessment,
      sessionId
    )
  }

  const handleBatchApprove = () => {
    const eligibleAnswers = studentAnswers.filter(sa => 
      sa.assessment && 
      sa.assessment.confidence >= selectedBatchThreshold &&
      !sa.decision
    )

    eligibleAnswers.forEach(sa => {
      handleTeacherDecision(sa, 'approve')
    })

    // Toast feedback for batch action
    toast.success(`${eligibleAnswers.length} bedömningar godkända automatiskt`)

    // Log batch action
    aiGradingAuditService.logBatchAction(
      sessionId,
      user?.id || 'anonymous_teacher',
      `approve_confidence_threshold_${selectedBatchThreshold}`,
      selectedBatchThreshold,
      eligibleAnswers.length,
      eligibleAnswers.map(sa => sa.assessment?.questionId || '')
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600'
    if (confidence >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Hög säkerhet'
    if (confidence >= 0.6) return 'Medelsäkerhet'
    return 'Låg säkerhet'
  }

  if (currentQuestion.type === 'multiple-choice') {
    return (
      <div className={`bg-white border-l border-neutral-200 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6">AI-förslag</Typography>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <Typography variant="body2" className="text-neutral-600">
              Flervalsfrågor rättas automatiskt. AI-förslag behövs inte.
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-förslag för bedömning</DialogTitle>
          <DialogDescription>
            Granska AI-förslagen och godkänn, redigera eller avvisa varje bedömning
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">

        {/* Warning message */}
        {showWarning && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <Typography variant="body2" className="font-medium text-warning-800 mb-1">
                  Viktigt att komma ihåg
                </Typography>
                <Typography variant="caption" className="text-warning-700">
                  AI kan ha fel. Du fastställer alltid slutresultatet genom att granska och godkänna varje förslag.
                </Typography>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWarning(false)}
                className="text-warning-600 hover:text-warning-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Rubric display */}
        {currentQuestion.rubric && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body2" className="font-medium text-neutral-700">
                Bedömningskriterier för denna fråga
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditRubric(true)}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Redigera kriterier
              </Button>
            </div>
            <RubricDisplay
              rubric={currentQuestion.rubric}
              className="mb-4"
            />
            <Typography variant="caption" className="text-neutral-600">
              AI kommer att använda dessa kriterier för att bedöma elevernas svar.
            </Typography>
          </div>
        )}

        {/* Add rubric button if no rubric exists */}
        {!currentQuestion.rubric && (
          <div className="mb-6">
            <div className="bg-neutral-50 p-4 rounded-lg border border-dashed border-neutral-300">
              <div className="text-center">
                <svg className="h-8 w-8 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Typography variant="body2" className="text-neutral-600 mb-3">
                  Inga bedömningskriterier definierade för denna fråga
                </Typography>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditRubric(true)}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Lägg till kriterier
                </Button>
              </div>
            </div>
            <Typography variant="caption" className="text-neutral-600 mt-2">
              Bedömningskriterier hjälper AI:n att ge mer träffsäkra förslag.
            </Typography>
          </div>
        )}

        {/* Generate AI assessments button */}
        {studentAnswers.length > 0 && !studentAnswers.some(sa => sa.assessment) && (
          <div className="mb-6">
            <Button
              onClick={generateAIAssessments}
              disabled={isLoadingAssessments}
              className="w-full"
            >
              {isLoadingAssessments ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Genererar AI-förslag...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generera AI-förslag
                </>
              )}
            </Button>
          </div>
        )}

        {/* Regenerate AI assessments button */}
        {studentAnswers.length > 0 && studentAnswers.some(sa => sa.assessment) && (
          <div className="mb-6">
            <Button
              onClick={regenerateWithNewRubric}
              disabled={isLoadingAssessments}
              variant="outline"
              className="w-full"
            >
              {isLoadingAssessments ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Genererar om...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generera AI-förslag igen
                </>
              )}
            </Button>
            <Typography variant="caption" className="text-neutral-600 mt-2 block text-center">
              Alla tidigare bedömningar och lärarbeslut kommer att tas bort
            </Typography>
          </div>
        )}

        {/* Batch actions */}
        {studentAnswers.some(sa => sa.assessment && !sa.decision) && (
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
            <Typography variant="body2" className="font-medium mb-3">
              Batchåtgärder
            </Typography>
            
            <div className="flex items-center space-x-2 mb-3">
              <Typography variant="caption">Godkänn alla med säkerhet ≥</Typography>
              <select
                value={selectedBatchThreshold}
                onChange={(e) => setSelectedBatchThreshold(Number(e.target.value))}
                className="text-sm border border-neutral-300 rounded px-2 py-1"
              >
                <option value={0.9}>90%</option>
                <option value={0.8}>80%</option>
                <option value={0.7}>70%</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchApprove}
              disabled={!studentAnswers.some(sa => 
                sa.assessment && 
                sa.assessment.confidence >= selectedBatchThreshold && 
                !sa.decision
              )}
            >
              Godkänn automatiskt ({studentAnswers.filter(sa => 
                sa.assessment && 
                sa.assessment.confidence >= selectedBatchThreshold && 
                !sa.decision
              ).length} st)
            </Button>
          </div>
        )}

        {/* Student answers and assessments */}
        <div className="space-y-4">
          {studentAnswers.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="body2" className="text-neutral-500">
                Inga elevsvar att granska för denna fråga.
              </Typography>
            </div>
          ) : (
            studentAnswers.map((studentAnswer, index) => (
              <Card key={`${studentAnswer.studentId}-${index}`} className="border border-neutral-200">
                <CardContent className="p-4">
                  {/* Student answer */}
                  <div className="mb-3">
                    <Typography variant="body2" className="font-medium mb-1">
                      {studentAnswer.studentName}
                    </Typography>
                    <div className="bg-neutral-50 p-3 rounded text-sm">
                      {Array.isArray(studentAnswer.answer) 
                        ? studentAnswer.answer.join(', ')
                        : studentAnswer.answer
                      }
                    </div>
                  </div>

                  {/* AI Assessment */}
                  {studentAnswer.isProcessing ? (
                    <div className="flex items-center text-neutral-500 text-sm">
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyserar...
                    </div>
                  ) : studentAnswer.assessment ? (
                    <div className="space-y-3">
                      {/* AI suggestion */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Typography variant="caption" className="font-medium text-blue-800">
                            AI-förslag
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getConfidenceColor(studentAnswer.assessment.confidence)}`}>
                              {getConfidenceLabel(studentAnswer.assessment.confidence)}
                            </span>
                            <span className="text-sm text-blue-600">
                              {studentAnswer.assessment.suggestedScore}/{studentAnswer.assessment.maxScore}p
                            </span>
                          </div>
                        </div>
                        <Typography variant="caption" className="text-blue-700">
                          {studentAnswer.assessment.rationale}
                        </Typography>
                      </div>

                      {/* Rubric evaluation if available */}
                      {studentAnswer.assessment.rubricEvaluation && currentQuestion.rubric && (
                        <RubricDisplay
                          rubric={currentQuestion.rubric}
                          evaluation={studentAnswer.assessment.rubricEvaluation}
                          className="mt-3"
                        />
                      )}

                      {/* Teacher decision */}
                      {studentAnswer.decision ? (
                        <div className={`border rounded p-3 ${
                          studentAnswer.decision.decision === 'approve' ? 'bg-success-50 border-success-200' :
                          studentAnswer.decision.decision === 'edit' ? 'bg-warning-50 border-warning-200' :
                          'bg-error-50 border-error-200'
                        }`}>
                          <Typography variant="caption" className="font-medium">
                            Du har {
                              studentAnswer.decision.decision === 'approve' ? 'godkänt' :
                              studentAnswer.decision.decision === 'edit' ? 'redigerat' :
                              'avvisat'
                            } - Slutpoäng: {studentAnswer.decision.finalScore}p
                          </Typography>
                          {studentAnswer.decision.teacherNote && (
                            <div className="mt-1">
                              <Typography variant="caption" className="text-neutral-600">
                                Anteckning: {studentAnswer.decision.teacherNote}
                              </Typography>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Action buttons */
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTeacherDecision(studentAnswer, 'approve')}
                            className="flex-1 text-success-600 border-success-300 hover:bg-success-50"
                          >
                            Godkänn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newScore = prompt(`Redigera poäng (0-${studentAnswer.assessment!.maxScore}):`, 
                                studentAnswer.assessment!.suggestedScore.toString())
                              const note = prompt('Lägg till anteckning (valfritt):')
                              if (newScore !== null) {
                                handleTeacherDecision(studentAnswer, 'edit', Number(newScore), note || undefined)
                              }
                            }}
                            className="flex-1 text-warning-600 border-warning-300 hover:bg-warning-50"
                          >
                            Redigera
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const note = prompt('Anledning till avvisning (valfritt):')
                              handleTeacherDecision(studentAnswer, 'reject', 0, note || undefined)
                            }}
                            className="flex-1 text-error-600 border-error-300 hover:bg-error-50"
                          >
                            Avvisa
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>

          {/* AI adapter info */}
          <div className="mt-6 p-3 bg-neutral-50 rounded text-sm">
            <Typography variant="caption" className="text-neutral-600">
              AI-motor: {aiClient.getAdapterInfo().name} • 
              Ingen elevdata lämnar systemet • 
              All AI-användning loggas för granskning
            </Typography>
          </div>
        </div>
      </DialogContent>

      {/* Edit Rubric Modal */}
      {showEditRubric && (
        <EditRubricModal
          question={currentQuestion}
          onSave={handleRubricUpdate}
          onClose={() => setShowEditRubric(false)}
        />
      )}
    </Dialog>
  )
}