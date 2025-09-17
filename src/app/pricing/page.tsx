import React from 'react'
import { Metadata } from 'next'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { PricingContent } from './PricingContent'

export const metadata: Metadata = {
  title: 'Priser - Skolapp',
  description: 'Välj den plan som passar dig bäst. Transparent prissättning för lärare och skolor.',
}

export default function PricingPage() {
  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <PricingContent />
        </Container>
      </Section>
    </Layout>
  )
}
