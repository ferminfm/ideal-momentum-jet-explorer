import { describe, expect, it } from 'vitest'
import { AIR_ROOM_CONDITIONS, WATER_ROOM_TEMPERATURE } from '../data/fluidPresets'
import {
  DEFAULT_DIMENSIONAL_SETTINGS,
  type DimensionalSettings,
} from '../types/appState'
import { computeInjectionVelocity } from './engineering'
import {
  buildDimensionalMapping,
  buildDimensionalOperatingPoint,
  mapDimensionalSettingsToJetParameters,
} from './dimensionalMapping'
import type { JetParameters } from './jetModel'

const baseParams: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 8,
  phiDeg: 8,
  zetaMax: 20,
  samples: 25,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 1,
  },
}

const baseSettings: DimensionalSettings = {
  ...DEFAULT_DIMENSIONAL_SETTINGS,
  liquidId: WATER_ROOM_TEMPERATURE.id,
  gasId: AIR_ROOM_CONDITIONS.id,
}

describe('dimensional mapping', () => {
  it('maps rectangular physical dimensions to equivalent-diameter normalized geometry', () => {
    const settings = {
      ...baseSettings,
      rectangularWidthMm: 1,
      rectangularHeightMm: 0.5,
    }
    const mapped = mapDimensionalSettingsToJetParameters(baseParams, settings)
    const width = 1e-3
    const height = 0.5e-3
    const equivalentDiameter = Math.sqrt((4 * width * height) / Math.PI)

    expect(mapped.densityRatio).toBeCloseTo(1.2 / 997)
    expect(mapped.geometry.geometry).toBe('rectangular')
    if (mapped.geometry.geometry === 'rectangular') {
      expect(mapped.geometry.width).toBeCloseTo(width / equivalentDiameter)
      expect(mapped.geometry.height).toBeCloseTo(height / equivalentDiameter)
    }
  })

  it('maps elliptical full axes to equivalent-diameter normalized geometry', () => {
    const currentParams: JetParameters = {
      ...baseParams,
      geometry: {
        geometry: 'elliptical',
        majorAxis: 1,
        minorAxis: 1,
      },
    }
    const settings = {
      ...baseSettings,
      ellipticalMajorAxisMm: 2,
      ellipticalMinorAxisMm: 0.5,
    }
    const mapped = mapDimensionalSettingsToJetParameters(currentParams, settings)
    const majorAxis = 2e-3
    const minorAxis = 0.5e-3
    const equivalentDiameter = Math.sqrt(majorAxis * minorAxis)

    expect(mapped.geometry.geometry).toBe('elliptical')
    if (mapped.geometry.geometry === 'elliptical') {
      expect(mapped.geometry.majorAxis).toBeCloseTo(majorAxis / equivalentDiameter)
      expect(mapped.geometry.minorAxis).toBeCloseTo(minorAxis / equivalentDiameter)
    }
  })

  it('uses direct velocity mode for the operating point', () => {
    const operatingPoint = buildDimensionalOperatingPoint(
      { ...baseSettings, velocityMode: 'velocity', injectionVelocity: 42 },
      'rectangular',
    )

    expect(computeInjectionVelocity(operatingPoint)).toBeCloseTo(42)
  })

  it('computes pressure-drop velocity from Cd and liquid density', () => {
    const operatingPoint = buildDimensionalOperatingPoint(
      {
        ...baseSettings,
        velocityMode: 'pressureDrop',
        pressureDropKPa: 100,
        dischargeCoefficient: 0.9,
      },
      'rectangular',
    )
    const expectedVelocity = 0.9 * Math.sqrt((2 * 100000) / 997)

    expect(computeInjectionVelocity(operatingPoint)).toBeCloseTo(expectedVelocity)
  })

  it('builds finite engineering scales and groups', () => {
    const mapping = buildDimensionalMapping(baseParams, baseSettings)

    expect(mapping.scales.equivalentDiameter).toBeGreaterThan(0)
    expect(mapping.scales.injectionVelocity).toBeCloseTo(10)
    expect(mapping.groups.reynoldsLiquid).toBeGreaterThan(0)
    expect(mapping.groups.weberLiquid).toBeGreaterThan(0)
    expect(mapping.groups.ohnesorgeLiquid).toBeGreaterThan(0)
    expect(mapping.groups.gasMachEstimate).toBeGreaterThan(0)
    for (const state of mapping.dimensionalSeries.states) {
      expect(Number.isFinite(state.velocity)).toBe(true)
      expect(Number.isFinite(state.dynamicPressure)).toBe(true)
    }
  })
})
