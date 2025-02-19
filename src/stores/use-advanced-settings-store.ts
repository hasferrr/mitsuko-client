import { create } from "zustand"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  (set) => ({
    temperature: 0.6,
    splitSize: 500,
    prompt: "",
    setTemperature: (temp) => set({ temperature: temp }),
    setSplitSize: (size) => set({ splitSize: size }),
    setPrompt: (prompt) => set({ prompt }),
  })
)
