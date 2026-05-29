import { describe, expect, it } from 'vitest'
import type { DataOverlay } from '../data/dataOverlayTypes'
import {
  DEFAULT_CALIBRATION_BOUNDS,
  calibrateSpreadingAngles,
  computeCalibrationObjective,
  evaluateModelAtZeta,
  overlayToCalibrationPoints,
  type CalibrationTargetVariable,
} from './calibration'
import { generateJetSeries, type JetParameters, type JetState } from './jetModel'

const baseParams: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 4,
  phiDeg: 4,
  zetaMax: 40,
  samples: 90,
  geometry: {
    geometry: 'rectangular',
    width: Math.sqrt(2),
    height: 1 / Math.sqrt(2),
  },
}

describe('calibration utilities', () => {
  it('filters invalid overlay rows, applies weights, and sorts by zeta', () => {
    const overlay = createOverlay([
      { x: 8, y: 0.7, yError: 0.2 },
      { x: -1, y: 1 },
      { x: 4, y: 0.8 },
      { x: 100, y: 0.3 },
      { x: Number.NaN, y: 1 },
    ])

    const points = overlayToCalibrationPoints(overlay, 20)

    expect(points.map((point) => point.zeta)).toEqual([4, 8])
    expect(points[0].weight).toBe(1)
    expect(points[1].weight).toBeCloseTo(25)
  })

  it('recovers a symmetric synthetic velocity angle', () => {
    const squareBase: JetParameters = {
      ...baseParams,
      thetaDeg: 4,
      phiDeg: 4,
      geometry: { geometry: 'rectangular', width: 1, height: 1 },
    }
    const truth = {
      ...squareBase,
      thetaDeg: 8,
      phiDeg: 8,
    }
    const points = sampleSyntheticPoints(truth, 'velocity')

    const result = calibrateSpreadingAngles(squareBase, points, {
      targetVariable: 'velocity',
      parameterMode: 'symmetric-angle',
      bounds: DEFAULT_CALIBRATION_BOUNDS,
      maxIterations: 100,
      tolerance: 1e-4,
    })

    expect(result.success).toBe(true)
    expect(result.fittedThetaDeg).toBeCloseTo(8, 1)
    expect(result.fittedPhiDeg).toBeCloseTo(8, 1)
    expect(result.rmse).toBeLessThan(1e-4)
  })

  it('recovers two anisotropic angles from synthetic area data', () => {
    const truth = {
      ...baseParams,
      thetaDeg: 9.61,
      phiDeg: 5.75,
    }
    const points = sampleSyntheticPoints(truth, 'area')
    const initialMetrics = computeCalibrationObjective(baseParams, points, 'area')

    const result = calibrateSpreadingAngles(baseParams, points, {
      targetVariable: 'area',
      parameterMode: 'two-angles',
      bounds: DEFAULT_CALIBRATION_BOUNDS,
      maxIterations: 120,
      tolerance: 1e-4,
    })

    expect(result.success).toBe(true)
    expect(result.fittedThetaDeg).toBeCloseTo(9.61, 0)
    expect(result.fittedPhiDeg).toBeCloseTo(5.75, 0)
    expect(result.rmse).toBeLessThan(initialMetrics.rmse)
  })

  it('theta-only mode changes theta and keeps phi fixed', () => {
    const truth = {
      ...baseParams,
      thetaDeg: 11,
      phiDeg: baseParams.phiDeg,
    }
    const points = sampleSyntheticPoints(truth, 'area')

    const result = calibrateSpreadingAngles(baseParams, points, {
      targetVariable: 'area',
      parameterMode: 'theta-only',
      bounds: DEFAULT_CALIBRATION_BOUNDS,
      maxIterations: 80,
      tolerance: 1e-4,
    })

    expect(result.success).toBe(true)
    expect(result.fittedThetaDeg).toBeCloseTo(11, 1)
    expect(result.fittedPhiDeg).toBe(baseParams.phiDeg)
  })

  it('phi-only mode changes phi and keeps theta fixed', () => {
    const truth = {
      ...baseParams,
      thetaDeg: baseParams.thetaDeg,
      phiDeg: 12,
    }
    const points = sampleSyntheticPoints(truth, 'area')

    const result = calibrateSpreadingAngles(baseParams, points, {
      targetVariable: 'area',
      parameterMode: 'phi-only',
      bounds: DEFAULT_CALIBRATION_BOUNDS,
      maxIterations: 80,
      tolerance: 1e-4,
    })

    expect(result.success).toBe(true)
    expect(result.fittedThetaDeg).toBe(baseParams.thetaDeg)
    expect(result.fittedPhiDeg).toBeCloseTo(12, 1)
  })

  it('returns a failed result for insufficient points', () => {
    const result = calibrateSpreadingAngles(
      baseParams,
      [{ zeta: 0, value: 1 }],
      {
        targetVariable: 'velocity',
        parameterMode: 'two-angles',
        bounds: DEFAULT_CALIBRATION_BOUNDS,
        maxIterations: 80,
        tolerance: 1e-3,
      },
    )

    expect(result.success).toBe(false)
    expect(result.pointCount).toBe(1)
    expect(result.message).toMatch(/not enough/i)
  })

  it('respects bounds and remains finite', () => {
    const truth = {
      ...baseParams,
      thetaDeg: 18,
      phiDeg: 18,
    }
    const points = sampleSyntheticPoints(truth, 'velocity')

    const result = calibrateSpreadingAngles(baseParams, points, {
      targetVariable: 'velocity',
      parameterMode: 'symmetric-angle',
      bounds: {
        thetaMinDeg: 0,
        thetaMaxDeg: 10,
        phiMinDeg: 0,
        phiMaxDeg: 10,
      },
      maxIterations: 80,
      tolerance: 1e-3,
    })

    expect(result.success).toBe(true)
    expect(result.fittedThetaDeg).toBeLessThanOrEqual(10)
    expect(result.fittedPhiDeg).toBeLessThanOrEqual(10)
    expect(Number.isFinite(result.sse)).toBe(true)
  })

  it('computes finite calibration objective metrics', () => {
    const points = sampleSyntheticPoints(baseParams, 'pressure')
    const metrics = computeCalibrationObjective(baseParams, points, 'pressure')

    expect(metrics.sse).toBeLessThan(1e-10)
    expect(metrics.rmse).toBeLessThan(1e-10)
    expect(metrics.mae).toBeLessThan(1e-10)
    expect(evaluateModelAtZeta(baseParams, 0, 'pressure')).toBe(1)
  })
})

function sampleSyntheticPoints(
  params: JetParameters,
  target: CalibrationTargetVariable,
) {
  return generateJetSeries(params).states
    .filter((_, index) => index % 12 === 0)
    .map((state) => ({
      zeta: state.axialZeta,
      value: stateValue(state, target),
      weight: 1,
    }))
}

function stateValue(state: JetState, target: CalibrationTargetVariable): number {
  switch (target) {
    case 'area':
      return state.normalizedArea
    case 'velocity':
      return state.velocityHat
    case 'density':
      return state.densityHat
    case 'pressure':
      return state.pressureHat
    case 'entrainment':
      return state.gasEntrainmentHat
    case 'coefficient':
      return state.entrainmentCoefficient
  }
}

function createOverlay(points: DataOverlay['points']): DataOverlay {
  return {
    id: 'test-overlay',
    label: 'Test overlay',
    variable: 'velocity',
    sourceKind: 'user-import',
    source: 'test',
    xLabel: 'zeta',
    yLabel: 'vhat',
    points,
    notes: 'test',
    publicData: false,
    visible: true,
    color: '#000000',
    createdAt: '2026-05-29T00:00:00.000Z',
  }
}
