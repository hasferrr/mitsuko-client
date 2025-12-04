import ISO6391 from 'iso-639-1'
import { TranscriptionModel } from "@/types/project"

export const MAX_FILE_SIZE = 512 * 1024 * 1024
export const GLOBAL_MAX_DURATION_SECONDS = 65 * 60

export const languages = [
  { value: "auto", label: "Auto-detect" },
  ...ISO6391.getAllCodes().map((c) => ({ value: c, label: `${ISO6391.getName(c)} [${c}]` }))
]

interface ModelRecord {
  label: string
  maxDuration: number
}

export const models: Record<TranscriptionModel, ModelRecord> = {
  "free": { label: "mitsuko-free", maxDuration: 35 * 60 },
  "premium": { label: "mitsuko-premium", maxDuration: 35 * 60 },
  "whisper-large-v3": { label: "whisper-large-v3", maxDuration: 65 * 60 },
  "whisper-large-v3-turbo": { label: "whisper-large-v3-turbo", maxDuration: 65 * 60 },
}

export const isModelDurationLimitExceeded = (model: TranscriptionModel | null, duration: number): boolean => {
  if (!model) return false
  return models[model].maxDuration < duration
}

export const getModel = (model: TranscriptionModel): ModelRecord => {
  return models[model]
}

export const modes = [
  { value: "clause", label: "Mode 1: Clauses and sentences (Experimental)" },
  { value: "sentence", label: "Mode 2: Sentences" },
]

const asrmodel = new Set([
  "whisper-large-v3",
  "whisper-large-v3-turbo",
])

export const isAsrModel = (model: TranscriptionModel | null) => asrmodel.has(model || "")
