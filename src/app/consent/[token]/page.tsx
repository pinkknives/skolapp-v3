import { supabaseBrowser } from '@/lib/supabase-browser'
import { ConsentPage } from '@/components/consent/ConsentPage'
import { notFound } from 'next/navigation'

interface ConsentPageProps {
  params: Promise<{ token: string }>
}

// This is a public page that doesn't require authentication
export default async function ConsentPageRoute({ params }: ConsentPageProps) {
  const { token } = await params

  if (!token) {
    notFound()
  }

  try {
    const supabase = supabaseBrowser()
    
    // Get invite details
    const { data: invite, error } = await supabase
      .from('consent_invites')
      .select(`
        *,
        orgs!inner(id, name),
        guardian_consents!inner(student_id, status)
      `)
      .eq('token', token)
      .single()

    if (error || !invite) {
      console.error('Error fetching consent invite:', error)
      notFound()
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      return (
        <ConsentPage
          invite={invite}
          isExpired={true}
          orgName={invite.orgs.name}
        />
      )
    }

    // Check if already completed
    if (invite.status === 'completed') {
      return (
        <ConsentPage
          invite={invite}
          isCompleted={true}
          orgName={invite.orgs.name}
        />
      )
    }

    return (
      <ConsentPage
        invite={invite}
        orgName={invite.orgs.name}
      />
    )
  } catch (error) {
    console.error('Error loading consent page:', error)
    notFound()
  }
}