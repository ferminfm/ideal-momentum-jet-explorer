import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
})
