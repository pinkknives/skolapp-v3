import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Team, PowerUp } from '@/types/team-quiz'

const teamColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const defaultPowerUps: Omit<PowerUp, 'id'>[] = [
  {
    type: 'double_points',
    name: 'Dubbel Poäng',
    description: 'Dubbla poäng för nästa rätta svar',
    cost: 50,
    effect: { type: 'double_points', value: 2, description: 'Dubbla poäng' },
    isActive: false
  },
  {
    type: 'time_boost',
    name: 'Tid Boost',
    description: 'Få extra tid för nästa fråga',
    cost: 30,
    effect: { type: 'time_boost', value: 15, description: '+15 sekunder' },
    isActive: false
  },
  {
    type: 'hint',
    name: 'Ledtråd',
    description: 'Få en ledtråd för nästa fråga',
    cost: 40,
    effect: { type: 'hint', value: 1, description: 'En ledtråd' },
    isActive: false
  },
  {
    type: 'skip_question',
    name: 'Hoppa Över',
    description: 'Hoppa över nästa fråga',
    cost: 60,
    effect: { type: 'skip_question', value: 1, description: 'Hoppa över fråga' },
    isActive: false
  },
  {
    type: 'shield',
    name: 'Sköld',
    description: 'Skydd mot fel svar i 2 frågor',
    cost: 80,
    effect: { type: 'shield', value: 2, description: '2 frågor skydd' },
    duration: 2,
    isActive: false
  }
]

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { name, creatorName } = await request.json()
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing teams to determine color
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('color')
      .eq('session_id', id)

    const usedColors = existingTeams?.map(t => t.color) || []
    const availableColors = teamColors.filter(color => !usedColors.includes(color))
    const teamColor = availableColors[0] || teamColors[Math.floor(Math.random() * teamColors.length)]

    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        session_id: id,
        name,
        color: teamColor,
        score: 0,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    // Create team leader
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamData.id,
        name: creatorName,
        role: 'leader',
        is_online: true,
        joined_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      })
      .select()
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Failed to create team leader' }, { status: 500 })
    }

    // Create default power-ups for the team
    const powerUpsToInsert = defaultPowerUps.map(powerUp => ({
      team_id: teamData.id,
      type: powerUp.type,
      name: powerUp.name,
      description: powerUp.description,
      cost: powerUp.cost,
      effect: powerUp.effect,
      duration: powerUp.duration,
      is_active: false,
      created_at: new Date().toISOString()
    }))

    const { error: powerUpsError } = await supabase
      .from('team_power_ups')
      .insert(powerUpsToInsert)

    if (powerUpsError) {
      console.error('Failed to create power-ups:', powerUpsError)
      // Don't fail the request for power-ups
    }

    // Fetch created power-ups
    const { data: powerUpsData } = await supabase
      .from('team_power_ups')
      .select('*')
      .eq('team_id', teamData.id)

    const team: Team = {
      id: teamData.id,
      name: teamData.name,
      color: teamData.color,
      members: [memberData],
      score: teamData.score,
      powerUps: powerUpsData || [],
      createdAt: new Date(teamData.created_at),
      isActive: teamData.is_active
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
