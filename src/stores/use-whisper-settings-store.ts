import { create } from "zustand"

interface WhisperSettingsStore {
  subtitleLevel: "words" | "segments"
  maxSilenceGap: number
  targetCps: number
  maxCps: number
  maxChars: number
  minDuration: number

  setSubtitleLevel: (level: "words" | "segments") => void
  setMaxSilenceGap: (value: number) => void
  setTargetCps: (value: number) => void
  setMaxCps: (value: number) => void
  setMaxChars: (value: number) => void
  setMinDuration: (value: number) => void
  reset: () => void
}

const DEFAULT_VALUES = {
  subtitleLevel: "words" as const,
  maxSilenceGap: 0.5,
  targetCps: 16,
  maxCps: 22,
  maxChars: 85,
  minDuration: 1,
}

export const useWhisperSettingsStore = create<WhisperSettingsStore>((set) => ({
  ...DEFAULT_VALUES,

  setSubtitleLevel: (subtitleLevel) => set({ subtitleLevel }),
  setMaxSilenceGap: (maxSilenceGap) => set({ maxSilenceGap }),
  setTargetCps: (targetCps) => set({ targetCps }),
  setMaxCps: (maxCps) => set({ maxCps }),
  setMaxChars: (maxChars) => set({ maxChars }),
  setMinDuration: (minDuration) => set({ minDuration }),
  reset: () => set(DEFAULT_VALUES),
}))