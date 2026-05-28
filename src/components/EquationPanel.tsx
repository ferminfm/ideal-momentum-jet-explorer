import type { UiText } from '../i18n/translations'
import { BlockMath } from './MathFormula'
import { MathText } from './MathText'

interface EquationPanelProps {
  text: UiText
}

export function EquationPanel({ text }: EquationPanelProps) {
  const equations = [
    {
      math: String.raw`\widehat{A}\,\widehat{\rho}\,\widehat{v}^{\,2}=1`,
      description: text.equations.momentum,
    },
    {
      math: String.raw`\widehat{\rho}=\rho^\ast+\frac{1-\rho^\ast}{\widehat{A}\,\widehat{v}}`,
      description: text.equations.density,
    },
    {
      math: String.raw`\widehat{p}=\frac{1}{\widehat{A}}`,
      description: text.equations.pressure,
    },
    {
      math: String.raw`\widehat{\dot m}_g=\rho^\ast\left(\widehat{A}\widehat{v}-1\right)`,
      description: text.equations.entrainment,
    },
    {
      math: String.raw`K_A=\frac{\sqrt{\rho^\ast}}{\sqrt{(\rho^\ast-1)^2+4\rho^\ast\widehat{A}}}\frac{d\widehat{A}}{d\zeta}`,
      description: text.equations.coefficient,
    },
    {
      math: String.raw`K_A(\infty)=\sqrt{\lambda_1\lambda_2}`,
      description: text.equations.coefficientReferences,
    },
  ]

  return (
    <section className="panel equation-panel" aria-labelledby="equations-title">
      <div className="section-heading">
        <p className="eyebrow">{text.equations.eyebrow}</p>
        <h2 id="equations-title">{text.equations.title}</h2>
      </div>

      <div className="equation-list">
        {equations.map((equation) => (
          <div className="equation-item" key={equation.math}>
            <BlockMath math={equation.math} className="equation" />
            <span>
              <MathText text={equation.description} />
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
