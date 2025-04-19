import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function minMax(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
