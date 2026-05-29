import type { UiText } from '../i18n/translations'
import { BlockMath } from './MathFormula'
import { MathText } from './MathText'

interface EquationPanelProps {
  text: UiText
}

export function EquationPanel({ text }: EquationPanelProps) {
  const conservationSystem = [
    String.raw`\widehat{A}\,\widehat{\rho}\,\widehat{v}^{\,2}=1`,
    String.raw`\widehat{\rho}=\rho^\ast+\frac{1-\rho^\ast}{\widehat{A}\,\widehat{v}}`,
  ]
  const explicitStateLaws = [
    String.raw`\Delta=\sqrt{(\rho^\ast-1)^2+4\rho^\ast\widehat{A}}`,
    String.raw`\widehat{v}=\frac{\rho^\ast-1+\Delta}{2\rho^\ast\widehat{A}}`,
    String.raw`\widetilde{\rho}=\rho^\ast+\frac{(1-\rho^\ast)^2}{2\widehat{A}}`,
    String.raw`\widehat{\rho}=\widetilde{\rho}+\sqrt{\widetilde{\rho}^{\,2}-(\rho^\ast)^2}`,
  ]
  const derivedQuantities = [
    String.raw`\widehat{p}=\frac{1}{\widehat{A}}`,
    String.raw`\widehat{\dot m}_g=\rho^\ast\left(\widehat{A}\widehat{v}-1\right)`,
    String.raw`K_A=\frac{\sqrt{\rho^\ast}}{\Delta}\frac{d\widehat{A}}{d\zeta}`,
    String.raw`K_A(\infty)=\sqrt{\lambda_1\lambda_2}`,
  ]

  return (
    <section className="panel equation-panel" aria-labelledby="equations-title">
      <div className="section-heading">
        <p className="eyebrow">{text.equations.eyebrow}</p>
        <h2 id="equations-title">{text.equations.title}</h2>
      </div>

      <div className="equation-list">
        <article className="equation-group">
          <h3>{text.equations.conservationTitle}</h3>
          <div className="equation-stack">
            {conservationSystem.map((math) => (
              <BlockMath math={math} className="equation" key={math} />
            ))}
          </div>
          <p>
            <MathText text={text.equations.conservationCaption} />
          </p>
        </article>

        <article className="equation-group equation-group-highlight">
          <h3>{text.equations.explicitTitle}</h3>
          <div className="equation-stack">
            {explicitStateLaws.map((math) => (
              <BlockMath math={math} className="equation" key={math} />
            ))}
          </div>
          <p>
            <MathText text={text.equations.explicitCaption} />
          </p>
        </article>

        <article className="equation-group">
          <h3>{text.equations.derivedTitle}</h3>
          <div className="equation-stack">
            {derivedQuantities.map((math) => (
              <BlockMath math={math} className="equation" key={math} />
            ))}
          </div>
          <p>
            <MathText text={text.equations.derivedCaption} />
          </p>
        </article>
      </div>
    </section>
  )
}
