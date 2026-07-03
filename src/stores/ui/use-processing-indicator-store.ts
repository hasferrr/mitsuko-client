import { create } from "zustand"
import type { ProjectType } from "@/types/project"

export type ProcessingStatus = "processing" | "completed" | "error" | "stopped"

export interface TrackedProcessingItem {
  id: string
  type: ProjectType
  status: ProcessingStatus
  completedAt: number | null
  pendingStatus?: Exclude<ProcessingStatus, "processing">
}

interface ActiveSets {
  translation: Set<string>
  transcription: Set<string>
  extraction: Set<string>
}

interface ProcessingIndicatorState {
  items: Record<string, TrackedProcessingItem>
  reconcile: (active: ActiveSets) => void
  mark: (type: ProjectType, id: string, status: Exclude<ProcessingStatus, "processing">) => void
  markError: (type: ProjectType, id: string) => void
  markStopped: (type: ProjectType, id: string) => void
  clearItem: (key: string) => void
  clearCompleted: () => void
}

const TYPES: ProjectType[] = ["translation", "transcription", "extraction"]
const MAX_TERMINAL_ITEMS = 50

const itemKey = (type: ProjectType, id: string) => `${type}:${id}`

const isTerminal = (status: ProcessingStatus) =>
  status === "completed" || status === "error" || status === "stopped"

const pruneTerminalItems = (items: Record<string, TrackedProcessingItem>) => {
  const terminalEntries = Object.entries(items)
    .filter(([, item]) => isTerminal(item.status) && !item.pendingStatus)

  if (terminalEntries.length <= MAX_TERMINAL_ITEMS) return items

  const keepKeys = new Set(
    terminalEntries
      .sort(([, a], [, b]) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      .slice(0, MAX_TERMINAL_ITEMS)
      .map(([key]) => key),
  )
  const next: Record<string, TrackedProcessingItem> = {}
  for (const [key, item] of Object.entries(items)) {
    if (!isTerminal(item.status) || item.pendingStatus || keepKeys.has(key)) {
      next[key] = item
    }
  }
  return next
}

export const useProcessingIndicatorStore = create<ProcessingIndicatorState>()((set, get) => ({
  items: {},
  reconcile: (active) =>
    set((state) => {
      const next: Record<string, TrackedProcessingItem> = { ...state.items }
      let changed = false

      for (const [key, item] of Object.entries(next)) {
        const stillActive = active[item.type]?.has(item.id) ?? false

        if (stillActive) {
          if (item.pendingStatus) continue
          if (isTerminal(item.status)) {
            next[key] = { ...item, status: "processing", completedAt: null }
            changed = true
          }
        } else if (item.pendingStatus) {
          next[key] = {
            ...item,
            status: item.pendingStatus,
            completedAt: Date.now(),
            pendingStatus: undefined,
          }
          changed = true
        } else if (item.status === "processing") {
          next[key] = { ...item, status: "completed", completedAt: Date.now() }
          changed = true
        }
      }

      for (const type of TYPES) {
        for (const id of active[type]) {
          const key = itemKey(type, id)
          if (!next[key]) {
            next[key] = { id, type, status: "processing", completedAt: null }
            changed = true
          }
        }
      }

      return changed ? { items: pruneTerminalItems(next) } : state
    }),
  mark: (type, id, status) =>
    set((state) => {
      const key = itemKey(type, id)
      const existing = state.items[key]
      if (existing && existing.pendingStatus === status) return state
      return {
        items: {
          ...state.items,
          [key]: existing
            ? { ...existing, pendingStatus: status }
            : { id, type, status: "processing", completedAt: null, pendingStatus: status },
        },
      }
    }),
  markError: (type, id) => get().mark(type, id, "error"),
  markStopped: (type, id) => get().mark(type, id, "stopped"),
  clearItem: (key) =>
    set((state) => {
      if (!state.items[key]) return state
      const next = { ...state.items }
      delete next[key]
      return { items: next }
    }),
  clearCompleted: () =>
    set((state) => {
      let changed = false
      const next: Record<string, TrackedProcessingItem> = {}
      for (const [key, item] of Object.entries(state.items)) {
        if (isTerminal(item.status) && !item.pendingStatus) {
          changed = true
          continue
        }
        next[key] = item
      }
      return changed ? { items: next } : state
    }),
}))
