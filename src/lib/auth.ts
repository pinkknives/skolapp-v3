import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { SupabaseAdapter } from '@auth/supabase-adapter'

const adapter = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXTAUTH_SECRET
  ? SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      secret: process.env.NEXTAUTH_SECRET,
    })
  : undefined

export const authOptions: NextAuthOptions = {
  // Adapter is optional in local builds without env; NextAuth will still start
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dev-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dev-google-client-secret',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || 'dev-azure-client-id',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || 'dev-azure-client-secret',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common'
    })
  ],
  callbacks: {
    async signIn({ user: _user, account, profile: _profile }) {
      // Allow Google sign-ins
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        return true
      }
      return false
    },
    async session({ session, user }) {
      // Send properties to the client
      if (session?.user) {
        session.user.id = user.id
        session.user.role = (user as { role?: string }).role || 'student'
        session.user.schoolId = (user as { schoolId?: string }).schoolId
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.role = (user as { role?: string })?.role || 'student'
        token.schoolId = (user as { schoolId?: string })?.schoolId
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      schoolId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    role?: string
    schoolId?: string
  }
}

// User types
export interface UserWithProfile {
  id: string
  email: string
  name: string
  role: string
  profile: {
    role: string
    schoolId?: string
    display_name?: string
    verification_status?: 'pending' | 'verified' | 'rejected'
    created_at?: string
  }
}

// Server-side auth functions
export async function getCurrentUser() {
  // This would be implemented with NextAuth.js server-side session
  // For now, return a mock user
  return {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'teacher',
    profile: {
      role: 'teacher',
      schoolId: 'mock-school-id'
    }
  }
}

export async function requireTeacher() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'teacher') {
    throw new Error('Teacher access required')
  }
  return user
}

export async function upsertProfile(userId: string, profile: unknown) {
  // This would be implemented with Supabase
  // For now, return a mock success
  return { success: true, profile }
}