import { Timestamp } from "@/types/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounces a function, ensuring it is only called after a specified delay
 * since the last time it was invoked. This is useful for preventing
 * functions from being called too frequently, such as when handling
 * events like typing, scrolling, or resizing.
 *
 * @param func The function to debounce.
 * @param wait The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Converts a Timestamp object to a string in the format "HH:MM:SS,MS".
 *
 * @param timestamp The Timestamp object to convert.
 * @returns The formatted timestamp string.
 */
export function timestampToString(timestamp: Timestamp): string {
  const hours = String(timestamp.h).padStart(2, '0');
  const minutes = String(timestamp.m).padStart(2, '0');
  const seconds = String(timestamp.s).padStart(2, '0');
  const milliseconds = String(timestamp.ms).padStart(3, '0');

  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}
