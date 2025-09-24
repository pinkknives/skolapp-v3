import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { TeamQuizSession, TeamQuizSettings } from '@/types/team-quiz'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch session from database
    const { data: sessionData, error: sessionError } = await supabase
      .from('team_quiz_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('session_id', id)

    if (teamsError) {
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Fetch team members
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .in('team_id', teamsData?.map(t => t.id) || [])

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Fetch power-ups
    const { data: powerUpsData, error: powerUpsError } = await supabase
      .from('team_power_ups')
      .select('*')
      .in('team_id', teamsData?.map(t => t.id) || [])

    if (powerUpsError) {
      return NextResponse.json({ error: 'Failed to fetch power-ups' }, { status: 500 })
    }

    // Combine data
    const teams = teamsData?.map(team => ({
      ...team,
      members: membersData?.filter(m => m.team_id === team.id) || [],
      powerUps: powerUpsData?.filter(p => p.team_id === team.id) || []
    })) || []

    const session: TeamQuizSession = {
      id: sessionData.id,
      quizId: sessionData.quiz_id,
      teams,
      settings: sessionData.settings as TeamQuizSettings,
      currentQuestion: sessionData.current_question,
      status: sessionData.status as 'lobby' | 'active' | 'paused' | 'ended',
      leaderboard: [], // This would be calculated
      powerUpsEnabled: sessionData.power_ups_enabled,
      teamSize: sessionData.team_size,
      createdAt: new Date(sessionData.created_at),
      startedAt: sessionData.started_at ? new Date(sessionData.started_at) : undefined,
      endedAt: sessionData.ended_at ? new Date(sessionData.ended_at) : undefined
    }

    return NextResponse.json({ session, teams })
  } catch (error) {
    console.error('Team quiz session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action } = body
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      case 'start':
        const { error: startError } = await supabase
          .from('team_quiz_sessions')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', id)

        if (startError) {
          return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
        }
        break

      case 'pause':
        const { error: pauseError } = await supabase
          .from('team_quiz_sessions')
          .update({ status: 'paused' })
          .eq('id', id)

        if (pauseError) {
          return NextResponse.json({ error: 'Failed to pause session' }, { status: 500 })
        }
        break

      case 'next':
        const { error: nextError } = await supabase
          .from('team_quiz_sessions')
          .update({ current_question: body.currentQuestion })
          .eq('id', id)

        if (nextError) {
          return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
        }
        break

      case 'end':
        const { error: endError } = await supabase
          .from('team_quiz_sessions')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', id)

        if (endError) {
          return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Team quiz session action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
