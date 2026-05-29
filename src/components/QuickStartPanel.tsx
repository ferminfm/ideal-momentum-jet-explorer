import type { UiText } from '../i18n/translations'

export type QuickStartExampleId =
  | 'circular-baseline'
  | 'rectangular-axis-switching'
  | 'elliptical-axis-switching'
  | 'dimensional-water-air'
  | 'equal-density-lab'

interface QuickStartPanelProps {
  text: UiText
  onApplyExample: (exampleId: QuickStartExampleId) => void
}

const EXAMPLE_IDS: QuickStartExampleId[] = [
  'circular-baseline',
  'rectangular-axis-switching',
  'elliptical-axis-switching',
  'dimensional-water-air',
  'equal-density-lab',
]

export function QuickStartPanel({ text, onApplyExample }: QuickStartPanelProps) {
  return (
    <section className="panel quick-start-panel" aria-labelledby="quick-start-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text.quickStart.eyebrow}</p>
          <h2 id="quick-start-title">{text.quickStart.title}</h2>
        </div>
      </div>
      <div className="quick-start-grid">
        {EXAMPLE_IDS.map((exampleId) => {
          const example = text.quickStart.examples[exampleId]
          return (
            <article className="quick-start-card" key={exampleId}>
              <div>
                <h3>{example.title}</h3>
                <p>{example.description}</p>
              </div>
              <button
                type="button"
                className="secondary-action"
                onClick={() => onApplyExample(exampleId)}
              >
                {text.quickStart.apply}
              </button>
            </article>
          )
        })}
      </div>
      <p className="helper-text">{text.quickStart.note}</p>
    </section>
  )
}
