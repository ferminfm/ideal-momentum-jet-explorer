import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { DataOverlay, OverlayVariable } from '../data/dataOverlayTypes'
import { TRANSLATIONS } from '../i18n/translations'
import { DEFAULT_PARAMS } from '../model/presets'
import { CalibrationPanel } from './CalibrationPanel'

describe('CalibrationPanel', () => {
  it('renders the calibration controls and empty-overlay guidance', () => {
    render(
      <CalibrationPanel
        overlays={[]}
        baseParams={DEFAULT_PARAMS}
        text={TRANSLATIONS.en}
        onPreviewChange={vi.fn()}
        onApplyFittedParams={vi.fn()}
        onAddFittedComparison={vi.fn()}
      />,
    )

    expect(screen.getByText('Calibration / fit spreading angles')).toBeTruthy()
    expect(screen.getByText(/No supported data overlay is active/i)).toBeTruthy()
  })

  it('synchronizes the target variable when overlays become available after mount', async () => {
    const preview = vi.fn()
    const { rerender } = renderPanel([], preview)

    rerender(
      <CalibrationPanel
        overlays={[createOverlay('area-overlay', 'area')]}
        baseParams={DEFAULT_PARAMS}
        text={TRANSLATIONS.en}
        onPreviewChange={preview}
        onApplyFittedParams={vi.fn()}
        onAddFittedComparison={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(targetSelect().value).toBe('area')
      expect(overlaySelect().value).toBe('area-overlay')
    })
  })

  it('defaults the target variable to the newly selected overlay variable', async () => {
    renderPanel([
      createOverlay('velocity-overlay', 'velocity', 'Velocity overlay'),
      createOverlay('density-overlay', 'density', 'Density overlay'),
    ])

    await waitFor(() => expect(targetSelect().value).toBe('velocity'))

    fireEvent.change(overlaySelect(), { target: { value: 'density-overlay' } })

    expect(targetSelect().value).toBe('density')
  })

  it('allows a manual target mismatch and shows a translated warning', async () => {
    renderPanel([createOverlay('area-overlay', 'area')])

    await waitFor(() => expect(targetSelect().value).toBe('area'))

    fireEvent.change(targetSelect(), { target: { value: 'velocity' } })

    expect(targetSelect().value).toBe('velocity')
    expect(screen.getByText(/marked as Area, but the fit target is Velocity/i)).toBeTruthy()
  })

  it('shows the translated not-enough-points message for sparse overlays', async () => {
    renderPanel([
      {
        ...createOverlay('area-overlay', 'area'),
        points: [{ x: 0, y: 1 }],
      },
    ])

    await waitFor(() => expect(targetSelect().value).toBe('area'))

    expect(screen.getByText('Not enough points')).toBeTruthy()
  })
})

function renderPanel(overlays: DataOverlay[], onPreviewChange = vi.fn()) {
  return render(
    <CalibrationPanel
      overlays={overlays}
      baseParams={DEFAULT_PARAMS}
      text={TRANSLATIONS.en}
      onPreviewChange={onPreviewChange}
      onApplyFittedParams={vi.fn()}
      onAddFittedComparison={vi.fn()}
    />,
  )
}

function overlaySelect(): HTMLSelectElement {
  return screen.getByLabelText('Overlay to fit') as HTMLSelectElement
}

function targetSelect(): HTMLSelectElement {
  return screen.getByLabelText('Target variable') as HTMLSelectElement
}

function createOverlay(
  id: string,
  variable: OverlayVariable,
  label = `${variable} overlay`,
): DataOverlay {
  return {
    id,
    label,
    variable,
    sourceKind: 'user-import',
    source: 'test',
    xLabel: 'zeta',
    yLabel: variable,
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 0.9 },
    ],
    notes: 'test overlay',
    publicData: false,
    visible: true,
    color: '#123456',
    createdAt: '2026-05-30T00:00:00.000Z',
  }
}
