import { describe, expect, it } from 'vitest'
import { generateJetSeries } from '../model/jetModel'
import { DEFAULT_PARAMS } from '../model/presets'
import {
  DEFAULT_REPORT_OPTIONS,
  buildReportPayload,
} from '../model/reportGenerator'
import {
  escapeHtml,
  serializeReportHtml,
  serializeReportMarkdown,
} from './reportSerializers'

describe('report serializers', () => {
  it('serializes Markdown with title, model summary, citations, and disclaimer', () => {
    const payload = buildReportPayload({
      params: DEFAULT_PARAMS,
      series: generateJetSeries(DEFAULT_PARAMS),
      options: DEFAULT_REPORT_OPTIONS,
    })
    const markdown = serializeReportMarkdown(payload)

    expect(markdown).toContain('# Ideal Momentum Jet Explorer report')
    expect(markdown).toContain('## Model Summary')
    expect(markdown).toContain('## Citations')
    expect(markdown).toContain('## Research-Use Disclaimer')
  })

  it('escapes user-provided strings in HTML output', () => {
    const payload = buildReportPayload({
      params: DEFAULT_PARAMS,
      series: generateJetSeries(DEFAULT_PARAMS),
      options: {
        ...DEFAULT_REPORT_OPTIONS,
        reportTitle: '<script>alert(1)</script>',
        authorName: '<b>private</b>',
      },
    })
    const html = serializeReportHtml(payload)

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;private&lt;/b&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('</script>')
  })

  it('provides a reusable HTML escaping helper', () => {
    expect(escapeHtml('A&B < C')).toBe('A&amp;B &lt; C')
  })
})
