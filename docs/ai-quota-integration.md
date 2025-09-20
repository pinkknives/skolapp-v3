# AI Quota Integration Guide

This document explains how to integrate the new AI quota system with existing and new AI endpoints.

## Overview

The new billing system implements user-based AI quotas:
- **Free users**: 20 AI queries per month
- **Pro users**: Unlimited AI queries (with reasonable rate limiting)
- **Automatic tracking**: Every AI call increments the user's quota
- **Monthly reset**: Quotas reset automatically each month

## Integration Pattern

### 1. Client-Side Pre-check (Optional)

Before making an AI request, you can check if the user has quota remaining:

```typescript
import { canUseAI } from '@/lib/billing'

const handleAIGeneration = async () => {
  const canUse = await canUseAI()
  if (!canUse) {
    // Show upgrade prompt
    return
  }
  
  // Proceed with AI request
  await generateAIContent()
}
```

### 2. Server-Side Quota Enforcement (Required)

Every AI endpoint must check and increment the user's quota:

```typescript
// pages/api/ai/generate-quiz.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = supabaseBrowser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 })
    }

    // Check and increment quota BEFORE making AI call
    const quotaResponse = await fetch(`${request.nextUrl.origin}/api/ai/usage`, {
      method: 'POST',
      headers: { 'authorization': request.headers.get('authorization') || '' }
    })

    if (quotaResponse.status === 429) {
      return NextResponse.json(
        { 
          error: 'Du har nått din månadsgräns för AI-frågor',
          code: 'QUOTA_EXCEEDED' 
        },
        { status: 429 }
      )
    }

    if (!quotaResponse.ok) {
      return NextResponse.json(
        { error: 'Kunde inte kontrollera AI-kvot' },
        { status: 500 }
      )
    }

    // Now proceed with AI generation
    const aiResponse = await generateWithOpenAI(...)
    
    return NextResponse.json({ result: aiResponse })
    
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid AI-generering' },
      { status: 500 }
    )
  }
}
```

### 3. Alternative: Direct Database Approach

For server-side only operations, you can use the database function directly:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ... get user ...

  // Check quota directly
  const { data: canProceed, error } = await supabaseService.rpc('increment_ai_usage', {
    user_id: user.id
  })

  if (error || !canProceed) {
    return NextResponse.json(
      { error: 'AI-kvot överskriden' },
      { status: 429 }
    )
  }

  // Proceed with AI call
}
```

## Error Handling

### Quota Exceeded Response

Always return a consistent error structure when quota is exceeded:

```typescript
return NextResponse.json(
  { 
    error: 'Du har nått din månadsgräns för AI-frågor',
    code: 'QUOTA_EXCEEDED',
    upgradeUrl: '/pricing' // Optional: direct link to upgrade
  },
  { status: 429 }
)
```

### Client-Side Handling

Handle quota exceeded errors consistently:

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  // ... other options
})

if (response.status === 429) {
  const { error, code } = await response.json()
  if (code === 'QUOTA_EXCEEDED') {
    // Show upgrade prompt
    showUpgradeModal()
    return
  }
}
```

## Component Integration

### Show Quota Status

Use the AIQuotaDisplay component to show current usage:

```typescript
import { AIQuotaDisplay } from '@/components/billing/AIQuotaDisplay'

function AIGenerationPanel() {
  return (
    <div>
      <AIQuotaDisplay className="mb-4" />
      <Button onClick={handleAIGeneration}>
        Generera med AI
      </Button>
    </div>
  )
}
```

### Conditional UI

Show different UI based on quota status:

```typescript
import { useEntitlements } from '@/hooks/useEntitlements'

function AIFeatures() {
  const { entitlements, canUseAI } = useEntitlements()
  
  if (!canUseAI) {
    return <AIFeatureBlock featureName="AI-generering" />
  }
  
  return (
    <div>
      {/* AI features */}
    </div>
  )
}
```

## Testing

### Test with Free User

1. Create a user account
2. Make 20 AI requests
3. Verify 21st request is blocked
4. Check quota display shows correct usage

### Test with Pro User

1. Upgrade to Pro
2. Verify unlimited access
3. Check quota display shows "Unlimited"

### Test Quota Reset

```bash
curl -X POST http://localhost:3000/api/admin/reset-quotas \
  -H "Authorization: Bearer ${ADMIN_API_KEY}"
```

## Migration Checklist

For existing AI endpoints:

- [ ] Add quota check before AI call
- [ ] Update error handling for 429 responses
- [ ] Test with free and pro users
- [ ] Update UI to show quota status
- [ ] Add upgrade prompts where appropriate

## Monitoring

Track these metrics:
- AI usage per user type (free vs pro)
- Quota exceeded events
- Conversion from quota exceeded to upgrade
- Monthly quota reset statistics