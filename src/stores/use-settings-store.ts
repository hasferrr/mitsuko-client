import { create } from "zustand"
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/constants/default"
import { FREE_MODELS } from "@/constants/model"
import { Model } from "@/types/types"
import { useProjectDataStore } from "./use-project-data-store"
import { BasicSettings } from "@/types/project"
import { persist } from "zustand/middleware"

interface SettingsStore {
  sourceLanguage: string
  targetLanguage: string
  modelDetail: Model | null
  isUseCustomModel: boolean
  apiKey: string
  customBaseUrl: string
  customModel: string
  contextDocument: string
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setModelDetail: (model: Model | null) => void
  setIsUseCustomModel: (value: boolean) => void
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  setContextDocument: (doc: string) => void
}

const updateSettings = <K extends keyof BasicSettings>(field: K, value: BasicSettings[K], noSave?: boolean) => {
  const id = useProjectDataStore.getState().currentTranslationId
  if (!id) return
  const translationData = useProjectDataStore.getState().translationData[id]
  if (!translationData) return
  translationData.basicSettings[field] = value
  if (noSave) return
  useProjectDataStore.getState().saveData(id, "translation")
}

const firstModel = Object.values(FREE_MODELS)[0]

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
      targetLanguage: DEFAULT_TARGET_LANGUAGE,
      modelDetail: firstModel && firstModel.length > 0 ? firstModel[0] : null,
      isUseCustomModel: false,
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      contextDocument: "",
      setSourceLanguage: (language) => {
        set({ sourceLanguage: language })
        updateSettings("sourceLanguage", language)
      },
      setTargetLanguage: (language) => {
        set({ targetLanguage: language })
        updateSettings("targetLanguage", language)
      },
      setModelDetail: (model) => {
        set({ modelDetail: model })
        updateSettings("modelDetail", model)
      },
      setIsUseCustomModel: (value) => {
        set({ isUseCustomModel: value })
        updateSettings("isUseCustomModel", value)
      },
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      setContextDocument: (doc) => {
        set({ contextDocument: doc })
        updateSettings("contextDocument", doc, true)
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
