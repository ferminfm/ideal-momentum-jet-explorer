export function InterpretationPanel() {
  return (
    <section className="panel interpretation-panel" aria-labelledby="interpretation-title">
      <div className="section-heading">
        <p className="eyebrow">Interpretation</p>
        <h2 id="interpretation-title">Scope and caveats</h2>
      </div>
      <div className="interpretation-grid">
        <article>
          <h3>Conservative branch</h3>
          <p>
            The app evaluates a conservative, lossless top-hat model. Geometry is prescribed
            through area growth, and the state variables follow from the ideal momentum closure.
          </p>
        </article>
        <article>
          <h3>What is predicted</h3>
          <p>
            The model returns normalized area, bulk velocity, composite density, dynamic pressure,
            gas entrainment, and a generalized entrainment coefficient for the selected geometry.
          </p>
        </article>
        <article>
          <h3>What is not predicted</h3>
          <p>
            Axis switching, vortex dynamics, breakup details, turbulence structure, and spreading
            half-angles are external inputs rather than model outputs.
          </p>
        </article>
        <article>
          <h3>Validation boundary</h3>
          <p>
            Composite density needs phase-fraction or concentration validation. Gutmark-like
            equal-density comparisons check the velocity branch only.
          </p>
        </article>
      </div>
    </section>
  )
}
