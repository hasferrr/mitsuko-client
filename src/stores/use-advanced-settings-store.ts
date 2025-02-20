import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  maxCompletionTokens: number
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  setMaxCompletionTokens: (tokens: number) => void
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  persist(
    (set) => ({
      temperature: 0.6,
      splitSize: 500,
      prompt: "",
      maxCompletionTokens: 8192,
      setTemperature: (temp) => set({ temperature: temp }),
      setSplitSize: (size) => set({ splitSize: size }),
      setPrompt: (prompt) => set({ prompt }),
      setMaxCompletionTokens: (tokens) => set({ maxCompletionTokens: tokens }),
    }),
    {
      name: 'advanced-settings',
    }
  )
)
