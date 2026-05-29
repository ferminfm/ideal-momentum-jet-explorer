import type { CfdExportPayload } from '../model/cfdExport'

export function serializeCfdExportJson(payload: CfdExportPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`
}

export function serializeCfdExportYaml(payload: CfdExportPayload): string {
  return `${toYaml(payload)}\n`
}

export function serializeCfdExportMarkdown(payload: CfdExportPayload): string {
  const dimensional = payload.dimensional
  const groups = dimensional?.dimensionlessGroups as Record<string, unknown> | undefined
  const scales = dimensional?.scales as Record<string, unknown> | undefined
  const lines = [
    '# Ideal Momentum Jet Configuration Summary',
    '',
    `Generated: ${payload.generatedAt}`,
    '',
    '## Model Caveat',
    '',
    payload.model.caveat,
    '',
    '## Geometry And Model Inputs',
    '',
    `- Geometry: ${payload.model.geometry}`,
    `- Density ratio: ${formatValue(payload.model.densityRatio)}`,
    `- theta [deg]: ${formatValue(payload.model.thetaDeg)}`,
    `- phi [deg]: ${formatValue(payload.model.phiDeg)}`,
    `- zeta max: ${formatValue(payload.model.zetaMax)}`,
    `- samples: ${payload.model.samples}`,
    `- Axis switching zeta: ${formatValue(payload.axisSwitching?.zeta)}`,
    '',
  ]

  if (dimensional) {
    lines.push(
      '## Dimensional Operating Point',
      '',
      `- Equivalent diameter [m]: ${formatValue(scales?.equivalentDiameter)}`,
      `- Injection velocity [m/s]: ${formatValue(scales?.injectionVelocity)}`,
      `- Liquid density [kg/m^3]: ${formatValue(scales?.liquidDensity)}`,
      `- Gas density [kg/m^3]: ${formatValue(scales?.gasDensity)}`,
      '',
      '## Nondimensional Groups',
      '',
      `- Re_l: ${formatValue(groups?.reynoldsLiquid)}`,
      `- We_l: ${formatValue(groups?.weberLiquid)}`,
      `- We_g: ${formatValue(groups?.weberGas)}`,
      `- Oh_l: ${formatValue(groups?.ohnesorgeLiquid)}`,
      `- M_g: ${formatValue(groups?.gasMachEstimate)}`,
      '',
    )
  }

  if (payload.regimeAssessment) {
    const assessment = payload.regimeAssessment as {
      overall?: string
      regimeLabel?: string
      recommendedUse?: string
    }
    lines.push(
      '## Regime / Applicability',
      '',
      `- Overall: ${assessment.overall ?? 'n/a'}`,
      `- Label: ${assessment.regimeLabel ?? 'n/a'}`,
      `- Recommended use: ${assessment.recommendedUse ?? 'n/a'}`,
      '',
    )
  }

  lines.push(
    '## Export Contents',
    '',
    `- Sampled normalized states: ${payload.sampledStates?.length ?? 0}`,
    `- Sampled dimensional states: ${payload.dimensionalStates?.length ?? 0}`,
    `- Tip-penetration points: ${tipPointCount(payload)}`,
    `- Data overlays: ${payload.dataOverlays?.length ?? 0}`,
    `- Comparison cases: ${payload.comparisonCases?.length ?? 0}`,
    '',
    '## Citations',
    '',
    ...payload.citations.map((citation) => {
      const entry = citation as { title?: string; plainText?: string }
      return `- ${entry.title ?? 'Citation'}: ${entry.plainText ?? ''}`
    }),
    '',
    '## Disclaimers',
    '',
    ...payload.disclaimers.map((disclaimer) => `- ${disclaimer}`),
    '',
  )

  return lines.join('\n')
}

export function serializeOpenFoamNotes(payload: CfdExportPayload): string {
  const dimensional = payload.dimensional
  const operatingPoint = dimensional?.operatingPoint as
    | {
        liquid?: Record<string, unknown>
        gas?: Record<string, unknown>
      }
    | undefined
  const scales = dimensional?.scales as Record<string, unknown> | undefined
  const groups = dimensional?.dimensionlessGroups as Record<string, unknown> | undefined

  return [
    'OpenFOAM-oriented setup notes - not a solver-ready case',
    '',
    'WARNING',
    'This file is a setup aid only. It does not generate a mesh, solver dictionary,',
    'initial condition, boundary condition, thermophysical model, turbulence model,',
    'or validated multiphase setup. Verify all solver settings independently.',
    '',
    'GEOMETRY',
    `geometry: ${payload.model.geometry}`,
    `normalized_geometry: ${JSON.stringify(payload.normalizedGeometry)}`,
    `equivalent_diameter_m: ${formatValue(scales?.equivalentDiameter)}`,
    `initial_area_m2: ${formatValue(scales?.initialArea)}`,
    '',
    'OPERATING POINT',
    `inlet_velocity_scale_m_s: ${formatValue(scales?.injectionVelocity)}`,
    `liquid_density_kg_m3: ${formatValue(operatingPoint?.liquid?.density)}`,
    `liquid_dynamic_viscosity_Pa_s: ${formatValue(operatingPoint?.liquid?.dynamicViscosity)}`,
    `liquid_gas_surface_tension_N_m: ${formatValue(operatingPoint?.liquid?.surfaceTension)}`,
    `gas_density_kg_m3: ${formatValue(operatingPoint?.gas?.density)}`,
    `gas_dynamic_viscosity_Pa_s: ${formatValue(operatingPoint?.gas?.dynamicViscosity)}`,
    '',
    'NONDIMENSIONAL GROUPS',
    `Re_l: ${formatValue(groups?.reynoldsLiquid)}`,
    `We_l: ${formatValue(groups?.weberLiquid)}`,
    `We_g: ${formatValue(groups?.weberGas)}`,
    `Oh_l: ${formatValue(groups?.ohnesorgeLiquid)}`,
    `M_g: ${formatValue(groups?.gasMachEstimate)}`,
    '',
    'SUGGESTED CASE AREAS TO DEFINE MANUALLY',
    '- system/: solver, schemes, solution controls, time controls',
    '- constant/: mesh, transport/thermophysical properties, turbulence and phase model',
    '- 0/: initial and boundary fields',
    '',
    'NOTES',
    '- Choose solver and multiphase formulation independently.',
    '- Mesh generation is not provided.',
    '- Boundary conditions must be constructed and validated by the user.',
    '- This app provides reduced-order reference curves only.',
    '',
    'CITATIONS',
    ...payload.citations.map((citation) => {
      const entry = citation as { title?: string; plainText?: string }
      return `- ${entry.title ?? 'Citation'}: ${entry.plainText ?? ''}`
    }),
    '',
  ].join('\n')
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function toYaml(value: unknown, indent = 0): string {
  const prefix = ' '.repeat(indent)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]'
    }

    return value
      .map((item) => {
        if (isScalar(item)) {
          return `${prefix}- ${formatYamlScalar(item)}`
        }

        return `${prefix}-\n${toYaml(item, indent + 2)}`
      })
      .join('\n')
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, entryValue]) => entryValue !== undefined,
    )
    if (entries.length === 0) {
      return '{}'
    }

    return entries
      .map(([key, entryValue]) => {
        if (isScalar(entryValue)) {
          return `${prefix}${key}: ${formatYamlScalar(entryValue)}`
        }

        return `${prefix}${key}:\n${toYaml(entryValue, indent + 2)}`
      })
      .join('\n')
  }

  return formatYamlScalar(value)
}

function isScalar(value: unknown): boolean {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
}

function formatYamlScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  const text = String(value)
  if (/^[A-Za-z0-9_.:/ -]+$/.test(text) && text.trim() === text) {
    return text
  }

  return JSON.stringify(text)
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toPrecision(6) : 'n/a'
  }

  return value === null || value === undefined ? 'n/a' : String(value)
}

function tipPointCount(payload: CfdExportPayload): number {
  const tipPenetration = payload.tipPenetration as { points?: unknown[] } | undefined
  return tipPenetration?.points?.length ?? 0
}
