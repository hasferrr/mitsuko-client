import { create } from "zustand"
import { Model } from "@/types/model"
import { BasicSettings, SettingsParentType } from "@/types/project"
import { persist } from "zustand/middleware"
import { createBasicSettings, updateBasicSettings, getBasicSettings } from "@/lib/db/settings"
import { DEFAULT_BASIC_SETTINGS } from "@/constants/default"
import { useTranslationDataStore } from "../data/use-translation-data-store"
import { useExtractionDataStore } from "../data/use-extraction-data-store"
import { useProjectStore } from "../data/use-project-store"

interface SettingsStore {
  data: Record<string, BasicSettings>
  currentId: string | null
  apiKey: string
  customBaseUrl: string
  customModel: string
  setCurrentId: (id: string) => void
  upsertData: (id: string, value: BasicSettings) => void
  mutateData: <T extends keyof BasicSettings>(key: T, value: BasicSettings[T]) => void
  saveData: () => Promise<void>
  // db state
  getBasicSettings: () => BasicSettings | null
  getSourceLanguage: () => string
  getTargetLanguage: () => string
  getModelDetail: () => Model | null
  getIsUseCustomModel: () => boolean
  getContextDocument: () => string
  getCustomInstructions: () => string
  getFewShot: () => BasicSettings['fewShot']
  getFewShotIsEnabled: () => boolean
  getFewShotValue: () => string
  getFewShotLinkedId: () => string
  getFewShotType: () => 'manual' | 'linked'
  getFewShotStartIndex: () => number | undefined
  getFewShotEndIndex: () => number | undefined
  setSourceLanguage: (language: string, parent: SettingsParentType) => void
  setTargetLanguage: (language: string, parent: SettingsParentType) => void
  setModelDetail: (model: Model | null, parent: SettingsParentType) => void
  setIsUseCustomModel: (value: boolean, parent: SettingsParentType) => void
  setContextDocument: (doc: string) => void
  setCustomInstructions: (instructions: string) => void
  setIsFewShotEnabled: (isEnabled: boolean) => void
  setFewShotValue: (value: string) => void
  setFewShotLinkedId: (id: string) => void
  setFewShotType: (type: 'manual' | 'linked') => void
  setFewShotStartIndex: (index?: number) => void
  setFewShotEndIndex: (index?: number) => void
  // local storage persist state
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
}

const updateSettings = async <K extends keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: BasicSettings[K],
  parent: SettingsParentType,
) => {
  let basicSettings: BasicSettings | null = null

  if (parent === 'translation') {
    const store = useTranslationDataStore
    const currentId = store.getState().currentId
    if (!currentId) return
    const data = store.getState().data[currentId]
    if (!data) return
    basicSettings = data.basicSettingsId
      ? await getBasicSettings(data.basicSettingsId) ?? null
      : null
    if (!basicSettings) {
      basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
      store.getState().mutateData(currentId, "basicSettingsId", basicSettings.id)
    }
  }

  if (parent === 'extraction') {
    const store = useExtractionDataStore
    const currentId = store.getState().currentId
    if (!currentId) return
    const data = store.getState().data[currentId]
    if (!data) return
    basicSettings = data.basicSettingsId
      ? await getBasicSettings(data.basicSettingsId) ?? null
      : null
    if (!basicSettings) {
      basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
      store.getState().mutateData(currentId, "basicSettingsId", basicSettings.id)
    }
  }

  if (parent === 'project') {
    const store = useProjectStore
    const data = store.getState().currentProject
    if (!data) return
    basicSettings = data.defaultBasicSettingsId
      ? await getBasicSettings(data.defaultBasicSettingsId) ?? null
      : null
    if (!basicSettings) {
      basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
      store.getState().updateProject(data.id, { defaultBasicSettingsId: basicSettings.id })
    }
  }

  // Update the settings
  if (basicSettings) {
    await updateBasicSettings(basicSettings.id, { [field]: value })
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      data: {},
      currentId: null,
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      setCurrentId: (id) => set({ currentId: id }),
      getBasicSettings: () => {
        const id = get().currentId
        return id ? get().data[id] ?? null : null
      },
      getSourceLanguage: () => {
        const id = get().currentId
        return id ? get().data[id]?.sourceLanguage : DEFAULT_BASIC_SETTINGS.sourceLanguage
      },
      getTargetLanguage: () => {
        const id = get().currentId
        return id ? get().data[id]?.targetLanguage : DEFAULT_BASIC_SETTINGS.targetLanguage
      },
      getModelDetail: () => {
        const id = get().currentId
        return id ? get().data[id]?.modelDetail : DEFAULT_BASIC_SETTINGS.modelDetail
      },
      getIsUseCustomModel: () => {
        const id = get().currentId
        return id ? get().data[id]?.isUseCustomModel : DEFAULT_BASIC_SETTINGS.isUseCustomModel
      },
      getContextDocument: () => {
        const id = get().currentId
        return id ? get().data[id]?.contextDocument : DEFAULT_BASIC_SETTINGS.contextDocument
      },
      getCustomInstructions: () => {
        const id = get().currentId
        return id ? get().data[id]?.customInstructions : DEFAULT_BASIC_SETTINGS.customInstructions
      },
      getFewShot: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot : DEFAULT_BASIC_SETTINGS.fewShot
      },
      getFewShotIsEnabled: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.isEnabled ?? DEFAULT_BASIC_SETTINGS.fewShot.isEnabled : DEFAULT_BASIC_SETTINGS.fewShot.isEnabled
      },
      getFewShotValue: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.value ?? DEFAULT_BASIC_SETTINGS.fewShot.value : DEFAULT_BASIC_SETTINGS.fewShot.value
      },
      getFewShotLinkedId: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.linkedId ?? DEFAULT_BASIC_SETTINGS.fewShot.linkedId : DEFAULT_BASIC_SETTINGS.fewShot.linkedId
      },
      getFewShotType: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.type ?? DEFAULT_BASIC_SETTINGS.fewShot.type : DEFAULT_BASIC_SETTINGS.fewShot.type
      },
      getFewShotStartIndex: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.fewShotStartIndex : DEFAULT_BASIC_SETTINGS.fewShot.fewShotStartIndex
      },
      getFewShotEndIndex: () => {
        const id = get().currentId
        return id ? get().data[id]?.fewShot?.fewShotEndIndex : DEFAULT_BASIC_SETTINGS.fewShot.fewShotEndIndex
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
          await updateBasicSettings(id, settings)
        } catch (error) {
          console.error("Failed to save settings data:", error)
        }
      },
      setSourceLanguage: (language, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("sourceLanguage", language)
        updateSettings("sourceLanguage", language, type)
      },
      setTargetLanguage: (language, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("targetLanguage", language)
        updateSettings("targetLanguage", language, type)
      },
      // Method for updating the model detail for the current id for both translation and extraction
      setModelDetail: (model, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("modelDetail", model)
        updateSettings("modelDetail", model, type)
      },
      setIsUseCustomModel: (value, type) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("isUseCustomModel", value)
        updateSettings("isUseCustomModel", value, type)
      },
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      setContextDocument: (doc) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("contextDocument", doc)
        updateSettings("contextDocument", doc, "translation")
      },
      setCustomInstructions: (instructions) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("customInstructions", instructions)
        updateSettings("customInstructions", instructions, "translation")
      },
      setIsFewShotEnabled: (isEnabled) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, isEnabled }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
      setFewShotValue: (value) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, value }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
      setFewShotLinkedId: (linkedId) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, linkedId }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
      setFewShotType: (type) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, type }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
      setFewShotStartIndex: (index) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotStartIndex: index }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
      setFewShotEndIndex: (index) => {
        const id = get().currentId
        if (!id) return
        const currentFewShot = get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot
        const newFewShot = { ...currentFewShot, fewShotEndIndex: index }
        get().mutateData("fewShot", newFewShot)
        updateSettings("fewShot", newFewShot, "translation")
      },
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        customBaseUrl: state.customBaseUrl,
        customModel: state.customModel,
      }),
    }
  )
)
