import { useState } from 'react'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { UiText } from '../i18n/translations'
import {
  DEFAULT_CFD_EXPORT_OPTIONS,
  buildCfdExportPayload,
  type CfdExportPayload,
  type CfdExportFormat,
  type CfdExportOptions,
} from '../model/cfdExport'
import type { ComparisonCase } from '../model/comparisonCases'
import type { DimensionalMappingResult } from '../model/dimensionalMapping'
import type { JetParameters, JetSeries } from '../model/jetModel'
import type { ApplicabilityAssessment } from '../model/regimeChecker'
import type { TipPenetrationResult } from '../model/tipPenetration'
import {
  downloadTextFile,
  serializeCfdExportJson,
  serializeCfdExportMarkdown,
  serializeCfdExportYaml,
  serializeOpenFoamNotes,
} from '../utils/cfdExportSerializers'

interface CfdExportPanelProps {
  params: JetParameters
  series: JetSeries
  dimensionalMapping?: DimensionalMappingResult | null
  regimeAssessment?: ApplicabilityAssessment | null
  tipPenetration?: TipPenetrationResult | null
  dataOverlays: DataOverlay[]
  comparisonCases: ComparisonCase[]
  shareUrl?: string
  text: UiText
}

const FORMATS: CfdExportFormat[] = ['json', 'yaml', 'markdown', 'openfoam-notes']

export function CfdExportPanel({
  params,
  series,
  dimensionalMapping,
  regimeAssessment,
  tipPenetration,
  dataOverlays,
  comparisonCases,
  shareUrl,
  text,
}: CfdExportPanelProps) {
  const [format, setFormat] = useState<CfdExportFormat>('json')
  const [options, setOptions] = useState<CfdExportOptions>(DEFAULT_CFD_EXPORT_OPTIONS)
  const dimensionalAvailable = dimensionalMapping !== undefined && dimensionalMapping !== null
  const regimeAvailable = regimeAssessment !== undefined && regimeAssessment !== null
  const tipAvailable = tipPenetration?.success ?? false

  function updateOption<K extends keyof CfdExportOptions>(
    key: K,
    value: CfdExportOptions[K],
  ) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  function downloadConfiguration() {
    const safeOptions = {
      ...options,
      includeDimensionalStates: options.includeDimensionalStates && dimensionalAvailable,
      includeRegimeAssessment: options.includeRegimeAssessment && regimeAvailable,
      includeTipPenetration: options.includeTipPenetration && tipAvailable,
    }
    const payload = buildCfdExportPayload({
      params,
      series,
      dimensionalMapping,
      regimeAssessment,
      tipPenetration,
      dataOverlays,
      comparisonCases,
      shareUrl,
      options: safeOptions,
    })
    const { content, extension, mimeType } = serializeForFormat(format, payload)

    downloadTextFile(content, createConfigFilename(format, extension), mimeType)
  }

  return (
    <section className="panel cfd-export-panel" aria-labelledby="cfd-export-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text.cfdExport.eyebrow}</p>
          <h2 id="cfd-export-title">{text.cfdExport.title}</h2>
        </div>
      </div>

      <div className="cfd-export-grid">
        <label className="field">
          <span>{text.cfdExport.format}</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as CfdExportFormat)}
          >
            {FORMATS.map((formatId) => (
              <option key={formatId} value={formatId}>
                {text.cfdExport.formatOptions[formatId]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{text.cfdExport.stateSampleStride}</span>
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
        </label>
      </div>

      <div className="cfd-export-options">
        <OptionCheckbox
          label={text.cfdExport.includeSampledStates}
          checked={options.includeSampledStates}
          onChange={(checked) => updateOption('includeSampledStates', checked)}
        />
        <OptionCheckbox
          label={text.cfdExport.includeDimensionalStates}
          checked={options.includeDimensionalStates && dimensionalAvailable}
          disabled={!dimensionalAvailable}
          onChange={(checked) => updateOption('includeDimensionalStates', checked)}
        />
        <OptionCheckbox
          label={text.cfdExport.includeRegimeAssessment}
          checked={options.includeRegimeAssessment && regimeAvailable}
          disabled={!regimeAvailable}
          onChange={(checked) => updateOption('includeRegimeAssessment', checked)}
        />
        <OptionCheckbox
          label={text.cfdExport.includeTipPenetration}
          checked={options.includeTipPenetration && tipAvailable}
          disabled={!tipAvailable}
          onChange={(checked) => updateOption('includeTipPenetration', checked)}
        />
        <OptionCheckbox
          label={text.cfdExport.includeDataOverlays}
          checked={options.includeDataOverlays}
          onChange={(checked) => updateOption('includeDataOverlays', checked)}
        />
        <OptionCheckbox
          label={text.cfdExport.includeComparisonCases}
          checked={options.includeComparisonCases}
          onChange={(checked) => updateOption('includeComparisonCases', checked)}
        />
      </div>

      <div className="export-actions">
        <button type="button" className="primary-action" onClick={downloadConfiguration}>
          {text.cfdExport.download}
        </button>
      </div>

      <p className="warning-text subdued-warning">{text.cfdExport.warning}</p>
      {options.includeDataOverlays ? (
        <p className="helper-text">{text.cfdExport.dataOverlayPrivacyWarning}</p>
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
    <label className="toggle-control cfd-export-option">
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

function serializeForFormat(
  format: CfdExportFormat,
  payload: CfdExportPayload,
) {
  if (format === 'markdown') {
    return {
      content: serializeCfdExportMarkdown(payload),
      extension: 'md',
      mimeType: 'text/markdown;charset=utf-8',
    }
  }

  if (format === 'openfoam-notes') {
    return {
      content: serializeOpenFoamNotes(payload),
      extension: 'txt',
      mimeType: 'text/plain;charset=utf-8',
    }
  }

  if (format === 'yaml') {
    return {
      content: serializeCfdExportYaml(payload),
      extension: 'yaml',
      mimeType: 'text/yaml;charset=utf-8',
    }
  }

  return {
    content: serializeCfdExportJson(payload),
    extension: 'json',
    mimeType: 'application/json;charset=utf-8',
  }
}

function createConfigFilename(format: CfdExportFormat, extension: string): string {
  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z')
    .replace('T', '-')
  const stem =
    format === 'openfoam-notes'
      ? 'ideal-momentum-jet-openfoam-notes'
      : format === 'markdown'
        ? 'ideal-momentum-jet-summary'
        : 'ideal-momentum-jet-config'

  return `${stem}_${timestamp}.${extension}`
}
