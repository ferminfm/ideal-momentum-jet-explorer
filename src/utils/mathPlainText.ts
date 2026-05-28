const PLAIN_MATH_REPLACEMENTS = {
  'rho* = rho_g / rho_l': 'ρ* = ρ_g / ρ_l',
  'dAhat/dzeta': 'dÂ/dζ',
  'K_A(z)': 'Kₐ(z)',
  'Ahat(zeta)': 'Â(ζ)',
  'vhat(zeta)': 'v̂(ζ)',
  'rhohat(zeta)': 'ρ̂(ζ)',
  'phat(zeta)': 'p̂(ζ)',
  'mhat_g(zeta)': 'm̂_g(ζ)',
  'z / De': 'z / Dₑ',
  'A(z)': 'A(z)',
  Ahat: 'Â',
  Bhat: 'B̂',
  Hhat: 'Ĥ',
  ahat: 'â',
  bhat: 'b̂',
  vhat: 'v̂',
  rhohat: 'ρ̂',
  phat: 'p̂',
  mhat_g: 'm̂_g',
  K_A: 'Kₐ',
  rho_star: 'ρ*',
  'rho*': 'ρ*',
  rho_g: 'ρ_g',
  rho_l: 'ρ_l',
  B0: 'B₀',
  H0: 'H₀',
  a0: 'a₀',
  b0: 'b₀',
  A0: 'A₀',
  De: 'Dₑ',
  AR: 'AR',
  theta: 'θ',
  phi: 'φ',
  zeta: 'ζ',
  Delta: 'Δ',
  beta: 'β',
  eta: 'η',
  alpha: 'α',
  gamma: 'γ',
  lambda_1: 'λ₁',
  lambda_2: 'λ₂',
  sqrt: '√',
} as const

const TOKENS = Object.keys(PLAIN_MATH_REPLACEMENTS).sort(
  (left, right) => right.length - left.length,
)
const TOKEN_PATTERN = new RegExp(`(${TOKENS.map(escapeRegExp).join('|')})`, 'g')

export function toMathPlainText(text: string): string {
  return text.replace(TOKEN_PATTERN, (token, _match, offset: number, fullText: string) => {
    if (!isTokenBoundary(fullText, offset, token)) {
      return token
    }

    const key = token as keyof typeof PLAIN_MATH_REPLACEMENTS
    return PLAIN_MATH_REPLACEMENTS[key] ?? token
  })
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isTokenBoundary(text: string, index: number, token: string): boolean {
  return !isAsciiWord(text[index - 1]) && !isAsciiWord(text[index + token.length])
}

function isAsciiWord(value: string | undefined): boolean {
  return value !== undefined && /[A-Za-z0-9_]/.test(value)
}
