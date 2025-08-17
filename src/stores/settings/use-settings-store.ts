import { create } from "zustand"
import { Model } from "@/types/model"
import { BasicSettings, SettingsParentType } from "@/types/project"
import { persist } from "zustand/middleware"
import {
  createBasicSettings,
  updateBasicSettings,
  getBasicSettings,
  getAllBasicSettings,
} from "@/lib/db/settings"
import { DEFAULT_BASIC_SETTINGS } from "@/constants/default"
import { useTranslationDataStore } from "../data/use-translation-data-store"
import { useExtractionDataStore } from "../data/use-extraction-data-store"
import { useProjectStore } from "../data/use-project-store"

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
  setBasicSettingsValue: (
    id: string,
    key: keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>,
    value: BasicSettings[keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>],
    parent: SettingsParentType
  ) => void
  setIsFewShotEnabled: (id: string, isEnabled: boolean, parent: SettingsParentType) => void
  setFewShotValue: (id: string, value: string, parent: SettingsParentType) => void
  setFewShotLinkedId: (id: string, linkedId: string, parent: SettingsParentType) => void
  setFewShotType: (id: string, type: 'manual' | 'linked', parent: SettingsParentType) => void
  setFewShotStartIndex: (id: string, index: number, parent: SettingsParentType) => void
  setFewShotEndIndex: (id: string, index: number, parent: SettingsParentType) => void
}

const getOrCreateBasicSettings = async <T>(
  store: { getState: () => { currentId: string | null; data: Record<string, T> } },
  currentId: string | null,
  getSettingsId: (data: T) => string | null | undefined,
  createAndUpdate: (newSettings: BasicSettings) => void
): Promise<BasicSettings | null> => {
  if (!currentId) return null
  const data = store.getState().data[currentId]
  if (!data) return null

  let basicSettings = getSettingsId(data)
    ? await getBasicSettings(getSettingsId(data)!) ?? null
    : null

  if (!basicSettings) {
    basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
    createAndUpdate(basicSettings)
  }

  return basicSettings
}

const updateSettings = async <K extends keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: BasicSettings[K],
  parent: SettingsParentType,
) => {
  try {
    let basicSettings: BasicSettings | null = null

    if (parent === 'translation') {
      const store = useTranslationDataStore
      const currentId = store.getState().currentId
      basicSettings = await getOrCreateBasicSettings(
        store,
        currentId,
        (data) => data.basicSettingsId,
        (newSettings) => store.getState().mutateData(currentId!, "basicSettingsId", newSettings.id)
      )
    } else if (parent === 'extraction') {
      const store = useExtractionDataStore
      const currentId = store.getState().currentId
      basicSettings = await getOrCreateBasicSettings(
        store,
        currentId,
        (data) => data.basicSettingsId,
        (newSettings) => store.getState().mutateData(currentId!, "basicSettingsId", newSettings.id)
      )
    } else if (parent === 'project') {
      const store = useProjectStore
      const data = store.getState().currentProject
      if (!data) return

      const basicSettingsId = data.defaultBasicSettingsId
      basicSettings = basicSettingsId
        ? await getBasicSettings(basicSettingsId) ?? null
        : null

      if (!basicSettings) {
        basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
        store.getState().updateProject(data.id, { defaultBasicSettingsId: basicSettings.id })
      }
    }
    if (basicSettings) {
      await updateBasicSettings(basicSettings.id, { [field]: value })
    }
  } catch (error) {
    console.error(`Failed to update settings for ${parent}:`, error)
  }
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
      setBasicSettingsValue: (id, key, value, parent) => {
        get().mutateData(id, key, value)
        updateSettings(key, value, parent)
      },
      setIsFewShotEnabled: (id, isEnabled, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, isEnabled }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
      setFewShotValue: (id, value, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, value }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
      setFewShotLinkedId: (id, linkedId, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, linkedId }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
      setFewShotType: (id, type, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, type }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
      setFewShotStartIndex: (id, index, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotStartIndex: index }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
      setFewShotEndIndex: (id, index, parent) => {
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotEndIndex: index }
        get().mutateData(id, "fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, parent)
      },
    }),
    {
      name: "settings-storage",
      partialize: () => ({}),
    }
  )
)
