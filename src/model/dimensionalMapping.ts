import {
  getGasPresetById,
  getLiquidPresetById,
} from '../data/fluidPresets'
import type { DimensionalSettings } from '../types/appState'
import {
  assertPositiveFinite,
  computeDimensionlessGroups,
  computeEngineeringScales,
  dimensionalizeJetSeries,
  densityRatioFromFluids,
  type DimensionalJetSeries,
  type DimensionalOperatingPoint,
  type DimensionlessGroups,
  type EngineeringScales,
} from './engineering'
import {
  generateJetSeries,
  type GeometryConfig,
  type JetParameters,
  type JetSeries,
  type NozzleGeometry,
} from './jetModel'

export interface DimensionalMappingResult {
  normalizedParams: JetParameters
  normalizedSeries: JetSeries
  operatingPoint: DimensionalOperatingPoint
  scales: EngineeringScales
  groups: DimensionlessGroups
  dimensionalSeries: DimensionalJetSeries
}

export interface PhysicalNozzleGeometry {
  equivalentDiameter: number
  initialArea: number
  normalizedGeometry: GeometryConfig
}

const MILLIMETER_TO_METER = 1e-3
const KILOPASCAL_TO_PASCAL = 1e3

export function buildDimensionalOperatingPoint(
  dimensionalSettings: DimensionalSettings,
  geometry: NozzleGeometry,
): DimensionalOperatingPoint {
  const physicalGeometry = computePhysicalNozzleGeometry(dimensionalSettings, geometry)
  const liquid = getLiquidPresetById(dimensionalSettings.liquidId)
  const gas = getGasPresetById(dimensionalSettings.gasId)
  const pressureDrop =
    dimensionalSettings.velocityMode === 'pressureDrop'
      ? dimensionalSettings.pressureDropKPa * KILOPASCAL_TO_PASCAL
      : undefined

  return {
    liquid,
    gas,
    equivalentDiameter: physicalGeometry.equivalentDiameter,
    dischargeCoefficient: dimensionalSettings.dischargeCoefficient,
    velocityMode: dimensionalSettings.velocityMode,
    injectionVelocity:
      dimensionalSettings.velocityMode === 'velocity'
        ? dimensionalSettings.injectionVelocity
        : undefined,
    pressureDrop,
  }
}

export function mapDimensionalSettingsToJetParameters(
  currentParams: JetParameters,
  dimensionalSettings: DimensionalSettings,
): JetParameters {
  const geometryType = currentParams.geometry.geometry
  const physicalGeometry = computePhysicalNozzleGeometry(dimensionalSettings, geometryType)
  const liquid = getLiquidPresetById(dimensionalSettings.liquidId)
  const gas = getGasPresetById(dimensionalSettings.gasId)

  return {
    ...currentParams,
    densityRatio: densityRatioFromFluids(liquid, gas),
    geometry: physicalGeometry.normalizedGeometry,
  }
}

export function buildDimensionalMapping(
  currentParams: JetParameters,
  dimensionalSettings: DimensionalSettings,
): DimensionalMappingResult {
  const normalizedParams = mapDimensionalSettingsToJetParameters(
    currentParams,
    dimensionalSettings,
  )
  const operatingPoint = buildDimensionalOperatingPoint(
    dimensionalSettings,
    normalizedParams.geometry.geometry,
  )
  const normalizedSeries = generateJetSeries(normalizedParams)
  const dimensionalSeries = dimensionalizeJetSeries(normalizedSeries, operatingPoint)

  return {
    normalizedParams,
    normalizedSeries,
    operatingPoint,
    scales: computeEngineeringScales(operatingPoint),
    groups: computeDimensionlessGroups(operatingPoint),
    dimensionalSeries,
  }
}

export function computePhysicalNozzleGeometry(
  dimensionalSettings: DimensionalSettings,
  geometry: NozzleGeometry,
): PhysicalNozzleGeometry {
  if (geometry === 'rectangular') {
    const width = mmToMeters(dimensionalSettings.rectangularWidthMm, 'Rectangular width')
    const height = mmToMeters(dimensionalSettings.rectangularHeightMm, 'Rectangular height')
    const initialArea = width * height
    const equivalentDiameter = Math.sqrt((4 * initialArea) / Math.PI)

    assertPositiveFinite(equivalentDiameter, 'Equivalent diameter')

    return {
      equivalentDiameter,
      initialArea,
      normalizedGeometry: {
        geometry: 'rectangular',
        width: width / equivalentDiameter,
        height: height / equivalentDiameter,
      },
    }
  }

  const majorAxis = mmToMeters(
    dimensionalSettings.ellipticalMajorAxisMm,
    'Elliptical major axis',
  )
  const minorAxis = mmToMeters(
    dimensionalSettings.ellipticalMinorAxisMm,
    'Elliptical minor axis',
  )
  const initialArea = (Math.PI / 4) * majorAxis * minorAxis
  const equivalentDiameter = Math.sqrt(majorAxis * minorAxis)

  assertPositiveFinite(equivalentDiameter, 'Equivalent diameter')

  return {
    equivalentDiameter,
    initialArea,
    normalizedGeometry: {
      geometry: 'elliptical',
      majorAxis: majorAxis / equivalentDiameter,
      minorAxis: minorAxis / equivalentDiameter,
    },
  }
}

function mmToMeters(value: number, label: string): number {
  assertPositiveFinite(value, `${label} in millimeters`)

  return value * MILLIMETER_TO_METER
}
