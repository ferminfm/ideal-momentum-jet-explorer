import type { ReactNode } from 'react'
import type { UiText } from '../i18n/translations'
import type { DimensionalMappingResult } from '../model/dimensionalMapping'
import type { DimensionalSettings } from '../types/appState'
import { formatNumber, formatScientific } from '../utils/format'
import { MathText } from './MathText'

interface EngineeringSummaryPanelProps {
  mapping: DimensionalMappingResult
  settings: DimensionalSettings
  text: UiText
}

export function EngineeringSummaryPanel({
  mapping,
  settings,
  text,
}: EngineeringSummaryPanelProps) {
  const { scales, groups, operatingPoint } = mapping
  const pressureDropKPa =
    operatingPoint.pressureDrop === undefined ? null : operatingPoint.pressureDrop / 1000

  return (
    <section className="panel engineering-summary" aria-labelledby="engineering-summary-title">
      <div className="section-heading">
        <p className="eyebrow">{text.engineering.eyebrow}</p>
        <h2 id="engineering-summary-title">{text.engineering.title}</h2>
      </div>

      <div className="engineering-summary-grid">
        <SummaryItem
          label={text.engineering.equivalentDiameter}
          value={`${formatNumber(scales.equivalentDiameter * 1000, 3)} mm`}
        />
        <SummaryItem
          label={text.engineering.initialArea}
          value={`${formatNumber(scales.initialArea * 1e6, 4)} mm^2`}
        />
        <SummaryItem
          label={text.engineering.densityRatio}
          value={formatScientific(scales.densityRatio)}
          symbol={<MathText text="rho*" />}
        />
        <SummaryItem
          label={text.engineering.injectionVelocity}
          value={`${formatNumber(scales.injectionVelocity, 3)} m/s`}
          symbol={<MathText text="v0" />}
        />
        <SummaryItem
          label={text.engineering.pressureDrop}
          value={
            pressureDropKPa === null
              ? text.engineering.unavailable
              : `${formatNumber(pressureDropKPa, 3)} kPa`
          }
        />
        <SummaryItem
          label={text.engineering.dischargeCoefficient}
          value={formatNumber(settings.dischargeCoefficient, 2)}
        />
        <SummaryItem
          label={text.engineering.massFlowRate}
          value={`${formatScientific(scales.liquidMassFlowRate)} kg/s`}
          secondary={`${formatNumber(scales.liquidMassFlowRate * 1000, 3)} g/s`}
        />
        <SummaryItem
          label={text.engineering.momentumFlux}
          value={`${formatScientific(scales.liquidMomentumFlux)} N`}
        />
        <SummaryItem
          label={text.engineering.dynamicPressureScale}
          value={`${formatNumber(scales.dynamicPressureScale / 1000, 3)} kPa`}
        />
        <SummaryItem
          label={text.engineering.reynoldsNumber}
          value={formatScientific(groups.reynoldsLiquid)}
          symbol={<MathText text="Re_l" />}
        />
        <SummaryItem
          label={text.engineering.weberNumber}
          value={formatNullable(groups.weberLiquid, text)}
          symbol={<MathText text="We_l" />}
        />
        <SummaryItem
          label={text.engineering.weberGasNumber}
          value={formatNullable(groups.weberGas, text)}
          symbol={<MathText text="We_g" />}
        />
        <SummaryItem
          label={text.engineering.ohnesorgeNumber}
          value={formatNullable(groups.ohnesorgeLiquid, text)}
          symbol={<MathText text="Oh_l" />}
        />
        <SummaryItem
          label={text.engineering.gasMachEstimate}
          value={formatNullable(groups.gasMachEstimate, text)}
          symbol={<MathText text="M_g" />}
        />
      </div>

      <p className="control-helper">{text.engineering.representativePropertiesWarning}</p>
    </section>
  )
}

interface SummaryItemProps {
  label: string
  value: string
  secondary?: string
  symbol?: ReactNode
}

function SummaryItem({ label, value, secondary, symbol }: SummaryItemProps) {
  return (
    <div className="engineering-summary-item">
      <span>
        {symbol ? <span className="summary-symbol">{symbol}</span> : null}
        {label}
      </span>
      <strong>{value}</strong>
      {secondary ? <small>{secondary}</small> : null}
    </div>
  )
}

function formatNullable(value: number | null, text: UiText): string {
  return value === null ? text.engineering.unavailable : formatScientific(value)
}
