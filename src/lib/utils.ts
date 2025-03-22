import { Timestamp } from "@/types/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Timestamp object to a string in the format "HH:MM:SS,MS".
 *
 * @param timestamp The Timestamp object to convert.
 * @returns The formatted timestamp string.
 */
export function timestampToString(timestamp: Timestamp): string {
  const hours = String(timestamp.h).padStart(2, '0')
  const minutes = String(timestamp.m).padStart(2, '0')
  const seconds = String(timestamp.s).padStart(2, '0')
  const milliseconds = String(timestamp.ms).padStart(3, '0')

  return `${hours}:${minutes}:${seconds},${milliseconds}`
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
