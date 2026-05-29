import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { DEFAULT_PARAMS } from '../model/presets'
import { DEFAULT_DIMENSIONAL_SETTINGS } from '../types/appState'
import { ControlPanel } from './ControlPanel'

describe('ControlPanel', () => {
  it('renders normalized controls without the old preset grid', () => {
    render(
      <ControlPanel
        params={DEFAULT_PARAMS}
        inputMode="normalized"
        dimensionalSettings={DEFAULT_DIMENSIONAL_SETTINGS}
        text={TRANSLATIONS.en}
        onInputModeChange={vi.fn()}
        onDimensionalSettingsChange={vi.fn()}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Nozzle and area-growth inputs')).toBeTruthy()
    expect(screen.getByText('Input mode')).toBeTruthy()
    expect(screen.queryByText('Presets')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Circular limit' })).toBeNull()
  })
})
