import type { TipPenetrationResult } from '../model/tipPenetration'

const TIP_PENETRATION_COLUMNS = [
  'index',
  'tau',
  'zeta_tip',
  'vhat',
  't_s',
  'Z_m',
  'velocity_m_s',
]

export function buildTipPenetrationCsv(result: TipPenetrationResult): string {
  const rows = result.points.map((point) =>
    [
      point.index,
      point.tau,
      point.zeta,
      point.vhat,
      point.t,
      point.z,
      point.velocity,
    ].map(csvValue),
  )

  return [TIP_PENETRATION_COLUMNS, ...rows].map((row) => row.join(',')).join('\n')
}

export function createTipPenetrationCsvFilename(date = new Date()): string {
  const timestamp = date.toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')
  return `ideal-momentum-jet_tip-penetration_${timestamp}.csv`
}

export function downloadTipPenetrationCsv(
  result: TipPenetrationResult,
  filenameBase?: string,
): void {
  const csv = buildTipPenetrationCsv(result)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filenameBase ?? createTipPenetrationCsvFilename()
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toPrecision(12) : ''
  }

  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}
