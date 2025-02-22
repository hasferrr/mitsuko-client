import { create } from "zustand"
import { persist } from "zustand/middleware"

interface HistoryItem {
  title: string
  content: string[]
  jsonStringified: string
  timestamp: string
}

interface HistoryStore {
  history: HistoryItem[]
  addHistory: (title: string, content: string[], jsonStringified: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (title, content, jsonStringified) => {
        const timestamp = new Date().toLocaleString()
        set((state) => ({
          history: [...state.history, { title, content, jsonStringified, timestamp }],
        }))
      },
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "history-storage",
    }
  )
)
