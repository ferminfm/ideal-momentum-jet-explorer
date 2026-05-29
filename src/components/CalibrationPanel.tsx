import { useMemo, useState } from 'react'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { UiText } from '../i18n/translations'
import {
  DEFAULT_CALIBRATION_BOUNDS,
  DEFAULT_CALIBRATION_OPTIONS,
  SUPPORTED_CALIBRATION_TARGETS,
  calibrateSpreadingAngles,
  isCalibrationTargetVariable,
  overlayToCalibrationPoints,
  type CalibrationBounds,
  type CalibrationParameterMode,
  type CalibrationResult,
  type CalibrationTargetVariable,
} from '../model/calibration'
import type { JetParameters } from '../model/jetModel'
import { formatNumber } from '../utils/format'
import { MathText } from './MathText'

interface CalibrationPanelProps {
  overlays: DataOverlay[]
  baseParams: JetParameters
  text: UiText
  onPreviewChange: (result: CalibrationResult | null) => void
  onApplyFittedParams: (result: CalibrationResult) => void
  onAddFittedComparison: (result: CalibrationResult, overlayLabel: string) => void
}

const PARAMETER_MODES: CalibrationParameterMode[] = [
  'symmetric-angle',
  'two-angles',
  'theta-only',
  'phi-only',
]

export function CalibrationPanel({
  overlays,
  baseParams,
  text,
  onPreviewChange,
  onApplyFittedParams,
  onAddFittedComparison,
}: CalibrationPanelProps) {
  const supportedOverlays = useMemo(
    () => overlays.filter((overlay) => isCalibrationTargetVariable(overlay.variable)),
    [overlays],
  )
  const [selectedOverlayId, setSelectedOverlayId] = useState(
    supportedOverlays[0]?.id ?? '',
  )
  const activeSelectedOverlayId = supportedOverlays.some(
    (overlay) => overlay.id === selectedOverlayId,
  )
    ? selectedOverlayId
    : supportedOverlays[0]?.id ?? ''
  const selectedOverlay =
    supportedOverlays.find((overlay) => overlay.id === activeSelectedOverlayId) ?? null
  const [targetVariable, setTargetVariable] = useState<CalibrationTargetVariable>(
    supportedOverlays[0]?.variable && isCalibrationTargetVariable(supportedOverlays[0].variable)
      ? supportedOverlays[0].variable
      : 'velocity',
  )
  const [parameterMode, setParameterMode] =
    useState<CalibrationParameterMode>('two-angles')
  const [bounds, setBounds] = useState<CalibrationBounds>(DEFAULT_CALIBRATION_BOUNDS)
  const [result, setResult] = useState<CalibrationResult | null>(null)

  function clearCalibrationResult() {
    setResult(null)
    onPreviewChange(null)
  }

  function handleOverlayChange(overlayId: string) {
    const nextOverlay = supportedOverlays.find((overlay) => overlay.id === overlayId)
    setSelectedOverlayId(overlayId)
    if (nextOverlay && isCalibrationTargetVariable(nextOverlay.variable)) {
      setTargetVariable(nextOverlay.variable)
    }
    clearCalibrationResult()
  }

  function handleTargetVariableChange(nextTarget: CalibrationTargetVariable) {
    setTargetVariable(nextTarget)
    clearCalibrationResult()
  }

  function handleParameterModeChange(nextMode: CalibrationParameterMode) {
    setParameterMode(nextMode)
    clearCalibrationResult()
  }

  function updateBound(key: keyof CalibrationBounds, value: number) {
    setBounds((current) => ({ ...current, [key]: value }))
    clearCalibrationResult()
  }

  function runFit() {
    if (!selectedOverlay) {
      setResult(null)
      onPreviewChange(null)
      return
    }

    const points = overlayToCalibrationPoints(selectedOverlay, baseParams.zetaMax)
    const nextResult = calibrateSpreadingAngles(baseParams, points, {
      ...DEFAULT_CALIBRATION_OPTIONS,
      targetVariable,
      parameterMode,
      bounds,
    })
    setResult(nextResult)
    onPreviewChange(nextResult.success ? nextResult : null)
  }

  const unsupportedOverlayCount = overlays.length - supportedOverlays.length
  const selectedPointCount = selectedOverlay
    ? overlayToCalibrationPoints(selectedOverlay, baseParams.zetaMax).length
    : 0

  return (
    <section className="panel calibration-panel" aria-labelledby="calibration-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">{text.calibration.eyebrow}</p>
          <h2 id="calibration-title">
            <MathText text={text.calibration.title} />
          </h2>
        </div>
      </div>

      <p className="helper-text">{text.calibration.helper}</p>

      {supportedOverlays.length === 0 ? (
        <p className="warning-text">{text.calibration.noSupportedOverlays}</p>
      ) : (
        <>
          <div className="calibration-grid">
            <label className="field">
              <span>{text.calibration.overlayToFit}</span>
              <select
                value={activeSelectedOverlayId}
                onChange={(event) => handleOverlayChange(event.target.value)}
              >
                {supportedOverlays.map((overlay) => (
                  <option key={overlay.id} value={overlay.id}>
                    {overlay.label} ({text.dataOverlays.variableOptions[overlay.variable]})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.calibration.targetVariable}</span>
              <select
                value={targetVariable}
                onChange={(event) =>
                  handleTargetVariableChange(event.target.value as CalibrationTargetVariable)
                }
              >
                {SUPPORTED_CALIBRATION_TARGETS.map((target) => (
                  <option key={target} value={target}>
                    {text.dataOverlays.variableOptions[target]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{text.calibration.parameterMode}</span>
              <select
                value={parameterMode}
                onChange={(event) =>
                  handleParameterModeChange(event.target.value as CalibrationParameterMode)
                }
              >
                {PARAMETER_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {text.calibration.parameterModes[mode]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="calibration-bounds">
            <span className="control-label">{text.calibration.bounds}</span>
            <label className="field">
              <span>{text.calibration.thetaMin}</span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={bounds.thetaMinDeg}
                onChange={(event) => updateBound('thetaMinDeg', Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>{text.calibration.thetaMax}</span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={bounds.thetaMaxDeg}
                onChange={(event) => updateBound('thetaMaxDeg', Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>{text.calibration.phiMin}</span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={bounds.phiMinDeg}
                onChange={(event) => updateBound('phiMinDeg', Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>{text.calibration.phiMax}</span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={bounds.phiMaxDeg}
                onChange={(event) => updateBound('phiMaxDeg', Number(event.target.value))}
              />
            </label>
          </div>

          <div className="calibration-actions">
            <button
              type="button"
              className="primary-action"
              onClick={runFit}
              disabled={selectedPointCount < 2}
            >
              {text.calibration.runFit}
            </button>
            <span className="helper-text">
              {selectedPointCount < 2
                ? text.calibration.notEnoughPoints
                : `${selectedPointCount} ${text.calibration.pointsUsed}`}
            </span>
          </div>
        </>
      )}

      {unsupportedOverlayCount > 0 ? (
        <p className="helper-text">{text.calibration.unsupportedOverlayVariable}</p>
      ) : null}

      {result ? (
        <div className={result.success ? 'calibration-result' : 'calibration-result warning'}>
          <div className="calibration-result-grid">
            <ResultItem
              label={text.calibration.fittedTheta}
              value={`${formatNumber(result.fittedThetaDeg, 4)} deg`}
            />
            <ResultItem
              label={text.calibration.fittedPhi}
              value={`${formatNumber(result.fittedPhiDeg, 4)} deg`}
            />
            <ResultItem label={text.calibration.rmse} value={formatMetric(result.rmse)} />
            <ResultItem label={text.calibration.mae} value={formatMetric(result.mae)} />
            <ResultItem label="SSE" value={formatMetric(result.sse)} />
            <ResultItem
              label={text.calibration.iterations}
              value={result.iterations.toString()}
            />
          </div>
          <p>{result.success ? text.calibration.fitComplete : result.message}</p>
          <p className="helper-text">{text.calibration.exploratoryWarning}</p>
          {result.success && selectedOverlay ? (
            <div className="calibration-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => onApplyFittedParams(result)}
              >
                {text.calibration.applyFittedParameters}
              </button>
              <button
                type="button"
                className="secondary-action"
                onClick={() => onAddFittedComparison(result, selectedOverlay.label)}
              >
                {text.calibration.addFittedCurve}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatMetric(value: number): string {
  return Number.isFinite(value) ? value.toPrecision(5) : 'n/a'
}
