import type { UiText } from '../i18n/translations'
import { MathText } from './MathText'

interface EquationPanelProps {
  text: UiText
}

export function EquationPanel({ text }: EquationPanelProps) {
  return (
    <section className="panel equation-panel" aria-labelledby="equations-title">
      <div className="section-heading">
        <p className="eyebrow">{text.equations.eyebrow}</p>
        <h2 id="equations-title">{text.equations.title}</h2>
      </div>

      <div className="equation-list">
        <p>
          <span className="equation">
            <MathText text="Ahat rhohat vhat² = 1" />
          </span>
          <span>{text.equations.momentum}</span>
        </p>
        <p>
          <span className="equation">
            <MathText text="rhohat = rho* + (1 - rho*) / (Ahat vhat)" />
          </span>
          <span>{text.equations.density}</span>
        </p>
        <p>
          <span className="equation">
            <MathText text="phat = 1 / Ahat" />
          </span>
          <span>{text.equations.pressure}</span>
        </p>
        <p>
          <span className="equation">
            <MathText text="mhat_g = rho* (Ahat vhat - 1)" />
          </span>
          <span>{text.equations.entrainment}</span>
        </p>
        <p>
          <span className="equation">
            <MathText text="K_A = sqrt(rho*) / sqrt((rho* - 1)² + 4 rho* Ahat) dAhat/dzeta" />
          </span>
          <span>{text.equations.coefficient}</span>
        </p>
      </div>
    </section>
  )
}
