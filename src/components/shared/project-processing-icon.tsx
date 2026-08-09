"use client"

import { Loader2 } from "lucide-react"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import type { Project } from "@/types/project"

interface ProjectProcessingIconProps {
  project: Project
  className?: string
}

export function ProjectProcessingIcon({ project, className }: ProjectProcessingIconProps) {
  const isTranslating = useTranslationStore(state =>
    project.translations.some(id => state.isTranslatingSet.has(id))
  )
  const isTranscribing = useTranscriptionStore(state =>
    project.transcriptions.some(id => state.isTranscribingSet.has(id))
  )
  const isExtracting = useExtractionStore(state =>
    project.extractions.some(id => state.isExtractingSet.has(id))
  )

  if (!isTranslating && !isTranscribing && !isExtracting) return null

  return (
    <span
      role="status"
      aria-label="Project is processing"
      title="Project is processing"
      className={className}
    >
      <Loader2 className="size-4 animate-spin" />
    </span>
  )
}
