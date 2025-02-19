import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  hydrateStore: () => void
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  persist(
    (set) => ({
      temperature: 0.6,
      splitSize: 500,
      prompt: "",
      setTemperature: (temp) => set({ temperature: temp }),
      setSplitSize: (size) => set({ splitSize: size }),
      setPrompt: (prompt) => set({ prompt }),
      hydrateStore: () => {
        const storedAdvancedSettingsData = localStorage.getItem('advanced-settings');
        if (storedAdvancedSettingsData) {
          const parsedData = JSON.parse(storedAdvancedSettingsData);
          set(parsedData)
        }
      },
    }),
    {
      name: 'advanced-settings',
    }
  )
)
