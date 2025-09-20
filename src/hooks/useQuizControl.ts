import { useEffect, useState } from 'react'
import { getAbly } from '@/lib/ablyClient'
import type { ControlMsg, PresenceData } from '@/lib/realtime/quiz'

type QuizState = { 
  phase: 'idle' | 'running' | 'ended'
  questionId?: string
  timestamp?: number
}

type PresenceMember = {
  clientId: string
  data: PresenceData
}

export function useQuizControl(quizId: string, role?: 'teacher' | 'student') {
  const [state, setState] = useState<QuizState>({ phase: 'idle' })
  const [participants, setParticipants] = useState<PresenceMember[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!quizId) return

    const ably = getAbly(undefined, role)
    const controlChannel = ably.channels.get(`quiz:${quizId}:control`)
    const roomChannel = ably.channels.get(`quiz:${quizId}:room`)

    // Listen for control messages
    const handleControlMessage = (msg: { name?: string; data?: unknown }) => {
      if (!msg.name) return
      
      const controlMsg = { name: msg.name, data: msg.data } as ControlMsg
      
      if (controlMsg.name === 'start') {
        setState({ 
          phase: 'running', 
          timestamp: controlMsg.data?.at 
        })
      } else if (controlMsg.name === 'next') {
        setState(prev => ({ 
          ...prev,
          phase: 'running', 
          questionId: controlMsg.data?.questionId 
        }))
      } else if (controlMsg.name === 'end') {
        setState({ phase: 'ended' })
      }
    }

    // Listen for presence changes
    const handlePresenceUpdate = async () => {
      try {
        const members = await roomChannel.presence.get()
        setParticipants(members.map((member: { clientId: string; data: unknown }) => ({
          clientId: member.clientId,
          data: member.data as PresenceData
        })))
      } catch (error) {
        console.error('Error fetching presence:', error)
      }
    }

    // Connection state
    const handleConnectionChange = () => {
      setIsConnected(ably.connection.state === 'connected')
    }

    // Subscribe to events
    const setupSubscriptions = async () => {
      try {
        await controlChannel.subscribe(handleControlMessage)
        await roomChannel.presence.subscribe(handlePresenceUpdate)
        
        // Initial presence fetch
        await handlePresenceUpdate()
      } catch (error) {
        console.error('Error setting up subscriptions:', error)
      }
    }

    setupSubscriptions()

    ably.connection.on('connected', handleConnectionChange)
    ably.connection.on('disconnected', handleConnectionChange)

    // Initial connection state
    handleConnectionChange()

    return () => {
      controlChannel.unsubscribe(handleControlMessage)
      roomChannel.presence.unsubscribe(handlePresenceUpdate)
      ably.connection.off('connected', handleConnectionChange)
      ably.connection.off('disconnected', handleConnectionChange)
      controlChannel.detach()
      roomChannel.detach()
    }
  }, [quizId, role])

  return {
    state,
    participants,
    isConnected,
    participantCount: participants.length,
    teacherCount: participants.filter(p => p.data.role === 'teacher').length,
    studentCount: participants.filter(p => p.data.role === 'student').length
  }
}