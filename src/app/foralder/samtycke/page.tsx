import { ConsentDashboard } from '@/components/consent/ConsentDashboard'

interface ConsentPageProps {
  searchParams: {
    token?: string
    student?: string
  }
}

export default function ConsentPage({ searchParams }: ConsentPageProps) {
  return (
    <ConsentDashboard 
      token={searchParams.token}
      studentId={searchParams.student}
    />
  )
}