import type { ReactNode } from 'react'
import type { UiText } from '../i18n/translations'
import type { DimensionlessGroups } from '../model/engineering'
import type { ApplicabilityAssessment, ApplicabilityLevel } from '../model/regimeChecker'
import { formatNumber, formatScientific } from '../utils/format'
import { MathText } from './MathText'

interface RegimeApplicabilityPanelProps {
  assessment: ApplicabilityAssessment
  densityRatio: number
  groups?: DimensionlessGroups
  text: UiText
}

export function RegimeApplicabilityPanel({
  assessment,
  densityRatio,
  groups,
  text,
}: RegimeApplicabilityPanelProps) {
  const displayedMessages = assessment.messages.filter(
    (message) => message.level !== 'good' || assessment.overall === 'good',
  )

  return (
    <section className="panel regime-panel" aria-labelledby="regime-panel-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">{text.regime.eyebrow}</p>
          <h2 id="regime-panel-title">{text.regime.title}</h2>
        </div>
        <StatusBadge level={assessment.overall} text={text} />
      </div>

      <div className="regime-summary">
        <span>{text.regime.overallAssessment}</span>
        <strong>{assessment.regimeLabel}</strong>
        <p>{assessment.shortSummary}</p>
      </div>

      <div className="regime-summary">
        <span>{text.regime.recommendedUse}</span>
        <p>{assessment.recommendedUse}</p>
      </div>

      <div className="regime-groups" aria-label={text.regime.nondimensionalGroups}>
        <GroupItem
          label={<MathText text="Re_l" />}
          value={groups?.reynoldsLiquid}
          text={text}
        />
        <GroupItem
          label={<MathText text="We_l" />}
          value={groups?.weberLiquid}
          text={text}
        />
        <GroupItem
          label={<MathText text="We_g" />}
          value={groups?.weberGas}
          text={text}
        />
        <GroupItem
          label={<MathText text="Oh_l" />}
          value={groups?.ohnesorgeLiquid}
          text={text}
        />
        <GroupItem
          label={<MathText text="M_g" />}
          value={groups?.gasMachEstimate}
          text={text}
        />
        <GroupItem
          label={<MathText text="rho*" />}
          value={densityRatio}
          text={text}
        />
      </div>

      {groups === undefined ? (
        <p className="regime-helper">{text.regime.switchToDimensional}</p>
      ) : null}

      <ul className="regime-message-list">
        {displayedMessages.map((message) => (
          <li key={message.id} className={`regime-message level-${message.level}`}>
            <span className="regime-message-level">
              {levelLabel(message.level, text)}
            </span>
            <div>
              <strong>{message.title}</strong>
              <p>{message.message}</p>
              {message.quantity || message.threshold ? (
                <small>
                  {message.quantity ? `${message.quantity}: ${formatMessageValue(message.value, text)}` : ''}
                  {message.quantity && message.threshold ? ' · ' : ''}
                  {message.threshold ? `${text.regime.threshold}: ${message.threshold}` : ''}
                </small>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className="regime-helper">{text.regime.heuristicOnly}</p>
    </section>
  )
}

interface StatusBadgeProps {
  level: ApplicabilityLevel
  text: UiText
}

function StatusBadge({ level, text }: StatusBadgeProps) {
  return (
    <span className={`status-badge level-${level}`}>
      {levelLabel(level, text)}
    </span>
  )
}

interface GroupItemProps {
  label: ReactNode
  value: number | null | undefined
  text: UiText
}

function GroupItem({ label, value, text }: GroupItemProps) {
  return (
    <div className="regime-group-item">
      <span>{label}</span>
      <strong>{formatMessageValue(value, text)}</strong>
    </div>
  )
}

function formatMessageValue(value: number | null | undefined, text: UiText): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return text.regime.unavailable
  }

  const absoluteValue = Math.abs(value)
  if (absoluteValue !== 0 && (absoluteValue < 0.01 || absoluteValue >= 1000)) {
    return formatScientific(value)
  }

  return formatNumber(value, 3)
}

function levelLabel(level: ApplicabilityLevel, text: UiText): string {
  return text.regime.levels[level]
}
