import { useEffect, useMemo, useState } from 'react'
import { CitationPanel } from './components/CitationPanel'
import { ControlPanel } from './components/ControlPanel'
import { EquationPanel } from './components/EquationPanel'
import { ExportPanel } from './components/ExportPanel'
import { InterpretationPanel } from './components/InterpretationPanel'
import { JetGeometry3D } from './components/JetGeometry3D'
import { Layout } from './components/Layout'
import { Plots } from './components/Plots'
import { generateJetSeries, type JetParameters } from './model/jetModel'
import { cloneParams } from './model/presets'
import { PRESET_CUSTOM, type ExplorerState } from './types/appState'
import { copyTextToClipboard } from './utils/clipboard'
import { downloadJetCsv } from './utils/csvExport'
import { formatNumber } from './utils/format'
import {
  decodeStateFromQuery,
  encodeStateToQuery,
  mergeStateWithDefaults,
  sanitizeDecodedState,
} from './utils/urlState'
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
  const [appState, setAppState] = useState<ExplorerState>(() => {
    if (typeof window === 'undefined') {
      return mergeStateWithDefaults({})
    }

    return mergeStateWithDefaults(
      sanitizeDecodedState(decodeStateFromQuery(window.location.search)),
    )
  })
  const [shareStatus, setShareStatus] = useState('')
  const { params } = appState
  const series = useMemo(() => generateJetSeries(params), [params])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const query = encodeStateToQuery(appState).toString()
    const nextUrl = `${window.location.pathname}?${query}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [appState])

  function updateParams(nextParams: JetParameters, presetId = PRESET_CUSTOM) {
    setAppState((current) => ({
      ...current,
      params: cloneParams(nextParams),
      selectedPresetId: presetId,
      crossSectionZeta: Math.min(current.crossSectionZeta, nextParams.zetaMax),
    }))
  }

  async function copyShareableUrl() {
    await copyTextToClipboard(window.location.href)
    setShareStatus('Shareable URL copied.')
    window.setTimeout(() => setShareStatus(''), 1800)
  }

  return (
    <Layout>
      <div className="app-grid">
        <aside className="left-rail">
          <ControlPanel
            params={params}
            selectedPresetId={appState.selectedPresetId}
            onChange={updateParams}
          />
          <ExportPanel
            shareStatus={shareStatus}
            onCopyShareUrl={() => void copyShareableUrl()}
            onDownloadCsv={() => downloadJetCsv(series)}
          />
          <EquationPanel />
        </aside>
        <section className="main-rail">
          <TerminalStateSummary series={series} />
          <Plots
            series={series}
            densityLogScale={appState.densityLogScale}
            overlayId={appState.overlayId}
            onDensityLogScaleChange={(densityLogScale) =>
              setAppState((current) => ({ ...current, densityLogScale }))
            }
            onOverlayChange={(overlayId) =>
              setAppState((current) => ({ ...current, overlayId }))
            }
          />
          <JetGeometry3D
            series={series}
            crossSectionZeta={appState.crossSectionZeta}
            showSelectedCrossSection={appState.showSelectedCrossSection}
            showAxisSwitchingSection={appState.showAxisSwitchingSection}
            onCrossSectionZetaChange={(crossSectionZeta) =>
              setAppState((current) => ({
                ...current,
                crossSectionZeta: Math.min(Math.max(crossSectionZeta, 0), params.zetaMax),
              }))
            }
            onShowSelectedCrossSectionChange={(showSelectedCrossSection) =>
              setAppState((current) => ({ ...current, showSelectedCrossSection }))
            }
            onShowAxisSwitchingSectionChange={(showAxisSwitchingSection) =>
              setAppState((current) => ({ ...current, showAxisSwitchingSection }))
            }
          />
          <InterpretationPanel />
          <CitationPanel />
        </section>
      </div>
    </Layout>
  )
}

export default App
