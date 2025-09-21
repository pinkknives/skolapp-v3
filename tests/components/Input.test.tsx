import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input component (Quiz form fields)', () => {
  it('has proper label-koppling with for/id attributes', () => {
    render(
      <Input 
        label="Titel" 
        placeholder="Ange quizets titel"
        data-testid="quiz-title-input"
      />
    )

    const input = screen.getByTestId('quiz-title-input')
    const label = screen.getByText('Titel')
    
    // Check that label has for attribute pointing to input id
    expect(label).toHaveAttribute('for', input.id)
    expect(input).toHaveAttribute('id')
    
    // Verify the label-input association works
    expect(input).toHaveAccessibleName('Titel')
  })

  it('shows error message with aria-describedby när validation fails', () => {
    render(
      <Input 
        label="Titel"
        errorMessage="Titel krävs"
        data-testid="quiz-title-input"
      />
    )

    const input = screen.getByTestId('quiz-title-input')
    const errorMessage = screen.getByText('Titel krävs')
    
    // Check that error message has role="alert"
    expect(errorMessage).toHaveAttribute('role', 'alert')
    
    // Check that input is described by error message
    expect(input).toHaveAttribute('aria-describedby')
    expect(input.getAttribute('aria-describedby')).toContain(errorMessage.id)
    
    // Check that input has aria-invalid
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports helper text with aria-describedby', () => {
    render(
      <Input 
        label="Beskrivning"
        helperText="Valfri beskrivning som hjälper elever förstå quizets syfte"
        data-testid="quiz-description-input"
      />
    )

    const input = screen.getByTestId('quiz-description-input')
    const helperText = screen.getByText(/valfri beskrivning/i)
    
    // Check that input is described by helper text
    expect(input).toHaveAttribute('aria-describedby')
    expect(input.getAttribute('aria-describedby')).toContain(helperText.id)
  })

  it('maintains proper tab order for multiple form fields', async () => {
    const user = userEvent.setup()
    
    render(
      <form>
        <Input label="Titel" data-testid="input-1" />
        <Input label="Beskrivning" data-testid="input-2" />
        <Input label="Ämne" data-testid="input-3" />
      </form>
    )

    const input1 = screen.getByTestId('input-1')
    const input2 = screen.getByTestId('input-2')
    const input3 = screen.getByTestId('input-3')
    
    // Test tab navigation through form fields
    await user.tab()
    expect(input1).toHaveFocus()
    
    await user.tab()
    expect(input2).toHaveFocus()
    
    await user.tab()
    expect(input3).toHaveFocus()
  })

  it('shows error message with correct aria-describedby when helper text exists', () => {
    render(
      <Input 
        label="Titel"
        helperText="Ge quizet ett beskrivande namn"
        errorMessage="Titel får inte vara tom"
        data-testid="quiz-title-input"
      />
    )

    const input = screen.getByTestId('quiz-title-input')
    const errorMessage = screen.getByText(/får inte vara tom/i)
    
    // When there's an error, aria-describedby should include error id
    expect(input).toHaveAttribute('aria-describedby')
    const describedBy = input.getAttribute('aria-describedby') || ''
    expect(describedBy).toContain(errorMessage.id)
    
    // Error should take precedence and have role="alert"
    expect(errorMessage).toHaveAttribute('role', 'alert')
    
    // Helper text should not be shown when there's an error (per component logic)
    expect(screen.queryByText(/beskrivande namn/i)).not.toBeInTheDocument()
  })

  it('supports Swedish placeholder text och labels', () => {
    render(
      <Input 
        label="Quizets titel"
        placeholder="Ange en titel för ditt quiz"
        helperText="Titeln kommer att visas för eleverna"
        data-testid="swedish-input"
      />
    )

    const input = screen.getByTestId('swedish-input')
    
    // Check Swedish content
    expect(screen.getByText('Quizets titel')).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Ange en titel för ditt quiz')
    expect(screen.getByText('Titeln kommer att visas för eleverna')).toBeInTheDocument()
    
    // Verify accessibility
    expect(input).toHaveAccessibleName('Quizets titel')
  })

  it('handles focus management for validation states', async () => {
    const user = userEvent.setup()
    
    render(
      <Input 
        label="Obligatoriskt fält"
        errorMessage="Detta fält krävs"
        data-testid="required-input"
      />
    )

    const input = screen.getByTestId('required-input')
    
    // Input should be focusable even in error state
    await user.click(input)
    expect(input).toHaveFocus()
    
    // Focus ring should be visible (checked via CSS classes)
    expect(input).toHaveClass('focus-visible:ring-2')
  })

  it('supports password visibility toggle with Swedish labels', async () => {
    const user = userEvent.setup()
    
    render(
      <Input 
        type="password"
        label="Lösenord"
        showPasswordToggle={true}
        data-testid="password-input"
      />
    )

    const input = screen.getByTestId('password-input')
    const toggleButton = screen.getByRole('button', { name: /visa lösenord/i })
    
    // Initially password should be hidden
    expect(input).toHaveAttribute('type', 'password')
    expect(toggleButton).toHaveAccessibleName('Visa lösenord')
    
    // Click to show password
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    expect(toggleButton).toHaveAccessibleName('Dölj lösenord')
  })
})