import type { ReportPayload } from '../model/reportGenerator'
import { downloadTextFile } from './cfdExportSerializers'

export function serializeReportMarkdown(payload: ReportPayload): string {
  const lines = [
    `# ${payload.title}`,
    '',
    `Generated: ${payload.generatedAt}`,
    `Author: ${payload.author}`,
    payload.app.version ? `Version: v${payload.app.version}` : undefined,
    `App URL: ${payload.app.liveUrl}`,
    `Repository: ${payload.app.repositoryUrl}`,
    payload.app.shareUrl ? `Share URL: ${payload.app.shareUrl}` : undefined,
    '',
    '## Model Summary',
    '',
    ...recordToBullets(payload.modelSummary),
    '',
    '## Geometry',
    '',
    ...recordToBullets(payload.geometrySummary),
    '',
    '## State At Current Plotted Downstream Endpoint',
    '',
    'Values below are evaluated at the current plotted endpoint, zeta_max; this location is not treated as a special physical station by the model.',
    '',
    ...recordToBullets(payload.currentStateSummary),
    '',
  ].filter((line): line is string => line !== undefined)

  if (payload.dimensionalSummary) {
    lines.push(
      '## Operating Point / Dimensional Summary',
      '',
      ...recordToBullets(flattenForReport(payload.dimensionalSummary)),
      '',
    )
  }

  if (payload.regimeAssessment) {
    lines.push(
      '## Applicability / Regime Screening',
      '',
      ...recordToBullets(flattenForReport(payload.regimeAssessment)),
      '',
    )
  }

  if (payload.sampledStates?.length) {
    lines.push(
      '## Sampled Reduced-Order State Table',
      '',
      markdownTable(
        ['zeta', 'Ahat', 'vhat', 'rhohat', 'phat', 'mhat_g', 'K_A'],
        payload.sampledStates,
      ),
      '',
    )
  }

  if (payload.comparisonCases?.length) {
    lines.push('## Saved Model Cases', '', ...listRecords(payload.comparisonCases), '')
  }

  if (payload.dataOverlays?.length) {
    lines.push(
      '## Data Overlays',
      '',
      'User-imported overlays are included only because the report option was enabled; verify privacy and provenance before sharing.',
      '',
      ...listRecords(payload.dataOverlays),
      '',
    )
  }

  if (payload.tipPenetration) {
    lines.push(
      '## Tip Penetration',
      '',
      ...recordToBullets(flattenForReport(payload.tipPenetration)),
      '',
    )
  }

  if (payload.cfdExportSummary) {
    lines.push(
      '## CFD / Configuration Export Summary',
      '',
      ...recordToBullets(flattenForReport(payload.cfdExportSummary)),
      '',
    )
  }

  if (payload.citations.length) {
    lines.push(
      '## Citations',
      '',
      ...payload.citations.map((citation) => {
        const entry = citation as { title?: string; plainText?: string }
        return `- ${entry.title ?? 'Citation'}: ${entry.plainText ?? ''}`
      }),
      '',
    )
  }

  if (payload.disclaimers.length) {
    lines.push(
      '## Research-Use Disclaimer',
      '',
      ...payload.disclaimers.map((disclaimer) => `- ${disclaimer}`),
      '',
    )
  }

  return `${lines.join('\n')}\n`
}

export function serializeReportHtml(payload: ReportPayload): string {
  const sections = [
    htmlSection('Model Summary', htmlDefinitionList(payload.modelSummary)),
    htmlSection('Geometry', htmlDefinitionList(payload.geometrySummary)),
    htmlSection(
      'State At Current Plotted Downstream Endpoint',
      `<p>Values below are evaluated at the current plotted endpoint, zeta_max; this location is not treated as a special physical station by the model.</p>${htmlDefinitionList(
        payload.currentStateSummary,
      )}`,
    ),
    payload.dimensionalSummary
      ? htmlSection(
          'Operating Point / Dimensional Summary',
          htmlDefinitionList(flattenForReport(payload.dimensionalSummary)),
        )
      : '',
    payload.regimeAssessment
      ? htmlSection(
          'Applicability / Regime Screening',
          htmlDefinitionList(flattenForReport(payload.regimeAssessment)),
        )
      : '',
    payload.sampledStates?.length
      ? htmlSection(
          'Sampled Reduced-Order State Table',
          htmlTable(
            ['zeta', 'Ahat', 'vhat', 'rhohat', 'phat', 'mhat_g', 'K_A'],
            payload.sampledStates,
          ),
        )
      : '',
    payload.comparisonCases?.length
      ? htmlSection('Saved Model Cases', htmlRecordList(payload.comparisonCases))
      : '',
    payload.dataOverlays?.length
      ? htmlSection(
          'Data Overlays',
          '<p>User-imported overlays are included only because the report option was enabled; verify privacy and provenance before sharing.</p>' +
            htmlRecordList(payload.dataOverlays),
        )
      : '',
    payload.tipPenetration
      ? htmlSection('Tip Penetration', htmlDefinitionList(flattenForReport(payload.tipPenetration)))
      : '',
    payload.cfdExportSummary
      ? htmlSection(
          'CFD / Configuration Export Summary',
          htmlDefinitionList(flattenForReport(payload.cfdExportSummary)),
        )
      : '',
    payload.citations.length
      ? htmlSection(
          'Citations',
          `<ul>${payload.citations
            .map((citation) => {
              const entry = citation as { title?: string; plainText?: string }
              return `<li><strong>${escapeHtml(entry.title ?? 'Citation')}:</strong> ${escapeHtml(
                entry.plainText ?? '',
              )}</li>`
            })
            .join('')}</ul>`,
        )
      : '',
    payload.disclaimers.length
      ? htmlSection(
          'Research-Use Disclaimer',
          `<ul>${payload.disclaimers
            .map((disclaimer) => `<li>${escapeHtml(disclaimer)}</li>`)
            .join('')}</ul>`,
        )
      : '',
  ].join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(payload.title)}</title>
  <style>
    body { margin: 0; padding: 32px; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172331; background: #ffffff; }
    main { max-width: 900px; margin: 0 auto; }
    h1 { margin: 0 0 0.3rem; font-size: 1.8rem; }
    h2 { margin-top: 1.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #d7e1ea; font-size: 1.1rem; }
    p, li, dt, dd, td, th { font-size: 0.92rem; line-height: 1.45; }
    .meta { color: #52677a; margin: 0.15rem 0; }
    dl { display: grid; grid-template-columns: minmax(150px, 0.45fr) 1fr; gap: 0.35rem 1rem; }
    dt { font-weight: 650; color: #203040; }
    dd { margin: 0; color: #34495c; overflow-wrap: anywhere; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.6rem; }
    th, td { border: 1px solid #d7e1ea; padding: 0.35rem 0.45rem; text-align: left; }
    th { background: #f3f7fa; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    @media print { body { padding: 0; } main { max-width: none; } }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(payload.title)}</h1>
    <p class="meta">Generated: ${escapeHtml(payload.generatedAt)}</p>
    <p class="meta">Author: ${escapeHtml(payload.author)}</p>
    ${payload.app.version ? `<p class="meta">Version: v${escapeHtml(payload.app.version)}</p>` : ''}
    <p class="meta">App URL: ${escapeHtml(payload.app.liveUrl)}</p>
    <p class="meta">Repository: ${escapeHtml(payload.app.repositoryUrl)}</p>
    ${
      payload.app.shareUrl
        ? `<p class="meta">Share URL: ${escapeHtml(payload.app.shareUrl)}</p>`
        : ''
    }
    ${sections}
  </main>
</body>
</html>
`
}

export function downloadReportMarkdown(payload: ReportPayload): void {
  downloadTextFile(
    serializeReportMarkdown(payload),
    createReportFilename('ideal-momentum-jet-report', 'md'),
    'text/markdown;charset=utf-8',
  )
}

export function downloadReportHtml(payload: ReportPayload): void {
  downloadTextFile(
    serializeReportHtml(payload),
    createReportFilename('ideal-momentum-jet-report', 'html'),
    'text/html;charset=utf-8',
  )
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function recordToBullets(value: unknown): string[] {
  return Object.entries(flattenForReport(value)).map(
    ([key, entryValue]) => `- ${key}: ${formatValue(entryValue)}`,
  )
}

function listRecords(values: unknown[]): string[] {
  return values.flatMap((value, index) => [
    `${index + 1}. ${formatValue((value as { label?: unknown }).label ?? 'Entry')}`,
    ...recordToBullets(value).map((line) => `   ${line}`),
  ])
}

function markdownTable(headers: string[], rows: unknown[]): string {
  const headerLine = `| ${headers.join(' | ')} |`
  const separator = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => {
    const record = row as Record<string, unknown>
    return `| ${headers.map((header) => formatValue(record[header])).join(' | ')} |`
  })

  return [headerLine, separator, ...body].join('\n')
}

function htmlSection(title: string, body: string): string {
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`
}

function htmlDefinitionList(value: unknown): string {
  const entries = Object.entries(flattenForReport(value))
  return `<dl>${entries
    .map(([key, entryValue]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(formatValue(entryValue))}</dd>`)
    .join('')}</dl>`
}

function htmlRecordList(values: unknown[]): string {
  return `<ol>${values
    .map((value) => `<li>${htmlDefinitionList(value)}</li>`)
    .join('')}</ol>`
}

function htmlTable(headers: string[], rows: unknown[]): string {
  return `<table><thead><tr>${headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join('')}</tr></thead><tbody>${rows
    .map((row) => {
      const record = row as Record<string, unknown>
      return `<tr>${headers
        .map((header) => `<td>${escapeHtml(formatValue(record[header]))}</td>`)
        .join('')}</tr>`
    })
    .join('')}</tbody></table>`
}

function flattenForReport(value: unknown, prefix = ''): Record<string, unknown> {
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
        return { ...accumulator, ...flattenForReport(entryValue, nextKey) }
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

function createReportFilename(base: string, extension: string): string {
  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z')
    .replace('T', '-')

  return `${base}_${timestamp}.${extension}`
}
