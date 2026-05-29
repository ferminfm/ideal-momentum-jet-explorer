import type { ReportPayload } from '../model/reportGenerator'

interface ReportPreviewProps {
  payload: ReportPayload
}

const STATE_HEADERS = ['zeta', 'Ahat', 'vhat', 'rhohat', 'phat', 'mhat_g', 'K_A']

export function ReportPreview({ payload }: ReportPreviewProps) {
  return (
    <article className="report-preview" aria-label={payload.title}>
      <header className="report-preview__header">
        <h1>{payload.title}</h1>
        <p>Generated: {payload.generatedAt}</p>
        <p>Author: {payload.author}</p>
        {payload.app.version ? <p>Version: v{payload.app.version}</p> : null}
        <p>App URL: {payload.app.liveUrl}</p>
        <p>Repository: {payload.app.repositoryUrl}</p>
        {payload.app.shareUrl ? <p>Share URL: {payload.app.shareUrl}</p> : null}
      </header>

      <ReportSection title="Model Summary" value={payload.modelSummary} />
      <ReportSection title="Geometry" value={payload.geometrySummary} />
      {payload.dimensionalSummary ? (
        <ReportSection
          title="Operating Point / Dimensional Summary"
          value={payload.dimensionalSummary}
        />
      ) : null}
      {payload.regimeAssessment ? (
        <ReportSection
          title="Applicability / Regime Screening"
          value={payload.regimeAssessment}
        />
      ) : null}

      <section>
        <h2>State At Current Plotted Downstream Endpoint</h2>
        <p className="helper-text">
          Values are evaluated at the current plotted endpoint, zeta_max. This
          location is not treated as a special physical station by the model.
        </p>
        <DefinitionList value={payload.currentStateSummary} />
      </section>

      {payload.sampledStates?.length ? (
        <section>
          <h2>Sampled Reduced-Order State Table</h2>
          <div className="report-table-scroll">
            <ReportTable headers={STATE_HEADERS} rows={payload.sampledStates} />
          </div>
        </section>
      ) : null}

      {payload.comparisonCases?.length ? (
        <ReportRecordList title="Saved Model Cases" values={payload.comparisonCases} />
      ) : null}
      {payload.dataOverlays?.length ? (
        <section>
          <h2>Data Overlays</h2>
          <p className="helper-text">
            User-imported overlays are included only because the report option
            was enabled; verify privacy and provenance before sharing.
          </p>
          <RecordList values={payload.dataOverlays} />
        </section>
      ) : null}
      {payload.tipPenetration ? (
        <ReportSection title="Tip Penetration" value={payload.tipPenetration} />
      ) : null}
      {payload.cfdExportSummary ? (
        <ReportSection title="CFD / Configuration Export Summary" value={payload.cfdExportSummary} />
      ) : null}
      {payload.citations.length ? (
        <section>
          <h2>Citations</h2>
          <ul>
            {payload.citations.map((citation, index) => {
              const entry = citation as { id?: string; title?: string; plainText?: string }
              return (
                <li key={entry.id ?? index}>
                  <strong>{entry.title ?? 'Citation'}:</strong> {entry.plainText}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
      {payload.disclaimers.length ? (
        <section>
          <h2>Research-Use Disclaimer</h2>
          <ul>
            {payload.disclaimers.map((disclaimer) => (
              <li key={disclaimer}>{disclaimer}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

function ReportSection({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h2>{title}</h2>
      <DefinitionList value={value} />
    </section>
  )
}

function ReportRecordList({ title, values }: { title: string; values: unknown[] }) {
  return (
    <section>
      <h2>{title}</h2>
      <RecordList values={values} />
    </section>
  )
}

function RecordList({ values }: { values: unknown[] }) {
  return (
    <ol className="report-record-list">
      {values.map((value, index) => (
        <li key={index}>
          <DefinitionList value={value} />
        </li>
      ))}
    </ol>
  )
}

function DefinitionList({ value }: { value: unknown }) {
  return (
    <dl className="report-definition-list">
      {Object.entries(flattenForPreview(value)).map(([key, entryValue]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{formatValue(entryValue)}</dd>
        </div>
      ))}
    </dl>
  )
}

function ReportTable({ headers, rows }: { headers: string[]; rows: unknown[] }) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const record = row as Record<string, unknown>
          return (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{formatValue(record[header])}</td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function flattenForPreview(value: unknown, prefix = ''): Record<string, unknown> {
  if (value === null || value === undefined || typeof value !== 'object') {
    return prefix ? { [prefix]: value } : { value }
  }

  if (Array.isArray(value)) {
    return prefix ? { [prefix]: `${value.length} entries` } : { entries: value.length }
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (accumulator, [key, entryValue]) => {
      if (entryValue === undefined) {
        return accumulator
      }

      const nextKey = prefix ? `${prefix}.${key}` : key
      if (
        entryValue !== null &&
        typeof entryValue === 'object' &&
        !Array.isArray(entryValue)
      ) {
        return { ...accumulator, ...flattenForPreview(entryValue, nextKey) }
      }

      accumulator[nextKey] = Array.isArray(entryValue)
        ? `${entryValue.length} entries`
        : entryValue
      return accumulator
    },
    {},
  )
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toPrecision(6) : 'n/a'
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no'
  }

  if (value === null || value === undefined) {
    return 'n/a'
  }

  return String(value)
}
