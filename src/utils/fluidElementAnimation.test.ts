import { describe, expect, it } from 'vitest'
import { generateJetSeries, type JetParameters } from '../model/jetModel'
import {
  advanceElementZeta,
  createNormalizedDropletCoordinates,
  FLUID_ELEMENT_DROPLET_COUNT,
  getFluidElementFrame,
  wrapElementZeta,
} from './fluidElementAnimation'

const params: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 5.75,
  phiDeg: 9.61,
  zetaMax: 50,
  samples: 80,
  geometry: {
    geometry: 'rectangular',
    width: Math.sqrt(2),
    height: 1 / Math.sqrt(2),
  },
}

describe('traveling fluid element helpers', () => {
  it('wraps element zeta cyclically', () => {
    expect(wrapElementZeta(12, 10)).toBeCloseTo(2)
    expect(wrapElementZeta(-1, 10)).toBeCloseTo(9)
    expect(wrapElementZeta(Number.NaN, 10)).toBe(0)
  })

  it('advances element zeta with speed and wraps at zeta max', () => {
    const zeta = advanceElementZeta(9, 10, 1, 1)
    expect(zeta).toBeGreaterThan(0)
    expect(zeta).toBeLessThan(10)
  })

  it('returns finite moving-element dimensions', () => {
    const series = generateJetSeries(params)
    const frame = getFluidElementFrame(series, 12, 0.35)

    expect(Object.values(frame).every(Number.isFinite)).toBe(true)
    expect(frame.width).toBeGreaterThan(0)
    expect(frame.height).toBeGreaterThan(0)
    expect(frame.depth).toBeGreaterThan(0)
  })

  it('generates deterministic rectangular droplet coordinates within the element', () => {
    const droplets = createNormalizedDropletCoordinates('rectangular')

    expect(droplets).toHaveLength(FLUID_ELEMENT_DROPLET_COUNT)
    for (const droplet of droplets) {
      expect(Math.abs(droplet.x)).toBeLessThanOrEqual(0.9)
      expect(Math.abs(droplet.y)).toBeLessThanOrEqual(0.9)
      expect(Math.abs(droplet.z)).toBeLessThanOrEqual(0.775)
    }
  })

  it('generates elliptical droplet coordinates inside a normalized disk', () => {
    const droplets = createNormalizedDropletCoordinates('elliptical')

    expect(droplets).toHaveLength(FLUID_ELEMENT_DROPLET_COUNT)
    for (const droplet of droplets) {
      expect(Math.hypot(droplet.x, droplet.y)).toBeLessThanOrEqual(0.9)
      expect(Math.abs(droplet.z)).toBeLessThanOrEqual(0.775)
    }
  })
})
