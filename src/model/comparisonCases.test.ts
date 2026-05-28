import { describe, expect, it } from 'vitest'
import type { JetParameters } from './jetModel'
import {
  clearComparisonCases,
  createComparisonCase,
  deserializeComparisonCases,
  makeComparisonLabel,
  removeComparisonCase,
  serializeComparisonCases,
  setComparisonCaseVisibility,
} from './comparisonCases'

const rectangularParams: JetParameters = {
  densityRatio: 0.001,
  thetaDeg: 9.61,
  phiDeg: 5.75,
  zetaMax: 50,
  samples: 60,
  geometry: {
    geometry: 'rectangular',
    width: Math.sqrt(2),
    height: 1 / Math.sqrt(2),
  },
}

describe('comparison cases', () => {
  it('creates unique fixed snapshots with nonempty labels', () => {
    const first = createComparisonCase(rectangularParams, { index: 0 })
    const second = createComparisonCase(rectangularParams, { index: 1 })

    expect(first.id).not.toBe(second.id)
    expect(first.label.length).toBeGreaterThan(0)
    expect(second.label.length).toBeGreaterThan(0)
    expect(first.series.states).toHaveLength(rectangularParams.samples)
  })

  it('keeps params and samples frozen after source params are mutated', () => {
    const mutableParams: JetParameters = {
      ...rectangularParams,
      geometry: { ...rectangularParams.geometry },
    }
    const saved = createComparisonCase(mutableParams)
    const originalTerminalArea =
      saved.series.states[saved.series.states.length - 1].normalizedArea

    mutableParams.densityRatio = 1
    mutableParams.zetaMax = 10
    if (mutableParams.geometry.geometry === 'rectangular') {
      mutableParams.geometry.width = 4
    }

    expect(saved.params.densityRatio).toBeCloseTo(0.001)
    expect(saved.params.zetaMax).toBe(50)
    if (saved.params.geometry.geometry === 'rectangular') {
      expect(saved.params.geometry.width).toBeCloseTo(Math.sqrt(2))
    }
    expect(saved.series.states[saved.series.states.length - 1].normalizedArea).toBeCloseTo(
      originalTerminalArea,
    )
  })

  it('toggles, removes, and clears saved cases immutably', () => {
    const first = createComparisonCase(rectangularParams, { id: 'first' })
    const second = createComparisonCase(rectangularParams, { id: 'second' })
    const toggled = setComparisonCaseVisibility([first, second], 'first', false)

    expect(toggled[0].visible).toBe(false)
    expect(first.visible).toBe(true)

    const removed = removeComparisonCase(toggled, 'second')
    expect(removed).toHaveLength(1)
    expect(removed[0].id).toBe('first')
    expect(clearComparisonCases()).toEqual([])
  })

  it('creates concise labels for canonical limits', () => {
    expect(makeComparisonLabel(rectangularParams)).toContain('Rectangular')
    expect(
      makeComparisonLabel({
        ...rectangularParams,
        geometry: { geometry: 'rectangular', width: 1, height: 1 },
        thetaDeg: 8,
        phiDeg: 8,
      }),
    ).toContain('Square limit')
  })

  it('serializes and restores compact comparison cases', () => {
    const cases = [
      createComparisonCase(rectangularParams, {
        id: 'saved-1',
        label: 'Saved rectangle',
        visible: false,
        color: '#0072b2',
        createdAt: '2026-05-29T00:00:00.000Z',
      }),
    ]
    const serialized = serializeComparisonCases(cases)
    const restored = deserializeComparisonCases(serialized)

    expect(restored).toHaveLength(1)
    expect(restored[0].id).toBe('saved-1')
    expect(restored[0].label).toBe('Saved rectangle')
    expect(restored[0].visible).toBe(false)
    expect(restored[0].params.densityRatio).toBeCloseTo(cases[0].params.densityRatio)
    expect(restored[0].params.thetaDeg).toBeCloseTo(cases[0].params.thetaDeg)
    expect(restored[0].params.phiDeg).toBeCloseTo(cases[0].params.phiDeg)
    expect(restored[0].params.zetaMax).toBeCloseTo(cases[0].params.zetaMax)
    if (
      restored[0].params.geometry.geometry === 'rectangular' &&
      cases[0].params.geometry.geometry === 'rectangular'
    ) {
      expect(restored[0].params.geometry.width).toBeCloseTo(cases[0].params.geometry.width)
      expect(restored[0].params.geometry.height).toBeCloseTo(cases[0].params.geometry.height)
    }
    expect(restored[0].series.states).toHaveLength(rectangularParams.samples)
  })
})
