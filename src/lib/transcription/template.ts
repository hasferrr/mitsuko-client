import { DEFAULT_TRANSCRIPTION_SETTINGS } from '@/constants/default'
import { Transcription } from '@/types/project'

export function buildTranscriptionTemplate({
  id,
  projectId,
  title = DEFAULT_TRANSCRIPTION_SETTINGS.title,
  settings = {},
  now = new Date(),
}: {
  id: string
  projectId: string
  title?: string
  settings?: Partial<Pick<Transcription, 'selectedMode' | 'customInstructions' | 'models' | 'language' | 'selectedUploadId'>>
  now?: Date
}): Transcription {
  return {
    id,
    projectId,
    ...DEFAULT_TRANSCRIPTION_SETTINGS,
    title,
    ...settings,
    transcriptSubtitles: [...DEFAULT_TRANSCRIPTION_SETTINGS.transcriptSubtitles],
    words: [...DEFAULT_TRANSCRIPTION_SETTINGS.words],
    segments: [...DEFAULT_TRANSCRIPTION_SETTINGS.segments],
    createdAt: now,
    updatedAt: now,
  }
}
