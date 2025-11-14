import { create } from "zustand"
import { AdvancedSettings } from "@/types/project"
import { Model } from "@/types/model"
import { useTranslationDataStore } from "../data/use-translation-data-store"
import {
  updateAdvancedSettings,
  getAllAdvancedSettings,
  getAdvancedSettings,
} from "@/lib/db/settings"
import { useSettingsStore } from "./use-settings-store"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { GLOBAL_ADVANCED_SETTINGS_ID } from "@/constants/global-settings"

type AdvancedKey = keyof Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">

const ADVANCED_KEYS = [
  "temperature",
  "splitSize",
  "startIndex",
  "endIndex",
  "isMaxCompletionTokensAuto",
  "maxCompletionTokens",
  "isUseStructuredOutput",
  "isUseFullContextMemory",
  "isBetterContextCaching",
] as const

type MissingAdvancedKey = Exclude<AdvancedKey, (typeof ADVANCED_KEYS)[number]>
const _assertAllAdvancedKeysPresent: MissingAdvancedKey extends never ? true : never = true
void _assertAllAdvancedKeysPresent

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
  ) => void
  resetIndex: (
    id: string,
    s: number | null,
    e: number | null,
  ) => void
  resetAdvancedSettings: (
    advancedSettingsId: string,
    basicSettingsId: string,
  ) => void
  applyModelDefaults: (
    newSettingsInput: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
    modelDetail: Model | null
  ) => Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>
  copyAdvancedSettingsKeys: <K extends keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>(
    fromId: string,
    toId: string,
    keys: K[],
  ) => Promise<void>
  resetAdvancedSettingsToGlobal: (id: string) => Promise<void>
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
      setAdvancedSettingsValue: (id, key, value) => {
        get().mutateData(id, key, value)
        get().saveData(id)
      },
      resetIndex: (id, s, e) => {
        const translationData = useTranslationDataStore.getState().data[id]
        const subtitles = translationData?.subtitles ?? []

        const startIndex = s || 1
        const endIndex = e || (subtitles.length || 100000)

        const store = get()

        // Update both indices in the data record
        store.mutateData(id, "startIndex", startIndex)
        store.mutateData(id, "endIndex", endIndex)

        get().saveData(id)
      },
      resetAdvancedSettings: (advancedSettingsId, basicSettingsId) => {
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

        get().saveData(advancedSettingsId)
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
      copyAdvancedSettingsKeys: async <K extends keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>(
        fromId: string,
        toId: string,
        keys: K[],
      ) => {
        if (!keys || keys.length === 0) return
        // Load source/target into store if missing
        let from = get().data[fromId]
        if (!from) {
          try {
            const fetched = await getAdvancedSettings(fromId)
            if (fetched) {
              get().upsertData(fetched.id, fetched)
              from = fetched
            }
          } catch (e) {
            console.error("Failed to fetch source advanced settings", fromId, e)
          }
        }
        if (!from) {
          console.error("Source advanced settings not found in store or DB", fromId)
          return
        }
        let to = get().data[toId]
        if (!to) {
          try {
            const fetched = await getAdvancedSettings(toId)
            if (fetched) {
              get().upsertData(fetched.id, fetched)
              to = fetched
            }
          } catch (e) {
            console.error("Failed to fetch target advanced settings", toId, e)
          }
        }
        if (!to) {
          console.error("Target advanced settings not found in store or DB", toId)
          return
        }

        // Update selected keys in-memory
        set(state => {
          const current = state.data[toId]
          if (!current) return state
          const updated: AdvancedSettings = { ...current }
          keys.forEach((k) => {
            updated[k] = from[k]
          })
          return {
            ...state,
            data: {
              ...state.data,
              [toId]: updated,
            }
          }
        })

        // Persist to DB
        await get().saveData(toId)
      },
      resetAdvancedSettingsToGlobal: async (id: string) => {
        const keys: AdvancedKey[] = [...ADVANCED_KEYS]
        await get().copyAdvancedSettingsKeys(GLOBAL_ADVANCED_SETTINGS_ID, id, keys)
      },
    }
  )
)
