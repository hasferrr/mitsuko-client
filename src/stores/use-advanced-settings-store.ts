import { create } from "zustand"
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_SPLIT_SIZE,
  DEFAULT_MAX_COMPLETION_TOKENS,
} from "@/constants/default"
import { useSettingsStore } from "./use-settings-store"
import { AdvancedSettings } from "@/types/project"
import { useTranslationDataStore } from "./use-translation-data-store"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  maxCompletionTokens: number
  startIndex: number
  endIndex: number
  isUseStructuredOutput: boolean
  isUseFullContextMemory: boolean
  isMaxCompletionTokensAuto: boolean
  isBetterContextCaching: boolean
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  setMaxCompletionTokens: (tokens: number) => void
  setStartIndex: (index: number) => void
  setEndIndex: (index: number) => void
  setIsUseStructuredOutput: (use: boolean) => void
  setIsUseFullContextMemory: (use: boolean) => void
  setIsMaxCompletionTokensAuto: (auto: boolean) => void
  setIsBetterContextCaching: (bool: boolean) => void
  resetAdvancedSettings: () => void
  resetIndex: (s?: number, e?: number) => void
}

const updateSettings = <K extends keyof AdvancedSettings>(field: K, value: AdvancedSettings[K], noSave?: boolean) => {
  const currentId = useTranslationDataStore.getState().currentId
  if (!currentId) return
  const translationData = useTranslationDataStore.getState().data[currentId]
  if (!translationData) return
  translationData.advancedSettings[field] = value
  if (noSave) return
  useTranslationDataStore.getState().saveData(currentId)
}

const initialAdvancedSettings = {
  temperature: DEFAULT_TEMPERATURE,
  splitSize: DEFAULT_SPLIT_SIZE,
  prompt: "",
  maxCompletionTokens: DEFAULT_MAX_COMPLETION_TOKENS,
  startIndex: 1,
  endIndex: 100000,
  isUseStructuredOutput: true,
  isUseFullContextMemory: false,
  isMaxCompletionTokensAuto: true,
  isBetterContextCaching: true,
}

export const useAdvancedSettingsStore = create<AdvancedSettingsStore>()(
  (set) => {
    return {
      ...initialAdvancedSettings,
      setTemperature: (temp) => {
        set({ temperature: temp })
        updateSettings("temperature", temp)
      },
      setSplitSize: (size) => {
        set({ splitSize: size })
        updateSettings("splitSize", size)
      },
      setPrompt: (prompt) => {
        set({ prompt })
        // updateSettings("prompt", prompt)
      },
      setMaxCompletionTokens: (tokens) => {
        set({ maxCompletionTokens: tokens })
        updateSettings("maxCompletionTokens", tokens)
      },
      setStartIndex: (index) => {
        set({ startIndex: index })
        updateSettings("startIndex", index)
      },
      setEndIndex: (index) => {
        set({ endIndex: index })
        updateSettings("endIndex", index)
      },
      setIsUseStructuredOutput: (use: boolean) => {
        set({ isUseStructuredOutput: use })
        updateSettings("isUseStructuredOutput", use)
      },
      setIsUseFullContextMemory: (use: boolean) => {
        set({ isUseFullContextMemory: use })
        updateSettings("isUseFullContextMemory", use)
      },
      setIsMaxCompletionTokensAuto: (auto) => {
        set({ isMaxCompletionTokensAuto: auto })
        updateSettings("isMaxCompletionTokensAuto", auto)
      },
      setIsBetterContextCaching: (bool) => {
        set({ isBetterContextCaching: bool })
        updateSettings("isBetterContextCaching", bool)
      },
      resetAdvancedSettings: () => {
        const currentId = useTranslationDataStore.getState().currentId
        const translationData = currentId ? useTranslationDataStore.getState().data[currentId] : null
        const subtitles = translationData?.subtitles ?? []

        const newSettings = {
          ...initialAdvancedSettings,
          endIndex: subtitles.length || initialAdvancedSettings.endIndex,
          isUseStructuredOutput: useSettingsStore.getState().isUseCustomModel
            ? initialAdvancedSettings.isUseStructuredOutput
            : useSettingsStore.getState().modelDetail?.structuredOutput ?? initialAdvancedSettings.isUseStructuredOutput,
        }
        set(newSettings)

        if (!currentId || !translationData) return
        translationData.advancedSettings = newSettings
        useTranslationDataStore.getState().saveData(currentId)
      },
      resetIndex: (s?: number, e?: number) => {
        const currentId = useTranslationDataStore.getState().currentId
        const translationData = currentId ? useTranslationDataStore.getState().data[currentId] : null
        const subtitles = translationData?.subtitles ?? []

        const startIndex = s || 1
        const endIndex = e || (subtitles.length || initialAdvancedSettings.endIndex)
        set({ startIndex, endIndex })
        updateSettings("startIndex", startIndex, true)
        updateSettings("endIndex", endIndex)
      }
    }
  }
)
