import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { generateJetSeries } from '../model/jetModel'
import { DEFAULT_PARAMS } from '../model/presets'
import { TipPenetrationPanel } from './TipPenetrationPanel'

vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plotly-mock" />,
}))

describe('TipPenetrationPanel', () => {
  it('renders the quasi-steady caution text and summary controls', () => {
    render(
      <TipPenetrationPanel
        series={generateJetSeries(DEFAULT_PARAMS)}
        text={TRANSLATIONS.en}
      />,
    )

    expect(screen.getByText('Quasi-steady tip penetration estimate')).toBeTruthy()
    expect(screen.getByText('Download penetration CSV')).toBeTruthy()
    expect(screen.getByText(/not a full transient spray model/i)).toBeTruthy()
  })
})
