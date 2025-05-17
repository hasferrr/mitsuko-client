import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ApiSettingsStore {
  apiKey: string
  customBaseUrl: string
  customModel: string
  isThirdPartyModelEnabled: boolean
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  toggleThirdPartyModel: () => void
}

export const useApiSettingsStore = create<ApiSettingsStore>()(
  persist(
    (set) => ({
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      isThirdPartyModelEnabled: false,
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      toggleThirdPartyModel: () =>
        set((state) => ({ isThirdPartyModelEnabled: !state.isThirdPartyModelEnabled })),
    }),
    {
      name: "api-settings-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        customBaseUrl: state.customBaseUrl,
        customModel: state.customModel,
        isThirdPartyModelEnabled: state.isThirdPartyModelEnabled,
      }),
    }
  )
)