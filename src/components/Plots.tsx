import { useMemo, useState, type ComponentType } from 'react'
import PlotModule from 'react-plotly.js'
import {
  VELOCITY_OVERLAYS,
  VELOCITY_OVERLAY_NONE,
  getVelocityOverlay,
} from '../data/velocityOverlays'
import type { JetSeries, JetState } from '../model/jetModel'

interface PlotsProps {
  series: JetSeries
  densityLogScale: boolean
  overlayId: string
  onDensityLogScaleChange: (value: boolean) => void
  onOverlayChange: (overlayId: string) => void
}

interface PlotDefinition {
  id: string
  label: string
  yTitle: string
  color: string
  logAllowed?: boolean
  getValue: (state: JetState) => number
}

const PLOT_DEFINITIONS: PlotDefinition[] = [
  {
    id: 'area',
    label: 'Ahat',
    yTitle: 'Normalized area, Ahat',
    color: '#236b8e',
    getValue: (state) => state.normalizedArea,
  },
  {
    id: 'velocity',
    label: 'vhat',
    yTitle: 'Bulk velocity, vhat',
    color: '#3b6f48',
    getValue: (state) => state.velocityHat,
  },
  {
    id: 'density',
    label: 'rhohat',
    yTitle: 'Composite density, rhohat',
    color: '#6f5fa8',
    logAllowed: true,
    getValue: (state) => state.densityHat,
  },
  {
    id: 'pressure',
    label: 'phat',
    yTitle: 'Dynamic pressure, phat',
    color: '#5d7182',
    getValue: (state) => state.pressureHat,
  },
  {
    id: 'entrainment',
    label: 'mhat_g',
    yTitle: 'Gas entrainment rate, mhat_g',
    color: '#b35a2a',
    getValue: (state) => state.gasEntrainmentHat,
  },
  {
    id: 'coefficient',
    label: 'K_A',
    yTitle: 'Generalized entrainment coefficient, K_A',
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
  onDensityLogScaleChange,
  onOverlayChange,
}: PlotsProps) {
  const [activeId, setActiveId] = useState(PLOT_DEFINITIONS[0].id)
  const activePlot =
    PLOT_DEFINITIONS.find((definition) => definition.id === activeId) ??
    PLOT_DEFINITIONS[0]
  const selectedOverlay = getVelocityOverlay(overlayId)

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
        hovertemplate: 'zeta=%{x:.3f}<br>value=%{y:.5g}<extra></extra>',
      },
    ]

    if (activePlot.id === 'velocity' && selectedOverlay) {
      traces.push({
        x: selectedOverlay.points.map((point) => point.zeta),
        y: selectedOverlay.points.map((point) => point.vhat),
        type: 'scatter',
        mode: 'markers',
        name: selectedOverlay.label,
        marker: {
          color: selectedOverlay.publicData ? '#94424e' : '#b35a2a',
          size: 9,
          symbol: selectedOverlay.publicData ? 'circle' : 'diamond-open',
          line: { width: 1.5 },
        },
        hovertemplate:
          'zeta=%{x:.3f}<br>vhat=%{y:.5g}<br>' +
          `${selectedOverlay.label}<br>${selectedOverlay.source}<extra></extra>`,
      })
    }

    return traces
  }, [activePlot, selectedOverlay, series.states])

  const yAxisType = activePlot.id === 'density' && densityLogScale ? 'log' : 'linear'

  return (
    <section className="panel plot-panel" aria-labelledby="plots-title">
      <div className="section-heading plot-heading">
        <div>
          <p className="eyebrow">Interactive plots</p>
          <h2 id="plots-title">State variables along zeta</h2>
        </div>
        {activePlot.logAllowed ? (
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={densityLogScale}
              onChange={(event) => onDensityLogScaleChange(event.target.checked)}
            />
            Log density
          </label>
        ) : null}
      </div>

      <div className="plot-tabs" role="tablist" aria-label="Plot variable">
        {PLOT_DEFINITIONS.map((definition) => (
          <button
            key={definition.id}
            type="button"
            className={definition.id === activeId ? 'active' : ''}
            onClick={() => setActiveId(definition.id)}
          >
            {definition.label}
          </button>
        ))}
      </div>

      <div className="overlay-controls">
        <label className="field">
          <span>Velocity overlay</span>
          <select
            value={overlayId}
            onChange={(event) => onOverlayChange(event.target.value)}
          >
            <option value={VELOCITY_OVERLAY_NONE}>None</option>
            {VELOCITY_OVERLAYS.map((overlay) => (
              <option key={overlay.id} value={overlay.id}>
                {overlay.label}
              </option>
            ))}
          </select>
        </label>
        <p className="helper-text">
          {selectedOverlay
            ? selectedOverlay.notes
            : 'No public measured velocity dataset is bundled yet. Overlays are optional comparison aids and may test only reduced model branches.'}
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
            title: 'Normalized distance, zeta = z / De',
            zeroline: false,
            gridcolor: '#dfe7ee',
          },
          yaxis: {
            title: activePlot.yTitle,
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
