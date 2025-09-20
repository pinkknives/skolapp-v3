import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { upsertProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const isSignup = requestUrl.searchParams.get('signup') === 'true'
  const displayName = requestUrl.searchParams.get('display_name')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create or update profile for the user
      try {
        const profileData = {
          role: 'teacher' as const, // Default to teacher as specified
          display_name: displayName || data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Användare'
        }

        await upsertProfile(data.user.id, profileData)
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue anyway - profile creation is not critical for login
      }
    }
  }

  // Redirect to the main app or teacher portal for new signups
  if (isSignup) {
    redirect('/teacher')
  } else {
    redirect('/')
  }
}