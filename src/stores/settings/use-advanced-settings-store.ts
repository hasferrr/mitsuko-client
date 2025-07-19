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
  setStartIndex: (value: number, parent: SettingsParentType) => void
  setEndIndex: (value: number, parent: SettingsParentType) => void
  setSplitSize: (value: number, parent: SettingsParentType) => void
  setMaxCompletionTokens: (value: number, parent: SettingsParentType) => void
  setIsUseStructuredOutput: (value: boolean, parent: SettingsParentType) => void
  setIsUseFullContextMemory: (value: boolean, parent: SettingsParentType) => void
  setIsBetterContextCaching: (value: boolean, parent: SettingsParentType) => void
  setIsAdvancedReasoningEnabled: (value: boolean, parent: SettingsParentType) => void
  setIsMaxCompletionTokensAuto: (value: boolean, parent: SettingsParentType) => void
  resetIndex: (
    s: number | null,
    e: number | null,
    parent: SettingsParentType,
  ) => void
  resetAdvancedSettings: (parent: SettingsParentType) => void
  applyModelDefaults: (
    newSettingsInput: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
    modelDetail: Model | null
  ) => Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>
}

const getOrCreateAdvancedSettings = async <T>(
  store: { getState: () => { currentId: string | null; data: Record<string, T> } },
  currentId: string | null,
  getSettingsId: (data: T) => string | null | undefined,
  createAndUpdate: (newSettings: AdvancedSettings) => void
): Promise<AdvancedSettings | null> => {
  if (!currentId) return null
  const data = store.getState().data[currentId]
  if (!data) return null

  let advancedSettings = getSettingsId(data)
    ? await getAdvancedSettings(getSettingsId(data)!) ?? null
    : null

  if (!advancedSettings) {
    advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
    createAndUpdate(advancedSettings)
  }

  return advancedSettings
}

const updateSettings = async <K extends keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: AdvancedSettings[K],
  parent: SettingsParentType,
) => {
  try {
    let advancedSettings: AdvancedSettings | null = null

    if (parent === 'translation') {
      const store = useTranslationDataStore
      const currentId = store.getState().currentId
      advancedSettings = await getOrCreateAdvancedSettings(
        store,
        currentId,
        (data) => data.advancedSettingsId,
        (newSettings) => store.getState().mutateData(currentId!, "advancedSettingsId", newSettings.id)
      )
    } else if (parent === 'extraction') {
      const store = useExtractionDataStore
      const currentId = store.getState().currentId
      advancedSettings = await getOrCreateAdvancedSettings(
        store,
        currentId,
        (data) => data.advancedSettingsId,
        (newSettings) => store.getState().mutateData(currentId!, "advancedSettingsId", newSettings.id)
      )
    } else if (parent === 'project') {
      const store = useProjectStore
      const data = store.getState().currentProject
      if (!data) return

      const advancedSettingsId = data.defaultAdvancedSettingsId
      advancedSettings = advancedSettingsId
        ? await getAdvancedSettings(advancedSettingsId) ?? null
        : null

      if (!advancedSettings) {
        advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
        store.getState().updateProject(data.id, { defaultAdvancedSettingsId: advancedSettings.id })
      }
    }

    if (advancedSettings) {
      await updateAdvancedSettings(advancedSettings.id, { [field]: value })
    }
  } catch (error) {
    console.error(`Failed to update advanced settings for ${parent}:`, error)
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
      setStartIndex: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("startIndex", value)
        updateSettings("startIndex", value, parent)
      },
      setEndIndex: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("endIndex", value)
        updateSettings("endIndex", value, parent)
      },
      setSplitSize: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("splitSize", value)
        updateSettings("splitSize", value, parent)
      },
      // Method for both translation and extraction
      setMaxCompletionTokens: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("maxCompletionTokens", value)
        updateSettings("maxCompletionTokens", value, parent)
      },
      setIsUseStructuredOutput: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseStructuredOutput", value)
        updateSettings("isUseStructuredOutput", value, parent)
      },
      setIsUseFullContextMemory: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseFullContextMemory", value)
        updateSettings("isUseFullContextMemory", value, parent)
      },
      setIsBetterContextCaching: (value, parent) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isBetterContextCaching", value)
        updateSettings("isBetterContextCaching", value, parent)
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
      resetIndex: (s, e, parent) => {
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
        updateSettings("startIndex", startIndex, parent)
        updateSettings("endIndex", endIndex, parent)
      },
      resetAdvancedSettings: (parent) => {
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
          updateSettings(key as keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>, value, parent)
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
