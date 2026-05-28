import type { UiText } from '../i18n/translations'
import {
  MAX_COMPARISON_CASES,
  describeComparisonCase,
  type ComparisonCase,
} from '../model/comparisonCases'

interface ComparisonAddPanelProps {
  caseCount: number
  notice: string
  text: UiText
  onAdd: () => void
}

interface ComparisonPanelProps {
  cases: ComparisonCase[]
  text: UiText
  onToggle: (id: string, visible: boolean) => void
  onRemove: (id: string) => void
  onClear: () => void
  onShowAll: () => void
  onHideAll: () => void
}

export function ComparisonAddPanel({
  caseCount,
  notice,
  text,
  onAdd,
}: ComparisonAddPanelProps) {
  const maxReached = caseCount >= MAX_COMPARISON_CASES

  return (
    <section className="panel comparison-add-panel" aria-labelledby="comparison-add-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">{text.comparison.addEyebrow}</p>
          <h2 id="comparison-add-title">{text.comparison.addTitle}</h2>
        </div>
      </div>
      <button
        type="button"
        className="primary-action full-width-action"
        disabled={maxReached}
        onClick={onAdd}
      >
        {text.comparison.addButton}
      </button>
      <p className="helper-text">{text.comparison.addHelper}</p>
      {maxReached ? <p className="warning-text">{text.comparison.maxWarning}</p> : null}
      {notice ? <p className="copy-status">{notice}</p> : null}
    </section>
  )
}

export function ComparisonPanel({
  cases,
  text,
  onToggle,
  onRemove,
  onClear,
  onShowAll,
  onHideAll,
}: ComparisonPanelProps) {
  return (
    <section className="panel comparison-panel" aria-labelledby="comparison-title">
      <div className="section-heading comparison-heading">
        <div>
          <p className="eyebrow">{text.comparison.trayEyebrow}</p>
          <h2 id="comparison-title">{text.comparison.trayTitle}</h2>
        </div>
        <div className="comparison-actions" aria-label={text.comparison.bulkActionsLabel}>
          <button type="button" className="secondary-action" onClick={onShowAll} disabled={!cases.length}>
            {text.comparison.showAll}
          </button>
          <button type="button" className="secondary-action" onClick={onHideAll} disabled={!cases.length}>
            {text.comparison.hideAll}
          </button>
          <button type="button" className="secondary-action danger-action" onClick={onClear} disabled={!cases.length}>
            {text.comparison.clearAll}
          </button>
        </div>
      </div>

      {cases.length === 0 ? (
        <p className="helper-text">{text.comparison.empty}</p>
      ) : (
        <div className="comparison-case-list">
          {cases.map((comparisonCase) => (
            <article
              key={comparisonCase.id}
              className="comparison-case"
              title={describeComparisonCase(comparisonCase)}
            >
              <label className="comparison-case-toggle">
                <input
                  type="checkbox"
                  checked={comparisonCase.visible}
                  onChange={(event) => onToggle(comparisonCase.id, event.target.checked)}
                />
                <span
                  className="comparison-swatch"
                  style={{ background: comparisonCase.color }}
                  aria-hidden="true"
                />
                <span className="comparison-label">{comparisonCase.label}</span>
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label={`${text.comparison.removeCase}: ${comparisonCase.label}`}
                onClick={() => onRemove(comparisonCase.id)}
              >
                ×
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
