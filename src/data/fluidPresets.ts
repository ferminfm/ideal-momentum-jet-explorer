import type { FluidProperties } from '../model/engineering'

// Representative values for exploratory calculations; verify properties for engineering use.
export const LIQUID_PRESETS: FluidProperties[] = [
  {
    id: 'water-room-temperature',
    label: 'Water, room temperature',
    density: 997,
    dynamicViscosity: 0.00089,
    surfaceTension: 0.072,
  },
  {
    id: 'diesel-like-fuel',
    label: 'Diesel-like fuel',
    density: 830,
    dynamicViscosity: 0.0025,
    surfaceTension: 0.025,
  },
  {
    id: 'gasoline-like-fuel',
    label: 'Gasoline-like fuel',
    density: 740,
    dynamicViscosity: 0.0006,
    surfaceTension: 0.022,
  },
]

export const GAS_PRESETS: FluidProperties[] = [
  {
    id: 'air-room-conditions',
    label: 'Air, room conditions',
    density: 1.2,
    dynamicViscosity: 1.8e-5,
    soundSpeed: 343,
  },
  {
    id: 'high-density-chamber-gas',
    label: 'High-density chamber gas example',
    density: 20,
    dynamicViscosity: 2.0e-5,
    soundSpeed: 343,
  },
]

export const WATER_ROOM_TEMPERATURE = LIQUID_PRESETS[0]
export const AIR_ROOM_CONDITIONS = GAS_PRESETS[0]
