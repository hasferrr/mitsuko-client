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
