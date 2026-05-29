export type OverlayVariable =
  | 'area'
  | 'velocity'
  | 'density'
  | 'pressure'
  | 'entrainment'
  | 'coefficient'
  | 'width'
  | 'height'
  | 'majorAxis'
  | 'minorAxis'
  | 'other'

export type OverlaySourceKind =
  | 'public-literature'
  | 'user-import'
  | 'synthetic-demo'
  | 'cfd'
  | 'experiment'

export interface DataOverlayPoint {
  x: number
  y: number
  yError?: number
  xError?: number
}

export interface DataOverlay {
  id: string
  label: string
  variable: OverlayVariable
  sourceKind: OverlaySourceKind
  source: string
  citationKey?: string
  geometry?: 'rectangular' | 'elliptical' | 'circular' | 'other'
  xLabel: string
  yLabel: string
  xUnit?: string
  yUnit?: string
  points: DataOverlayPoint[]
  notes: string
  publicData: boolean
  visible: boolean
  color: string
  createdAt: string
}
