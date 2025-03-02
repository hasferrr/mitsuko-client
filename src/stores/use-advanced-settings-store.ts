import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_SPLIT_SIZE,
} from "@/constants/default"
import { useSubtitleStore } from "./use-subtitle-store"
import { useSettingsStore } from "./use-settings-store"
import { MAX_COMPLETION_TOKENS_MAX } from "@/constants/limits"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  maxCompletionTokens: number
  startIndex: number
  endIndex: number
  isUseStructuredOutput: boolean
  isUseFullContextMemory: boolean
  initRef: React.RefObject<boolean>
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  setMaxCompletionTokens: (tokens: number) => void
  setStartIndex: (index: number) => void
  setEndIndex: (index: number) => void
  setIsUseStructuredOutput: (use: boolean) => void
  setIsUseFullContextMemory: (use: boolean) => void
  resetAdvancedSettings: () => void
}

const initialAdvancedSettings = {
  temperature: DEFAULT_TEMPERATURE,
  splitSize: DEFAULT_SPLIT_SIZE,
  prompt: "",
  maxCompletionTokens: MAX_COMPLETION_TOKENS_MAX,
  startIndex: 1,
  endIndex: 100000,
  isUseStructuredOutput: true,
  isUseFullContextMemory: false,
  initRef: { current: true }
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
      resetAdvancedSettings: () => set({
        ...initialAdvancedSettings,
        endIndex: useSubtitleStore.getState().subtitles?.length ?? initialAdvancedSettings.endIndex,
        maxCompletionTokens: useSettingsStore.getState().modelDetail?.maxOutput ?? initialAdvancedSettings.maxCompletionTokens,
      }),
    }),
    {
      name: "advanced-settings",
      partialize: (state) => ({
        temperature: state.temperature,
        splitSize: state.splitSize,
        prompt: state.prompt,
        maxCompletionTokens: state.maxCompletionTokens,
        isUseStructuredOutput: state.isUseStructuredOutput,
        isUseFullContextMemory: state.isUseFullContextMemory,
      }),
    }
  )
)
