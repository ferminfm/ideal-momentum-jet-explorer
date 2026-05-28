import type { ReactNode } from 'react'

const TOKEN_RENDERERS = {
  'rho* = rho_g / rho_l': () => (
    <>
      <RhoStar /> = <Rho subscript="g" /> / <Rho subscript="l" />
    </>
  ),
  'dAhat/dzeta': () => (
    <>
      d<Hat>A</Hat>/d<Greek letter="ζ" />
    </>
  ),
  'K_A(z)': () => (
    <>
      <KCoefficient />(z)
    </>
  ),
  'Ahat(zeta)': () => (
    <>
      <Hat>A</Hat>(<Greek letter="ζ" />)
    </>
  ),
  'vhat(zeta)': () => (
    <>
      <Hat>v</Hat>(<Greek letter="ζ" />)
    </>
  ),
  'rhohat(zeta)': () => (
    <>
      <Hat>
        <Greek letter="ρ" />
      </Hat>
      (<Greek letter="ζ" />)
    </>
  ),
  'phat(zeta)': () => (
    <>
      <Hat>p</Hat>(<Greek letter="ζ" />)
    </>
  ),
  'mhat_g(zeta)': () => (
    <>
      <MhatGas />(<Greek letter="ζ" />)
    </>
  ),
  'z / De': () => (
    <>
      z / <DSubE />
    </>
  ),
  'A(z)': () => <>A(z)</>,
  Ahat: () => <Hat>A</Hat>,
  Bhat: () => <Hat>B</Hat>,
  Hhat: () => <Hat>H</Hat>,
  ahat: () => <Hat>a</Hat>,
  bhat: () => <Hat>b</Hat>,
  vhat: () => <Hat>v</Hat>,
  rhohat: () => (
    <Hat>
      <Greek letter="ρ" />
    </Hat>
  ),
  phat: () => <Hat>p</Hat>,
  mhat_g: () => <MhatGas />,
  K_A: () => <KCoefficient />,
  rho_star: () => <RhoStar />,
  'rho*': () => <RhoStar />,
  rho_g: () => <Rho subscript="g" />,
  rho_l: () => <Rho subscript="l" />,
  B0: () => <Subscript base="B" subscript="0" />,
  H0: () => <Subscript base="H" subscript="0" />,
  a0: () => <Subscript base="a" subscript="0" />,
  b0: () => <Subscript base="b" subscript="0" />,
  A0: () => <Subscript base="A" subscript="0" />,
  De: () => <DSubE />,
  AR: () => <span className="math-upright">AR</span>,
  theta: () => <Greek letter="θ" />,
  phi: () => <Greek letter="φ" />,
  zeta: () => <Greek letter="ζ" />,
  Delta: () => <Greek letter="Δ" />,
  beta: () => <Greek letter="β" />,
  eta: () => <Greek letter="η" />,
  alpha: () => <Greek letter="α" />,
  gamma: () => <Greek letter="γ" />,
  lambda_1: () => <Subscript base={<Greek letter="λ" />} subscript="1" />,
  lambda_2: () => <Subscript base={<Greek letter="λ" />} subscript="2" />,
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

function Hat({ children }: { children: ReactNode }) {
  return <span className="math-overhat">{children}</span>
}

function Greek({ letter }: { letter: string }) {
  return <span className="math-greek">{letter}</span>
}

function Subscript({ base, subscript }: { base: ReactNode; subscript: ReactNode }) {
  return (
    <>
      {base}
      <sub>{subscript}</sub>
    </>
  )
}

function Rho({ subscript }: { subscript?: string }) {
  return (
    <>
      <Greek letter="ρ" />
      {subscript ? <sub>{subscript}</sub> : null}
    </>
  )
}

function RhoStar() {
  return (
    <>
      <Greek letter="ρ" />
      <sup>*</sup>
    </>
  )
}

function DSubE() {
  return <Subscript base="D" subscript="e" />
}

function KCoefficient() {
  return <Subscript base="K" subscript="A" />
}

function MhatGas() {
  return (
    <>
      <Hat>
        <span className="math-overdot">m</span>
      </Hat>
      <sub>g</sub>
    </>
  )
}
