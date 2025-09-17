import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Föräldraområde - Skolapp',
  description: 'Hantera samtycke för ditt barns datalagring i Skolapp',
}

export default function ParentalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}