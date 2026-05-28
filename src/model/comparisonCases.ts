import {
  computeEntrainmentCoefficientLimits,
  computeAxisSwitchingZeta,
  generateJetSeries,
  getAspectRatio,
  type JetParameters,
  type JetSeries,
} from './jetModel'
import { PRESETS, cloneParams } from './presets'

export const MAX_COMPARISON_CASES = 8

export const COMPARISON_COLORS = [
  '#0072b2',
  '#d55e00',
  '#009e73',
  '#cc79a7',
  '#e69f00',
  '#56b4e9',
  '#882255',
  '#44aa99',
] as const

export interface ComparisonCase {
  id: string
  label: string
  color: string
  visible: boolean
  params: JetParameters
  series: JetSeries
  createdAt: string
}

interface CompactComparisonCase {
  i?: string
  l?: string
  c?: string
  v?: 0 | 1
  t?: string
  p?: {
    g?: 'r' | 'e'
    r?: number
    th?: number
    ph?: number
    z?: number
    s?: number
    w?: number
    h?: number
    a?: number
    b?: number
  }
}

const PRESET_LABELS = new Map(PRESETS.map((preset) => [preset.id, preset.name]))

export function createComparisonCase(
  params: JetParameters,
  options: {
    presetId?: string
    index?: number
    id?: string
    label?: string
    color?: string
    visible?: boolean
    createdAt?: string
  } = {},
): ComparisonCase {
  const snapshotParams = cloneParams(params)

  return {
    id: options.id ?? createComparisonId(),
    label: options.label?.trim() || makeComparisonLabel(snapshotParams, options.presetId),
    color: options.color ?? COMPARISON_COLORS[(options.index ?? 0) % COMPARISON_COLORS.length],
    visible: options.visible ?? true,
    params: snapshotParams,
    series: generateJetSeries(snapshotParams),
    createdAt: options.createdAt ?? new Date().toISOString(),
  }
}

export function makeComparisonLabel(params: JetParameters, presetId?: string): string {
  const presetName = presetId === undefined ? undefined : PRESET_LABELS.get(presetId)
  if (presetName === 'Circular limit' || presetName === 'Square limit') {
    return presetName
  }

  const ratio = getAspectRatio(params.geometry)
  const density = formatScientific(params.densityRatio)

  if (params.geometry.geometry === 'rectangular') {
    if (Math.abs(ratio - 1) < 0.015 && Math.abs(params.thetaDeg - params.phiDeg) < 0.01) {
      return `Square limit, rho*=${density}`
    }

    return `Rectangular AR=${formatCompact(ratio)}, rho*=${density}`
  }

  if (Math.abs(ratio - 1) < 0.015 && Math.abs(params.thetaDeg - params.phiDeg) < 0.01) {
    return `Circular limit, rho*=${density}`
  }

  return `Elliptical a0/b0=${formatCompact(ratio)}, theta=${formatCompact(
    params.thetaDeg,
  )} deg, phi=${formatCompact(params.phiDeg)} deg`
}

export function describeComparisonCase(comparisonCase: ComparisonCase): string {
  const { params, series } = comparisonCase
  const axisSwitchingZeta = computeAxisSwitchingZeta(params)
  const coefficientLimits = computeEntrainmentCoefficientLimits(params)
  const lines = [
    comparisonCase.label,
    `geometry: ${params.geometry.geometry}`,
    `rho*: ${formatScientific(params.densityRatio)}`,
  ]

  if (params.geometry.geometry === 'rectangular') {
    lines.push(
      `B0: ${formatCompact(params.geometry.width)}`,
      `H0: ${formatCompact(params.geometry.height)}`,
    )
  } else {
    lines.push(
      `a0: ${formatCompact(params.geometry.majorAxis)}`,
      `b0: ${formatCompact(params.geometry.minorAxis)}`,
    )
  }

  lines.push(
    `theta: ${formatCompact(params.thetaDeg)} deg`,
    `phi: ${formatCompact(params.phiDeg)} deg`,
    `zeta max: ${formatCompact(params.zetaMax)}`,
    `sample count: ${params.samples}`,
    `De: ${formatCompact(series.equivalentDiameter, 4)}`,
    `K_A(0): ${formatCompact(coefficientLimits.nearField, 5)}`,
    `K_A(∞): ${formatCompact(coefficientLimits.farField, 5)}`,
    `axis switching: ${
      axisSwitchingZeta === null ? 'none in range' : `zeta ${formatCompact(axisSwitchingZeta)}`
    }`,
  )

  return lines.join('\n')
}

export function setComparisonCaseVisibility(
  cases: ComparisonCase[],
  id: string,
  visible: boolean,
): ComparisonCase[] {
  return cases.map((comparisonCase) =>
    comparisonCase.id === id ? { ...comparisonCase, visible } : comparisonCase,
  )
}

export function setAllComparisonCasesVisibility(
  cases: ComparisonCase[],
  visible: boolean,
): ComparisonCase[] {
  return cases.map((comparisonCase) => ({ ...comparisonCase, visible }))
}

export function removeComparisonCase(cases: ComparisonCase[], id: string): ComparisonCase[] {
  return cases.filter((comparisonCase) => comparisonCase.id !== id)
}

export function clearComparisonCases(): ComparisonCase[] {
  return []
}

export function serializeComparisonCases(cases: ComparisonCase[]): string | undefined {
  const compactCases: CompactComparisonCase[] = cases
    .slice(0, MAX_COMPARISON_CASES)
    .map((comparisonCase) => ({
      i: comparisonCase.id,
      l: comparisonCase.label,
      c: comparisonCase.color,
      v: comparisonCase.visible ? 1 : 0,
      t: comparisonCase.createdAt,
      p: compactParams(comparisonCase.params),
    }))

  return compactCases.length === 0 ? undefined : JSON.stringify(compactCases)
}

export function deserializeComparisonCases(value: string | undefined): ComparisonCase[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .slice(0, MAX_COMPARISON_CASES)
      .map((entry, index) => restoreComparisonCase(entry, index))
      .filter((entry): entry is ComparisonCase => entry !== null)
  } catch {
    return []
  }
}

function restoreComparisonCase(entry: unknown, index: number): ComparisonCase | null {
  if (!isCompactComparisonCase(entry) || entry.p === undefined) {
    return null
  }

  const params = restoreParams(entry.p)
  if (params === null) {
    return null
  }

  return createComparisonCase(params, {
    id: typeof entry.i === 'string' ? entry.i : undefined,
    label: typeof entry.l === 'string' ? entry.l : undefined,
    color: typeof entry.c === 'string' ? entry.c : undefined,
    visible: entry.v !== 0,
    createdAt: typeof entry.t === 'string' ? entry.t : undefined,
    index,
  })
}

function compactParams(params: JetParameters): CompactComparisonCase['p'] {
  const common = {
    g: params.geometry.geometry === 'rectangular' ? 'r' : 'e',
    r: roundForUrl(params.densityRatio),
    th: roundForUrl(params.thetaDeg),
    ph: roundForUrl(params.phiDeg),
    z: roundForUrl(params.zetaMax),
    s: Math.round(params.samples),
  } satisfies NonNullable<CompactComparisonCase['p']>

  if (params.geometry.geometry === 'rectangular') {
    return {
      ...common,
      w: roundForUrl(params.geometry.width),
      h: roundForUrl(params.geometry.height),
    }
  }

  return {
    ...common,
    a: roundForUrl(params.geometry.majorAxis),
    b: roundForUrl(params.geometry.minorAxis),
  }
}

function restoreParams(params: NonNullable<CompactComparisonCase['p']>): JetParameters | null {
  const densityRatio = finitePositive(params.r)
  const thetaDeg = finiteNumber(params.th)
  const phiDeg = finiteNumber(params.ph)
  const zetaMax = finitePositive(params.z)
  const samples = finitePositive(params.s)

  if (
    densityRatio === undefined ||
    thetaDeg === undefined ||
    phiDeg === undefined ||
    zetaMax === undefined ||
    samples === undefined
  ) {
    return null
  }

  if (params.g === 'r') {
    const width = finitePositive(params.w)
    const height = finitePositive(params.h)
    if (width === undefined || height === undefined) {
      return null
    }

    return {
      densityRatio: clamp(densityRatio, 1e-4, 1),
      thetaDeg: clamp(thetaDeg, 0, 20),
      phiDeg: clamp(phiDeg, 0, 20),
      zetaMax: clamp(zetaMax, 10, 60),
      samples: Math.round(clamp(samples, 50, 200)),
      geometry: {
        geometry: 'rectangular',
        width: clamp(width, 0.25, 4),
        height: clamp(height, 0.25, 4),
      },
    }
  }

  if (params.g === 'e') {
    const majorAxis = finitePositive(params.a)
    const minorAxis = finitePositive(params.b)
    if (majorAxis === undefined || minorAxis === undefined) {
      return null
    }

    return {
      densityRatio: clamp(densityRatio, 1e-4, 1),
      thetaDeg: clamp(thetaDeg, 0, 20),
      phiDeg: clamp(phiDeg, 0, 20),
      zetaMax: clamp(zetaMax, 10, 60),
      samples: Math.round(clamp(samples, 50, 200)),
      geometry: {
        geometry: 'elliptical',
        majorAxis: clamp(majorAxis, 0.25, 4),
        minorAxis: clamp(minorAxis, 0.25, 4),
      },
    }
  }

  return null
}

function createComparisonId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isCompactComparisonCase(value: unknown): value is CompactComparisonCase {
  return typeof value === 'object' && value !== null
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function finitePositive(value: unknown): number | undefined {
  const numberValue = finiteNumber(value)
  return numberValue !== undefined && numberValue > 0 ? numberValue : undefined
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function roundForUrl(value: number): number {
  return Number(value.toPrecision(8))
}

function formatCompact(value: number, digits = 3): string {
  return Number(value.toFixed(digits)).toString()
}

function formatScientific(value: number): string {
  return value.toExponential(1).replace('e-0', 'e-').replace('e+0', 'e+')
}
