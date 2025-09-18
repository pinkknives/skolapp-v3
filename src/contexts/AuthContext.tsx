'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { type User, type AuthState, type LoginCredentials, type RegisterData, type GuestSession } from '@/types/auth'

// Mock storage for development - in production this would use real API calls
const AUTH_STORAGE_KEY = 'skolapp_auth'
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

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'larare@skolapp.se',
    firstName: 'Anna',
    lastName: 'Andersson',
    role: 'lärare',
    subscriptionPlan: 'premium',
    dataRetentionMode: 'långtid',
    schoolAccountId: 'school_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2', 
    email: 'elev@skolapp.se',
    firstName: 'Erik',
    lastName: 'Eriksson',
    role: 'elev',
    subscriptionPlan: 'premium',
    dataRetentionMode: 'långtid',
    isMinor: true,
    hasParentalConsent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from storage
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      if (storedAuth) {
        const user = JSON.parse(storedAuth) as User
        dispatch({ type: 'SET_USER', payload: user })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Mock login - in production this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay

      const user = MOCK_USERS.find(u => u.email === credentials.email)
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'E-postadress eller lösenord är felaktigt' })
        return { success: false, error: 'E-postadress eller lösenord är felaktigt' }
      }

      // Mock password validation (in production, this would be done securely on the server)
      if (credentials.password !== 'password') {
        dispatch({ type: 'SET_ERROR', payload: 'E-postadress eller lösenord är felaktigt' })
        return { success: false, error: 'E-postadress eller lösenord är felaktigt' }
      }

      const userWithLogin = { 
        ...user, 
        lastLoginAt: new Date() 
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithLogin))
      dispatch({ type: 'SET_USER', payload: userWithLogin })
      
      return { success: true }
    } catch {
      const errorMessage = 'Ett fel uppstod vid inloggning. Försök igen.'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Mock registration - in production this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay

      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === data.email)) {
        dispatch({ type: 'SET_ERROR', payload: 'En användare med denna e-postadress finns redan' })
        return { success: false, error: 'En användare med denna e-postadress finns redan' }
      }

      const newUser: User = {
        id: String(Date.now()),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        subscriptionPlan: data.subscriptionPlan || (data.role === 'lärare' ? 'gratis' : 'premium'),
        dataRetentionMode: data.dataRetentionMode || 'korttid',
        schoolAccountId: data.schoolAccountId,
        isMinor: data.dateOfBirth ? calculateAge(data.dateOfBirth) < 18 : undefined,
        hasParentalConsent: data.hasParentalConsent,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add to mock storage
      MOCK_USERS.push(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      dispatch({ type: 'SET_USER', payload: newUser })
      
      return { success: true }
    } catch {
      const errorMessage = 'Ett fel uppstod vid registrering. Försök igen.'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    dispatch({ type: 'SET_USER', payload: null })
  }

  const loginAsGuest = (nickname?: string): GuestSession => {
    const guestSession: GuestSession = {
      id: String(Date.now()),
      nickname,
      joinedQuizId: '', // Will be set when joining a quiz
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    }
    
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestSession))
    return guestSession
  }

  const getCurrentGuestSession = (): GuestSession | null => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (!stored) return null
      
      const session = JSON.parse(stored) as GuestSession
      
      // Check if session has expired
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(GUEST_STORAGE_KEY)
        return null
      }
      
      return session
    } catch {
      return null
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates, updatedAt: new Date() }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      dispatch({ type: 'UPDATE_USER', payload: updates })
    }
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

// Helper function for age calculation
function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}