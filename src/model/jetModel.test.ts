import { describe, expect, it } from 'vitest'
import {
  computeEntrainmentCoefficientLimits,
  computeAxisSwitchingZeta,
  generateJetSeries,
  getDirectionalGrowthRates,
  getEquivalentDiameter,
  getGeometryState,
  getInitialArea,
  getJetState,
  type JetParameters,
} from './jetModel'
import { PRESETS } from './presets'

const TOLERANCE = 1e-10

function expectClose(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

const baseRectangular: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 5.75,
  phiDeg: 9.61,
  zetaMax: 50,
  samples: 100,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 1,
  },
}

describe('ideal momentum jet model', () => {
  it('returns the initial normalized state at zeta = 0', () => {
    const state = getJetState(baseRectangular, 0)

    expectClose(state.normalizedArea, 1)
    expectClose(state.velocityHat, 1)
    expectClose(state.densityHat, 1)
    expectClose(state.densityHatCheck, 1)
    expectClose(state.pressureHat, 1)
    expectClose(state.gasEntrainmentHat, 0)
  })

  it('matches the equal-density analytic branch', () => {
    const params: JetParameters = {
      ...baseRectangular,
      densityRatio: 1,
    }
    const state = getJetState(params, 8)

    expectClose(state.densityHat, 1)
    expectClose(state.velocityHat, 1 / Math.sqrt(state.normalizedArea))
    expectClose(state.pressureHat, 1 / state.normalizedArea)
  })

  it('produces equivalent normalized area for square and circular limits with matched normalized spreading', () => {
    const square: JetParameters = {
      ...baseRectangular,
      thetaDeg: 8,
      phiDeg: 8,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    }
    const equivalentCircleDiameter = Math.sqrt(4 / Math.PI)
    const matchedCircularAngle =
      (Math.atan((2 / Math.sqrt(Math.PI)) * Math.tan((8 * Math.PI) / 180)) * 180) /
      Math.PI
    const circle: JetParameters = {
      ...square,
      thetaDeg: matchedCircularAngle,
      phiDeg: matchedCircularAngle,
      geometry: {
        geometry: 'elliptical',
        majorAxis: equivalentCircleDiameter,
        minorAxis: equivalentCircleDiameter,
      },
    }

    expectClose(getInitialArea(square.geometry), getInitialArea(circle.geometry))
    expectClose(getEquivalentDiameter(square.geometry), getEquivalentDiameter(circle.geometry))

    for (const zeta of [0, 1, 5, 20]) {
      expectClose(
        getGeometryState(square, zeta).normalizedArea,
        getGeometryState(circle, zeta).normalizedArea,
      )
    }
  })

  it('computes K_A from the area derivative for rectangular and elliptical cases', () => {
    const cases: JetParameters[] = [
      baseRectangular,
      {
        ...baseRectangular,
        thetaDeg: 5.75,
        phiDeg: 9.61,
        geometry: {
          geometry: 'elliptical',
          majorAxis: Math.sqrt(2),
          minorAxis: 1 / Math.sqrt(2),
        },
      },
    ]

    for (const params of cases) {
      const state = getJetState(params, 4.5)
      const expected =
        (Math.sqrt(params.densityRatio) / state.delta) * state.dAreaHatDzeta
      expectClose(state.entrainmentCoefficient, expected)
    }
  })

  it('matches the near-field entrainment coefficient reference at zeta = 0', () => {
    const limits = computeEntrainmentCoefficientLimits(baseRectangular)
    const state = getJetState(baseRectangular, 0)

    expectClose(state.entrainmentCoefficient, limits.nearField)
    expectClose(
      limits.nearField,
      (Math.sqrt(baseRectangular.densityRatio) /
        (1 + baseRectangular.densityRatio)) *
        state.dAreaHatDzeta,
    )
  })

  it('computes the symmetric far-field entrainment coefficient asymptote', () => {
    const params: JetParameters = {
      ...baseRectangular,
      thetaDeg: 8,
      phiDeg: 8,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    }
    const limits = computeEntrainmentCoefficientLimits(params)
    const expectedLambda =
      2 * getEquivalentDiameter(params.geometry) * Math.tan((8 * Math.PI) / 180)

    expectClose(limits.lambda1, expectedLambda)
    expectClose(limits.lambda2, expectedLambda)
    expectClose(limits.farField, expectedLambda)
  })

  it('keeps K_A constant for the equal-density square symmetric branch', () => {
    const params: JetParameters = {
      ...baseRectangular,
      densityRatio: 1,
      thetaDeg: 8,
      phiDeg: 8,
      zetaMax: 50,
      samples: 120,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    }
    const series = generateJetSeries(params)
    const values = series.states.map((state) => state.entrainmentCoefficient)
    const expectedLambda =
      2 * getEquivalentDiameter(params.geometry) * Math.tan((8 * Math.PI) / 180)
    const spread = Math.max(...values) - Math.min(...values)

    for (const value of values) {
      expectClose(value, expectedLambda, 1e-12)
    }
    expect(spread).toBeLessThanOrEqual(1e-12)
  })

  it('computes AR=2 far-field references from directional growth rates', () => {
    const cases: JetParameters[] = [
      {
        ...baseRectangular,
        thetaDeg: 9.61,
        phiDeg: 5.75,
        geometry: {
          geometry: 'rectangular',
          width: Math.sqrt(2),
          height: 1 / Math.sqrt(2),
        },
      },
      {
        ...baseRectangular,
        thetaDeg: 5.75,
        phiDeg: 9.61,
        geometry: {
          geometry: 'elliptical',
          majorAxis: Math.sqrt(2),
          minorAxis: 1 / Math.sqrt(2),
        },
      },
    ]

    for (const params of cases) {
      const { lambda1, lambda2 } = getDirectionalGrowthRates(params)
      const limits = computeEntrainmentCoefficientLimits(params)

      expect(lambda1).toBeGreaterThan(0)
      expect(lambda2).toBeGreaterThan(0)
      expectClose(limits.farField, Math.sqrt(lambda1 * lambda2))
    }
  })

  it('returns zero near-field and far-field references for zero growth', () => {
    const params: JetParameters = {
      ...baseRectangular,
      thetaDeg: 0,
      phiDeg: 0,
    }
    const limits = computeEntrainmentCoefficientLimits(params)

    expectClose(limits.nearField, 0)
    expectClose(limits.farField, 0)

    const oneDirectionGrowth = computeEntrainmentCoefficientLimits({
      ...params,
      phiDeg: 8,
    })
    expect(oneDirectionGrowth.nearField).toBeGreaterThan(0)
    expectClose(oneDirectionGrowth.farField, 0)
  })

  it('keeps all state variables finite across valid slider ranges and presets', () => {
    const sliderCases: JetParameters[] = [
      ...PRESETS.map((preset) => preset.params),
      {
        ...baseRectangular,
        densityRatio: 1e-4,
        zetaMax: 60,
        samples: 150,
      },
      {
        ...baseRectangular,
        densityRatio: 1,
        thetaDeg: 20,
        phiDeg: 20,
        zetaMax: 60,
        samples: 150,
      },
    ]

    for (const params of sliderCases) {
      const series = generateJetSeries(params)
      for (const state of series.states) {
        expect(Object.values(state).every(Number.isFinite)).toBe(true)
      }
    }
  })

  it('computes axis-switching zeta for an AR=2 rectangular case', () => {
    const params: JetParameters = {
      ...baseRectangular,
      thetaDeg: 9.61,
      phiDeg: 5.75,
      zetaMax: 50,
      geometry: {
        geometry: 'rectangular',
        width: Math.sqrt(2),
        height: 1 / Math.sqrt(2),
      },
    }

    const zeta = computeAxisSwitchingZeta(params)
    expect(zeta).not.toBeNull()
    expect(zeta).toBeGreaterThan(0)
    expect(zeta).toBeLessThan(params.zetaMax)

    const state = getGeometryState(params, zeta ?? 0)
    expectClose(state.primarySpan, state.secondarySpan, 1e-8)
  })

  it('returns null for symmetric square cases and switching outside the sampled range', () => {
    expect(computeAxisSwitchingZeta(baseRectangular)).toBeNull()

    const params: JetParameters = {
      ...baseRectangular,
      thetaDeg: 9.61,
      phiDeg: 5.75,
      zetaMax: 2,
      geometry: {
        geometry: 'rectangular',
        width: Math.sqrt(2),
        height: 1 / Math.sqrt(2),
      },
    }

    expect(computeAxisSwitchingZeta(params)).toBeNull()
  })

  it('keeps model states finite at dimension slider extrema', () => {
    const sliderExtremeCases: JetParameters[] = [
      {
        ...baseRectangular,
        geometry: { geometry: 'rectangular', width: 0.25, height: 4 },
      },
      {
        ...baseRectangular,
        geometry: { geometry: 'elliptical', majorAxis: 4, minorAxis: 0.25 },
      },
    ]

    for (const params of sliderExtremeCases) {
      const series = generateJetSeries(params)
      expect(series.states.every((state) => Object.values(state).every(Number.isFinite))).toBe(
        true,
      )
    }
  })

  it('keeps entrainment coefficient references finite at slider extrema', () => {
    const sliderExtremeCases: JetParameters[] = [
      {
        ...baseRectangular,
        densityRatio: 1e-4,
        thetaDeg: 0,
        phiDeg: 20,
        zetaMax: 10,
        samples: 50,
        geometry: { geometry: 'rectangular', width: 0.25, height: 4 },
      },
      {
        ...baseRectangular,
        densityRatio: 1,
        thetaDeg: 20,
        phiDeg: 0,
        zetaMax: 60,
        samples: 200,
        geometry: { geometry: 'elliptical', majorAxis: 4, minorAxis: 0.25 },
      },
    ]

    for (const params of sliderExtremeCases) {
      const limits = computeEntrainmentCoefficientLimits(params)
      const numericLimits = Object.values(limits).filter(
        (value): value is number => typeof value === 'number',
      )

      expect(numericLimits.every(Number.isFinite)).toBe(true)
    }
  })
})
