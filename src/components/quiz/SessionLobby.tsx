'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { QuizSession, SessionParticipant, Quiz } from '@/types/quiz'
import { updateSessionStatusAction } from '@/app/actions/sessions'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Users, Play, Square, Clock, Copy, UserCheck, UserX } from 'lucide-react'
import { SyncQuizControls } from './SyncQuizControls'
import QRCode from 'qrcode'

interface SessionLobbyProps {
  session: QuizSession & { participants: SessionParticipant[] }
  quizTitle: string
  quiz?: Quiz // Add quiz prop for sync mode
  onSessionUpdate?: (session: QuizSession) => void
}

export function SessionLobby({ session, quizTitle, quiz, onSessionUpdate }: SessionLobbyProps) {
  const [participants, setParticipants] = useState<SessionParticipant[]>(session.participants)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  const joinUrl = `${window.location.origin}/quiz/join/${session.code}`

  // Generate QR code for the session
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(joinUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#0F172A', // Tailwind slate-900
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(url)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [joinUrl])

  // Real-time subscription to participant updates
  useEffect(() => {
    const supabase = supabaseBrowser()

    const channel = supabase
      .channel('session-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('Participant update:', payload)
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newParticipant: SessionParticipant = {
              id: payload.new.id,
              sessionId: payload.new.session_id,
              studentId: payload.new.student_id,
              displayName: payload.new.display_name,
              joinedAt: new Date(payload.new.joined_at),
              status: payload.new.status,
              lastSeen: new Date(payload.new.last_seen)
            }
            setParticipants(prev => [...prev, newParticipant])
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedParticipant: SessionParticipant = {
              id: payload.new.id,
              sessionId: payload.new.session_id,
              studentId: payload.new.student_id,
              displayName: payload.new.display_name,
              joinedAt: new Date(payload.new.joined_at),
              status: payload.new.status,
              lastSeen: new Date(payload.new.last_seen)
            }
            setParticipants(prev => 
              prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
            )
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id])

  const handleStartSession = async () => {
    setIsStarting(true)
    
    try {
      const formData = new FormData()
      formData.append('sessionId', session.id)
      formData.append('status', 'live')
      
      const result = await updateSessionStatusAction(formData)
      
      if (result.success && result.session) {
        onSessionUpdate?.(result.session)
      } else {
        console.error('Failed to start session:', result.error)
      }
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndSession = async () => {
    setIsEnding(true)
    
    try {
      const formData = new FormData()
      formData.append('sessionId', session.id)
      formData.append('status', 'ended')
      
      const result = await updateSessionStatusAction(formData)
      
      if (result.success && result.session) {
        onSessionUpdate?.(result.session)
      } else {
        console.error('Failed to end session:', result.error)
      }
    } catch (error) {
      console.error('Error ending session:', error)
    } finally {
      setIsEnding(false)
    }
  }

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(session.code)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const copyJoinUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const getParticipantStatusIcon = (status: string) => {
    switch (status) {
      case 'joined':
        return <UserCheck className="w-4 h-4 text-success-600" />
      case 'active':
        return <Users className="w-4 h-4 text-primary-600" />
      case 'finished':
        return <UserCheck className="w-4 h-4 text-neutral-500" />
      case 'disconnected':
        return <UserX className="w-4 h-4 text-error-600" />
      default:
        return <Users className="w-4 h-4 text-neutral-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Session: {quizTitle}
              </CardTitle>
              <Typography variant="body2" className="text-neutral-600 mt-1">
                Status: {session.status === 'lobby' ? 'Väntar på deltagare' : 
                         session.status === 'live' ? 'Pågående' : 'Avslutad'}
                {session.mode === 'sync' && ` • Live-läge`}
              </Typography>
            </div>
            
            <div className="flex items-center gap-2">
              {session.status === 'lobby' && (
                <Button
                  onClick={handleStartSession}
                  disabled={participants.length === 0 || isStarting}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isStarting ? 'Startar...' : session.mode === 'sync' ? 'Starta Live-Quiz' : 'Starta Quiz'}
                </Button>
              )}
              
              {session.status === 'live' && session.mode !== 'sync' && (
                <Button
                  variant="outline"
                  onClick={handleEndSession}
                  disabled={isEnding}
                  className="gap-2"
                >
                  <Square className="w-4 h-4" />
                  {isEnding ? 'Avslutar...' : 'Avsluta Quiz'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sync Quiz Controls - shown when session is live and in sync mode */}
      {session.status === 'live' && session.mode === 'sync' && quiz && (
        <SyncQuizControls 
          session={session}
          quiz={quiz}
          onSessionUpdate={onSessionUpdate}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Join Information */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anslutningsinformation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Join Code */}
              <div>
                <Typography variant="body2" className="font-medium mb-2">
                  Sessionskod
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-2xl bg-neutral-100 px-3 py-2 rounded-md flex-1 text-center">
                    {session.code}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyJoinCode}
                    className={copySuccess ? 'bg-success-100' : ''}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    QR-kod
                  </Typography>
                  <div className="text-center">
                    <Image
                      src={qrCodeUrl}
                      alt="QR kod för att gå med i sessionen"
                      width={200}
                      height={200}
                      sizes="200px"
                      className="mx-auto rounded-md border"
                    />
                    <Typography variant="caption" className="text-neutral-600 mt-2 block">
                      Låt eleverna skanna denna kod
                    </Typography>
                  </div>
                </div>
              )}

              {/* Join URL */}
              <div>
                <Typography variant="body2" className="font-medium mb-2">
                  Direktlänk
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="text-xs bg-neutral-100 px-2 py-1 rounded-md flex-1 truncate">
                    {joinUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyJoinUrl}
                    className={copySuccess ? 'bg-success-100' : ''}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {copySuccess && (
                <Typography variant="caption" className="text-success-600">
                  Kopierat till urklipp!
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Deltagare ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <Typography variant="body1" className="text-neutral-600">
                    Väntar på att elever ska gå med...
                  </Typography>
                  <Typography variant="body2" className="text-neutral-500 mt-2">
                    Dela koden <strong>{session.code}</strong> eller låt eleverna skanna QR-koden
                  </Typography>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        {getParticipantStatusIcon(participant.status)}
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {participant.displayName}
                          </Typography>
                          <Typography variant="caption" className="text-neutral-600">
                            Gick med {participant.joinedAt.toLocaleTimeString('sv-SE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Typography variant="caption" className="text-neutral-500">
                          {participant.studentId ? 'Inloggad' : 'Gäst'}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}