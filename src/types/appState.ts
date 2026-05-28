import type { JetParameters } from '../model/jetModel'
import { DEFAULT_PARAMS, cloneParams } from '../model/presets'
import { DEFAULT_LANGUAGE, type Language } from '../i18n/translations'

export const OVERLAY_NONE = 'none'
export const PRESET_CUSTOM = 'custom'

export interface ExplorerState {
  language: Language
  params: JetParameters
  selectedPresetId: string
  densityLogScale: boolean
  overlayId: string
  crossSectionZeta: number
  showSelectedCrossSection: boolean
  showAxisSwitchingSection: boolean
}

export function createDefaultExplorerState(): ExplorerState {
  return {
    language: DEFAULT_LANGUAGE,
    params: cloneParams(DEFAULT_PARAMS),
    selectedPresetId: PRESET_CUSTOM,
    densityLogScale: false,
    overlayId: OVERLAY_NONE,
    crossSectionZeta: DEFAULT_PARAMS.zetaMax / 2,
    showSelectedCrossSection: true,
    showAxisSwitchingSection: true,
  }
}
