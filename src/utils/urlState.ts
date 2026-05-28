import { VELOCITY_OVERLAYS } from '../data/velocityOverlays'
import type { JetParameters } from '../model/jetModel'
import { PRESETS, cloneParams } from '../model/presets'
import {
  OVERLAY_NONE,
  PRESET_CUSTOM,
  createDefaultExplorerState,
  type ExplorerState,
} from '../types/appState'

export const URL_LIMITS = {
  densityRatio: { min: 1e-4, max: 1 },
  dimension: { min: 0.25, max: 4 },
  angle: { min: 0, max: 25 },
  zetaMax: { min: 20, max: 100 },
  samples: { min: 50, max: 200 },
}

type GeometryName = JetParameters['geometry']['geometry']

export interface DecodedUrlState {
  geometry?: GeometryName
  densityRatio?: number
  width?: number
  height?: number
  majorAxis?: number
  minorAxis?: number
  thetaDeg?: number
  phiDeg?: number
  zetaMax?: number
  samples?: number
  selectedPresetId?: string
  densityLogScale?: boolean
  overlayId?: string
  crossSectionZeta?: number
  showSelectedCrossSection?: boolean
  showAxisSwitchingSection?: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function finiteNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function boolValue(value: string | null): boolean | undefined {
  if (value === null) {
    return undefined
  }

  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) {
    return false
  }

  return undefined
}

function setNumber(params: URLSearchParams, key: string, value: number): void {
  params.set(key, Number(value.toPrecision(8)).toString())
}

export function encodeStateToQuery(state: ExplorerState): URLSearchParams {
  const query = new URLSearchParams()
  const { params } = state

  query.set('geometry', params.geometry.geometry)
  setNumber(query, 'rhoStar', params.densityRatio)
  setNumber(query, 'theta', params.thetaDeg)
  setNumber(query, 'phi', params.phiDeg)
  setNumber(query, 'zetaMax', params.zetaMax)
  query.set('sampleCount', Math.round(params.samples).toString())

  if (params.geometry.geometry === 'rectangular') {
    setNumber(query, 'B0', params.geometry.width)
    setNumber(query, 'H0', params.geometry.height)
  } else {
    setNumber(query, 'a0', params.geometry.majorAxis)
    setNumber(query, 'b0', params.geometry.minorAxis)
  }

  if (state.selectedPresetId !== PRESET_CUSTOM) {
    query.set('preset', state.selectedPresetId)
  }

  query.set('densityLog', state.densityLogScale ? '1' : '0')
  query.set('overlay', state.overlayId)
  setNumber(query, 'crossSectionZeta', state.crossSectionZeta)
  query.set('showSection', state.showSelectedCrossSection ? '1' : '0')
  query.set('showAxisSwitchingSection', state.showAxisSwitchingSection ? '1' : '0')

  return query
}

export function decodeStateFromQuery(search: string): DecodedUrlState {
  const query = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const geometry = query.get('geometry')

  return {
    geometry: geometry === 'rectangular' || geometry === 'elliptical' ? geometry : undefined,
    densityRatio: finiteNumber(query.get('rhoStar')),
    width: finiteNumber(query.get('B0')),
    height: finiteNumber(query.get('H0')),
    majorAxis: finiteNumber(query.get('a0')),
    minorAxis: finiteNumber(query.get('b0')),
    thetaDeg: finiteNumber(query.get('theta')),
    phiDeg: finiteNumber(query.get('phi')),
    zetaMax: finiteNumber(query.get('zetaMax')),
    samples: finiteNumber(query.get('sampleCount')),
    selectedPresetId: query.get('preset') ?? undefined,
    densityLogScale: boolValue(query.get('densityLog')),
    overlayId: query.get('overlay') ?? undefined,
    crossSectionZeta: finiteNumber(query.get('crossSectionZeta')),
    showSelectedCrossSection: boolValue(query.get('showSection')),
    showAxisSwitchingSection: boolValue(query.get('showAxisSwitchingSection')),
  }
}

export function sanitizeDecodedState(decoded: DecodedUrlState): Partial<ExplorerState> {
  const base = createDefaultExplorerState()
  const preset = PRESETS.find((candidate) => candidate.id === decoded.selectedPresetId)
  const seedParams = preset ? cloneParams(preset.params) : cloneParams(base.params)
  const defaultRectWidth =
    seedParams.geometry.geometry === 'rectangular' ? seedParams.geometry.width : 1
  const defaultRectHeight =
    seedParams.geometry.geometry === 'rectangular' ? seedParams.geometry.height : 1
  const defaultMajorAxis =
    seedParams.geometry.geometry === 'elliptical' ? seedParams.geometry.majorAxis : 1
  const defaultMinorAxis =
    seedParams.geometry.geometry === 'elliptical' ? seedParams.geometry.minorAxis : 1
  const zetaMax =
    decoded.zetaMax === undefined
      ? seedParams.zetaMax
      : clamp(decoded.zetaMax, URL_LIMITS.zetaMax.min, URL_LIMITS.zetaMax.max)
  const geometry = decoded.geometry ?? seedParams.geometry.geometry

  const params: JetParameters = {
    ...seedParams,
    densityRatio:
      decoded.densityRatio === undefined || decoded.densityRatio <= 0
        ? seedParams.densityRatio
        : clamp(
            decoded.densityRatio,
            URL_LIMITS.densityRatio.min,
            URL_LIMITS.densityRatio.max,
          ),
    thetaDeg:
      decoded.thetaDeg === undefined
        ? seedParams.thetaDeg
        : clamp(decoded.thetaDeg, URL_LIMITS.angle.min, URL_LIMITS.angle.max),
    phiDeg:
      decoded.phiDeg === undefined
        ? seedParams.phiDeg
        : clamp(decoded.phiDeg, URL_LIMITS.angle.min, URL_LIMITS.angle.max),
    zetaMax,
    samples:
      decoded.samples === undefined
        ? seedParams.samples
        : Math.round(clamp(decoded.samples, URL_LIMITS.samples.min, URL_LIMITS.samples.max)),
    geometry:
      geometry === 'rectangular'
        ? {
            geometry: 'rectangular',
            width: clamp(
              decoded.width ?? defaultRectWidth,
              URL_LIMITS.dimension.min,
              URL_LIMITS.dimension.max,
            ),
            height: clamp(
              decoded.height ?? defaultRectHeight,
              URL_LIMITS.dimension.min,
              URL_LIMITS.dimension.max,
            ),
          }
        : {
            geometry: 'elliptical',
            majorAxis: clamp(
              decoded.majorAxis ?? defaultMajorAxis,
              URL_LIMITS.dimension.min,
              URL_LIMITS.dimension.max,
            ),
            minorAxis: clamp(
              decoded.minorAxis ?? defaultMinorAxis,
              URL_LIMITS.dimension.min,
              URL_LIMITS.dimension.max,
            ),
          },
  }

  return {
    params,
    selectedPresetId: preset ? preset.id : PRESET_CUSTOM,
    densityLogScale: decoded.densityLogScale ?? base.densityLogScale,
    overlayId: VELOCITY_OVERLAYS.some((overlay) => overlay.id === decoded.overlayId)
      ? decoded.overlayId
      : OVERLAY_NONE,
    crossSectionZeta:
      decoded.crossSectionZeta === undefined
        ? Math.min(base.crossSectionZeta, zetaMax)
        : clamp(decoded.crossSectionZeta, 0, zetaMax),
    showSelectedCrossSection:
      decoded.showSelectedCrossSection ?? base.showSelectedCrossSection,
    showAxisSwitchingSection:
      decoded.showAxisSwitchingSection ?? base.showAxisSwitchingSection,
  }
}

export function mergeStateWithDefaults(partial: Partial<ExplorerState>): ExplorerState {
  const base = createDefaultExplorerState()

  return {
    ...base,
    ...partial,
    params: partial.params ? cloneParams(partial.params) : cloneParams(base.params),
  }
}
