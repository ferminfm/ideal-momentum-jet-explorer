import { getJetState, type JetSeries } from '../model/jetModel'

export interface NormalizedDropletCoordinate {
  x: number
  y: number
  z: number
}

export interface FluidElementFrame {
  centerZ: number
  width: number
  height: number
  halfWidth: number
  halfHeight: number
  depth: number
  zeta: number
}

export const FLUID_ELEMENT_DROPLET_COUNT = 24
export const FLUID_ELEMENT_TRAVEL_SECONDS = 7

export function wrapElementZeta(zeta: number, zetaMax: number): number {
  if (!Number.isFinite(zeta) || !Number.isFinite(zetaMax) || zetaMax <= 0) {
    return 0
  }

  const wrapped = zeta % zetaMax
  return wrapped < 0 ? wrapped + zetaMax : wrapped
}

export function advanceElementZeta(
  zeta: number,
  zetaMax: number,
  deltaSeconds: number,
  speed: number,
): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    return wrapElementZeta(zeta, zetaMax)
  }

  const safeSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 1
  const dzeta = (zetaMax / FLUID_ELEMENT_TRAVEL_SECONDS) * safeSpeed * deltaSeconds
  return wrapElementZeta(zeta + dzeta, zetaMax)
}

export function getFluidElementFrame(
  series: JetSeries,
  zeta: number,
  sceneScale: number,
): FluidElementFrame {
  const safeZeta = Math.min(Math.max(zeta, 0), series.params.zetaMax)
  const state = getJetState(series.params, safeZeta)
  const depth = getFluidElementDepth(series, sceneScale)
  const width = state.primarySpan * sceneScale
  const height = state.secondarySpan * sceneScale

  return {
    centerZ: state.axialZ * sceneScale + depth / 2,
    width,
    height,
    halfWidth: width / 2,
    halfHeight: height / 2,
    depth,
    zeta: safeZeta,
  }
}

export function getFluidElementDepth(series: JetSeries, sceneScale: number): number {
  const rawDepth = 0.18 * series.equivalentDiameter * sceneScale
  return Math.min(0.52, Math.max(0.14, rawDepth))
}

export function createNormalizedDropletCoordinates(
  geometry: JetSeries['params']['geometry']['geometry'],
  count = FLUID_ELEMENT_DROPLET_COUNT,
): NormalizedDropletCoordinate[] {
  return Array.from({ length: count }, (_, index) => {
    const xSeed = halton(index + 1, 2)
    const ySeed = halton(index + 1, 3)
    const zSeed = halton(index + 1, 5)
    const z = zSeed * 1.55 - 0.775

    if (geometry === 'rectangular') {
      return {
        x: xSeed * 1.8 - 0.9,
        y: ySeed * 1.8 - 0.9,
        z,
      }
    }

    const radius = Math.sqrt(xSeed) * 0.9
    const angle = ySeed * Math.PI * 2

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z,
    }
  })
}

function halton(index: number, base: number): number {
  let fraction = 1
  let result = 0
  let current = index

  while (current > 0) {
    fraction /= base
    result += fraction * (current % base)
    current = Math.floor(current / base)
  }

  return result
}
