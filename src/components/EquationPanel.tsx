export function EquationPanel() {
  return (
    <section className="panel equation-panel" aria-labelledby="equations-title">
      <div className="section-heading">
        <p className="eyebrow">Reduced-order model</p>
        <h2 id="equations-title">Ideal momentum closure</h2>
      </div>

      <div className="equation-list">
        <p>
          <span className="equation">Ahat rhohat vhat^2 = 1</span>
          <span>Axial momentum flux is conserved for the prescribed top-hat control volume.</span>
        </p>
        <p>
          <span className="equation">rhohat = rho* + (1 - rho*) / (Ahat vhat)</span>
          <span>Composite density follows from the liquid fraction implied by bulk continuity.</span>
        </p>
        <p>
          <span className="equation">phat = 1 / Ahat</span>
          <span>Dynamic pressure decays directly with normalized area growth.</span>
        </p>
        <p>
          <span className="equation">mhat_g = rho* (Ahat vhat - 1)</span>
          <span>Gas entrainment is reported in nondimensional form relative to the inlet liquid flux.</span>
        </p>
        <p>
          <span className="equation">
            K_A = sqrt(rho*) / sqrt((rho* - 1)^2 + 4 rho* Ahat) dAhat/dzeta
          </span>
          <span>Generalized entrainment coefficient for arbitrary area-growth histories.</span>
        </p>
      </div>
    </section>
  )
}
