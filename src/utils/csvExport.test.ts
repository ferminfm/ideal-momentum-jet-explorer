import { describe, expect, it } from 'vitest'
import { createComparisonCase } from '../model/comparisonCases'
import { buildDimensionalMapping } from '../model/dimensionalMapping'
import { generateJetSeries, type JetParameters } from '../model/jetModel'
import { DEFAULT_DIMENSIONAL_SETTINGS } from '../types/appState'
import { buildJetCsv } from './csvExport'

const params: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 8,
  phiDeg: 8,
  zetaMax: 20,
  samples: 5,
  geometry: {
    geometry: 'rectangular',
    width: 1,
    height: 1,
  },
}

describe('CSV export', () => {
  it('includes the expected header columns', () => {
    const csv = buildJetCsv(generateJetSeries(params))
    const header = csv.split('\n')[0]

    expect(header).toContain('caseLabel,index,zeta,z_over_De,Ahat,dAhat_dzeta')
    expect(header).toContain('vhat,rhohat,phat,mghat,KA')
    expect(header).toContain('geometry,rhoStar,thetaDeg,phiDeg,B0,H0,a0,b0')
  })

  it('emits one row per sampled point plus a header', () => {
    const csv = buildJetCsv(generateJetSeries(params))

    expect(csv.split('\n')).toHaveLength(params.samples + 1)
  })

  it('exports the normalized inlet values at zeta = 0', () => {
    const csv = buildJetCsv(generateJetSeries(params))
    const firstRow = csv.split('\n')[1].split(',')

    expect(firstRow[0]).toBe('Current')
    expect(firstRow[1]).toBe('0')
    expect(Number(firstRow[2])).toBeCloseTo(0)
    expect(Number(firstRow[4])).toBeCloseTo(1)
    expect(Number(firstRow[6])).toBeCloseTo(1)
    expect(Number(firstRow[7])).toBeCloseTo(1)
    expect(Number(firstRow[8])).toBeCloseTo(1)
    expect(Number(firstRow[9])).toBeCloseTo(0)
  })

  it('exports current and visible comparison cases with case labels', () => {
    const visibleCase = createComparisonCase(params, {
      label: 'Visible comparison',
      visible: true,
    })
    const hiddenCase = createComparisonCase(params, {
      label: 'Hidden comparison',
      visible: false,
    })
    const csv = buildJetCsv(generateJetSeries(params), [visibleCase, hiddenCase])
    const rows = csv.split('\n')

    expect(rows).toHaveLength(params.samples * 2 + 1)
    expect(rows.some((row) => row.startsWith('Visible comparison,'))).toBe(true)
    expect(rows.some((row) => row.startsWith('Hidden comparison,'))).toBe(false)
  })

  it('adds dimensional columns for dimensional engineering exports', () => {
    const mapping = buildDimensionalMapping(params, DEFAULT_DIMENSIONAL_SETTINGS)
    const csv = buildJetCsv(mapping.normalizedSeries, [], {
      inputMode: 'dimensional',
      dimensionalSeries: mapping.dimensionalSeries,
    })
    const rows = csv.split('\n')
    const header = rows[0]
    const firstRow = rows[1].split(',')
    const zIndex = header.split(',').indexOf('z_m')
    const velocityIndex = header.split(',').indexOf('velocity_m_s')
    const reynoldsIndex = header.split(',').indexOf('Reynolds')

    expect(header).toContain('inputMode,z_m,area_m2,velocity_m_s')
    expect(header).toContain('Reynolds,Weber,Ohnesorge,gasMachEstimate')
    expect(firstRow[header.split(',').indexOf('inputMode')]).toBe('dimensional')
    expect(Number(firstRow[zIndex])).toBeCloseTo(0)
    expect(Number(firstRow[velocityIndex])).toBeCloseTo(10)
    expect(Number(firstRow[reynoldsIndex])).toBeGreaterThan(0)
  })
})
