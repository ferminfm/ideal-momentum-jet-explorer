import { useId, useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  children: ReactNode
  collapseLabel: string
  defaultOpen?: boolean
  expandLabel: string
  id?: string
  mountWhenOpenOnly?: boolean
  subtitle?: string
  title: string
}

export function CollapsibleSection({
  children,
  collapseLabel,
  defaultOpen = true,
  expandLabel,
  id,
  mountWhenOpenOnly = false,
  subtitle,
  title,
}: CollapsibleSectionProps) {
  const generatedId = useId()
  const contentId = id ? `${id}-content` : `${generatedId}-content`
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const actionLabel = isOpen ? collapseLabel : expandLabel

  return (
    <section className={`collapsible-section${isOpen ? '' : ' is-collapsed'}`}>
      <button
        type="button"
        className="collapsible-section__header"
        aria-controls={contentId}
        aria-expanded={isOpen}
        aria-label={`${actionLabel}: ${title}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="collapsible-section__title-group">
          <span className="collapsible-section__title">{title}</span>
          {subtitle ? (
            <span className="collapsible-section__subtitle">{subtitle}</span>
          ) : null}
        </span>
        <span className="collapsible-section__chevron" aria-hidden="true">
          {isOpen ? 'v' : '>'}
        </span>
      </button>
      <div id={contentId} className="collapsible-section__content" hidden={!isOpen}>
        {isOpen || !mountWhenOpenOnly ? children : null}
      </div>
    </section>
  )
}
