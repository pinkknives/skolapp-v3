#!/usr/bin/env node

/**
 * GDPR Data Retention Job
 * 
 * This script handles:
 * 1. Expiring guardian consents that have passed their expiry date
 * 2. Cleaning up short-term data based on org retention policies
 * 3. Removing data for revoked/expired consents
 * 
 * Usage: node scripts/maintenance/gdpr-retention.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function expireOldConsents() {
  console.log('🔍 Checking for expired consents...')
  
  try {
    const { data: expiredConsents, error } = await supabase
      .from('guardian_consents')
      .update({ status: 'expired' })
      .eq('status', 'granted')
      .lt('expires_at', new Date().toISOString())
      .select('id, student_id, org_id')

    if (error) {
      console.error('❌ Error expiring consents:', error)
      return
    }

    if (expiredConsents && expiredConsents.length > 0) {
      console.log(`✅ Expired ${expiredConsents.length} consent(s)`)
      expiredConsents.forEach(consent => {
        console.log(`   - Student ${consent.student_id} in org ${consent.org_id}`)
      })
    } else {
      console.log('ℹ️  No consents to expire')
    }
  } catch (error) {
    console.error('❌ Error in expireOldConsents:', error)
  }
}

async function expireOldInvites() {
  console.log('🔍 Checking for expired consent invites...')
  
  try {
    const { data: expiredInvites, error } = await supabase
      .from('consent_invites')
      .update({ status: 'expired' })
      .in('status', ['sent', 'visited'])
      .lt('expires_at', new Date().toISOString())
      .select('id, guardian_email')

    if (error) {
      console.error('❌ Error expiring invites:', error)
      return
    }

    if (expiredInvites && expiredInvites.length > 0) {
      console.log(`✅ Expired ${expiredInvites.length} invite(s)`)
    } else {
      console.log('ℹ️  No invites to expire')
    }
  } catch (error) {
    console.error('❌ Error in expireOldInvites:', error)
  }
}

async function cleanupShortTermData() {
  console.log('🔍 Cleaning up old short-term data...')
  
  try {
    // Get all organizations with their retention settings
    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select(`
        id,
        name,
        org_settings(retention_korttid_days)
      `)

    if (orgsError) {
      console.error('❌ Error fetching organizations:', orgsError)
      return
    }

    for (const org of orgs || []) {
      const retentionDays = org.org_settings?.[0]?.retention_korttid_days || 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      console.log(`📋 Processing org ${org.name} (${retentionDays} day retention)`)

      // Clean up short-term quiz attempts
      const { data: deletedAttempts, error: attemptsError } = await supabase
        .from('attempts')
        .delete()
        .eq('data_mode', 'short')
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (attemptsError) {
        console.error(`❌ Error cleaning attempts for org ${org.id}:`, attemptsError)
        continue
      }

      if (deletedAttempts && deletedAttempts.length > 0) {
        console.log(`   ✅ Deleted ${deletedAttempts.length} short-term attempt(s)`)
      }

      // Note: Answers are automatically deleted via foreign key cascade
    }

    console.log('✅ Short-term data cleanup completed')
  } catch (error) {
    console.error('❌ Error in cleanupShortTermData:', error)
  }
}

async function cleanupRevokedConsentData() {
  console.log('🔍 Cleaning up data for revoked/expired consents...')
  
  try {
    // Get students with revoked or expired consents
    const { data: revokedConsents, error } = await supabase
      .from('guardian_consents')
      .select('student_id, org_id, status')
      .in('status', ['revoked', 'expired'])

    if (error) {
      console.error('❌ Error fetching revoked consents:', error)
      return
    }

    if (!revokedConsents || revokedConsents.length === 0) {
      console.log('ℹ️  No revoked/expired consents to process')
      return
    }

    for (const consent of revokedConsents) {
      // Delete long-term attempts for this student
      const { data: deletedAttempts, error: deleteError } = await supabase
        .from('attempts')
        .delete()
        .eq('student_id', consent.student_id)
        .eq('data_mode', 'long')
        .select('id')

      if (deleteError) {
        console.error(`❌ Error deleting data for student ${consent.student_id}:`, deleteError)
        continue
      }

      if (deletedAttempts && deletedAttempts.length > 0) {
        console.log(`   ✅ Deleted ${deletedAttempts.length} long-term attempt(s) for student ${consent.student_id}`)
      }
    }

    console.log('✅ Revoked consent data cleanup completed')
  } catch (error) {
    console.error('❌ Error in cleanupRevokedConsentData:', error)
  }
}

async function logJobCompletion() {
  console.log('📊 GDPR retention job completed at', new Date().toISOString())
  
  // Log basic stats
  try {
    const { count: totalConsents } = await supabase
      .from('guardian_consents')
      .select('*', { count: 'exact', head: true })

    const { count: activeConsents } = await supabase
      .from('guardian_consents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'granted')

    const { count: shortTermAttempts } = await supabase
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('data_mode', 'short')

    const { count: longTermAttempts } = await supabase
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('data_mode', 'long')

    console.log('📈 Current stats:')
    console.log(`   - Total consents: ${totalConsents}`)
    console.log(`   - Active consents: ${activeConsents}`)
    console.log(`   - Short-term attempts: ${shortTermAttempts}`)
    console.log(`   - Long-term attempts: ${longTermAttempts}`)
  } catch (error) {
    console.error('❌ Error fetching stats:', error)
  }
}

async function main() {
  console.log('🚀 Starting GDPR retention job...')
  console.log('⏰ Started at:', new Date().toISOString())
  
  await expireOldConsents()
  await expireOldInvites()
  await cleanupShortTermData()
  await cleanupRevokedConsentData()
  await logJobCompletion()
  
  console.log('✨ Job completed successfully')
}

// Run the job
main().catch(error => {
  console.error('💥 Job failed:', error)
  process.exit(1)
})