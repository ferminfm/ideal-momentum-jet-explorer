import type { ComparisonCase } from '../model/comparisonCases'
import type {
  DimensionalJetSeries,
  DimensionlessGroups,
  EngineeringScales,
} from '../model/engineering'
import type { JetSeries } from '../model/jetModel'
import type { InputMode } from '../types/appState'

const CSV_COLUMNS = [
  'caseLabel',
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

const DIMENSIONAL_CSV_COLUMNS = [
  'inputMode',
  'z_m',
  'area_m2',
  'velocity_m_s',
  'compositeDensity_kg_m3',
  'dynamicPressure_Pa',
  'gasEntrainment_kg_s',
  'equivalentDiameter_m',
  'injectionVelocity_m_s',
  'liquidDensity_kg_m3',
  'gasDensity_kg_m3',
  'Reynolds',
  'Weber',
  'WeberGas',
  'Ohnesorge',
  'gasMachEstimate',
]

export interface CsvEngineeringContext {
  inputMode: InputMode
  dimensionalSeries?: DimensionalJetSeries
  scales?: EngineeringScales
  groups?: DimensionlessGroups
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

export function buildJetCsv(
  series: JetSeries,
  comparisonCases: ComparisonCase[] = [],
  engineeringContext?: CsvEngineeringContext,
): string {
  const visibleCases = comparisonCases.filter((comparisonCase) => comparisonCase.visible)
  const includeDimensionalColumns =
    engineeringContext?.inputMode === 'dimensional' &&
    engineeringContext.dimensionalSeries !== undefined
  const columns = includeDimensionalColumns
    ? [...CSV_COLUMNS, ...DIMENSIONAL_CSV_COLUMNS]
    : CSV_COLUMNS
  const rows = [
    ...buildRows(
      'Current',
      series,
      includeDimensionalColumns ? engineeringContext : undefined,
    ),
    ...visibleCases.flatMap((comparisonCase) =>
      buildRows(
        comparisonCase.label,
        comparisonCase.series,
        includeDimensionalColumns ? { inputMode: 'normalized' } : undefined,
      ),
    ),
  ]

  return [columns, ...rows].map((row) => row.join(',')).join('\n')
}

function buildRows(
  caseLabel: string,
  series: JetSeries,
  engineeringContext?: CsvEngineeringContext,
): string[][] {
  const { params } = series
  const geometry = params.geometry.geometry
  const B0 = geometry === 'rectangular' ? params.geometry.width : ''
  const H0 = geometry === 'rectangular' ? params.geometry.height : ''
  const a0 = geometry === 'elliptical' ? params.geometry.majorAxis : ''
  const b0 = geometry === 'elliptical' ? params.geometry.minorAxis : ''

  return series.states.map((state, index) => {
    const dimensionalState = engineeringContext?.dimensionalSeries?.states[index]
    const scales =
      engineeringContext?.scales ?? engineeringContext?.dimensionalSeries?.scales
    const groups =
      engineeringContext?.groups ?? engineeringContext?.dimensionalSeries?.dimensionlessGroups
    const row: Array<string | number | null | undefined> = [
      caseLabel,
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
    ]

    if (engineeringContext !== undefined) {
      row.push(
        dimensionalState === undefined ? '' : engineeringContext.inputMode,
        dimensionalState?.z,
        dimensionalState?.area,
        dimensionalState?.velocity,
        dimensionalState?.compositeDensity,
        dimensionalState?.dynamicPressure,
        dimensionalState?.gasMassEntrainmentRate,
        scales?.equivalentDiameter,
        scales?.injectionVelocity,
        scales?.liquidDensity,
        scales?.gasDensity,
        groups?.reynoldsLiquid,
        groups?.weberLiquid,
        groups?.weberGas,
        groups?.ohnesorgeLiquid,
        groups?.gasMachEstimate,
      )
    }

    return row.map(csvValue)
  })
}

export function createCsvFilename(series: JetSeries, date = new Date()): string {
  const timestamp = date.toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')
  return `ideal-momentum-jet_${series.params.geometry.geometry}_${timestamp}.csv`
}

export function downloadJetCsv(
  series: JetSeries,
  comparisonCases: ComparisonCase[] = [],
  engineeringContext?: CsvEngineeringContext,
): void {
  const csv = buildJetCsv(series, comparisonCases, engineeringContext)
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
