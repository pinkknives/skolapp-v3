import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  
  if (!token) {
    const errorUrl = new URL('/invite', request.nextUrl.origin)
    errorUrl.searchParams.set('error', 'Token saknas')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = supabaseBrowser()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      const errorUrl = new URL('/invite', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'Du måste vara inloggad för att acceptera en inbjudan')
      return NextResponse.redirect(errorUrl)
    }

    // Find the invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('org_invites')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invite) {
      const errorUrl = new URL('/invite', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'Ogiltig eller utgången inbjudan')
      return NextResponse.redirect(errorUrl)
    }

    // Check if user is already a member of this organization
    const { data: existingMember } = await supabase
      .from('org_members')
      .select('*')
      .eq('org_id', invite.org_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      const errorUrl = new URL('/invite', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'Du är redan medlem i denna organisation')
      return NextResponse.redirect(errorUrl)
    }

    // Create the organization membership
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({
        org_id: invite.org_id,
        user_id: user.id,
        role: invite.role,
        status: 'active'
      })

    if (memberError) {
      const errorUrl = new URL('/invite', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'Kunde inte skapa medlemskap: ' + memberError.message)
      return NextResponse.redirect(errorUrl)
    }

    // Mark the invite as used by deleting it
    await supabase
      .from('org_invites')
      .delete()
      .eq('id', invite.id)

    // Get organization details for response
    const { data: org } = await supabase
      .from('orgs')
      .select('name')
      .eq('id', invite.org_id)
      .single()

    // Redirect to success page with query parameters
    const successUrl = new URL('/invite', request.nextUrl.origin)
    successUrl.searchParams.set('success', 'true')
    successUrl.searchParams.set('message', `Du har blivit medlem i ${org?.name || 'organisationen'} som ${invite.role === 'admin' ? 'administratör' : 'lärare'}`)
    successUrl.searchParams.set('org_name', org?.name || '')
    
    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('Error accepting invite:', error)
    const errorUrl = new URL('/invite', request.nextUrl.origin)
    errorUrl.searchParams.set('error', 'Ett oväntat fel inträffade')
    return NextResponse.redirect(errorUrl)
  }
}