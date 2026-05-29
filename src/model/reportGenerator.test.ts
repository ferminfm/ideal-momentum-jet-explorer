import { describe, expect, it } from 'vitest'
import type { DataOverlay } from '../data/dataOverlayTypes'
import { createComparisonCase } from './comparisonCases'
import { DEFAULT_CFD_EXPORT_OPTIONS, buildCfdExportPayload } from './cfdExport'
import { buildDimensionalMapping } from './dimensionalMapping'
import { generateJetSeries, type JetParameters } from './jetModel'
import {
  DEFAULT_REPORT_OPTIONS,
  buildReportPayload,
} from './reportGenerator'
import { assessModelApplicability } from './regimeChecker'
import { computeTipPenetration } from './tipPenetration'
import { DEFAULT_DIMENSIONAL_SETTINGS } from '../types/appState'

const params: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 8,
  phiDeg: 6,
  zetaMax: 20,
  samples: 21,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 0.5,
  },
}

describe('report payload builder', () => {
  it('includes required metadata, citations, disclaimer, and core summaries', () => {
    const series = generateJetSeries(params)
    const payload = buildReportPayload({
      params,
      series,
      options: DEFAULT_REPORT_OPTIONS,
    })

    expect(payload.schemaVersion).toBe('1.0.0')
    expect(payload.app.name).toBe('Ideal Momentum Jet Explorer')
    expect(payload.modelSummary).toBeTruthy()
    expect(payload.geometrySummary).toBeTruthy()
    expect(payload.currentStateSummary).toBeTruthy()
    expect(payload.citations.length).toBeGreaterThanOrEqual(3)
    expect(payload.disclaimers.join(' ')).toMatch(/research prototype/i)
  })

  it('uses sampled-state stride to reduce table rows', () => {
    const series = generateJetSeries(params)
    const payload = buildReportPayload({
      params,
      series,
      options: {
        ...DEFAULT_REPORT_OPTIONS,
        includeSampledStateTable: true,
        stateSampleStride: 5,
      },
    })

    expect(payload.sampledStates).toHaveLength(5)
  })

  it('omits data overlays and comparison cases unless requested', () => {
    const series = generateJetSeries(params)
    const overlay = createOverlay()
    const comparison = createComparisonCase(params, { label: 'Comparison case' })
    const offPayload = buildReportPayload({
      params,
      series,
      dataOverlays: [overlay],
      comparisonCases: [comparison],
      options: {
        ...DEFAULT_REPORT_OPTIONS,
        includeDataOverlays: false,
        includeComparisonCases: false,
      },
    })
    const onPayload = buildReportPayload({
      params,
      series,
      dataOverlays: [overlay],
      comparisonCases: [comparison],
      options: {
        ...DEFAULT_REPORT_OPTIONS,
        includeDataOverlays: true,
        includeComparisonCases: true,
      },
    })

    expect(offPayload.dataOverlays).toBeUndefined()
    expect(offPayload.comparisonCases).toBeUndefined()
    expect(onPayload.dataOverlays).toHaveLength(1)
    expect(onPayload.comparisonCases).toHaveLength(1)
  })

  it('includes dimensional, regime, tip, and CFD summaries when available', () => {
    const mapping = buildDimensionalMapping(params, DEFAULT_DIMENSIONAL_SETTINGS)
    const assessment = assessModelApplicability({
      densityRatio: mapping.normalizedParams.densityRatio,
      dimensionlessGroups: mapping.groups,
      geometryAspectRatio: 2,
      thetaDeg: mapping.normalizedParams.thetaDeg,
      phiDeg: mapping.normalizedParams.phiDeg,
      inputMode: 'dimensional',
    })
    const tipPenetration = computeTipPenetration(mapping.normalizedSeries)
    const cfdPayload = buildCfdExportPayload({
      params: mapping.normalizedParams,
      series: mapping.normalizedSeries,
      dimensionalMapping: mapping,
      regimeAssessment: assessment,
      tipPenetration,
      options: DEFAULT_CFD_EXPORT_OPTIONS,
    })
    const payload = buildReportPayload({
      params: mapping.normalizedParams,
      series: mapping.normalizedSeries,
      dimensionalMapping: mapping,
      regimeAssessment: assessment,
      tipPenetration,
      cfdExportPayload: cfdPayload,
      options: DEFAULT_REPORT_OPTIONS,
    })

    expect(payload.dimensionalSummary).toBeTruthy()
    expect(payload.regimeAssessment).toBeTruthy()
    expect(payload.tipPenetration).toBeTruthy()
    expect(payload.cfdExportSummary).toBeTruthy()
  })
})

function createOverlay(): DataOverlay {
  return {
    id: 'user-overlay',
    label: 'User overlay',
    variable: 'velocity',
    sourceKind: 'user-import',
    source: 'local file',
    xLabel: 'zeta',
    yLabel: 'vhat',
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 0.9 },
    ],
    notes: 'User-imported data; local to this browser session.',
    publicData: false,
    visible: true,
    color: '#000000',
    createdAt: '2026-05-29T00:00:00.000Z',
  }
}
