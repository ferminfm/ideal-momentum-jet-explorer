import type { JetSeries, JetState } from './jetModel'

export interface FluidProperties {
  id: string
  label: string
  density: number // kg/m^3
  dynamicViscosity: number // Pa s
  surfaceTension?: number // N/m, liquid-gas surface/interfacial tension sigma
  soundSpeed?: number // m/s
}

export interface DimensionalOperatingPoint {
  liquid: FluidProperties
  gas: FluidProperties
  equivalentDiameter: number // m
  dischargeCoefficient: number
  velocityMode: 'velocity' | 'pressureDrop'
  injectionVelocity?: number // m/s
  pressureDrop?: number // Pa
}

export interface EngineeringScales {
  liquidDensity: number
  gasDensity: number
  densityRatio: number
  equivalentDiameter: number
  injectionVelocity: number
  dynamicPressureScale: number
  initialArea: number
  liquidMassFlowRate: number
  liquidMomentumFlux: number
}

export interface DimensionlessGroups {
  reynoldsLiquid: number
  weberLiquid: number | null
  weberGas: number | null
  ohnesorgeLiquid: number | null
  gasMachEstimate: number | null
}

export interface DimensionalJetState {
  zeta: number
  z: number
  area: number
  velocity: number
  compositeDensity: number
  dynamicPressure: number
  gasMassEntrainmentRate: number
  entrainmentCoefficient: number
}

export interface DimensionalJetSeries {
  scales: EngineeringScales
  dimensionlessGroups: DimensionlessGroups
  states: DimensionalJetState[]
}

export function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`)
  }
}

export function densityRatioFromFluids(
  liquid: FluidProperties,
  gas: FluidProperties,
): number {
  validateFluidProperties(liquid, 'liquid')
  validateFluidProperties(gas, 'gas')

  return gas.density / liquid.density
}

export function computeInjectionVelocity(point: DimensionalOperatingPoint): number {
  validateOperatingPointBasics(point)

  if (point.velocityMode === 'velocity') {
    assertPositiveFinite(point.injectionVelocity ?? Number.NaN, 'Injection velocity')
    return point.injectionVelocity as number
  }

  assertPositiveFinite(point.pressureDrop ?? Number.NaN, 'Pressure drop')

  return (
    point.dischargeCoefficient *
    Math.sqrt((2 * (point.pressureDrop as number)) / point.liquid.density)
  )
}

export function computeInitialAreaFromEquivalentDiameter(
  equivalentDiameter: number,
): number {
  assertPositiveFinite(equivalentDiameter, 'Equivalent diameter')

  return (Math.PI * equivalentDiameter ** 2) / 4
}

export function computeEngineeringScales(
  point: DimensionalOperatingPoint,
): EngineeringScales {
  const injectionVelocity = computeInjectionVelocity(point)
  const initialArea = computeInitialAreaFromEquivalentDiameter(point.equivalentDiameter)
  const densityRatio = densityRatioFromFluids(point.liquid, point.gas)
  const dynamicPressureScale = 0.5 * point.liquid.density * injectionVelocity ** 2
  const liquidMassFlowRate = point.liquid.density * initialArea * injectionVelocity
  const liquidMomentumFlux = point.liquid.density * initialArea * injectionVelocity ** 2

  return {
    liquidDensity: point.liquid.density,
    gasDensity: point.gas.density,
    densityRatio,
    equivalentDiameter: point.equivalentDiameter,
    injectionVelocity,
    dynamicPressureScale,
    initialArea,
    liquidMassFlowRate,
    liquidMomentumFlux,
  }
}

export function computeDimensionlessGroups(
  point: DimensionalOperatingPoint,
): DimensionlessGroups {
  const injectionVelocity = computeInjectionVelocity(point)
  const reynoldsLiquid =
    (point.liquid.density * injectionVelocity * point.equivalentDiameter) /
    point.liquid.dynamicViscosity
  const weberLiquid =
    point.liquid.surfaceTension === undefined
      ? null
      : (point.liquid.density * injectionVelocity ** 2 * point.equivalentDiameter) /
        point.liquid.surfaceTension
  const weberGas =
    point.liquid.surfaceTension === undefined
      ? null
      : (point.gas.density * injectionVelocity ** 2 * point.equivalentDiameter) /
        point.liquid.surfaceTension
  const ohnesorgeLiquid =
    point.liquid.surfaceTension === undefined
      ? null
      : point.liquid.dynamicViscosity /
        Math.sqrt(point.liquid.density * point.liquid.surfaceTension * point.equivalentDiameter)
  const gasMachEstimate =
    point.gas.soundSpeed === undefined ? null : injectionVelocity / point.gas.soundSpeed

  return {
    reynoldsLiquid,
    weberLiquid,
    weberGas,
    ohnesorgeLiquid,
    gasMachEstimate,
  }
}

export function dimensionalizeJetState(
  state: JetState,
  scales: EngineeringScales,
): DimensionalJetState {
  validateEngineeringScales(scales)

  return {
    zeta: finiteRequired(state.axialZeta, 'Normalized distance'),
    z: finiteRequired(state.axialZeta, 'Normalized distance') * scales.equivalentDiameter,
    area: finiteRequired(state.normalizedArea, 'Normalized area') * scales.initialArea,
    velocity: finiteRequired(state.velocityHat, 'Normalized velocity') * scales.injectionVelocity,
    compositeDensity:
      finiteRequired(state.densityHat, 'Normalized composite density') *
      scales.liquidDensity,
    dynamicPressure:
      finiteRequired(state.pressureHat, 'Normalized dynamic pressure') *
      scales.dynamicPressureScale,
    gasMassEntrainmentRate:
      finiteRequired(state.gasEntrainmentHat, 'Normalized gas entrainment rate') *
      scales.liquidMassFlowRate,
    entrainmentCoefficient: finiteRequired(
      state.entrainmentCoefficient,
      'Entrainment coefficient',
    ),
  }
}

export function dimensionalizeJetSeries(
  series: JetSeries,
  point: DimensionalOperatingPoint,
): DimensionalJetSeries {
  const scales = computeEngineeringScales(point)

  return {
    scales,
    dimensionlessGroups: computeDimensionlessGroups(point),
    states: series.states.map((state) => dimensionalizeJetState(state, scales)),
  }
}

function validateOperatingPointBasics(point: DimensionalOperatingPoint): void {
  validateFluidProperties(point.liquid, 'liquid')
  validateFluidProperties(point.gas, 'gas')
  assertPositiveFinite(point.equivalentDiameter, 'Equivalent diameter')
  assertPositiveFinite(point.dischargeCoefficient, 'Discharge coefficient')

  if (point.dischargeCoefficient > 1.2) {
    throw new Error('Discharge coefficient must be less than or equal to 1.2.')
  }
}

function validateFluidProperties(fluid: FluidProperties, label: string): void {
  if (!fluid.id.trim()) {
    throw new Error(`${label} fluid id must be nonempty.`)
  }

  if (!fluid.label.trim()) {
    throw new Error(`${label} fluid label must be nonempty.`)
  }

  assertPositiveFinite(fluid.density, `${label} density`)
  assertPositiveFinite(fluid.dynamicViscosity, `${label} dynamic viscosity`)

  if (fluid.surfaceTension !== undefined) {
    assertPositiveFinite(fluid.surfaceTension, `${label} liquid-gas surface tension`)
  }

  if (fluid.soundSpeed !== undefined) {
    assertPositiveFinite(fluid.soundSpeed, `${label} sound speed`)
  }
}

function validateEngineeringScales(scales: EngineeringScales): void {
  assertPositiveFinite(scales.liquidDensity, 'Liquid density scale')
  assertPositiveFinite(scales.gasDensity, 'Gas density scale')
  assertPositiveFinite(scales.densityRatio, 'Density ratio scale')
  assertPositiveFinite(scales.equivalentDiameter, 'Equivalent diameter scale')
  assertPositiveFinite(scales.injectionVelocity, 'Injection velocity scale')
  assertPositiveFinite(scales.dynamicPressureScale, 'Dynamic pressure scale')
  assertPositiveFinite(scales.initialArea, 'Initial area scale')
  assertPositiveFinite(scales.liquidMassFlowRate, 'Liquid mass flow rate scale')
  assertPositiveFinite(scales.liquidMomentumFlux, 'Liquid momentum flux scale')
}

function finiteRequired(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`)
  }

  return value
}
