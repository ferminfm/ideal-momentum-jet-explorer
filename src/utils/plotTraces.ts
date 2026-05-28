import type { ComparisonCase } from '../model/comparisonCases'
import type { JetSeries, JetState } from '../model/jetModel'
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
