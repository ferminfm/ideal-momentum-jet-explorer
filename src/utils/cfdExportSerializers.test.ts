import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CFD_EXPORT_OPTIONS,
  buildCfdExportPayload,
} from '../model/cfdExport'
import { buildDimensionalMapping } from '../model/dimensionalMapping'
import { generateJetSeries, type JetParameters } from '../model/jetModel'
import { DEFAULT_DIMENSIONAL_SETTINGS } from '../types/appState'
import {
  serializeCfdExportJson,
  serializeCfdExportMarkdown,
  serializeCfdExportYaml,
  serializeOpenFoamNotes,
} from './cfdExportSerializers'

const params: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 8,
  phiDeg: 8,
  zetaMax: 10,
  samples: 11,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 1,
  },
}

describe('CFD export serializers', () => {
  it('serializes JSON that parses back to the payload', () => {
    const payload = createPayload()
    const parsed = JSON.parse(serializeCfdExportJson(payload))

    expect(parsed.schemaVersion).toBe(payload.schemaVersion)
    expect(parsed.model.geometry).toBe('rectangular')
  })

  it('serializes YAML-like text with top-level model data', () => {
    const yaml = serializeCfdExportYaml(createPayload())

    expect(yaml).toContain('schemaVersion:')
    expect(yaml).toContain('model:')
    expect(yaml).toContain('disclaimers:')
  })

  it('serializes Markdown with caveat and citations', () => {
    const markdown = serializeCfdExportMarkdown(createPayload())

    expect(markdown).toContain('# Ideal Momentum Jet Configuration Summary')
    expect(markdown).toMatch(/not validated engineering design software/i)
    expect(markdown).toContain('Original circular ideal momentum jet model')
  })

  it('serializes OpenFOAM notes with explicit not-solver-ready warning', () => {
    const notes = serializeOpenFoamNotes(createPayload(true))

    expect(notes).toContain('OpenFOAM-oriented setup notes')
    expect(notes).toMatch(/not a solver-ready case/i)
    expect(notes).toContain('system/')
    expect(notes).toContain('constant/')
    expect(notes).toContain('0/')
  })
})

function createPayload(dimensional = false) {
  const series = generateJetSeries(params)
  const mapping = dimensional ? buildDimensionalMapping(params, DEFAULT_DIMENSIONAL_SETTINGS) : null

  return buildCfdExportPayload({
    params: mapping?.normalizedParams ?? params,
    series: mapping?.normalizedSeries ?? series,
    dimensionalMapping: mapping,
    options: DEFAULT_CFD_EXPORT_OPTIONS,
  })
}
