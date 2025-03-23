import { create } from "zustand"
import { AdvancedSettings, ProjectType } from "@/types/project"
import { persist } from "zustand/middleware"
import { useTranslationDataStore } from "./use-translation-data-store"
import { createAdvancedSettings, updateAdvancedSettings, getAdvancedSettings } from "@/lib/db/settings"
import { useSettingsStore } from "./use-settings-store"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { useExtractionDataStore } from "./use-extraction-data-store"

interface AdvancedSettingsStore {
  data: Record<string, AdvancedSettings>
  currentId: string | null
  setCurrentId: (id: string) => void
  upsertData: (id: string, value: AdvancedSettings) => void
  mutateData: (key: keyof AdvancedSettings, value: any) => void
  saveData: () => Promise<void>
  getTemperature: () => number
  getMaxCompletionTokens: () => number
  getIsMaxCompletionTokensAuto: () => boolean
  getSplitSize: () => number
  getStartIndex: () => number
  getEndIndex: () => number
  getIsUseStructuredOutput: () => boolean
  getIsUseFullContextMemory: () => boolean
  getIsBetterContextCaching: () => boolean
  setTemperature: (value: number) => void
  setStartIndex: (value: number) => void
  setEndIndex: (value: number) => void
  setSplitSize: (value: number) => void
  setMaxCompletionTokens: (value: number, type: ProjectType) => void
  setIsUseStructuredOutput: (value: boolean) => void
  setIsUseFullContextMemory: (value: boolean) => void
  setIsBetterContextCaching: (value: boolean) => void
  setIsMaxCompletionTokensAuto: (value: boolean, type: ProjectType) => void
  resetIndex: (s?: number, e?: number) => void
  resetAdvancedSettings: () => void
}

const updateSettings = async <K extends keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: AdvancedSettings[K],
  type: ProjectType = 'translation'
) => {
  const store = type === 'translation' ? useTranslationDataStore : useExtractionDataStore
  const currentId = store.getState().currentId
  if (!currentId) return
  const data = store.getState().data[currentId]
  if (!data) return

  // Get or create advanced settings
  let advancedSettings = data.advancedSettingsId
    ? await getAdvancedSettings(data.advancedSettingsId)
    : null

  if (!advancedSettings) {
    advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
    store.getState().mutateData(currentId, "advancedSettingsId", advancedSettings.id)
  }

  // Update the settings
  await updateAdvancedSettings(advancedSettings.id, { [field]: value })
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  persist(
    (set, get) => ({
      data: {},
      currentId: null,
      setCurrentId: (id) => set({ currentId: id }),
      getTemperature: () => {
        const id = get().currentId
        return id ? get().data[id]?.temperature : DEFAULT_ADVANCED_SETTINGS.temperature
      },
      getMaxCompletionTokens: () => {
        const id = get().currentId
        return id ? get().data[id]?.maxCompletionTokens : DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens
      },
      getIsMaxCompletionTokensAuto: () => {
        const id = get().currentId
        return id ? get().data[id]?.isMaxCompletionTokensAuto : DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto
      },
      getSplitSize: () => {
        const id = get().currentId
        return id ? get().data[id]?.splitSize : DEFAULT_ADVANCED_SETTINGS.splitSize
      },
      getStartIndex: () => {
        const id = get().currentId
        return id ? get().data[id]?.startIndex : DEFAULT_ADVANCED_SETTINGS.startIndex
      },
      getEndIndex: () => {
        const id = get().currentId
        return id ? get().data[id]?.endIndex : DEFAULT_ADVANCED_SETTINGS.endIndex
      },
      getIsUseStructuredOutput: () => {
        const id = get().currentId
        return id ? get().data[id]?.isUseStructuredOutput : DEFAULT_ADVANCED_SETTINGS.isUseStructuredOutput
      },
      getIsUseFullContextMemory: () => {
        const id = get().currentId
        return id ? get().data[id]?.isUseFullContextMemory : DEFAULT_ADVANCED_SETTINGS.isUseFullContextMemory
      },
      getIsBetterContextCaching: () => {
        const id = get().currentId
        return id ? get().data[id]?.isBetterContextCaching : DEFAULT_ADVANCED_SETTINGS.isBetterContextCaching
      },
      upsertData: (id, value) => set(state => ({
        ...state,
        data: {
          ...state.data,
          [id]: value
        }
      })),
      mutateData: (key, value) => {
        const id = get().currentId
        if (!id) return
        set(state => {
          const data = state.data[id]
          if (!data) return state
          return {
            ...state,
            data: {
              ...state.data,
              [id]: {
                ...data,
                [key]: value
              }
            }
          }
        })
      },
      saveData: async () => {
        const id = get().currentId
        if (!id) return
        const settings = get().data[id]
        if (!settings) {
          console.error("Settings not found in store")
          return
        }
        try {
          await updateAdvancedSettings(id, settings)
        } catch (error) {
          console.error("Failed to save settings data:", error)
        }
      },
      setTemperature: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("temperature", value)
        updateSettings("temperature", value)
      },
      setStartIndex: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("startIndex", value)
        updateSettings("startIndex", value)
      },
      setEndIndex: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("endIndex", value)
        updateSettings("endIndex", value)
      },
      setSplitSize: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("splitSize", value)
        updateSettings("splitSize", value)
      },
      // Method for both translation and extraction
      setMaxCompletionTokens: (value, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("maxCompletionTokens", value)
        updateSettings("maxCompletionTokens", value, type)
      },
      setIsUseStructuredOutput: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseStructuredOutput", value)
        updateSettings("isUseStructuredOutput", value)
      },
      setIsUseFullContextMemory: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseFullContextMemory", value)
        updateSettings("isUseFullContextMemory", value)
      },
      setIsBetterContextCaching: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isBetterContextCaching", value)
        updateSettings("isBetterContextCaching", value)
      },
      // Method for both translation and extraction
      setIsMaxCompletionTokensAuto: (value, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isMaxCompletionTokensAuto", value)
        updateSettings("isMaxCompletionTokensAuto", value, type)
      },
      resetIndex: (s?: number, e?: number) => {
        const id = get().currentId
        if (!id) return
        const translationData = useTranslationDataStore.getState().data[id]
        const subtitles = translationData?.subtitles ?? []

        const startIndex = s || 1
        const endIndex = e || (subtitles.length || 100000)

        const store = get()

        // Update both indices in the data record
        store.mutateData("startIndex", startIndex)
        store.mutateData("endIndex", endIndex)

        // Update both indices in the database
        updateSettings("startIndex", startIndex)
        updateSettings("endIndex", endIndex)
      },
      resetAdvancedSettings: () => {
        const id = get().currentId
        if (!id) return

        const settingsCurrentId = useSettingsStore.getState().currentId
        const settingsData = useSettingsStore.getState().data
        const modelDetail = settingsCurrentId ? settingsData[settingsCurrentId]?.modelDetail ?? null : null
        const isUseCustomModel = settingsCurrentId ? settingsData[settingsCurrentId]?.isUseCustomModel ?? false : false

        // Start with DEFAULT_ADVANCED_SETTINGS
        const newSettings: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'> = {
          ...DEFAULT_ADVANCED_SETTINGS,
          isUseStructuredOutput: isUseCustomModel
            ? true
            : modelDetail?.structuredOutput ?? true,
        }

        // Apply model defaults if available
        if (modelDetail?.default) {
          if (modelDetail.default.maxCompletionTokens !== undefined) {
            newSettings.maxCompletionTokens = modelDetail.default.maxCompletionTokens
          }
          if (modelDetail.default.isMaxCompletionTokensAuto !== undefined) {
            newSettings.isMaxCompletionTokensAuto = modelDetail.default.isMaxCompletionTokensAuto
          }
          if (modelDetail.default.isUseStructuredOutput !== undefined) {
            newSettings.isUseStructuredOutput = modelDetail.default.isUseStructuredOutput
          }
        }

        const store = get()

        // Update all settings in the data record
        Object.entries(newSettings).forEach(([key, value]) => {
          store.mutateData(key as keyof AdvancedSettings, value)
        })

        // Update all settings in the database
        Object.entries(newSettings).forEach(([key, value]) => {
          updateSettings(key as keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>, value)
        })
      },
    }),
    {
      name: "advanced-settings-storage",
    }
  )
)
