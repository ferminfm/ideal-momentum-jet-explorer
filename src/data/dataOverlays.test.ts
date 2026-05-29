import { describe, expect, it } from 'vitest'
import { BUILTIN_DATA_OVERLAYS } from './dataOverlays'

const SYNTHETIC_CALIBRATION_IDS = [
  'synthetic-calibration-square-velocity-theta8',
  'synthetic-calibration-rectangular-area-theta9p61-phi5p75',
  'synthetic-calibration-elliptical-density-theta9p61-phi5p75',
  'synthetic-calibration-rectangular-entrainment-theta9p61-phi5p75',
  'synthetic-calibration-noisy-velocity-with-error',
]

describe('built-in data overlays', () => {
  it('includes representative synthetic calibration overlays', () => {
    const ids = BUILTIN_DATA_OVERLAYS.map((overlay) => overlay.id)

    for (const id of SYNTHETIC_CALIBRATION_IDS) {
      expect(ids).toContain(id)
    }
  })

  it('keeps built-in overlay ids unique', () => {
    const ids = BUILTIN_DATA_OVERLAYS.map((overlay) => overlay.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('marks built-in overlays as synthetic non-public comparison aids', () => {
    for (const overlay of BUILTIN_DATA_OVERLAYS) {
      expect(overlay.points.length).toBeGreaterThanOrEqual(2)
      expect(overlay.sourceKind).toBe('synthetic-demo')
      expect(overlay.publicData).toBe(false)
      expect(overlay.notes.toLowerCase()).toMatch(/not measured|not .*validation/)
    }
  })

  it('includes y-error values for the noisy weighted velocity fixture', () => {
    const overlay = BUILTIN_DATA_OVERLAYS.find(
      (candidate) => candidate.id === 'synthetic-calibration-noisy-velocity-with-error',
    )

    expect(overlay).toBeDefined()
    expect(overlay?.points.every((point) => point.yError !== undefined)).toBe(true)
  })
})
