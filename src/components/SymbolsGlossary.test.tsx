import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { SymbolsGlossary } from './SymbolsGlossary'

describe('SymbolsGlossary', () => {
  it('renders notation entries and the top-hat state note', () => {
    const { container } = render(<SymbolsGlossary text={TRANSLATIONS.en} />)

    expect(screen.getByText('Symbols glossary')).toBeTruthy()
    expect(screen.getByText('normalized axial distance')).toBeTruthy()
    expect(screen.getByText('generalized entrainment coefficient')).toBeTruthy()
    expect(screen.getByText(/bulk\/top-hat quantities/)).toBeTruthy()
    expect(container.querySelectorAll('.katex').length).toBeGreaterThan(0)
  })
})
