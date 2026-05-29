import type { DataOverlay } from './dataOverlayTypes'

export const DATA_OVERLAY_NONE = 'none'

// Do not add digitized literature points unless the numerical dataset is
// public/permissible and citation/license information is documented.
export const BUILTIN_DATA_OVERLAYS: DataOverlay[] = [
  {
    id: 'synthetic-equal-density-reference',
    label: 'Synthetic demo only - not data',
    variable: 'velocity',
    sourceKind: 'synthetic-demo',
    source: 'Synthetic reference generated inside the app; not measured data.',
    citationKey: 'SyntheticExampleNotForValidation',
    geometry: 'other',
    xLabel: 'zeta = z / De',
    yLabel: 'vhat',
    points: [
      { x: 0, y: 1 },
      { x: 5, y: 0.82 },
      { x: 10, y: 0.68 },
      { x: 20, y: 0.5 },
      { x: 30, y: 0.4 },
      { x: 40, y: 0.34 },
      { x: 50, y: 0.29 },
    ],
    notes:
      'Illustrates the overlay mechanism only. It is disabled by default and must not be interpreted as validation data.',
    publicData: false,
    visible: true,
    color: '#b35a2a',
    createdAt: '2026-05-29T00:00:00.000Z',
  },
]

export function getBuiltinDataOverlay(id: string): DataOverlay | undefined {
  return BUILTIN_DATA_OVERLAYS.find((overlay) => overlay.id === id)
}

export function cloneDataOverlay(overlay: DataOverlay): DataOverlay {
  return {
    ...overlay,
    points: overlay.points.map((point) => ({ ...point })),
  }
}

export function isBuiltinDataOverlay(id: string): boolean {
  return BUILTIN_DATA_OVERLAYS.some((overlay) => overlay.id === id)
}
