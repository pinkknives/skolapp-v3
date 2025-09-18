'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { type User, type AuthState, type LoginCredentials, type RegisterData, type GuestSession, type UserRole } from '@/types/auth'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Session } from '@supabase/supabase-js'

// Storage keys
const GUEST_STORAGE_KEY = 'skolapp_guest'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loginAsGuest: (nickname?: string) => GuestSession
  getCurrentGuestSession: () => GuestSession | null
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Helper function to convert Supabase user to app User type
function convertSupabaseUser(session: Session, profile: Record<string, any> | null): User {
  // Map database role to UI role
  let role: UserRole = 'lärare' // default
  if (profile?.role) {
    if (profile.role === 'teacher') role = 'lärare'
    else if (profile.role === 'student') role = 'elev'
  }
  
  return {
    id: session.user.id,
    email: session.user.email!,
    firstName: profile?.display_name?.split(' ')[0] || 'Användare',
    lastName: profile?.display_name?.split(' ').slice(1).join(' ') || '',
    role,
    subscriptionPlan: 'gratis', // Default subscription
    dataRetentionMode: 'korttid', // Default retention mode
    createdAt: new Date(session.user.created_at!),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from Supabase
  useEffect(() => {
    const supabase = supabaseBrowser()

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          const user = convertSupabaseUser(session, profile)
          dispatch({ type: 'SET_USER', payload: user })
        } catch {
          // Profile not found, create with defaults
          const user = convertSupabaseUser(session, null)
          dispatch({ type: 'SET_USER', payload: user })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          const user = convertSupabaseUser(session, profile)
          dispatch({ type: 'SET_USER', payload: user })
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_USER', payload: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // For now, we'll redirect to the login page for magic link auth
      // This function is kept for compatibility but should redirect to /login
      window.location.href = '/login'
      
      return { success: false, error: 'Redirecting to login page...' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // For now, redirect to login page for registration too
      // Magic link auth doesn't require separate registration
      window.location.href = '/login'
      
      return { success: false, error: 'Redirecting to login page...' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
      dispatch({ type: 'SET_USER', payload: null })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const loginAsGuest = (nickname?: string): GuestSession => {
    const session: GuestSession = {
      id: `guest_${Date.now()}`,
      nickname: nickname || `Gäst ${Math.floor(Math.random() * 1000)}`,
      joinedQuizId: '', // Required field, empty string for new sessions
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
    }

    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session))
    return session
  }

  const getCurrentGuestSession = (): GuestSession | null => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (!stored) return null
      
      const session = JSON.parse(stored) as GuestSession
      if (new Date() > new Date(session.expiresAt)) {
        localStorage.removeItem(GUEST_STORAGE_KEY)
        return null
      }
      
      return session
    } catch {
      return null
    }
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    loginAsGuest,
    getCurrentGuestSession,
    updateUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}