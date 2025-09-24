'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAbly } from '@/lib/ablyClient'

interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected?: Date
  reconnectAttempts: number
  error?: string
}

interface PresenceData {
  role: 'teacher' | 'student'
  name: string
  joinedAt: number
  isActive?: boolean
}

interface UseImprovedAblyOptions {
  quizId: string
  role: 'teacher' | 'student'
  name: string
  clientId?: string
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  onConnectionChange?: (state: ConnectionState) => void
  onPresenceUpdate?: (members: Array<{ clientId: string; data: PresenceData }>) => void
  onError?: (error: string) => void
}

interface UseImprovedAblyReturn {
  connectionState: ConnectionState
  participants: Array<{ clientId: string; data: PresenceData }>
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
  reconnect: () => void
  joinRoom: () => Promise<void>
  leaveRoom: () => Promise<void>
  publishMessage: (channel: string, event: string, data: unknown) => Promise<void>
  subscribeToChannel: (channel: string, event: string, callback: (data: unknown) => void) => void
}

export function useImprovedAbly({
  quizId,
  role,
  name,
  clientId,
  autoReconnect = true,
  maxReconnectAttempts = 5,
  onConnectionChange,
  onPresenceUpdate,
  onError
}: UseImprovedAblyOptions): UseImprovedAblyReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'connecting',
    reconnectAttempts: 0
  })
  const [participants, setParticipants] = useState<Array<{ clientId: string; data: PresenceData }>>([])
  
  const ablyRef = useRef<unknown>(null)
  const channelsRef = useRef<Map<string, unknown>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isJoiningRef = useRef(false)

  const updateConnectionState = useCallback((newState: Partial<ConnectionState>) => {
    setConnectionState(prev => {
      const updated = { ...prev, ...newState }
      onConnectionChange?.(updated)
      return updated
    })
  }, [onConnectionChange])

  const handleConnectionStateChange = useCallback((state: string) => {
    console.log('Ably connection state changed:', state)
    
    switch (state) {
      case 'connected':
        updateConnectionState({
          status: 'connected',
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined
        })
        break
      case 'connecting':
        updateConnectionState({ status: 'connecting' })
        break
      case 'disconnected':
        updateConnectionState({ status: 'disconnected' })
        break
      case 'failed':
        updateConnectionState({ 
          status: 'error',
          error: 'Anslutning misslyckades'
        })
        onError?.('Anslutning misslyckades')
        break
      case 'suspended':
        updateConnectionState({ 
          status: 'error',
          error: 'Anslutning avbruten'
        })
        onError?.('Anslutning avbruten')
        break
    }
  }, [updateConnectionState, onError])

  const handlePresenceUpdate = useCallback(async () => {
    if (!ablyRef.current) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roomChannel = (channelsRef.current as any).get(`quiz:${quizId}:room`)
      if (!roomChannel) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const members = await (roomChannel as any).presence.get()
      const presenceData = members.map((member: { clientId: string; data: unknown }) => ({
        clientId: member.clientId,
        data: member.data as PresenceData
      }))
      
      setParticipants(presenceData)
      onPresenceUpdate?.(presenceData)
    } catch (error) {
      console.error('Error fetching presence:', error)
    }
  }, [quizId, onPresenceUpdate])

  const initializeAblyRef = useRef<() => Promise<void>>()

  const reconnect = useCallback((): void => {
    if (connectionState.reconnectAttempts >= maxReconnectAttempts) {
      updateConnectionState({
        status: 'error',
        error: `Max antal återanslutningsförsök (${maxReconnectAttempts}) nådda`
      })
      onError?.('Kunde inte återansluta efter flera försök')
      return
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
      status: 'connecting'
    }))

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, connectionState.reconnectAttempts), 30000)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      initializeAblyRef.current?.()
    }, delay)
  }, [connectionState.reconnectAttempts, maxReconnectAttempts, updateConnectionState, onError])

  const initializeAbly = useCallback(async () => {
    try {
      if (ablyRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ablyRef.current as any).close()
      }

      const ably = getAbly(clientId, role)
      ablyRef.current = ably as unknown

      // Set up connection state listener
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ably as any).connection.on('statechange', ({ current }: { current: string }) => {
        handleConnectionStateChange(current)
      })

      // Set up channels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controlChannel: any = (ably as any).channels.get(`quiz:${quizId}:control`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roomChannel: any = (ably as any).channels.get(`quiz:${quizId}:room`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const answersChannel: any = (ably as any).channels.get(`quiz:${quizId}:answers`)

      // Store channels in ref
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(channelsRef.current as any).set(`quiz:${quizId}:control`, controlChannel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(channelsRef.current as any).set(`quiz:${quizId}:room`, roomChannel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(channelsRef.current as any).set(`quiz:${quizId}:answers`, answersChannel)

      // Set up presence listeners
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (roomChannel as any).presence.subscribe('enter', () => {
        handlePresenceUpdate()
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (roomChannel as any).presence.subscribe('leave', () => {
        handlePresenceUpdate()
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (roomChannel as any).presence.subscribe('update', () => {
        handlePresenceUpdate()
      })

      // Auto-reconnect on connection loss
      if (autoReconnect) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ably as any).connection.on('disconnected', () => {
          if (connectionState.status !== 'error') {
            reconnect()
          }
        })
      }

    } catch (error) {
      console.error('Error initializing Ably:', error)
      updateConnectionState({
        status: 'error',
        error: 'Kunde inte initiera anslutning'
      })
      onError?.('Kunde inte initiera anslutning')
    }
  }, [quizId, role, clientId, autoReconnect, handleConnectionStateChange, handlePresenceUpdate, reconnect, connectionState.status, updateConnectionState, onError])

  // Store the function in ref
  initializeAblyRef.current = initializeAbly

  const joinRoom = useCallback(async () => {
    if (!ablyRef.current || isJoiningRef.current) return

    try {
      isJoiningRef.current = true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roomChannel = (channelsRef.current as any).get(`quiz:${quizId}:room`)
      
      if (!roomChannel) {
        throw new Error('Room channel not available')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (roomChannel as any).presence.enter({
        role,
        name,
        joinedAt: Date.now(),
        isActive: true
      } as PresenceData)

      await handlePresenceUpdate()
      
    } catch (error) {
      console.error('Error joining room:', error)
      onError?.('Kunde inte gå med i rummet')
    } finally {
      isJoiningRef.current = false
    }
  }, [quizId, role, name, handlePresenceUpdate, onError])

  const leaveRoom = useCallback(async () => {
    if (!ablyRef.current) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roomChannel = (channelsRef.current as any).get(`quiz:${quizId}:room`)
      
      if (roomChannel) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (roomChannel as any).presence.leave()
      }
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }, [quizId])

  const publishMessage = useCallback(async (channelName: string, event: string, data: unknown) => {
    if (!ablyRef.current) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (channelsRef.current as any).get(channelName)
      if (!channel) {
        throw new Error(`Channel ${channelName} not found`)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (channel as any).publish(event, data)
    } catch (error) {
      console.error('Error publishing message:', error)
      onError?.('Kunde inte skicka meddelande')
    }
  }, [onError])

  const subscribeToChannel = useCallback((channelName: string, event: string, callback: (data: unknown) => void) => {
    if (!ablyRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (channelsRef.current as any).get(channelName)
    if (!channel) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channel as any).subscribe(event, callback)
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeAbly()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ablyRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ablyRef.current as any).close()
      }
    }
  }, [initializeAbly])

  // Auto-reconnect on error
  useEffect(() => {
    if (connectionState.status === 'error' && autoReconnect) {
      const timer = setTimeout(() => {
        reconnect()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [connectionState.status, autoReconnect, reconnect])

  return {
    connectionState,
    participants,
    isConnected: connectionState.status === 'connected',
    isConnecting: connectionState.status === 'connecting',
    hasError: connectionState.status === 'error',
    reconnect,
    joinRoom,
    leaveRoom,
    publishMessage,
    subscribeToChannel
  }
}
