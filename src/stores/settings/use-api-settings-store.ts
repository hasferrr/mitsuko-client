import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ApiSettingsStore {
  apiKey: string
  customBaseUrl: string
  customModel: string
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
}

export const useApiSettingsStore = create<ApiSettingsStore>()(
  persist(
    (set) => ({
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
    }),
    {
      name: "api-settings-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        customBaseUrl: state.customBaseUrl,
        customModel: state.customModel,
      }),
    }
  )
)