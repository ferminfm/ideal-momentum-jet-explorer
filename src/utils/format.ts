export function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) {
    return 'n/a'
  }

  const absValue = Math.abs(value)
  if ((absValue > 0 && absValue < 0.001) || absValue >= 10000) {
    return value.toExponential(2)
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })
}

export function formatScientific(value: number): string {
  if (!Number.isFinite(value)) {
    return 'n/a'
  }

  return value.toExponential(2).replace('e', ' x 10^')
}

export function formatDegrees(value: number): string {
  return `${formatNumber(value, 2)} deg`
}
