import { describe, expect, it } from 'vitest'
import { createComparisonCase } from '../model/comparisonCases'
import {
  computeEntrainmentCoefficientLimits,
  generateJetSeries,
  type JetParameters,
} from '../model/jetModel'
import { buildEntrainmentReferenceTraces, buildModelCurveTraces } from './plotTraces'

const params: JetParameters = {
  densityRatio: 0.001,
  thetaDeg: 8,
  phiDeg: 8,
  zetaMax: 20,
  samples: 10,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 1,
  },
}

describe('plot trace helpers', () => {
  it('includes visible comparison cases and excludes hidden cases', () => {
    const visibleCase = createComparisonCase(params, {
      id: 'visible',
      label: 'Visible case',
      visible: true,
    })
    const hiddenCase = createComparisonCase(params, {
      id: 'hidden',
      label: 'Hidden case',
      visible: false,
    })

    const traces = buildModelCurveTraces({
      series: generateJetSeries(params),
      comparisonCases: [visibleCase, hiddenCase],
      getValue: (state) => state.velocityHat,
      hoverZeta: 'zeta',
      hoverValue: 'value',
      currentLabel: 'Current',
    })

    expect(traces).toHaveLength(2)
    expect(traces.map((trace) => trace.name)).toEqual(['Current', 'Visible case'])
  })

  it('builds near-field and far-field coefficient reference traces', () => {
    const series = generateJetSeries(params)
    const limits = computeEntrainmentCoefficientLimits(params)
    const traces = buildEntrainmentReferenceTraces(series, limits, {
      nearField: 'Near-field K_A(0)',
      farField: 'Far-field K_A(∞)',
    })

    expect(traces).toHaveLength(2)
    expect(traces.map((trace) => trace.name)).toEqual([
      'Near-field K_A(0)',
      'Far-field K_A(∞)',
    ])
    expect(traces[0].y).toEqual([limits.nearField, limits.nearField])
    expect(traces[1].y).toEqual([limits.farField, limits.farField])
  })
})
