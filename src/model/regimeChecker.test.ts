import { describe, expect, it } from 'vitest'
import type { DimensionlessGroups } from './engineering'
import { assessModelApplicability } from './regimeChecker'

const favorableGroups: DimensionlessGroups = {
  reynoldsLiquid: 50_000,
  weberLiquid: 500,
  weberGas: 20,
  ohnesorgeLiquid: 0.02,
  gasMachEstimate: 0.1,
}

function assess(groups: Partial<DimensionlessGroups> = {}) {
  return assessModelApplicability({
    densityRatio: 0.0012,
    dimensionlessGroups: { ...favorableGroups, ...groups },
    geometryAspectRatio: 2,
    thetaDeg: 8,
    phiDeg: 8,
    inputMode: 'dimensional',
  })
}

describe('regime applicability checker', () => {
  it('reports normalized mode as dimensional-screening unavailable', () => {
    const assessment = assessModelApplicability({
      densityRatio: 0.0012,
      geometryAspectRatio: 1,
      thetaDeg: 8,
      phiDeg: 8,
      inputMode: 'normalized',
    })

    expect(assessment.overall).toBe('caution')
    expect(assessment.regimeLabel).toBe('Normalized exploration only')
    expect(assessment.messages.some((message) => message.id === 'dimensional-data-required')).toBe(true)
  })

  it('flags low Reynolds number', () => {
    const assessment = assess({ reynoldsLiquid: 1200 })

    expect(assessment.overall).toBe('warning')
    expect(assessment.messages.some((message) => message.id === 'low-reynolds')).toBe(true)
  })

  it('flags very low liquid Weber number as outside the intended regime', () => {
    const assessment = assess({ weberLiquid: 0.5 })

    expect(assessment.overall).toBe('outside')
    expect(assessment.messages.some((message) => message.id === 'surface-tension-dominated')).toBe(true)
  })

  it('allows high Reynolds, high Weber, and low Mach settings as good', () => {
    const assessment = assess()

    expect(assessment.overall).toBe('good')
    expect(assessment.regimeLabel).toContain('Plausible exploratory')
  })

  it('adds a caution for gas Mach estimates above 0.3', () => {
    const assessment = assess({ gasMachEstimate: 0.45 })

    expect(assessment.overall).toBe('caution')
    expect(assessment.messages.some((message) => message.id === 'compressibility-caution')).toBe(true)
  })

  it('adds a warning for gas Mach estimates above 0.8', () => {
    const assessment = assess({ gasMachEstimate: 0.95 })

    expect(assessment.overall).toBe('warning')
    expect(assessment.messages.some((message) => message.id === 'high-mach')).toBe(true)
  })

  it('adds a warning for highly viscous Ohnesorge range', () => {
    const assessment = assess({ ohnesorgeLiquid: 1.2 })

    expect(assessment.overall).toBe('warning')
    expect(assessment.messages.some((message) => message.id === 'high-ohnesorge')).toBe(true)
  })

  it('adds a caution for extreme aspect ratio', () => {
    const assessment = assessModelApplicability({
      densityRatio: 0.0012,
      dimensionlessGroups: favorableGroups,
      geometryAspectRatio: 5,
      thetaDeg: 8,
      phiDeg: 8,
      inputMode: 'dimensional',
    })

    expect(assessment.overall).toBe('caution')
    expect(assessment.messages.some((message) => message.id === 'extreme-aspect-ratio')).toBe(true)
  })

  it('aggregates severity with outside dominating warning and caution', () => {
    const assessment = assess({
      reynoldsLiquid: 1000,
      weberLiquid: 0.2,
      gasMachEstimate: 0.5,
    })

    expect(assessment.overall).toBe('outside')
  })

  it('handles null and nonfinite group values without emitting invalid values', () => {
    const assessment = assessModelApplicability({
      densityRatio: Number.NaN,
      dimensionlessGroups: {
        reynoldsLiquid: Number.POSITIVE_INFINITY,
        weberLiquid: null,
        weberGas: null,
        ohnesorgeLiquid: null,
        gasMachEstimate: null,
      },
      geometryAspectRatio: Number.NaN,
      thetaDeg: Number.NaN,
      phiDeg: Number.NaN,
      inputMode: 'dimensional',
    })

    expect(assessment.overall).toBe('good')
    expect(assessment.messages.every((message) => Number.isFinite(message.value ?? 0))).toBe(true)
  })
})
