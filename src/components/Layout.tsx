import type { ReactNode } from 'react'
import { LANGUAGE_OPTIONS, type Language, type UiText } from '../i18n/translations'

const GITHUB_URL = 'https://github.com/ferminfm/ideal-momentum-jet-explorer'
const MODEL_NOTES_URL = `${GITHUB_URL}#scientific-model`
const RESEARCHMAP_URL = 'https://researchmap.jp/francomedrano'
interface LayoutProps {
  children: ReactNode
  language: Language
  text: UiText
  onLanguageChange: (language: Language) => void
}

export function Layout({ children, language, text, onLanguageChange }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">{text.layout.eyebrow}</p>
          <h1>{text.layout.title}</h1>
          <p className="subtitle">{text.layout.subtitle}</p>
          <p className="description-line">{text.layout.description}</p>
          <p className="author-line">{text.layout.author}</p>
        </div>
        <div className="header-actions" aria-label={text.layout.projectLinksLabel}>
          <div className="language-switcher" aria-label={text.layout.languageLabel}>
            <span>{text.layout.languageLabel}</span>
            <div className="language-buttons">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={language === option.id ? 'active' : ''}
                  aria-pressed={language === option.id}
                  onClick={() => onLanguageChange(option.id)}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>
          <a className="repo-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            {text.layout.sourceCode}
          </a>
          <a className="repo-link secondary" href={MODEL_NOTES_URL} target="_blank" rel="noreferrer">
            {text.layout.modelNotes}
          </a>
          <a className="repo-link secondary" href={RESEARCHMAP_URL} target="_blank" rel="noreferrer">
            {text.layout.researchmap}
          </a>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <p>{text.layout.footerLineage}</p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          {text.layout.sourceRepository}
        </a>
      </footer>
    </div>
  )
}
