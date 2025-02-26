import { create } from "zustand"
import { persist } from 'zustand/middleware'
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/constants/default"
import { FREE_MODELS } from "@/constants/model"

interface SettingsStore {
  sourceLanguage: string
  targetLanguage: string
  selectedModel: string
  isUseCustomModel: boolean
  apiKey: string
  customBaseUrl: string
  customModel: string
  contextDocument: string
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setSelectedModel: (model: string) => void
  setIsUseCustomModel: (value: boolean) => void
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  setContextDocument: (doc: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
      targetLanguage: DEFAULT_TARGET_LANGUAGE,
      selectedModel: Object.values(FREE_MODELS)[0][0] || "",
      isUseCustomModel: false,
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      contextDocument: "",
      setSourceLanguage: (language) => set({ sourceLanguage: language }),
      setTargetLanguage: (language) => set({ targetLanguage: language }),
      setSelectedModel: (model) => set({ selectedModel: model }),
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
