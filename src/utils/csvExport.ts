import type { JetSeries } from '../model/jetModel'

const CSV_COLUMNS = [
  'index',
  'zeta',
  'z_over_De',
  'Ahat',
  'dAhat_dzeta',
  'vhat',
  'rhohat',
  'phat',
  'mghat',
  'KA',
  'geometry',
  'rhoStar',
  'thetaDeg',
  'phiDeg',
  'B0',
  'H0',
  'a0',
  'b0',
]

function csvValue(value: string | number): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toPrecision(12) : ''
  }

  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

export function buildJetCsv(series: JetSeries): string {
  const { params } = series
  const geometry = params.geometry.geometry
  const B0 = geometry === 'rectangular' ? params.geometry.width : ''
  const H0 = geometry === 'rectangular' ? params.geometry.height : ''
  const a0 = geometry === 'elliptical' ? params.geometry.majorAxis : ''
  const b0 = geometry === 'elliptical' ? params.geometry.minorAxis : ''

  const rows = series.states.map((state, index) =>
    [
      index.toString(),
      state.axialZeta,
      state.axialZeta,
      state.normalizedArea,
      state.dAreaHatDzeta,
      state.velocityHat,
      state.densityHat,
      state.pressureHat,
      state.gasEntrainmentHat,
      state.entrainmentCoefficient,
      geometry,
      params.densityRatio,
      params.thetaDeg,
      params.phiDeg,
      B0,
      H0,
      a0,
      b0,
    ].map(csvValue),
  )

  return [CSV_COLUMNS, ...rows].map((row) => row.join(',')).join('\n')
}

export function createCsvFilename(series: JetSeries, date = new Date()): string {
  const timestamp = date.toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')
  return `ideal-momentum-jet_${series.params.geometry.geometry}_${timestamp}.csv`
}

export function downloadJetCsv(series: JetSeries): void {
  const csv = buildJetCsv(series)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = createCsvFilename(series)
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
