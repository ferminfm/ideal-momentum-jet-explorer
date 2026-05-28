import type { ReactNode } from 'react'

const GITHUB_URL = 'https://github.com/OWNER/ideal-momentum-jet-explorer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Scientific computing portfolio project</p>
          <h1>Ideal Momentum Jet Explorer</h1>
          <p className="subtitle">
            Interactive reduced-order model for circular, rectangular, and elliptical atomizing
            jets
          </p>
          <p className="author-line">Fermín Franco-Medrano — IMI Kyushu University / UABC</p>
        </div>
        <a className="repo-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
          Public GitHub
        </a>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <p>Model citation placeholder: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017.</p>
        <p>Kumamoto JSFM 2026 note: public visualization companion for the noncircular jet work.</p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub repository
        </a>
      </footer>
    </div>
  )
}
