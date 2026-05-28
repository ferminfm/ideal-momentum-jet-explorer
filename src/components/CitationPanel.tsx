import { useState } from 'react'
import { CITATIONS, type CitationFormat } from '../data/citations'
import { copyTextToClipboard } from '../utils/clipboard'

const FORMATS: Array<{ id: CitationFormat; label: string }> = [
  { id: 'plain', label: 'Plain text' },
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'latex', label: 'LaTeX' },
  { id: 'word', label: 'Word / APA' },
]

export function CitationPanel() {
  const [format, setFormat] = useState<CitationFormat>('plain')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function copyCitation(id: string, text: string) {
    await copyTextToClipboard(text)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  return (
    <section className="panel citation-panel" aria-labelledby="citation-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">References</p>
          <h2 id="citation-title">Cite this model and app</h2>
        </div>
      </div>

      <div className="plot-tabs compact-tabs" role="tablist" aria-label="Citation format">
        {FORMATS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={format === entry.id ? 'active' : ''}
            onClick={() => setFormat(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="citation-list">
        {CITATIONS.map((citation) => {
          const text = citation.formats[format]
          const copyKey = `${citation.id}-${format}`

          return (
            <article key={citation.id} className="citation-card">
              <div>
                <h3>{citation.title}</h3>
                <pre>{text}</pre>
              </div>
              <button
                type="button"
                className="secondary-action"
                onClick={() => void copyCitation(copyKey, text)}
              >
                {copiedId === copyKey ? 'Copied' : 'Copy'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
