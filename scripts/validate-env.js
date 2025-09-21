#!/usr/bin/env node

/**
 * Environment validation script for Skolapp v3
 * This script helps developers verify their environment configuration
 */

const path = require('path')
const fs = require('fs')

// Set NODE_ENV to development by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Load environment variables from .env.local if it exists
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

console.log('🔍 Skolapp v3 Environment Validation')
console.log('====================================')
console.log()

console.log('📂 Environment setup:')
console.log(`   .env.local exists: ${fs.existsSync(envLocalPath)}`)
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
console.log()

// Define required and optional environment variables
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key (server-side)',
}

const optionalVars = {
  'OPENAI_API_KEY': 'OpenAI API key (för AI quiz generation)',
  'OPENAI_PROJECT_ID': 'OpenAI project ID (optional)',
  'ABLY_API_KEY': 'Ably API key (för Live Quiz features)',
  'ABLY_SERVER_API_KEY': 'Ably server API key (för health checks)',
  'STRIPE_SECRET_KEY': 'Stripe secret key (för billing)',
  'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret',
  'NEXT_PUBLIC_STRIPE_PRICE_MONTHLY': 'Stripe monthly price ID',
  'NEXT_PUBLIC_STRIPE_PRICE_ANNUAL': 'Stripe annual price ID',
  'ADMIN_API_KEY': 'Admin API key (för system operations)',
}

const featureFlags = {
  'NEXT_PUBLIC_FEATURE_LIVE_QUIZ': 'Live Quiz feature flag',
  'FEATURE_SYLLABUS': 'Skolverket syllabus integration flag',
}

function checkVariable(key, description, required = false) {
  const value = process.env[key]
  const status = value ? '✅' : (required ? '❌' : '⚠️ ')
  const displayValue = value ? 
    (key.includes('KEY') || key.includes('SECRET')) ? 
      `[SET - ${value.substring(0, 20)}...]` : 
      value : 
    '[NOT SET]'
  
  console.log(`   ${status} ${key}: ${displayValue}`)
  if (!value && required) {
    console.log(`      ↳ ${description}`)
  }
  
  return !!value
}

console.log('🔑 Obligatoriska miljövariabler:')
let allRequiredSet = true
for (const [key, description] of Object.entries(requiredVars)) {
  if (!checkVariable(key, description, true)) {
    allRequiredSet = false
  }
}

console.log()
console.log('🔧 Valfria miljövariabler:')
for (const [key, description] of Object.entries(optionalVars)) {
  checkVariable(key, description, false)
}

console.log()
console.log('🚩 Feature flags:')
for (const [key, description] of Object.entries(featureFlags)) {
  checkVariable(key, description, false)
}

console.log()

if (allRequiredSet) {
  console.log('✅ Alla obligatoriska miljövariabler är konfigurerade!')
} else {
  console.log('❌ Några obligatoriska miljövariabler saknas')
  console.log('   Kopiera .env.local.example till .env.local och fyll i dina värden')
}

console.log()

// Test API connectivity if keys are available
console.log('🔗 API Connectivity Tests:')

// Test OpenAI
if (process.env.OPENAI_API_KEY) {
  console.log('   ✅ OpenAI configuration available')
} else {
  console.log('   ⚠️  OpenAI configuration missing - AI features disabled')
}

// Test Ably
if (process.env.ABLY_API_KEY) {
  console.log('   ✅ Ably configuration available')
} else {
  console.log('   ⚠️  Ably configuration missing - Live Quiz features disabled')
}

// Test Stripe
if (process.env.STRIPE_SECRET_KEY) {
  console.log('   ✅ Stripe configuration available')
} else {
  console.log('   ⚠️  Stripe configuration missing - Billing features disabled')
}

console.log()
console.log('📖 För mer information, se docs/github-secrets-guide.md')
console.log('✨ Environment validation completed')