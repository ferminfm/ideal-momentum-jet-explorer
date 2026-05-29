interface LazyPanelFallbackProps {
  label: string
}

export function LazyPanelFallback({ label }: LazyPanelFallbackProps) {
  return (
    <div className="lazy-panel-fallback" role="status" aria-live="polite">
      <span className="lazy-panel-fallback__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
