import { create } from "zustand"
import { persist } from 'zustand/middleware'
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/constants/default"
import { FREE_MODELS } from "@/constants/model"
import { Model } from "@/types/types"

interface SettingsStore {
  sourceLanguage: string
  targetLanguage: string
  selectedModel: string
  modelDetail: Model | null
  isUseCustomModel: boolean
  apiKey: string
  customBaseUrl: string
  customModel: string
  contextDocument: string
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setSelectedModel: (model: string | Model) => void
  setIsUseCustomModel: (value: boolean) => void
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  setContextDocument: (doc: string) => void
}

const firstModel = Object.values(FREE_MODELS)[0]

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
      targetLanguage: DEFAULT_TARGET_LANGUAGE,
      selectedModel: firstModel && firstModel.length > 0 ? firstModel[0].name : "",
      modelDetail: firstModel && firstModel.length > 0 ? firstModel[0] : null,
      isUseCustomModel: false,
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      contextDocument: "",
      setSourceLanguage: (language) => set({ sourceLanguage: language }),
      setTargetLanguage: (language) => set({ targetLanguage: language }),
      setSelectedModel: (model: string | Model) => set({
        selectedModel: typeof model === "string" ? model : model.name,
        modelDetail: typeof model === "string" ? null : model,
      }),
      setIsUseCustomModel: (value) => set({ isUseCustomModel: value }),
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      setContextDocument: (doc) => set({ contextDocument: doc }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
