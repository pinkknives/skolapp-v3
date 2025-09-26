import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

/**
 * GET /api/sessions/:id/export.csv
 * Export session results as CSV
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const url = new URL(request.url)
    const allAttempts = url.searchParams.get('allAttempts') === 'true'

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessions-ID krävs' },
        { status: 400 }
      )
    }

    // Verify teacher authentication and session ownership
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Verify session ownership and get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id, 
        teacher_id, 
        mode, 
        due_at, 
        reveal_policy, 
        quiz_id
      `)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Get quiz with questions separately
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id, 
        title, 
        questions(id, title, type, points)
      `)
      .eq('id', session.quiz_id)
      .single()
    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz hittades inte' },
        { status: 404 }
      )
    }

    // Get session participants
    const { data: participants, error: participantsError } = await supabase
      .from('session_participants')
      .select('session_id, student_id, display_name')
      .eq('session_id', sessionId)

    if (participantsError) {
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av deltagare' },
        { status: 500 }
      )
    }

    // Get attempt items
    const { data: attemptItems, error: itemsError } = await supabase
      .from('attempt_items')
      .select('session_id, user_id, question_id, question_index, answer, is_correct, score, time_spent_seconds, answered_at, attempt_no')
      .eq('session_id', sessionId)
      .order('user_id')
      .order('question_index')
      .order('attempt_no')

    if (itemsError) {
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av svar' },
        { status: 500 }
      )
    }

    // Get progress data for submission status
    const { data: progressData, error: progressError } = await supabase
      .from('session_progress')
      .select('session_id, user_id, status, started_at, submitted_at')
      .eq('session_id', sessionId)

    if (progressError) {
      console.error('Error fetching progress:', progressError)
    }

    // Build CSV data
    const participantMap = new Map()
    participants?.forEach(p => {
      if (p.student_id) {
        participantMap.set(p.student_id, p.display_name || 'Okänd elev')
      }
    })

    const progressMap = new Map()
    progressData?.forEach(p => {
      progressMap.set(p.user_id, {
        status: p.status,
        startedAt: p.started_at,
        submittedAt: p.submitted_at
      })
    })

    // Group attempts by user
    const userAttempts = new Map()
    attemptItems?.forEach(item => {
      if (!userAttempts.has(item.user_id)) {
        userAttempts.set(item.user_id, new Map())
      }
      const userMap = userAttempts.get(item.user_id)
      
      if (!userMap.has(item.question_index)) {
        userMap.set(item.question_index, [])
      }
      userMap.get(item.question_index).push(item)
    })

    // Prepare CSV headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionHeaders = (quiz.questions as any[]).map((q: any, index: number) => `Fråga ${index + 1}: ${q.title}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreHeaders = (quiz.questions as any[]).map((q: any, index: number) => `Poäng ${index + 1}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeHeaders = (quiz.questions as any[]).map((q: any, index: number) => `Tid ${index + 1} (sek)`)
    
    const headers = [
      'Elevnamn',
      'Status',
      'Startade',
      'Skickade in',
      'Totalpoäng',
      ...questionHeaders,
      ...scoreHeaders
    ]

    if (allAttempts) {
      headers.push('Försök nr')
    }

    // Include time headers if any time data exists
    const hasTimeData = attemptItems?.some(item => item.time_spent_seconds != null)
    if (hasTimeData) {
      headers.push(...timeHeaders)
    }

    const csvRows = [headers]

    // Generate data rows
    userAttempts.forEach((questionMap, userId) => {
      const displayName = participantMap.get(userId) || 'Okänd elev'
      const progress = progressMap.get(userId)
      
      if (allAttempts) {
        // Show all attempts separately
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxAttempts = Math.max(...Array.from(questionMap.values()).map((attempts: any) => attempts.length))
        
        for (let attemptNo = 1; attemptNo <= maxAttempts; attemptNo++) {
          const row = [
            displayName,
            progress?.status || 'not_started',
            progress?.startedAt ? new Date(progress.startedAt).toLocaleString('sv-SE') : '',
            progress?.submittedAt ? new Date(progress.submittedAt).toLocaleString('sv-SE') : '',
          ]

          // Calculate total score for this attempt
          let totalScore = 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const answers: any[] = []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const scores: any[] = []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const times: any[] = []

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(quiz.questions as any[]).forEach((question: any, qIndex: number) => {
            const attempts = questionMap.get(qIndex) || []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const attempt = attempts.find((a: any) => a.attempt_no === attemptNo)
            
            if (attempt) {
              let answerText = ''
              if (typeof attempt.answer === 'object' && attempt.answer) {
                if (Array.isArray(attempt.answer)) {
                  answerText = attempt.answer.join(', ')
                } else {
                  answerText = JSON.stringify(attempt.answer)
                }
              } else {
                answerText = String(attempt.answer || '')
              }
              
              answers.push(answerText)
              scores.push(attempt.score || 0)
              times.push(attempt.time_spent_seconds || '')
              totalScore += attempt.score || 0
            } else {
              answers.push('')
              scores.push('')
              times.push('')
            }
          })

          row.splice(4, 0, totalScore) // Insert total score
          row.push(...answers, ...scores)
          
          if (allAttempts) {
            row.push(attemptNo)
          }
          
          if (hasTimeData) {
            row.push(...times)
          }

          csvRows.push(row)
        }
      } else {
        // Show best attempt only
        const row = [
          displayName,
          progress?.status || 'not_started',
          progress?.startedAt ? new Date(progress.startedAt).toLocaleString('sv-SE') : '',
          progress?.submittedAt ? new Date(progress.submittedAt).toLocaleString('sv-SE') : '',
        ]

        let totalScore = 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const answers: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scores: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const times: any[] = []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(quiz.questions as any[]).forEach((question: any, qIndex: number) => {
          const attempts = questionMap.get(qIndex) || []
          // Use the latest/best attempt
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bestAttempt = attempts.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0]
          
          if (bestAttempt) {
            let answerText = ''
            if (typeof bestAttempt.answer === 'object' && bestAttempt.answer) {
              if (Array.isArray(bestAttempt.answer)) {
                answerText = bestAttempt.answer.join(', ')
              } else {
                answerText = JSON.stringify(bestAttempt.answer)
              }
            } else {
              answerText = String(bestAttempt.answer || '')
            }
            
            answers.push(answerText)
            scores.push(bestAttempt.score || 0)
            times.push(bestAttempt.time_spent_seconds || '')
            totalScore += bestAttempt.score || 0
          } else {
            answers.push('')
            scores.push('')
            times.push('')
          }
        })

        row.splice(4, 0, totalScore) // Insert total score
        row.push(...answers, ...scores)
        
        if (hasTimeData) {
          row.push(...times)
        }

        csvRows.push(row)
      }
    })

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        const str = String(cell || '')
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    ).join('\n')

    // Set headers for file download
    const filename = `resultat-${(quiz.title as string).replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    
    // Audit: export (org resolution omitted due to type constraints)
    try {
      await logAuditEvent({
        orgId: '00000000-0000-0000-0000-000000000000',
        actorId: user.id,
        action: 'export.session.csv',
        resourceType: 'session',
        resourceId: sessionId,
        metadata: { allAttempts }
      })
    } catch {}

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })

  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid export av resultat' },
      { status: 500 }
    )
  }
}