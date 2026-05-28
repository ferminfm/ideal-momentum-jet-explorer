export function InterpretationPanel() {
  return (
    <section className="panel interpretation-panel" aria-labelledby="interpretation-title">
      <div className="section-heading">
        <p className="eyebrow">Model scope</p>
        <h2 id="interpretation-title">Closure assumptions and validation boundary</h2>
      </div>
      <div className="interpretation-grid">
        <article>
          <h3>State closure</h3>
          <p>
            This app implements a conservative, top-hat, locally homogeneous two-phase state
            closure. The inputs are density ratio and a prescribed rectangular or elliptical
            area-growth history.
          </p>
        </article>
        <article>
          <h3>Predicted</h3>
          <p>
            Normalized area, bulk velocity, composite density, dynamic pressure, gas entrainment,
            and the generalized entrainment coefficient K_A(z).
          </p>
        </article>
        <article>
          <h3>Prescribed</h3>
          <p>
            Nozzle geometry, initial dimensions, directional spreading half-angles, and downstream
            sampling range are model inputs rather than inferred quantities.
          </p>
        </article>
        <article>
          <h3>Not predicted</h3>
          <p>
            Axis switching, vortex dynamics, droplet-size distribution, breakup, losses, and
            spreading angles. Velocity can be compared with equal-density jet data; composite
            density requires phase-fraction or concentration data.
          </p>
        </article>
      </div>
    </section>
  )
}
