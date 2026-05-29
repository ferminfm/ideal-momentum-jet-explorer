import type {
  DataOverlay,
  OverlaySourceKind,
  OverlayVariable,
} from '../data/dataOverlayTypes'

export const MAX_OVERLAY_CSV_BYTES = 2 * 1024 * 1024
export const MAX_OVERLAY_CSV_ROWS = 5000

export interface ParsedCsvTable {
  columns: string[]
  rows: Record<string, string>[]
}

export interface BuildOverlayFromCsvSelectionArgs {
  table: ParsedCsvTable
  xColumn: string
  yColumn: string
  xErrorColumn?: string
  yErrorColumn?: string
  variable: OverlayVariable
  label: string
  source: string
  notes?: string
  color?: string
  sourceKind?: OverlaySourceKind
}

export function parseCsvText(text: string): ParsedCsvTable {
  if (text.length > MAX_OVERLAY_CSV_BYTES) {
    throw new Error('CSV file is too large for browser-side overlay import.')
  }

  const rawRows = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (rawRows.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.')
  }

  const columns = parseCsvLine(rawRows[0]).map((column) => sanitizeText(column, 80))
  if (columns.length < 2 || new Set(columns).size !== columns.length) {
    throw new Error('CSV header must contain at least two unique columns.')
  }

  const rows = rawRows.slice(1, MAX_OVERLAY_CSV_ROWS + 1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(
      columns.map((column, index) => [column, sanitizeText(values[index] ?? '', 200)]),
    )
  })

  if (rawRows.length - 1 > MAX_OVERLAY_CSV_ROWS) {
    throw new Error('CSV contains too many rows for overlay import.')
  }

  return { columns, rows }
}

export function getNumericColumns(table: ParsedCsvTable): string[] {
  return table.columns.filter((column) =>
    table.rows.some((row) => parseNumericCell(row[column]) !== null),
  )
}

export function buildOverlayFromCsvSelection({
  table,
  xColumn,
  yColumn,
  xErrorColumn,
  yErrorColumn,
  variable,
  label,
  source,
  notes,
  color = '#6f5bb7',
  sourceKind = 'user-import',
}: BuildOverlayFromCsvSelectionArgs): DataOverlay {
  assertColumn(table, xColumn)
  assertColumn(table, yColumn)

  if (xErrorColumn) {
    assertColumn(table, xErrorColumn)
  }

  if (yErrorColumn) {
    assertColumn(table, yErrorColumn)
  }

  const numericColumns = getNumericColumns(table)
  if (numericColumns.length < 2) {
    throw new Error('CSV must contain at least two numeric columns.')
  }

  const points = table.rows.flatMap((row) => {
    const x = parseNumericCell(row[xColumn])
    const y = parseNumericCell(row[yColumn])
    if (x === null || y === null) {
      return []
    }

    const xError = xErrorColumn ? parseNumericCell(row[xErrorColumn]) : null
    const yError = yErrorColumn ? parseNumericCell(row[yErrorColumn]) : null

    return [
      {
        x,
        y,
        ...(xError === null ? {} : { xError }),
        ...(yError === null ? {} : { yError }),
      },
    ]
  })

  if (points.length === 0) {
    throw new Error('Selected x and y columns do not contain numeric overlay points.')
  }

  return {
    id: `imported-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    label: sanitizeText(label, 80) || 'Imported data overlay',
    variable,
    sourceKind,
    source: sanitizeText(source, 160) || 'User-imported CSV',
    xLabel: xColumn,
    yLabel: yColumn,
    points,
    notes: sanitizeText(notes ?? '', 240) || 'User-imported data; local to this browser session.',
    publicData: false,
    visible: true,
    color,
    createdAt: new Date().toISOString(),
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && quoted && nextCharacter === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  values.push(current.trim())
  return values
}

function assertColumn(table: ParsedCsvTable, column: string): void {
  if (!table.columns.includes(column)) {
    throw new Error(`CSV column "${column}" was not found.`)
  }
}

function parseNumericCell(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') {
    return null
  }

  const normalized = value.trim()
  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

function sanitizeText(value: string, maxLength: number): string {
  const withoutControlCharacters = Array.from(value)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0
      return code < 32 || code === 127 ? ' ' : character
    })
    .join('')

  return withoutControlCharacters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}
