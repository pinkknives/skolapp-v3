'use client'

import { Layout } from '@/components/layout/Layout'
import { ImprovedHero } from '@/components/homepage/ImprovedHero'
import { UniqueSellingPoints } from '@/components/homepage/UniqueSellingPoints'
import { HowItWorks } from '@/components/homepage/HowItWorks'
import { ImprovedCTA } from '@/components/homepage/ImprovedCTA'

export default function HomePage() {

  return (
    <Layout>
      {/* Improved Hero Section */}
      <ImprovedHero />

      {/* Quick onboarding explanation (moved up) */}
      <HowItWorks />

      {/* Core value props */}
      <UniqueSellingPoints />

      {/* Improved CTA */}
      <ImprovedCTA />
    </Layout>
  )
}
