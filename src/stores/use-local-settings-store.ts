import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LocalSettingsStore {
  apiKey: string
  customBaseUrl: string
  customModel: string
  isThirdPartyModelEnabled: boolean
  isFeedbackEnabled: boolean
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  toggleThirdPartyModel: () => void
  toggleFeedbackHidden: () => void
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
  persist(
    (set) => ({
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      isThirdPartyModelEnabled: false,
      isFeedbackEnabled: true,
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      toggleThirdPartyModel: () =>
        set((state) => ({ isThirdPartyModelEnabled: !state.isThirdPartyModelEnabled })),
      toggleFeedbackHidden: () =>
        set((state) => ({ isFeedbackEnabled: !state.isFeedbackEnabled })),
    }),
    {
      name: "api-settings-storage",
    }
  )
)