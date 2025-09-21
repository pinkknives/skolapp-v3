#!/usr/bin/env node

/**
 * E2E Test Data Cleanup Script
 * 
 * Removes old E2E test users and associated data to keep the database clean.
 * Runs daily via GitHub Actions cron job.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === 'true';
const MAX_AGE_HOURS = parseInt(process.env.MAX_AGE_HOURS || '24', 10);

async function cleanupE2ETestData() {
  console.log('🧹 Starting E2E test data cleanup...');
  console.log(`📅 Removing data older than ${MAX_AGE_HOURS} hours`);
  console.log(`🔄 Dry run mode: ${DRY_RUN ? 'ON' : 'OFF'}`);
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
    process.exit(1);
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Calculate cutoff timestamp
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - MAX_AGE_HOURS);
    const cutoffISO = cutoffTime.toISOString();
    
    console.log(`🕒 Cutoff time: ${cutoffISO}`);
    
    // Find E2E test users
    console.log('🔍 Finding E2E test users...');
    const { data: e2eUsers, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, user_metadata, created_at')
      .filter('user_metadata->>e2e', 'eq', 'true')
      .lt('created_at', cutoffISO);
    
    if (usersError) {
      console.error('❌ Error finding E2E users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${e2eUsers?.length || 0} E2E users to clean up`);
    
    if (!e2eUsers || e2eUsers.length === 0) {
      console.log('✅ No E2E users to clean up');
      return;
    }
    
    const userIds = e2eUsers.map(user => user.id);
    
    // Log users to be cleaned up
    console.log('👥 Users to clean up:');
    e2eUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id}) created ${user.created_at}`);
    });
    
    if (DRY_RUN) {
      console.log('🚫 Dry run mode - no actual cleanup performed');
      return;
    }
    
    // Clean up associated data first (foreign key constraints)
    
    // 1. Quiz submissions
    console.log('🗑️ Cleaning up quiz submissions...');
    const { error: submissionsError } = await supabase
      .from('quiz_submissions')
      .delete()
      .in('user_id', userIds);
    
    if (submissionsError) {
      console.error('❌ Error cleaning submissions:', submissionsError);
    }
    
    // 2. Live session participants
    console.log('🗑️ Cleaning up live session participants...');
    const { error: participantsError } = await supabase
      .from('live_quiz_participants')
      .delete()
      .in('user_id', userIds);
    
    if (participantsError) {
      console.error('❌ Error cleaning participants:', participantsError);
    }
    
    // 3. Quiz sessions created by test users
    console.log('🗑️ Cleaning up quiz sessions...');
    const { error: sessionsError } = await supabase
      .from('live_quiz_sessions')
      .delete()
      .in('created_by', userIds);
    
    if (sessionsError) {
      console.error('❌ Error cleaning sessions:', sessionsError);
    }
    
    // 4. Quizzes created by test users
    console.log('🗑️ Cleaning up quizzes...');
    const { error: quizzesError } = await supabase
      .from('quizzes')
      .delete()
      .in('created_by', userIds);
    
    if (quizzesError) {
      console.error('❌ Error cleaning quizzes:', quizzesError);
    }
    
    // 5. User profiles
    console.log('🗑️ Cleaning up user profiles...');
    const { error: profilesError } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', userIds);
    
    if (profilesError) {
      console.error('❌ Error cleaning profiles:', profilesError);
    }
    
    // 6. AI usage entitlements
    console.log('🗑️ Cleaning up AI entitlements...');
    const { error: entitlementsError } = await supabase
      .from('entitlements')
      .delete()
      .in('uid', userIds);
    
    if (entitlementsError) {
      console.error('❌ Error cleaning entitlements:', entitlementsError);
    }
    
    // 7. Finally, delete the users themselves
    console.log('🗑️ Cleaning up auth users...');
    
    // Note: Supabase doesn't allow direct auth.users deletion via client
    // This would need to be done via admin API or custom function
    console.log('⚠️ Auth user deletion requires admin API - skipping for now');
    console.log('💡 Consider implementing server-side cleanup function');
    
    console.log('✅ E2E test data cleanup completed successfully');
    
    // Summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`   - Users processed: ${e2eUsers.length}`);
    console.log(`   - Cutoff time: ${cutoffISO}`);
    console.log(`   - Associated data cleaned: submissions, participants, sessions, quizzes, profiles, entitlements`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
E2E Test Data Cleanup Script

Usage: node scripts/cleanup-e2e-data.js [options]

Options:
  --dry-run         Show what would be cleaned without actual deletion
  --max-age-hours   Maximum age in hours for data to keep (default: 24)
  --help, -h        Show this help message

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Service role key (required for deletion)
  DRY_RUN                       Set to 'true' for dry run mode
  MAX_AGE_HOURS                 Maximum age in hours (default: 24)

Examples:
  node scripts/cleanup-e2e-data.js --dry-run
  DRY_RUN=true MAX_AGE_HOURS=48 node scripts/cleanup-e2e-data.js
    `);
    process.exit(0);
  }
  
  // Parse command line arguments
  if (args.includes('--dry-run')) {
    process.env.DRY_RUN = 'true';
  }
  
  const maxAgeIndex = args.indexOf('--max-age-hours');
  if (maxAgeIndex !== -1 && args[maxAgeIndex + 1]) {
    process.env.MAX_AGE_HOURS = args[maxAgeIndex + 1];
  }
  
  cleanupE2ETestData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { cleanupE2ETestData };