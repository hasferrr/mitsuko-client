import { getContent } from "@/lib/parser/parser"
import { hasDoneTag, removeDoneTag } from "@/lib/utils/done-tag"
import { Extraction, ExtractionStatus } from "@/types/project"

const EXTRACTION_STATUSES: ExtractionStatus[] = ["idle", "running", "completed", "failed", "stopped"]
export const AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX = "[Auto Context]"

export function isExtractionStatus(value: unknown): value is ExtractionStatus {
  return typeof value === "string" && EXTRACTION_STATUSES.includes(value as ExtractionStatus)
}

export function stripExtractionDoneTag(contextResult: string): string {
  return removeDoneTag(contextResult)
}

export function cleanExtractionContent(contextResult: string): string {
  return removeDoneTag(getContent(contextResult)).trim()
}

export function hasExtractionError(contextResult: string): boolean {
  return contextResult.includes("<error>")
}

export function inferLegacyExtractionStatus(contextResult: string, isBatch = false): ExtractionStatus {
  const cleanContent = cleanExtractionContent(contextResult)

  if (hasExtractionError(contextResult)) return "failed"
  if (!cleanContent) return "idle"
  if (hasDoneTag(contextResult)) return "completed"
  return isBatch ? "stopped" : "completed"
}

export function inferEditedExtractionStatus(contextResult: string): ExtractionStatus {
  if (hasExtractionError(contextResult)) return "failed"
  if (!cleanExtractionContent(contextResult)) return "idle"
  return "completed"
}

export function normalizeExtractionStatus(
  status: unknown,
  contextResult: string,
  isBatch = false,
): ExtractionStatus {
  if (isExtractionStatus(status)) return status
  return inferLegacyExtractionStatus(contextResult, isBatch)
}

export function getEffectiveExtractionStatus(
  extraction: Extraction,
  runningIds: Set<string>,
): ExtractionStatus {
  if (runningIds.has(extraction.id)) return "running"
  const status = normalizeExtractionStatus(extraction.status, extraction.contextResult)
  return status === "running" ? "stopped" : status
}

export function getExtractionValidationProblem(
  extraction: Extraction | undefined,
  projectId: string,
  runningIds: Set<string>,
  subject = "Selected context extraction",
): string | null {
  if (!extraction) return `${subject} was not found.`
  if (extraction.projectId !== projectId) return `${subject} is not in this project.`

  const status = getEffectiveExtractionStatus(extraction, runningIds)
  if (status === "running") return `${subject} is still running.`
  if (status === "failed") return `${subject} failed.`
  if (status === "stopped") return `${subject} was stopped.`
  if (hasExtractionError(extraction.contextResult)) return `${subject} contains an error.`
  if (!cleanExtractionContent(extraction.contextResult)) return `${subject} is empty.`
  if (status !== "completed") return `${subject} is not completed.`

  return null
}

export function isExtractionUsable(
  extraction: Extraction | undefined,
  projectId: string,
  runningIds: Set<string>,
): extraction is Extraction {
  return getExtractionValidationProblem(extraction, projectId, runningIds) === null
}

export function isAutoContextOwnedBy(extraction: Extraction, translationId: string): boolean {
  return extraction.ownerTranslationId === translationId
}
