import { useMemo, useState, type ComponentType } from 'react'
import PlotModule from 'react-plotly.js'
import {
  VELOCITY_OVERLAYS,
  VELOCITY_OVERLAY_NONE,
  getVelocityOverlay,
} from '../data/velocityOverlays'
import type { UiText } from '../i18n/translations'
import type { JetSeries, JetState } from '../model/jetModel'
import { toMathPlainText } from '../utils/mathPlainText'
import { MathText } from './MathText'

interface PlotsProps {
  series: JetSeries
  densityLogScale: boolean
  overlayId: string
  text: UiText
  onDensityLogScaleChange: (value: boolean) => void
  onOverlayChange: (overlayId: string) => void
}

type PlotId = keyof UiText['plots']['definitions']

interface PlotDefinition {
  id: PlotId
  color: string
  logAllowed?: boolean
  getValue: (state: JetState) => number
}

const PLOT_DEFINITIONS: PlotDefinition[] = [
  {
    id: 'area',
    color: '#236b8e',
    getValue: (state) => state.normalizedArea,
  },
  {
    id: 'velocity',
    color: '#3b6f48',
    getValue: (state) => state.velocityHat,
  },
  {
    id: 'density',
    color: '#6f5fa8',
    logAllowed: true,
    getValue: (state) => state.densityHat,
  },
  {
    id: 'pressure',
    color: '#5d7182',
    getValue: (state) => state.pressureHat,
  },
  {
    id: 'entrainment',
    color: '#b35a2a',
    getValue: (state) => state.gasEntrainmentHat,
  },
  {
    id: 'coefficient',
    color: '#94424e',
    getValue: (state) => state.entrainmentCoefficient,
  },
]

const Plot = (
  (PlotModule as unknown as { default?: ComponentType<Record<string, unknown>> }).default ??
  PlotModule
) as ComponentType<Record<string, unknown>>

export function Plots({
  series,
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

  const plotData = useMemo(() => {
    const x = series.states.map((state) => state.axialZeta)
    const y = series.states.map(activePlot.getValue)

    const traces: Array<Record<string, unknown>> = [
      {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: activePlot.color,
          width: 3,
        },
        hovertemplate: `${toMathPlainText(text.plots.hoverZeta)}=%{x:.3f}<br>${text.plots.hoverValue}=%{y:.5g}<extra></extra>`,
      },
    ]

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

    return traces
  }, [
    activePlot,
    selectedOverlay,
    selectedOverlayCopy,
    series.states,
    text.plots.hoverValue,
    text.plots.hoverZeta,
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
            onClick={() => setActiveId(definition.id)}
          >
            <MathText text={text.plots.definitions[definition.id].label} />
          </button>
        ))}
      </div>

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

      <Plot
        data={plotData}
        layout={{
          autosize: true,
          margin: { l: 66, r: 24, t: 24, b: 58 },
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
