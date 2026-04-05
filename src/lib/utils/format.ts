export function capitalize(s: string): string {
  if (!s) return s
  const arr = s.split(" ")
  arr.forEach((val, i) => arr[i] = val[0].toUpperCase() + val.slice(1))
  return arr.join(" ")
}

export function formatTokens(tokens: number | undefined): string {
  if (tokens === undefined) {
    return ""
  }
  if (tokens >= 1_000_000) {
    const value = (tokens / 1_000_000).toFixed(1)
    const intVal = parseInt(value)
    return `${Number(value) - intVal ? value : intVal}M tokens`
  }
  if (tokens >= 1_000) {
    const value = tokens / 1_000
    return `${value.toFixed(0)}k tokens`
  }
  return `${tokens} tokens`
}
