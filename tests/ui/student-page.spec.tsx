import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import StudentPage from '@/app/teacher/students/[id]/page'

vi.mock('next/navigation', () => {
  const searchParams = new URLSearchParams()
  return {
    useParams: () => ({ id: '00000000-0000-0000-0000-000000000001' }),
    useSearchParams: () => searchParams,
    useRouter: () => ({ replace: vi.fn() }),
  }
})

const studentResp = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test Elev',
  parentalConsent: true,
  classId: '11111111-1111-1111-1111-111111111111',
}

const statsResp = {
  student: {
    data: [
      { subject: 'Matematik', week_start: '2025-01-06', correct_rate: 60 },
      { subject: 'Matematik', week_start: '2025-01-13', correct_rate: 70 },
      { subject: 'Svenska', week_start: '2025-01-13', correct_rate: 65 },
    ],
    error: null,
  },
}

global.fetch = vi.fn(async (url: RequestInfo | URL) => {
  const href = String(url)
  if (href.includes('/api/students/')) {
    return new Response(JSON.stringify(studentResp), { status: 200 })
  }
  if (href.includes('/api/demo/stats')) {
    return new Response(JSON.stringify(statsResp), { status: 200 })
  }
  return new Response('Not found', { status: 404 })
}) as unknown as typeof fetch

describe('StudentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header and sections', async () => {
    render(<StudentPage />)
    await waitFor(() => expect(screen.getByText('Test Elev')).toBeInTheDocument())
    expect(screen.getByText('Utveckling över tid')).toBeInTheDocument()
    expect(screen.getByText('Per ämne')).toBeInTheDocument()
  })
})
