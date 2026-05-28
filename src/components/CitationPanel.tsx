import { useState } from 'react'
import { CITATIONS, type CitationFormat } from '../data/citations'
import type { UiText } from '../i18n/translations'
import { copyTextToClipboard } from '../utils/clipboard'

const FORMAT_IDS: CitationFormat[] = ['plain', 'bibtex', 'latex', 'word']

interface CitationPanelProps {
  text: UiText
}

export function CitationPanel({ text }: CitationPanelProps) {
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
          <p className="eyebrow">{text.citations.eyebrow}</p>
          <h2 id="citation-title">{text.citations.title}</h2>
        </div>
      </div>

      <div className="plot-tabs compact-tabs" role="tablist" aria-label={text.citations.formatAria}>
        {FORMAT_IDS.map((formatId) => (
          <button
            key={formatId}
            type="button"
            className={format === formatId ? 'active' : ''}
            onClick={() => setFormat(formatId)}
          >
            {text.citations.formats[formatId]}
          </button>
        ))}
      </div>

      <div className="citation-list">
        {CITATIONS.map((citation) => {
          const citationText = citation.formats[format]
          const copyKey = `${citation.id}-${format}`

          return (
            <article key={citation.id} className="citation-card">
              <div>
                <h3>
                  {text.citations.entryTitles[
                    citation.id as keyof typeof text.citations.entryTitles
                  ] ?? citation.title}
                </h3>
                <pre>{citationText}</pre>
              </div>
              <button
                type="button"
                className="secondary-action"
                onClick={() => void copyCitation(copyKey, citationText)}
              >
                {copiedId === copyKey ? text.citations.copied : text.citations.copy}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
