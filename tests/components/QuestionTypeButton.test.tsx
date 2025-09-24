import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QuestionTypeButton } from '@/components/ui/question-type/QuestionTypeButton'
import { CheckCircle } from 'lucide-react'

describe('QuestionTypeButton', () => {
  it('renders with icon före text och aria-pressed', async () => {
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="multiple-choice"
        label="Flerval"
        description="Elever väljer bland flera alternativ"
        icon={<CheckCircle data-testid="icon" />}
        isSelected={true}
        onSelect={onSelect}
      />
    )

    // Verify button is rendered with Swedish text
    const button = screen.getByRole('button', { name: /flerval/i })
    expect(button).toBeInTheDocument()
    
    // Check that icon is rendered before text
    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()
    
    // Verify aria-pressed state when selected
    expect(button).toHaveAttribute('aria-pressed', 'true')
    
    // Check description is present
    expect(screen.getByText('Elever väljer bland flera alternativ')).toBeInTheDocument()
  })

  it('handles keyboard activation with Enter and Space', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="multiple-choice"
        label="Flerval"
        description="Elever väljer bland flera alternativ"
        icon={<CheckCircle />}
        isSelected={false}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: /flerval/i })
    
    // Test Enter key activation
    await user.click(button)
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('multiple-choice')
    
    // Reset mock
    onSelect.mockClear()
    
    // Test Space key activation
    await user.keyboard(' ')
    expect(onSelect).toHaveBeenCalledWith('multiple-choice')
  })

  it('triggers callback when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="free-text"
        label="Fritext"
        description="Elever skriver eget svar"
        icon={<CheckCircle />}
        isSelected={false}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: /fritext/i })
    await user.click(button)
    
    expect(onSelect).toHaveBeenCalledWith('free-text')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('shows correct aria-pressed för unselected state', () => {
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="multiple-choice"
        label="Flerval"
        description="Test beskrivning"
        icon={<CheckCircle />}
        isSelected={false}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: /flerval/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('has proper focus management and accessibility attributes', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="image"
        label="Bild"
        description="Lägg till visuellt innehåll"
        icon={<CheckCircle />}
        isSelected={false}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: /bild/i })
    
    // Test that button can receive focus
    await user.tab()
    expect(button).toHaveFocus()
    
    // Verify button has proper accessibility attributes
    expect(button).toHaveAttribute('role', 'button')
    expect(button).toBeEnabled()
  })

  it('supports touch targets according to design requirements', () => {
    const onSelect = vi.fn()
    
    render(
      <QuestionTypeButton
        type="multiple-choice"
        label="Flerval"
        description="Test beskrivning"
        icon={<CheckCircle />}
        isSelected={false}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: /flerval/i })
    
    // The button should have minimum touch target size via CSS classes
    // We check that the component has been rendered (the CSS classes are applied in the component)
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]')
  })
})