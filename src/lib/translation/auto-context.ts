import { Extraction, Translation } from "@/types/project"
import { Subtitle } from "@/types/subtitles"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { cleanExtractionContent, getExtractionValidationProblem } from "@/lib/extraction/status"

export function cleanExtractionResult(contextResult: string): string {
  return cleanExtractionContent(contextResult)
}

export function getExtractionProblem(
  extraction: Extraction | undefined,
  projectId: string,
  runningIds: Set<string>,
  subject = "Selected context extraction",
): string | null {
  return getExtractionValidationProblem(extraction, projectId, runningIds, subject)
}

export function findLatestExtraction(
  extractions: Extraction[],
  projectId?: string,
  runningIds: Set<string> = new Set(),
  excludedIds: Set<string> = new Set(),
): Extraction | null {
  if (!projectId) return extractions[0] ?? null
  return extractions.find(extraction => {
    if (excludedIds.has(extraction.id)) return false
    return getExtractionProblem(extraction, projectId, runningIds, "Latest previous context") === null
  }) ?? null
}

export function combineAutoContext(cleanedExtractionResult: string, contextDocument: string): string {
  return [cleanedExtractionResult.trim(), contextDocument.trim()]
    .filter(Boolean)
    .join("\n\n")
}

export function getAutoContextCreatedTranslationPatch(
  extractionId: string,
  previousExtractionId: string | null | undefined,
): Pick<Translation, "autoContextMode" | "autoContextExtractionId" | "autoContextPreviousExtractionId"> {
  return {
    autoContextMode: "use-existing",
    autoContextExtractionId: extractionId,
    autoContextPreviousExtractionId: previousExtractionId ?? null,
  }
}

export function getStoppedAutoContextExtractionPatch(): Pick<Extraction, "status" | "completedAt"> {
  return {
    status: "stopped",
    completedAt: null,
  }
}

export function getTranslationSubtitleContent(translation: Translation): string {
  const subtitles: Subtitle[] = translation.subtitles.map(subtitle => ({
    index: subtitle.index,
    timestamp: subtitle.timestamp,
    actor: subtitle.actor,
    content: subtitle.content,
  }))

  return mergeSubtitle({
    subtitles,
    parsed: translation.parsed,
  })
}
