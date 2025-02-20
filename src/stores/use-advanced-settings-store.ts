import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  maxCompletionTokens: number
  startIndex: number
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  setMaxCompletionTokens: (tokens: number) => void
  setStartIndex: (index: number) => void
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  persist(
    (set) => ({
      temperature: 0.6,
      splitSize: 150,
      prompt: "",
      maxCompletionTokens: 8192,
      startIndex: 1,
      setTemperature: (temp) => set({ temperature: temp }),
      setSplitSize: (size) => set({ splitSize: size }),
      setPrompt: (prompt) => set({ prompt }),
      setMaxCompletionTokens: (tokens) => set({ maxCompletionTokens: tokens }),
      setStartIndex: (index) => set({ startIndex: index }),
    }),
    {
      name: 'advanced-settings',
      partialize: (state) => ({
        temperature: state.temperature,
        splitSize: state.splitSize,
        prompt: state.prompt,
        maxCompletionTokens: state.maxCompletionTokens,
      }),
    }
  )
)
