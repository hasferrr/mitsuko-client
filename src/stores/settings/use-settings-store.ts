import { create } from "zustand"
import { Model } from "@/types/model"
import { BasicSettings } from "@/types/project"
import { persist } from "zustand/middleware"
import {
  updateBasicSettings,
  getAllBasicSettings,
  getBasicSettings,
} from "@/lib/db/settings"
import { DEFAULT_BASIC_SETTINGS } from "@/constants/default"

interface SettingsStore {
  data: Record<string, BasicSettings>
  loadSettings: () => Promise<void>
  upsertData: (id: string, value: BasicSettings) => void
  mutateData: <T extends keyof BasicSettings>(id: string, key: T, value: BasicSettings[T]) => void
  saveData: (id: string) => Promise<void>
  getBasicSettings: (id: string) => BasicSettings | null
  getSourceLanguage: (id: string) => string
  getTargetLanguage: (id: string) => string
  getModelDetail: (id: string) => Model | null
  getIsUseCustomModel: (id: string) => boolean
  getContextDocument: (id: string) => string
  getCustomInstructions: (id: string) => string
  getFewShot: (id: string) => BasicSettings['fewShot']
  getFewShotIsEnabled: (id: string) => boolean
  getFewShotValue: (id: string) => string
  getFewShotLinkedId: (id: string) => string
  getFewShotType: (id: string) => 'manual' | 'linked'
  getFewShotStartIndex: (id: string) => number | undefined
  getFewShotEndIndex: (id: string) => number | undefined
  resetBasicSettings: (id: string) => void
  setBasicSettingsValue: (
    id: string,
    key: keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>,
    value: BasicSettings[keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>],
  ) => void
  setIsFewShotEnabled: (id: string, isEnabled: boolean) => void
  setFewShotValue: (id: string, value: string) => void
  setFewShotLinkedId: (id: string, linkedId: string) => void
  setFewShotType: (id: string, type: 'manual' | 'linked') => void
  setFewShotStartIndex: (id: string, index: number) => void
  setFewShotEndIndex: (id: string, index: number) => void
  copyBasicSettingsKeys: <K extends keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>(
    fromId: string,
    toId: string,
    keys: K[],
  ) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      data: {},
      loadSettings: async () => {
        try {
          const list = await getAllBasicSettings()
          const mapped = Object.fromEntries(list.map(s => [s.id, s])) as Record<string, BasicSettings>
          set(state => ({ ...state, data: { ...state.data, ...mapped } }))
        } catch (error) {
          console.error("Failed to load settings", error)
        }
      },
      getBasicSettings: (id) => {
        return get().data[id] ?? null
      },
      getSourceLanguage: (id) => {
        return get().data[id]?.sourceLanguage ?? DEFAULT_BASIC_SETTINGS.sourceLanguage
      },
      getTargetLanguage: (id) => {
        return get().data[id]?.targetLanguage ?? DEFAULT_BASIC_SETTINGS.targetLanguage
      },
      getModelDetail: (id) => {
        return get().data[id]?.modelDetail ?? DEFAULT_BASIC_SETTINGS.modelDetail
      },
      getIsUseCustomModel: (id) => {
        return get().data[id]?.isUseCustomModel ?? DEFAULT_BASIC_SETTINGS.isUseCustomModel
      },
      getContextDocument: (id) => {
        return get().data[id]?.contextDocument ?? DEFAULT_BASIC_SETTINGS.contextDocument
      },
      getCustomInstructions: (id) => {
        return get().data[id]?.customInstructions ?? DEFAULT_BASIC_SETTINGS.customInstructions
      },
      getFewShot: (id) => {
        return get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
      },
      getFewShotIsEnabled: (id) => {
        return get().data[id]?.fewShot?.isEnabled ?? DEFAULT_BASIC_SETTINGS.fewShot.isEnabled
      },
      getFewShotValue: (id) => {
        return get().data[id]?.fewShot?.value ?? DEFAULT_BASIC_SETTINGS.fewShot.value
      },
      getFewShotLinkedId: (id) => {
        return get().data[id]?.fewShot?.linkedId ?? DEFAULT_BASIC_SETTINGS.fewShot.linkedId
      },
      getFewShotType: (id) => {
        return get().data[id]?.fewShot?.type ?? DEFAULT_BASIC_SETTINGS.fewShot.type
      },
      getFewShotStartIndex: (id) => {
        return get().data[id]?.fewShot?.fewShotStartIndex ?? DEFAULT_BASIC_SETTINGS.fewShot.fewShotStartIndex
      },
      getFewShotEndIndex: (id) => {
        return get().data[id]?.fewShot?.fewShotEndIndex ?? DEFAULT_BASIC_SETTINGS.fewShot.fewShotEndIndex
      },
      upsertData: (id, value) => {
        set(state => ({
          ...state,
          data: {
            ...state.data,
            [id]: value
          }
        }))
      },
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
          await updateBasicSettings(id, settings)
        } catch (error) {
          console.error("Failed to save settings data:", error)
        }
      },
      resetBasicSettings: (id) => {
        // Reset all basic settings fields back to DEFAULT_BASIC_SETTINGS and persist
        set(state => {
          const current = state.data[id]
          if (!current) return state
          return {
            ...state,
            data: {
              ...state.data,
              [id]: {
                ...current,
                ...DEFAULT_BASIC_SETTINGS,
              },
            },
          }
        })
        get().saveData(id)
      },
      setBasicSettingsValue: (id, key, value) => {
        get().mutateData(id, key, value)
        get().saveData(id)
      },
      setIsFewShotEnabled: (id, isEnabled) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, isEnabled }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      setFewShotValue: (id, value) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, value }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      setFewShotLinkedId: (id, linkedId) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, linkedId }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      setFewShotType: (id, type) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, type }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      setFewShotStartIndex: (id, index) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotStartIndex: index }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      setFewShotEndIndex: (id, index) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotEndIndex: index }
        get().mutateData(id, "fewShot", newFewShot)
        get().saveData(id)
      },
      copyBasicSettingsKeys: async <K extends keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>(fromId: string, toId: string, keys: K[]) => {
        if (!keys || keys.length === 0) return
        // Load source/target into store if missing
        let from = get().data[fromId]
        if (!from) {
          try {
            const fetched = await getBasicSettings(fromId)
            if (fetched) {
              get().upsertData(fetched.id, fetched)
              from = fetched
            }
          } catch (e) {
            console.error("Failed to fetch source basic settings", fromId, e)
          }
        }
        if (!from) {
          console.error("Source basic settings not found in store or DB", fromId)
          return
        }
        let to = get().data[toId]
        if (!to) {
          try {
            const fetched = await getBasicSettings(toId)
            if (fetched) {
              get().upsertData(fetched.id, fetched)
              to = fetched
            }
          } catch (e) {
            console.error("Failed to fetch target basic settings", toId, e)
          }
        }
        if (!to) {
          console.error("Target basic settings not found in store or DB", toId)
          return
        }

        // Update selected keys in-memory
        set(state => {
          const current = state.data[toId]
          if (!current) return state
          const updated: BasicSettings = { ...current }
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
    }),
    {
      name: "settings-storage",
      partialize: () => ({}),
    }
  )
)
