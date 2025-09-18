import { supabaseServer } from './supabase-server'

export type Profile = {
  user_id: string
  role: 'teacher' | 'student'
  display_name: string | null
  created_at: string
}

// Map between Supabase roles and Swedish UI roles
export const ROLE_MAPPING = {
  teacher: 'lärare' as const,
  student: 'elev' as const,
  lärare: 'teacher' as const,
  elev: 'student' as const
} as const

export type UserWithProfile = {
  id: string
  email: string
  profile: Profile | null
}

/**
 * Get the current authenticated user from server context
 */
export async function getCurrentUser(): Promise<UserWithProfile | null> {
  try {
    const supabase = supabaseServer()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error fetching profile:', profileError)
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      profile: profile || null
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Require teacher role - throws if user is not authenticated or not a teacher
 */
export async function requireTeacher(): Promise<UserWithProfile> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  if (!user.profile || user.profile.role !== 'teacher') {
    throw new Error('Teacher access required')
  }
  
  return user
}

/**
 * Create or update user profile
 */
export async function upsertProfile(userId: string, data: Partial<Omit<Profile, 'user_id' | 'created_at'>>): Promise<Profile> {
  const supabase = supabaseServer()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...data
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to upsert profile: ${error.message}`)
  }
  
  return profile
}