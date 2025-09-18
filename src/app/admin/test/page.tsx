import { SupabaseConnectionTest } from '@/components/admin/SupabaseConnectionTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SupabaseConnectionTest />
      </div>
    </div>
  )
}