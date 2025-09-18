'use server'

import { revalidatePath } from 'next/cache'
import { upsertProfile } from '@/lib/auth'

export async function createOrUpdateProfile(formData: FormData) {
  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'teacher' | 'student'
  const displayName = formData.get('displayName') as string

  try {
    await upsertProfile(userId, {
      role,
      display_name: displayName
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Profile creation error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create profile' 
    }
  }
}

export async function updateProfileAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'teacher' | 'student'
  const displayName = formData.get('displayName') as string

  try {
    await upsertProfile(userId, {
      role,
      display_name: displayName
    })

    revalidatePath('/profile')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}