import { supabaseBrowser } from '@/lib/supabase-browser'
import type { PostgrestError } from '@supabase/supabase-js'
import type { BillingStatus, Entitlements } from '@/types/billing'

export interface Organization {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
  billing_status: BillingStatus
  entitlements: Entitlements
  stripe_customer_id?: string
  stripe_sub_id?: string
}

export interface OrganizationMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'teacher'
  status: 'active' | 'pending' | 'inactive'
  joined_at: string
  user?: {
    email?: string
    user_metadata?: {
      first_name?: string
      last_name?: string
    }
  }
}

export interface OrganizationInvite {
  id: string
  org_id: string
  email: string
  token: string
  role: 'admin' | 'teacher'
  invited_by: string
  expires_at: string
  created_at: string
}

/**
 * Create a new organization and set the creator as owner
 */
export async function createOrg(name: string): Promise<{ data: Organization | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Create organization
    const { data, error } = await supabase
      .from('orgs')
      .insert({
        name,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

/**
 * Get organizations for the current user
 */
export async function getUserOrganizations(): Promise<{ data: Organization[] | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Get user's organizations through membership
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        org:org_id (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })

    if (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
    }

    // Extract organizations from membership records
    const organizations = (data?.map(member => member.org).filter(Boolean) || []) as unknown as Organization[]
    return { data: organizations, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Get organizations where the user can create quizzes (teacher, admin, or owner)
 */
export async function getUserCreatableOrganizations(): Promise<{ data: Organization[] | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Get user's organizations where they can create quizzes
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        org:org_id (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('role', ['owner', 'admin', 'teacher'])
      .order('joined_at', { ascending: false })

    if (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
    }

    // Extract organizations from membership records
    const organizations = (data?.map(member => member.org).filter(Boolean) || []) as unknown as Organization[]
    return { data: organizations, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(orgId: string): Promise<{ data: OrganizationMember[] | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        *,
        user:user_id (
          email,
          user_metadata
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true })

    return { data, error }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Get current user's organization membership
 */
export async function getCurrentUserOrganization(): Promise<{ data: { org: Organization; membership: OrganizationMember } | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Get user's active organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select(`
        *,
        org:org_id (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError) {
      return { data: null, error: membershipError }
    }

    if (!membership || !membership.org) {
      return { data: null, error: new Error('Ingen organisation hittad') }
    }

    return { 
      data: { 
        org: membership.org as Organization, 
        membership: membership as OrganizationMember 
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Update organization member role
 */
export async function updateMemberRole(memberId: string, newRole: 'admin' | 'teacher'): Promise<{ error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    const { error } = await supabase
      .from('org_members')
      .update({ role: newRole })
      .eq('id', memberId)

    return { error }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

/**
 * Remove organization member
 */
export async function removeMember(memberId: string): Promise<{ error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    const { error } = await supabase
      .from('org_members')
      .update({ status: 'inactive' })
      .eq('id', memberId)

    return { error }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

/**
 * Invite user to organization
 */
export async function inviteToOrganization(orgId: string, email: string, role: 'admin' | 'teacher' = 'teacher'): Promise<{ data: OrganizationInvite | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Generate unique invite token
    const token = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('org_invites')
      .insert({
        org_id: orgId,
        email,
        token,
        role,
        invited_by: user.id
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Get organization invites
 */
export async function getOrganizationInvites(orgId: string): Promise<{ data: OrganizationInvite[] | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    const { data, error } = await supabase
      .from('org_invites')
      .select('*')
      .eq('org_id', orgId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    return { data, error }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Cancel organization invite
 */
export async function cancelInvite(inviteId: string): Promise<{ error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    const { error } = await supabase
      .from('org_invites')
      .delete()
      .eq('id', inviteId)

    return { error }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

/**
 * Accept an organization invitation using token
 */
export async function acceptInvitation(token: string): Promise<{ data: { org_id: string; role: string } | null; error: PostgrestError | Error | null }> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: userError || new Error('Användare inte inloggad') }
    }

    // Find the invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('org_invites')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invite) {
      return { data: null, error: new Error('Ogiltig eller utgången inbjudan') }
    }

    // Check if user is already a member of this organization
    const { data: existingMember } = await supabase
      .from('org_members')
      .select('*')
      .eq('org_id', invite.org_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { data: null, error: new Error('Du är redan medlem i denna organisation') }
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
      return { data: null, error: memberError }
    }

    // Mark the invite as used by deleting it
    await supabase
      .from('org_invites')
      .delete()
      .eq('id', invite.id)

    return { 
      data: { 
        org_id: invite.org_id, 
        role: invite.role 
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Check if user can manage organization (owner or admin)
 */
export async function canManageOrganization(orgId: string): Promise<boolean> {
  const supabase = supabaseBrowser()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return false
    }

    return data.role === 'owner' || data.role === 'admin'
  } catch {
    return false
  }
}