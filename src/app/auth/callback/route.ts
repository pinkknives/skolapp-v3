import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions, type CookieMethodsServerDeprecated } from '@supabase/ssr'
import { upsertProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const isSignup = requestUrl.searchParams.get('signup') === 'true'
  const displayName = requestUrl.searchParams.get('display_name')
  const callbackUrl = requestUrl.searchParams.get('callbackUrl')

  if (code) {
    const cookieStore = await cookies()

    // Bridge Next.js cookies API to Supabase SSR (deprecated) methods for compatibility
    const cookieMethods: CookieMethodsServerDeprecated = {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...(options || {}) })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...(options || {}), maxAge: 0 })
      },
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieMethods,
      }
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

  const redirectTo = callbackUrl
    ? callbackUrl
    : isSignup
      ? '/teacher/quiz/create?onboarding=true'
      : '/teacher?login=true'

  return NextResponse.redirect(new URL(redirectTo, request.url))
}