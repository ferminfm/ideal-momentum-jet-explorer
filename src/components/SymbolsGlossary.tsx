import type { UiText } from '../i18n/translations'
import { InlineMath } from './MathFormula'

interface SymbolsGlossaryProps {
  text: UiText
}

const SYMBOL_KEYS = [
  'zeta',
  'equivalentDiameter',
  'densityRatio',
  'area',
  'velocity',
  'density',
  'pressure',
  'gasEntrainment',
  'coefficient',
  'rectangularDimensions',
  'ellipticalDimensions',
  'angles',
  'initialArea',
  'areaHistory',
] as const

export function SymbolsGlossary({ text }: SymbolsGlossaryProps) {
  return (
    <section className="panel symbols-glossary" aria-labelledby="symbols-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">{text.symbols.eyebrow}</p>
          <h2 id="symbols-title">{text.symbols.title}</h2>
        </div>
      </div>

      <div className="symbol-grid">
        {SYMBOL_KEYS.map((key) => {
          const entry = text.symbols.entries[key]

          return (
            <div className="symbol-row" key={key}>
              <div className="symbol-token">
                <InlineMath math={entry.symbol} />
              </div>
              <p>{entry.meaning}</p>
            </div>
          )
        })}
      </div>
      <p className="symbols-note">{text.symbols.note}</p>
    </section>
  )
}
