import { SubtitleTranslated, Parsed, Subtitle, SubOnlyTranslated } from "./subtitles"
import { Model } from "./model"

export type ProjectType = 'translation' | 'transcription' | 'extraction'
export type SettingsParentType = 'project' | 'translation' | 'extraction'

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
  createdAt: Date
  updatedAt: Date
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

export interface Transcription {
  id: string
  title: string
  transcriptionText: string
  transcriptSubtitles: Subtitle[]
  selectedMode: "clause" | "sentence"
  customInstructions: string
  models: "premium"
  isOverOneHour: boolean
  createdAt: Date
  updatedAt: Date
  projectId: string
}

export interface Extraction {
  id: string
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
  isAdvancedReasoningEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ResponseTranslation {
  response: string
  jsonResponse: SubOnlyTranslated[]
}
