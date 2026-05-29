import { useState } from 'react'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { UiText } from '../i18n/translations'
import type { ComparisonCase } from '../model/comparisonCases'
import type { CfdExportPayload } from '../model/cfdExport'
import type { DimensionalMappingResult } from '../model/dimensionalMapping'
import type { JetParameters, JetSeries } from '../model/jetModel'
import type { ApplicabilityAssessment } from '../model/regimeChecker'
import {
  DEFAULT_REPORT_OPTIONS,
  buildReportPayload,
  type ReportOptions,
  type ReportPayload,
} from '../model/reportGenerator'
import type { TipPenetrationResult } from '../model/tipPenetration'
import {
  downloadReportHtml,
  downloadReportMarkdown,
  serializeReportHtml,
} from '../utils/reportSerializers'
import { ReportPreview } from './ReportPreview'

interface ReportPanelProps {
  params: JetParameters
  series: JetSeries
  dimensionalMapping?: DimensionalMappingResult | null
  regimeAssessment?: ApplicabilityAssessment | null
  tipPenetration?: TipPenetrationResult | null
  cfdExportPayload?: CfdExportPayload | null
  dataOverlays: DataOverlay[]
  comparisonCases: ComparisonCase[]
  shareUrl?: string
  text: UiText
}

export function ReportPanel({
  params,
  series,
  dimensionalMapping,
  regimeAssessment,
  tipPenetration,
  cfdExportPayload,
  dataOverlays,
  comparisonCases,
  shareUrl,
  text,
}: ReportPanelProps) {
  const [options, setOptions] = useState<ReportOptions>(DEFAULT_REPORT_OPTIONS)
  const [previewPayload, setPreviewPayload] = useState<ReportPayload | null>(null)
  const dimensionalAvailable = dimensionalMapping !== undefined && dimensionalMapping !== null
  const regimeAvailable = regimeAssessment !== undefined && regimeAssessment !== null
  const tipAvailable = tipPenetration?.success ?? false
  const cfdAvailable = cfdExportPayload !== undefined && cfdExportPayload !== null

  function updateOption<K extends keyof ReportOptions>(
    key: K,
    value: ReportOptions[K],
  ) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  function makePayload(): ReportPayload {
    const safeOptions = {
      ...options,
      includeDimensionalSummary: options.includeDimensionalSummary && dimensionalAvailable,
      includeRegimeAssessment: options.includeRegimeAssessment && regimeAvailable,
      includeTipPenetration: options.includeTipPenetration && tipAvailable,
      includeCfdExportSummary: options.includeCfdExportSummary && cfdAvailable,
    }

    return buildReportPayload({
      params,
      series,
      dimensionalMapping,
      regimeAssessment,
      tipPenetration,
      cfdExportPayload,
      dataOverlays,
      comparisonCases,
      shareUrl,
      options: safeOptions,
    })
  }

  function previewReport() {
    setPreviewPayload(makePayload())
  }

  function printReport() {
    const payload = makePayload()
    const html = serializeReportHtml(payload)
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      setPreviewPayload(payload)
      window.setTimeout(() => window.print(), 0)
      return
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.setTimeout(() => printWindow.print(), 250)
  }

  function downloadMarkdown() {
    downloadReportMarkdown(makePayload())
  }

  function downloadHtml() {
    downloadReportHtml(makePayload())
  }

  return (
    <section className="panel report-panel" aria-labelledby="report-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text.report.eyebrow}</p>
          <h2 id="report-title">{text.report.title}</h2>
        </div>
      </div>

      <div className="report-controls">
        <div className="report-grid">
          <label className="field">
            <span>{text.report.reportTitle}</span>
            <input
              type="text"
              value={options.reportTitle}
              onChange={(event) => updateOption('reportTitle', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{text.report.author}</span>
            <input
              type="text"
              value={options.authorName}
              onChange={(event) => updateOption('authorName', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{text.report.stateSampleStride}</span>
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={options.stateSampleStride}
              onChange={(event) =>
                updateOption('stateSampleStride', Number(event.target.value))
              }
            />
            <small>{text.report.stateSampleStrideHelp}</small>
          </label>
        </div>

        <div className="report-options">
          <OptionCheckbox
            label={text.report.includeDimensionalSummary}
            checked={options.includeDimensionalSummary && dimensionalAvailable}
            disabled={!dimensionalAvailable}
            onChange={(checked) => updateOption('includeDimensionalSummary', checked)}
          />
          <OptionCheckbox
            label={text.report.includeRegimeAssessment}
            checked={options.includeRegimeAssessment && regimeAvailable}
            disabled={!regimeAvailable}
            onChange={(checked) => updateOption('includeRegimeAssessment', checked)}
          />
          <OptionCheckbox
            label={text.report.includeSampledStateTable}
            checked={options.includeSampledStateTable}
            onChange={(checked) => updateOption('includeSampledStateTable', checked)}
          />
          <OptionCheckbox
            label={text.report.includeComparisonCases}
            checked={options.includeComparisonCases}
            onChange={(checked) => updateOption('includeComparisonCases', checked)}
          />
          <OptionCheckbox
            label={text.report.includeDataOverlays}
            checked={options.includeDataOverlays}
            onChange={(checked) => updateOption('includeDataOverlays', checked)}
          />
          <OptionCheckbox
            label={text.report.includeTipPenetration}
            checked={options.includeTipPenetration && tipAvailable}
            disabled={!tipAvailable}
            onChange={(checked) => updateOption('includeTipPenetration', checked)}
          />
          <OptionCheckbox
            label={text.report.includeCfdExportSummary}
            checked={options.includeCfdExportSummary && cfdAvailable}
            disabled={!cfdAvailable}
            onChange={(checked) => updateOption('includeCfdExportSummary', checked)}
          />
          <OptionCheckbox
            label={text.report.includeCitations}
            checked={options.includeCitations}
            onChange={(checked) => updateOption('includeCitations', checked)}
          />
          <OptionCheckbox
            label={text.report.includeDisclaimer}
            checked={options.includeDisclaimer}
            onChange={(checked) => updateOption('includeDisclaimer', checked)}
          />
        </div>

        <div className="export-actions">
          <button type="button" className="secondary-action" onClick={previewReport}>
            {text.report.preview}
          </button>
          <button type="button" className="secondary-action" onClick={printReport}>
            {text.report.print}
          </button>
          <button type="button" className="secondary-action" onClick={downloadMarkdown}>
            {text.report.downloadMarkdown}
          </button>
          <button type="button" className="secondary-action" onClick={downloadHtml}>
            {text.report.downloadHtml}
          </button>
        </div>

        <p className="helper-text">{text.report.privacyWarning}</p>
      </div>

      {previewPayload ? (
        <div className="report-preview-shell">
          <ReportPreview payload={previewPayload} />
        </div>
      ) : null}
    </section>
  )
}

interface OptionCheckboxProps {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}

function OptionCheckbox({ checked, disabled = false, label, onChange }: OptionCheckboxProps) {
  return (
    <label className="toggle-control report-option">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
