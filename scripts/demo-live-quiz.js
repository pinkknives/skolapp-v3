#!/usr/bin/env node
/**
 * Live Quiz Session Demo Script
 * 
 * This script demonstrates the key API endpoints for the live quiz system.
 * Run this after setting up the database to validate the core functionality.
 * 
 * Usage: node scripts/demo-live-quiz.js
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

console.log('🎯 Live Quiz Session Demo')
console.log('=' * 50)
console.log()

console.log('This demo shows the core API flow for live quiz sessions:')
console.log('1. Create a live quiz session')
console.log('2. Join the session with a PIN')
console.log('3. Start the session')
console.log('4. Submit answers')
console.log('5. Advance through questions')
console.log()

console.log('📋 Prerequisites:')
console.log('- Database is set up with migration 014_quiz_live_sessions_v2.sql')
console.log('- A quiz exists in the database')
console.log('- User authentication is configured')
console.log('- App is running on:', baseUrl)
console.log()

console.log('🔧 Manual Testing Steps:')
console.log()

console.log('1. CREATE LIVE SESSION:')
console.log('   POST /api/live-sessions')
console.log('   Body: {')
console.log('     "orgId": "your-org-id",')
console.log('     "quizId": "your-quiz-id",')
console.log('     "settings": {')
console.log('       "timePerQuestion": 30,')
console.log('       "showAfterEach": true,')
console.log('       "autoAdvance": false')
console.log('     }')
console.log('   }')
console.log()

console.log('2. JOIN SESSION:')
console.log('   Navigate to: /live/join?pin=<PIN_FROM_STEP_1>')
console.log('   Or use API: POST /api/live-sessions/{sessionId}/join')
console.log('   Body: {')
console.log('     "displayName": "Test Student",')
console.log('     "userId": "user-id"')
console.log('   }')
console.log()

console.log('3. START SESSION (Teacher):')
console.log('   POST /api/live-sessions/{sessionId}/start')
console.log('   Navigate to: /live/control/{sessionId}')
console.log()

console.log('4. STUDENT EXPERIENCE:')
console.log('   Navigate to: /live/session/{sessionId}')
console.log('   Students will see questions in real-time as teacher advances')
console.log()

console.log('5. SUBMIT ANSWERS:')
console.log('   POST /api/live-sessions/{sessionId}/answer')
console.log('   Body: {')
console.log('     "questionId": "question-id",')
console.log('     "answer": "selected-option-id",')
console.log('     "userId": "user-id"')
console.log('   }')
console.log()

console.log('6. ADVANCE QUESTIONS (Teacher):')
console.log('   POST /api/live-sessions/{sessionId}/next')
console.log()

console.log('🧪 Database Validation:')
console.log('Check these tables after testing:')
console.log('- quiz_sessions (should have your session with PIN)')
console.log('- quiz_session_participants (should have teacher + students)')
console.log('- quiz_answers (should have submitted answers)')
console.log()

console.log('💡 Real-time Features:')
console.log('- Supabase Realtime channels on: live:session:{sessionId}')
console.log('- Events: session:start, question:show, session:end, participant_joined, answer:submitted')
console.log()

console.log('🎨 UI Testing:')
console.log('Teacher Flow:')
console.log('1. Go to any quiz → Start Session → Select "Live (Realtid)"')
console.log('2. Copy PIN and QR code')
console.log('3. Navigate to control page')
console.log('4. Wait for students to join')
console.log('5. Click "Starta Quiz"')
console.log('6. Use "Nästa fråga" to advance')
console.log()

console.log('Student Flow:')
console.log('1. Go to /live/join')
console.log('2. Enter PIN from teacher')
console.log('3. Enter display name')
console.log('4. Wait in lobby for teacher to start')
console.log('5. Answer questions as they appear')
console.log('6. See final results')
console.log()

console.log('✅ Success Indicators:')
console.log('- Session PIN is 6 characters (A-Z, 0-9)')
console.log('- Real-time updates work between teacher and student')
console.log('- Answer correctness is calculated automatically')
console.log('- Session status progresses: LOBBY → ACTIVE → ENDED')
console.log('- All participants see consistent state')
console.log()

console.log('🚨 Troubleshooting:')
console.log('- Check network/browser console for errors')
console.log('- Verify database migration was applied')
console.log('- Ensure RLS policies allow your user operations')
console.log('- Check Supabase Realtime is enabled for your project')
console.log()

console.log('Demo script complete! Use the manual steps above to test the live quiz system.')