#!/usr/bin/env node

/**
 * Test script to verify Supabase environment configuration in Next.js context
 * This script mimics how Next.js loads environment variables
 */

const path = require('path')
const fs = require('fs')

// Set NODE_ENV to development to simulate Next.js behavior
process.env.NODE_ENV = 'development'

// Load environment variables like Next.js does
const envLocalPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const lines = envContent.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=')
        process.env[key] = value
      }
    }
  })
}

console.log('🔍 Supabase Environment Configuration Test')
console.log('==========================================')
console.log()

console.log('📂 Environment file loading:')
console.log(`   .env.local exists: ${fs.existsSync(envLocalPath)}`)
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
console.log()

console.log('🔑 Environment Variables:')
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '[NOT SET]'}`)
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET - ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...]' : '[NOT SET]'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET - ' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...]' : '[NOT SET]'}`)
console.log()

// Test if Supabase clients can be imported and instantiated
console.log('📦 Testing Supabase client imports:')
try {
  // Test browser client
  const { supabaseBrowser } = require('../src/lib/supabase-browser')
  const browserClient = supabaseBrowser()
  console.log('   ✅ Browser client created successfully')
} catch (error) {
  console.log(`   ❌ Browser client error: ${error.message}`)
}

try {
  // Test server client
  const { supabaseServer } = require('../src/lib/supabase-server')
  const serverClient = supabaseServer()
  console.log('   ✅ Server client created successfully')
} catch (error) {
  console.log(`   ❌ Server client error: ${error.message}`)
}

console.log()

// Test configuration validation
console.log('🔍 Configuration validation:')
try {
  const { validateSupabaseConfig } = require('../src/lib/supabase-test')
  const validation = validateSupabaseConfig()
  
  if (validation.isValid) {
    console.log('   ✅ All environment variables are properly configured')
  } else {
    console.log('   ⚠️  Configuration issues found:')
    validation.issues.forEach(issue => {
      console.log(`      - ${issue}`)
    })
  }
} catch (error) {
  console.log(`   ❌ Validation error: ${error.message}`)
}

console.log()
console.log('✨ Environment configuration test completed')