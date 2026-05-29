import type { DataOverlay, OverlayVariable } from '../data/dataOverlayTypes'
import {
  generateJetSeries,
  getJetState,
  type JetParameters,
  type JetSeries,
  type JetState,
} from './jetModel'

export type CalibrationParameterMode =
  | 'symmetric-angle'
  | 'two-angles'
  | 'theta-only'
  | 'phi-only'

export type CalibrationTargetVariable =
  | 'area'
  | 'velocity'
  | 'density'
  | 'pressure'
  | 'entrainment'
  | 'coefficient'

export interface CalibrationBounds {
  thetaMinDeg: number
  thetaMaxDeg: number
  phiMinDeg: number
  phiMaxDeg: number
}

export interface CalibrationOptions {
  targetVariable: CalibrationTargetVariable
  parameterMode: CalibrationParameterMode
  bounds: CalibrationBounds
  maxIterations: number
  tolerance: number
}

export interface CalibrationInputPoint {
  zeta: number
  value: number
  weight?: number
}

export interface CalibrationMetrics {
  sse: number
  rmse: number
  mae: number
}

export interface CalibrationResult {
  success: boolean
  targetVariable: CalibrationTargetVariable
  parameterMode: CalibrationParameterMode
  fittedThetaDeg: number
  fittedPhiDeg: number
  initialThetaDeg: number
  initialPhiDeg: number
  rmse: number
  mae: number
  sse: number
  pointCount: number
  iterations: number
  message: string
  fittedSeries: JetSeries
}

export const DEFAULT_CALIBRATION_BOUNDS: CalibrationBounds = {
  thetaMinDeg: 0,
  thetaMaxDeg: 20,
  phiMinDeg: 0,
  phiMaxDeg: 20,
}

export const DEFAULT_CALIBRATION_OPTIONS: CalibrationOptions = {
  targetVariable: 'velocity',
  parameterMode: 'two-angles',
  bounds: DEFAULT_CALIBRATION_BOUNDS,
  maxIterations: 80,
  tolerance: 1e-3,
}

export const SUPPORTED_CALIBRATION_TARGETS: CalibrationTargetVariable[] = [
  'area',
  'velocity',
  'density',
  'pressure',
  'entrainment',
  'coefficient',
]

interface CandidateAngles {
  thetaDeg: number
  phiDeg: number
}

interface CandidateScore extends CandidateAngles, CalibrationMetrics {
  iterations: number
}

type ActiveCoordinate = 'symmetric' | 'theta' | 'phi'

export function isCalibrationTargetVariable(
  variable: OverlayVariable | string,
): variable is CalibrationTargetVariable {
  return SUPPORTED_CALIBRATION_TARGETS.includes(variable as CalibrationTargetVariable)
}

export function overlayToCalibrationPoints(
  overlay: DataOverlay,
  zetaMax = Number.POSITIVE_INFINITY,
): CalibrationInputPoint[] {
  return overlay.points
    .flatMap((point) => {
      if (
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        point.x < 0 ||
        point.x > zetaMax
      ) {
        return []
      }

      const yError = point.yError
      const hasPositiveError =
        yError !== undefined && Number.isFinite(yError) && yError > 0

      return [
        {
          zeta: point.x,
          value: point.y,
          weight: hasPositiveError ? 1 / yError ** 2 : 1,
        },
      ]
    })
    .sort((left, right) => left.zeta - right.zeta)
}

export function evaluateModelAtZeta(
  params: JetParameters,
  zeta: number,
  target: CalibrationTargetVariable,
): number {
  const state = getJetState(params, zeta)
  return getTargetValue(state, target)
}

export function computeCalibrationObjective(
  params: JetParameters,
  points: CalibrationInputPoint[],
  target: CalibrationTargetVariable,
): CalibrationMetrics {
  let sse = 0
  let absoluteError = 0
  let weightSum = 0
  let count = 0

  for (const point of points) {
    if (!Number.isFinite(point.zeta) || !Number.isFinite(point.value)) {
      continue
    }

    const modelValue = evaluateModelAtZeta(params, point.zeta, target)
    if (!Number.isFinite(modelValue)) {
      continue
    }

    const weight = finitePositive(point.weight) ?? 1
    const residual = modelValue - point.value
    sse += weight * residual ** 2
    absoluteError += Math.abs(residual)
    weightSum += weight
    count += 1
  }

  if (count === 0 || weightSum <= 0) {
    return {
      sse: Number.POSITIVE_INFINITY,
      rmse: Number.POSITIVE_INFINITY,
      mae: Number.POSITIVE_INFINITY,
    }
  }

  return {
    sse,
    rmse: Math.sqrt(sse / weightSum),
    mae: absoluteError / count,
  }
}

export function calibrateSpreadingAngles(
  baseParams: JetParameters,
  points: CalibrationInputPoint[],
  options: CalibrationOptions,
): CalibrationResult {
  const validPoints = points.filter(
    (point) =>
      Number.isFinite(point.zeta) &&
      Number.isFinite(point.value) &&
      point.zeta >= 0 &&
      point.zeta <= baseParams.zetaMax,
  )

  if (validPoints.length < 2) {
    return buildFailedResult(
      baseParams,
      options,
      validPoints.length,
      'Not enough finite calibration points inside the current zeta range.',
    )
  }

  const bounds = normalizeBounds(options.bounds)
  const coordinates = getActiveCoordinates(options.parameterMode)
  const grid = runCoarseGrid(baseParams, validPoints, options, bounds)
  const refined = runCoordinateRefinement(
    baseParams,
    validPoints,
    options,
    bounds,
    coordinates,
    grid,
  )
  const fittedParams = paramsWithAngles(
    baseParams,
    refined.thetaDeg,
    refined.phiDeg,
  )
  const fittedSeries = generateJetSeries(fittedParams)
  const finiteMetrics =
    Number.isFinite(refined.sse) &&
    Number.isFinite(refined.rmse) &&
    Number.isFinite(refined.mae)

  return {
    success: finiteMetrics,
    targetVariable: options.targetVariable,
    parameterMode: options.parameterMode,
    fittedThetaDeg: refined.thetaDeg,
    fittedPhiDeg: refined.phiDeg,
    initialThetaDeg: baseParams.thetaDeg,
    initialPhiDeg: baseParams.phiDeg,
    rmse: refined.rmse,
    mae: refined.mae,
    sse: refined.sse,
    pointCount: validPoints.length,
    iterations: refined.iterations,
    message: finiteMetrics
      ? 'Least-squares fit completed. Treat this as exploratory calibration, not validation.'
      : 'Calibration failed because the objective could not be evaluated.',
    fittedSeries,
  }
}

export function getTargetValue(
  state: JetState,
  target: CalibrationTargetVariable,
): number {
  switch (target) {
    case 'area':
      return state.normalizedArea
    case 'velocity':
      return state.velocityHat
    case 'density':
      return state.densityHat
    case 'pressure':
      return state.pressureHat
    case 'entrainment':
      return state.gasEntrainmentHat
    case 'coefficient':
      return state.entrainmentCoefficient
  }
}

function buildFailedResult(
  baseParams: JetParameters,
  options: CalibrationOptions,
  pointCount: number,
  message: string,
): CalibrationResult {
  return {
    success: false,
    targetVariable: options.targetVariable,
    parameterMode: options.parameterMode,
    fittedThetaDeg: baseParams.thetaDeg,
    fittedPhiDeg: baseParams.phiDeg,
    initialThetaDeg: baseParams.thetaDeg,
    initialPhiDeg: baseParams.phiDeg,
    rmse: Number.POSITIVE_INFINITY,
    mae: Number.POSITIVE_INFINITY,
    sse: Number.POSITIVE_INFINITY,
    pointCount,
    iterations: 0,
    message,
    fittedSeries: generateJetSeries(baseParams),
  }
}

function runCoarseGrid(
  baseParams: JetParameters,
  points: CalibrationInputPoint[],
  options: CalibrationOptions,
  bounds: CalibrationBounds,
): CandidateScore {
  const thetaGrid =
    options.parameterMode === 'phi-only'
      ? [clamp(baseParams.thetaDeg, bounds.thetaMinDeg, bounds.thetaMaxDeg)]
      : linspace(bounds.thetaMinDeg, bounds.thetaMaxDeg, options.parameterMode === 'two-angles' ? 41 : 81)
  const phiGrid =
    options.parameterMode === 'theta-only'
      ? [clamp(baseParams.phiDeg, bounds.phiMinDeg, bounds.phiMaxDeg)]
      : linspace(bounds.phiMinDeg, bounds.phiMaxDeg, options.parameterMode === 'two-angles' ? 41 : 81)

  let best: CandidateScore | null = null
  let iterations = 0

  if (options.parameterMode === 'symmetric-angle') {
    for (const angle of linspace(
      Math.max(bounds.thetaMinDeg, bounds.phiMinDeg),
      Math.min(bounds.thetaMaxDeg, bounds.phiMaxDeg),
      81,
    )) {
      iterations += 1
      best = betterCandidate(
        best,
        scoreCandidate(baseParams, points, options.targetVariable, angle, angle, iterations),
      )
    }
  } else {
    for (const thetaDeg of thetaGrid) {
      for (const phiDeg of phiGrid) {
        iterations += 1
        best = betterCandidate(
          best,
          scoreCandidate(
            baseParams,
            points,
            options.targetVariable,
            thetaDeg,
            phiDeg,
            iterations,
          ),
        )
      }
    }
  }

  return (
    best ??
    scoreCandidate(
      baseParams,
      points,
      options.targetVariable,
      baseParams.thetaDeg,
      baseParams.phiDeg,
      iterations,
    )
  )
}

function runCoordinateRefinement(
  baseParams: JetParameters,
  points: CalibrationInputPoint[],
  options: CalibrationOptions,
  bounds: CalibrationBounds,
  coordinates: ActiveCoordinate[],
  initial: CandidateScore,
): CandidateScore {
  let best = initial
  let refinementIterations = 0
  const thetaRange = bounds.thetaMaxDeg - bounds.thetaMinDeg
  const phiRange = bounds.phiMaxDeg - bounds.phiMinDeg
  let step = Math.max(thetaRange, phiRange) / 40
  step = Number.isFinite(step) && step > 0 ? step : 0.5
  const maxIterations = Math.max(1, Math.round(options.maxIterations))
  const tolerance = Math.max(1e-6, options.tolerance)

  while (refinementIterations < maxIterations && step > tolerance) {
    let improved = false

    for (const coordinate of coordinates) {
      for (const direction of [-1, 1]) {
        const candidate = moveCandidate(best, coordinate, direction * step, bounds)
        refinementIterations += 1
        const scored = scoreCandidate(
          baseParams,
          points,
          options.targetVariable,
          candidate.thetaDeg,
          candidate.phiDeg,
          initial.iterations + refinementIterations,
        )

        if (scored.sse < best.sse) {
          best = scored
          improved = true
        }

        if (refinementIterations >= maxIterations) {
          break
        }
      }

      if (refinementIterations >= maxIterations) {
        break
      }
    }

    if (!improved) {
      step *= 0.5
    }
  }

  return best
}

function scoreCandidate(
  baseParams: JetParameters,
  points: CalibrationInputPoint[],
  target: CalibrationTargetVariable,
  thetaDeg: number,
  phiDeg: number,
  iterations: number,
): CandidateScore {
  const metrics = computeCalibrationObjective(
    paramsWithAngles(baseParams, thetaDeg, phiDeg),
    points,
    target,
  )

  return {
    thetaDeg,
    phiDeg,
    iterations,
    ...metrics,
  }
}

function betterCandidate(
  current: CandidateScore | null,
  candidate: CandidateScore,
): CandidateScore {
  return current === null || candidate.sse < current.sse ? candidate : current
}

function moveCandidate(
  candidate: CandidateAngles,
  coordinate: ActiveCoordinate,
  delta: number,
  bounds: CalibrationBounds,
): CandidateAngles {
  if (coordinate === 'symmetric') {
    const angle = clamp(
      candidate.thetaDeg + delta,
      Math.max(bounds.thetaMinDeg, bounds.phiMinDeg),
      Math.min(bounds.thetaMaxDeg, bounds.phiMaxDeg),
    )
    return { thetaDeg: angle, phiDeg: angle }
  }

  if (coordinate === 'theta') {
    return {
      ...candidate,
      thetaDeg: clamp(candidate.thetaDeg + delta, bounds.thetaMinDeg, bounds.thetaMaxDeg),
    }
  }

  return {
    ...candidate,
    phiDeg: clamp(candidate.phiDeg + delta, bounds.phiMinDeg, bounds.phiMaxDeg),
  }
}

function getActiveCoordinates(mode: CalibrationParameterMode): ActiveCoordinate[] {
  switch (mode) {
    case 'symmetric-angle':
      return ['symmetric']
    case 'theta-only':
      return ['theta']
    case 'phi-only':
      return ['phi']
    case 'two-angles':
      return ['theta', 'phi']
  }
}

function normalizeBounds(bounds: CalibrationBounds): CalibrationBounds {
  const thetaA = clamp(finiteNumber(bounds.thetaMinDeg) ?? 0, 0, 20)
  const thetaB = clamp(finiteNumber(bounds.thetaMaxDeg) ?? 20, 0, 20)
  const phiA = clamp(finiteNumber(bounds.phiMinDeg) ?? 0, 0, 20)
  const phiB = clamp(finiteNumber(bounds.phiMaxDeg) ?? 20, 0, 20)

  return {
    thetaMinDeg: Math.min(thetaA, thetaB),
    thetaMaxDeg: Math.max(thetaA, thetaB),
    phiMinDeg: Math.min(phiA, phiB),
    phiMaxDeg: Math.max(phiA, phiB),
  }
}

function paramsWithAngles(
  params: JetParameters,
  thetaDeg: number,
  phiDeg: number,
): JetParameters {
  return {
    ...params,
    thetaDeg,
    phiDeg,
    geometry: { ...params.geometry },
  }
}

function linspace(min: number, max: number, count: number): number[] {
  if (count <= 1 || Math.abs(max - min) < 1e-12) {
    return [min]
  }

  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, index) => min + step * index)
}

function finiteNumber(value: number): number | undefined {
  return Number.isFinite(value) ? value : undefined
}

function finitePositive(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
