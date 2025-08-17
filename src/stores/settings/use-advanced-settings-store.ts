import { create } from "zustand"
import { AdvancedSettings, SettingsParentType } from "@/types/project"
import { Model } from "@/types/model"
import { useTranslationDataStore } from "../data/use-translation-data-store"
import {
  createAdvancedSettings,
  updateAdvancedSettings,
  getAdvancedSettings,
  getAllAdvancedSettings,
} from "@/lib/db/settings"
import { useSettingsStore } from "./use-settings-store"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { useExtractionDataStore } from "../data/use-extraction-data-store"
import { useProjectStore } from "../data/use-project-store"

interface AdvancedSettingsStore {
  data: Record<string, AdvancedSettings>
  loadSettings: () => Promise<void>
  upsertData: (id: string, value: AdvancedSettings) => void
  mutateData: <T extends keyof AdvancedSettings>(id: string, key: T, value: AdvancedSettings[T]) => void
  saveData: (id: string) => Promise<void>
  getAdvancedSettings: (id: string) => AdvancedSettings | null
  getTemperature: (id: string) => number
  getMaxCompletionTokens: (id: string) => number
  getIsMaxCompletionTokensAuto: (id: string) => boolean
  getSplitSize: (id: string) => number
  getStartIndex: (id: string) => number
  getEndIndex: (id: string) => number
  getIsUseStructuredOutput: (id: string) => boolean
  getIsUseFullContextMemory: (id: string) => boolean
  getIsBetterContextCaching: (id: string) => boolean
  setAdvancedSettingsValue: (
    id: string,
    key: keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
    value: AdvancedSettings[keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>],
    parent: SettingsParentType
  ) => void
  resetIndex: (
    id: string,
    s: number | null,
    e: number | null,
    parent: SettingsParentType,
  ) => void
  resetAdvancedSettings: (
    advancedSettingsId: string,
    basicSettingsId: string,
    parent: SettingsParentType,
  ) => void
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
      loadSettings: async () => {
        try {
          const list = await getAllAdvancedSettings()
          const mapped = Object.fromEntries(list.map(s => [s.id, s])) as Record<string, AdvancedSettings>
          set(state => ({ ...state, data: { ...state.data, ...mapped } }))
        } catch (error) {
          console.error("Failed to load advanced settings", error)
        }
      },
      getAdvancedSettings: (id) => {
        return get().data[id] ?? null
      },
      getTemperature: (id) => {
        return get().data[id]?.temperature ?? DEFAULT_ADVANCED_SETTINGS.temperature
      },
      getMaxCompletionTokens: (id) => {
        return get().data[id]?.maxCompletionTokens ?? DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens
      },
      getIsMaxCompletionTokensAuto: (id) => {
        return get().data[id]?.isMaxCompletionTokensAuto ?? DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto
      },
      getSplitSize: (id) => {
        return get().data[id]?.splitSize ?? DEFAULT_ADVANCED_SETTINGS.splitSize
      },
      getStartIndex: (id) => {
        return get().data[id]?.startIndex ?? DEFAULT_ADVANCED_SETTINGS.startIndex
      },
      getEndIndex: (id) => {
        return get().data[id]?.endIndex ?? DEFAULT_ADVANCED_SETTINGS.endIndex
      },
      getIsUseStructuredOutput: (id) => {
        return get().data[id]?.isUseStructuredOutput ?? DEFAULT_ADVANCED_SETTINGS.isUseStructuredOutput
      },
      getIsUseFullContextMemory: (id) => {
        return get().data[id]?.isUseFullContextMemory ?? DEFAULT_ADVANCED_SETTINGS.isUseFullContextMemory
      },
      getIsBetterContextCaching: (id) => {
        return get().data[id]?.isBetterContextCaching ?? DEFAULT_ADVANCED_SETTINGS.isBetterContextCaching
      },
      upsertData: (id, value) => set(state => ({
        ...state,
        data: {
          ...state.data,
          [id]: value
        }
      })),
      mutateData: (id, key, value) => {
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
      saveData: async (id) => {
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
      setAdvancedSettingsValue: (id, key, value, parent) => {
        get().mutateData(id, key, value)
        updateSettings(key, value, parent)
      },
      resetIndex: (id, s, e, parent) => {
        const translationData = useTranslationDataStore.getState().data[id]
        const subtitles = translationData?.subtitles ?? []

        const startIndex = s || 1
        const endIndex = e || (subtitles.length || 100000)

        const store = get()

        // Update both indices in the data record
        store.mutateData(id, "startIndex", startIndex)
        store.mutateData(id, "endIndex", endIndex)

        // Update both indices in the database
        updateSettings("startIndex", startIndex, parent)
        updateSettings("endIndex", endIndex, parent)
      },
      resetAdvancedSettings: (advancedSettingsId, basicSettingsId, parent) => {
        const settingsData = useSettingsStore.getState().data
        const modelDetail = settingsData[basicSettingsId]?.modelDetail ?? null
        const isUseCustomModel = settingsData[basicSettingsId]?.isUseCustomModel ?? false

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
          store.mutateData(advancedSettingsId, key as keyof AdvancedSettings, value)
        })

        // Update all settings in the database
        Object.entries(newSettings).forEach(([key, value]) => {
          updateSettings(key as keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>, value, parent)
        })
      },
      applyModelDefaults: (newSettingsInput, modelDetail) => {
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
