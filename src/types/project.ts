import { SubtitleTranslated, Parsed, Subtitle, SubOnlyTranslated } from "./subtitles"
import { Model } from "./model"

export type ProjectType = 'translation' | 'transcription' | 'extraction'
export type SettingsParentType = 'project' | 'translation' | 'extraction'
export type TranscriptionModel = 'mitsuko-premium' | 'mitsuko-free' | 'whisper-large-v3' | 'whisper-large-v3-turbo'

export interface ProjectOrder {
  id: string
  order: string[] // Array of Project IDs
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  translations: string[] // Array of Translation IDs
  transcriptions: string[] // Array of Transcription IDs
  extractions: string[] // Array of Extraction IDs
  defaultBasicSettingsId: string
  defaultAdvancedSettingsId: string
  defaultTranslationBasicSettingsId: string
  defaultTranslationAdvancedSettingsId: string
  defaultExtractionBasicSettingsId: string
  defaultExtractionAdvancedSettingsId: string
  defaultTranscriptionId: string
  createdAt: Date
  updatedAt: Date
  isBatch: boolean // Indicates whether this project is a batch-type project
}

export interface Translation {
  id: string
  title: string
  subtitles: SubtitleTranslated[]
  parsed: Parsed
  createdAt: Date
  updatedAt: Date
  projectId: string
  basicSettingsId: string
  advancedSettingsId: string
  response: ResponseTranslation
}

export interface TranscriptionWord {
  word: string
  start: number
  end: number
}

export interface TranscriptionSegment {
  text: string
  start: number
  end: number
}

export interface Transcription {
  id: string
  title: string
  transcriptionText: string
  transcriptSubtitles: Subtitle[]
  language: string
  selectedMode: "clause" | "sentence"
  customInstructions: string
  models: TranscriptionModel | null
  createdAt: Date
  updatedAt: Date
  projectId: string
  words: TranscriptionWord[]
  segments: TranscriptionSegment[]
  selectedUploadId: string | null
}

export interface Extraction {
  id: string
  title: string
  episodeNumber: string
  subtitleContent: string
  previousContext: string
  contextResult: string
  createdAt: Date
  updatedAt: Date
  projectId: string
  basicSettingsId: string
  advancedSettingsId: string
}

export interface BasicSettings {
  id: string
  sourceLanguage: string
  targetLanguage: string
  modelDetail: Model | null
  isUseCustomModel: boolean
  contextDocument: string
  customInstructions: string
  fewShot: {
    isEnabled: boolean
    value: string
    linkedId: string
    type: 'manual' | 'linked'
    fewShotStartIndex?: number
    fewShotEndIndex?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface AdvancedSettings {
  id: string
  temperature: number
  startIndex: number
  endIndex: number
  splitSize: number
  maxCompletionTokens: number
  isUseStructuredOutput: boolean
  isUseFullContextMemory: boolean
  isBetterContextCaching: boolean
  isMaxCompletionTokensAuto: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ResponseTranslation {
  response: string
  jsonResponse: SubOnlyTranslated[]
}
