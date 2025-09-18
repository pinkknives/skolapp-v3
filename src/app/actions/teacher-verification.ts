'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'

export async function submitTeacherVerificationAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const schoolName = formData.get('schoolName') as string
  const schoolEmail = formData.get('schoolEmail') as string
  const workEmail = formData.get('workEmail') as string
  const teachingSubject = formData.get('teachingSubject') as string
  const yearsTeaching = parseInt(formData.get('yearsTeaching') as string)

  try {
    const supabase = supabaseServer()

    // Insert verification request
    const { error: insertError } = await supabase
      .from('teacher_verification_requests')
      .insert({
        user_id: userId,
        school_name: schoolName,
        school_email: schoolEmail,
        work_email: workEmail,
        teaching_subject: teachingSubject,
        years_teaching: yearsTeaching,
        status: 'pending'
      })

    if (insertError) {
      throw insertError
    }

    // Update profile verification status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'pending',
        school_name: schoolName,
        school_email: schoolEmail,
        verification_requested_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Teacher verification error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit verification request' 
    }
  }
}

export async function getTeacherVerificationStatus(userId: string) {
  try {
    const supabase = supabaseServer()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('verification_status, verification_requested_at, verified_at')
      .eq('user_id', userId)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      status: profile?.verification_status || null,
      requestedAt: profile?.verification_requested_at,
      verifiedAt: profile?.verified_at
    }
  } catch (error) {
    console.error('Get verification status error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get verification status',
      status: null
    }
  }
}