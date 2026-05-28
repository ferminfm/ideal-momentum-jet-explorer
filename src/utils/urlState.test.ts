import { describe, expect, it } from 'vitest'
import { PRESET_CUSTOM, createDefaultExplorerState } from '../types/appState'
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

  it('uses a valid preset as the parameter seed', () => {
    const sanitized = mergeStateWithDefaults(
      sanitizeDecodedState(decodeStateFromQuery('?preset=circular-limit')),
    )

    expect(sanitized.selectedPresetId).toBe('circular-limit')
    expect(sanitized.params.geometry.geometry).toBe('elliptical')
  })
})
