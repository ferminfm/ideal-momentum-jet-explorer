import { describe, expect, it } from 'vitest'
import { create3DCaptureFilename } from './capture3d'

describe('3D capture helpers', () => {
  it('creates a stable PNG filename with a filesystem-safe timestamp', () => {
    const filename = create3DCaptureFilename(
      new Date('2026-05-29T12:34:56.789Z'),
    )

    expect(filename).toBe('ideal-momentum-jet-3d-view_2026-05-29T12-34-56-789Z.png')
  })
})
