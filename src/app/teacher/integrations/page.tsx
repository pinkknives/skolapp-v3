import { Suspense } from 'react'
import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { IntegrationsContent } from './IntegrationsContent'

export const metadata: Metadata = {
  title: 'Integrationer | Skolapp',
  description: 'Hantera integrationer med svenska skolans system och verktyg',
}

export default function IntegrationsPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Laddar integrationer...</div>}>
        <IntegrationsContent />
      </Suspense>
    </Layout>
  )
}