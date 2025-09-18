import { ConsentDashboard } from '@/components/consent/ConsentDashboard'
import { use } from 'react'

interface ConsentPageProps {
  searchParams: Promise<{
    token?: string
    student?: string
  }>
}

export default function ConsentPage({ searchParams }: ConsentPageProps) {
  const params = use(searchParams)
  
  return (
    <ConsentDashboard 
      token={params.token}
      studentId={params.student}
    />
  )
}