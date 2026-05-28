interface ExportPanelProps {
  shareStatus: string
  onCopyShareUrl: () => void
  onDownloadCsv: () => void
}

export function ExportPanel({
  shareStatus,
  onCopyShareUrl,
  onDownloadCsv,
}: ExportPanelProps) {
  return (
    <section className="panel export-panel" aria-labelledby="export-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reproducibility</p>
          <h2 id="export-title">Share and export</h2>
        </div>
      </div>

      <div className="export-actions">
        <button type="button" className="primary-action" onClick={onCopyShareUrl}>
          Copy shareable URL
        </button>
        <button type="button" className="secondary-action" onClick={onDownloadCsv}>
          Download CSV
        </button>
      </div>
      <p className="helper-text">
        URLs encode the model configuration, plot options, overlay choice, and cross-section
        controls. CSV exports include all sampled state variables for the current settings.
      </p>
      {shareStatus ? <p className="copy-status">{shareStatus}</p> : null}
    </section>
  )
}
