import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_SPLIT_SIZE,
  DEFAULT_MAX_COMPLETION_TOKENS,
} from "@/constants/default"
import { useSubtitleStore } from "./use-subtitle-store"
import { useSettingsStore } from "./use-settings-store"

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
  persist(
    (set) => ({
      ...initialAdvancedSettings,
      setTemperature: (temp) => set({ temperature: temp }),
      setSplitSize: (size) => set({ splitSize: size }),
      setPrompt: (prompt) => set({ prompt }),
      setMaxCompletionTokens: (tokens) => set({ maxCompletionTokens: tokens }),
      setStartIndex: (index) => set({ startIndex: index }),
      setEndIndex: (index) => set({ endIndex: index }),
      setIsUseStructuredOutput: (use: boolean) => set({ isUseStructuredOutput: use }),
      setIsUseFullContextMemory: (use: boolean) => set({ isUseFullContextMemory: use }),
      setIsMaxCompletionTokensAuto: (auto) => set({ isMaxCompletionTokensAuto: auto }),
      setIsBetterContextCaching: (bool) => set({ isBetterContextCaching: bool }),
      resetAdvancedSettings: () => set({
        ...initialAdvancedSettings,
        endIndex: useSubtitleStore.getState().subtitles?.length ?? initialAdvancedSettings.endIndex,
        isUseStructuredOutput: useSettingsStore.getState().isUseCustomModel
          ? initialAdvancedSettings.isUseStructuredOutput
          : useSettingsStore.getState().modelDetail?.structuredOutput ?? initialAdvancedSettings.isUseStructuredOutput,
      }),
      resetIndex: (s?: number, e?: number) => set({
        startIndex: s || 1,
        endIndex: e || (useSubtitleStore.getState().subtitles?.length ?? initialAdvancedSettings.endIndex),
      })
    }),
    {
      name: "advanced-settings",
      partialize: (state) => ({
        temperature: state.temperature,
        splitSize: state.splitSize,
        prompt: state.prompt,
        isUseStructuredOutput: state.isUseStructuredOutput,
        isUseFullContextMemory: state.isUseFullContextMemory,
        isMaxCompletionTokensAuto: state.isMaxCompletionTokensAuto,
      }),
    }
  )
)
