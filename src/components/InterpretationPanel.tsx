import type { UiText } from '../i18n/translations'
import { MathText } from './MathText'

interface InterpretationPanelProps {
  text: UiText
}

export function InterpretationPanel({ text }: InterpretationPanelProps) {
  return (
    <section className="panel interpretation-panel" aria-labelledby="interpretation-title">
      <div className="section-heading">
        <p className="eyebrow">{text.interpretation.eyebrow}</p>
        <h2 id="interpretation-title">{text.interpretation.title}</h2>
      </div>
      <div className="interpretation-grid">
        <article>
          <h3>{text.interpretation.stateClosureTitle}</h3>
          <p>
            <MathText text={text.interpretation.stateClosureBody} />
          </p>
        </article>
        <article>
          <h3>{text.interpretation.predictedTitle}</h3>
          <p>
            <MathText text={text.interpretation.predictedBody} />
          </p>
        </article>
        <article>
          <h3>{text.interpretation.prescribedTitle}</h3>
          <p>
            <MathText text={text.interpretation.prescribedBody} />
          </p>
        </article>
        <article>
          <h3>{text.interpretation.notPredictedTitle}</h3>
          <p>
            <MathText text={text.interpretation.notPredictedBody} />
          </p>
        </article>
      </div>
    </section>
  )
}
