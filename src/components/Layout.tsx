import type { ReactNode } from 'react'

const GITHUB_URL = 'https://github.com/ferminfm/ideal-momentum-jet-explorer'
const MODEL_NOTES_URL = `${GITHUB_URL}#scientific-model`
const AUTHOR_AFFILIATION =
  'Fermín Franco-Medrano — Ensenada Campus, Autonomous University of Baja California / Institute of Mathematics for Industry, Kyushu University'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Browser-based scientific computing app</p>
          <h1>Ideal Momentum Jet Explorer</h1>
          <p className="subtitle">
            Interactive reduced-order model for circular, rectangular, and elliptical atomizing
            jets
          </p>
          <p className="description-line">
            Explore how prescribed nozzle geometry and area growth affect bulk velocity, composite
            density, dynamic pressure, and entrainment in a conservative locally homogeneous
            two-phase jet model.
          </p>
          <p className="author-line">{AUTHOR_AFFILIATION}</p>
        </div>
        <div className="header-actions" aria-label="Project links">
          <a className="repo-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            Source code
          </a>
          <a className="repo-link secondary" href={MODEL_NOTES_URL} target="_blank" rel="noreferrer">
            Model notes
          </a>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <p>
          Model lineage: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017 circular ideal momentum jet
          model; rectangular and elliptical area-growth extension; Kumamoto JSFM 2026 short
          conference version.
        </p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          Source repository
        </a>
      </footer>
    </div>
  )
}
