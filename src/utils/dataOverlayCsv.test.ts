import { describe, expect, it } from 'vitest'
import {
  buildOverlayFromCsvSelection,
  getNumericColumns,
  parseCsvText,
} from './dataOverlayCsv'

describe('data overlay CSV utilities', () => {
  it('parses headers, trims values, and ignores blank rows', () => {
    const table = parseCsvText(' zeta , vhat , note \n 0 , 1 , inlet \n\n 5 , 0.8 , downstream \n')

    expect(table.columns).toEqual(['zeta', 'vhat', 'note'])
    expect(table.rows).toHaveLength(2)
    expect(table.rows[0].zeta).toBe('0')
    expect(table.rows[0].note).toBe('inlet')
  })

  it('detects numeric columns', () => {
    const table = parseCsvText('zeta,vhat,label\n0,1,a\n5,0.8,b')

    expect(getNumericColumns(table)).toEqual(['zeta', 'vhat'])
  })

  it('builds an overlay from selected numeric columns', () => {
    const table = parseCsvText('zeta,vhat,yerr\n0,1,0.01\n5,0.8,0.02')
    const overlay = buildOverlayFromCsvSelection({
      table,
      xColumn: 'zeta',
      yColumn: 'vhat',
      yErrorColumn: 'yerr',
      variable: 'velocity',
      label: 'Imported curve',
      source: 'Local CSV',
    })

    expect(overlay.variable).toBe('velocity')
    expect(overlay.label).toBe('Imported curve')
    expect(overlay.sourceKind).toBe('user-import')
    expect(overlay.points).toEqual([
      { x: 0, y: 1, yError: 0.01 },
      { x: 5, y: 0.8, yError: 0.02 },
    ])
  })

  it('rejects CSV tables with insufficient numeric columns', () => {
    const table = parseCsvText('zeta,label\n0,a\n5,b')

    expect(() =>
      buildOverlayFromCsvSelection({
        table,
        xColumn: 'zeta',
        yColumn: 'label',
        variable: 'velocity',
        label: 'Bad curve',
        source: 'Local CSV',
      }),
    ).toThrow(/at least two numeric columns/i)
  })

  it('rejects nonnumeric selected x/y columns', () => {
    const table = parseCsvText('zeta,vhat,label\n0,1,a\n5,0.8,b')

    expect(() =>
      buildOverlayFromCsvSelection({
        table,
        xColumn: 'zeta',
        yColumn: 'label',
        variable: 'velocity',
        label: 'Bad curve',
        source: 'Local CSV',
      }),
    ).toThrow(/do not contain numeric overlay points/i)
  })
})
