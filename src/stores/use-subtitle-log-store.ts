import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

interface SubtitleLogStore {
  md5List: string[]
  has: (hash: string) => boolean
  add: (hash: string) => void
  clear: () => void
}

export const useSubtitleLogStore = create<SubtitleLogStore>()(
  persist(
    (set, get) => ({
      md5List: [],
      has: (hash) => get().md5List.includes(hash),
      add: (hash) => {
        if (get().has(hash)) return
        set((state) => {
          const next = state.md5List.concat(hash)
          if (next.length > 50) next.shift()
          return { md5List: next }
        })
      },
      clear: () => set({ md5List: [] }),
    }),
    {
      name: "subtitle-log-md5",
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({ md5List: state.md5List }),
    }
  )
)
