import { create } from "zustand"
import { AdvancedSettings, SettingsParentType } from "@/types/project"
import { Model } from "@/types/model"
import { useTranslationDataStore } from "../data/use-translation-data-store"
import { createAdvancedSettings, updateAdvancedSettings, getAdvancedSettings } from "@/lib/db/settings"
import { useSettingsStore } from "./use-settings-store"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { useExtractionDataStore } from "../data/use-extraction-data-store"
import { useProjectStore } from "../data/use-project-store"

interface AdvancedSettingsStore {
  data: Record<string, AdvancedSettings>
  currentId: string | null
  setCurrentId: (id: string) => void
  upsertData: (id: string, value: AdvancedSettings) => void
  mutateData: <T extends keyof AdvancedSettings>(key: T, value: AdvancedSettings[T]) => void
  saveData: () => Promise<void>
  getAdvancedSettings: () => AdvancedSettings | null
  getTemperature: () => number
  getMaxCompletionTokens: () => number
  getIsMaxCompletionTokensAuto: () => boolean
  getSplitSize: () => number
  getStartIndex: () => number
  getEndIndex: () => number
  getIsUseStructuredOutput: () => boolean
  getIsUseFullContextMemory: () => boolean
  getIsBetterContextCaching: () => boolean
  getIsAdvancedReasoningEnabled: () => boolean
  setTemperature: (value: number, parent: SettingsParentType) => void
  setStartIndex: (value: number) => void
  setEndIndex: (value: number) => void
  setSplitSize: (value: number) => void
  setMaxCompletionTokens: (value: number, parent: SettingsParentType) => void
  setIsUseStructuredOutput: (value: boolean) => void
  setIsUseFullContextMemory: (value: boolean) => void
  setIsBetterContextCaching: (value: boolean) => void
  setIsAdvancedReasoningEnabled: (value: boolean, parent: SettingsParentType) => void
  setIsMaxCompletionTokensAuto: (value: boolean, parent: SettingsParentType) => void
  resetIndex: (s?: number, e?: number) => void
  resetAdvancedSettings: () => void
  applyModelDefaults: (
    newSettingsInput: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
    modelDetail: Model | null
  ) => Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>
}

const updateSettings = async <K extends keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: AdvancedSettings[K],
  parent: SettingsParentType,
) => {
  let advancedSettings: AdvancedSettings | null = null

  if (parent === 'translation') {
    const store = useTranslationDataStore
    const currentId = store.getState().currentId
    if (!currentId) return
    const data = store.getState().data[currentId]
    if (!data) return
    advancedSettings = data.advancedSettingsId
      ? await getAdvancedSettings(data.advancedSettingsId) ?? null
      : null
    if (!advancedSettings) {
      advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
      store.getState().mutateData(currentId, "advancedSettingsId", advancedSettings.id)
    }
  }

  if (parent === 'extraction') {
    const store = useExtractionDataStore
    const currentId = store.getState().currentId
    if (!currentId) return
    const data = store.getState().data[currentId]
    if (!data) return
    advancedSettings = data.advancedSettingsId
      ? await getAdvancedSettings(data.advancedSettingsId) ?? null
      : null
    if (!advancedSettings) {
      advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
      store.getState().mutateData(currentId, "advancedSettingsId", advancedSettings.id)
    }
  }

  if (parent === 'project') {
    const store = useProjectStore
    const data = store.getState().currentProject
    if (!data) return
    advancedSettings = data.defaultAdvancedSettingsId
      ? await getAdvancedSettings(data.defaultAdvancedSettingsId) ?? null
      : null
    if (!advancedSettings) {
      advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
      store.getState().updateProject(data.id, { defaultAdvancedSettingsId: advancedSettings.id })
    }
  }

  // Update the settings
  if (advancedSettings) {
    await updateAdvancedSettings(advancedSettings.id, { [field]: value })
  }
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  (set, get) => (
    {
      data: {},
      currentId: null,
      setCurrentId: (id) => set({ currentId: id }),
      getAdvancedSettings: () => {
        const id = get().currentId
        return id ? get().data[id] ?? null : null
      },
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
      getIsAdvancedReasoningEnabled: () => {
        const id = get().currentId
        return id ? get().data[id]?.isAdvancedReasoningEnabled : DEFAULT_ADVANCED_SETTINGS.isAdvancedReasoningEnabled
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
      setTemperature: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("temperature", value)
        updateSettings("temperature", value, parent)
      },
      setStartIndex: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("startIndex", value)
        updateSettings("startIndex", value, "translation")
      },
      setEndIndex: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("endIndex", value)
        updateSettings("endIndex", value, "translation")
      },
      setSplitSize: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("splitSize", value)
        updateSettings("splitSize", value, "translation")
      },
      // Method for both translation and extraction
      setMaxCompletionTokens: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("maxCompletionTokens", value)
        updateSettings("maxCompletionTokens", value, parent)
      },
      setIsUseStructuredOutput: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseStructuredOutput", value)
        updateSettings("isUseStructuredOutput", value, "translation")
      },
      setIsUseFullContextMemory: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseFullContextMemory", value)
        updateSettings("isUseFullContextMemory", value, "translation")
      },
      setIsBetterContextCaching: (value) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isBetterContextCaching", value)
        updateSettings("isBetterContextCaching", value, "translation")
      },
      setIsAdvancedReasoningEnabled: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isAdvancedReasoningEnabled", value)
        updateSettings("isAdvancedReasoningEnabled", value, parent)
      },
      // Method for both translation and extraction
      setIsMaxCompletionTokensAuto: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isMaxCompletionTokensAuto", value)
        updateSettings("isMaxCompletionTokensAuto", value, parent)
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
        updateSettings("startIndex", startIndex, "translation")
        updateSettings("endIndex", endIndex, "translation")
      },
      resetAdvancedSettings: () => {
        const id = get().currentId
        if (!id) return

        const settingsCurrentId = useSettingsStore.getState().currentId
        const settingsData = useSettingsStore.getState().data
        const modelDetail = settingsCurrentId ? settingsData[settingsCurrentId]?.modelDetail ?? null : null
        const isUseCustomModel = settingsCurrentId ? settingsData[settingsCurrentId]?.isUseCustomModel ?? false : false

        // Start with DEFAULT_ADVANCED_SETTINGS
        let newSettings: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'> = {
          ...DEFAULT_ADVANCED_SETTINGS,
          isUseStructuredOutput: isUseCustomModel
            ? true
            : modelDetail?.structuredOutput ?? true,
        }

        // Apply model defaults if available
        newSettings = get().applyModelDefaults(newSettings, modelDetail)

        const store = get()

        // Update all settings in the data record
        Object.entries(newSettings).forEach(([key, value]) => {
          store.mutateData(key as keyof AdvancedSettings, value)
        })

        // Update all settings in the database
        Object.entries(newSettings).forEach(([key, value]) => {
          updateSettings(key as keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>, value, "translation")
        })
      },
      applyModelDefaults: (
        newSettingsInput: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
        modelDetail: Model | null
      ): Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'> => {
        const updatedSettings = { ...newSettingsInput }
        if (modelDetail?.default) {
          // if (modelDetail.default.temperature !== undefined) {
          //   updatedSettings.temperature = modelDetail.default.temperature
          // }
          if (modelDetail.default.maxCompletionTokens !== undefined) {
            updatedSettings.maxCompletionTokens = modelDetail.default.maxCompletionTokens
          }
          if (modelDetail.default.isMaxCompletionTokensAuto !== undefined) {
            updatedSettings.isMaxCompletionTokensAuto = modelDetail.default.isMaxCompletionTokensAuto
          }
          if (modelDetail.default.isUseStructuredOutput !== undefined) {
            updatedSettings.isUseStructuredOutput = modelDetail.default.isUseStructuredOutput
          }
        }
        return updatedSettings
      },
    }
  )
)
