import type { DataOverlay, OverlayVariable } from '../data/dataOverlayTypes'
import type { ComparisonCase } from '../model/comparisonCases'
import type {
  EntrainmentCoefficientLimits,
  JetSeries,
  JetState,
} from '../model/jetModel'
import { toMathPlainText } from './mathPlainText'

interface BuildModelTraceOptions {
  series: JetSeries
  comparisonCases: ComparisonCase[]
  getValue: (state: JetState) => number
  hoverZeta: string
  hoverValue: string
  currentLabel: string
}

export function buildModelCurveTraces({
  series,
  comparisonCases,
  getValue,
  hoverZeta,
  hoverValue,
  currentLabel,
}: BuildModelTraceOptions): Array<Record<string, unknown>> {
  const zetaLabel = toMathPlainText(hoverZeta)
  const traces: Array<Record<string, unknown>> = [
    {
      x: series.states.map((state) => state.axialZeta),
      y: series.states.map(getValue),
      type: 'scatter',
      mode: 'lines',
      name: currentLabel,
      line: {
        color: '#0c1b2a',
        width: 3.4,
      },
      hovertemplate: `${zetaLabel}=%{x:.3f}<br>${hoverValue}=%{y:.5g}<extra>${currentLabel}</extra>`,
    },
  ]

  for (const comparisonCase of comparisonCases) {
    if (!comparisonCase.visible) {
      continue
    }

    traces.push({
      x: comparisonCase.series.states.map((state) => state.axialZeta),
      y: comparisonCase.series.states.map(getValue),
      type: 'scatter',
      mode: 'lines',
      name: comparisonCase.label,
      line: {
        color: comparisonCase.color,
        width: 2.2,
        dash: 'dash',
      },
      hovertemplate: `${zetaLabel}=%{x:.3f}<br>${hoverValue}=%{y:.5g}<extra>${comparisonCase.label}</extra>`,
    })
  }

  return traces
}

export function buildEntrainmentReferenceTraces(
  series: JetSeries,
  limits: EntrainmentCoefficientLimits,
  labels: {
    nearField: string
    farField: string
  },
): Array<Record<string, unknown>> {
  const firstState = series.states[0]
  const lastState = series.states[series.states.length - 1]
  const xStart = firstState?.axialZeta ?? 0
  const xEnd = lastState?.axialZeta ?? series.params.zetaMax
  const lambdaDetail = `${toMathPlainText(limits.lambda1Label)}=${formatHoverNumber(
    limits.lambda1,
  )}, ${toMathPlainText(limits.lambda2Label)}=${formatHoverNumber(
    limits.lambda2,
  )}, ${toMathPlainText('rho*')}=${formatHoverNumber(series.params.densityRatio)}`

  return [
    {
      x: [xStart, xEnd],
      y: [limits.nearField, limits.nearField],
      type: 'scatter',
      mode: 'lines',
      name: labels.nearField,
      line: {
        color: '#4e7896',
        width: 2,
        dash: 'dash',
      },
      hovertemplate: `${toMathPlainText('K_A')}(0)=%{y:.5g}<br>${lambdaDetail}<extra>${labels.nearField}</extra>`,
    },
    {
      x: [xStart, xEnd],
      y: [limits.farField, limits.farField],
      type: 'scatter',
      mode: 'lines',
      name: labels.farField,
      line: {
        color: '#b35a2a',
        width: 2,
        dash: 'dot',
      },
      hovertemplate: `${toMathPlainText('K_A')}(∞)=%{y:.5g}<br>${lambdaDetail}<extra>${labels.farField}</extra>`,
    },
  ]
}

export function buildDataOverlayTraces(
  dataOverlays: DataOverlay[],
  variable: OverlayVariable,
): Array<Record<string, unknown>> {
  return dataOverlays
    .filter((overlay) => overlay.visible && overlay.variable === variable)
    .map((overlay) => {
      const hasXError = overlay.points.some((point) => point.xError !== undefined)
      const hasYError = overlay.points.some((point) => point.yError !== undefined)
      const lineAllowed =
        overlay.points.length > 1 &&
        (overlay.sourceKind === 'cfd' || overlay.sourceKind === 'synthetic-demo')

      return {
        x: overlay.points.map((point) => point.x),
        y: overlay.points.map((point) => point.y),
        type: 'scatter',
        mode: lineAllowed ? 'lines+markers' : 'markers',
        name: `${overlay.label} (${overlay.sourceKind})`,
        marker: {
          color: overlay.color,
          size: overlay.sourceKind === 'synthetic-demo' ? 8 : 9,
          symbol: overlay.sourceKind === 'synthetic-demo' ? 'diamond-open' : 'circle-open',
          line: { width: 1.5 },
        },
        line: lineAllowed
          ? {
              color: overlay.color,
              width: 1.6,
              dash: overlay.sourceKind === 'synthetic-demo' ? 'dot' : 'solid',
            }
          : undefined,
        error_x: hasXError
          ? {
              type: 'data',
              array: overlay.points.map((point) => point.xError ?? 0),
              visible: true,
            }
          : undefined,
        error_y: hasYError
          ? {
              type: 'data',
              array: overlay.points.map((point) => point.yError ?? 0),
              visible: true,
            }
          : undefined,
        hovertemplate:
          `${escapeHoverText(overlay.xLabel)}=%{x:.5g}<br>${escapeHoverText(overlay.yLabel)}=%{y:.5g}<br>` +
          `${escapeHoverText(overlay.source)}<br>${escapeHoverText(overlay.notes)}<extra>${escapeHoverText(overlay.label)}</extra>`,
      }
    })
}

function formatHoverNumber(value: number): string {
  return Number.isFinite(value) ? value.toPrecision(5) : 'n/a'
}

function escapeHoverText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
