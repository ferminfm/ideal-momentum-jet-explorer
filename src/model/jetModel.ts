export type NozzleGeometry = 'rectangular' | 'elliptical'

export interface RectangularGeometry {
  geometry: 'rectangular'
  width: number
  height: number
}

export interface EllipticalGeometry {
  geometry: 'elliptical'
  majorAxis: number
  minorAxis: number
}

export type GeometryConfig = RectangularGeometry | EllipticalGeometry

export interface JetParameters {
  densityRatio: number
  thetaDeg: number
  phiDeg: number
  zetaMax: number
  samples: number
  geometry: GeometryConfig
}

export interface GeometryState {
  axialZeta: number
  axialZ: number
  area: number
  normalizedArea: number
  dAreaHatDzeta: number
  primarySpan: number
  secondarySpan: number
  primaryHat: number
  secondaryHat: number
}

export interface JetState extends GeometryState {
  delta: number
  velocityHat: number
  densityHat: number
  densityHatCheck: number
  pressureHat: number
  gasEntrainmentHat: number
  gasEntrainmentHatAlt: number
  entrainmentCoefficient: number
}

export interface JetSeries {
  params: JetParameters
  equivalentDiameter: number
  initialArea: number
  states: JetState[]
}

export interface DirectionalGrowthRates {
  lambda1: number
  lambda2: number
  lambda1Label: string
  lambda2Label: string
}

export interface EntrainmentCoefficientLimits {
  nearField: number
  farField: number
  lambda1: number
  lambda2: number
  lambda1Label: string
  lambda2Label: string
  nearFieldLabel: string
  farFieldLabel: string
}

const LOW_DENSITY_LIMIT = 1e-8

export function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180
}

export function clampSamples(samples: number): number {
  return Math.max(2, Math.min(500, Math.round(samples)))
}

export function validateParameters(params: JetParameters): void {
  if (!Number.isFinite(params.densityRatio) || params.densityRatio <= 0) {
    throw new Error('Density ratio must be a positive finite number.')
  }

  if (!Number.isFinite(params.zetaMax) || params.zetaMax <= 0) {
    throw new Error('Maximum normalized distance must be positive.')
  }

  if (!Number.isFinite(params.thetaDeg) || !Number.isFinite(params.phiDeg)) {
    throw new Error('Spreading half-angles must be finite.')
  }

  if (params.geometry.geometry === 'rectangular') {
    if (params.geometry.width <= 0 || params.geometry.height <= 0) {
      throw new Error('Rectangular width and height must be positive.')
    }
  } else if (params.geometry.majorAxis <= 0 || params.geometry.minorAxis <= 0) {
    throw new Error('Elliptical full axes must be positive.')
  }
}

export function getInitialArea(geometry: GeometryConfig): number {
  if (geometry.geometry === 'rectangular') {
    return geometry.width * geometry.height
  }

  return (Math.PI / 4) * geometry.majorAxis * geometry.minorAxis
}

export function getEquivalentDiameter(geometry: GeometryConfig): number {
  return Math.sqrt((4 * getInitialArea(geometry)) / Math.PI)
}

export function getDirectionalGrowthRates(params: JetParameters): DirectionalGrowthRates {
  validateParameters(params)

  const equivalentDiameter = getEquivalentDiameter(params.geometry)
  const theta = degreesToRadians(params.thetaDeg)
  const phi = degreesToRadians(params.phiDeg)

  if (params.geometry.geometry === 'rectangular') {
    return {
      lambda1: (2 * equivalentDiameter * Math.tan(phi)) / params.geometry.width,
      lambda2: (2 * equivalentDiameter * Math.tan(theta)) / params.geometry.height,
      lambda1Label: 'beta',
      lambda2Label: 'eta',
    }
  }

  return {
    lambda1: (2 * equivalentDiameter * Math.tan(theta)) / params.geometry.majorAxis,
    lambda2: (2 * equivalentDiameter * Math.tan(phi)) / params.geometry.minorAxis,
    lambda1Label: 'alpha',
    lambda2Label: 'gamma',
  }
}

export function computeEntrainmentCoefficientLimits(
  params: JetParameters,
): EntrainmentCoefficientLimits {
  const { lambda1, lambda2, lambda1Label, lambda2Label } =
    getDirectionalGrowthRates(params)
  const densityRatio = params.densityRatio
  const nearField =
    (Math.sqrt(densityRatio) * (lambda1 + lambda2)) / (1 + densityRatio)
  const farField = lambda1 > 0 && lambda2 > 0 ? Math.sqrt(lambda1 * lambda2) : 0

  return {
    nearField: finiteOrZero(nearField),
    farField: finiteOrZero(farField),
    lambda1: finiteOrZero(lambda1),
    lambda2: finiteOrZero(lambda2),
    lambda1Label,
    lambda2Label,
    nearFieldLabel: 'K_A(0)',
    farFieldLabel: 'K_A(∞)',
  }
}

export function getGeometryState(params: JetParameters, zeta: number): GeometryState {
  validateParameters(params)

  const initialArea = getInitialArea(params.geometry)
  const equivalentDiameter = getEquivalentDiameter(params.geometry)
  const axialZ = zeta * equivalentDiameter
  const theta = degreesToRadians(params.thetaDeg)
  const phi = degreesToRadians(params.phiDeg)

  if (params.geometry.geometry === 'rectangular') {
    const beta = (2 * equivalentDiameter * Math.tan(phi)) / params.geometry.width
    const eta = (2 * equivalentDiameter * Math.tan(theta)) / params.geometry.height
    const widthHat = 1 + beta * zeta
    const heightHat = 1 + eta * zeta
    const width = params.geometry.width * widthHat
    const height = params.geometry.height * heightHat
    const normalizedArea = widthHat * heightHat

    return {
      axialZeta: zeta,
      axialZ,
      area: normalizedArea * initialArea,
      normalizedArea,
      dAreaHatDzeta: beta * heightHat + eta * widthHat,
      primarySpan: width,
      secondarySpan: height,
      primaryHat: widthHat,
      secondaryHat: heightHat,
    }
  }

  const alpha = (2 * equivalentDiameter * Math.tan(theta)) / params.geometry.majorAxis
  const gamma = (2 * equivalentDiameter * Math.tan(phi)) / params.geometry.minorAxis
  const majorHat = 1 + alpha * zeta
  const minorHat = 1 + gamma * zeta
  const majorAxis = params.geometry.majorAxis * majorHat
  const minorAxis = params.geometry.minorAxis * minorHat
  const normalizedArea = majorHat * minorHat

  return {
    axialZeta: zeta,
    axialZ,
    area: normalizedArea * initialArea,
    normalizedArea,
    dAreaHatDzeta: alpha * minorHat + gamma * majorHat,
    primarySpan: majorAxis,
    secondarySpan: minorAxis,
    primaryHat: majorHat,
    secondaryHat: minorHat,
  }
}

export function getJetState(params: JetParameters, zeta: number): JetState {
  const geometryState = getGeometryState(params, zeta)
  const densityRatio = params.densityRatio
  const areaHat = geometryState.normalizedArea

  if (densityRatio < LOW_DENSITY_LIMIT) {
    const densityHat = 1 / areaHat

    return {
      ...geometryState,
      delta: Math.abs(1 - densityRatio),
      velocityHat: 1,
      densityHat,
      densityHatCheck: densityHat,
      pressureHat: densityHat,
      gasEntrainmentHat: 0,
      gasEntrainmentHatAlt: 0,
      entrainmentCoefficient: 0,
    }
  }

  const delta = Math.sqrt((densityRatio - 1) ** 2 + 4 * densityRatio * areaHat)
  const velocityHat = (densityRatio - 1 + delta) / (2 * densityRatio * areaHat)
  const densityTilde = densityRatio + ((1 - densityRatio) ** 2) / (2 * areaHat)
  const densityRadicand = Math.max(0, densityTilde ** 2 - densityRatio ** 2)
  const densityHat = densityTilde + Math.sqrt(densityRadicand)
  const densityHatCheck = densityRatio + (1 - densityRatio) / (areaHat * velocityHat)
  const pressureHat = 1 / areaHat
  const gasEntrainmentHat = densityRatio * (areaHat * velocityHat - 1)
  const gasEntrainmentHatAlt = (delta - densityRatio - 1) / 2
  const entrainmentCoefficient =
    (Math.sqrt(densityRatio) / delta) * geometryState.dAreaHatDzeta

  return {
    ...geometryState,
    delta,
    velocityHat,
    densityHat,
    densityHatCheck,
    pressureHat,
    gasEntrainmentHat,
    gasEntrainmentHatAlt,
    entrainmentCoefficient,
  }
}

export function generateJetSeries(params: JetParameters): JetSeries {
  validateParameters(params)

  const samples = clampSamples(params.samples)
  const step = params.zetaMax / (samples - 1)
  const states = Array.from({ length: samples }, (_, index) =>
    getJetState(params, index * step),
  )

  return {
    params: {
      ...params,
      samples,
      geometry: { ...params.geometry },
    },
    equivalentDiameter: getEquivalentDiameter(params.geometry),
    initialArea: getInitialArea(params.geometry),
    states,
  }
}

export function getAspectRatio(geometry: GeometryConfig): number {
  if (geometry.geometry === 'rectangular') {
    return geometry.width / geometry.height
  }

  return geometry.majorAxis / geometry.minorAxis
}

export function computeAxisSwitchingZeta(params: JetParameters): number | null {
  validateParameters(params)

  const equivalentDiameter = getEquivalentDiameter(params.geometry)
  const theta = degreesToRadians(params.thetaDeg)
  const phi = degreesToRadians(params.phiDeg)
  const tolerance = 1e-12
  let dimensionOne0: number
  let dimensionTwo0: number
  let dimensionOneSlope: number
  let dimensionTwoSlope: number

  if (params.geometry.geometry === 'rectangular') {
    dimensionOne0 = params.geometry.width
    dimensionTwo0 = params.geometry.height
    dimensionOneSlope = 2 * equivalentDiameter * Math.tan(phi)
    dimensionTwoSlope = 2 * equivalentDiameter * Math.tan(theta)
  } else {
    dimensionOne0 = params.geometry.majorAxis
    dimensionTwo0 = params.geometry.minorAxis
    dimensionOneSlope = 2 * equivalentDiameter * Math.tan(theta)
    dimensionTwoSlope = 2 * equivalentDiameter * Math.tan(phi)
  }

  const denominator = dimensionOneSlope - dimensionTwoSlope
  if (Math.abs(denominator) < tolerance) {
    return null
  }

  const zeta = (dimensionTwo0 - dimensionOne0) / denominator
  if (!Number.isFinite(zeta) || zeta <= tolerance || zeta > params.zetaMax) {
    return null
  }

  return zeta
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0
}
