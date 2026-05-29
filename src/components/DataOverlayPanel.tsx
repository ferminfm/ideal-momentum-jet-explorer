import { useState, type ChangeEvent } from 'react'
import {
  BUILTIN_DATA_OVERLAYS,
  DATA_OVERLAY_NONE,
  cloneDataOverlay,
  getBuiltinDataOverlay,
} from '../data/dataOverlays'
import type { DataOverlay, OverlayVariable } from '../data/dataOverlayTypes'
import type { UiText } from '../i18n/translations'
import {
  buildOverlayFromCsvSelection,
  getNumericColumns,
  parseCsvText,
  type ParsedCsvTable,
} from '../utils/dataOverlayCsv'

interface DataOverlayPanelProps {
  overlays: DataOverlay[]
  text: UiText
  onAddOverlay: (overlay: DataOverlay) => void
  onToggleOverlay: (id: string, visible: boolean) => void
  onRemoveOverlay: (id: string) => void
  onShowAll: () => void
  onHideAll: () => void
  onClearUser: () => void
  onClearAll: () => void
}

const USER_OVERLAY_COLORS = [
  '#6f5bb7',
  '#257a68',
  '#b35a2a',
  '#94424e',
  '#236b8e',
  '#6d5312',
]

const PLOTTABLE_VARIABLES: OverlayVariable[] = [
  'area',
  'velocity',
  'density',
  'pressure',
  'entrainment',
  'coefficient',
]

export function DataOverlayPanel({
  overlays,
  text,
  onAddOverlay,
  onToggleOverlay,
  onRemoveOverlay,
  onShowAll,
  onHideAll,
  onClearUser,
  onClearAll,
}: DataOverlayPanelProps) {
  const [selectedBuiltinId, setSelectedBuiltinId] = useState(DATA_OVERLAY_NONE)
  const [parsedTable, setParsedTable] = useState<ParsedCsvTable | null>(null)
  const [csvError, setCsvError] = useState('')
  const [xColumn, setXColumn] = useState('')
  const [yColumn, setYColumn] = useState('')
  const [xErrorColumn, setXErrorColumn] = useState('')
  const [yErrorColumn, setYErrorColumn] = useState('')
  const [variable, setVariable] = useState<OverlayVariable>('velocity')
  const [label, setLabel] = useState(text.dataOverlays.defaultImportedLabel)
  const [source, setSource] = useState('User-imported CSV')
  const [notes, setNotes] = useState('')

  const numericColumns = parsedTable ? getNumericColumns(parsedTable) : []
  const userOverlayCount = overlays.filter(
    (overlay) => overlay.sourceKind === 'user-import',
  ).length

  function addBuiltinOverlay() {
    const overlay = getBuiltinDataOverlay(selectedBuiltinId)
    if (!overlay) {
      return
    }

    onAddOverlay(cloneDataOverlay({ ...overlay, visible: true }))
  }

  function handleCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const table = parseCsvText(String(reader.result ?? ''))
        const numeric = getNumericColumns(table)
        if (numeric.length < 2) {
          throw new Error(text.dataOverlays.errors.insufficientNumericColumns)
        }

        setParsedTable(table)
        setCsvError('')
        setXColumn(numeric[0])
        setYColumn(numeric[1])
        setXErrorColumn('')
        setYErrorColumn('')
      } catch (error) {
        setParsedTable(null)
        setCsvError(error instanceof Error ? error.message : text.dataOverlays.errors.parseFailed)
      }
    }
    reader.onerror = () => {
      setParsedTable(null)
      setCsvError(text.dataOverlays.errors.parseFailed)
    }
    reader.readAsText(file)
  }

  function addCsvOverlay() {
    if (!parsedTable) {
      return
    }

    try {
      const overlay = buildOverlayFromCsvSelection({
        table: parsedTable,
        xColumn,
        yColumn,
        xErrorColumn: xErrorColumn || undefined,
        yErrorColumn: yErrorColumn || undefined,
        variable,
        label,
        source,
        notes,
        color: USER_OVERLAY_COLORS[userOverlayCount % USER_OVERLAY_COLORS.length],
      })
      onAddOverlay(overlay)
      setCsvError('')
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : text.dataOverlays.errors.parseFailed)
    }
  }

  return (
    <section className="panel data-overlay-panel" aria-labelledby="data-overlays-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">{text.dataOverlays.eyebrow}</p>
          <h2 id="data-overlays-title">{text.dataOverlays.title}</h2>
        </div>
      </div>

      <div className="data-overlay-block">
        <label className="control-label">{text.dataOverlays.builtinOverlays}</label>
        <div className="overlay-add-row">
          <select
            value={selectedBuiltinId}
            onChange={(event) => setSelectedBuiltinId(event.target.value)}
          >
            <option value={DATA_OVERLAY_NONE}>{text.dataOverlays.none}</option>
            {BUILTIN_DATA_OVERLAYS.map((overlay) => (
              <option key={overlay.id} value={overlay.id}>
                {text.dataOverlays.builtinLabels[
                  overlay.id as keyof typeof text.dataOverlays.builtinLabels
                ] ?? overlay.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="secondary-action"
            disabled={selectedBuiltinId === DATA_OVERLAY_NONE}
            onClick={addBuiltinOverlay}
          >
            {text.dataOverlays.addOverlay}
          </button>
        </div>
        <p className="helper-text">{text.dataOverlays.noMeasuredPublicData}</p>
      </div>

      <div className="data-overlay-block">
        <label className="control-label">{text.dataOverlays.importCsv}</label>
        <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} />
        <p className="helper-text">{text.dataOverlays.localOnly}</p>

        {parsedTable ? (
          <div className="data-overlay-import-grid">
            <label className="field">
              <span>{text.dataOverlays.xColumn}</span>
              <select value={xColumn} onChange={(event) => setXColumn(event.target.value)}>
                {numericColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.dataOverlays.yColumn}</span>
              <select value={yColumn} onChange={(event) => setYColumn(event.target.value)}>
                {numericColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.dataOverlays.xErrorColumn}</span>
              <select
                value={xErrorColumn}
                onChange={(event) => setXErrorColumn(event.target.value)}
              >
                <option value="">{text.dataOverlays.none}</option>
                {numericColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.dataOverlays.yErrorColumn}</span>
              <select
                value={yErrorColumn}
                onChange={(event) => setYErrorColumn(event.target.value)}
              >
                <option value="">{text.dataOverlays.none}</option>
                {numericColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.dataOverlays.targetVariable}</span>
              <select
                value={variable}
                onChange={(event) => setVariable(event.target.value as OverlayVariable)}
              >
                {PLOTTABLE_VARIABLES.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {text.dataOverlays.variableOptions[candidate]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.dataOverlays.label}</span>
              <input value={label} onChange={(event) => setLabel(event.target.value)} />
            </label>
            <label className="field">
              <span>{text.dataOverlays.sourceNotes}</span>
              <input value={source} onChange={(event) => setSource(event.target.value)} />
            </label>
            <label className="field">
              <span>{text.dataOverlays.notes}</span>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
            <button type="button" className="primary-action" onClick={addCsvOverlay}>
              {text.dataOverlays.addOverlay}
            </button>
          </div>
        ) : null}

        {csvError ? <p className="warning-text">{csvError}</p> : null}
      </div>

      <div className="data-overlay-block">
        <div className="comparison-actions" aria-label={text.dataOverlays.activeOverlays}>
          <button type="button" className="secondary-action" onClick={onShowAll} disabled={!overlays.length}>
            {text.dataOverlays.showAll}
          </button>
          <button type="button" className="secondary-action" onClick={onHideAll} disabled={!overlays.length}>
            {text.dataOverlays.hideAll}
          </button>
          <button type="button" className="secondary-action" onClick={onClearUser} disabled={!userOverlayCount}>
            {text.dataOverlays.clearUser}
          </button>
          <button type="button" className="secondary-action danger-action" onClick={onClearAll} disabled={!overlays.length}>
            {text.dataOverlays.clearAll}
          </button>
        </div>

        {overlays.length === 0 ? (
          <p className="helper-text">{text.dataOverlays.empty}</p>
        ) : (
          <div className="comparison-case-list">
            {overlays.map((overlay) => (
              <article
                key={overlay.id}
                className="comparison-case data-overlay-case"
                title={`${overlay.source}\n${overlay.notes}\n${overlay.points.length} points`}
              >
                <label className="comparison-case-toggle">
                  <input
                    type="checkbox"
                    checked={overlay.visible}
                    onChange={(event) => onToggleOverlay(overlay.id, event.target.checked)}
                  />
                  <span
                    className="comparison-swatch"
                    style={{ background: overlay.color }}
                    aria-hidden="true"
                  />
                  <span className="comparison-label">{overlay.label}</span>
                </label>
                <span className="overlay-badge">
                  {text.dataOverlays.variableOptions[overlay.variable] ?? overlay.variable}
                </span>
                <span className="overlay-badge source-kind">{overlay.sourceKind}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${text.dataOverlays.removeOverlay}: ${overlay.label}`}
                  onClick={() => onRemoveOverlay(overlay.id)}
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
