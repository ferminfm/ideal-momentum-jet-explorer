import { describe, expect, it } from 'vitest'
import { createComparisonCase } from '../model/comparisonCases'
import {
  DEFAULT_DIMENSIONAL_SETTINGS,
  PRESET_CUSTOM,
  createDefaultExplorerState,
} from '../types/appState'
import {
  decodeStateFromQuery,
  encodeStateToQuery,
  mergeStateWithDefaults,
  sanitizeDecodedState,
} from './urlState'

describe('URL state helpers', () => {
  it('encodes and decodes rectangular state', () => {
    const state = createDefaultExplorerState()
    state.params.geometry = {
      geometry: 'rectangular',
      width: 1.25,
      height: 0.75,
    }
    state.params.densityRatio = 0.0025
    state.language = 'ja'
    state.densityLogScale = true
    state.overlayId = 'synthetic-equal-density-reference'
    state.crossSectionZeta = 12.5
    state.comparisonCases = [
      createComparisonCase(state.params, {
        id: 'saved-case',
        label: 'Saved case',
        visible: true,
      }),
    ]

    const decoded = decodeStateFromQuery(encodeStateToQuery(state).toString())
    const sanitized = mergeStateWithDefaults(sanitizeDecodedState(decoded))

    expect(sanitized.params.geometry.geometry).toBe('rectangular')
    if (sanitized.params.geometry.geometry === 'rectangular') {
      expect(sanitized.params.geometry.width).toBeCloseTo(1.25)
      expect(sanitized.params.geometry.height).toBeCloseTo(0.75)
    }
    expect(sanitized.params.densityRatio).toBeCloseTo(0.0025)
    expect(sanitized.language).toBe('ja')
    expect(sanitized.densityLogScale).toBe(true)
    expect(sanitized.overlayId).toBe('synthetic-equal-density-reference')
    expect(sanitized.crossSectionZeta).toBeCloseTo(12.5)
    expect(sanitized.comparisonCases).toHaveLength(1)
    expect(sanitized.comparisonCases[0].id).toBe('saved-case')
    expect(sanitized.comparisonCases[0].label).toBe('Saved case')
  })

  it('sanitizes invalid and out-of-range query parameters', () => {
    const sanitized = mergeStateWithDefaults(
      sanitizeDecodedState(
        decodeStateFromQuery(
          '?lang=fr&geometry=elliptical&rhoStar=-2&a0=10&b0=bad&theta=200&phi=-10&zetaMax=400&sampleCount=2&crossSectionZeta=900&overlay=unknown',
        ),
      ),
    )

    expect(sanitized.params.geometry.geometry).toBe('elliptical')
    if (sanitized.params.geometry.geometry === 'elliptical') {
      expect(sanitized.params.geometry.majorAxis).toBe(4)
      expect(sanitized.params.geometry.minorAxis).toBe(1)
    }
    expect(sanitized.params.densityRatio).toBeCloseTo(0.0012)
    expect(sanitized.params.thetaDeg).toBe(20)
    expect(sanitized.params.phiDeg).toBe(0)
    expect(sanitized.params.zetaMax).toBe(60)
    expect(sanitized.params.samples).toBe(50)
    expect(sanitized.crossSectionZeta).toBe(60)
    expect(sanitized.overlayId).toBe('none')
    expect(sanitized.language).toBe('en')
    expect(sanitized.selectedPresetId).toBe(PRESET_CUSTOM)
  })

  it('sanitizes supported language query parameters', () => {
    const sanitized = mergeStateWithDefaults(
      sanitizeDecodedState(decodeStateFromQuery('?lang=es')),
    )

    expect(sanitized.language).toBe('es')
  })

  it('round-trips dimensional engineering settings', () => {
    const state = createDefaultExplorerState()
    state.inputMode = 'dimensional'
    state.params.geometry = {
      geometry: 'rectangular',
      width: 1,
      height: 1,
    }
    state.dimensionalSettings = {
      ...DEFAULT_DIMENSIONAL_SETTINGS,
      liquidId: 'diesel-like-fuel',
      gasId: 'high-density-chamber-gas',
      rectangularWidthMm: 1.5,
      rectangularHeightMm: 0.4,
      ellipticalMajorAxisMm: 2.25,
      ellipticalMinorAxisMm: 0.75,
      velocityMode: 'pressureDrop',
      injectionVelocity: 18,
      pressureDropKPa: 2500,
      dischargeCoefficient: 0.82,
    }

    const decoded = decodeStateFromQuery(encodeStateToQuery(state).toString())
    const sanitized = mergeStateWithDefaults(sanitizeDecodedState(decoded))

    expect(sanitized.inputMode).toBe('dimensional')
    expect(sanitized.dimensionalSettings.liquidId).toBe('diesel-like-fuel')
    expect(sanitized.dimensionalSettings.gasId).toBe('high-density-chamber-gas')
    expect(sanitized.dimensionalSettings.rectangularWidthMm).toBeCloseTo(1.5)
    expect(sanitized.dimensionalSettings.rectangularHeightMm).toBeCloseTo(0.4)
    expect(sanitized.dimensionalSettings.ellipticalMajorAxisMm).toBeCloseTo(2.25)
    expect(sanitized.dimensionalSettings.ellipticalMinorAxisMm).toBeCloseTo(0.75)
    expect(sanitized.dimensionalSettings.velocityMode).toBe('pressureDrop')
    expect(sanitized.dimensionalSettings.injectionVelocity).toBeCloseTo(18)
    expect(sanitized.dimensionalSettings.pressureDropKPa).toBeCloseTo(2500)
    expect(sanitized.dimensionalSettings.dischargeCoefficient).toBeCloseTo(0.82)
  })

  it('sanitizes invalid dimensional query parameters', () => {
    const sanitized = mergeStateWithDefaults(
      sanitizeDecodedState(
        decodeStateFromQuery(
          '?mode=dimensional&liquid=unknown&gas=bad&Bmm=200&Hmm=-2&amm=0&bmm=abc&vmode=bad&v0=1000&dpkPa=0&Cd=9',
        ),
      ),
    )

    expect(sanitized.inputMode).toBe('dimensional')
    expect(sanitized.dimensionalSettings.liquidId).toBe(
      DEFAULT_DIMENSIONAL_SETTINGS.liquidId,
    )
    expect(sanitized.dimensionalSettings.gasId).toBe(DEFAULT_DIMENSIONAL_SETTINGS.gasId)
    expect(sanitized.dimensionalSettings.rectangularWidthMm).toBe(10)
    expect(sanitized.dimensionalSettings.rectangularHeightMm).toBe(0.05)
    expect(sanitized.dimensionalSettings.ellipticalMajorAxisMm).toBe(0.05)
    expect(sanitized.dimensionalSettings.ellipticalMinorAxisMm).toBe(
      DEFAULT_DIMENSIONAL_SETTINGS.ellipticalMinorAxisMm,
    )
    expect(sanitized.dimensionalSettings.velocityMode).toBe(
      DEFAULT_DIMENSIONAL_SETTINGS.velocityMode,
    )
    expect(sanitized.dimensionalSettings.injectionVelocity).toBe(300)
    expect(sanitized.dimensionalSettings.pressureDropKPa).toBe(1)
    expect(sanitized.dimensionalSettings.dischargeCoefficient).toBe(1.2)
  })

  it('uses a valid preset as the parameter seed', () => {
    const sanitized = mergeStateWithDefaults(
      sanitizeDecodedState(decodeStateFromQuery('?preset=circular-limit')),
    )

    expect(sanitized.selectedPresetId).toBe('circular-limit')
    expect(sanitized.params.geometry.geometry).toBe('elliptical')
  })
})
