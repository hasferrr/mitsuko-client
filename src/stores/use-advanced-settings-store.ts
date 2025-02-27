import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_SPLIT_SIZE,
  DEFAULT_PROMPT,
  DEFAULT_MAX_COMPLETION_TOKENS,
} from "@/constants/default"

interface AdvancedSettingsStore {
  temperature: number
  splitSize: number
  prompt: string
  maxCompletionTokens: number
  startIndex: number
  isUseStructuredOutput: boolean
  isUseFullContextMemory: boolean
  setTemperature: (temp: number) => void
  setSplitSize: (size: number) => void
  setPrompt: (prompt: string) => void
  setMaxCompletionTokens: (tokens: number) => void
  setStartIndex: (index: number) => void
  setIsUseStructuredOutput: (use: boolean) => void
  setIsUseFullContextMemory: (use: boolean) => void
  resetAdvancedSettings: () => void
}

const initialAdvancedSettings = {
  temperature: DEFAULT_TEMPERATURE,
  splitSize: DEFAULT_SPLIT_SIZE,
  prompt: DEFAULT_PROMPT,
  maxCompletionTokens: DEFAULT_MAX_COMPLETION_TOKENS,
  startIndex: 1,
  isUseStructuredOutput: true,
  isUseFullContextMemory: false,
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
      setIsUseStructuredOutput: (use: boolean) => set({ isUseStructuredOutput: use }),
      setIsUseFullContextMemory: (use: boolean) => set({ isUseFullContextMemory: use }),
      resetAdvancedSettings: () => set(initialAdvancedSettings),
    }),
    {
      name: "advanced-settings",
      partialize: (state) => ({
        temperature: state.temperature,
        splitSize: state.splitSize,
        prompt: state.prompt,
        maxCompletionTokens: state.maxCompletionTokens,
        isUseStructuredOutpu: state.isUseStructuredOutput,
        isUseFullContextMemory: state.isUseFullContextMemory,
      }),
    }
  )
)
