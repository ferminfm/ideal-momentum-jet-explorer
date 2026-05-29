import { useEffect, useMemo, useState } from 'react'
import { CalibrationPanel } from './components/CalibrationPanel'
import { CfdExportPanel } from './components/CfdExportPanel'
import { CitationPanel } from './components/CitationPanel'
import { CollapsibleSection } from './components/CollapsibleSection'
import { ComparisonAddPanel, ComparisonPanel } from './components/ComparisonPanel'
import { ControlPanel } from './components/ControlPanel'
import { DataOverlayPanel } from './components/DataOverlayPanel'
import { EquationPanel } from './components/EquationPanel'
import { EngineeringSummaryPanel } from './components/EngineeringSummaryPanel'
import { ExportPanel } from './components/ExportPanel'
import { InterpretationPanel } from './components/InterpretationPanel'
import { JetGeometry3D } from './components/JetGeometry3D'
import { Layout } from './components/Layout'
import { Plots } from './components/Plots'
import { RegimeApplicabilityPanel } from './components/RegimeApplicabilityPanel'
import { ReportPanel } from './components/ReportPanel'
import { SymbolsGlossary } from './components/SymbolsGlossary'
import { TipPenetrationPanel } from './components/TipPenetrationPanel'
import { TRANSLATIONS, type Language } from './i18n/translations'
import { cloneDataOverlay } from './data/dataOverlays'
import type { DataOverlay } from './data/dataOverlayTypes'
import type { CalibrationResult } from './model/calibration'
import {
  MAX_COMPARISON_CASES,
  clearComparisonCases,
  createComparisonCase,
  removeComparisonCase,
  setAllComparisonCasesVisibility,
  setComparisonCaseVisibility,
} from './model/comparisonCases'
import { DEFAULT_CFD_EXPORT_OPTIONS, buildCfdExportPayload } from './model/cfdExport'
import { buildDimensionalMapping } from './model/dimensionalMapping'
import { generateJetSeries, getAspectRatio, type JetParameters } from './model/jetModel'
import { cloneParams } from './model/presets'
import { assessModelApplicability } from './model/regimeChecker'
import { computeTipPenetration, dimensionalizeTipPenetration } from './model/tipPenetration'
import {
  PRESET_CUSTOM,
  type DimensionalSettings,
  type ExplorerState,
  type InputMode,
} from './types/appState'
import { copyTextToClipboard } from './utils/clipboard'
import { downloadJetCsv } from './utils/csvExport'
import {
  decodeStateFromQuery,
  encodeStateToQuery,
  mergeStateWithDefaults,
  sanitizeDecodedState,
} from './utils/urlState'
import './styles.css'

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
  const [calibrationPreview, setCalibrationPreview] = useState<{
    signature: string
    result: CalibrationResult
  } | null>(null)
  const { params } = appState
  const text = TRANSLATIONS[appState.language]
  const shareUrl =
    typeof window === 'undefined'
      ? undefined
      : `${window.location.origin}${window.location.pathname}?${encodeStateToQuery(
          appState,
        ).toString()}${window.location.hash}`
  const dimensionalMapping = useMemo(
    () =>
      appState.inputMode === 'dimensional'
        ? buildDimensionalMapping(params, appState.dimensionalSettings)
        : null,
    [appState.dimensionalSettings, appState.inputMode, params],
  )
  const effectiveParams = dimensionalMapping?.normalizedParams ?? params
  const effectiveParamsSignature = useMemo(
    () => JSON.stringify(effectiveParams),
    [effectiveParams],
  )
  const series = useMemo(
    () => dimensionalMapping?.normalizedSeries ?? generateJetSeries(effectiveParams),
    [dimensionalMapping, effectiveParams],
  )
  const tipPenetration = useMemo(() => {
    const normalizedTip = computeTipPenetration(series, {
      pointCount: 180,
      useSeriesRange: true,
    })

    return dimensionalMapping?.scales
      ? dimensionalizeTipPenetration(normalizedTip, dimensionalMapping.scales)
      : normalizedTip
  }, [dimensionalMapping, series])
  const applicabilityAssessment = useMemo(
    () =>
      assessModelApplicability({
        densityRatio: effectiveParams.densityRatio,
        dimensionlessGroups: dimensionalMapping?.groups,
        geometryAspectRatio: getAspectRatio(effectiveParams.geometry),
        thetaDeg: effectiveParams.thetaDeg,
        phiDeg: effectiveParams.phiDeg,
        inputMode: appState.inputMode,
      }),
    [appState.inputMode, dimensionalMapping?.groups, effectiveParams],
  )
  const cfdReportPayload = useMemo(
    () =>
      buildCfdExportPayload({
        params: effectiveParams,
        series,
        dimensionalMapping,
        regimeAssessment: applicabilityAssessment,
        tipPenetration,
        shareUrl,
        options: {
          ...DEFAULT_CFD_EXPORT_OPTIONS,
          includeDataOverlays: false,
          includeComparisonCases: false,
        },
      }),
    [applicabilityAssessment, dimensionalMapping, effectiveParams, series, shareUrl, tipPenetration],
  )

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

  const activeCalibrationPreview =
    calibrationPreview?.signature === effectiveParamsSignature
      ? calibrationPreview.result
      : null

  function updateParams(nextParams: JetParameters, presetId = PRESET_CUSTOM) {
    setAppState((current) => ({
      ...current,
      params: cloneParams(nextParams),
      selectedPresetId: presetId,
      crossSectionZeta: Math.min(current.crossSectionZeta, nextParams.zetaMax),
    }))
  }

  function updateInputMode(inputMode: InputMode) {
    setAppState((current) => ({ ...current, inputMode }))
  }

  function updateDimensionalSettings(dimensionalSettings: DimensionalSettings) {
    setAppState((current) => ({ ...current, dimensionalSettings }))
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
    const comparisonParams =
      appState.inputMode === 'dimensional' ? effectiveParams : appState.params

    setAppState((current) => {
      if (current.comparisonCases.length >= MAX_COMPARISON_CASES) {
        return current
      }

      return {
        ...current,
        comparisonCases: [
          ...current.comparisonCases,
          createComparisonCase(comparisonParams, {
            presetId:
              current.inputMode === 'dimensional' ? PRESET_CUSTOM : current.selectedPresetId,
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

  function addDataOverlay(overlay: DataOverlay) {
    setAppState((current) => {
      const existingIndex = current.dataOverlays.findIndex(
        (candidate) => candidate.id === overlay.id,
      )
      if (existingIndex >= 0 && overlay.sourceKind !== 'user-import') {
        return {
          ...current,
          dataOverlays: current.dataOverlays.map((candidate, index) =>
            index === existingIndex ? { ...candidate, visible: true } : candidate,
          ),
          overlayId: overlay.id,
        }
      }

      return {
        ...current,
        dataOverlays: [...current.dataOverlays, cloneDataOverlay(overlay)],
        overlayId: overlay.sourceKind === 'synthetic-demo' ? overlay.id : current.overlayId,
      }
    })
  }

  function applyFittedCalibrationParams(result: CalibrationResult) {
    updateParams({
      ...appState.params,
      thetaDeg: result.fittedThetaDeg,
      phiDeg: result.fittedPhiDeg,
      geometry: { ...appState.params.geometry },
    })
  }

  function addFittedCalibrationComparison(
    result: CalibrationResult,
    overlayLabel: string,
  ) {
    setAppState((current) => {
      if (current.comparisonCases.length >= MAX_COMPARISON_CASES) {
        return current
      }

      return {
        ...current,
        comparisonCases: [
          ...current.comparisonCases,
          createComparisonCase(result.fittedSeries.params, {
            label: `${text.calibration.fitComparisonLabelPrefix} ${overlayLabel}`,
            index: current.comparisonCases.length,
          }),
        ],
      }
    })

    if (appState.comparisonCases.length >= MAX_COMPARISON_CASES) {
      showComparisonNotice(text.comparison.maxWarning)
    } else {
      showComparisonNotice(text.calibration.addedFittedCurve)
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
              inputMode={appState.inputMode}
              dimensionalSettings={appState.dimensionalSettings}
              text={text}
              onInputModeChange={updateInputMode}
              onDimensionalSettingsChange={updateDimensionalSettings}
              onChange={updateParams}
            />
          </CollapsibleSection>
          {appState.inputMode === 'dimensional' && dimensionalMapping ? (
            <CollapsibleSection
              title={text.engineering.title}
              expandLabel={text.sections.expandSection}
              collapseLabel={text.sections.collapseSection}
              defaultOpen
            >
              <EngineeringSummaryPanel
                mapping={dimensionalMapping}
                settings={appState.dimensionalSettings}
                text={text}
              />
            </CollapsibleSection>
          ) : null}
          <CollapsibleSection
            key={`regime-${appState.inputMode}`}
            title={text.sections.regimeApplicability}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={appState.inputMode === 'dimensional'}
          >
            <RegimeApplicabilityPanel
              assessment={applicabilityAssessment}
              densityRatio={effectiveParams.densityRatio}
              groups={dimensionalMapping?.groups}
              text={text}
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
            title={text.sections.dataOverlays}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <DataOverlayPanel
              overlays={appState.dataOverlays}
              text={text}
              onAddOverlay={addDataOverlay}
              onToggleOverlay={(id, visible) =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: current.dataOverlays.map((overlay) =>
                    overlay.id === id ? { ...overlay, visible } : overlay,
                  ),
                }))
              }
              onRemoveOverlay={(id) =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: current.dataOverlays.filter((overlay) => overlay.id !== id),
                }))
              }
              onShowAll={() =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: current.dataOverlays.map((overlay) => ({
                    ...overlay,
                    visible: true,
                  })),
                }))
              }
              onHideAll={() =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: current.dataOverlays.map((overlay) => ({
                    ...overlay,
                    visible: false,
                  })),
                }))
              }
              onClearUser={() =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: current.dataOverlays.filter(
                    (overlay) => overlay.sourceKind !== 'user-import',
                  ),
                }))
              }
              onClearAll={() =>
                setAppState((current) => ({
                  ...current,
                  dataOverlays: [],
                  overlayId: 'none',
                }))
              }
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.calibration}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <CalibrationPanel
              overlays={appState.dataOverlays}
              baseParams={effectiveParams}
              text={text}
              onPreviewChange={(result) =>
                setCalibrationPreview(
                  result ? { signature: effectiveParamsSignature, result } : null,
                )
              }
              onApplyFittedParams={applyFittedCalibrationParams}
              onAddFittedComparison={addFittedCalibrationComparison}
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
              onDownloadCsv={() =>
                downloadJetCsv(series, appState.comparisonCases, {
                  inputMode: appState.inputMode,
                  dimensionalSeries: dimensionalMapping?.dimensionalSeries,
                  groups: dimensionalMapping?.groups,
                  scales: dimensionalMapping?.scales,
                })
              }
            />
            <CfdExportPanel
              params={effectiveParams}
              series={series}
              dimensionalMapping={dimensionalMapping}
              regimeAssessment={applicabilityAssessment}
              tipPenetration={tipPenetration}
              dataOverlays={appState.dataOverlays}
              comparisonCases={appState.comparisonCases}
              shareUrl={shareUrl}
              text={text}
            />
            <ReportPanel
              params={effectiveParams}
              series={series}
              dimensionalMapping={dimensionalMapping}
              regimeAssessment={applicabilityAssessment}
              tipPenetration={tipPenetration}
              cfdExportPayload={cfdReportPayload}
              dataOverlays={appState.dataOverlays}
              comparisonCases={appState.comparisonCases}
              shareUrl={shareUrl}
              text={text}
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
                    effectiveParams.zetaMax,
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
              dataOverlays={appState.dataOverlays}
              calibrationPreview={activeCalibrationPreview}
              densityLogScale={appState.densityLogScale}
              text={text}
              onDensityLogScaleChange={(densityLogScale) =>
                setAppState((current) => ({ ...current, densityLogScale }))
              }
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={text.sections.tipPenetration}
            subtitle={text.tipPenetration.subtitle}
            expandLabel={text.sections.expandSection}
            collapseLabel={text.sections.collapseSection}
            defaultOpen={false}
          >
            <TipPenetrationPanel
              series={series}
              dimensionalScales={dimensionalMapping?.scales}
              text={text}
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
          <CitationPanel text={text} />
        </section>
      </div>
    </Layout>
  )
}

export default App
