import { CITATIONS } from '../data/citations'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { ComparisonCase } from './comparisonCases'
import type { DimensionalMappingResult } from './dimensionalMapping'
import type { ApplicabilityAssessment } from './regimeChecker'
import type { TipPenetrationResult } from './tipPenetration'
import {
  computeAxisSwitchingZeta,
  type JetParameters,
  type JetSeries,
  type JetState,
} from './jetModel'

export type CfdExportFormat = 'json' | 'yaml' | 'markdown' | 'openfoam-notes'

export interface CfdExportOptions {
  includeSampledStates: boolean
  includeDimensionalStates: boolean
  includeRegimeAssessment: boolean
  includeTipPenetration: boolean
  includeDataOverlays: boolean
  includeComparisonCases: boolean
  stateSampleStride: number
}

export interface CfdExportPayload {
  schemaVersion: string
  generatedAt: string
  app: {
    name: string
    version?: string
    liveUrl: string
    repositoryUrl: string
    shareUrl?: string
  }
  model: {
    family: string
    closure: string
    caveat: string
    geometry: string
    densityRatio: number
    thetaDeg: number
    phiDeg: number
    zetaMax: number
    samples: number
  }
  normalizedGeometry: JetParameters['geometry']
  dimensional?: {
    fluids?: unknown
    operatingPoint?: unknown
    scales?: unknown
    dimensionlessGroups?: unknown
  }
  axisSwitching?: {
    zeta: number | null
    note: string
  }
  sampledStates?: unknown[]
  dimensionalStates?: unknown[]
  regimeAssessment?: unknown
  tipPenetration?: unknown
  dataOverlays?: unknown[]
  comparisonCases?: unknown[]
  citations: unknown[]
  disclaimers: string[]
}

export const DEFAULT_CFD_EXPORT_OPTIONS: CfdExportOptions = {
  includeSampledStates: true,
  includeDimensionalStates: true,
  includeRegimeAssessment: true,
  includeTipPenetration: true,
  includeDataOverlays: false,
  includeComparisonCases: false,
  stateSampleStride: 5,
}

const APP_INFO = {
  name: 'Ideal Momentum Jet Explorer',
  liveUrl: 'https://ferminfm.github.io/ideal-momentum-jet-explorer/',
  repositoryUrl: 'https://github.com/ferminfm/ideal-momentum-jet-explorer',
}

export function buildCfdExportPayload(args: {
  params: JetParameters
  series: JetSeries
  dimensionalMapping?: DimensionalMappingResult | null
  regimeAssessment?: ApplicabilityAssessment | null
  tipPenetration?: TipPenetrationResult | null
  dataOverlays?: DataOverlay[]
  comparisonCases?: ComparisonCase[]
  shareUrl?: string
  options: CfdExportOptions
}): CfdExportPayload {
  const stride = sanitizeStride(args.options.stateSampleStride)
  const params = args.series.params ?? args.params
  const dimensionalStates = args.dimensionalMapping?.dimensionalSeries.states ?? []
  const tipPoints = args.tipPenetration?.points ?? []
  const dimensional = args.dimensionalMapping
    ? {
        fluids: {
          liquid: args.dimensionalMapping.operatingPoint.liquid,
          gas: args.dimensionalMapping.operatingPoint.gas,
        },
        operatingPoint: args.dimensionalMapping.operatingPoint,
        scales: args.dimensionalMapping.scales,
        dimensionlessGroups: args.dimensionalMapping.groups,
      }
    : undefined

  return {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    app: {
      ...APP_INFO,
      shareUrl: args.shareUrl,
    },
    model: {
      family: 'Ideal momentum atomizing jet reduced-order model',
      closure:
        'Conservative top-hat locally homogeneous two-phase state closure with prescribed area growth.',
      caveat:
        'Reduced-order research prototype; not validated engineering design software and not a solver-ready CFD setup.',
      geometry: params.geometry.geometry,
      densityRatio: finiteNumber(params.densityRatio),
      thetaDeg: finiteNumber(params.thetaDeg),
      phiDeg: finiteNumber(params.phiDeg),
      zetaMax: finiteNumber(params.zetaMax),
      samples: params.samples,
    },
    normalizedGeometry: { ...params.geometry },
    dimensional,
    axisSwitching: {
      zeta: computeAxisSwitchingZeta(params),
      note: 'Axis-switching location is geometric only; the model does not predict vortex dynamics.',
    },
    sampledStates: args.options.includeSampledStates
      ? args.series.states
          .filter((_, index) => index % stride === 0 || index === args.series.states.length - 1)
          .map(normalizedStateForExport)
      : undefined,
    dimensionalStates:
      args.options.includeDimensionalStates && args.dimensionalMapping
        ? dimensionalStates
            .filter(
              (_, index) =>
                index % stride === 0 || index === dimensionalStates.length - 1,
            )
            .map((state) => ({
              z_m: finiteNumber(state.z),
              area_m2: finiteNumber(state.area),
              velocity_m_s: finiteNumber(state.velocity),
              compositeDensity_kg_m3: finiteNumber(state.compositeDensity),
              dynamicPressure_Pa: finiteNumber(state.dynamicPressure),
              gasEntrainment_kg_s: finiteNumber(state.gasMassEntrainmentRate),
            }))
        : undefined,
    regimeAssessment:
      args.options.includeRegimeAssessment && args.regimeAssessment
        ? args.regimeAssessment
        : undefined,
    tipPenetration:
      args.options.includeTipPenetration && args.tipPenetration?.success
        ? {
            ...args.tipPenetration,
            points: tipPoints.filter(
              (_, index) =>
                index % stride === 0 || index === tipPoints.length - 1,
            ),
          }
        : undefined,
    dataOverlays: args.options.includeDataOverlays
      ? (args.dataOverlays ?? []).map((overlay) => ({
          ...overlay,
          note:
            overlay.sourceKind === 'user-import'
              ? 'User-imported overlay included by explicit export option; verify provenance and privacy before sharing.'
              : overlay.notes,
        }))
      : undefined,
    comparisonCases: args.options.includeComparisonCases
      ? (args.comparisonCases ?? []).map((comparisonCase) => ({
          id: comparisonCase.id,
          label: comparisonCase.label,
          visible: comparisonCase.visible,
          params: comparisonCase.params,
          createdAt: comparisonCase.createdAt,
        }))
      : undefined,
    citations: CITATIONS.map((citation) => ({
      id: citation.id,
      title: citation.title,
      plainText: citation.formats.plain,
      bibtex: citation.formats.bibtex,
    })),
    disclaimers: [
      'This export is a setup aid for reproducibility, CFD preparation, scripting, reporting, or surrogate-model workflows.',
      'It is not a solver-ready CFD case generator.',
      'It does not generate a mesh, choose a solver, define validated boundary conditions, or select numerical schemes.',
      'The reduced-order model is a research prototype and is not validated engineering design software.',
      'Verify all solver settings, material properties, units, and assumptions independently before engineering use.',
    ],
  }
}

function normalizedStateForExport(state: JetState): Record<string, number> {
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

function sanitizeStride(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_CFD_EXPORT_OPTIONS.stateSampleStride
  }

  return Math.max(1, Math.min(100, Math.round(value)))
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0
}
