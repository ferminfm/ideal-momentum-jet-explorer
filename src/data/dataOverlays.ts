import type { DataOverlay } from './dataOverlayTypes'

export const DATA_OVERLAY_NONE = 'none'

const SYNTHETIC_CALIBRATION_SOURCE =
  'Synthetic calibration fixture generated from the Ideal Momentum Jet Explorer model; not measured data.'
const SYNTHETIC_CREATED_AT = '2026-05-30T00:00:00.000Z'

interface SyntheticOverlayArgs {
  id: string
  label: string
  variable: DataOverlay['variable']
  geometry: DataOverlay['geometry']
  yLabel: string
  points: DataOverlay['points']
  notes: string
  color: string
}

function createSyntheticCalibrationOverlay({
  id,
  label,
  variable,
  geometry,
  yLabel,
  points,
  notes,
  color,
}: SyntheticOverlayArgs): DataOverlay {
  return {
    id,
    label,
    variable,
    sourceKind: 'synthetic-demo',
    source: SYNTHETIC_CALIBRATION_SOURCE,
    citationKey: 'SyntheticCalibrationFixtureNotValidation',
    geometry,
    xLabel: 'zeta = z / De',
    yLabel,
    points,
    notes,
    publicData: false,
    visible: true,
    color,
    createdAt: SYNTHETIC_CREATED_AT,
  }
}

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
      'Synthetic demo for the overlay mechanism only; not measured or validation data.',
    publicData: false,
    visible: true,
    color: '#b35a2a',
    createdAt: '2026-05-29T00:00:00.000Z',
  },
  createSyntheticCalibrationOverlay({
    id: 'synthetic-calibration-square-velocity-theta8',
    label: 'Synthetic calibration: square velocity, theta=phi=8°',
    variable: 'velocity',
    geometry: 'rectangular',
    yLabel: 'vhat',
    points: [
      { x: 0, y: 1 },
      { x: 5, y: 0.3867225 },
      { x: 10, y: 0.23971233 },
      { x: 15, y: 0.17368648 },
      { x: 20, y: 0.13617793 },
      { x: 30, y: 0.095102226 },
      { x: 40, y: 0.073063802 },
    ],
    notes:
      'Synthetic calibration fixture generated from the app model; not measured or validation data. Useful for testing symmetric-angle fitting.',
    color: '#236b8e',
  }),
  createSyntheticCalibrationOverlay({
    id: 'synthetic-calibration-rectangular-area-theta9p61-phi5p75',
    label: 'Synthetic calibration: rectangular area, theta=9.61°, phi=5.75°',
    variable: 'area',
    geometry: 'rectangular',
    yLabel: 'Ahat',
    points: [
      { x: 0, y: 1 },
      { x: 5, y: 6.6761197 },
      { x: 10, y: 16.693811 },
      { x: 15, y: 31.053074 },
      { x: 20, y: 49.753909 },
      { x: 30, y: 100.18029 },
      { x: 40, y: 167.97297 },
    ],
    notes:
      'Synthetic calibration fixture generated from the app model; not measured or validation data. Useful for testing two-angle fitting.',
    color: '#257a68',
  }),
  createSyntheticCalibrationOverlay({
    id: 'synthetic-calibration-elliptical-density-theta9p61-phi5p75',
    label: 'Synthetic calibration: elliptical density, theta=9.61°, phi=5.75°',
    variable: 'density',
    geometry: 'elliptical',
    yLabel: 'rhohat',
    points: [
      { x: 0, y: 1 },
      { x: 5, y: 0.18969247 },
      { x: 10, y: 0.078754266 },
      { x: 15, y: 0.043576108 },
      { x: 20, y: 0.028083943 },
      { x: 30, y: 0.015077016 },
      { x: 40, y: 0.0098643063 },
    ],
    notes:
      'Synthetic calibration fixture generated from the app model; not measured or validation data. Useful for testing density-branch fitting.',
    color: '#94424e',
  }),
  createSyntheticCalibrationOverlay({
    id: 'synthetic-calibration-rectangular-entrainment-theta9p61-phi5p75',
    label: 'Synthetic calibration: rectangular entrainment, theta=9.61°, phi=5.75°',
    variable: 'entrainment',
    geometry: 'rectangular',
    yLabel: 'mhat_g',
    points: [
      { x: 0, y: 3.4372505e-17 },
      { x: 5, y: 0.0067575698 },
      { x: 10, y: 0.018469295 },
      { x: 15, y: 0.034810169 },
      { x: 20, y: 0.055372168 },
      { x: 30, y: 0.10736111 },
      { x: 40, y: 0.17094145 },
    ],
    notes:
      'Synthetic calibration fixture generated from the app model; not measured or validation data. Useful for testing entrainment-branch fitting.',
    color: '#6d5312',
  }),
  createSyntheticCalibrationOverlay({
    id: 'synthetic-calibration-noisy-velocity-with-error',
    label: 'Synthetic calibration: noisy velocity with error bars',
    variable: 'velocity',
    geometry: 'rectangular',
    yLabel: 'vhat',
    points: [
      { x: 0, y: 1, yError: 0.02 },
      { x: 5, y: 0.3967225, yError: 0.018 },
      { x: 10, y: 0.23171233, yError: 0.016 },
      { x: 15, y: 0.17968648, yError: 0.014 },
      { x: 20, y: 0.13117793, yError: 0.012 },
      { x: 30, y: 0.098102226, yError: 0.01 },
      { x: 40, y: 0.071063802, yError: 0.009 },
    ],
    notes:
      'Synthetic noisy calibration fixture generated from the app model; not measured or validation data. Useful for testing weighted fitting.',
    color: '#6f5bb7',
  }),
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
