import type { JetParameters } from '../model/jetModel'
import { DEFAULT_PARAMS, cloneParams } from '../model/presets'
import { DEFAULT_LANGUAGE, type Language } from '../i18n/translations'
import type { ComparisonCase } from '../model/comparisonCases'
import {
  DEFAULT_GAS_PRESET_ID,
  DEFAULT_LIQUID_PRESET_ID,
} from '../data/fluidPresets'

export const OVERLAY_NONE = 'none'
export const PRESET_CUSTOM = 'custom'

export type InputMode = 'normalized' | 'dimensional'

export type DimensionalVelocityMode = 'velocity' | 'pressureDrop'

export interface DimensionalSettings {
  liquidId: string
  gasId: string
  rectangularWidthMm: number
  rectangularHeightMm: number
  ellipticalMajorAxisMm: number
  ellipticalMinorAxisMm: number
  velocityMode: DimensionalVelocityMode
  injectionVelocity: number
  pressureDropKPa: number
  dischargeCoefficient: number
}

export interface ExplorerState {
  language: Language
  inputMode: InputMode
  dimensionalSettings: DimensionalSettings
  params: JetParameters
  selectedPresetId: string
  densityLogScale: boolean
  overlayId: string
  comparisonCases: ComparisonCase[]
  crossSectionZeta: number
  showSelectedCrossSection: boolean
  showAxisSwitchingSection: boolean
}

export const DEFAULT_DIMENSIONAL_SETTINGS: DimensionalSettings = {
  liquidId: DEFAULT_LIQUID_PRESET_ID,
  gasId: DEFAULT_GAS_PRESET_ID,
  rectangularWidthMm: 1,
  rectangularHeightMm: 0.5,
  ellipticalMajorAxisMm: 1,
  ellipticalMinorAxisMm: 0.5,
  velocityMode: 'velocity',
  injectionVelocity: 10,
  pressureDropKPa: 100,
  dischargeCoefficient: 1,
}

export function createDefaultExplorerState(): ExplorerState {
  return {
    language: DEFAULT_LANGUAGE,
    inputMode: 'normalized',
    dimensionalSettings: { ...DEFAULT_DIMENSIONAL_SETTINGS },
    params: cloneParams(DEFAULT_PARAMS),
    selectedPresetId: PRESET_CUSTOM,
    densityLogScale: false,
    overlayId: OVERLAY_NONE,
    comparisonCases: [],
    crossSectionZeta: DEFAULT_PARAMS.zetaMax / 2,
    showSelectedCrossSection: true,
    showAxisSwitchingSection: true,
  }
}
