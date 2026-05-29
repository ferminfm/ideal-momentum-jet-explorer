import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CollapsibleSection } from './CollapsibleSection'

describe('CollapsibleSection', () => {
  it('toggles content visibility and aria-expanded state', () => {
    render(
      <CollapsibleSection
        title="Test section"
        expandLabel="Expand section"
        collapseLabel="Collapse section"
      >
        <p>Section content</p>
      </CollapsibleSection>,
    )

    const toggle = screen.getByRole('button', { name: 'Collapse section: Test section' })
    const content = screen.getByText('Section content').parentElement

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(content?.hasAttribute('hidden')).toBe(false)

    fireEvent.click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(content?.hasAttribute('hidden')).toBe(true)
  })
})
