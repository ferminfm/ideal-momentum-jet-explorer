import type { UiText } from '../i18n/translations'

interface ExportPanelProps {
  shareStatus: string
  text: UiText
  onCopyShareUrl: () => void
  onDownloadCsv: () => void
}

export function ExportPanel({
  shareStatus,
  text,
  onCopyShareUrl,
  onDownloadCsv,
}: ExportPanelProps) {
  return (
    <section className="panel export-panel" aria-labelledby="export-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text.export.eyebrow}</p>
          <h2 id="export-title">{text.export.title}</h2>
        </div>
      </div>

      <div className="export-actions">
        <button type="button" className="primary-action" onClick={onCopyShareUrl}>
          {text.export.copyUrl}
        </button>
        <button type="button" className="secondary-action" onClick={onDownloadCsv}>
          {text.export.downloadCsv}
        </button>
      </div>
      <p className="helper-text">{text.export.helper}</p>
      {shareStatus ? <p className="copy-status">{shareStatus}</p> : null}
    </section>
  )
}
