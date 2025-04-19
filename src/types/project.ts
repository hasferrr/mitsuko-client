import { advancedSettingsSchema } from "@/types/zod"
import { SubtitleTranslated, Parsed, Subtitle, SubOnlyTranslated } from "./types"
import { Model } from "./model"
import { z } from "zod"

export type ProjectType = 'translation' | 'transcription' | 'extraction'

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
  createdAt: Date
  updatedAt: Date
}

export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>

export interface ResponseTranslation {
  response: string
  jsonResponse: SubOnlyTranslated[]
}
