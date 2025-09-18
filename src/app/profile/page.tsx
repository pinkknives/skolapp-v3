import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ProfileManagement } from '@/components/profile/ProfileManagement'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ProfileManagement user={user} />
      </div>
    </div>
  )
}