import { describe, expect, it } from 'vitest'
import type { DataOverlay } from '../data/dataOverlayTypes'
import { createComparisonCase } from './comparisonCases'
import {
  DEFAULT_CFD_EXPORT_OPTIONS,
  buildCfdExportPayload,
} from './cfdExport'
import { buildDimensionalMapping } from './dimensionalMapping'
import { generateJetSeries, type JetParameters } from './jetModel'
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

describe('CFD export payload builder', () => {
  it('includes required metadata, citations, disclaimers, and normalized model fields', () => {
    const series = generateJetSeries(params)
    const payload = buildCfdExportPayload({
      params,
      series,
      options: DEFAULT_CFD_EXPORT_OPTIONS,
    })

    expect(payload.schemaVersion).toBe('1.0.0')
    expect(payload.app.name).toBe('Ideal Momentum Jet Explorer')
    expect(payload.model.geometry).toBe('rectangular')
    expect(payload.citations.length).toBeGreaterThanOrEqual(3)
    expect(payload.disclaimers.join(' ')).toMatch(/not a solver-ready CFD case/i)
  })

  it('uses state sample stride to reduce sampled normalized states', () => {
    const series = generateJetSeries(params)
    const payload = buildCfdExportPayload({
      params,
      series,
      options: { ...DEFAULT_CFD_EXPORT_OPTIONS, stateSampleStride: 5 },
    })

    expect(payload.sampledStates).toHaveLength(5)
  })

  it('omits dimensional data when dimensional mapping is absent', () => {
    const series = generateJetSeries(params)
    const payload = buildCfdExportPayload({
      params,
      series,
      options: { ...DEFAULT_CFD_EXPORT_OPTIONS, includeDimensionalStates: true },
    })

    expect(payload.dimensional).toBeUndefined()
    expect(payload.dimensionalStates).toBeUndefined()
  })

  it('includes dimensional blocks, regime assessment, and tip penetration when available', () => {
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
    const payload = buildCfdExportPayload({
      params: mapping.normalizedParams,
      series: mapping.normalizedSeries,
      dimensionalMapping: mapping,
      regimeAssessment: assessment,
      tipPenetration,
      options: DEFAULT_CFD_EXPORT_OPTIONS,
    })

    expect(payload.dimensional?.scales).toBeTruthy()
    expect(payload.dimensionalStates?.length).toBeGreaterThan(0)
    expect(payload.regimeAssessment).toBeTruthy()
    expect(payload.tipPenetration).toBeTruthy()
  })

  it('includes data overlays and comparison cases only when requested', () => {
    const series = generateJetSeries(params)
    const overlay = createOverlay()
    const comparison = createComparisonCase(params, { label: 'Comparison' })
    const offPayload = buildCfdExportPayload({
      params,
      series,
      dataOverlays: [overlay],
      comparisonCases: [comparison],
      options: {
        ...DEFAULT_CFD_EXPORT_OPTIONS,
        includeDataOverlays: false,
        includeComparisonCases: false,
      },
    })
    const onPayload = buildCfdExportPayload({
      params,
      series,
      dataOverlays: [overlay],
      comparisonCases: [comparison],
      options: {
        ...DEFAULT_CFD_EXPORT_OPTIONS,
        includeDataOverlays: true,
        includeComparisonCases: true,
      },
    })

    expect(offPayload.dataOverlays).toBeUndefined()
    expect(offPayload.comparisonCases).toBeUndefined()
    expect(onPayload.dataOverlays).toHaveLength(1)
    expect(onPayload.comparisonCases).toHaveLength(1)
  })

  it('does not emit NaN or Infinity for normal exports', () => {
    const series = generateJetSeries(params)
    const payload = buildCfdExportPayload({
      params,
      series,
      options: DEFAULT_CFD_EXPORT_OPTIONS,
    })
    const json = JSON.stringify(payload)

    expect(json).not.toContain('NaN')
    expect(json).not.toContain('Infinity')
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
