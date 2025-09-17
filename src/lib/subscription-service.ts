// Enhanced subscription service with payment integration and GDPR compliance
import { 
  type SubscriptionPlan, 
  type PaymentProvider, 
  type User, 
  type SchoolAccount,
  type ConsentRecord,
  SUBSCRIPTION_LIMITS,
  DATA_RETENTION_FEATURES
} from '@/types/auth'

export interface SubscriptionPricing {
  plan: SubscriptionPlan
  monthlyPrice: number
  yearlyPrice: number
  currency: 'SEK'
  features: string[]
  limitations: {
    maxQuizzes?: number
    maxStudents?: number
    maxTeachers?: number
  }
  competitorComparison: {
    kahoot: number
    socrative: number
    quizlet: number
  }
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: 'SEK'
  provider: PaymentProvider
  subscriptionPlan: SubscriptionPlan
  userId: string
  schoolAccountId?: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
  createdAt: Date
  metadata?: Record<string, string>
}

export interface SubscriptionTier {
  minTeachers: number
  maxTeachers?: number
  pricePerTeacher: number
  discountPercentage: number
}

// Pricing matrix based on market research
export const SUBSCRIPTION_PRICING: Record<SubscriptionPlan, SubscriptionPricing> = {
  gratis: {
    plan: 'gratis',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'SEK',
    features: [
      'Upp till 3 quiz',
      'Max 30 elever per quiz',
      'Grundläggande rapporter',
      'Korttidslagring av data',
      'E-postsupport'
    ],
    limitations: {
      maxQuizzes: 3,
      maxStudents: 30
    },
    competitorComparison: {
      kahoot: 139, // Kahoot! Basic pricing
      socrative: 69, // Socrative Teacher pricing
      quizlet: 199 // Quizlet Teacher pricing
    }
  },
  premium: {
    plan: 'premium',
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    currency: 'SEK',
    features: [
      'Upp till 50 quiz',
      'Max 100 elever per quiz',
      'AI-assisterad quizgenerering',
      'Långtidslagring av data (med samtycke)',
      'Avancerade rapporter och analys',
      'Föräldrasamtyckeshantering',
      'Prioriterad support',
      'Anpassade rubriker'
    ],
    limitations: {
      maxQuizzes: 50,
      maxStudents: 100
    },
    competitorComparison: {
      kahoot: 139,
      socrative: 69,
      quizlet: 199
    }
  },
  skolplan: {
    plan: 'skolplan',
    monthlyPrice: 79, // Base price per teacher
    yearlyPrice: 790, // Base price per teacher
    currency: 'SEK',
    features: [
      'Obegränsat antal quiz',
      'Obegränsat antal elever',
      'AI-assisterad quizgenerering',
      'Långtidslagring av data (med samtycke)',
      'Skoladministration',
      'Centralicerad fakturering',
      'GDPR-rapporter',
      'Användningsstatistik',
      'Dedikerad support',
      'SSO-integration (Enterprise)',
      'Anpassad branding'
    ],
    limitations: {
      maxTeachers: 1000 // Reasonable upper limit
    },
    competitorComparison: {
      kahoot: 139,
      socrative: 69,
      quizlet: 199
    }
  }
}

// Tiered pricing for school plans (volume discounts)
export const SCHOOL_PRICING_TIERS: SubscriptionTier[] = [
  { minTeachers: 1, maxTeachers: 5, pricePerTeacher: 79, discountPercentage: 0 },
  { minTeachers: 6, maxTeachers: 15, pricePerTeacher: 69, discountPercentage: 13 },
  { minTeachers: 16, maxTeachers: 30, pricePerTeacher: 59, discountPercentage: 25 },
  { minTeachers: 31, maxTeachers: 50, pricePerTeacher: 49, discountPercentage: 38 },
  { minTeachers: 51, pricePerTeacher: 39, discountPercentage: 51 }
]

export class SubscriptionService {
  /**
   * Calculate pricing for school plan based on number of teachers
   */
  calculateSchoolPricing(numberOfTeachers: number): {
    tier: SubscriptionTier
    monthlyTotal: number
    yearlyTotal: number
    savings: number
  } {
    const tier = SCHOOL_PRICING_TIERS.find(t => 
      numberOfTeachers >= t.minTeachers && 
      (!t.maxTeachers || numberOfTeachers <= t.maxTeachers)
    ) || SCHOOL_PRICING_TIERS[SCHOOL_PRICING_TIERS.length - 1]

    const monthlyTotal = numberOfTeachers * tier.pricePerTeacher
    const yearlyTotal = monthlyTotal * 10 // 2 months free
    const standardPrice = numberOfTeachers * SUBSCRIPTION_PRICING.skolplan.monthlyPrice
    const savings = standardPrice - monthlyTotal

    return {
      tier,
      monthlyTotal,
      yearlyTotal,
      savings
    }
  }

  /**
   * Check if user can access specific features based on subscription
   */
  canUserAccessFeature(user: User, feature: keyof typeof SUBSCRIPTION_LIMITS[SubscriptionPlan]): boolean {
    const limits = SUBSCRIPTION_LIMITS[user.subscriptionPlan]
    return limits[feature] !== false
  }

  /**
   * Get subscription limits for a user
   */
  getUserLimits(user: User): typeof SUBSCRIPTION_LIMITS[SubscriptionPlan] {
    return SUBSCRIPTION_LIMITS[user.subscriptionPlan]
  }

  /**
   * Check if user has reached subscription limits
   */
  hasReachedLimit(user: User, limitType: 'maxQuizzes' | 'maxStudents', currentCount: number): boolean {
    const limits = this.getUserLimits(user)
    const limit = limits[limitType]
    return limit !== undefined && currentCount >= limit
  }

  /**
   * Create payment intent for subscription
   */
  async createPaymentIntent(
    user: User,
    plan: SubscriptionPlan,
    provider: PaymentProvider,
    isYearly: boolean = false,
    numberOfTeachers?: number
  ): Promise<PaymentIntent> {
    let amount: number

    if (plan === 'skolplan' && numberOfTeachers) {
      const pricing = this.calculateSchoolPricing(numberOfTeachers)
      amount = isYearly ? pricing.yearlyTotal : pricing.monthlyTotal
    } else {
      const pricing = SUBSCRIPTION_PRICING[plan]
      amount = isYearly ? pricing.yearlyPrice : pricing.monthlyPrice
    }

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'SEK',
      provider,
      subscriptionPlan: plan,
      userId: user.id,
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        isYearly: isYearly.toString(),
        numberOfTeachers: numberOfTeachers?.toString() || '1'
      }
    }

    // In a real implementation, this would make API calls to the payment provider
    // For now, we'll simulate the process
    return paymentIntent
  }

  /**
   * Process subscription upgrade/downgrade
   */
  async changeSubscription(
    user: User,
    newPlan: SubscriptionPlan,
    provider: PaymentProvider,
    consentRecord?: ConsentRecord
  ): Promise<{ success: boolean; requiresConsent?: boolean; message: string }> {
    // Check if switching to long-term data requires consent
    const requiresLongTermData = DATA_RETENTION_FEATURES.långtid.availableForPlans.includes(newPlan)
    const hasConsent = user.hasParentalConsent || !user.isMinor
    
    if (requiresLongTermData && user.isMinor && !hasConsent && !consentRecord) {
      return {
        success: false,
        requiresConsent: true,
        message: 'Föräldrasamtycke krävs för långtidslagring av data'
      }
    }

    // Process the subscription change
    // In a real implementation, this would:
    // 1. Create payment intent if upgrading
    // 2. Process prorations
    // 3. Update user subscription
    // 4. Update school account if applicable
    // 5. Send confirmation emails

    return {
      success: true,
      message: `Prenumerationen har ändrats till ${newPlan}`
    }
  }

  /**
   * Get competitor price comparison
   */
  getCompetitorComparison(plan: SubscriptionPlan): {
    skolapp: number
    competitors: { name: string; price: number; difference: number }[]
  } {
    const pricing = SUBSCRIPTION_PRICING[plan]
    const skolappPrice = pricing.monthlyPrice
    
    const competitors = [
      { name: 'Kahoot!', price: pricing.competitorComparison.kahoot },
      { name: 'Socrative', price: pricing.competitorComparison.socrative },
      { name: 'Quizlet Teacher', price: pricing.competitorComparison.quizlet }
    ].map(comp => ({
      ...comp,
      difference: comp.price - skolappPrice
    }))

    return {
      skolapp: skolappPrice,
      competitors
    }
  }

  /**
   * Validate payment provider for platform
   */
  isPaymentProviderAvailable(provider: PaymentProvider, platform: 'web' | 'ios' | 'android'): boolean {
    const platformMap: Record<string, PaymentProvider[]> = {
      web: ['stripe', 'none'],
      ios: ['app_store_ios', 'stripe', 'none'],
      android: ['google_play', 'stripe', 'none']
    }

    return platformMap[platform].includes(provider)
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()