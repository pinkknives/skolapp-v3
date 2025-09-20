import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ActionsMenu, type ActionItem } from '@/components/ui/actions/ActionsMenu'

describe('ActionsMenu', () => {
  const mockItems: ActionItem[] = [
    {
      key: 'new-question',
      label: 'Ny fråga',
      kbd: 'N',
      onSelect: vi.fn(),
      disabled: false
    },
    {
      key: 'copy-link', 
      label: 'Kopiera länk',
      onSelect: vi.fn(),
      disabled: false
    },
    {
      key: 'delete',
      label: 'Ta bort',
      kbd: 'Del',
      onSelect: vi.fn(),
      disabled: false,
      danger: true
    }
  ]

  it('renders trigger button with Swedish label', () => {
    render(<ActionsMenu items={mockItems} />)
    
    const triggerButton = screen.getByRole('button', { name: /åtgärder/i })
    expect(triggerButton).toBeInTheDocument()
    
    // Check that it has menu attributes
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('opens menu via button click', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu items={mockItems} />)
    
    const triggerButton = screen.getByRole('button', { name: /åtgärder/i })
    await user.click(triggerButton)
    
    // Check menu items appear with Swedish labels
    expect(screen.getByText('Ny fråga')).toBeInTheDocument()
    expect(screen.getByText('Kopiera länk')).toBeInTheDocument()
    expect(screen.getByText('Ta bort')).toBeInTheDocument()
  })

  it('selects "Ny fråga" and triggers callback', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu items={mockItems} />)
    
    const triggerButton = screen.getByRole('button', { name: /åtgärder/i })
    await user.click(triggerButton)
    
    const newQuestionItem = screen.getByText('Ny fråga')
    await user.click(newQuestionItem)
    
    expect(mockItems[0].onSelect).toHaveBeenCalled()
  })

  it('shows keyboard hints för menu items', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu items={mockItems} />)
    
    const triggerButton = screen.getByRole('button', { name: /åtgärder/i })
    await user.click(triggerButton)
    
    // Check for keyboard shortcuts display
    expect(screen.getByText('N')).toBeInTheDocument() // Ny fråga shortcut
    expect(screen.getByText('Del')).toBeInTheDocument() // Ta bort shortcut
  })

  it('handles disabled menu items', async () => {
    const disabledItems: ActionItem[] = [
      {
        key: 'disabled-action',
        label: 'Inaktiverad åtgärd',
        onSelect: vi.fn(),
        disabled: true
      }
    ]
    
    const user = userEvent.setup()
    render(<ActionsMenu items={disabledItems} />)
    
    const triggerButton = screen.getByRole('button', { name: /åtgärder/i })
    await user.click(triggerButton)
    
    const disabledItem = screen.getByText('Inaktiverad åtgärd')
    expect(disabledItem.closest('[data-disabled="true"]')).toBeInTheDocument()
  })
})