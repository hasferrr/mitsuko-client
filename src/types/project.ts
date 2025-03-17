import { SubtitleTranslated, Parsed, Subtitle } from "./types"

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
  createdAt: Date
  updatedAt: Date
  projectId: string
}
