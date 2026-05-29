import { useEffect, useMemo, useState } from 'react'
import { CitationPanel } from './components/CitationPanel'
import { CollapsibleSection } from './components/CollapsibleSection'
import { ComparisonAddPanel, ComparisonPanel } from './components/ComparisonPanel'
import { ControlPanel } from './components/ControlPanel'
import { EquationPanel } from './components/EquationPanel'
import { ExportPanel } from './components/ExportPanel'
import { InterpretationPanel } from './components/InterpretationPanel'
import { JetGeometry3D } from './components/JetGeometry3D'
import { Layout } from './components/Layout'
import { MathText } from './components/MathText'
import { Plots } from './components/Plots'
import { SymbolsGlossary } from './components/SymbolsGlossary'
import { TRANSLATIONS, type Language, type UiText } from './i18n/translations'
import {
  MAX_COMPARISON_CASES,
  clearComparisonCases,
  createComparisonCase,
  removeComparisonCase,
  setAllComparisonCasesVisibility,
  setComparisonCaseVisibility,
} from './model/comparisonCases'
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
        <span>
          <MathText text={text.summary.areaAtZetaMax} />
        </span>
        <strong>{formatNumber(terminal.normalizedArea, 3)}</strong>
      </div>
      <div>
        <span>
          <MathText text={text.summary.velocity} />
        </span>
        <strong>{formatNumber(terminal.velocityHat, 4)}</strong>
      </div>
      <div>
        <span>
          <MathText text={text.summary.density} />
        </span>
        <strong>{formatNumber(terminal.densityHat, 4)}</strong>
      </div>
      <div>
        <span>
          <MathText text={text.summary.gasEntrainment} />
        </span>
        <strong>{formatNumber(terminal.gasEntrainmentHat, 4)}</strong>
      </div>
      <div>
        <span>
          <MathText text={text.summary.coefficient} />
        </span>
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
  const [comparisonNotice, setComparisonNotice] = useState('')
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

  function showComparisonNotice(message: string) {
    setComparisonNotice(message)
    window.setTimeout(() => setComparisonNotice(''), 2000)
  }

  function addCurrentComparisonCase() {
    setAppState((current) => {
      if (current.comparisonCases.length >= MAX_COMPARISON_CASES) {
        return current
      }

      return {
        ...current,
        comparisonCases: [
          ...current.comparisonCases,
          createComparisonCase(current.params, {
            presetId: current.selectedPresetId,
            index: current.comparisonCases.length,
          }),
        ],
      }
    })

    if (appState.comparisonCases.length >= MAX_COMPARISON_CASES) {
      showComparisonNotice(text.comparison.maxWarning)
    } else {
      showComparisonNotice(text.comparison.added)
    }
  }

  return (
    <Layout
      language={appState.language}
      text={text}
      onLanguageChange={updateLanguage}
    >
      <div className="app-grid">
        <aside className="left-rail">
          <CollapsibleSection
            title={text.sections.modelParameters}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <ControlPanel
              params={params}
              selectedPresetId={appState.selectedPresetId}
              text={text}
              onChange={updateParams}
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.savedCases}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <ComparisonAddPanel
              caseCount={appState.comparisonCases.length}
              notice={comparisonNotice}
              text={text}
              onAdd={addCurrentComparisonCase}
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.reproducibility}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <ExportPanel
              shareStatus={shareStatus}
              text={text}
              onCopyShareUrl={() => void copyShareableUrl()}
              onDownloadCsv={() => downloadJetCsv(series, appState.comparisonCases)}
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.reducedModel}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <EquationPanel text={text} />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.symbolsGlossary}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <SymbolsGlossary text={text} />
          </CollapsibleSection>
        </aside>
        <section className="main-rail">
          <TerminalStateSummary series={series} text={text} />
          <CollapsibleSection
            title={text.sections.threeDJetView}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <JetGeometry3D
              series={series}
              crossSectionZeta={appState.crossSectionZeta}
              showSelectedCrossSection={appState.showSelectedCrossSection}
              showAxisSwitchingSection={appState.showAxisSwitchingSection}
              text={text}
              onCrossSectionZetaChange={(crossSectionZeta) =>
                setAppState((current) => ({
                  ...current,
                  crossSectionZeta: Math.min(
                    Math.max(crossSectionZeta, 0),
                    params.zetaMax,
                  ),
                }))
              }
              onShowSelectedCrossSectionChange={(showSelectedCrossSection) =>
                setAppState((current) => ({ ...current, showSelectedCrossSection }))
              }
              onShowAxisSwitchingSectionChange={(showAxisSwitchingSection) =>
                setAppState((current) => ({ ...current, showAxisSwitchingSection }))
              }
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.savedCases}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <ComparisonPanel
              cases={appState.comparisonCases}
              text={text}
              onToggle={(id, visible) =>
                setAppState((current) => ({
                  ...current,
                  comparisonCases: setComparisonCaseVisibility(
                    current.comparisonCases,
                    id,
                    visible,
                  ),
                }))
              }
              onRemove={(id) =>
                setAppState((current) => ({
                  ...current,
                  comparisonCases: removeComparisonCase(current.comparisonCases, id),
                }))
              }
              onClear={() =>
                setAppState((current) => ({
                  ...current,
                  comparisonCases: clearComparisonCases(),
                }))
              }
              onShowAll={() =>
                setAppState((current) => ({
                  ...current,
                  comparisonCases: setAllComparisonCasesVisibility(
                    current.comparisonCases,
                    true,
                  ),
                }))
              }
              onHideAll={() =>
                setAppState((current) => ({
                  ...current,
                  comparisonCases: setAllComparisonCasesVisibility(
                    current.comparisonCases,
                    false,
                  ),
                }))
              }
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.plots}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <Plots
              series={series}
              comparisonCases={appState.comparisonCases}
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
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.modelScope}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen
          >
            <InterpretationPanel text={text} />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.citations}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <CitationPanel text={text} />
          </CollapsibleSection>
        </section>
      </div>
    </Layout>
  )
}

export default App
