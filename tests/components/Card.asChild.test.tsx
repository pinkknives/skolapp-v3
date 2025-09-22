import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Card } from '@/components/ui/Card'

function WrapperLink({ href, children }: { href: string, children: React.ReactNode }) {
  return <a href={href} className="block">{children}</a>
}

describe('Card asChild', () => {
  it('renders with single element child via asChild', () => {
    render(
      <Card asChild>
        <WrapperLink href="/foo">Innehåll</WrapperLink>
      </Card>
    )
    const link = screen.getByRole('link', { name: 'Innehåll' })
    expect(link).toBeInTheDocument()
  })
})
