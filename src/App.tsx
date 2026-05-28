import { useEffect, useMemo, useState } from 'react'
import { CitationPanel } from './components/CitationPanel'
import { ControlPanel } from './components/ControlPanel'
import { EquationPanel } from './components/EquationPanel'
import { ExportPanel } from './components/ExportPanel'
import { InterpretationPanel } from './components/InterpretationPanel'
import { JetGeometry3D } from './components/JetGeometry3D'
import { Layout } from './components/Layout'
import { Plots } from './components/Plots'
import { TRANSLATIONS, type Language, type UiText } from './i18n/translations'
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

function TerminalStateSummary({
  series,
  text,
}: {
  series: ReturnType<typeof generateJetSeries>
  text: UiText
}) {
  const terminal = series.states[series.states.length - 1]

  return (
    <section className="summary-bar" aria-label={text.summary.ariaLabel}>
      <div>
        <span>{text.summary.areaAtZetaMax}</span>
        <strong>{formatNumber(terminal.normalizedArea, 3)}</strong>
      </div>
      <div>
        <span>{text.summary.velocity}</span>
        <strong>{formatNumber(terminal.velocityHat, 4)}</strong>
      </div>
      <div>
        <span>{text.summary.density}</span>
        <strong>{formatNumber(terminal.densityHat, 4)}</strong>
      </div>
      <div>
        <span>{text.summary.gasEntrainment}</span>
        <strong>{formatNumber(terminal.gasEntrainmentHat, 4)}</strong>
      </div>
      <div>
        <span>{text.summary.coefficient}</span>
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
  const text = TRANSLATIONS[appState.language]
  const series = useMemo(() => generateJetSeries(params), [params])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const query = encodeStateToQuery(appState).toString()
    const nextUrl = `${window.location.pathname}?${query}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [appState])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.lang = appState.language
    document.title = text.layout.title
  }, [appState.language, text.layout.title])

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
    setShareStatus(text.export.copied)
    window.setTimeout(() => setShareStatus(''), 1800)
  }

  function updateLanguage(language: Language) {
    setAppState((current) => ({ ...current, language }))
  }

  return (
    <Layout
      language={appState.language}
      text={text}
      onLanguageChange={updateLanguage}
    >
      <div className="app-grid">
        <aside className="left-rail">
          <ControlPanel
            params={params}
            selectedPresetId={appState.selectedPresetId}
            text={text}
            onChange={updateParams}
          />
          <ExportPanel
            shareStatus={shareStatus}
            text={text}
            onCopyShareUrl={() => void copyShareableUrl()}
            onDownloadCsv={() => downloadJetCsv(series)}
          />
          <EquationPanel text={text} />
        </aside>
        <section className="main-rail">
          <TerminalStateSummary series={series} text={text} />
          <Plots
            series={series}
            densityLogScale={appState.densityLogScale}
            overlayId={appState.overlayId}
            text={text}
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
            text={text}
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
          <InterpretationPanel text={text} />
          <CitationPanel text={text} />
        </section>
      </div>
    </Layout>
  )
}

export default App
