import type { JetParameters } from '../model/jetModel'
import { DEFAULT_PARAMS, cloneParams } from '../model/presets'

export const OVERLAY_NONE = 'none'
export const PRESET_CUSTOM = 'custom'

export interface ExplorerState {
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
    params: cloneParams(DEFAULT_PARAMS),
    selectedPresetId: PRESET_CUSTOM,
    densityLogScale: false,
    overlayId: OVERLAY_NONE,
    crossSectionZeta: DEFAULT_PARAMS.zetaMax / 2,
    showSelectedCrossSection: true,
    showAxisSwitchingSection: true,
  }
}
