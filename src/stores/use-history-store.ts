import { create } from "zustand"
import { persist } from "zustand/middleware"

interface HistoryItem {
  title: string
  content: string
  timestamp: string
}

interface HistoryStore {
  history: HistoryItem[]
  addHistory: (title: string, content: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (title, content) => {
        const timestamp = new Date().toLocaleString()
        set((state) => ({
          history: [...state.history, { title, content, timestamp }],
        }))
      },
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "history-storage",
    }
  )
)
