import type { DimensionlessGroups } from './engineering'

export type ApplicabilityLevel = 'good' | 'caution' | 'warning' | 'outside'

export interface ApplicabilityMessage {
  id: string
  level: ApplicabilityLevel
  title: string
  message: string
  quantity?: string
  value?: number | null
  threshold?: string
}

export interface ApplicabilityAssessment {
  overall: ApplicabilityLevel
  shortSummary: string
  messages: ApplicabilityMessage[]
  regimeLabel: string
  recommendedUse: string
}

export interface RegimeCheckerInput {
  densityRatio: number
  dimensionlessGroups?: DimensionlessGroups
  geometryAspectRatio: number
  thetaDeg: number
  phiDeg: number
  inputMode: 'normalized' | 'dimensional'
}

const SEVERITY_RANK: Record<ApplicabilityLevel, number> = {
  good: 0,
  caution: 1,
  warning: 2,
  outside: 3,
}

export function assessModelApplicability(
  input: RegimeCheckerInput,
): ApplicabilityAssessment {
  const messages: ApplicabilityMessage[] = []
  const groups = input.dimensionlessGroups

  if (input.inputMode === 'normalized' || groups === undefined) {
    messages.push({
      id: 'dimensional-data-required',
      level: 'caution',
      title: 'Dimensional screening unavailable',
      message:
        'Regime metrics require dimensional fluid properties and nozzle scale. Switch to dimensional mode for Re, We, Oh, and Mach screening.',
    })
  }

  assessReynolds(groups?.reynoldsLiquid, messages)
  assessLiquidWeber(groups?.weberLiquid, messages)
  assessGasWeber(groups?.weberGas, messages)
  assessOhnesorge(groups?.ohnesorgeLiquid, messages)
  assessGasMach(groups?.gasMachEstimate, messages)
  assessDensityRatio(input.densityRatio, messages)
  assessAspectRatio(input.geometryAspectRatio, messages)
  assessSpreadingAngles(input.thetaDeg, input.phiDeg, messages)

  const severeMessages = messages.filter(
    (message) => message.level !== 'good',
  )
  if (severeMessages.length === 0) {
    messages.push({
      id: 'lhf-interpretation',
      level: 'good',
      title: 'Exploratory LHF interpretation',
      message:
        'The settings are plausibly compatible with exploratory reduced-order atomizing-jet interpretation, but the locally homogeneous assumption still requires validation.',
    })
  } else if (!severeMessages.some((message) => message.level === 'outside')) {
    messages.push({
      id: 'validation-required',
      level: 'caution',
      title: 'Validation still required',
      message:
        'This is heuristic screening only. The model remains a conservative top-hat closure and is not a validated breakup-regime map.',
    })
  }

  const overall = aggregateSeverity(messages)

  return {
    overall,
    shortSummary: buildShortSummary(overall, input.inputMode, groups),
    messages,
    regimeLabel: buildRegimeLabel(overall, input.inputMode, groups),
    recommendedUse: buildRecommendedUse(overall),
  }
}

function assessReynolds(
  reynoldsLiquid: number | null | undefined,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(reynoldsLiquid)
  if (value === null) {
    return
  }

  if (value < 2000) {
    messages.push({
      id: 'low-reynolds',
      level: 'warning',
      title: 'Low Reynolds number',
      message:
        'Low Reynolds number; the top-hat turbulent atomizing-jet assumption is questionable.',
      quantity: 'Re_l',
      value,
      threshold: 'Re_l < 2000',
    })
  } else if (value < 10000) {
    messages.push({
      id: 'transitional-reynolds',
      level: 'caution',
      title: 'Transitional Reynolds range',
      message:
        'Transitional Reynolds range; validate before interpreting as a turbulent atomizing jet.',
      quantity: 'Re_l',
      value,
      threshold: '2000 <= Re_l < 10000',
    })
  }
}

function assessLiquidWeber(
  weberLiquid: number | null | undefined,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(weberLiquid)
  if (value === null) {
    return
  }

  if (value < 1) {
    messages.push({
      id: 'surface-tension-dominated',
      level: 'outside',
      title: 'Surface-tension-dominated liquid Weber number',
      message:
        'Liquid-gas surface tension dominates; atomizing-jet interpretation is likely invalid.',
      quantity: 'We_l',
      value,
      threshold: 'We_l < 1',
    })
  } else if (value < 10) {
    messages.push({
      id: 'low-liquid-weber',
      level: 'warning',
      title: 'Low liquid Weber number',
      message:
        'Low Weber number; breakup or atomization may be weak or capillary dominated.',
      quantity: 'We_l',
      value,
      threshold: '1 <= We_l < 10',
    })
  } else if (value < 100) {
    messages.push({
      id: 'intermediate-liquid-weber',
      level: 'caution',
      title: 'Intermediate liquid Weber number',
      message:
        'Intermediate Weber number; behavior may be transitional rather than fully atomized LHF.',
      quantity: 'We_l',
      value,
      threshold: '10 <= We_l < 100',
    })
  }
}

function assessGasWeber(
  weberGas: number | null | undefined,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(weberGas)
  if (value === null) {
    return
  }

  if (value < 1) {
    messages.push({
      id: 'weak-gas-weber',
      level: 'caution',
      title: 'Weak gas Weber number',
      message: 'Gas-phase aerodynamic breakup influence may be weak.',
      quantity: 'We_g',
      value,
      threshold: 'We_g < 1',
    })
  }
}

function assessOhnesorge(
  ohnesorgeLiquid: number | null | undefined,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(ohnesorgeLiquid)
  if (value === null) {
    return
  }

  if (value > 1) {
    messages.push({
      id: 'high-ohnesorge',
      level: 'warning',
      title: 'High Ohnesorge number',
      message:
        'Highly viscous regime; atomizing turbulent-jet assumptions may be poor.',
      quantity: 'Oh_l',
      value,
      threshold: 'Oh_l > 1',
    })
  } else if (value > 0.1) {
    messages.push({
      id: 'viscous-breakup-effects',
      level: 'caution',
      title: 'Viscous breakup influence',
      message: 'Viscous effects may strongly affect breakup and spreading.',
      quantity: 'Oh_l',
      value,
      threshold: 'Oh_l > 0.1',
    })
  }
}

function assessGasMach(
  gasMachEstimate: number | null | undefined,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(gasMachEstimate)
  if (value === null) {
    return
  }

  if (value > 0.8) {
    messages.push({
      id: 'high-mach',
      level: 'warning',
      title: 'High gas Mach estimate',
      message: 'High-Mach effects likely require compressible nozzle/jet modeling.',
      quantity: 'M_g',
      value,
      threshold: 'M_g > 0.8',
    })
  } else if (value > 0.3) {
    messages.push({
      id: 'compressibility-caution',
      level: 'caution',
      title: 'Compressibility caution',
      message:
        'Compressibility may affect nozzle-exit conditions; the current closure is incompressible or weakly compressible downstream.',
      quantity: 'M_g',
      value,
      threshold: 'M_g > 0.3',
    })
  }
}

function assessDensityRatio(
  densityRatio: number,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(densityRatio)
  if (value === null) {
    return
  }

  if (value > 0.1) {
    messages.push({
      id: 'high-density-ratio',
      level: 'caution',
      title: 'High density ratio',
      message:
        'Density ratio is not liquid-in-gas-like; interpret composite-density and entrainment assumptions carefully.',
      quantity: 'rho*',
      value,
      threshold: 'rho* > 0.1',
    })
  } else if (value < 1e-4) {
    messages.push({
      id: 'very-small-density-ratio',
      level: 'caution',
      title: 'Very small density ratio',
      message:
        'Very small density ratio; numerical limiting behavior and nondimensional gas-entrainment scaling require care.',
      quantity: 'rho*',
      value,
      threshold: 'rho* < 1e-4',
    })
  }
}

function assessAspectRatio(
  geometryAspectRatio: number,
  messages: ApplicabilityMessage[],
): void {
  const value = finiteOrNull(geometryAspectRatio)
  if (value === null || value <= 0) {
    return
  }

  const elongation = Math.max(value, 1 / value)
  if (elongation > 4) {
    messages.push({
      id: 'extreme-aspect-ratio',
      level: 'caution',
      title: 'Highly elongated geometry',
      message:
        'Highly elongated geometry; prescribed top-hat area-growth closure may be sensitive to profile and vortex-dynamical effects.',
      quantity: 'AR',
      value,
      threshold: 'AR > 4 or AR < 0.25',
    })
  }
}

function assessSpreadingAngles(
  thetaDeg: number,
  phiDeg: number,
  messages: ApplicabilityMessage[],
): void {
  const theta = finiteOrNull(thetaDeg)
  const phi = finiteOrNull(phiDeg)
  if (theta === null || phi === null) {
    return
  }

  if (theta >= 20 || phi >= 20) {
    messages.push({
      id: 'very-large-spreading-angle',
      level: 'warning',
      title: 'Very large prescribed spreading angle',
      message:
        'Very large prescribed spreading angle; small-angle and top-hat assumptions may be questionable.',
      quantity: 'max(theta, phi)',
      value: Math.max(theta, phi),
      threshold: 'theta or phi >= 20 deg',
    })
  } else if (theta > 15 || phi > 15) {
    messages.push({
      id: 'large-spreading-angle',
      level: 'caution',
      title: 'Large prescribed spreading angle',
      message:
        'Large prescribed spreading angle; prescribed area growth may be sensitive to losses and profile effects.',
      quantity: 'max(theta, phi)',
      value: Math.max(theta, phi),
      threshold: 'theta or phi > 15 deg',
    })
  } else if (theta < 0.1 && phi < 0.1) {
    messages.push({
      id: 'near-zero-growth',
      level: 'caution',
      title: 'Near-zero area growth',
      message:
        'Near-zero growth; entrainment and mixing predictions become degenerate.',
      quantity: 'max(theta, phi)',
      value: Math.max(theta, phi),
      threshold: 'theta, phi < 0.1 deg',
    })
  }
}

function aggregateSeverity(messages: ApplicabilityMessage[]): ApplicabilityLevel {
  return messages.reduce<ApplicabilityLevel>(
    (current, message) =>
      SEVERITY_RANK[message.level] > SEVERITY_RANK[current]
        ? message.level
        : current,
    'good',
  )
}

function buildShortSummary(
  overall: ApplicabilityLevel,
  inputMode: RegimeCheckerInput['inputMode'],
  groups: DimensionlessGroups | undefined,
): string {
  if (inputMode === 'normalized' || groups === undefined) {
    return 'Normalized exploration only; dimensional regime screening is unavailable.'
  }

  return buildRegimeLabel(overall, inputMode, groups)
}

function buildRegimeLabel(
  overall: ApplicabilityLevel,
  inputMode: RegimeCheckerInput['inputMode'],
  groups: DimensionlessGroups | undefined,
): string {
  if (inputMode === 'normalized' || groups === undefined) {
    return 'Normalized exploration only'
  }

  if (overall === 'outside') {
    return 'Likely outside intended atomizing-LHF regime'
  }

  if (overall === 'warning') {
    return 'Questionable / transition regime'
  }

  if (overall === 'caution') {
    return 'Plausible but validation-sensitive exploratory regime'
  }

  return 'Plausible exploratory atomizing-jet regime'
}

function buildRecommendedUse(overall: ApplicabilityLevel): string {
  if (overall === 'outside') {
    return 'Do not use for predictive engineering interpretation; inspect with detailed CFD or experiment.'
  }

  if (overall === 'warning') {
    return 'Use only qualitatively; validation is strongly required.'
  }

  if (overall === 'caution') {
    return 'Use as a reduced-order exploratory estimate and compare against data.'
  }

  return 'Plausible for exploratory reduced-order atomizing-jet interpretation, still not validated design software.'
}

function finiteOrNull(value: number | null | undefined): number | null {
  return value === null || value === undefined || !Number.isFinite(value)
    ? null
    : value
}
