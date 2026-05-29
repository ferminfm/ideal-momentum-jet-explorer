import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { generateJetSeries } from '../model/jetModel'
import { DEFAULT_PARAMS } from '../model/presets'
import { CfdExportPanel } from './CfdExportPanel'

describe('CfdExportPanel', () => {
  it('renders format selection and download action', () => {
    const series = generateJetSeries(DEFAULT_PARAMS)

    render(
      <CfdExportPanel
        params={DEFAULT_PARAMS}
        series={series}
        dataOverlays={[]}
        comparisonCases={[]}
        text={TRANSLATIONS.en}
      />,
    )

    expect(screen.getByText('CFD / configuration export')).toBeTruthy()
    expect(screen.getByText('Export format')).toBeTruthy()
    expect(screen.getByText('Download configuration')).toBeTruthy()
    expect(screen.getByText(/not a solver-ready CFD case/i)).toBeTruthy()
  })
})
