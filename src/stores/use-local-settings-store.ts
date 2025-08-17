import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CustomApiConfig {
  apiKey: string
  customBaseUrl: string
  customModel: string
}

interface LocalSettingsStore {
  customApiConfigs: CustomApiConfig[]
  selectedApiConfigIndex: number | null
  isThirdPartyModelEnabled: boolean
  isAutoTemperatureEnabled: boolean
  deleteAfterTranscription: boolean

  addApiConfig: (config: CustomApiConfig) => void
  updateApiConfig: (index: number, updates: Partial<CustomApiConfig>) => Promise<void>
  removeApiConfig: (index: number) => void
  selectApiConfig: (index: number | null) => void

  toggleThirdPartyModel: () => void
  setIsAutoTemperatureEnabled: (enabled: boolean) => void
  setDeleteAfterTranscription: (enabled: boolean) => void
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
  persist(
    (set) => ({
      customApiConfigs: [],
      selectedApiConfigIndex: null,
      isThirdPartyModelEnabled: false,
      isAutoTemperatureEnabled: true,
      deleteAfterTranscription: true,

      addApiConfig: (config) =>
        set((state) => ({
          customApiConfigs: [...state.customApiConfigs, config],
        })),

      updateApiConfig: async (index, updates) =>
        set((state) => {
          const newConfigs = [...state.customApiConfigs]
          if (newConfigs[index]) {
            newConfigs[index] = { ...newConfigs[index], ...updates }
          }
          return { customApiConfigs: newConfigs }
        }),

      removeApiConfig: (index) =>
        set((state) => {
          const newConfigs = state.customApiConfigs.filter((_, i) => i !== index)
          let newSelectedIndex = state.selectedApiConfigIndex

          if (state.selectedApiConfigIndex === index) {
            newSelectedIndex = newConfigs.length > 0 ? newConfigs.length - 1 : null
          } else if (state.selectedApiConfigIndex !== null && state.selectedApiConfigIndex > index) {
            newSelectedIndex = state.selectedApiConfigIndex - 1
          }

          return {
            customApiConfigs: newConfigs,
            selectedApiConfigIndex: newSelectedIndex,
          }
        }),

      selectApiConfig: (index) => set({ selectedApiConfigIndex: index }),

      toggleThirdPartyModel: () =>
        set((state) => ({ isThirdPartyModelEnabled: !state.isThirdPartyModelEnabled })),

      setIsAutoTemperatureEnabled: (enabled) => set({ isAutoTemperatureEnabled: enabled }),
      setDeleteAfterTranscription: (enabled) => set({ deleteAfterTranscription: enabled }),
    }),
    {
      name: "api-settings-storage",
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const oldState = persistedState as {
            apiKey?: string
            customBaseUrl?: string
            customModel?: string
            customApiConfigs?: CustomApiConfig[]
            selectedApiConfigIndex?: number | null
          }
          if (oldState.apiKey || oldState.customBaseUrl || oldState.customModel) {
            const migratedConfig: CustomApiConfig = {
              apiKey: oldState.apiKey ?? "",
              customBaseUrl: oldState.customBaseUrl ?? "",
              customModel: oldState.customModel ?? "",
            }

            oldState.customApiConfigs = [migratedConfig]
            oldState.selectedApiConfigIndex = 0

            delete oldState.apiKey
            delete oldState.customBaseUrl
            delete oldState.customModel
          }
        }
        return persistedState
      },
    }
  )
)