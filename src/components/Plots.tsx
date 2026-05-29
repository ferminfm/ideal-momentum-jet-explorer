import { useMemo, useState, type ComponentType } from 'react'
import PlotModule from 'react-plotly.js'
import {
  VELOCITY_OVERLAYS,
  VELOCITY_OVERLAY_NONE,
  getVelocityOverlay,
} from '../data/velocityOverlays'
import type { UiText } from '../i18n/translations'
import type { ComparisonCase } from '../model/comparisonCases'
import {
  computeEntrainmentCoefficientLimits,
  type JetSeries,
  type JetState,
} from '../model/jetModel'
import { formatNumber } from '../utils/format'
import { toMathPlainText } from '../utils/mathPlainText'
import {
  buildEntrainmentReferenceTraces,
  buildModelCurveTraces,
} from '../utils/plotTraces'
import { InlineMath } from './MathFormula'
import { MathText } from './MathText'

interface PlotsProps {
  series: JetSeries
  comparisonCases: ComparisonCase[]
  densityLogScale: boolean
  overlayId: string
  text: UiText
  onDensityLogScaleChange: (value: boolean) => void
  onOverlayChange: (overlayId: string) => void
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
  densityLogScale,
  overlayId,
  text,
  onDensityLogScaleChange,
  onOverlayChange,
}: PlotsProps) {
  const [activeId, setActiveId] = useState<PlotId>(PLOT_DEFINITIONS[0].id)
  const activePlot =
    PLOT_DEFINITIONS.find((definition) => definition.id === activeId) ??
    PLOT_DEFINITIONS[0]
  const activePlotCopy = text.plots.definitions[activePlot.id]
  const selectedOverlay = getVelocityOverlay(overlayId)
  const selectedOverlayCopy = selectedOverlay
    ? text.plots.overlays[selectedOverlay.id as keyof typeof text.plots.overlays]
    : undefined
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

    if (activePlot.id === 'velocity' && selectedOverlay) {
      const overlayLabel = selectedOverlayCopy?.label ?? selectedOverlay.label
      const overlaySource = selectedOverlayCopy?.source ?? selectedOverlay.source

      traces.push({
        x: selectedOverlay.points.map((point) => point.zeta),
        y: selectedOverlay.points.map((point) => point.vhat),
        type: 'scatter',
        mode: 'markers',
        name: overlayLabel,
        marker: {
          color: selectedOverlay.publicData ? '#94424e' : '#b35a2a',
          size: 9,
          symbol: selectedOverlay.publicData ? 'circle' : 'diamond-open',
          line: { width: 1.5 },
        },
        hovertemplate:
          `${toMathPlainText(text.plots.hoverZeta)}=%{x:.3f}<br>${toMathPlainText('vhat')}=%{y:.5g}<br>` +
          `${overlayLabel}<br>${overlaySource}<extra></extra>`,
      })
    }

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
    selectedOverlay,
    selectedOverlayCopy,
    series,
    text.comparison.currentLabel,
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

      <div className="overlay-controls">
        <label className="field">
          <span>{text.plots.velocityOverlay}</span>
          <select
            value={overlayId}
            onChange={(event) => onOverlayChange(event.target.value)}
          >
            <option value={VELOCITY_OVERLAY_NONE}>{text.plots.none}</option>
            {VELOCITY_OVERLAYS.map((overlay) => (
              <option key={overlay.id} value={overlay.id}>
                {text.plots.overlays[overlay.id as keyof typeof text.plots.overlays]
                  ?.label ?? overlay.label}
              </option>
            ))}
          </select>
        </label>
        <p className="helper-text">
          {selectedOverlay
            ? selectedOverlayCopy?.notes ?? selectedOverlay.notes
            : text.plots.defaultOverlayNote}
        </p>
      </div>

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
