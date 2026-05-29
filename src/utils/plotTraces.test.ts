import { describe, expect, it } from 'vitest'
import type { CalibrationResult } from '../model/calibration'
import { createComparisonCase } from '../model/comparisonCases'
import {
  computeEntrainmentCoefficientLimits,
  generateJetSeries,
  type JetParameters,
} from '../model/jetModel'
import type { DataOverlay } from '../data/dataOverlayTypes'
import {
  buildDataOverlayTraces,
  buildCalibrationPreviewTrace,
  buildEntrainmentReferenceTraces,
  buildModelCurveTraces,
} from './plotTraces'

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

  it('includes only data overlays matching the active plot variable', () => {
    const overlays: DataOverlay[] = [
      {
        id: 'velocity-data',
        label: 'Velocity data',
        variable: 'velocity',
        sourceKind: 'user-import',
        source: 'Local CSV',
        xLabel: 'zeta',
        yLabel: 'vhat',
        points: [
          { x: 0, y: 1 },
          { x: 5, y: 0.8 },
        ],
        notes: 'Imported',
        publicData: false,
        visible: true,
        color: '#236b8e',
        createdAt: '2026-05-29T00:00:00.000Z',
      },
      {
        id: 'density-data',
        label: 'Density data',
        variable: 'density',
        sourceKind: 'user-import',
        source: 'Local CSV',
        xLabel: 'zeta',
        yLabel: 'rhohat',
        points: [{ x: 0, y: 1 }],
        notes: 'Imported',
        publicData: false,
        visible: true,
        color: '#94424e',
        createdAt: '2026-05-29T00:00:00.000Z',
      },
    ]

    const velocityTraces = buildDataOverlayTraces(overlays, 'velocity')
    const densityTraces = buildDataOverlayTraces(overlays, 'density')

    expect(velocityTraces).toHaveLength(1)
    expect(velocityTraces[0].name).toContain('Velocity data')
    expect(densityTraces).toHaveLength(1)
    expect(densityTraces[0].name).toContain('Density data')
  })

  it('excludes hidden data overlays', () => {
    const overlays: DataOverlay[] = [
      {
        id: 'hidden-velocity-data',
        label: 'Hidden velocity data',
        variable: 'velocity',
        sourceKind: 'user-import',
        source: 'Local CSV',
        xLabel: 'zeta',
        yLabel: 'vhat',
        points: [{ x: 0, y: 1 }],
        notes: 'Imported',
        publicData: false,
        visible: false,
        color: '#236b8e',
        createdAt: '2026-05-29T00:00:00.000Z',
      },
    ]

    expect(buildDataOverlayTraces(overlays, 'velocity')).toHaveLength(0)
  })

  it('adds calibration preview trace only on the fitted target variable', () => {
    const series = generateJetSeries(params)
    const result: CalibrationResult = {
      success: true,
      targetVariable: 'velocity',
      parameterMode: 'two-angles',
      fittedThetaDeg: 8,
      fittedPhiDeg: 8,
      initialThetaDeg: 4,
      initialPhiDeg: 4,
      rmse: 0,
      mae: 0,
      sse: 0,
      pointCount: 4,
      iterations: 20,
      message: 'ok',
      fittedSeries: series,
    }

    expect(buildCalibrationPreviewTrace(result, 'velocity', 'Fit')).toHaveLength(1)
    expect(buildCalibrationPreviewTrace(result, 'density', 'Fit')).toHaveLength(0)
  })
})
