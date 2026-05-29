import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { generateJetSeries } from '../model/jetModel'
import { DEFAULT_PARAMS } from '../model/presets'
import { ReportPanel } from './ReportPanel'

describe('ReportPanel', () => {
  it('renders report controls and previews a report', () => {
    const series = generateJetSeries(DEFAULT_PARAMS)

    render(
      <ReportPanel
        params={DEFAULT_PARAMS}
        series={series}
        dataOverlays={[]}
        comparisonCases={[]}
        text={TRANSLATIONS.en}
      />,
    )

    expect(screen.getByText('Report generator')).toBeTruthy()
    expect(screen.getByText('Preview report')).toBeTruthy()
    expect(screen.getByText('Download Markdown')).toBeTruthy()

    fireEvent.click(screen.getByText('Preview report'))

    expect(screen.getByText('Model Summary')).toBeTruthy()
    expect(screen.getByText('Research-Use Disclaimer')).toBeTruthy()
  })
})
