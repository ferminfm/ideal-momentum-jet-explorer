import { describe, expect, it } from 'vitest'
import {
  generateJetSeries,
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

  it('keeps all state variables finite across valid slider ranges and presets', () => {
    const sliderCases: JetParameters[] = [
      ...PRESETS.map((preset) => preset.params),
      {
        ...baseRectangular,
        densityRatio: 1e-4,
        zetaMax: 100,
        samples: 150,
      },
      {
        ...baseRectangular,
        densityRatio: 1,
        thetaDeg: 20,
        phiDeg: 20,
        zetaMax: 100,
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
})
