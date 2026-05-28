import type { JetParameters } from './jetModel'

export interface JetPreset {
  id: string
  name: string
  description: string
  params: JetParameters
}

const ROOT_TWO = Math.sqrt(2)
const INV_ROOT_TWO = 1 / Math.sqrt(2)

export const DEFAULT_PARAMS: JetParameters = {
  densityRatio: 0.0012,
  thetaDeg: 9.61,
  phiDeg: 5.75,
  zetaMax: 50,
  samples: 120,
  geometry: {
    geometry: 'rectangular',
    width: ROOT_TWO,
    height: INV_ROOT_TWO,
  },
}

export const PRESETS: JetPreset[] = [
  {
    id: 'circular-limit',
    name: 'Circular limit',
    description: 'Elliptical branch with equal full axes and isotropic spreading.',
    params: {
      densityRatio: 0.001,
      thetaDeg: 8,
      phiDeg: 8,
      zetaMax: 50,
      samples: 120,
      geometry: {
        geometry: 'elliptical',
        majorAxis: 1,
        minorAxis: 1,
      },
    },
  },
  {
    id: 'square-limit',
    name: 'Square limit',
    description: 'Rectangular branch with equal sides and isotropic spreading.',
    params: {
      densityRatio: 0.001,
      thetaDeg: 8,
      phiDeg: 8,
      zetaMax: 50,
      samples: 120,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    },
  },
  {
    id: 'rectangular-ar2',
    name: 'Rectangular AR=2',
    description: 'Equal-area rectangular nozzle with slower spreading on the long side.',
    params: {
      ...DEFAULT_PARAMS,
      densityRatio: 0.001,
      thetaDeg: 9.61,
      phiDeg: 5.75,
      geometry: {
        geometry: 'rectangular',
        width: ROOT_TWO,
        height: INV_ROOT_TWO,
      },
    },
  },
  {
    id: 'elliptical-ar2',
    name: 'Elliptical AR=2',
    description: 'Full-axis elliptical nozzle with slower spreading on the major axis.',
    params: {
      densityRatio: 0.001,
      thetaDeg: 5.75,
      phiDeg: 9.61,
      zetaMax: 50,
      samples: 120,
      geometry: {
        geometry: 'elliptical',
        majorAxis: ROOT_TWO,
        minorAxis: INV_ROOT_TWO,
      },
    },
  },
  {
    id: 'gutmark-like-elliptic',
    name: 'Gutmark-like elliptic example',
    description: 'Equal-density elliptic branch for velocity-only comparison studies.',
    params: {
      densityRatio: 1,
      thetaDeg: 5.75,
      phiDeg: 9.61,
      zetaMax: 40,
      samples: 120,
      geometry: {
        geometry: 'elliptical',
        majorAxis: ROOT_TWO,
        minorAxis: INV_ROOT_TWO,
      },
    },
  },
  {
    id: 'liquid-in-air',
    name: 'Liquid-in-air atomizing example',
    description: 'Air-to-water density ratio with a rectangular anisotropic exit.',
    params: {
      ...DEFAULT_PARAMS,
      densityRatio: 1.2 / 1000,
    },
  },
  {
    id: 'equal-density',
    name: 'Equal-density single-phase branch',
    description: 'Single-phase limit with density ratio equal to unity.',
    params: {
      ...DEFAULT_PARAMS,
      densityRatio: 1,
      thetaDeg: 8,
      phiDeg: 8,
      geometry: {
        geometry: 'rectangular',
        width: 1,
        height: 1,
      },
    },
  },
]

export function cloneParams(params: JetParameters): JetParameters {
  return {
    ...params,
    geometry: { ...params.geometry },
  }
}
