import type { JetSeries } from './jetModel'

export interface TipPenetrationPoint {
  index: number
  zeta: number
  tau: number
  vhat: number
  z?: number
  t?: number
  velocity?: number
}

export interface TipPenetrationOptions {
  maxTau?: number
  pointCount: number
  useSeriesRange: boolean
}

export interface TipPenetrationResult {
  points: TipPenetrationPoint[]
  tauAtZetaMax: number
  zetaMax: number
  success: boolean
  message: string
}

export interface TipPenetrationDimensionalScales {
  equivalentDiameter: number
  injectionVelocity: number
}

export interface CumulativeTipTimePoint {
  zeta: number
  tau: number
  vhat: number
}

const DEFAULT_POINT_COUNT = 180
const MAX_POINT_COUNT = 1000

export function computeTauOfZeta(series: JetSeries): CumulativeTipTimePoint[] {
  if (series.states.length < 2) {
    throw new Error('Tip penetration requires at least two sampled jet states.')
  }

  const cumulative: CumulativeTipTimePoint[] = []
  let tau = 0
  let previousZeta = finite(series.states[0].axialZeta, 'Initial zeta')
  let previousVhat = positiveFinite(series.states[0].velocityHat, 'Initial vhat')

  cumulative.push({
    zeta: previousZeta,
    tau,
    vhat: previousVhat,
  })

  for (let index = 1; index < series.states.length; index += 1) {
    const state = series.states[index]
    const zeta = finite(state.axialZeta, 'zeta')
    const vhat = positiveFinite(state.velocityHat, 'vhat')
    const dzeta = zeta - previousZeta

    if (!(dzeta > 0)) {
      throw new Error('Tip penetration requires strictly increasing zeta samples.')
    }

    tau += 0.5 * ((1 / previousVhat) + (1 / vhat)) * dzeta
    cumulative.push({ zeta, tau, vhat })
    previousZeta = zeta
    previousVhat = vhat
  }

  return cumulative
}

export function interpolateZetaAtTau(
  cumulative: CumulativeTipTimePoint[],
  tau: number,
): number {
  return interpolateAtTau(cumulative, tau, 'zeta')
}

export function computeTipPenetration(
  series: JetSeries,
  options: Partial<TipPenetrationOptions> = {},
): TipPenetrationResult {
  try {
    const cumulative = computeTauOfZeta(series)
    const tauAtZetaMax = cumulative[cumulative.length - 1].tau
    const zetaMax = cumulative[cumulative.length - 1].zeta
    const pointCount = clampPointCount(options.pointCount ?? DEFAULT_POINT_COUNT)
    const requestedMaxTau =
      options.useSeriesRange === false && options.maxTau !== undefined
        ? finite(options.maxTau, 'Maximum normalized time')
        : tauAtZetaMax
    const maxTau = Math.max(0, Math.min(requestedMaxTau, tauAtZetaMax))

    const points = Array.from({ length: pointCount }, (_, index) => {
      const fraction = pointCount === 1 ? 0 : index / (pointCount - 1)
      const tau = maxTau * fraction

      return {
        index,
        tau,
        zeta: interpolateAtTau(cumulative, tau, 'zeta'),
        vhat: interpolateAtTau(cumulative, tau, 'vhat'),
      }
    })

    return {
      points,
      tauAtZetaMax,
      zetaMax,
      success: true,
      message: 'Quasi-steady penetration estimate computed.',
    }
  } catch (error) {
    return {
      points: [],
      tauAtZetaMax: 0,
      zetaMax: series.params.zetaMax,
      success: false,
      message: error instanceof Error ? error.message : 'Could not compute penetration.',
    }
  }
}

export function dimensionalizeTipPenetration(
  result: TipPenetrationResult,
  scales: TipPenetrationDimensionalScales,
): TipPenetrationResult {
  positiveFinite(scales.equivalentDiameter, 'Equivalent diameter')
  positiveFinite(scales.injectionVelocity, 'Injection velocity')

  return {
    ...result,
    points: result.points.map((point) => ({
      ...point,
      z: point.zeta * scales.equivalentDiameter,
      t: (point.tau * scales.equivalentDiameter) / scales.injectionVelocity,
      velocity: point.vhat * scales.injectionVelocity,
    })),
  }
}

function interpolateAtTau(
  cumulative: CumulativeTipTimePoint[],
  tau: number,
  key: 'zeta' | 'vhat',
): number {
  const value = finite(tau, 'Normalized time')

  if (value <= cumulative[0].tau) {
    return cumulative[0][key]
  }

  const last = cumulative[cumulative.length - 1]
  if (value >= last.tau) {
    return last[key]
  }

  for (let index = 1; index < cumulative.length; index += 1) {
    const right = cumulative[index]
    if (value <= right.tau) {
      const left = cumulative[index - 1]
      const span = right.tau - left.tau
      const fraction = span <= 0 ? 0 : (value - left.tau) / span

      return left[key] + fraction * (right[key] - left[key])
    }
  }

  return last[key]
}

function clampPointCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_POINT_COUNT
  }

  return Math.max(2, Math.min(MAX_POINT_COUNT, Math.round(value)))
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`)
  }

  return value
}

function positiveFinite(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be positive and finite.`)
  }

  return value
}
