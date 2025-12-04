import ISO6391 from 'iso-639-1'
import { TranscriptionModel } from "@/types/project"

export const MAX_FILE_SIZE = 512 * 1024 * 1024
export const GLOBAL_MAX_DURATION_SECONDS = 65 * 60

interface ModelRecord {
  label: string
  maxDuration: number
}

const codes = ['af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo', 'br', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb', 'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'zh']

export const TRANSCRIPTION_MODELS: Record<TranscriptionModel, ModelRecord> = {
  free: { label: "mitsuko-free", maxDuration: 35 * 60 },
  premium: { label: "mitsuko-premium", maxDuration: 35 * 60 },
  "whisper-large-v3": { label: "whisper-large-v3", maxDuration: 65 * 60 },
  "whisper-large-v3-turbo": { label: "whisper-large-v3-turbo", maxDuration: 65 * 60 },
}

export const LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  ...codes.map((c) => ({ value: c, label: `${ISO6391.getName(c)} [${c}]` }))
]

export const MODES = [
  { value: "clause", label: "Mode 1: Clauses & Sentences (Experimental)" },
  { value: "sentence", label: "Mode 2: Sentences" },
]

const ASR_MODELS_SET = new Set([
  "whisper-large-v3",
  "whisper-large-v3-turbo",
])

export const isModelDurationLimitExceeded = (model: TranscriptionModel | null, duration: number): boolean => {
  if (!model) return false
  return TRANSCRIPTION_MODELS[model].maxDuration < duration
}

export const getModel = (model: TranscriptionModel): ModelRecord => {
  return TRANSCRIPTION_MODELS[model]
}

export const isAsrModel = (model: TranscriptionModel | null) => ASR_MODELS_SET.has(model || "")
