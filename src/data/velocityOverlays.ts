export type VelocityOverlayGeometry = 'elliptical' | 'rectangular' | 'circular' | 'other'

export interface VelocityOverlay {
  id: string
  label: string
  source: string
  citationKey: string
  geometry: VelocityOverlayGeometry
  xLabel: string
  yLabel: string
  points: Array<{ zeta: number; vhat: number }>
  notes: string
  publicData: boolean
}

export const VELOCITY_OVERLAY_NONE = 'none'

export const VELOCITY_OVERLAYS: VelocityOverlay[] = [
  {
    id: 'synthetic-equal-density-reference',
    label: 'Example synthetic velocity curve',
    source: 'Synthetic reference generated inside the app; not measured data.',
    citationKey: 'SyntheticExampleNotForValidation',
    geometry: 'other',
    xLabel: 'zeta = z / De',
    yLabel: 'vhat',
    points: [
      { zeta: 0, vhat: 1 },
      { zeta: 5, vhat: 0.82 },
      { zeta: 10, vhat: 0.68 },
      { zeta: 20, vhat: 0.5 },
      { zeta: 30, vhat: 0.4 },
      { zeta: 40, vhat: 0.34 },
      { zeta: 50, vhat: 0.29 },
    ],
    notes:
      'Illustrates the overlay mechanism only. It is disabled by default and must not be interpreted as validation data.',
    publicData: false,
  },
]

export function getVelocityOverlay(id: string): VelocityOverlay | undefined {
  return VELOCITY_OVERLAYS.find((overlay) => overlay.id === id)
}
