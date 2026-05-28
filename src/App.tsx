import { useMemo, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { EquationPanel } from './components/EquationPanel'
import { InterpretationPanel } from './components/InterpretationPanel'
import { JetGeometry3D } from './components/JetGeometry3D'
import { Layout } from './components/Layout'
import { Plots } from './components/Plots'
import { generateJetSeries, type JetParameters } from './model/jetModel'
import { DEFAULT_PARAMS, cloneParams } from './model/presets'
import { formatNumber } from './utils/format'
import './styles.css'

function TerminalStateSummary({ series }: { series: ReturnType<typeof generateJetSeries> }) {
  const terminal = series.states[series.states.length - 1]

  return (
    <section className="summary-bar" aria-label="Terminal state summary">
      <div>
        <span>Ahat at zeta max</span>
        <strong>{formatNumber(terminal.normalizedArea, 3)}</strong>
      </div>
      <div>
        <span>vhat</span>
        <strong>{formatNumber(terminal.velocityHat, 4)}</strong>
      </div>
      <div>
        <span>rhohat</span>
        <strong>{formatNumber(terminal.densityHat, 4)}</strong>
      </div>
      <div>
        <span>mhat_g</span>
        <strong>{formatNumber(terminal.gasEntrainmentHat, 4)}</strong>
      </div>
      <div>
        <span>K_A</span>
        <strong>{formatNumber(terminal.entrainmentCoefficient, 4)}</strong>
      </div>
    </section>
  )
}

function App() {
  const [params, setParams] = useState<JetParameters>(() => cloneParams(DEFAULT_PARAMS))
  const series = useMemo(() => generateJetSeries(params), [params])

  return (
    <Layout>
      <div className="app-grid">
        <aside className="left-rail">
          <ControlPanel params={params} onChange={setParams} />
          <EquationPanel />
        </aside>
        <section className="main-rail">
          <TerminalStateSummary series={series} />
          <Plots series={series} />
          <JetGeometry3D series={series} />
          <InterpretationPanel />
        </section>
      </div>
    </Layout>
  )
}

export default App
