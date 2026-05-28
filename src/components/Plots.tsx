import { useMemo, useState, type ComponentType } from 'react'
import PlotModule from 'react-plotly.js'
import type { JetSeries, JetState } from '../model/jetModel'

interface PlotsProps {
  series: JetSeries
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

export function Plots({ series }: PlotsProps) {
  const [activeId, setActiveId] = useState(PLOT_DEFINITIONS[0].id)
  const [densityLogScale, setDensityLogScale] = useState(false)
  const activePlot =
    PLOT_DEFINITIONS.find((definition) => definition.id === activeId) ??
    PLOT_DEFINITIONS[0]

  const plotData = useMemo(() => {
    const x = series.states.map((state) => state.axialZeta)
    const y = series.states.map(activePlot.getValue)

    return [
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
  }, [activePlot, series.states])

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
              onChange={(event) => setDensityLogScale(event.target.checked)}
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
