import { CITATIONS } from '../data/citations'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { ComparisonCase } from './comparisonCases'
import type { CfdExportPayload } from './cfdExport'
import type { DimensionalMappingResult } from './dimensionalMapping'
import type { ApplicabilityAssessment } from './regimeChecker'
import type { TipPenetrationResult } from './tipPenetration'
import {
  computeAxisSwitchingZeta,
  getEquivalentDiameter,
  getInitialArea,
  type JetParameters,
  type JetSeries,
  type JetState,
} from './jetModel'

export type ReportFormat = 'html' | 'markdown'

export interface ReportOptions {
  includeDimensionalSummary: boolean
  includeRegimeAssessment: boolean
  includeSampledStateTable: boolean
  includeComparisonCases: boolean
  includeDataOverlays: boolean
  includeTipPenetration: boolean
  includeCfdExportSummary: boolean
  includeCitations: boolean
  includeDisclaimer: boolean
  stateSampleStride: number
  reportTitle: string
  authorName: string
}

export interface ReportPayload {
  schemaVersion: string
  generatedAt: string
  title: string
  author: string
  app: {
    name: string
    liveUrl: string
    repositoryUrl: string
    shareUrl?: string
  }
  modelSummary: unknown
  geometrySummary: unknown
  dimensionalSummary?: unknown
  regimeAssessment?: unknown
  currentStateSummary: unknown
  sampledStates?: unknown[]
  comparisonCases?: unknown[]
  dataOverlays?: unknown[]
  tipPenetration?: unknown
  cfdExportSummary?: unknown
  citations: unknown[]
  disclaimers: string[]
}

export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  includeDimensionalSummary: true,
  includeRegimeAssessment: true,
  includeSampledStateTable: false,
  includeComparisonCases: false,
  includeDataOverlays: false,
  includeTipPenetration: true,
  includeCfdExportSummary: true,
  includeCitations: true,
  includeDisclaimer: true,
  stateSampleStride: 10,
  reportTitle: 'Ideal Momentum Jet Explorer report',
  authorName: 'Fermín Franco-Medrano',
}

const APP_INFO = {
  name: 'Ideal Momentum Jet Explorer',
  liveUrl: 'https://ferminfm.github.io/ideal-momentum-jet-explorer/',
  repositoryUrl: 'https://github.com/ferminfm/ideal-momentum-jet-explorer',
}

export function buildReportPayload(args: {
  params: JetParameters
  series: JetSeries
  dimensionalMapping?: DimensionalMappingResult | null
  regimeAssessment?: ApplicabilityAssessment | null
  tipPenetration?: TipPenetrationResult | null
  cfdExportPayload?: CfdExportPayload | null
  comparisonCases?: ComparisonCase[]
  dataOverlays?: DataOverlay[]
  shareUrl?: string
  options: ReportOptions
}): ReportPayload {
  const stride = sanitizeStride(args.options.stateSampleStride)
  const params = args.series.params ?? args.params
  const terminalState = args.series.states[args.series.states.length - 1]

  return {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    title: args.options.reportTitle.trim() || DEFAULT_REPORT_OPTIONS.reportTitle,
    author: args.options.authorName.trim() || DEFAULT_REPORT_OPTIONS.authorName,
    app: {
      ...APP_INFO,
      shareUrl: args.shareUrl,
    },
    modelSummary: buildModelSummary(params),
    geometrySummary: buildGeometrySummary(params),
    dimensionalSummary:
      args.options.includeDimensionalSummary && args.dimensionalMapping
        ? buildDimensionalSummary(args.dimensionalMapping)
        : undefined,
    regimeAssessment:
      args.options.includeRegimeAssessment && args.regimeAssessment
        ? args.regimeAssessment
        : undefined,
    currentStateSummary: buildStateSummary(terminalState),
    sampledStates: args.options.includeSampledStateTable
      ? args.series.states
          .filter((_, index) => index % stride === 0 || index === args.series.states.length - 1)
          .map(buildSampledState)
      : undefined,
    comparisonCases: args.options.includeComparisonCases
      ? (args.comparisonCases ?? []).map(buildComparisonCaseSummary)
      : undefined,
    dataOverlays: args.options.includeDataOverlays
      ? (args.dataOverlays ?? []).map(buildDataOverlaySummary)
      : undefined,
    tipPenetration:
      args.options.includeTipPenetration && args.tipPenetration?.success
        ? buildTipPenetrationSummary(args.tipPenetration, stride)
        : undefined,
    cfdExportSummary:
      args.options.includeCfdExportSummary && args.cfdExportPayload
        ? buildCfdExportSummary(args.cfdExportPayload)
        : undefined,
    citations: args.options.includeCitations
      ? CITATIONS.map((citation) => ({
          id: citation.id,
          title: citation.title,
          plainText: citation.formats.plain,
          bibtex: citation.formats.bibtex,
        }))
      : [],
    disclaimers: args.options.includeDisclaimer ? buildDisclaimers() : [],
  }
}

function buildModelSummary(params: JetParameters): Record<string, unknown> {
  return {
    family: 'Ideal momentum atomizing jet reduced-order model',
    closure: 'Conservative top-hat locally homogeneous flow closure with prescribed area growth.',
    geometry: params.geometry.geometry,
    densityRatio: finiteNumber(params.densityRatio),
    thetaDeg: finiteNumber(params.thetaDeg),
    phiDeg: finiteNumber(params.phiDeg),
    zetaMax: finiteNumber(params.zetaMax),
    samples: params.samples,
    axisSwitchingZeta: computeAxisSwitchingZeta(params),
  }
}

function buildGeometrySummary(params: JetParameters): Record<string, unknown> {
  const base = {
    geometry: params.geometry.geometry,
    normalizedInitialArea: finiteNumber(getInitialArea(params.geometry)),
    normalizedEquivalentDiameter: finiteNumber(getEquivalentDiameter(params.geometry)),
  }

  return params.geometry.geometry === 'rectangular'
    ? {
        ...base,
        width: finiteNumber(params.geometry.width),
        height: finiteNumber(params.geometry.height),
      }
    : {
        ...base,
        majorAxis: finiteNumber(params.geometry.majorAxis),
        minorAxis: finiteNumber(params.geometry.minorAxis),
      }
}

function buildDimensionalSummary(
  mapping: DimensionalMappingResult,
): Record<string, unknown> {
  return {
    liquid: mapping.operatingPoint.liquid,
    gas: mapping.operatingPoint.gas,
    velocityMode: mapping.operatingPoint.velocityMode,
    pressureDropPa: mapping.operatingPoint.pressureDrop ?? null,
    dischargeCoefficient: mapping.operatingPoint.dischargeCoefficient,
    scales: mapping.scales,
    dimensionlessGroups: mapping.groups,
  }
}

function buildStateSummary(state: JetState): Record<string, number> {
  return {
    zeta: finiteNumber(state.axialZeta),
    Ahat: finiteNumber(state.normalizedArea),
    vhat: finiteNumber(state.velocityHat),
    rhohat: finiteNumber(state.densityHat),
    phat: finiteNumber(state.pressureHat),
    mhat_g: finiteNumber(state.gasEntrainmentHat),
    K_A: finiteNumber(state.entrainmentCoefficient),
  }
}

function buildSampledState(state: JetState): Record<string, number> {
  return buildStateSummary(state)
}

function buildComparisonCaseSummary(comparisonCase: ComparisonCase): Record<string, unknown> {
  return {
    id: comparisonCase.id,
    label: comparisonCase.label,
    visible: comparisonCase.visible,
    color: comparisonCase.color,
    createdAt: comparisonCase.createdAt,
    geometry: comparisonCase.params.geometry.geometry,
    thetaDeg: comparisonCase.params.thetaDeg,
    phiDeg: comparisonCase.params.phiDeg,
    densityRatio: comparisonCase.params.densityRatio,
  }
}

function buildDataOverlaySummary(overlay: DataOverlay): Record<string, unknown> {
  return {
    id: overlay.id,
    label: overlay.label,
    variable: overlay.variable,
    sourceKind: overlay.sourceKind,
    source: overlay.source,
    citationKey: overlay.citationKey ?? null,
    pointCount: overlay.points.length,
    visible: overlay.visible,
    notes:
      overlay.sourceKind === 'user-import'
        ? `${overlay.notes} Included by explicit report option; verify privacy before sharing.`
        : overlay.notes,
    points: overlay.points.map((point) => ({
      x: finiteNumber(point.x),
      y: finiteNumber(point.y),
      xError: point.xError === undefined ? undefined : finiteNumber(point.xError),
      yError: point.yError === undefined ? undefined : finiteNumber(point.yError),
    })),
  }
}

function buildTipPenetrationSummary(
  result: TipPenetrationResult,
  stride: number,
): Record<string, unknown> {
  return {
    tauAtZetaMax: finiteNumber(result.tauAtZetaMax),
    zetaMax: finiteNumber(result.zetaMax),
    pointCount: result.points.length,
    message: result.message,
    dimensional: result.points.some((point) => point.t !== undefined || point.z !== undefined),
    points: result.points.filter((_, index) => index % stride === 0 || index === result.points.length - 1),
  }
}

function buildCfdExportSummary(payload: CfdExportPayload): Record<string, unknown> {
  return {
    schemaVersion: payload.schemaVersion,
    sampledStates: payload.sampledStates?.length ?? 0,
    dimensionalStates: payload.dimensionalStates?.length ?? 0,
    hasDimensionalBlock: payload.dimensional !== undefined,
    hasRegimeAssessment: payload.regimeAssessment !== undefined,
    hasTipPenetration: payload.tipPenetration !== undefined,
    dataOverlays: payload.dataOverlays?.length ?? 0,
    comparisonCases: payload.comparisonCases?.length ?? 0,
    caveat:
      'CFD/config exports are setup aids only and are not solver-ready CFD cases.',
  }
}

function buildDisclaimers(): string[] {
  return [
    'This report is generated by an exploratory research prototype.',
    'The model is a reduced-order conservative top-hat locally homogeneous closure with prescribed area growth and prescribed spreading half-angles.',
    'Results are not validated engineering design software and require independent validation before engineering use.',
    'Regime/applicability screening is heuristic guidance only, not a validated breakup-regime map.',
    'Data overlays are comparison aids and do not automatically validate the model.',
    'CFD/config exports, when referenced, are setup aids only and are not solver-ready CFD cases.',
  ]
}

function sanitizeStride(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_REPORT_OPTIONS.stateSampleStride
  }

  return Math.max(1, Math.min(100, Math.round(value)))
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0
}
