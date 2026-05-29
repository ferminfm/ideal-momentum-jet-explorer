import { describe, expect, it } from 'vitest'
import { AIR_ROOM_CONDITIONS, WATER_ROOM_TEMPERATURE } from '../data/fluidPresets'
import { generateJetSeries, type JetParameters, type JetState } from './jetModel'
import {
  computeDimensionlessGroups,
  computeEngineeringScales,
  computeInitialAreaFromEquivalentDiameter,
  computeInjectionVelocity,
  densityRatioFromFluids,
  dimensionalizeJetSeries,
  dimensionalizeJetState,
  type DimensionalOperatingPoint,
} from './engineering'

const TOLERANCE = 1e-12

const velocityPoint: DimensionalOperatingPoint = {
  liquid: WATER_ROOM_TEMPERATURE,
  gas: AIR_ROOM_CONDITIONS,
  equivalentDiameter: 0.001,
  dischargeCoefficient: 1,
  velocityMode: 'velocity',
  injectionVelocity: 10,
}

const syntheticInitialState: JetState = {
  axialZeta: 0,
  axialZ: 0,
  area: 1,
  normalizedArea: 1,
  dAreaHatDzeta: 0.4,
  primarySpan: 1,
  secondarySpan: 1,
  primaryHat: 1,
  secondaryHat: 1,
  delta: 1 + velocityPoint.gas.density / velocityPoint.liquid.density,
  velocityHat: 1,
  densityHat: 1,
  densityHatCheck: 1,
  pressureHat: 1,
  gasEntrainmentHat: 0,
  gasEntrainmentHatAlt: 0,
  entrainmentCoefficient: 0.02,
}

function expectClose(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

function finiteNumbers(value: unknown): number[] {
  if (typeof value === 'number') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(finiteNumbers)
  }

  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(finiteNumbers)
  }

  return []
}

describe('dimensional engineering model foundation', () => {
  it('uses explicit injection velocity in velocity mode', () => {
    expect(computeInjectionVelocity(velocityPoint)).toBe(10)
  })

  it('computes injection velocity from pressure drop mode', () => {
    const pressureDropPoint: DimensionalOperatingPoint = {
      ...velocityPoint,
      velocityMode: 'pressureDrop',
      injectionVelocity: undefined,
      pressureDrop: 100_000,
    }

    expectClose(
      computeInjectionVelocity(pressureDropPoint),
      Math.sqrt((2 * 100_000) / WATER_ROOM_TEMPERATURE.density),
    )
  })

  it('computes initial area from equivalent diameter', () => {
    const equivalentDiameter = 0.001

    expectClose(
      computeInitialAreaFromEquivalentDiameter(equivalentDiameter),
      (Math.PI * equivalentDiameter ** 2) / 4,
    )
  })

  it('computes density ratio from fluid properties', () => {
    expectClose(
      densityRatioFromFluids(WATER_ROOM_TEMPERATURE, AIR_ROOM_CONDITIONS),
      1.2 / 997,
    )
  })

  it('computes liquid Reynolds, Weber, Ohnesorge, and gas Mach estimates', () => {
    const groups = computeDimensionlessGroups(velocityPoint)

    expect(groups.reynoldsLiquid).toBeGreaterThan(0)
    expect(groups.weberLiquid ?? Number.NaN).toBeGreaterThan(0)
    expect(groups.ohnesorgeLiquid ?? Number.NaN).toBeGreaterThan(0)
    expect(groups.gasMachEstimate ?? Number.NaN).toBeGreaterThan(0)
    expectClose(groups.gasMachEstimate ?? Number.NaN, 10 / 343)
  })

  it('dimensionalizes the normalized nozzle-exit state', () => {
    const scales = computeEngineeringScales(velocityPoint)
    const dimensionalState = dimensionalizeJetState(syntheticInitialState, scales)

    expectClose(dimensionalState.z, 0)
    expectClose(dimensionalState.area, scales.initialArea)
    expectClose(dimensionalState.velocity, scales.injectionVelocity)
    expectClose(dimensionalState.compositeDensity, scales.liquidDensity)
    expectClose(dimensionalState.dynamicPressure, scales.dynamicPressureScale)
    expectClose(dimensionalState.gasMassEntrainmentRate, 0)
    expectClose(
      dimensionalState.entrainmentCoefficient,
      syntheticInitialState.entrainmentCoefficient,
    )
  })

  it('keeps engineering scales, groups, and dimensionalized states finite', () => {
    const params: JetParameters = {
      densityRatio: densityRatioFromFluids(WATER_ROOM_TEMPERATURE, AIR_ROOM_CONDITIONS),
      thetaDeg: 8,
      phiDeg: 8,
      zetaMax: 20,
      samples: 24,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    }
    const dimensionalSeries = dimensionalizeJetSeries(generateJetSeries(params), velocityPoint)

    for (const value of finiteNumbers(dimensionalSeries)) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })
})
