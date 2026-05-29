import type { ReactNode } from 'react'
import { InlineMath } from './MathFormula'

const math = (source: string) => <InlineMath math={source} />

const TOKEN_RENDERERS = {
  'rho* = rho_g / rho_l': () => math(String.raw`\rho^\ast=\rho_g/\rho_l`),
  'dAhat/dzeta': () => math(String.raw`\frac{d\widehat{A}}{d\zeta}`),
  'K_A(z)': () => math(String.raw`K_A(z)`),
  'Ahat(zeta)': () => math(String.raw`\widehat{A}(\zeta)`),
  'vhat(zeta)': () => math(String.raw`\widehat{v}(\zeta)`),
  'rhohat(zeta)': () => math(String.raw`\widehat{\rho}(\zeta)`),
  'phat(zeta)': () => math(String.raw`\widehat{p}(\zeta)`),
  'mhat_g(zeta)': () => math(String.raw`\widehat{\dot m}_g(\zeta)`),
  'z / De': () => math(String.raw`z/D_e`),
  'A(z)': () => math(String.raw`A(z)`),
  Ahat: () => math(String.raw`\widehat{A}`),
  Bhat: () => math(String.raw`\widehat{B}`),
  Hhat: () => math(String.raw`\widehat{H}`),
  ahat: () => math(String.raw`\widehat{a}`),
  bhat: () => math(String.raw`\widehat{b}`),
  vhat: () => math(String.raw`\widehat{v}`),
  rhohat: () => math(String.raw`\widehat{\rho}`),
  phat: () => math(String.raw`\widehat{p}`),
  mhat_g: () => math(String.raw`\widehat{\dot m}_g`),
  K_A: () => math(String.raw`K_A`),
  rho_star: () => math(String.raw`\rho^\ast`),
  'rho*': () => math(String.raw`\rho^\ast`),
  rho_g: () => math(String.raw`\rho_g`),
  rho_l: () => math(String.raw`\rho_l`),
  B0: () => math(String.raw`B_0`),
  H0: () => math(String.raw`H_0`),
  a0: () => math(String.raw`a_0`),
  b0: () => math(String.raw`b_0`),
  A0: () => math(String.raw`A_0`),
  De: () => math(String.raw`D_e`),
  AR: () => math(String.raw`\mathrm{AR}`),
  theta: () => math(String.raw`\theta`),
  phi: () => math(String.raw`\phi`),
  zeta: () => math(String.raw`\zeta`),
  tau: () => math(String.raw`\tau`),
  zeta_tip: () => math(String.raw`\zeta_{\mathrm{tip}}`),
  v0: () => math(String.raw`v_0`),
  Delta: () => math(String.raw`\Delta`),
  beta: () => math(String.raw`\beta`),
  eta: () => math(String.raw`\eta`),
  alpha: () => math(String.raw`\alpha`),
  gamma: () => math(String.raw`\gamma`),
  lambda_1: () => math(String.raw`\lambda_1`),
  lambda_2: () => math(String.raw`\lambda_2`),
  sqrt: () => <span className="math-upright">√</span>,
} satisfies Record<string, () => ReactNode>

const TOKENS = Object.keys(TOKEN_RENDERERS).sort((left, right) => right.length - left.length)
const TOKEN_PATTERN = new RegExp(`(${TOKENS.map(escapeRegExp).join('|')})`, 'g')

interface MathTextProps {
  text: string
  className?: string
}

interface MathSymbolProps {
  token: keyof typeof TOKEN_RENDERERS
}

export function MathText({ text, className }: MathTextProps) {
  return <span className={className}>{renderMathText(text)}</span>
}

export function MathSymbol({ token }: MathSymbolProps) {
  return <span className="math-inline">{TOKEN_RENDERERS[token]()}</span>
}

function renderMathText(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const token = match[0] as keyof typeof TOKEN_RENDERERS
    const index = match.index ?? 0

    if (!isTokenBoundary(text, index, token)) {
      continue
    }

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index))
    }

    nodes.push(
      <span className="math-inline" key={`${token}-${index}`}>
        {TOKEN_RENDERERS[token]()}
      </span>,
    )
    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
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
