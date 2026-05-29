import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { DataOverlayPanel } from './DataOverlayPanel'

describe('DataOverlayPanel', () => {
  it('renders built-in synthetic examples and CSV import guidance', () => {
    renderPanel()

    expect(screen.getByText('Built-in synthetic examples')).toBeTruthy()
    expect(screen.getByText(/not measured validation data/i)).toBeTruthy()
    expect(screen.getByText('CSV import guide')).toBeTruthy()
    expect(screen.getByText(/normalized axial distance/i)).toBeTruthy()
    expect(screen.getByText(/Choose the variable represented by the Y column/i)).toBeTruthy()
    expect(screen.getByText('Download example CSVs')).toBeTruthy()
  })

  it('adds a selected built-in synthetic calibration overlay', () => {
    const onAddOverlay = vi.fn()
    renderPanel(onAddOverlay)

    fireEvent.change(screen.getByDisplayValue('None'), {
      target: { value: 'synthetic-calibration-square-velocity-theta8' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Add overlay' })[0])

    expect(onAddOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'synthetic-calibration-square-velocity-theta8',
        sourceKind: 'synthetic-demo',
        publicData: false,
      }),
    )
  })
})

function renderPanel(onAddOverlay = vi.fn()) {
  return render(
    <DataOverlayPanel
      overlays={[]}
      text={TRANSLATIONS.en}
      onAddOverlay={onAddOverlay}
      onToggleOverlay={vi.fn()}
      onRemoveOverlay={vi.fn()}
      onShowAll={vi.fn()}
      onHideAll={vi.fn()}
      onClearUser={vi.fn()}
      onClearAll={vi.fn()}
    />,
  )
}
