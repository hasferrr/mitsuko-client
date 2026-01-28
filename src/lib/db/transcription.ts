import { Transcription } from "@/types/project"
import { db } from "./db"
import { DEFAULT_TRANSCTIPTION_SETTINGS } from "@/constants/default"

interface TranscriptionData {
  title: Transcription["title"]
  transcriptionText: Transcription["transcriptionText"]
  transcriptSubtitles: Transcription["transcriptSubtitles"]
  models?: Transcription["models"]
  words?: Transcription["words"]
  segments?: Transcription["segments"]
}

// Transcription CRUD functions
export const createTranscription = async (
  projectId: string,
  data: TranscriptionData
): Promise<Transcription> => {
  const newData = {
    ...data,
    words: data.words || [],
    segments: data.segments || [],
  }

  return db.transaction('rw', db.projects, db.transcriptions, async () => {
    const id = crypto.randomUUID()
    const transcription: Transcription = {
      id,
      projectId,
      ...DEFAULT_TRANSCTIPTION_SETTINGS,
      ...newData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.transcriptions.add(transcription)

    await db.projects.update(projectId, project => {
      if (!project) return
      project.transcriptions.push(id)
      project.updatedAt = new Date()
    })

    return transcription
  })
}

export const getTranscription = async (transcriptionId: string): Promise<Transcription | undefined> => {
  return db.transcriptions.get(transcriptionId)
}

export const updateTranscription = async (
  transcriptionId: string,
  changes: Partial<Pick<Transcription, "title" | "transcriptionText" | "transcriptSubtitles" | "selectedMode" | "customInstructions" | "models" | "language" | "words" | "segments" | "selectedUploadId">>
): Promise<Transcription> => {
  await db.transcriptions.update(transcriptionId, {
    ...changes,
    updatedAt: new Date()
  })

  const updated = await db.transcriptions.get(transcriptionId)
  if (!updated) throw new Error('Transcription not found')
  return updated
}

export const deleteTranscription = async (projectId: string, transcriptionId: string): Promise<void> => {
  return db.transaction('rw', db.projects, db.transcriptions, async () => {
    await db.transcriptions.delete(transcriptionId)

    await db.projects.update(projectId, project => {
      if (!project) return
      project.transcriptions = project.transcriptions.filter(id => id !== transcriptionId)
      project.updatedAt = new Date()
    })
  })
}
