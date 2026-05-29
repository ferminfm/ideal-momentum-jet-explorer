import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import PlotModule from 'react-plotly.js'
import type { UiText } from '../i18n/translations'
import type { JetSeries } from '../model/jetModel'
import {
  computeTipPenetration,
  dimensionalizeTipPenetration,
  type TipPenetrationDimensionalScales,
} from '../model/tipPenetration'
import { formatNumber } from '../utils/format'
import { downloadTipPenetrationCsv } from '../utils/tipPenetrationCsv'
import { InlineMath } from './MathFormula'
import { MathText } from './MathText'

interface TipPenetrationPanelProps {
  series: JetSeries
  dimensionalScales?: TipPenetrationDimensionalScales
  text: UiText
}

const Plot = (
  (PlotModule as unknown as { default?: ComponentType<Record<string, unknown>> }).default ??
  PlotModule
) as ComponentType<Record<string, unknown>>

export function TipPenetrationPanel({
  series,
  dimensionalScales,
  text,
}: TipPenetrationPanelProps) {
  const [showPlot, setShowPlot] = useState(true)
  const [pointCount, setPointCount] = useState(180)
  const normalizedResult = useMemo(
    () =>
      computeTipPenetration(series, {
        pointCount,
        useSeriesRange: true,
      }),
    [pointCount, series],
  )
  const result = useMemo(
    () =>
      dimensionalScales
        ? dimensionalizeTipPenetration(normalizedResult, dimensionalScales)
        : normalizedResult,
    [dimensionalScales, normalizedResult],
  )
  const terminalPoint = result.points[result.points.length - 1]
  const initialPoint = result.points[0]
  const hasDimensionalOutput =
    dimensionalScales !== undefined && terminalPoint?.t !== undefined && terminalPoint.z !== undefined

  return (
    <section className="panel tip-penetration-panel" aria-labelledby="tip-penetration-title">
      <div className="section-heading plot-heading">
        <div>
          <p className="eyebrow">{text.tipPenetration.eyebrow}</p>
          <h2 id="tip-penetration-title">
            <MathText text={text.tipPenetration.title} />
          </h2>
        </div>
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={showPlot}
            onChange={(event) => setShowPlot(event.target.checked)}
          />
          {text.tipPenetration.showPlot}
        </label>
      </div>

      <p className="helper-text">
        <MathText text={text.tipPenetration.helper} />
      </p>

      <div className="tip-penetration-controls">
        <label className="field">
          <span>{text.tipPenetration.pointCount}</span>
          <input
            type="range"
            min={40}
            max={400}
            step={10}
            value={pointCount}
            onChange={(event) => setPointCount(Number(event.target.value))}
          />
          <strong>{pointCount}</strong>
        </label>
        <span className="helper-text">{text.tipPenetration.useVisibleJetLength}</span>
        <button
          type="button"
          className="secondary-action"
          onClick={() => downloadTipPenetrationCsv(result)}
          disabled={!result.success}
        >
          {text.tipPenetration.downloadCsv}
        </button>
      </div>

      {result.success ? (
        <>
          <div className="tip-penetration-summary">
            <SummaryItem
              label={text.tipPenetration.timeToZetaMax}
              value={formatNumber(result.tauAtZetaMax, 4)}
              symbol={<InlineMath math={String.raw`\tau(\zeta_{\max})`} />}
            />
            <SummaryItem
              label={text.tipPenetration.zetaMax}
              value={formatNumber(result.zetaMax, 4)}
              symbol={<InlineMath math={String.raw`\zeta_{\max}`} />}
            />
            <SummaryItem
              label={text.tipPenetration.initialTipSpeed}
              value={formatNumber(initialPoint?.vhat ?? Number.NaN, 4)}
              symbol={<InlineMath math={String.raw`\widehat{v}(0)`} />}
            />
            <SummaryItem
              label={text.tipPenetration.terminalTipSpeed}
              value={formatNumber(terminalPoint?.vhat ?? Number.NaN, 4)}
              symbol={<InlineMath math={String.raw`\widehat{v}(\zeta_{\max})`} />}
            />
            {hasDimensionalOutput ? (
              <>
                <SummaryItem
                  label={text.tipPenetration.dimensionalTime}
                  value={`${formatNumber((terminalPoint?.t ?? 0) * 1000, 4)} ms`}
                  symbol={<InlineMath math="t" />}
                />
                <SummaryItem
                  label={text.tipPenetration.dimensionalTipPosition}
                  value={`${formatNumber((terminalPoint?.z ?? 0) * 1000, 4)} mm`}
                  symbol={<InlineMath math="Z" />}
                />
              </>
            ) : null}
          </div>

          {showPlot ? (
            <Plot
              data={[
                {
                  x: result.points.map((point) =>
                    hasDimensionalOutput ? (point.t ?? 0) * 1000 : point.tau,
                  ),
                  y: result.points.map((point) =>
                    hasDimensionalOutput ? (point.z ?? 0) * 1000 : point.zeta,
                  ),
                  type: 'scatter',
                  mode: 'lines',
                  name: text.tipPenetration.plotTrace,
                  line: {
                    color: '#236b8e',
                    width: 3,
                  },
                  hovertemplate: hasDimensionalOutput
                    ? `${text.tipPenetration.timeMs}=%{x:.5g}<br>${text.tipPenetration.positionMm}=%{y:.5g}<extra>${text.tipPenetration.plotTrace}</extra>`
                    : `${text.tipPenetration.normalizedTime}=%{x:.5g}<br>${text.tipPenetration.tipPosition}=%{y:.5g}<extra>${text.tipPenetration.plotTrace}</extra>`,
                },
              ]}
              layout={{
                autosize: true,
                height: 390,
                margin: { l: 66, r: 24, t: 34, b: 58 },
                paper_bgcolor: 'rgba(255,255,255,0)',
                plot_bgcolor: '#fbfcfd',
                font: {
                  color: '#1d2a35',
                  family:
                    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                },
                xaxis: {
                  title: hasDimensionalOutput
                    ? text.tipPenetration.timeAxis
                    : text.tipPenetration.normalizedTimeAxis,
                  zeroline: false,
                  gridcolor: '#dfe7ee',
                },
                yaxis: {
                  title: hasDimensionalOutput
                    ? text.tipPenetration.positionAxis
                    : text.tipPenetration.normalizedPositionAxis,
                  zeroline: false,
                  gridcolor: '#dfe7ee',
                },
                showlegend: false,
              }}
              config={{
                responsive: true,
                displaylogo: false,
              }}
              className="plotly-embed"
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </>
      ) : (
        <p className="warning-text">{result.message}</p>
      )}

      <p className="warning-text subdued-warning">
        {text.tipPenetration.notFullTransient}
      </p>
    </section>
  )
}

interface SummaryItemProps {
  label: string
  value: string
  symbol?: ReactNode
}

function SummaryItem({ label, value, symbol }: SummaryItemProps) {
  return (
    <div className="tip-penetration-summary-item">
      <span>
        {symbol ? <span className="summary-symbol">{symbol}</span> : null}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  )
}
