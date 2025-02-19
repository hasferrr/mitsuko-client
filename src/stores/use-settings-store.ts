import { create } from "zustand"
import { persist } from 'zustand/middleware'

interface SettingsStore {
  sourceLanguage: string
  targetLanguage: string
  useCustomModel: boolean
  apiKey: string
  customBaseUrl: string
  customModel: string
  contextDocument: string
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setUseCustomModel: (value: boolean) => void
  setApiKey: (key: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  setContextDocument: (doc: string) => void
  hydrateStore: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      sourceLanguage: "japanese",
      targetLanguage: "indonesian",
      useCustomModel: false,
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
      contextDocument: "",
      setSourceLanguage: (language) => set({ sourceLanguage: language }),
      setTargetLanguage: (language) => set({ targetLanguage: language }),
      setUseCustomModel: (value) => set({ useCustomModel: value }),
      setApiKey: (key) => set({ apiKey: key }),
      setCustomBaseUrl: (url) => set({ customBaseUrl: url }),
      setCustomModel: (model) => set({ customModel: model }),
      setContextDocument: (doc) => set({ contextDocument: doc }),
      hydrateStore: () => {
        const storedSettingsData = localStorage.getItem('settings-storage');
        if (storedSettingsData) {
          const parsedData = JSON.parse(storedSettingsData);
          set(parsedData)
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
