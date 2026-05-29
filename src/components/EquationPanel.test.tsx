import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { EquationPanel } from './EquationPanel'

describe('EquationPanel', () => {
  it('renders KaTeX equations with readable descriptions', () => {
    const { container } = render(<EquationPanel text={TRANSLATIONS.en} />)

    expect(screen.getByText('Ideal momentum closure')).toBeTruthy()
    expect(screen.getByText('Conservation system')).toBeTruthy()
    expect(screen.getByText('Explicit state laws')).toBeTruthy()
    expect(screen.getByText('Derived quantities')).toBeTruthy()
    expect(screen.getByText(/closed-form branches/)).toBeTruthy()
    expect(container.querySelectorAll('.katex-display').length).toBeGreaterThan(0)
  })
})
