import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"

interface ProjectLike {
  translations: string[]
  transcriptions: string[]
  extractions: string[]
}

export function hasActiveOperations(project: ProjectLike): boolean {
  const { isTranslatingSet } = useTranslationStore.getState()
  const { isTranscribingSet } = useTranscriptionStore.getState()
  const { isExtractingSet } = useExtractionStore.getState()
  return (
    project.translations.some(id => isTranslatingSet.has(id)) ||
    project.transcriptions.some(id => isTranscribingSet.has(id)) ||
    project.extractions.some(id => isExtractingSet.has(id))
  )
}
