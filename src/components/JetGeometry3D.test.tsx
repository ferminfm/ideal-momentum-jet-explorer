import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { GeometryViewControls } from './JetGeometry3D'

describe('GeometryViewControls', () => {
  it('renders capture, camera preset, axes, and nozzle controls', () => {
    const onCapture = vi.fn()
    const onCameraPreset = vi.fn()
    const onShowAxesChange = vi.fn()
    const onShowNozzleChange = vi.fn()

    render(
      <GeometryViewControls
        text={TRANSLATIONS.en}
        showAxes
        showNozzle
        captureStatus=""
        onCapture={onCapture}
        onCameraPreset={onCameraPreset}
        onShowAxesChange={onShowAxesChange}
        onShowNozzleChange={onShowNozzleChange}
      />,
    )

    fireEvent.click(screen.getByText('Capture 3D view'))
    fireEvent.click(screen.getByTitle('Look along x'))
    fireEvent.click(screen.getByLabelText('Show axes'))
    fireEvent.click(screen.getByLabelText('Show nozzle'))

    expect(onCapture).toHaveBeenCalledTimes(1)
    expect(onCameraPreset).toHaveBeenCalledWith('x')
    expect(onShowAxesChange).toHaveBeenCalledWith(false)
    expect(onShowNozzleChange).toHaveBeenCalledWith(false)
  })
})
