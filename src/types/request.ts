import { SubtitleNoTime, SubtitleNoTimeNoIndex } from "./subtitles"
import { ContextCompletion } from "./completion"

export type RequestType = "free" | "paid" | "custom"

export interface TranslationRequestBody {
  title: string
  subtitles: {
    subtitles: SubtitleNoTime[]
  }
  sourceLanguage: string
  targetLanguage: string
  contextDocument: string
  customInstructions: string
  baseURL: string
  model: string
  temperature: number
  maxCompletionTokens?: number
  structuredOutput: boolean
  contextMessage: ContextCompletion[]
  fewShotExamples: { content: string, translated: string }[]
  uuid: string
  isBatch: boolean
  clientId?: string
  projectName?: string
}

export interface ExtractionRequestBody {
  input: {
    episode: string
    subtitles: SubtitleNoTimeNoIndex[]
    previous_context: string
  }
  baseURL: string
  model: string
  maxCompletionTokens?: number
  isBatch: boolean
  clientId?: string
  projectName?: string
}

export interface TranscriptionRequestBody {
  uploadId: string
  selectedMode: "clause" | "sentence"
  customInstructions: string
  models: "premium" | "premium-fast" | "free" | null
  clientId: string
  deleteFile: boolean
  projectName?: string
}
