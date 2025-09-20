import { getAbly } from '@/lib/ablyClient'

// Type definitions for real-time messages
export type ControlMsg =
  | { name: 'start'; data?: { at: number } }
  | { name: 'next'; data: { questionId: string } }
  | { name: 'end'; data?: Record<string, unknown> }

export type AnswerMsg = { 
  questionId: string
  answer: string
  timestamp: number
}

export type PresenceData = {
  role: 'teacher' | 'student'
  name: string
  joinedAt: number
}

// Teacher actions
export async function startQuiz(quizId: string, clientId = 'teacher-1') {
  const ably = getAbly(clientId, 'teacher')
  const ch = ably.channels.get(`quiz:${quizId}:control`)
  await ch.publish('start', { at: Date.now() })
}

export async function nextQuestion(quizId: string, questionId: string, clientId = 'teacher-1') {
  const ably = getAbly(clientId, 'teacher')
  const ch = ably.channels.get(`quiz:${quizId}:control`)
  await ch.publish('next', { questionId })
}

export async function endQuiz(quizId: string, clientId = 'teacher-1') {
  const ably = getAbly(clientId, 'teacher')
  const ch = ably.channels.get(`quiz:${quizId}:control`)
  await ch.publish('end', {})
}

// Student actions
export async function submitAnswer(quizId: string, payload: AnswerMsg, clientId = 'student-1') {
  const ably = getAbly(clientId, 'student')
  const ch = ably.channels.get(`quiz:${quizId}:answers`)
  await ch.publish('answer', payload)
}

// Presence management
export async function joinRoom(
  quizId: string, 
  role: 'teacher' | 'student', 
  name: string,
  clientId?: string
) {
  const ably = getAbly(clientId || name, role)
  const room = ably.channels.get(`quiz:${quizId}:room`)
  await room.presence.enter({ 
    role, 
    name, 
    joinedAt: Date.now() 
  } as PresenceData)
}

export async function leaveRoom(
  quizId: string, 
  role: 'teacher' | 'student', 
  name: string,
  clientId?: string
) {
  const ably = getAbly(clientId || name, role)
  const room = ably.channels.get(`quiz:${quizId}:room`)
  await room.presence.leave()
}