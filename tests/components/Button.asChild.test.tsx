import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

// Minimal mock for next/link to behave like an anchor in tests
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href as string} {...rest}>{children}</a>
}))

describe('Button asChild', () => {
  it('renders with a single Link child without crashing', () => {
    render(
      <Button asChild>
        <Link href="/test">Gå</Link>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Gå' })
    expect(link).toBeInTheDocument()
  })
})
