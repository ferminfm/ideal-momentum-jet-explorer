import {
  BUILTIN_DATA_OVERLAYS,
  DATA_OVERLAY_NONE,
  getBuiltinDataOverlay,
} from './dataOverlays'
import type { DataOverlay } from './dataOverlayTypes'

export type VelocityOverlayGeometry = 'elliptical' | 'rectangular' | 'circular' | 'other'

export type VelocityOverlay = DataOverlay

export const VELOCITY_OVERLAY_NONE = DATA_OVERLAY_NONE

export const VELOCITY_OVERLAYS = BUILTIN_DATA_OVERLAYS.filter(
  (overlay) => overlay.variable === 'velocity',
)

export function getVelocityOverlay(id: string): VelocityOverlay | undefined {
  return getBuiltinDataOverlay(id)
}
