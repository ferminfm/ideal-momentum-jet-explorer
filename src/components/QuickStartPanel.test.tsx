import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { QuickStartPanel } from './QuickStartPanel'

describe('QuickStartPanel', () => {
  it('renders examples and applies a selected example', () => {
    const onApplyExample = vi.fn()

    render(<QuickStartPanel text={TRANSLATIONS.en} onApplyExample={onApplyExample} />)

    expect(screen.getByText('Quick start examples')).toBeTruthy()
    expect(screen.getByText('Circular baseline')).toBeTruthy()

    fireEvent.click(screen.getAllByText('Apply example')[0])

    expect(onApplyExample).toHaveBeenCalledWith('circular-baseline')
  })
})
