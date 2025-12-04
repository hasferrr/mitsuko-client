import ISO6391 from 'iso-639-1'
import { TranscriptionModel } from "@/types/project"

export const MAX_FILE_SIZE = 512 * 1024 * 1024

export const languages = [
  { value: "auto", label: "Auto-detect" },
  ...ISO6391.getAllCodes().map((c) => ({ value: c, label: `${ISO6391.getName(c)} [${c}]` }))
]

export const models: { value: TranscriptionModel; label: string }[] = [
  { value: "free", label: "mitsuko-free" },
  { value: "premium", label: "mitsuko-premium" },
  { value: "whisper-large-v3", label: "whisper-large-v3" },
  { value: "whisper-large-v3-turbo", label: "whisper-large-v3-turbo" },
]

export const modes = [
  { value: "clause", label: "Mode 1: Clauses and sentences (Experimental)" },
  { value: "sentence", label: "Mode 2: Sentences" },
]

const asrmodel = new Set([
  "whisper-large-v3",
  "whisper-large-v3-turbo",
])

export const isAsrModel = (model: TranscriptionModel | null) => asrmodel.has(model || "")
