import { getContent } from "@/lib/parser/parser"
import { removeDoneTag } from "@/lib/utils"
import { Extraction, Translation } from "@/types/project"
import { Subtitle } from "@/types/subtitles"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"

export function cleanExtractionResult(contextResult: string): string {
  return removeDoneTag(getContent(contextResult)).trim()
}

export function getExtractionProblem(extraction: Extraction | undefined, projectId: string, runningIds: Set<string>): string | null {
  if (!extraction) return "Selected context extraction was not found."
  if (extraction.projectId !== projectId) return "Selected context extraction is not in this project."
  if (runningIds.has(extraction.id)) return "Selected context extraction is still running."
  if (extraction.contextResult.includes("<error>")) return "Selected context extraction contains an error."
  if (!cleanExtractionResult(extraction.contextResult)) return "Selected context extraction is empty."
  return null
}

export function findLatestUsableExtraction(extractions: Extraction[], projectId: string, runningIds: Set<string>): Extraction | null {
  return extractions.find(extraction => getExtractionProblem(extraction, projectId, runningIds) === null) ?? null
}

export function combineAutoContext(cleanedExtractionResult: string, contextDocument: string): string {
  return [cleanedExtractionResult.trim(), contextDocument.trim()]
    .filter(Boolean)
    .join("\n\n")
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

export function getEpisodeNumberFromTranslationTitle(title: string): string {
  return title.replace(/\.[^/.]+$/, "")
}
