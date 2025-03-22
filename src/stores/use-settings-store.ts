import { create } from "zustand"
import { Model } from "@/types/types"
import { BasicSettings, ProjectType } from "@/types/project"
import { persist } from "zustand/middleware"
import { createBasicSettings, updateBasicSettings, getBasicSettings } from "@/lib/db/settings"
import { DEFAULT_BASIC_SETTINGS } from "@/constants/default"
import { useTranslationDataStore } from "./use-translation-data-store"
import { useExtractionDataStore } from "./use-extraction-data-store"

interface SettingsStore {
  data: Record<string, BasicSettings>
  currentId: string | null
  apiKey: string
  customBaseUrl: string
  customModel: string
  setCurrentId: (id: string) => void
  upsertData: (id: string, value: BasicSettings) => void
  mutateData: (key: keyof BasicSettings, value: any) => void
  saveData: () => Promise<void>
  // db state
  getSourceLanguage: () => string
  getTargetLanguage: () => string
  getModelDetail: () => Model | null
  getIsUseCustomModel: () => boolean
  getContextDocument: () => string
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setModelDetail: (model: Model | null, type: ProjectType) => void
  setIsUseCustomModel: (value: boolean, type: ProjectType) => void
  setContextDocument: (doc: string) => void
  // local storage persist state
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
}

const updateSettings = async <K extends keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>(
  field: K,
  value: BasicSettings[K],
  type: ProjectType = 'translation'
) => {
  const store = type === 'translation' ? useTranslationDataStore : useExtractionDataStore
  const currentId = store.getState().currentId
  if (!currentId) return
  const data = store.getState().data[currentId]
  if (!data) return

  // Get or create basic settings
  let basicSettings = data.basicSettingsId
    ? await getBasicSettings(data.basicSettingsId)
    : null

  if (!basicSettings) {
    basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
    store.getState().mutateData(currentId, "basicSettingsId", basicSettings.id)
  }

  // Update the settings
  await updateBasicSettings(basicSettings.id, { [field]: value })
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
      setSourceLanguage: (language) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("sourceLanguage", language)
        updateSettings("sourceLanguage", language)
      },
      setTargetLanguage: (language) => {
        const id = get().currentId
        if (!id) return
        get().mutateData("targetLanguage", language)
        updateSettings("targetLanguage", language)
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
        updateSettings("contextDocument", doc)
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
