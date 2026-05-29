import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LazyPanelFallback } from './LazyPanelFallback'

describe('LazyPanelFallback', () => {
  it('renders an accessible loading status', () => {
    render(<LazyPanelFallback label="Loading plots..." />)

    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText('Loading plots...')).toBeTruthy()
  })
})
