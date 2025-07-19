"use client"

import { useEffect } from "react"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { TranscriptionMain } from "./transcription-main"
import { Transcription as TranscriptionType } from "@/types/project"

export default function Transcription() {
  const currentId = useTranscriptionDataStore(state => state.currentId)
  const transcriptionData = useTranscriptionDataStore(state => state.data)
  const transcription = (transcriptionData[currentId ?? ""] || null) as TranscriptionType | null

  useEffect(() => {
    if (!currentId) return
    if (!transcription) return
    if (transcription.projectId !== useProjectStore.getState().currentProject?.id) {
      useProjectStore.getState().setCurrentProject(transcription.projectId)
    }
  }, [currentId, transcription])

  if (!currentId || !transcription) {
    return <div className="p-4">No transcription project selected</div>
  }

  return (
    <TranscriptionMain currentId={currentId} />
  )
}
