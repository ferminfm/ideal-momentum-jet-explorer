import { describe, expect, it } from 'vitest'
import { buildTipPenetrationCsv } from '../utils/tipPenetrationCsv'
import { degreesToRadians, generateJetSeries, type JetSeries, type JetState } from './jetModel'
import {
  computeTauOfZeta,
  computeTipPenetration,
  dimensionalizeTipPenetration,
  interpolateZetaAtTau,
} from './tipPenetration'

describe('tip penetration utilities', () => {
  it('returns tau=zeta and zeta_tip=tau for constant normalized velocity', () => {
    const series = createSyntheticSeries([0, 1, 2, 3], () => 1)
    const cumulative = computeTauOfZeta(series)
    const result = computeTipPenetration(series, {
      pointCount: 4,
      useSeriesRange: true,
    })

    expect(cumulative.map((point) => point.tau)).toEqual([0, 1, 2, 3])
    expect(result.success).toBe(true)
    expect(result.tauAtZetaMax).toBeCloseTo(3)
    expect(result.points.map((point) => point.zeta)).toEqual([0, 1, 2, 3])
    expect(interpolateZetaAtTau(cumulative, 1.5)).toBeCloseTo(1.5)
  })

  it('matches the circular equal-density analytic tau relation', () => {
    const thetaDeg = 6
    const theta = degreesToRadians(thetaDeg)
    const series = generateJetSeries({
      densityRatio: 1,
      thetaDeg,
      phiDeg: thetaDeg,
      zetaMax: 20,
      samples: 101,
      geometry: {
        geometry: 'elliptical',
        majorAxis: 1,
        minorAxis: 1,
      },
    })

    const cumulative = computeTauOfZeta(series)
    const last = cumulative[cumulative.length - 1]
    const expected = last.zeta + last.zeta ** 2 * Math.tan(theta)

    expect(last.tau).toBeCloseTo(expected, 8)
  })

  it('returns monotonic cumulative time and penetration points', () => {
    const series = createSyntheticSeries([0, 0.5, 1.5, 3], (zeta) => 1 / (1 + zeta))
    const cumulative = computeTauOfZeta(series)
    const result = computeTipPenetration(series, { pointCount: 20, useSeriesRange: true })

    expect(isMonotonic(cumulative.map((point) => point.tau))).toBe(true)
    expect(isMonotonic(result.points.map((point) => point.zeta))).toBe(true)
  })

  it('fails gracefully for nonpositive velocity samples', () => {
    const result = computeTipPenetration(
      createSyntheticSeries([0, 1], (zeta) => (zeta === 0 ? 1 : 0)),
    )

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/vhat/i)
  })

  it('adds dimensional time, position, and velocity fields', () => {
    const result = computeTipPenetration(
      createSyntheticSeries([0, 1, 2], () => 1),
      { pointCount: 3, useSeriesRange: true },
    )
    const dimensional = dimensionalizeTipPenetration(result, {
      equivalentDiameter: 0.001,
      injectionVelocity: 10,
    })
    const last = dimensional.points[dimensional.points.length - 1]

    expect(last.z).toBeCloseTo(0.002)
    expect(last.t).toBeCloseTo(0.0002)
    expect(last.velocity).toBeCloseTo(10)
  })

  it('exports penetration CSV headers and rows', () => {
    const result = dimensionalizeTipPenetration(
      computeTipPenetration(createSyntheticSeries([0, 1], () => 1), {
        pointCount: 2,
        useSeriesRange: true,
      }),
      {
        equivalentDiameter: 0.001,
        injectionVelocity: 10,
      },
    )
    const csv = buildTipPenetrationCsv(result)
    const rows = csv.split('\n')

    expect(rows[0]).toBe('index,tau,zeta_tip,vhat,t_s,Z_m,velocity_m_s')
    expect(rows).toHaveLength(3)
  })
})

function createSyntheticSeries(
  zetas: number[],
  velocity: (zeta: number) => number,
): JetSeries {
  const states = zetas.map((zeta) => createState(zeta, velocity(zeta)))

  return {
    params: {
      densityRatio: 1,
      thetaDeg: 0,
      phiDeg: 0,
      zetaMax: zetas[zetas.length - 1],
      samples: zetas.length,
      geometry: { geometry: 'rectangular', width: 1, height: 1 },
    },
    equivalentDiameter: Math.sqrt(4 / Math.PI),
    initialArea: 1,
    states,
  }
}

function createState(zeta: number, velocityHat: number): JetState {
  return {
    axialZeta: zeta,
    axialZ: zeta,
    area: 1,
    normalizedArea: 1,
    dAreaHatDzeta: 0,
    primarySpan: 1,
    secondarySpan: 1,
    primaryHat: 1,
    secondaryHat: 1,
    delta: 1,
    velocityHat,
    densityHat: 1,
    densityHatCheck: 1,
    pressureHat: 1,
    gasEntrainmentHat: 0,
    gasEntrainmentHatAlt: 0,
    entrainmentCoefficient: 0,
  }
}

function isMonotonic(values: number[]): boolean {
  return values.every((value, index) => index === 0 || value >= values[index - 1])
}
