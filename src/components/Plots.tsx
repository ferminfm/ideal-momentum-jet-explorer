import { useMemo, useState, type ComponentType } from 'react'
import PlotModule from 'react-plotly.js'
import type { DataOverlay } from '../data/dataOverlayTypes'
import type { UiText } from '../i18n/translations'
import type { CalibrationResult } from '../model/calibration'
import type { ComparisonCase } from '../model/comparisonCases'
import {
  computeEntrainmentCoefficientLimits,
  type JetSeries,
  type JetState,
} from '../model/jetModel'
import { formatNumber } from '../utils/format'
import { toMathPlainText } from '../utils/mathPlainText'
import {
  buildCalibrationPreviewTrace,
  buildDataOverlayTraces,
  buildEntrainmentReferenceTraces,
  buildModelCurveTraces,
} from '../utils/plotTraces'
import { InlineMath } from './MathFormula'
import { MathText } from './MathText'

interface PlotsProps {
  series: JetSeries
  comparisonCases: ComparisonCase[]
  dataOverlays: DataOverlay[]
  calibrationPreview: CalibrationResult | null
  densityLogScale: boolean
  text: UiText
  onDensityLogScaleChange: (value: boolean) => void
}

type PlotId = keyof UiText['plots']['definitions']
type GrowthRateKey = keyof UiText['plots']['referenceValues']['rates']

interface PlotDefinition {
  id: PlotId
  logAllowed?: boolean
  getValue: (state: JetState) => number
}

const PLOT_DEFINITIONS: PlotDefinition[] = [
  {
    id: 'area',
    getValue: (state) => state.normalizedArea,
  },
  {
    id: 'velocity',
    getValue: (state) => state.velocityHat,
  },
  {
    id: 'density',
    logAllowed: true,
    getValue: (state) => state.densityHat,
  },
  {
    id: 'pressure',
    getValue: (state) => state.pressureHat,
  },
  {
    id: 'entrainment',
    getValue: (state) => state.gasEntrainmentHat,
  },
  {
    id: 'coefficient',
    getValue: (state) => state.entrainmentCoefficient,
  },
]

const Plot = (
  (PlotModule as unknown as { default?: ComponentType<Record<string, unknown>> }).default ??
  PlotModule
) as ComponentType<Record<string, unknown>>

export function Plots({
  series,
  comparisonCases,
  dataOverlays,
  calibrationPreview,
  densityLogScale,
  text,
  onDensityLogScaleChange,
}: PlotsProps) {
  const [activeId, setActiveId] = useState<PlotId>(PLOT_DEFINITIONS[0].id)
  const activePlot =
    PLOT_DEFINITIONS.find((definition) => definition.id === activeId) ??
    PLOT_DEFINITIONS[0]
  const activePlotCopy = text.plots.definitions[activePlot.id]
  const coefficientLimits = useMemo(
    () => computeEntrainmentCoefficientLimits(series.params),
    [series.params],
  )
  const showCoefficientReferences = activePlot.id === 'coefficient'
  const lambda1Rate =
    text.plots.referenceValues.rates[coefficientLimits.lambda1Label as GrowthRateKey]
  const lambda2Rate =
    text.plots.referenceValues.rates[coefficientLimits.lambda2Label as GrowthRateKey]

  const plotData = useMemo(() => {
    const traces = buildModelCurveTraces({
      series,
      comparisonCases,
      getValue: activePlot.getValue,
      hoverZeta: text.plots.hoverZeta,
      hoverValue: text.plots.hoverValue,
      currentLabel: text.comparison.currentLabel,
    })

    traces.push(...buildDataOverlayTraces(dataOverlays, activePlot.id))
    traces.push(
      ...buildCalibrationPreviewTrace(
        calibrationPreview,
        activePlot.id,
        text.calibration.previewLabel,
      ),
    )

    if (activePlot.id === 'coefficient') {
      traces.push(
        ...buildEntrainmentReferenceTraces(series, coefficientLimits, {
          nearField: text.plots.referenceValues.nearFieldLimit,
          farField: text.plots.referenceValues.farFieldLimit,
        }),
      )
    }

    return traces
  }, [
    activePlot,
    comparisonCases,
    coefficientLimits,
    calibrationPreview,
    dataOverlays,
    series,
    text.comparison.currentLabel,
    text.calibration.previewLabel,
    text.plots.hoverValue,
    text.plots.hoverZeta,
    text.plots.referenceValues.farFieldLimit,
    text.plots.referenceValues.nearFieldLimit,
  ])

  const yAxisType = activePlot.id === 'density' && densityLogScale ? 'log' : 'linear'

  return (
    <section className="panel plot-panel" aria-labelledby="plots-title">
      <div className="section-heading plot-heading">
        <div>
          <p className="eyebrow">{text.plots.eyebrow}</p>
          <h2 id="plots-title">
            <MathText text={text.plots.title} />
          </h2>
        </div>
        {activePlot.logAllowed ? (
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={densityLogScale}
              onChange={(event) => onDensityLogScaleChange(event.target.checked)}
            />
            {text.plots.logDensity}
          </label>
        ) : null}
      </div>

      <div className="plot-tabs" role="tablist" aria-label={text.plots.plotVariableAria}>
        {PLOT_DEFINITIONS.map((definition) => (
          <button
            key={definition.id}
            type="button"
            className={definition.id === activeId ? 'active' : ''}
            title={text.plots.definitions[definition.id].description}
            onClick={() => setActiveId(definition.id)}
          >
            <MathText text={text.plots.definitions[definition.id].label} />
          </button>
        ))}
      </div>

      <p className="active-variable-description">
        <InlineMath math={activePlotCopy.symbol} /> - {activePlotCopy.description}
      </p>

      <p className="helper-text">{text.plots.defaultOverlayNote}</p>

      {showCoefficientReferences ? (
        <div className="coefficient-reference-strip" aria-label={text.plots.referenceValues.title}>
          <p className="coefficient-reference-title">
            <MathText text={text.plots.referenceValues.directionalRates} />
          </p>
          <div>
            <span>
              <MathText text={text.plots.referenceValues.nearFieldLimit} />
            </span>
            <strong>{formatNumber(coefficientLimits.nearField, 5)}</strong>
          </div>
          <div>
            <span>
              <MathText text={text.plots.referenceValues.farFieldLimit} />
            </span>
            <strong>{formatNumber(coefficientLimits.farField, 5)}</strong>
          </div>
          <div title={lambda1Rate.tooltip}>
            <span>
              <MathText text={lambda1Rate.label} />
            </span>
            <strong>{formatNumber(coefficientLimits.lambda1, 5)}</strong>
          </div>
          <div title={lambda2Rate.tooltip}>
            <span>
              <MathText text={lambda2Rate.label} />
            </span>
            <strong>{formatNumber(coefficientLimits.lambda2, 5)}</strong>
          </div>
          <p>
            <MathText text={text.plots.referenceValues.help} />
          </p>
        </div>
      ) : null}

      <Plot
        data={plotData}
        layout={{
          autosize: true,
          margin: { l: 66, r: 24, t: 54, b: 58 },
          paper_bgcolor: 'rgba(255,255,255,0)',
          plot_bgcolor: '#fbfcfd',
          font: {
            color: '#1d2a35',
            family:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          },
          xaxis: {
            title: toMathPlainText(text.plots.xAxisTitle),
            zeroline: false,
            gridcolor: '#dfe7ee',
          },
          yaxis: {
            title: toMathPlainText(activePlotCopy.yTitle),
            type: yAxisType,
            zeroline: false,
            gridcolor: '#dfe7ee',
          },
          hovermode: 'closest',
          showlegend: true,
          legend: {
            orientation: 'h',
            x: 0,
            y: 1.08,
            xanchor: 'left',
            yanchor: 'bottom',
            bgcolor: 'rgba(255,255,255,0.8)',
            font: { size: 11 },
          },
        }}
        config={{
          responsive: true,
          displaylogo: false,
          toImageButtonOptions: {
            format: 'png',
            filename: `ideal-momentum-jet-${activePlot.id}`,
            height: 900,
            width: 1400,
            scale: 2,
          },
        }}
        style={{ width: '100%', height: '430px' }}
        useResizeHandler
      />
    </section>
  )
}
