import { describe, expect, it } from 'vitest'
import { generateJetSeries, type JetParameters } from '../model/jetModel'
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

    expect(header).toContain('index,zeta,z_over_De,Ahat,dAhat_dzeta')
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

    expect(firstRow[0]).toBe('0')
    expect(Number(firstRow[1])).toBeCloseTo(0)
    expect(Number(firstRow[3])).toBeCloseTo(1)
    expect(Number(firstRow[5])).toBeCloseTo(1)
    expect(Number(firstRow[6])).toBeCloseTo(1)
    expect(Number(firstRow[7])).toBeCloseTo(1)
    expect(Number(firstRow[8])).toBeCloseTo(0)
  })
})
