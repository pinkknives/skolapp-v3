'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { Layout, Container, Section } from '@/components/layout/Layout'

export default function IntegritetPage() {
  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <Typography variant="h1" className="mb-4">Integritet</Typography>
          <Typography variant="body2" className="mb-2">
            Vi värnar om din integritet. Skolapp samlar endast in nödvändig data för att
            leverera tjänsten och förbättra upplevelsen.
          </Typography>
          <Typography variant="body2" className="mb-2">
            AI‑träningsdata sparas endast om du som lärare aktivt samtyckt. Innehållet
            anonymiseras och innehåller ingen personidentifierande information.
          </Typography>
          <Typography variant="body2">
            För frågor: kontakta oss på <a className="underline" href="mailto:hej@skolapp.se">hej@skolapp.se</a>.
          </Typography>
        </Container>
      </Section>
    </Layout>
  )
}


