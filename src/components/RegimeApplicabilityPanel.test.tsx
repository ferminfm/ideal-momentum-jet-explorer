import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import type { ApplicabilityAssessment } from '../model/regimeChecker'
import { RegimeApplicabilityPanel } from './RegimeApplicabilityPanel'

const assessment: ApplicabilityAssessment = {
  overall: 'caution',
  shortSummary: 'Plausible but validation-sensitive exploratory regime',
  regimeLabel: 'Plausible but validation-sensitive exploratory regime',
  recommendedUse: 'Use as a reduced-order exploratory estimate and compare against data.',
  messages: [
    {
      id: 'test-caution',
      level: 'caution',
      title: 'Test caution',
      message: 'This is a heuristic caution.',
      quantity: 'We_g',
      value: 0.5,
      threshold: 'We_g < 1',
    },
  ],
}

describe('RegimeApplicabilityPanel', () => {
  it('renders status, groups, and heuristic caveat', () => {
    render(
      <RegimeApplicabilityPanel
        assessment={assessment}
        densityRatio={0.0012}
        groups={{
          reynoldsLiquid: 12000,
          weberLiquid: 200,
          weberGas: 0.5,
          ohnesorgeLiquid: 0.02,
          gasMachEstimate: 0.1,
        }}
        text={TRANSLATIONS.en}
      />,
    )

    expect(screen.getByText('Regime / applicability')).toBeTruthy()
    expect(screen.getAllByText('Caution').length).toBeGreaterThan(0)
    expect(screen.getByText('Test caution')).toBeTruthy()
    expect(screen.getByText(/heuristic guidance/i)).toBeTruthy()
    expect(screen.getAllByText(/We_g/).length).toBeGreaterThan(0)
  })
})
