import {
  BUILTIN_DATA_OVERLAYS,
  cloneDataOverlay,
  getBuiltinDataOverlay,
  isBuiltinDataOverlay,
} from '../data/dataOverlays'
import {
  isGasPresetId,
  isLiquidPresetId,
} from '../data/fluidPresets'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { Language } from '../i18n/translations'
import {
  deserializeComparisonCases,
  serializeComparisonCases,
  type ComparisonCase,
} from '../model/comparisonCases'
import type { JetParameters } from '../model/jetModel'
import { PRESETS, cloneParams } from '../model/presets'
import {
  DEFAULT_DIMENSIONAL_SETTINGS,
  OVERLAY_NONE,
  PRESET_CUSTOM,
  createDefaultExplorerState,
  type DimensionalVelocityMode,
  type ExplorerState,
  type InputMode,
} from '../types/appState'

export const URL_LIMITS = {
  densityRatio: { min: 1e-4, max: 1 },
  dimension: { min: 0.25, max: 4 },
  dimensionMm: { min: 0.05, max: 10 },
  angle: { min: 0, max: 20 },
  zetaMax: { min: 10, max: 60 },
  samples: { min: 50, max: 200 },
  injectionVelocity: { min: 0.1, max: 300 },
  pressureDropKPa: { min: 1, max: 30000 },
  dischargeCoefficient: { min: 0.1, max: 1.2 },
}

type GeometryName = JetParameters['geometry']['geometry']

export interface DecodedUrlState {
  language?: Language
  inputMode?: InputMode
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
  liquidId?: string
  gasId?: string
  rectangularWidthMm?: number
  rectangularHeightMm?: number
  ellipticalMajorAxisMm?: number
  ellipticalMinorAxisMm?: number
  velocityMode?: DimensionalVelocityMode
  injectionVelocity?: number
  pressureDropKPa?: number
  dischargeCoefficient?: number
  densityLogScale?: boolean
  overlayId?: string
  builtinDataOverlays?: Array<{ id: string; visible: boolean }>
  comparisonCases?: ComparisonCase[]
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

function languageValue(value: string | null): Language | undefined {
  if (value === 'en' || value === 'ja' || value === 'es') {
    return value
  }

  return undefined
}

function inputModeValue(value: string | null): InputMode | undefined {
  if (value === 'normalized' || value === 'dimensional') {
    return value
  }

  return undefined
}

function velocityModeValue(value: string | null): DimensionalVelocityMode | undefined {
  if (value === 'velocity' || value === 'pressureDrop') {
    return value
  }

  return undefined
}

function setNumber(params: URLSearchParams, key: string, value: number): void {
  params.set(key, Number(value.toPrecision(8)).toString())
}

function parseBuiltinDataOverlays(value: string | null): Array<{ id: string; visible: boolean }> | undefined {
  if (!value) {
    return undefined
  }

  const overlays = value
    .split(',')
    .map((entry) => {
      const [id, visibleValue] = entry.split(':')
      if (!id || !isBuiltinDataOverlay(id)) {
        return undefined
      }

      return {
        id,
        visible: visibleValue === undefined ? true : visibleValue !== '0',
      }
    })
    .filter((entry): entry is { id: string; visible: boolean } => entry !== undefined)

  return overlays.length ? overlays : undefined
}

export function encodeStateToQuery(state: ExplorerState): URLSearchParams {
  const query = new URLSearchParams()
  const { params } = state

  query.set('lang', state.language)
  query.set('mode', state.inputMode)
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

  if (state.inputMode === 'dimensional') {
    const settings = state.dimensionalSettings
    query.set('liquid', settings.liquidId)
    query.set('gas', settings.gasId)
    setNumber(query, 'Bmm', settings.rectangularWidthMm)
    setNumber(query, 'Hmm', settings.rectangularHeightMm)
    setNumber(query, 'amm', settings.ellipticalMajorAxisMm)
    setNumber(query, 'bmm', settings.ellipticalMinorAxisMm)
    query.set('vmode', settings.velocityMode)
    setNumber(query, 'v0', settings.injectionVelocity)
    setNumber(query, 'dpkPa', settings.pressureDropKPa)
    setNumber(query, 'Cd', settings.dischargeCoefficient)
  }

  query.set('densityLog', state.densityLogScale ? '1' : '0')
  query.set('overlay', state.overlayId)
  const builtinDataOverlays = state.dataOverlays.filter((overlay) =>
    isBuiltinDataOverlay(overlay.id),
  )
  if (builtinDataOverlays.length) {
    query.set(
      'dataOverlays',
      builtinDataOverlays
        .map((overlay) => `${overlay.id}:${overlay.visible ? '1' : '0'}`)
        .join(','),
    )
  }
  const comparisonCases = serializeComparisonCases(state.comparisonCases)
  if (comparisonCases !== undefined) {
    query.set('cases', comparisonCases)
  }
  setNumber(query, 'crossSectionZeta', state.crossSectionZeta)
  query.set('showSection', state.showSelectedCrossSection ? '1' : '0')
  query.set('showAxisSwitchingSection', state.showAxisSwitchingSection ? '1' : '0')

  return query
}

export function decodeStateFromQuery(search: string): DecodedUrlState {
  const query = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const geometry = query.get('geometry')

  return {
    language: languageValue(query.get('lang')),
    inputMode: inputModeValue(query.get('mode')),
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
    liquidId: query.get('liquid') ?? undefined,
    gasId: query.get('gas') ?? undefined,
    rectangularWidthMm: finiteNumber(query.get('Bmm')),
    rectangularHeightMm: finiteNumber(query.get('Hmm')),
    ellipticalMajorAxisMm: finiteNumber(query.get('amm')),
    ellipticalMinorAxisMm: finiteNumber(query.get('bmm')),
    velocityMode: velocityModeValue(query.get('vmode')),
    injectionVelocity: finiteNumber(query.get('v0')),
    pressureDropKPa: finiteNumber(query.get('dpkPa')),
    dischargeCoefficient: finiteNumber(query.get('Cd')),
    densityLogScale: boolValue(query.get('densityLog')),
    overlayId: query.get('overlay') ?? undefined,
    builtinDataOverlays: parseBuiltinDataOverlays(query.get('dataOverlays')),
    comparisonCases: deserializeComparisonCases(query.get('cases') ?? undefined),
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
  const dimensionalDefaults = base.dimensionalSettings
  const legacyOverlayId = BUILTIN_DATA_OVERLAYS.some(
    (overlay) => overlay.id === decoded.overlayId,
  )
    ? decoded.overlayId ?? OVERLAY_NONE
    : OVERLAY_NONE
  const dataOverlays = buildBuiltinOverlaysFromDecoded(
    decoded.builtinDataOverlays,
    legacyOverlayId,
  )

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
    language: decoded.language ?? base.language,
    inputMode: decoded.inputMode ?? base.inputMode,
    dimensionalSettings: {
      liquidId:
        decoded.liquidId !== undefined && isLiquidPresetId(decoded.liquidId)
          ? decoded.liquidId
          : dimensionalDefaults.liquidId,
      gasId:
        decoded.gasId !== undefined && isGasPresetId(decoded.gasId)
          ? decoded.gasId
          : dimensionalDefaults.gasId,
      rectangularWidthMm: sanitizedNumber(
        decoded.rectangularWidthMm,
        DEFAULT_DIMENSIONAL_SETTINGS.rectangularWidthMm,
        URL_LIMITS.dimensionMm.min,
        URL_LIMITS.dimensionMm.max,
      ),
      rectangularHeightMm: sanitizedNumber(
        decoded.rectangularHeightMm,
        DEFAULT_DIMENSIONAL_SETTINGS.rectangularHeightMm,
        URL_LIMITS.dimensionMm.min,
        URL_LIMITS.dimensionMm.max,
      ),
      ellipticalMajorAxisMm: sanitizedNumber(
        decoded.ellipticalMajorAxisMm,
        DEFAULT_DIMENSIONAL_SETTINGS.ellipticalMajorAxisMm,
        URL_LIMITS.dimensionMm.min,
        URL_LIMITS.dimensionMm.max,
      ),
      ellipticalMinorAxisMm: sanitizedNumber(
        decoded.ellipticalMinorAxisMm,
        DEFAULT_DIMENSIONAL_SETTINGS.ellipticalMinorAxisMm,
        URL_LIMITS.dimensionMm.min,
        URL_LIMITS.dimensionMm.max,
      ),
      velocityMode: decoded.velocityMode ?? dimensionalDefaults.velocityMode,
      injectionVelocity: sanitizedNumber(
        decoded.injectionVelocity,
        DEFAULT_DIMENSIONAL_SETTINGS.injectionVelocity,
        URL_LIMITS.injectionVelocity.min,
        URL_LIMITS.injectionVelocity.max,
      ),
      pressureDropKPa: sanitizedNumber(
        decoded.pressureDropKPa,
        DEFAULT_DIMENSIONAL_SETTINGS.pressureDropKPa,
        URL_LIMITS.pressureDropKPa.min,
        URL_LIMITS.pressureDropKPa.max,
      ),
      dischargeCoefficient: sanitizedNumber(
        decoded.dischargeCoefficient,
        DEFAULT_DIMENSIONAL_SETTINGS.dischargeCoefficient,
        URL_LIMITS.dischargeCoefficient.min,
        URL_LIMITS.dischargeCoefficient.max,
      ),
    },
    params,
    selectedPresetId: preset ? preset.id : PRESET_CUSTOM,
    densityLogScale: decoded.densityLogScale ?? base.densityLogScale,
    overlayId: legacyOverlayId,
    comparisonCases: decoded.comparisonCases ?? base.comparisonCases,
    dataOverlays,
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
    dimensionalSettings: partial.dimensionalSettings
      ? { ...base.dimensionalSettings, ...partial.dimensionalSettings }
      : { ...base.dimensionalSettings },
    params: partial.params ? cloneParams(partial.params) : cloneParams(base.params),
    dataOverlays: partial.dataOverlays
      ? partial.dataOverlays.map(cloneDataOverlay)
      : base.dataOverlays.map(cloneDataOverlay),
  }
}

function buildBuiltinOverlaysFromDecoded(
  decodedOverlays: Array<{ id: string; visible: boolean }> | undefined,
  legacyOverlayId: string,
): DataOverlay[] {
  if (decodedOverlays !== undefined) {
    return decodedOverlays.flatMap((decodedOverlay) => {
      const overlay = getBuiltinDataOverlay(decodedOverlay.id)
      return overlay ? [{ ...cloneDataOverlay(overlay), visible: decodedOverlay.visible }] : []
    })
  }

  const legacyOverlay = getBuiltinDataOverlay(legacyOverlayId)
  return legacyOverlay ? [cloneDataOverlay(legacyOverlay)] : []
}

function sanitizedNumber(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  return clamp(value, min, max)
}
