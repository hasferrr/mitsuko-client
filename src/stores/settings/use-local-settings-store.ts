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
  isSubtitleCleanupEnabled: boolean
  isDeleteAfterTranscription: boolean
  isSubtitlePerformanceModeEnabled: boolean
  isAutoEnableProjectSettings: boolean
  isLegacyCreateBehavior: boolean
  dismissedDialogs: Record<string, boolean>

  addApiConfig: (config: CustomApiConfig) => void
  updateApiConfig: (index: number, updates: Partial<CustomApiConfig>) => Promise<void>
  removeApiConfig: (index: number) => void
  selectApiConfig: (index: number | null) => void

  toggleThirdPartyModel: () => void
  setIsAutoTemperatureEnabled: (enabled: boolean) => void
  setIsSubtitleCleanupEnabled: (enabled: boolean) => void
  setIsDeleteAfterTranscription: (enabled: boolean) => void
  setIsSubtitlePerformanceModeEnabled: (enabled: boolean) => void
  setIsAutoEnableProjectSettings: (enabled: boolean) => void
  setIsLegacyCreateBehavior: (enabled: boolean) => void
  dismissDialog: (id: string) => void
  resetAllDismissedDialogs: () => void
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
  persist(
    (set) => ({
      customApiConfigs: [],
      selectedApiConfigIndex: null,
      isThirdPartyModelEnabled: false,
      isAutoTemperatureEnabled: true,
      isSubtitleCleanupEnabled: true,
      isDeleteAfterTranscription: true,
      isSubtitlePerformanceModeEnabled: true,
      isAutoEnableProjectSettings: false,
      isLegacyCreateBehavior: false,
      dismissedDialogs: {},

      addApiConfig: (config) =>
        set((state) => ({
          customApiConfigs: [...state.customApiConfigs, config],
        })),

      updateApiConfig: async (index, updates) => {
        set((state) => {
          const newConfigs = [...state.customApiConfigs]
          if (newConfigs[index]) {
            newConfigs[index] = { ...newConfigs[index], ...updates }
          }
          return { customApiConfigs: newConfigs }
        })
      },

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

      toggleThirdPartyModel: () => set((state) => ({ isThirdPartyModelEnabled: !state.isThirdPartyModelEnabled })),
      setIsAutoTemperatureEnabled: (enabled) => set({ isAutoTemperatureEnabled: enabled }),
      setIsSubtitleCleanupEnabled: (enabled) => set({ isSubtitleCleanupEnabled: enabled }),
      setIsDeleteAfterTranscription: (enabled) => set({ isDeleteAfterTranscription: enabled }),
      setIsSubtitlePerformanceModeEnabled: (enabled) => set({ isSubtitlePerformanceModeEnabled: enabled }),
      setIsAutoEnableProjectSettings: (enabled) => set({ isAutoEnableProjectSettings: enabled }),
      setIsLegacyCreateBehavior: (enabled) => set({ isLegacyCreateBehavior: enabled }),
      dismissDialog: (id) => set((state) => ({ dismissedDialogs: { ...state.dismissedDialogs, [id]: true } })),
      resetAllDismissedDialogs: () => set({ dismissedDialogs: {} }),
    }),
    {
      name: "api-settings-storage",
      version: 4,
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

        if (version === 1) {
          const state = persistedState as {
            deleteAfterTranscription?: boolean
            isDeleteAfterTranscription?: boolean
          }

          if (
            typeof state.deleteAfterTranscription === "boolean" &&
            typeof state.isDeleteAfterTranscription !== "boolean"
          ) {
            state.isDeleteAfterTranscription = state.deleteAfterTranscription
            delete state.deleteAfterTranscription
          }
        }

        if (version < 3) {
          const state = persistedState as { dismissedDialogs?: Record<string, boolean> }
          if (!state.dismissedDialogs) {
            state.dismissedDialogs = {}
          }
        }

        if (version < 4) {
          const state = persistedState as { isLegacyCreateBehavior?: boolean }
          if (typeof state.isLegacyCreateBehavior !== "boolean") {
            state.isLegacyCreateBehavior = false
          }
        }

        return persistedState
      },
    }
  )
)