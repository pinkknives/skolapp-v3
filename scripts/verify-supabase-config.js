#!/usr/bin/env node

/**
 * Simple verification script to test Supabase configuration
 * This uses only the validation function without attempting actual connections
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

console.log('🔍 Supabase Environment Verification')
console.log('====================================')
console.log()

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
]

let allPresent = true

console.log('📋 Required Environment Variables:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  const isPresent = !!value && value.trim() !== ''
  
  if (!isPresent) {
    allPresent = false
  }
  
  console.log(`   ${isPresent ? '✅' : '❌'} ${varName}: ${isPresent ? '[SET]' : '[MISSING]'}`)
  
  if (isPresent && varName.includes('URL')) {
    console.log(`      Value: ${value}`)
  } else if (isPresent) {
    console.log(`      Value: ${value.substring(0, 20)}...`)
  }
})

console.log()

// Validate URL format
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
if (url) {
  try {
    new URL(url)
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is a valid URL')
  } catch (error) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    allPresent = false
  }
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
  allPresent = false
}

// Check JWT format (basic check)
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (anonKey && anonKey.split('.').length === 3) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a valid JWT')
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT')
  allPresent = false
}

if (serviceKey && serviceKey.split('.').length === 3) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY appears to be a valid JWT')
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY does not appear to be a valid JWT')
  allPresent = false
}

console.log()

if (allPresent) {
  console.log('🎉 All Supabase environment variables are properly configured!')
  console.log('✨ Next.js should be able to load these variables in development mode.')
} else {
  console.log('⚠️  Some environment variables are missing or invalid.')
  console.log('📝 Please check your .env.local file and ensure all required variables are set.')
}

console.log()
console.log('ℹ️  To test the actual Supabase connection, run the app and visit /admin/test')