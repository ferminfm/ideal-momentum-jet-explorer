import { describe, expect, it } from 'vitest'
import { toMathPlainText } from './mathPlainText'

describe('math plain-text formatter', () => {
  it('formats standalone model variables', () => {
    expect(toMathPlainText('Ahat, vhat, rhohat, mhat_g, K_A')).toBe(
      'Â, v̂, ρ̂, m̂_g, Kₐ',
    )
    expect(toMathPlainText('rho* = rho_g / rho_l')).toBe('ρ* = ρ_g / ρ_l')
    expect(toMathPlainText('zeta = z / De')).toBe('ζ = z / Dₑ')
    expect(toMathPlainText('lambda_1, lambda_2, beta, eta')).toBe('λ₁, λ₂, β, η')
  })

  it('does not format variable tokens inside ordinary words', () => {
    expect(toMathPlainText('Density ratio')).toBe('Density ratio')
    expect(toMathPlainText('generalized entrainment coefficient')).toBe(
      'generalized entrainment coefficient',
    )
  })
})
